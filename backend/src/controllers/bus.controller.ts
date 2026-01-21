import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Bus from '../models/Bus.model';
import mongoose from 'mongoose';

// Register a new bus
export const registerBus = async (req: AuthRequest, res: Response) => {
  try {
    const { busNumber, routeNumber, origin, destination, seatCapacity, departureTime, arrivalTime, operatingDays, ratePerKm } = req.body;
    const operatorId = req.user?.uid; // From auth middleware

    // Validation
    if (!busNumber || !routeNumber || !origin || !destination || !seatCapacity || !departureTime || !arrivalTime || !ratePerKm) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Check if bus number already exists
    const existingBus = await Bus.findOne({ busNumber: busNumber.toUpperCase() });
    if (existingBus) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bus number already exists' 
      });
    }

    // Create new bus
    const bus = new Bus({
      busNumber: busNumber.toUpperCase(),
      routeNumber,
      operatorId,
      origin,
      destination,
      seatCapacity: parseInt(seatCapacity),
      departureTime,
      arrivalTime,
      operatingDays: operatingDays || 'daily',
      ratePerKm: parseFloat(ratePerKm),
    });

    await bus.save();

    res.status(201).json({
      success: true,
      message: 'Bus registered successfully',
      data: bus,
    });
  } catch (error: any) {
    console.error('Error registering bus:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register bus',
      error: error.message,
    });
  }
};

// Get all buses for an operator
export const getOperatorBuses = async (req: AuthRequest, res: Response) => {
  try {
    const operatorId = req.user?.uid;

    const buses = await Bus.find({ operatorId, isActive: true })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: buses.length,
      data: buses,
    });
  } catch (error: any) {
    console.error('Error fetching buses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch buses',
      error: error.message,
    });
  }
};

// Get a single bus by ID
export const getBusById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const operatorId = req.user?.uid;

    const bus = await Bus.findOne({ _id: id, operatorId });

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found',
      });
    }

    res.status(200).json({
      success: true,
      data: bus,
    });
  } catch (error: any) {
    console.error('Error fetching bus:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bus',
      error: error.message,
    });
  }
};

// Update bus details
export const updateBus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const operatorId = req.user?.uid;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.operatorId;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // If bus number is being updated, check for duplicates
    if (updateData.busNumber) {
      const existingBus = await Bus.findOne({ 
        busNumber: updateData.busNumber.toUpperCase(),
        _id: { $ne: new mongoose.Types.ObjectId(id as string) }
      });
      if (existingBus) {
        return res.status(400).json({
          success: false,
          message: 'Bus number already exists',
        });
      }
      updateData.busNumber = updateData.busNumber.toUpperCase();
    }

    const bus = await Bus.findOneAndUpdate(
      { _id: id, operatorId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bus updated successfully',
      data: bus,
    });
  } catch (error: any) {
    console.error('Error updating bus:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update bus',
      error: error.message,
    });
  }
};

// Delete (deactivate) a bus
export const deleteBus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const operatorId = req.user?.uid;

    const bus = await Bus.findOneAndUpdate(
      { _id: id, operatorId },
      { isActive: false },
      { new: true }
    );

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bus deactivated successfully',
      data: bus,
    });
  } catch (error: any) {
    console.error('Error deleting bus:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete bus',
      error: error.message,
    });
  }
};

// Search buses (for passengers)
export const searchBuses = async (req: AuthRequest, res: Response) => {
  try {
    const { origin, destination, date } = req.query;

    const query: any = { isActive: true };

    if (origin) {
      query.origin = { $regex: new RegExp(origin as string, 'i') };
    }

    if (destination) {
      query.destination = { $regex: new RegExp(destination as string, 'i') };
    }

    const buses = await Bus.find(query).sort({ departureTime: 1 });

    res.status(200).json({
      success: true,
      count: buses.length,
      data: buses,
    });
  } catch (error: any) {
    console.error('Error searching buses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search buses',
      error: error.message,
    });
  }
};
