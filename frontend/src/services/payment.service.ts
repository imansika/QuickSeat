import axios from 'axios';
import { authService } from './auth.service';

const API_URL = import.meta.env.VITE_API_URL ;

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
  } catch (error: unknown) {
    const resp = (error as { response?: { data?: unknown } })?.response?.data;
    if (resp) throw resp;
    const message = error instanceof Error ? error.message : String(error);
    throw { message: message || 'Failed to prepare PayHere payment' };
  }
};
