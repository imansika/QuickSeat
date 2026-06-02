import axios from 'axios';
import { authService } from './auth.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthToken = async () => {
  return await authService.getIdToken();
};

export const getDailyReport = async (date: string, busNumber?: string) => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`${API_URL}/reports/daily`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        date,
        ...(busNumber ? { busNumber } : {}),
      },
    });

    return response.data;
  } catch (error: unknown) {
    const resp = (error as { response?: { data?: unknown } })?.response?.data;
    if (resp) throw resp;
    const message = error instanceof Error ? error.message : String(error);
    throw { message: message || 'Failed to fetch daily report' };
  }
};

export const getMonthlyReport = async (month: string) => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`${API_URL}/reports/monthly`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        month,
      },
    });

    return response.data;
  } catch (error: unknown) {
    const resp = (error as { response?: { data?: unknown } })?.response?.data;
    if (resp) throw resp;
    const message = error instanceof Error ? error.message : String(error);
    throw { message: message || 'Failed to fetch monthly report' };
  }
};
