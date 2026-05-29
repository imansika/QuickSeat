import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Booking from '../models/Booking.model';

const getUtcStartOfToday = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

const getConfirmedBookingsForUser = async (userId: string, journeyDateFilter: Record<string, Date>) => {
  return Booking.find({
    userId,
    status: 'confirmed',
    journeyDate: journeyDateFilter,
  }).sort({ journeyDate: 1, createdAt: -1 });
};

const generateBookingId = () => {
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `BK${Date.now()}${randomPart}`;
};

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { busNumber, seats, journeyDate, totalAmount } = req.body;

    if (!req.user?.uid) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!busNumber || !Array.isArray(seats) || seats.length === 0 || !journeyDate || totalAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Bus number, seats, journey date, and total amount are required',
      });
    }

    const parsedDate = new Date(journeyDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid journey date format',
      });
    }

    const booking = await Booking.create({
      bookingId: generateBookingId(),
      userId: req.user.uid,
      busNumber: String(busNumber).toUpperCase(),
      seats,
      journeyDate: parsedDate,
      totalAmount: Number(totalAmount),
      status: 'pending',
    });

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking,
    });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message,
    });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const bookings = await Booking.find({ userId: req.user.uid })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message,
    });
  }
};

export const getMyUpcomingBookings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const todayStart = getUtcStartOfToday();
    const bookings = await getConfirmedBookingsForUser(req.user.uid, {
      $gte: todayStart,
    });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error: any) {
    console.error('Error fetching upcoming bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming bookings',
      error: error.message,
    });
  }
};

export const getMyPastBookings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const todayStart = getUtcStartOfToday();
    const bookings = await getConfirmedBookingsForUser(req.user.uid, {
      $lt: todayStart,
    });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error: any) {
    console.error('Error fetching past bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch past bookings',
      error: error.message,
    });
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const booking = await Booking.findOneAndUpdate(
      { _id: id },
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Booking status updated',
      data: booking,
    });
  } catch (error: any) {
    console.error('Error updating booking status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: error.message,
    });
  }
};

export const getBookedSeatsByBusAndDate = async (req: AuthRequest, res: Response) => {
  try {
    const { busNumber, date } = req.query;

    if (!busNumber || !date) {
      return res.status(400).json({
        success: false,
        message: 'Bus number and date are required',
      });
    }

    const journeyDate = new Date(date as string);
    if (isNaN(journeyDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format',
      });
    }

    journeyDate.setUTCHours(0, 0, 0, 0);
    const nextDay = new Date(journeyDate);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    const bookings = await Booking.find({
      busNumber: String(busNumber).toUpperCase(),
      journeyDate: { $gte: journeyDate, $lt: nextDay },
      status: 'confirmed',
    }).select('seats');

    const bookedSeats = bookings.flatMap((booking) => booking.seats);

    return res.status(200).json({
      success: true,
      data: bookedSeats,
    });
  } catch (error: any) {
    console.error('Error fetching booked seats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch booked seats',
      error: error.message,
    });
  }
};
