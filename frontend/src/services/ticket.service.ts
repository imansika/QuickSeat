import axios from 'axios';
import { authService } from './auth.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthToken = async () => {
  return await authService.getIdToken();
};

export const downloadBookingTickets = async (bookingId: string) => {
  const token = await getAuthToken();

  const response = await axios.get(`${API_URL}/tickets/${bookingId}/download`, {
    responseType: 'blob',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  const contentDisposition = response.headers['content-disposition'] as string | undefined;
  const fileNameMatch = contentDisposition?.match(/filename="?([^";]+)"?/i);
  const fileName = fileNameMatch?.[1] || `quickseat-ticket-${bookingId}.pdf`;
  const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};
