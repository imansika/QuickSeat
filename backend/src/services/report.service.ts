import Booking from '../models/Booking.model';

export interface DailyReportRow {
  busNumber: string;
  passengerCount: number;
  revenue: number;
}

export interface MonthlyReportRow {
  date: string;
  busNumber: string;
  revenue: number;
}

export interface ReportSummary<T> {
  data: T[];
  totalRevenue: number;
}

const createUtcDateRange = (dateValue: string) => {
  const parsedDate = new Date(`${dateValue}T00:00:00Z`);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error('Invalid date format');
  }

  const start = new Date(parsedDate);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { start, end };
};

const createUtcMonthRange = (monthValue: string) => {
  const match = /^\d{4}-(0[1-9]|1[0-2])$/.exec(monthValue);

  if (!match) {
    throw new Error('Invalid month format');
  }

  const [yearText, monthText] = monthValue.split('-');
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;

  const start = new Date(Date.UTC(year, monthIndex, 1));
  const end = new Date(Date.UTC(year, monthIndex + 1, 1));

  return { start, end };
};

export const getDailyReport = async (
  dateValue: string,
  busNumber?: string
): Promise<ReportSummary<DailyReportRow>> => {
  const { start, end } = createUtcDateRange(dateValue);
  const normalizedBusNumber = busNumber?.trim().toUpperCase();

  const match: Record<string, unknown> = {
    status: 'confirmed',
    journeyDate: {
      $gte: start,
      $lt: end,
    },
  };

  if (normalizedBusNumber) {
    match.busNumber = normalizedBusNumber;
  }

  const data = await Booking.aggregate<DailyReportRow>([
    {
      $match: match,
    },
    {
      $project: {
        busNumber: 1,
        passengerCount: { $size: '$seats' },
        revenue: '$totalAmount',
      },
    },
    {
      $group: {
        _id: '$busNumber',
        busNumber: { $first: '$busNumber' },
        passengerCount: { $sum: '$passengerCount' },
        revenue: { $sum: '$revenue' },
      },
    },
    {
      $project: {
        _id: 0,
        busNumber: 1,
        passengerCount: 1,
        revenue: 1,
      },
    },
    {
      $sort: {
        busNumber: 1,
      },
    },
  ]);

  const totalRevenue = data.reduce((sum, row) => sum + Number(row.revenue || 0), 0);

  return {
    data,
    totalRevenue,
  };
};

export const getMonthlyReport = async (monthValue: string): Promise<ReportSummary<MonthlyReportRow>> => {
  const { start, end } = createUtcMonthRange(monthValue);

  const data = await Booking.aggregate<MonthlyReportRow>([
    {
      $match: {
        status: 'confirmed',
        journeyDate: {
          $gte: start,
          $lt: end,
        },
      },
    },
    {
      $project: {
        date: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$journeyDate',
            timezone: 'UTC',
          },
        },
        busNumber: 1,
        revenue: '$totalAmount',
      },
    },
    {
      $group: {
        _id: {
          date: '$date',
          busNumber: '$busNumber',
        },
        date: { $first: '$date' },
        busNumber: { $first: '$busNumber' },
        revenue: { $sum: '$revenue' },
      },
    },
    {
      $project: {
        _id: 0,
        date: 1,
        busNumber: 1,
        revenue: 1,
      },
    },
    {
      $sort: {
        date: 1,
        busNumber: 1,
      },
    },
  ]);

  const totalRevenue = data.reduce((sum, row) => sum + Number(row.revenue || 0), 0);

  return {
    data,
    totalRevenue,
  };
};