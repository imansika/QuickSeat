import axios from 'axios';
import { authService } from './auth.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from Firebase
const getAuthToken = async () => {
  return await authService.getIdToken();
};

export interface SegmentFare {
  from: string;
  to: string;
  fare: number;
}

export interface RouteData {
  routeNumber: string;
  stops: string[];
  segmentFares: SegmentFare[];
}

// Get a single route by its route number (public - no auth required,
// since passengers need this to compute fares when searching/browsing buses)
export const getRouteByNumber = async (routeNumber: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/routes/${encodeURIComponent(routeNumber)}`
    );
    return response.data;
  } catch (error: unknown) {
    const resp = (error as { response?: { data?: unknown } })?.response?.data;
    if (resp) throw resp;
    const message = error instanceof Error ? error.message : String(error);
    throw { message: message || 'Failed to fetch route' };
  }
};

// Get all routes (operator/admin use - requires auth)
export const getAllRoutes = async () => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`${API_URL}/routes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: unknown) {
    const resp = (error as { response?: { data?: unknown } })?.response?.data;
    if (resp) throw resp;
    const message = error instanceof Error ? error.message : String(error);
    throw { message: message || 'Failed to fetch routes' };
  }
};

// Register a new route
export const registerRoute = async (routeData: {
  routeNumber: string;
  stops: string[];
  segmentFares: SegmentFare[];
}) => {
  try {
    const token = await getAuthToken();
    const response = await axios.post(`${API_URL}/routes`, routeData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: unknown) {
    const resp = (error as { response?: { data?: unknown } })?.response?.data;
    if (resp) throw resp;
    const message = error instanceof Error ? error.message : String(error);
    throw { message: message || 'Failed to register route' };
  }
};

// Update route details (e.g. stops or segment fares)
export const updateRoute = async (
  routeNumber: string,
  routeData: Partial<{ stops: string[]; segmentFares: SegmentFare[] }>
) => {
  try {
    const token = await getAuthToken();
    const response = await axios.patch(
      `${API_URL}/routes/${encodeURIComponent(routeNumber)}`,
      routeData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    const resp = (error as { response?: { data?: unknown } })?.response?.data;
    if (resp) throw resp;
    const message = error instanceof Error ? error.message : String(error);
    throw { message: message || 'Failed to update route' };
  }
};

// Delete a route
export const deleteRoute = async (routeNumber: string) => {
  try {
    const token = await getAuthToken();
    const response = await axios.delete(
      `${API_URL}/routes/${encodeURIComponent(routeNumber)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    const resp = (error as { response?: { data?: unknown } })?.response?.data;
    if (resp) throw resp;
    const message = error instanceof Error ? error.message : String(error);
    throw { message: message || 'Failed to delete route' };
  }
};