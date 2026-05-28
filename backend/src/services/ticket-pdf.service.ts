import PDFDocument from 'pdfkit';
import type { IBooking } from '../models/Booking.model';
import type { IBus } from '../models/Bus.model';
import type { ITicket } from '../models/Ticket.model';

type TicketPdfContext = {
  booking: IBooking;
  tickets: ITicket[];
  passengerName: string;
  bus?: IBus | null;
};

type PdfDoc = InstanceType<typeof PDFDocument>;

const COLORS = {
  blue: '#264b8d',
  blueDark: '#1e3a6d',
  blueLight: '#eff6ff',
  blueSoft: '#dbeafe',
  gold: '#dfae6b',
  goldSoft: '#fdf4e5',
  text: '#0f172a',
  muted: '#475569',
  border: '#bfdbfe',
  pageBg: '#f8fbff',
  white: '#ffffff',
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;

const formatJourneyDate = (journeyDate: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(journeyDate));
};

const dataUrlToBuffer = (dataUrl: string) => {
  const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
  return Buffer.from(base64, 'base64');
};

const drawLabelValue = (
  doc: PdfDoc,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
  valueSize = 15
) => {
  doc.fillColor(COLORS.muted).fontSize(8).text(label.toUpperCase(), x, y, { width, align: 'left' });
  doc.fillColor(COLORS.text).fontSize(valueSize).text(value, x, y + 12, { width, align: 'left' });
};

const drawTicketPage = (doc: PdfDoc, context: TicketPdfContext, ticket: ITicket, isSingleTicket: boolean) => {
  const bus = context.bus;
  const origin = bus?.origin || 'Origin';
  const destination = bus?.destination || 'Destination';
  const departureTime = ticket.departureTime || bus?.departureTime || 'TBD';
  const qrBuffer = dataUrlToBuffer(ticket.qrCode);

  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(COLORS.pageBg);

  const cardX = 36;
  const cardY = 36;
  const cardWidth = PAGE_WIDTH - cardX * 2;
  const cardHeight = PAGE_HEIGHT - cardY * 2;

  doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 16).fillAndStroke(COLORS.white, COLORS.border);

  // Header (blue) with title left and bus icon right
  const headerH = 68;
  doc.roundedRect(cardX, cardY, cardWidth, headerH, 12).fill(COLORS.blue);
  doc.fillColor(COLORS.white).fontSize(22).font('Helvetica-Bold').text('QuickSeat', cardX + 24, cardY + 18);
  doc.fontSize(10).font('Helvetica').fillColor(COLORS.blueLight).text(`Electronic Bus Ticket #${ticket.ticketId}`, cardX + 24, cardY + 42);
  // small bus icon as rectangle decorative box on right
  doc.roundedRect(cardX + cardWidth - 84, cardY + 14, 48, 40, 8).fill(COLORS.blueDark);

  // Layout columns: left (route/passenger), center (details), right (qr)
  const leftW = 140;
  const rightW = 140;
  const gap = 18;
  const contentX = cardX + 20;
  const contentY = cardY + headerH + 18;
  const contentW = cardWidth - 40;

  // Left column
  const leftX = contentX;
  const leftY = contentY;
  doc.roundedRect(leftX, leftY, leftW, 260, 10).fill(COLORS.blueLight).stroke(COLORS.border);
  doc.fillColor(COLORS.muted).fontSize(8).font('Helvetica-Bold').text('Passenger Name', leftX + 12, leftY + 12);
  doc.fillColor(COLORS.text).fontSize(16).font('Helvetica-Bold').text(context.passengerName, leftX + 12, leftY + 28, { width: leftW - 24 });

  doc.fillColor(COLORS.muted).fontSize(8).font('Helvetica-Bold').text('From', leftX + 12, leftY + 72);
  doc.fillColor(COLORS.text).fontSize(12).font('Helvetica').text(origin, leftX + 12, leftY + 86, { width: leftW - 24 });

  doc.moveTo(leftX + 12, leftY + 120).lineTo(leftX + leftW - 12, leftY + 120).stroke(COLORS.border);

  doc.fillColor(COLORS.muted).fontSize(8).font('Helvetica-Bold').text('To', leftX + 12, leftY + 134);
  doc.fillColor(COLORS.text).fontSize(12).font('Helvetica').text(destination, leftX + 12, leftY + 148, { width: leftW - 24 });

  // Center column
  const centerX = leftX + leftW + gap;
  const centerW = contentW - leftW - rightW - gap * 2;
  doc.roundedRect(centerX, leftY, centerW, 260, 10).fill(COLORS.white).stroke(COLORS.border);

  // Date & Time blocks
  const blockW = (centerW - 32) / 2;
  doc.roundedRect(centerX + 12, leftY + 12, blockW, 56, 8).fill(COLORS.blueSoft).stroke(COLORS.border);
  doc.fillColor(COLORS.blueDark).fontSize(9).font('Helvetica-Bold').text('Date', centerX + 18, leftY + 18);
  doc.fillColor(COLORS.text).fontSize(14).font('Helvetica-Bold').text(formatJourneyDate(ticket.journeyDate), centerX + 18, leftY + 34);

  doc.roundedRect(centerX + 20 + blockW, leftY + 12, blockW, 56, 8).fill(COLORS.blueSoft).stroke(COLORS.border);
  doc.fillColor(COLORS.blueDark).fontSize(9).font('Helvetica-Bold').text('Time', centerX + 26 + blockW, leftY + 18);
  doc.fillColor(COLORS.text).fontSize(14).font('Helvetica-Bold').text(departureTime, centerX + 26 + blockW, leftY + 34);

  // Seat & Price blocks
  doc.roundedRect(centerX + 12, leftY + 84, blockW, 56, 8).fill(COLORS.blueSoft).stroke(COLORS.border);
  doc.fillColor(COLORS.blueDark).fontSize(9).font('Helvetica-Bold').text('Seat', centerX + 18, leftY + 90);
  doc.fillColor(COLORS.text).fontSize(16).font('Helvetica-Bold').text(ticket.seatNumber, centerX + 18, leftY + 106);

  doc.roundedRect(centerX + 20 + blockW, leftY + 84, blockW, 56, 8).fill(COLORS.blueSoft).stroke(COLORS.border);
  doc.fillColor(COLORS.blueDark).fontSize(9).font('Helvetica-Bold').text('Price', centerX + 26 + blockW, leftY + 90);
  doc.fillColor(COLORS.text).fontSize(16).font('Helvetica-Bold').text(`LKR ${ticket.amount.toFixed(2)}`, centerX + 26 + blockW, leftY + 106);

  // Bus & Route smaller row
  doc.fillColor(COLORS.muted).fontSize(8).font('Helvetica-Bold').text('Bus Number', centerX + 12, leftY + 156);
  doc.fillColor(COLORS.text).fontSize(14).font('Helvetica-Bold').text(ticket.busNumber || '', centerX + 12, leftY + 170);
  doc.fillColor(COLORS.muted).fontSize(8).font('Helvetica-Bold').text('Route Number', centerX + centerW / 2, leftY + 156);
  doc.fillColor(COLORS.text).fontSize(14).font('Helvetica-Bold').text(context.bus?.routeNumber || '', centerX + centerW / 2, leftY + 170);

  // Right column: QR and note
  const rightX = centerX + centerW + gap;
  const rightY = leftY;
  doc.roundedRect(rightX, rightY, rightW, 260, 10).fill(COLORS.white).stroke(COLORS.border);
  doc.fillColor(COLORS.muted).fontSize(8).font('Helvetica-Bold').text('Scan to Verify', rightX + 12, rightY + 18, { width: rightW - 24, align: 'center' });
  const qrSize = 96;
  doc.roundedRect(rightX + (rightW - qrSize) / 2 - 6, rightY + 36 - 6, qrSize + 12, qrSize + 12, 12).fill(COLORS.blueLight);
  doc.image(qrBuffer, rightX + (rightW - qrSize) / 2, rightY + 36, { width: qrSize, height: qrSize });

  doc.fillColor(COLORS.muted).fontSize(9).font('Helvetica').text('Valid for one journey', rightX + 12, rightY + 140, { width: rightW - 24, align: 'center' });

  // Footer note
  doc.roundedRect(cardX + 20, cardY + cardHeight - 86, cardWidth - 40, 58, 10).fill(COLORS.goldSoft).stroke(COLORS.gold);
  doc.fillColor(COLORS.muted).fontSize(9).font('Helvetica').text(
    'Please present this e-ticket at the counter or scan the QR code on boarding. Valid ticket • Not transferable.',
    cardX + 30,
    cardY + cardHeight - 68,
    { width: cardWidth - 80, align: 'center' }
  );
};

export const createTicketPdfBuffer = async (context: TicketPdfContext) => {
  return await new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 0,
      bufferPages: true,
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    doc.on('error', reject);
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    context.tickets.forEach((ticket, index) => {
      if (index > 0) {
        doc.addPage();
      }

      drawTicketPage(doc, context, ticket, context.tickets.length === 1);
    });

    doc.end();
  });
};