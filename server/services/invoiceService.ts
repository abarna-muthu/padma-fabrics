import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

export interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  size?: string;
  colour?: string;
  hsn?: string;
  unit?: string;
}

export interface InvoiceOrderData {
  id: string;
  orderNumber?: string;
  invoiceNumber: string;
  invoiceDate: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingState?: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  subtotal: number;
  shippingCharge: number;
  discountAmount?: number;
  taxAmount?: number;
  totalAmount: number;
  items: InvoiceItem[];
}

// Convert numbers into Indian Rupee Currency Words
export function numberToWords(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded === 0) return "Zero Rupees Only";

  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function formatGroup(n: number): string {
    let str = "";
    if (n > 99) {
      str += a[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n > 19) {
      str += b[Math.floor(n / 10)] + " ";
      n %= 10;
    }
    if (n > 0) {
      str += a[n] + " ";
    }
    return str.trim();
  }

  let words = "";
  let n = rounded;

  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const remainder = n;

  if (crore > 0) words += formatGroup(crore) + " Crore ";
  if (lakh > 0) words += formatGroup(lakh) + " Lakh ";
  if (thousand > 0) words += formatGroup(thousand) + " Thousand ";
  if (remainder > 0) words += formatGroup(remainder);

  return words.trim() + " Rupees Only";
}

/**
 * Generate a clean, print-friendly A4 Tax Invoice PDF using PDFKit
 */
export function generateInvoicePdf(data: InvoiceOrderData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
        info: {
          Title: `Tax Invoice - ${data.invoiceNumber}`,
          Author: "Padmanabha Fabrics",
          Subject: `Order #${data.id} Tax Invoice`,
          Keywords: "invoice, padmanabha fabrics, textiles, saree, handlooms",
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      const primaryColor = "#9F160A"; // Brand Crimson
      const accentColor = "#D15608"; // Brand Terracotta
      const darkColor = "#1A1A1A";
      const grayColor = "#555555";
      const lightBg = "#FAF7F2";
      const borderColor = "#E5DAC4";

      // ----------------------------------------------------
      // TOP ACCENT DECORATIVE BAR
      // ----------------------------------------------------
      doc.rect(40, 40, 515, 4).fill(primaryColor);

      // ----------------------------------------------------
      // BRAND & COMPANY HEADER
      // ----------------------------------------------------
      const logoPaths = [
        path.resolve(process.cwd(), "src/assets/padmanabha-logo.jpg"),
        path.resolve(process.cwd(), "public/padmanabha-logo.jpg"),
      ];
      const foundLogo = logoPaths.find((p) => fs.existsSync(p));

      let headerTextLeft = 40;
      if (foundLogo) {
        try {
          doc.image(foundLogo, 40, 55, { width: 50, height: 50 });
          headerTextLeft = 100;
        } catch {
          headerTextLeft = 40;
        }
      }

      // Company Name & Subtitle
      doc
        .font("Helvetica-Bold")
        .fontSize(16)
        .fillColor(primaryColor)
        .text("PADMANABHA FABRICS", headerTextLeft, 55);

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(grayColor)
        .text("Handcrafted Silk Sarees, Fine Textiles & Traditional Ethnic Weaves", headerTextLeft, 75)
        .text("No. 4, North Mada Street, Ambattur, Chennai - 600053, Tamil Nadu, India", headerTextLeft, 87)
        .text("Phone: +91 99401 35700 | Email: contact@padmanabhafabrics.com", headerTextLeft, 99)
        .font("Helvetica-Bold")
        .text("GSTIN: 33AAACP1234F1Z5  |  State Code: 33 (Tamil Nadu)", headerTextLeft, 111);

      // ----------------------------------------------------
      // RIGHT TOP: TAX INVOICE BADGE & NUMBERS
      // ----------------------------------------------------
      const rightX = 360;
      doc
        .font("Helvetica-Bold")
        .fontSize(16)
        .fillColor(primaryColor)
        .text("TAX INVOICE", rightX, 55, { width: 195, align: "right" });

      doc
        .rect(rightX + 25, 78, 170, 48)
        .fillAndStroke(lightBg, borderColor);

      doc
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor(primaryColor)
        .text("Invoice No:", rightX + 35, 83)
        .fillColor(darkColor)
        .text(data.invoiceNumber, rightX + 90, 83, { width: 100, align: "right" });

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(grayColor)
        .text("Invoice Date:", rightX + 35, 95)
        .fillColor(darkColor)
        .text(data.invoiceDate, rightX + 90, 95, { width: 100, align: "right" });

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(grayColor)
        .text("Order ID:", rightX + 35, 107)
        .font("Helvetica-Bold")
        .fillColor(accentColor)
        .text(`#${data.id}`, rightX + 90, 107, { width: 100, align: "right" });

      // Separator Line
      doc
        .moveTo(40, 134)
        .lineTo(555, 134)
        .lineWidth(1)
        .strokeColor(borderColor)
        .stroke();

      // ----------------------------------------------------
      // BILL TO / SHIP TO TWO-COLUMN BOXES
      // ----------------------------------------------------
      const boxY = 144;
      const boxWidth = 250;
      const boxHeight = 78;

      // Left Box: Customer / Bill To
      doc.rect(40, boxY, boxWidth, boxHeight).fillAndStroke(lightBg, borderColor);
      doc
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor(primaryColor)
        .text("BILLED TO / CUSTOMER DETAILS", 50, boxY + 8);

      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(darkColor)
        .text(data.customerName || "Valued Customer", 50, boxY + 22);

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(grayColor)
        .text(`Phone: ${data.customerPhone || "N/A"}`, 50, boxY + 34)
        .text(`Email: ${data.customerEmail || "N/A"}`, 50, boxY + 46)
        .text(`Customer ID: Verified Buyer`, 50, boxY + 58);

      // Right Box: Ship To / Delivery Address
      doc.rect(305, boxY, boxWidth, boxHeight).fillAndStroke(lightBg, borderColor);
      doc
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor(primaryColor)
        .text("SHIPPING / DELIVERY DESTINATION", 315, boxY + 8);

      const stateName = data.shippingState || "Tamil Nadu";
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(darkColor)
        .text(data.shippingAddress || "Showroom Pickup, Ambattur, Chennai", 315, boxY + 22, {
          width: 230,
          height: 36,
          ellipsis: true,
        });

      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(accentColor)
        .text(`Delivery State: ${stateName}  (Place of Supply: ${stateName})`, 315, boxY + 60);

      // ----------------------------------------------------
      // ORDER ITEMS TABLE
      // ----------------------------------------------------
      const tableTop = 232;
      const col = {
        idx: 40,
        desc: 65,
        hsn: 290,
        qty: 340,
        price: 380,
        tax: 440,
        total: 495,
      };

      // Table Header Row
      doc
        .rect(40, tableTop, 515, 20)
        .fill(primaryColor);

      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor("#FFFFFF")
        .text("#", col.idx + 5, tableTop + 6)
        .text("ITEM & DESCRIPTION", col.desc, tableTop + 6)
        .text("HSN", col.hsn, tableTop + 6)
        .text("QTY", col.qty, tableTop + 6, { width: 35, align: "center" })
        .text("RATE (₹)", col.price, tableTop + 6, { width: 55, align: "right" })
        .text("GST", col.tax, tableTop + 6, { width: 50, align: "center" })
        .text("AMOUNT (₹)", col.total, tableTop + 6, { width: 55, align: "right" });

      // Table Body Rows
      let currentY = tableTop + 20;
      const rowHeight = 24;

      (data.items || []).forEach((item, index) => {
        const isEven = index % 2 === 0;
        if (isEven) {
          doc.rect(40, currentY, 515, rowHeight).fill("#FAFAFA");
        }

        const hsnCode = item.hsn || (item.name.toLowerCase().includes("saree") ? "5007" : "5208");
        const qty = item.quantity || 1;
        const lineTotal = item.price * qty;

        // Line bottom border
        doc
          .moveTo(40, currentY + rowHeight)
          .lineTo(555, currentY + rowHeight)
          .lineWidth(0.5)
          .strokeColor(borderColor)
          .stroke();

        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor(grayColor)
          .text(String(index + 1), col.idx + 5, currentY + 7);

        // Product title & size/colour subtitle
        doc
          .font("Helvetica-Bold")
          .fontSize(8)
          .fillColor(darkColor)
          .text(item.name || "Handcrafted Textile Product", col.desc, currentY + 4, {
            width: 220,
            height: 10,
            ellipsis: true,
          });

        const subDetail = [
          item.size ? `Size: ${item.size}` : null,
          item.colour ? `Colour: ${item.colour}` : null,
        ]
          .filter(Boolean)
          .join(" | ");

        if (subDetail) {
          doc
            .font("Helvetica")
            .fontSize(7)
            .fillColor(grayColor)
            .text(subDetail, col.desc, currentY + 14, { width: 220, ellipsis: true });
        }

        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor(grayColor)
          .text(hsnCode, col.hsn, currentY + 7);

        doc
          .font("Helvetica-Bold")
          .fontSize(8)
          .fillColor(darkColor)
          .text(String(qty), col.qty, currentY + 7, { width: 35, align: "center" });

        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor(darkColor)
          .text(Number(item.price).toLocaleString("en-IN", { minimumFractionDigits: 2 }), col.price, currentY + 7, {
            width: 55,
            align: "right",
          });

        doc
          .font("Helvetica")
          .fontSize(7.5)
          .fillColor(grayColor)
          .text("5% (Incl)", col.tax, currentY + 7, { width: 50, align: "center" });

        doc
          .font("Helvetica-Bold")
          .fontSize(8)
          .fillColor(darkColor)
          .text(Number(lineTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 }), col.total, currentY + 7, {
            width: 55,
            align: "right",
          });

        currentY += rowHeight;
      });

      // ----------------------------------------------------
      // SUMMARY & TAX BREAKDOWN (BOTTOM HALF)
      // ----------------------------------------------------
      const summaryTop = Math.max(currentY + 14, 460);

      // Left Box: Payment Mode, Notes, and Stamp
      const leftBoxWidth = 270;
      doc.rect(40, summaryTop, leftBoxWidth, 100).fillAndStroke(lightBg, borderColor);

      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(primaryColor)
        .text("PAYMENT & ORDER STATUS", 50, summaryTop + 8);

      const isPaid = data.paymentStatus === "Paid";
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(grayColor)
        .text("Payment Mode:", 50, summaryTop + 22)
        .font("Helvetica-Bold")
        .fillColor(darkColor)
        .text(data.paymentMethod || "Online / COD", 120, summaryTop + 22);

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(grayColor)
        .text("Payment Status:", 50, summaryTop + 34)
        .font("Helvetica-Bold")
        .fillColor(isPaid ? "#059669" : "#D97706")
        .text(isPaid ? "PAID (Verified)" : "PENDING (Collect on Delivery)", 120, summaryTop + 34);

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(grayColor)
        .text("Fulfillment:", 50, summaryTop + 46)
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text(data.orderStatus || "Pending", 120, summaryTop + 46);

      // Stamp badge
      const stampColor = isPaid ? "#059669" : primaryColor;
      doc
        .rect(50, summaryTop + 62, 250, 26)
        .fillAndStroke(isPaid ? "#ECFDF5" : "#FFF7ED", stampColor);

      doc
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor(stampColor)
        .text(
          isPaid ? "✓ PAYMENT RECEIVED — THANK YOU!" : "• CASH ON DELIVERY ORDER CONFIRMED",
          50,
          summaryTop + 70,
          { width: 250, align: "center" },
        );

      // Right Box: Totals & Tax Calculation
      const rightSummaryX = 330;
      const rightWidth = 225;
      const sub = Number(data.subtotal || 0);
      const ship = Number(data.shippingCharge || 0);
      const total = Number(data.totalAmount || sub + ship);

      // Calculate GST breakdown (5% GST inclusive in textiles)
      // Taxable value = Total / 1.05, GST = Total - Taxable
      const gstTotal = Math.round((sub * 5) / 105);
      const isInterstate = (data.shippingState || "Tamil Nadu").toLowerCase() !== "tamil nadu";

      let sumY = summaryTop;
      const sumRow = (label: string, valStr: string, isBold: boolean = false, highlight: boolean = false) => {
        doc
          .font(isBold ? "Helvetica-Bold" : "Helvetica")
          .fontSize(8.5)
          .fillColor(highlight ? primaryColor : isBold ? darkColor : grayColor)
          .text(label, rightSummaryX, sumY);

        doc
          .font(isBold ? "Helvetica-Bold" : "Helvetica")
          .fontSize(8.5)
          .fillColor(highlight ? primaryColor : darkColor)
          .text(valStr, rightSummaryX + 110, sumY, { width: 115, align: "right" });

        sumY += 15;
      };

      sumRow("Items Subtotal:", `₹${sub.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`);
      sumRow(
        `Shipping (${data.shippingState || "State"}):`,
        ship > 0 ? `₹${ship.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "FREE (₹0.00)",
      );

      if (isInterstate) {
        sumRow("IGST (5%):", `₹${gstTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })} (Included)`);
      } else {
        const halfGst = (gstTotal / 2).toFixed(2);
        sumRow("CGST (2.5%):", `₹${halfGst} (Included)`);
        sumRow("SGST (2.5%):", `₹${halfGst} (Included)`);
      }

      if (data.discountAmount && data.discountAmount > 0) {
        sumRow("Discount:", `-₹${Number(data.discountAmount).toFixed(2)}`);
      }

      // Divider before Grand Total
      doc
        .moveTo(rightSummaryX, sumY + 2)
        .lineTo(555, sumY + 2)
        .lineWidth(1)
        .strokeColor(primaryColor)
        .stroke();

      sumY += 6;

      // Grand Total Fill Box
      doc.rect(rightSummaryX, sumY, rightWidth, 24).fill(primaryColor);
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor("#FFFFFF")
        .text("GRAND TOTAL", rightSummaryX + 8, sumY + 7);

      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor("#FFFFFF")
        .text(`₹${total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, rightSummaryX + 90, sumY + 6, {
          width: 125,
          align: "right",
        });

      // Amount in Words
      const wordsY = Math.max(summaryTop + 110, sumY + 32);
      doc
        .font("Helvetica-Bold")
        .fontSize(7.5)
        .fillColor(primaryColor)
        .text("Amount in Words: ", 40, wordsY, { continued: true })
        .font("Helvetica")
        .fillColor(darkColor)
        .text(numberToWords(total));

      // ----------------------------------------------------
      // FOOTER & TERMS
      // ----------------------------------------------------
      const footerY = 730;
      doc
        .moveTo(40, footerY)
        .lineTo(555, footerY)
        .lineWidth(0.5)
        .strokeColor(borderColor)
        .stroke();

      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(primaryColor)
        .text("THANK YOU FOR PATRONIZING PADMANABHA FABRICS!", 40, footerY + 8, {
          align: "center",
          width: 515,
        });

      doc
        .font("Helvetica")
        .fontSize(7)
        .fillColor(grayColor)
        .text(
          "Terms & Return Policy: 1. Authentic loom guarantee on all silk and handloom drapes. 2. Returns or exchanges are accepted within 7 days of delivery with original showroom security tags and bills intact. 3. For bulk weave inquiries or sizing adjustments, contact showroom customer support at +91 99401 35700.",
          40,
          footerY + 20,
          { align: "center", width: 515, lineGap: 1.5 },
        )
        .text(
          "This is a computer-generated tax invoice issued in Chennai, Tamil Nadu and requires no physical signature.",
          40,
          footerY + 50,
          { align: "center", width: 515 },
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

