import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { getDailyReport, getMonthlyReport } from '../services/report.service';

export const getDailyReportController = async (req: AuthRequest, res: Response) => {
  try {
    const { date, busNumber } = req.query;

    if (!date || typeof date !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Date is required in YYYY-MM-DD format',
      });
    }

    const selectedBusNumber = typeof busNumber === 'string' ? busNumber : undefined;
    const report = await getDailyReport(date, selectedBusNumber);

    return res.status(200).json({
      success: true,
      selectedDate: date,
      selectedBusNumber: selectedBusNumber || null,
      count: report.data.length,
      totalRevenue: report.totalRevenue,
      data: report.data,
    });
  } catch (error: any) {
    console.error('Error fetching daily report:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to fetch daily report',
    });
  }
};

export const getMonthlyReportController = async (req: AuthRequest, res: Response) => {
  try {
    const { month } = req.query;

    if (!month || typeof month !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Month is required in YYYY-MM format',
      });
    }

    const report = await getMonthlyReport(month);

    return res.status(200).json({
      success: true,
      selectedMonth: month,
      count: report.data.length,
      totalRevenue: report.totalRevenue,
      data: report.data,
    });
  } catch (error: any) {
    console.error('Error fetching monthly report:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to fetch monthly report',
    });
  }
};