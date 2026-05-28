import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import Booking from '../models/Booking.model';
import Bus from '../models/Bus.model';
import Payment from '../models/Payment.model';
import Ticket, { ITicket } from '../models/Ticket.model';
import { User } from '../models/User.model';
import { createTicketPdfBuffer } from './ticket-pdf.service';

type TicketEmailContext = {
  userName: string;
  userEmail: string;
  bookingId: string;
  busNumber: string;
  origin: string;
  destination: string;
  tickets: ITicket[];
};

const generateTicketId = () => {
  return `QS-${uuidv4().slice(0, 8)}`;
};

const generateUniqueTicketId = async (maxAttempts = 8) => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const id = generateTicketId();
    const existing = await Ticket.findOne({ ticketId: id }).lean().exec();
    if (!existing) return id;
  }
  throw new Error('Unable to generate a unique ticketId after several attempts');
};

const buildQrData = (ticketId: string, bookingId: string, seatNumber: string) => {
  return JSON.stringify({
    ticketId,
    bookingId,
    seatNumber,
  });
};

const formatJourneyDate = (journeyDate: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(journeyDate));
};

const getTransport = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user,
      pass,
    },
  });
};

const buildTicketEmailHtml = (context: TicketEmailContext) => {
  return `
    <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.6;">
      <h2 style="color:#264b8d;">Your QuickSeat e-ticket is ready</h2>
      <p>Hi ${context.userName},</p>
      <p>Your payment for booking <strong>${context.bookingId}</strong> was successful.</p>
      <p>The PDF e-ticket is attached to this email and includes the QR code used by the conductor for validation.</p>
      <p><strong>Route:</strong> ${context.origin} to ${context.destination}</p>
      <p><strong>Bus:</strong> ${context.busNumber}</p>
      <p><strong>Seats:</strong> ${context.tickets.map((ticket) => ticket.seatNumber).join(', ')}</p>
      <p style="color:#475569;">QuickSeat Support</p>
    </div>
  `;
};

export const issueTicketsForBooking = async (bookingId: string) => {
  const booking = await Booking.findOne({ bookingId });
  if (!booking) {
    throw new Error('Booking not found');
  }

  const payment = await Payment.findOne({ bookingId });
  if (!payment || payment.paymentStatus !== 'paid') {
    throw new Error('Payment is not completed for this booking');
  }

  const user = await User.findOne({ uid: booking.userId });
  if (!user) {
    throw new Error('User not found for booking');
  }

  const bus = await Bus.findOne({ busNumber: booking.busNumber });

  const existingTickets = await Ticket.find({ bookingId });
  const ticketsBySeat = new Map(existingTickets.map((ticket) => [ticket.seatNumber, ticket]));
  const tickets: ITicket[] = [];
  const departureTime = bus?.departureTime || process.env.DEFAULT_DEPARTURE_TIME || 'TBD';

  for (const seatNumber of booking.seats) {
    const normalizedSeat = String(seatNumber).trim().toUpperCase();
    const existingTicket = ticketsBySeat.get(normalizedSeat);

    if (existingTicket) {
      tickets.push(existingTicket);
      continue;
    }

    const ticketId = await generateUniqueTicketId();

    const truncatedBusNumber = String(booking.busNumber || '').trim().toUpperCase().slice(0, 16);
    const qrData = buildQrData(ticketId, booking.bookingId, normalizedSeat);
    const qrCodeImage = await QRCode.toDataURL(qrData);

    const ticket = await Ticket.create({
      bookingId: booking.bookingId,
      email: user.email,
      busNumber: truncatedBusNumber,
      journeyDate: booking.journeyDate,
      departureTime,
      seatNumber: normalizedSeat,
      amount: Number(booking.totalAmount) / booking.seats.length,
      ticketId,
      qrCode: qrCodeImage,
      status: 'ACTIVE',
    });

    tickets.push(ticket);
  }

  const pdfBuffer = await createTicketPdfBuffer({
    booking,
    tickets,
    passengerName: user.fullName,
    bus,
  });

  const transporter = getTransport();
  if (transporter) {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: user.email,
      subject: `Your QuickSeat ticket for ${booking.bookingId}`,
      text: `Your QuickSeat PDF e-ticket for booking ${booking.bookingId} is attached.`,
      html: buildTicketEmailHtml({
        userName: user.fullName,
        userEmail: user.email,
        bookingId: booking.bookingId,
        busNumber: bus?.busNumber || booking.busNumber,
        origin: bus?.origin || 'Origin',
        destination: bus?.destination || 'Destination',
        tickets,
      }),
      attachments: [
        {
          filename: `quickseat-ticket-${booking.bookingId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
  } else {
    console.warn('SMTP is not configured, skipping ticket email delivery');
  }

  return {
    booking,
    payment,
    user,
    tickets,
  };
};

export const getTicketsForBooking = async (bookingId: string) => {
  const booking = await Booking.findOne({ bookingId });
  if (!booking) {
    throw new Error('Booking not found');
  }

  const tickets = await Ticket.find({ bookingId }).sort({ createdAt: 1 });
  return { booking, tickets };
};

export const buildTicketDownloadContent = (bookingId: string, tickets: ITicket[]) => {
  return [
    `QuickSeat E-Tickets for Booking ${bookingId}`,
    '',
    ...tickets.map((ticket) => `${ticket.ticketId} | ${ticket.seatNumber} | ${ticket.departureTime}`),
  ].join('\n\n');
};