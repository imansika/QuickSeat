import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Bus from '../models/Bus.model';
import mongoose from 'mongoose';
import { BusAvailability } from '../models/BusAvailability.model';
import Route from '../models/Route.model';

// Register a new bus
export const registerBus = async (req: AuthRequest, res: Response) => {
  try {
    const { busNumber, routeNumber, origin, destination, stops, seatCapacity, layoutType, departureTime, operatingDays, ratePerKm } = req.body;

    // Validation
    if (!busNumber || !routeNumber || !origin || !destination || !seatCapacity || !layoutType || !departureTime || !ratePerKm) {
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
      origin,
      destination,
      stops: stops || [], // Optional stops array
      seatCapacity: parseInt(seatCapacity),
      layoutType,
      departureTime,
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

// Get all buses for shared operator dashboard
export const getOperatorBuses = async (req: AuthRequest, res: Response) => {
  try {
    const buses = await Bus.find({})
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

// Get buses operating on weekdays (daily + weekdays)
export const getWeekdayOperatingBuses = async (req: AuthRequest, res: Response) => {
  try {
    const buses = await Bus.find({
      operatingDays: { $in: ['daily', 'weekdays'] },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: buses.length,
      data: buses,
    });
  } catch (error: any) {
    console.error('Error fetching weekday operating buses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weekday operating buses',
      error: error.message,
    });
  }
};

// Get buses operating on weekends (daily + weekends)
export const getWeekendOperatingBuses = async (req: AuthRequest, res: Response) => {
  try {
    const buses = await Bus.find({
      operatingDays: { $in: ['daily', 'weekends'] },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: buses.length,
      data: buses,
    });
  } catch (error: any) {
    console.error('Error fetching weekend operating buses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weekend operating buses',
      error: error.message,
    });
  }
};

// Get a single bus by ID
export const getBusById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const bus = await Bus.findOne({ _id: id });

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
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
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
      { _id: id },
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

// Delete  a bus
export const deleteBus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const bus = await Bus.findOneAndDelete(
      { _id: id }
    );

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bus deleted successfully',
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
    const { origin, destination, date, time } = req.query;

    const query: any = {};

    if (origin) {
      query.origin = { $regex: new RegExp(origin as string, 'i') };
    }

    if (destination) {
      query.destination = { $regex: new RegExp(destination as string, 'i') };
    }

    if (date) {
      const travelDate = new Date(date as string);
      if (!isNaN(travelDate.getTime())) {
        const day = travelDate.getDay();
        const isWeekend = day === 0 || day === 6;
        query.operatingDays = { $in: ['daily', isWeekend ? 'weekends' : 'weekdays'] };
      }
    }

    let buses = await Bus.find(query).sort({ departureTime: 1 });

    if (time && typeof time === 'string') {
      const [hours, minutes] = time.split(':').map(Number);
      if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
        const selectedMinutes = hours * 60 + minutes;
        const minMinutes = (selectedMinutes - 15 + 1440) % 1440;
        const maxMinutes = (selectedMinutes + 15) % 1440;

        buses = buses.filter((bus) => {
          const [busHours, busMinutes] = (bus.departureTime || '').split(':').map(Number);
          if (Number.isNaN(busHours) || Number.isNaN(busMinutes)) {
            return false;
          }

          const busTotal = busHours * 60 + busMinutes;

          if (minMinutes <= maxMinutes) {
            return busTotal >= minMinutes && busTotal <= maxMinutes;
          }

          return busTotal >= minMinutes || busTotal <= maxMinutes;
        });
      }
    }

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

// Search available buses with time window, operating days, and availability
export const searchAvailableBuses = async (req: AuthRequest, res: Response) => {
  try {
    const { origin, destination, date, time } = req.query;

    const normalizedOrigin = String(origin || '').trim();
    const normalizedDestination = String(destination || '').trim();
    const originRegex = normalizedOrigin ? new RegExp(normalizedOrigin, 'i') : null;
    const destinationRegex = normalizedDestination ? new RegExp(normalizedDestination, 'i') : null;

    const applyTimeFilter = (busList: any[]) => {
      if (!(time && typeof time === 'string')) {
        return busList;
      }

      const [hours, minutes] = time.split(':').map(Number);
      if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        return busList;
      }

      const selectedMinutes = hours * 60 + minutes;
      const minMinutes = (selectedMinutes - 15 + 1440) % 1440;
      const maxMinutes = (selectedMinutes + 15) % 1440;

      return busList.filter((bus) => {
        const [busHours, busMinutes] = (bus.departureTime || '').split(':').map(Number);
        if (Number.isNaN(busHours) || Number.isNaN(busMinutes)) {
          return false;
        }

        const busTotal = busHours * 60 + busMinutes;

        if (minMinutes <= maxMinutes) {
          return busTotal >= minMinutes && busTotal <= maxMinutes;
        }

        return busTotal >= minMinutes || busTotal <= maxMinutes;
      });
    };

    const applyDateAndAvailabilityFilter = async (busList: any[]) => {
      let filteredBuses = busList;

      if (date && typeof date === 'string') {
        const travelDate = new Date(date);
        if (!isNaN(travelDate.getTime())) {
          const day = travelDate.getDay();
          const isWeekend = day === 0 || day === 6;
          const targetDay = isWeekend ? 'weekends' : 'weekdays';
          filteredBuses = filteredBuses.filter((bus) => bus.operatingDays === 'daily' || bus.operatingDays === targetDay);

          travelDate.setUTCHours(0, 0, 0, 0);
          const nextDay = new Date(travelDate);
          nextDay.setUTCDate(nextDay.getUTCDate() + 1);

          const busNumbers = filteredBuses.map((bus) => (bus.busNumber || '').toUpperCase()).filter(Boolean);
          if (busNumbers.length > 0) {
            const unavailableRecords = await BusAvailability.find({
              availability: false,
              busNumber: { $in: busNumbers },
              date: { $gte: travelDate, $lt: nextDay },
            });

            const unavailableSet = new Set(unavailableRecords.map((record) => record.busNumber));
            filteredBuses = filteredBuses.filter((bus) => !unavailableSet.has((bus.busNumber || '').toUpperCase()));
          }
        }
      }

      return filteredBuses;
    };

    const resolveStopsForBuses = async (busList: any[]) => {
      const routeNumbers = Array.from(
        new Set(
          busList
            .map((bus) => (bus.routeNumber || '').trim())
            .filter(Boolean)
        )
      );

      const routeStopMap = new Map<string, string[]>();
      if (routeNumbers.length > 0) {
        const routes = await Route.find({ routeNumber: { $in: routeNumbers } }).lean();
        routes.forEach((route) => {
          const normalizedStops = (route.stops || [])
            .map((stop) => String(stop || '').trim())
            .filter(Boolean);
          routeStopMap.set((route.routeNumber || '').trim(), normalizedStops);
        });
      }

      return busList.map((bus) => {
        const busObject = bus.toObject();
        const routeStops = routeStopMap.get((bus.routeNumber || '').trim());

        if (!routeStops || routeStops.length === 0) {
          return busObject;
        }

        return {
          ...busObject,
          stops: routeStops.map((city) => ({
            name: city,
            location: city,
          })),
        };
      });
    };

    const originDestinationQuery: any = {};
    if (originRegex) {
      originDestinationQuery.origin = { $regex: originRegex };
    }
    if (destinationRegex) {
      originDestinationQuery.destination = { $regex: destinationRegex };
    }

    const directCandidateBuses = await Bus.find(originDestinationQuery).sort({ departureTime: 1 });

    const routeCandidateBuses: any[] = [];
    if (originRegex && destinationRegex) {
      const matchingRoutes = await Route.find({}).lean();
      const matchingRouteNumbers = matchingRoutes
        .filter((route) => {
          const stops = (route.stops || []).map((stop) => String(stop || '').trim()).filter(Boolean);
          const originIndex = stops.findIndex((stop) => originRegex.test(stop));
          const destinationIndex = stops.findIndex((stop) => destinationRegex.test(stop));

          return originIndex >= 0 && destinationIndex >= 0 && originIndex < destinationIndex;
        })
        .map((route) => String(route.routeNumber || '').trim())
        .filter(Boolean);

      if (matchingRouteNumbers.length > 0) {
        const routeBuses = await Bus.find({ routeNumber: { $in: matchingRouteNumbers } }).sort({ departureTime: 1 });
        routeCandidateBuses.push(...routeBuses);
      }
    }

    const candidateBusMap = new Map<string, (typeof directCandidateBuses)[number]>();
    [...directCandidateBuses, ...routeCandidateBuses].forEach((bus) => {
      const key = String(bus._id);
      if (!candidateBusMap.has(key)) {
        candidateBusMap.set(key, bus);
      }
    });

    const mergedCandidates = Array.from(candidateBusMap.values()).sort((left, right) => {
      return String(left.departureTime || '').localeCompare(String(right.departureTime || ''));
    });

    const buses = await applyDateAndAvailabilityFilter(applyTimeFilter(mergedCandidates));

    const busesWithResolvedStops = await resolveStopsForBuses(buses);

    res.status(200).json({
      success: true,
      count: busesWithResolvedStops.length,
      data: busesWithResolvedStops,
    });
  } catch (error: any) {
    console.error('Error searching available buses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search available buses',
      error: error.message,
    });
  }
};
