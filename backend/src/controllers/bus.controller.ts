import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Bus from '../models/Bus.model';
import mongoose from 'mongoose';
import { BusAvailability } from '../models/BusAvailability.model';
import Route from '../models/Route.model';

const GOOGLE_MAPS_API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY || '';

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

    // ─── Helpers ────────────────────────────────────────────────────────────────

    const normalizeText = (value: string) => String(value || '').trim().toLowerCase();

    const matchesPlace = (value: string, query: string) => {
      const normalizedValue = normalizeText(value);
      const normalizedQuery = normalizeText(query);
      if (!normalizedValue || !normalizedQuery) return false;
      return (
        normalizedValue === normalizedQuery ||
        normalizedValue.includes(normalizedQuery) ||
        normalizedQuery.includes(normalizedValue)
      );
    };

    const parseTimeToMinutes = (value: string): number | null => {
      const [hours, minutes] = String(value || '').split(':').map(Number);
      if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
      return hours * 60 + minutes;
    };

    const formatMinutesToTime = (minutes: number): string => {
      const normalizedMinutes = ((minutes % 1440) + 1440) % 1440;
      const hours = Math.floor(normalizedMinutes / 60);
      const mins = normalizedMinutes % 60;
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    };

    const isWithinTimeWindow = (candidateTime: string, searchTime: string): boolean => {
      const candidateMinutes = parseTimeToMinutes(candidateTime);
      const searchMinutes = parseTimeToMinutes(searchTime);
      if (candidateMinutes === null || searchMinutes === null) return false;

      const minMinutes = (searchMinutes - 30 + 1440) % 1440;
      const maxMinutes = (searchMinutes + 30) % 1440;

      if (minMinutes <= maxMinutes) {
        return candidateMinutes >= minMinutes && candidateMinutes <= maxMinutes;
      }
      // Wraps midnight
      return candidateMinutes >= minMinutes || candidateMinutes <= maxMinutes;
    };

    // ─── Google Maps helpers ─────────────────────────────────────────────────────

    const buildDirectionsUrl = (
      originPlace: string,
      destinationPlace: string,
      waypoints: string[],
    ): string | null => {
      if (!GOOGLE_MAPS_API_KEY) return null;

      const params = new URLSearchParams();
      params.set('origin', originPlace);
      params.set('destination', destinationPlace);
      params.set('mode', 'driving');
      params.set('key', GOOGLE_MAPS_API_KEY);
      if (waypoints.length > 0) {
        params.set('waypoints', waypoints.join('|'));
      }

      return `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`;
    };

    const fetchRouteDurationMinutes = async (
  originPlace: string,
  destinationPlace: string,
  waypoints: string[] = [],
): Promise<number | null> => {
      const directionsUrl = buildDirectionsUrl(originPlace, destinationPlace, waypoints);

      if (!directionsUrl) return null;

      try {
        const response = await fetch(directionsUrl);

        if (!response.ok) return null;

        const data = await response.json();

        const legs = data?.routes?.[0]?.legs;
        if (!Array.isArray(legs) || legs.length === 0) return null;

        const totalSeconds = legs.reduce((sum: number, leg: any) => {
          return sum + (leg?.duration?.value || 0);
        }, 0);

        return totalSeconds ? Math.round(totalSeconds / 60) : null;
      } catch (err) {
        return null;
      }
};

    /**
     * Estimates the time a bus reaches the boarding stop (origin search param).
     * Returns null if the calculation cannot be completed — callers should
     * fall back to the bus's raw departureTime in that case.
     */
    const estimateRouteBoardingTime = async (
      bus: any,
      routeStops: string[],
    ): Promise<string | null> => {
      const departureMinutes = parseTimeToMinutes(bus.departureTime);
      if (departureMinutes === null) return null;

      const boardingIndex = routeStops.findIndex((stop) =>
        matchesPlace(stop, normalizedOrigin),
      );
      if (boardingIndex <= 0) {
        // boardingIndex === 0 means the origin IS the first stop — no travel time needed,
        // just use departureTime directly (return null so caller uses departureTime fallback).
        return boardingIndex === 0 ? null : null;
      }

      const firstStop = routeStops[0];
      const boardingStop = routeStops[boardingIndex];
      if (!firstStop || !boardingStop) return null;

      const waypoints = routeStops.slice(1, boardingIndex);
      const travelMinutes = await fetchRouteDurationMinutes(firstStop, boardingStop, waypoints);
      if (travelMinutes === null) return null;

      return formatMinutesToTime(departureMinutes + travelMinutes);
    };

    // ─── Date + availability filter ──────────────────────────────────────────────

    const applyDateAndAvailabilityFilter = async (busList: any[]): Promise<any[]> => {
      let filteredBuses = busList;

      if (date && typeof date === 'string') {
        const travelDate = new Date(date);
        if (!isNaN(travelDate.getTime())) {
          const day = travelDate.getDay();
          const isWeekend = day === 0 || day === 6;
          const targetDay = isWeekend ? 'weekends' : 'weekdays';

          filteredBuses = filteredBuses.filter(
            (bus) => bus.operatingDays === 'daily' || bus.operatingDays === targetDay,
          );

          travelDate.setUTCHours(0, 0, 0, 0);
          const nextDay = new Date(travelDate);
          nextDay.setUTCDate(nextDay.getUTCDate() + 1);

          const busNumbers = filteredBuses
            .map((bus) => (bus.busNumber || '').toUpperCase())
            .filter(Boolean);

          if (busNumbers.length > 0) {
            const unavailableRecords = await BusAvailability.find({
              availability: false,
              busNumber: { $in: busNumbers },
              date: { $gte: travelDate, $lt: nextDay },
            });

            const unavailableSet = new Set(
              unavailableRecords.map((record) => record.busNumber),
            );

            filteredBuses = filteredBuses.filter(
              (bus) => !unavailableSet.has((bus.busNumber || '').toUpperCase()),
            );
          }
        }
      }

      return filteredBuses;
    };

    // ─── Resolve stops from route definitions ────────────────────────────────────

    const resolveStopsForBuses = async (busList: any[]): Promise<any[]> => {
      const routeNumbers = Array.from(
        new Set(
          busList
            .map((bus) => (bus.routeNumber || '').trim())
            .filter(Boolean),
        ),
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
        // Guard: bus may already be a plain object at this point
        const busObject = typeof bus.toObject === 'function' ? bus.toObject() : { ...bus };
        const routeStops = routeStopMap.get((busObject.routeNumber || '').trim());

        if (!routeStops || routeStops.length === 0) return busObject;

        const originalStops = Array.isArray(busObject.stops) ? busObject.stops : [];
        const originalStopMap = new Map<string, string>();
        originalStops.forEach((stop: any) => {
          const stopName = normalizeText(stop?.location || stop?.name || '');
          const stopArrivalTime = String(stop?.arrivalTime || '').trim();
          if (stopName && stopArrivalTime) {
            originalStopMap.set(stopName, stopArrivalTime);
          }
        });

        return {
          ...busObject,
          stops: routeStops.map((city) => ({
            name: city,
            location: city,
            arrivalTime: originalStopMap.get(normalizeText(city)) || undefined,
          })),
        };
      });
    };

    // ─── 1. Direct buses (origin → destination on bus record itself) ─────────────

    const originDestinationQuery: any = {};
    if (originRegex) originDestinationQuery.origin = { $regex: originRegex };
    if (destinationRegex) originDestinationQuery.destination = { $regex: destinationRegex };

    const directCandidateBuses = await Bus.find(originDestinationQuery).sort({ departureTime: 1 });

    // ─── 2. Route-based buses (origin + destination appear in route stops) ───────

    const routeCandidateBuses: Array<{ bus: any; routeStops: string[] }> = [];

    if (originRegex && destinationRegex) {
      const allRoutes = await Route.find({}).lean();

      const matchingRouteNumbers = allRoutes
        .filter((route) => {
          const stops = (route.stops || [])
            .map((stop) => String(stop || '').trim())
            .filter(Boolean);
          const originIndex = stops.findIndex((stop) => originRegex.test(stop));
          const destinationIndex = stops.findIndex((stop) => destinationRegex.test(stop));
          // Both stops must exist and origin must come before destination
          return originIndex >= 0 && destinationIndex >= 0 && originIndex < destinationIndex;
        })
        .map((route) => String(route.routeNumber || '').trim())
        .filter(Boolean);

      if (matchingRouteNumbers.length > 0) {
        const routeStopMap = new Map<string, string[]>();
        allRoutes.forEach((route) => {
          const routeNumber = String(route.routeNumber || '').trim();
          const stops = (route.stops || [])
            .map((stop) => String(stop || '').trim())
            .filter(Boolean);
          if (routeNumber) routeStopMap.set(routeNumber, stops);
        });

        const routeBuses = await Bus.find({
          routeNumber: { $in: matchingRouteNumbers },
        }).sort({ departureTime: 1 });

        routeBuses.forEach((bus) => {
          const routeStops = routeStopMap.get(String(bus.routeNumber || '').trim()) || [];
          routeCandidateBuses.push({ bus, routeStops });
        });
      }
    }

    // ─── 3. Build candidate entries with searchTime ───────────────────────────────

    const candidateEntries: Array<{ bus: any; searchTime: string }> = [];

    // Direct buses use their departureTime as-is
    directCandidateBuses.forEach((bus) => {
      candidateEntries.push({
        bus,
        searchTime: String(bus.departureTime || ''),
      });
    });


    // Route buses: estimate boarding time in parallel, fall back to departureTime on failure
    await Promise.all(
      routeCandidateBuses.map(async ({ bus, routeStops }) => {
        const boardingTime = await estimateRouteBoardingTime(bus.toObject(), routeStops);
        candidateEntries.push({
          bus,
          // If estimation fails for any reason, fall back to raw departureTime
          // so the bus is never silently dropped from results
          searchTime: boardingTime ?? String(bus.departureTime || ''),
        });
      }),
    );

    // ─── 4. Deduplicate by bus _id (prefer route entry — more accurate time) ─────

    const candidateBusMap = new Map<string, { bus: any; searchTime: string }>();
    candidateEntries.forEach((entry) => {
      const key = String(entry.bus._id);
      // Always overwrite so the route-based boarding time wins over departureTime
      candidateBusMap.set(key, entry);
    });

    // ─── 5. Sort by searchTime, apply time window filter ─────────────────────────

    const mergedCandidates = Array.from(candidateBusMap.values()).sort((a, b) =>
      String(a.searchTime || '').localeCompare(String(b.searchTime || '')),
    );



    const busesAfterTimeFilter =
      typeof time === 'string' && time
        ? mergedCandidates.filter((entry) => isWithinTimeWindow(entry.searchTime, time))
        : mergedCandidates;

    // Also log which ones were dropped by time filter
    const droppedByTime = mergedCandidates.filter(
      (entry) => !busesAfterTimeFilter.includes(entry),
    );

    // ─── 6. Date + availability filter, then resolve stops ───────────────────────

    const buses = await applyDateAndAvailabilityFilter(
      busesAfterTimeFilter.map((entry) => entry.bus),
    );

    

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