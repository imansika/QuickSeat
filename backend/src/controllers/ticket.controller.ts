import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Bus from '../models/Bus.model';
import Ticket from '../models/Ticket.model';
import { createTicketPdfBuffer } from '../services/ticket-pdf.service';
import { getTicketsForBooking, issueTicketsForBooking } from '../services/ticket.service';

const canAccessBooking = (requestingUserId: string | undefined, bookingUserId: string) => {
  return requestingUserId === bookingUserId;
};

const parseQrPayload = (qrData: unknown) => {
  if (typeof qrData === 'string') {
    try {
      return JSON.parse(qrData) as { ticketId?: string; bookingId?: string; seatNumber?: string };
    } catch {
      return { ticketId: qrData };
    }
  }

  if (qrData && typeof qrData === 'object') {
    return qrData as { ticketId?: string; bookingId?: string; seatNumber?: string };
  }

  return {};
};



export const downloadBookingTickets = async (req: AuthRequest, res: Response) => {
  try {
    const rawBookingId = req.params.bookingId;
    const bookingId = Array.isArray(rawBookingId) ? rawBookingId[0] : rawBookingId;
    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Booking ID is required' });
    }

    if (!req.user?.uid) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { booking, tickets } = await getTicketsForBooking(bookingId);
    const bus = await Bus.findOne({ busNumber: booking.busNumber });

    if (!canAccessBooking(req.user.uid, booking.userId)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const pdfBuffer = await createTicketPdfBuffer({
      booking,
      tickets,
      passengerName: req.user.email || 'Passenger',
      bus,
    });
    const fileName = `quickseat-ticket-${bookingId}.pdf`;

    return res
      .status(200)
      .setHeader('Content-Type', 'application/pdf')
      .setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
      .send(pdfBuffer);
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message || 'Failed to download tickets',
    });
  }
};

export const resendBookingTickets = async (req: AuthRequest, res: Response) => {
  try {
    const rawBookingId = req.params.bookingId;
    const bookingId = Array.isArray(rawBookingId) ? rawBookingId[0] : rawBookingId;
    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Booking ID is required' });
    }

    if (!req.user?.uid) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { booking } = await getTicketsForBooking(bookingId);

    if (!canAccessBooking(req.user.uid, booking.userId)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const result = await issueTicketsForBooking(bookingId);

    return res.status(200).json({
      success: true,
      message: 'Tickets sent successfully',
      data: {
        bookingId,
        tickets: result.tickets,
      },
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to send tickets',
    });
  }
};

export const validateTicketQrCode = async (req: AuthRequest, res: Response) => {
  try {
    const { qrData, ticketId } = req.body;

    if (!req.user?.uid) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const payload = parseQrPayload(qrData);
    const resolvedTicketId = String(payload.ticketId || ticketId || '').trim();

    if (!resolvedTicketId) {
      return res.status(400).json({ success: false, message: 'Ticket ID is required for validation' });
    }

    const ticket = await Ticket.findOne({ ticketId: resolvedTicketId });
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (payload.bookingId && payload.bookingId !== ticket.bookingId) {
      return res.status(400).json({ success: false, message: 'Invalid booking ID in QR payload' });
    }

    if (payload.seatNumber && String(payload.seatNumber).trim().toUpperCase() !== ticket.seatNumber) {
      return res.status(400).json({ success: false, message: 'Invalid seat number in QR payload' });
    }

    if (ticket.status === 'USED') {
      return res.status(200).json({
        success: true,
        message: 'Ticket has already been validated',
        data: {
          ticketId: ticket.ticketId,
          bookingId: ticket.bookingId,
          seatNumber: ticket.seatNumber,
          status: ticket.status,
        },
      });
    }

    if (ticket.status !== 'ACTIVE') {
      return res.status(400).json({ success: false, message: `Ticket cannot be validated in ${ticket.status} status` });
    }

    ticket.status = 'USED';
    await ticket.save();

    return res.status(200).json({
      success: true,
      message: 'Ticket validated successfully',
      data: {
        ticketId: ticket.ticketId,
        bookingId: ticket.bookingId,
        seatNumber: ticket.seatNumber,
        status: ticket.status,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to validate ticket',
    });
  }
};