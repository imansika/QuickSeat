import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Payment from '../models/Payment.model';

export const createPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId, amount, paymentStatus, transactionId } = req.body;

    if (!req.user?.uid) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!bookingId || amount === undefined || !transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID, amount, and transaction ID are required',
      });
    }

    const status = paymentStatus || 'pending';
    if (!['pending', 'paid', 'failed', 'refunded'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status',
      });
    }

    const payment = await Payment.create({
      bookingId,
      userId: req.user.uid,
      amount: Number(amount),
      paymentStatus: status,
      transactionId,
    });

    return res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: payment,
    });
  } catch (error: any) {
    console.error('Error creating payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment',
      error: error.message,
    });
  }
};

export const getMyPayments = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const payments = await Payment.find({ userId: req.user.uid })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message,
    });
  }
};

export const updatePaymentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!paymentStatus || !['pending', 'paid', 'failed', 'refunded'].includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status',
      });
    }

    const payment = await Payment.findOneAndUpdate(
      { _id: id },
      { paymentStatus },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment status updated',
      data: payment,
    });
  } catch (error: any) {
    console.error('Error updating payment status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message,
    });
  }
};
