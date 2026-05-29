import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Route from '../models/Route.model';

export const createRoute = async (req: AuthRequest, res: Response) => {
  try {
    const { routeNumber, stops } = req.body;

    if (!routeNumber || !Array.isArray(stops) || stops.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Route number and at least two stops are required',
      });
    }

    const existingRoute = await Route.findOne({ routeNumber: routeNumber.trim() });
    if (existingRoute) {
      return res.status(400).json({
        success: false,
        message: 'Route number already exists',
      });
    }

    const route = await Route.create({
      routeNumber: routeNumber.trim(),
      stops: stops.map((stop: string) => String(stop).trim()).filter(Boolean),
    });

    return res.status(201).json({
      success: true,
      message: 'Route created successfully',
      data: route,
    });
  } catch (error: any) {
    console.error('Error creating route:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create route',
      error: error.message,
    });
  }
};

export const getRoutes = async (req: AuthRequest, res: Response) => {
  try {
    const routes = await Route.find({}).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: routes.length,
      data: routes,
    });
  } catch (error: any) {
    console.error('Error fetching routes:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch routes',
      error: error.message,
    });
  }
};

export const updateRoute = async (req: AuthRequest, res: Response) => {
  try {
    const routeNumberParam = req.params.routeNumber;
    const { stops } = req.body;

    // Normalize routeNumber which may be string or string[] depending on Express parsing
    const routeNumber = Array.isArray(routeNumberParam) ? routeNumberParam[0] : routeNumberParam;

    if (!routeNumber) {
      return res.status(400).json({ success: false, message: 'Route number is required in params' });
    }

    if (!Array.isArray(stops) || stops.length < 2) {
      return res.status(400).json({ success: false, message: 'At least two stops are required' });
    }

    const route = await Route.findOneAndUpdate(
      { routeNumber: String(routeNumber).trim() },
      { stops: stops.map((s: string) => String(s).trim()).filter(Boolean) },
      { new: true, runValidators: true }
    );

    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }

    return res.status(200).json({ success: true, message: 'Route updated', data: route });
  } catch (error: any) {
    console.error('Error updating route:', error);
    return res.status(500).json({ success: false, message: 'Failed to update route', error: error.message });
  }
};
