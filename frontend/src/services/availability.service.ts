import axios from 'axios';
import { authService } from './auth.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from Firebase
const getAuthToken = async () => {
  return await authService.getIdToken();
};

// Set/update bus availability
export const setAvailability = async (availabilityData: {
  busNumber: string;
  date: string;
  availability: boolean;
}) => {
  try {
    const token = await getAuthToken();
    const response = await axios.post(
      `${API_URL}/availability`,
      availabilityData,
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
    throw { message: message || 'Failed to update availability' };
  }
};

// Get availability for a specific date
export const getAvailabilityByDate = async (date: string) => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`${API_URL}/availability`, {
      params: { date },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: unknown) {
    const resp = (error as { response?: { data?: unknown } })?.response?.data;
    if (resp) throw resp;
    const message = error instanceof Error ? error.message : String(error);
    throw { message: message || 'Failed to fetch availability' };
  }
};

// Get all operator's availability records
export const getOperatorAvailability = async () => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`${API_URL}/availability/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: unknown) {
    const resp = (error as { response?: { data?: unknown } })?.response?.data;
    if (resp) throw resp;
    const message = error instanceof Error ? error.message : String(error);
    throw { message: message || 'Failed to fetch availability records' };
  }
};

// Delete an availability record
export const deleteAvailability = async (id: string) => {
  try {
    const token = await getAuthToken();
    const response = await axios.delete(`${API_URL}/availability/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: unknown) {
    const resp = (error as { response?: { data?: unknown } })?.response?.data;
    if (resp) throw resp;
    const message = error instanceof Error ? error.message : String(error);
    throw { message: message || 'Failed to delete availability' };
  }
};
