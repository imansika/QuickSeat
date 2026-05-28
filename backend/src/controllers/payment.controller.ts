import { Response } from 'express';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth.middleware';
import Payment from '../models/Payment.model';
import Booking from '../models/Booking.model';

const md5 = (value: string) => {
  return crypto.createHash('md5').update(value).digest('hex').toUpperCase();
};

const formatAmount = (amount: number | string) => {
  const numeric = typeof amount === 'string' ? Number(amount) : amount;
  return numeric.toFixed(2);
};

const processPayhereStatus = async (payload: {
  merchant_id?: string;
  order_id?: string;
  payhere_amount?: string;
  payhere_currency?: string;
  status_code?: string;
  md5sig?: string;
  payment_id?: string;
}) => {
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
  if (!merchantSecret) {
    throw new Error('PayHere merchant secret is not configured');
  }

  const {
    merchant_id,
    order_id,
    payhere_amount,
    payhere_currency,
    status_code,
    md5sig,
    payment_id,
  } = payload;

  if (!merchant_id || !order_id || !payhere_amount || !payhere_currency || !status_code || !md5sig) {
    throw new Error('Invalid PayHere payload');
  }

  const localSignature = md5(
    merchant_id + order_id + payhere_amount + payhere_currency + status_code + md5(merchantSecret)
  );

  const skipSignature = process.env.PAYHERE_SKIP_SIG_VERIFY === 'true';
  const isValidSignature = localSignature === String(md5sig).toUpperCase();

  if (!isValidSignature && !skipSignature) {
    throw new Error('Invalid PayHere signature');
  }

  let paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' = 'pending';
  let bookingStatus: 'pending' | 'confirmed' | 'cancelled' | null = null;

  if (String(status_code) === '2') {
    paymentStatus = 'paid';
    bookingStatus = 'confirmed';
  } else if (String(status_code) === '-1' || String(status_code) === '-2' || String(status_code) === '-3') {
    paymentStatus = 'failed';
    bookingStatus = 'cancelled';
  }

  await Payment.findOneAndUpdate(
    { bookingId: order_id },
    {
      bookingId: order_id,
      amount: Number(payhere_amount),
      paymentStatus,
      transactionId: payment_id || order_id,
    },
    { upsert: true, new: true }
  );

  if (bookingStatus) {
    await Booking.findOneAndUpdate(
      { bookingId: order_id },
      { status: bookingStatus },
      { new: true }
    );
  }

  return { paymentStatus, bookingStatus };
};

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

export const preparePayherePayment = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId, firstName, lastName, email, phone, address, city, country } = req.body;

    if (!req.user?.uid) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required',
      });
    }

    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    const isSandbox = process.env.PAYHERE_SANDBOX === 'true';

    if (!merchantId || !merchantSecret) {
      return res.status(500).json({
        success: false,
        message: 'PayHere merchant credentials are not configured',
      });
    }

    const amount = formatAmount(booking.totalAmount);
    const currency = 'LKR';
    const orderId = booking.bookingId;
    const items = `Bus ${booking.busNumber} Seats ${booking.seats.join(', ')}`;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const returnUrl = `${baseUrl}/api/payments/return`;
    const cancelUrl = `${baseUrl}/api/payments/cancel`;
    const notifyUrl = process.env.PAYHERE_NOTIFY_URL || `${req.protocol}://${req.get('host')}/api/payments/notify`;

    const hash = md5(merchantId + orderId + amount + currency + md5(merchantSecret));

    await Payment.findOneAndUpdate(
      { bookingId: orderId },
      {
        bookingId: orderId,
        userId: req.user.uid,
        amount: Number(amount),
        paymentStatus: 'pending',
        transactionId: orderId,
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      data: {
        paymentUrl: isSandbox ? 'https://sandbox.payhere.lk/pay/checkout' : 'https://www.payhere.lk/pay/checkout',
        merchant_id: merchantId,
        return_url: returnUrl,
        cancel_url: cancelUrl,
        notify_url: notifyUrl,
        order_id: orderId,
        items,
        currency,
        amount,
        first_name: firstName || 'Passenger',
        last_name: lastName || 'User',
        email: email || 'unknown@quickseat.com',
        phone: phone || '0000000000',
        address: address || 'N/A',
        city: city || 'Colombo',
        country: country || 'Sri Lanka',
        hash,
      },
    });
  } catch (error: any) {
    console.error('Error preparing PayHere payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to prepare PayHere payment',
      error: error.message,
    });
  }
};

export const handlePayhereNotify = async (req: AuthRequest, res: Response) => {
  try {
    console.log('PayHere notify received', {
      merchant_id: req.body?.merchant_id,
      order_id: req.body?.order_id,
      payhere_amount: req.body?.payhere_amount,
      payhere_currency: req.body?.payhere_currency,
      status_code: req.body?.status_code,
      payment_id: req.body?.payment_id,
    });

    await processPayhereStatus(req.body);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error handling PayHere notification:', error);
    return res.status(500).json({ message: 'Failed to handle PayHere notification' });
  }
};

export const handlePayhereReturn = async (req: AuthRequest, res: Response) => {
  try {
    // Return handler is UX-only. Do not update DB state from browser redirects.
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/booking-confirmation`;
    return res.redirect(redirectUrl);
  } catch (error: any) {
    console.error('Error handling PayHere return:', error);
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-failed`;
    return res.redirect(redirectUrl);
  }
};

export const handlePayhereCancel = async (req: AuthRequest, res: Response) => {
  const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-failed`;
  return res.redirect(redirectUrl);
};
