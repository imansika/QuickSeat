import axios from 'axios';
import { authService } from './auth.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthToken = async () => {
  return await authService.getIdToken();
};

export const createBooking = async (bookingData: {
  busNumber: string;
  origin: string;
  destination: string;
  time: string;
  seats: string[];
  journeyDate: string;
  totalAmount: number;
}) => {
  try {
    const token = await getAuthToken();
    const response = await axios.post(`${API_URL}/bookings`, bookingData, {
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
    throw { message: message || 'Failed to create booking' };
  }
};

export const getMyBookings = async () => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`${API_URL}/bookings/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: unknown) {
    const resp = (error as { response?: { data?: unknown } })?.response?.data;
    if (resp) throw resp;
    const message = error instanceof Error ? error.message : String(error);
    throw { message: message || 'Failed to fetch bookings' };
  }
};

export const getMyUpcomingBookings = async () => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`${API_URL}/bookings/me/upcoming`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: unknown) {
    const resp = (error as { response?: { data?: unknown } })?.response?.data;
    if (resp) throw resp;
    const message = error instanceof Error ? error.message : String(error);
    throw { message: message || 'Failed to fetch upcoming bookings' };
  }
};

export const getMyPastBookings = async () => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`${API_URL}/bookings/me/past`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: unknown) {
    const resp = (error as { response?: { data?: unknown } })?.response?.data;
    if (resp) throw resp;
    const message = error instanceof Error ? error.message : String(error);
    throw { message: message || 'Failed to fetch past bookings' };
  }
};

export const updateBookingStatus = async (id: string, status: 'pending' | 'confirmed' | 'cancelled') => {
  try {
    const token = await getAuthToken();
    const response = await axios.patch(
      `${API_URL}/bookings/${id}/status`,
      { status },
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
    throw { message: message || 'Failed to update booking status' };
  }
};

export const getBookedSeats = async (busNumber: string, date: string) => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`${API_URL}/bookings/seats`, {
      params: { busNumber, date },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: unknown) {
    const resp = (error as { response?: { data?: unknown } })?.response?.data;
    if (resp) throw resp;
    const message = error instanceof Error ? error.message : String(error);
    throw { message: message || 'Failed to fetch booked seats' };
  }
};
