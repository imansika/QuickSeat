import axios from 'axios';
import { authService } from './auth.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from Firebase
const getAuthToken = async () => {
  return await authService.getIdToken();
};

// Register a new bus
export const registerBus = async (busData: {
  busNumber: string;
  routeNumber: string;
  origin: string;
  destination: string;
  seatCapacity: string;
  departureTime: string;
  arrivalTime: string;
  operatingDays: string;
  ratePerKm: string;
}) => {
  try {
    const token = await getAuthToken();
    const response = await axios.post(
      `${API_URL}/buses`,
      busData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to register bus' };
  }
};

// Get all buses for the logged-in operator
export const getOperatorBuses = async () => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`${API_URL}/buses`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to fetch buses' };
  }
};

// Get a single bus by ID
export const getBusById = async (id: string) => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`${API_URL}/buses/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to fetch bus' };
  }
};

// Update bus details
export const updateBus = async (id: string, busData: any) => {
  try {
    const token = await getAuthToken();
    const response = await axios.put(
      `${API_URL}/buses/${id}`,
      busData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to update bus' };
  }
};

// Delete (deactivate) a bus
export const deleteBus = async (id: string) => {
  try {
    const token = await getAuthToken();
    const response = await axios.delete(`${API_URL}/buses/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to delete bus' };
  }
};

// Search buses (public - no auth required)
export const searchBuses = async (params: {
  origin?: string;
  destination?: string;
  date?: string;
}) => {
  try {
    const response = await axios.get(`${API_URL}/buses/search`, {
      params,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to search buses' };
  }
};
