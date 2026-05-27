import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { BusAvailability } from '../models/BusAvailability.model';
import Bus from '../models/Bus.model';

// Create or update bus availability
export const setAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const { busNumber, date, availability } = req.body;

    // Validation
    if (!busNumber || !date || availability === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Bus number, date, and availability are required',
      });
    }

    // Verify bus exists
    const bus = await Bus.findOne({ busNumber: busNumber.toUpperCase() });
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found',
      });
    }

    // Parse and validate date
    const availabilityDate = new Date(date);
    if (isNaN(availabilityDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format',
      });
    }

    // Set date to start of day (UTC)
    availabilityDate.setUTCHours(0, 0, 0, 0);

    const isAvailable = availability === true || availability === 'true';

    if (isAvailable) {
      // Only store unavailable records; delete any existing record when available
      await BusAvailability.findOneAndDelete({
        busNumber: busNumber.toUpperCase(),
        date: availabilityDate,
      });

      return res.status(200).json({
        success: true,
        message: 'Availability cleared successfully',
      });
    }

    // Create or update unavailable record
    const busAvailability = await BusAvailability.findOneAndUpdate(
      {
        busNumber: busNumber.toUpperCase(),
        date: availabilityDate,
      },
      {
        busNumber: busNumber.toUpperCase(),
        date: availabilityDate,
        availability: false,
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      data: busAvailability,
    });
  } catch (error: any) {
    console.error('Error updating availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update availability',
      error: error.message,
    });
  }
};

// Get availability for a specific date
export const getAvailabilityByDate = async (req: AuthRequest, res: Response) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required',
      });
    }

    const availabilityDate = new Date(date as string);
    if (isNaN(availabilityDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format',
      });
    }

    // Set date to start of day (UTC)
    availabilityDate.setUTCHours(0, 0, 0, 0);
    const nextDay = new Date(availabilityDate);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    const availabilities = await BusAvailability.find({
      availability: false,
      date: {
        $gte: availabilityDate,
        $lt: nextDay,
      },
    });

    res.status(200).json({
      success: true,
      data: availabilities,
    });
  } catch (error: any) {
    console.error('Error fetching availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch availability',
      error: error.message,
    });
  }
};

// Get all availability records for an operator
export const getOperatorAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const availabilities = await BusAvailability.find({ availability: false });

    res.status(200).json({
      success: true,
      data: availabilities,
    });
  } catch (error: any) {
    console.error('Error fetching operator availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch availability records',
      error: error.message,
    });
  }
};

// Delete availability record
export const deleteAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const availabilityRecord = await BusAvailability.findOneAndDelete({
      _id: id,
    });

    if (!availabilityRecord) {
      return res.status(404).json({
        success: false,
        message: 'Availability record not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Availability record deleted successfully',
      data: availabilityRecord,
    });
  } catch (error: any) {
    console.error('Error deleting availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete availability record',
      error: error.message,
    });
  }
};
