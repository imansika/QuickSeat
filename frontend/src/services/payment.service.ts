import axios from 'axios';
import { authService } from './auth.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthToken = async () => {
  return await authService.getIdToken();
};

export const preparePayherePayment = async (payload: {
  bookingId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}) => {
  try {
    const token = await getAuthToken();
    const response = await axios.post(`${API_URL}/payments/payhere/prepare`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Failed to prepare PayHere payment' };
  }
};
