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

const C = {
  blue800:    '#1e40af',
  blue700:    '#1d4ed8',
  blue600:    '#2563eb',
  blue500:    '#3b82f6',
  blue300:    '#93c5fd',
  blue200:    '#bfdbfe',
  blue100:    '#dbeafe',
  blue50:     '#eff6ff',
  white:      '#ffffff',
  slate800:   '#1e293b',
  slate500:   '#64748b',
  slate400:   '#94a3b8',
  emerald50:  '#ecfdf5',
  emeraldBdr: '#bbf7d0',
  emerald600: '#059669',
};

const PAGE_W = 595.28;
const PAGE_H = 841.89;

// ── Primitives ────────────────────────────────────────────────────────────────

const fill = (
  doc: PdfDoc, x: number, y: number, w: number, h: number, r: number, color: string
) => { doc.save().roundedRect(x, y, w, h, r).fill(color).restore(); };

const border = (
  doc: PdfDoc, x: number, y: number, w: number, h: number, r: number,
  color: string, lw = 0.75
) => { doc.save().roundedRect(x, y, w, h, r).lineWidth(lw).stroke(color).restore(); };

const txt = (
  doc: PdfDoc, s: string,
  x: number, y: number, w: number,
  color: string, size: number, bold = false,
  opts: Record<string, unknown> = {}
) => {
  doc.save()
    .fillColor(color).fontSize(size)
    .font(bold ? 'Helvetica-Bold' : 'Helvetica')
    .text(s, x, y, { width: w, lineBreak: false, ...opts })
    .restore();
};

const dataUrlToBuffer = (dataUrl: string) => {
  const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
  return Buffer.from(base64, 'base64');
};

const formatDate = (d: Date) =>
  new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(d));

// Hand-drawn bus icon (no emoji)
const busIcon = (doc: PdfDoc, cx: number, cy: number, bodyCol: string, windowCol: string, s = 1) => {
  doc.save();
  doc.roundedRect(cx - 13 * s, cy - 8 * s, 26 * s, 14 * s, 3 * s).fill(bodyCol);
  doc.roundedRect(cx - 10 * s, cy - 6 * s, 7 * s, 8 * s, 1.5 * s).fill(windowCol);
  doc.roundedRect(cx + 2  * s, cy - 6 * s, 7 * s, 8 * s, 1.5 * s).fill(windowCol);
  doc.circle(cx - 7 * s, cy + 7 * s, 3.5 * s).fill(bodyCol);
  doc.circle(cx + 7 * s, cy + 7 * s, 3.5 * s).fill(bodyCol);
  doc.circle(cx - 7 * s, cy + 7 * s, 1.5 * s).fill(windowCol);
  doc.circle(cx + 7 * s, cy + 7 * s, 1.5 * s).fill(windowCol);
  doc.restore();
};

// ── Main draw ─────────────────────────────────────────────────────────────────

const drawTicketPage = (doc: PdfDoc, ctx: TicketPdfContext, ticket: ITicket) => {
  const bus    = ctx.bus;
  const origin = String(ctx.booking.origin || bus?.origin || 'N/A');
  const dest   = String(ctx.booking.destination || bus?.destination || 'N/A');
  const time   = String(ticket.departureTime || ctx.booking.time || bus?.departureTime || 'TBD');
  const busOrigin = String(bus?.origin || origin);
  const busDepartureTime = String(bus?.departureTime || time);
  const qrBuf  = dataUrlToBuffer(ticket.qrCode);

  // Page bg
  doc.rect(0, 0, PAGE_W, PAGE_H).fill(C.blue50);

  // ── Card layout ──────────────────────────────────────────────────────────────
  const cX = 50, cY = 38, cW = PAGE_W - 100;

  // Route strip sits entirely inside the blue header — move it up
  // so it's fully contained within the blue area with padding below it
  const ROUTE_H  = 52;   // height of the From/To strip
  const ROUTE_PAD_TOP = 148; // from header top to route strip top
  const ROUTE_PAD_BTM = 20; // padding below route strip before header ends

  const HEADER_H = ROUTE_PAD_TOP + ROUTE_H + ROUTE_PAD_BTM; // ≈220
  const BODY_H   = 218;
  const TEAR_H   = 30;
  const QR_H     = 122;
  const FOOT_H   = 38;
  const CARD_H   = HEADER_H + BODY_H + TEAR_H + QR_H + FOOT_H;

  // Card shadow
  doc.save().roundedRect(cX + 3, cY + 5, cW, CARD_H, 16).fill('#c4d7f5').restore();
  // Card shell
  fill(doc, cX, cY, cW, CARD_H, 16, C.white);
  border(doc, cX, cY, cW, CARD_H, 16, C.blue200, 1);

  // ── HEADER (blue) — entirely self-contained ──────────────────────────────────
  doc.save().roundedRect(cX, cY, cW, HEADER_H + 18, 16).clip();
  doc.rect(cX, cY, cW, HEADER_H).fill(C.blue800);
  doc.restore();

  // Brand
  txt(doc, 'QuickSeat', cX + 22, cY + 20, 240, C.white, 26, true);
  txt(doc, 'ELECTRONIC BUS TICKET', cX + 22, cY + 50, 220, C.blue300, 7.5, true);

  // Bus icon — top right corner
  const iconX = cX + cW - 54, iconY = cY + 16;
  fill(doc, iconX, iconY, 40, 40, 10, 'rgba(255,255,255,0.18)');
  border(doc, iconX, iconY, 40, 40, 10, 'rgba(255,255,255,0.28)', 0.75);
  busIcon(doc, iconX + 20, iconY + 18, C.white, C.blue700, 0.9);

  // Ticket number pill
  fill(doc, cX + 22, cY + 66, 188, 22, 11, C.blue700);
  txt(doc, `#${ticket.ticketId}`, cX + 32, cY + 70, 170, C.blue300, 8.5, true);

  // Passenger
  txt(doc, 'PASSENGER NAME', cX + 22, cY + 98, cW - 44, C.blue300, 7.5, true);
  txt(doc, ctx.passengerName,  cX + 22, cY + 112, cW - 44, C.white, 20, true);

  // ── Route strip — fully inside blue header ────────────────────────────────
  const rY  = cY + ROUTE_PAD_TOP;   // top of From/To boxes
  const rH  = ROUTE_H;
  const MID = 46;                    // centre gap for bus icon
  const bW  = (cW - 36 - MID) / 2;  // equal width for both boxes

  // FROM box — white bg so it pops on blue
  fill(doc,   cX + 14, rY, bW, rH, 10, C.white);
  border(doc, cX + 14, rY, bW, rH, 10, C.blue200, 1);
  txt(doc, 'FROM', cX + 24, rY + 8, bW - 16, C.blue500, 7, true);
  doc.save().circle(cX + 25, rY + 32, 3.5).fill(C.blue500).restore();
  txt(doc, origin, cX + 35, rY + 26, bW - 42, C.slate800, 11, true);

  // Centre bus icon with dashed lines on blue bg
  const midCX = cX + 14 + bW + MID / 2;
  const midCY = rY + rH / 2;
  // dashed connector lines
  doc.save()
    .moveTo(midCX - 18, midCY).lineTo(midCX - 9, midCY)
    .dash(2, { space: 2 }).lineWidth(1.2).strokeColor(C.blue300).stroke()
    .restore();
  doc.save()
    .moveTo(midCX + 9, midCY).lineTo(midCX + 18, midCY)
    .dash(2, { space: 2 }).lineWidth(1.2).strokeColor(C.blue300).stroke()
    .restore();
  // small circular bg for bus
  doc.save().circle(midCX, midCY, 14).fill(C.blue700).restore();
  busIcon(doc, midCX, midCY, C.white, C.blue500, 0.65);

  // TO box — white bg
  const toX = cX + 14 + bW + MID;
  fill(doc,   toX, rY, bW, rH, 10, C.white);
  border(doc, toX, rY, bW, rH, 10, C.blue200, 1);
  txt(doc, 'TO', toX + 10, rY + 8, bW - 16, C.blue500, 7, true);
  doc.save().circle(toX + 11, rY + 32, 3.5).fill(C.blue500).restore();
  txt(doc, dest, toX + 21, rY + 26, bW - 30, C.slate800, 11, true);

  // ── BODY (white) ─────────────────────────────────────────────────────────────
  const bodyY = cY + HEADER_H;
  const gX    = cX + 14;
  const gY    = bodyY + 14;
  const gGap  = 10;
  const colW  = (cW - 28 - gGap) / 2;
  const rowH  = 60;

  const infoCard = (
    x: number, y: number, dark: boolean,
    label: string, value: string, valSize = 15
  ) => {
    const bg  = dark ? C.blue800 : C.blue100;
    const lc  = dark ? C.blue300 : C.blue500;
    const vc  = dark ? C.white   : C.slate800;
    const brc = dark ? '#1e3a8a' : C.blue200;
    fill(doc,   x, y, colW, rowH, 10, bg);
    border(doc, x, y, colW, rowH, 10, brc, 0.5);
    txt(doc, label, x + 12, y + 10, colW - 24, lc, 7, true);
    txt(doc, value, x + 12, y + 24, colW - 24, vc, valSize, true);
  };

  infoCard(gX,               gY,  false, 'DATE',  formatDate(ticket.journeyDate));
  infoCard(gX + colW + gGap, gY,  false, 'TIME',  time);

  const r2Y = gY + rowH + gGap;
  infoCard(gX,               r2Y, false, 'SEAT',  ticket.seatNumber, 17);
  infoCard(gX + colW + gGap, r2Y, false, 'PRICE', `LKR ${ticket.amount.toFixed(2)}`);

  // Bus No. + Route
  const smY = r2Y + rowH + gGap;
  const smH = 44;

  fill(doc,   gX,               smY, colW, smH, 10, C.blue50);
  border(doc, gX,               smY, colW, smH, 10, C.blue200, 0.75);
  txt(doc, 'BUS NO.',                    gX + 12, smY + 8,  colW - 24, C.slate500, 7,  true);
  txt(doc, ticket.busNumber || '—',      gX + 12, smY + 22, colW - 24, C.slate800, 12, true);

  fill(doc,   gX + colW + gGap,  smY, colW, smH, 10, C.blue50);
  border(doc, gX + colW + gGap,  smY, colW, smH, 10, C.blue200, 0.75);
  txt(doc, 'ROUTE',                           gX + colW + gGap + 12, smY + 8,  colW - 24, C.slate500, 7,  true);
  txt(doc, bus?.routeNumber || '—',           gX + colW + gGap + 12, smY + 22, colW - 24, C.slate800, 12, true);

  // Departure note (small, italic)
  doc.save().fillColor(C.slate500).fontSize(9).font('Helvetica-Oblique')
    .text(`Note: The bus departs ${busOrigin} at ${busDepartureTime}.`, cX + 22, smY + smH + 8, { width: cW - 44 })
    .restore();

  // ── TEAR LINE ────────────────────────────────────────────────────────────────
  const tearY  = bodyY + BODY_H;
  const tearMY = tearY + TEAR_H / 2;

  doc.save().circle(cX,      tearMY, 13).fill(C.blue50).restore();
  doc.save().circle(cX + cW, tearMY, 13).fill(C.blue50).restore();
  doc.save()
    .moveTo(cX + 18, tearMY).lineTo(cX + cW - 18, tearMY)
    .dash(5, { space: 4 }).lineWidth(1.5).strokeColor(C.blue200)
    .stroke().restore();

  // ── QR SECTION ───────────────────────────────────────────────────────────────
  const qrSecY = tearY + TEAR_H;
  const qrSz   = 90;
  const qrBY   = qrSecY + (QR_H - qrSz) / 2;
  const qrX    = cX + 18;

  fill(doc,   qrX, qrBY, qrSz, qrSz, 10, C.white);
  border(doc, qrX, qrBY, qrSz, qrSz, 10, C.blue200, 1);
  doc.image(qrBuf, qrX + 6, qrBY + 6, { width: qrSz - 12, height: qrSz - 12 });

  const riX = qrX + qrSz + 20;
  const riY = qrSecY + 14;
  const riW = cW - (riX - cX) - 16;

  txt(doc, 'SCAN TO VERIFY', riX, riY, riW, C.blue800, 8, true);
  doc.save().moveTo(riX, riY + 14).lineTo(riX + riW, riY + 14)
    .lineWidth(0.5).strokeColor(C.blue200).stroke().restore();

  fill(doc,   riX, riY + 22, 78, 22, 11, C.emerald50);
  border(doc, riX, riY + 22, 78, 22, 11, C.emeraldBdr, 0.75);
  doc.save().circle(riX + 13, riY + 33, 4).fill(C.emerald600).restore();
  txt(doc, 'VALID', riX + 23, riY + 26, 52, C.emerald600, 9.5, true);

  doc.fillColor(C.slate400).fontSize(8.5).font('Helvetica')
    .text('Valid for one journey only.\nNot transferable.', riX, riY + 54, { width: riW });

  // ── FOOTER ───────────────────────────────────────────────────────────────────
  const ftY = qrSecY + QR_H;
  doc.save().roundedRect(cX, ftY - 16, cW, FOOT_H + 16, 16).clip();
  doc.rect(cX, ftY, cW, FOOT_H).fill(C.blue800);
  doc.restore();

  txt(doc,
    'Present this e-ticket at the counter or scan QR on boarding.',
    cX + 20, ftY + 12, cW - 40, C.blue300, 9, false,
    { align: 'center' }
  );
};

// ── Export ────────────────────────────────────────────────────────────────────

export const createTicketPdfBuffer = async (context: TicketPdfContext): Promise<Buffer> => {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    doc.on('error', reject);
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    context.tickets.forEach((ticket, i) => {
      if (i > 0) doc.addPage();
      drawTicketPage(doc, context, ticket);
    });
    doc.end();
  });
};