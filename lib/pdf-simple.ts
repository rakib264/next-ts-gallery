import * as fs from 'fs';
import { jsPDF } from 'jspdf';
import * as path from 'path';
import createLogger from './logger';

// Configure Winston logger
const logger = createLogger('pdf-simple-service');

// Invoice data interface - Updated to match actual order structure
export interface InvoiceData {
  orderId: string;
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  shippingAddress: {
    name: string;
    phone: string;
    email: string;
    street: string;
    city: string;
    district: string;
    division: string;
    postalCode?: string;
    coordinates?: {
      placeName: string;
      district: string;
      divisionName: string;
      thanaOrUpazilaName?: string;
    };
  };
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    variant?: string;
    image?: string;
  }>;
  subtotal: number;
  shippingCost: number;
  tax: number;
  taxRate?: number;
  discountAmount: number;
  total: number;
  paymentMethod: string;
  deliveryType: string;
  createdAt: string;
  invoiceGeneratedAt?: string;
  expectedDelivery?: string;
  notes?: string;
}

class SimplePDFService {
  generateInvoice(data: InvoiceData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        logger.info(`Generating invoice PDF for order: ${data.orderNumber}`);
        
        // Create new PDF document
        const doc = new jsPDF();
        
        // Set up colors (TSR Gallery brand colors)
        const primaryColor = '#3949AB'; // Indigo
        const secondaryColor = '#8b5cf6'; // Purple
        const textColor = '#374151'; // Gray-700
        const lightGray = '#f3f4f6'; // Gray-100
        const whiteColor = '#FFFFFF'; // White for text visibility
        
        // Helper function to format currency
        const formatPrice = (price: number) => {
          return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0
          }).format(price);
        };
        
        // Helper function to format date
        const formatDate = (dateString: string) => {
          return new Date(dateString).toLocaleDateString('en-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        };
        
        // Header with improved design and branding
        doc.setFillColor(primaryColor);
        doc.rect(0, 0, 210, 55, 'F'); // Slightly reduced height
        
        // Add actual company logo with perfect proportional sizing
        try {
          const logoPath = path.join(process.cwd(), 'lib', 'assets', 'images', 'tsrgallery.png');
          if (fs.existsSync(logoPath)) {
            const logoData = fs.readFileSync(logoPath, 'base64');
            const logoFormat = 'PNG';
            // Perfect logo size - not too big, not too small
            doc.addImage(`data:image/png;base64,${logoData}`, logoFormat, 20, 12, 45, 22, '', 'FAST');
          } else {
            // Fallback to stylized logo if file not found
            doc.setFillColor(whiteColor);
            doc.roundedRect(20, 15, 45, 20, 3, 3, 'F');
            doc.setTextColor(primaryColor);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('TSR GALLERY', 22, 27);
          }
        } catch (error) {
          logger.warn('Could not load logo, using fallback:', error);
          // Fallback design
          doc.setFillColor(whiteColor);
          doc.roundedRect(20, 15, 45, 20, 3, 3, 'F');
          doc.setTextColor(primaryColor);
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('TSR GALLERY', 22, 27);
        }
        
        // Company tagline with elegant typography
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Premium Fashion E-commerce Platform', 20, 40);
        
        // Contact information with smaller, elegant styling
        doc.setFontSize(8);
        doc.text('Email: info.tsrgallery@gmail.com  |  Phone: +8801339561702', 20, 46);
        
        // Invoice title with refined, smaller styling
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('INVOICE', 145, 22);
        
        // Invoice details with improved typography
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Invoice #: ${data.orderNumber}`, 145, 30);
        doc.text(`Date: ${formatDate(data.invoiceGeneratedAt || data.createdAt)}`, 145, 37);
        
        // Add subtle decorative line
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.3);
        doc.line(145, 40, 185, 40);
        
        // Customer information section with enhanced design
        let yPos = 70; // Adjusted for new header height
        
        // Bill To section with rounded corners effect
        doc.setFillColor(lightGray);
        doc.roundedRect(20, yPos, 80, 40, 2, 2, 'F');
        
        // Add subtle border
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.3);
        doc.roundedRect(20, yPos, 80, 40, 2, 2, 'S');
        
        doc.setTextColor(textColor);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('BILL TO', 25, yPos + 10);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(data.shippingAddress?.name || 'Customer', 25, yPos + 20);
        doc.text(data.shippingAddress?.email || 'N/A', 25, yPos + 27);
        doc.text(data.shippingAddress?.phone || 'N/A', 25, yPos + 34);
        
        // Ship To section with matching design
        doc.setFillColor(lightGray);
        doc.roundedRect(110, yPos, 80, 40, 2, 2, 'F');
        
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.3);
        doc.roundedRect(110, yPos, 80, 40, 2, 2, 'S');
        
        doc.setTextColor(textColor);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('SHIP TO', 115, yPos + 10);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        // Format address with coordinates data
        const street = data.shippingAddress?.street || '';
        const placeName = data.shippingAddress?.coordinates?.placeName || '';
        const district = data.shippingAddress?.coordinates?.district || data.shippingAddress?.district || '';
        const divisionName = data.shippingAddress?.coordinates?.divisionName || data.shippingAddress?.division || '';
        const postalCode = data.shippingAddress?.postalCode || '';
        
        const fullAddress = `${street}${placeName ? ', ' + placeName : ''}${district ? ', ' + district : ''}${divisionName ? ', ' + divisionName : ''}${postalCode ? ', ' + postalCode : ''}`;
        
        // Split address into multiple lines with proper spacing
        const addressLines = doc.splitTextToSize(fullAddress, 70);
        let addressYPos = yPos + 20;
        addressLines.forEach((line: string, index: number) => {
          if (addressYPos < yPos + 37 && index < 3) { // Limit to 3 lines
            doc.text(line, 115, addressYPos);
            addressYPos += 6;
          }
        });
        
        // Items table header with clean design and proper column positioning
        yPos += 50;
        doc.setFillColor(secondaryColor); // Only secondaryColor background
        doc.roundedRect(20, yPos, 170, 16, 1, 1, 'F');
        
        doc.setTextColor(255, 255, 255); // White text
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        
        // Properly aligned column headers with exact positioning
        doc.text('ITEM', 25, yPos + 11);
        doc.text('QTY', 130, yPos + 11, { align: 'center' }); // Centered
        doc.text('PRICE', 155, yPos + 11, { align: 'center' }); // Centered  
        doc.text('TOTAL', 175, yPos + 11, { align: 'center' }); // Centered
        
        // Items with perfectly aligned columns and enhanced design
        yPos += 20;
        doc.setTextColor(textColor);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        (data.items || []).forEach((item, index) => {
          if (yPos > 240) {
            doc.addPage();
            yPos = 30;
          }
          
          // Add alternating row background with rounded corners
          if (index % 2 === 0) {
            doc.setFillColor(249, 249, 249);
            doc.roundedRect(20, yPos - 4, 170, 14, 1, 1, 'F');
          }
          
          // Add subtle row border
          doc.setDrawColor(240, 240, 240);
          doc.setLineWidth(0.2);
          doc.line(20, yPos + 10, 190, yPos + 10);
          
          // Item name with proper text wrapping
          const itemName = item.name || 'Unknown Item';
          const wrappedText = doc.splitTextToSize(itemName, 95);
          doc.text(wrappedText[0], 25, yPos + 4);
          
          // Perfectly aligned columns to match headers
          doc.text((item.quantity || 0).toString(), 130, yPos + 4, { align: 'center' }); // Matches QTY header
          doc.text(formatPrice(item.price || 0), 155, yPos + 4, { align: 'center' }); // Matches PRICE header
          doc.text(formatPrice((item.price || 0) * (item.quantity || 0)), 175, yPos + 4, { align: 'center' }); // Matches TOTAL header
          
          yPos += 16;
        });
        
        // Totals section with clean, elegant design
        yPos += 20;
        const totalsHeight = (data.discountAmount > 0 ? 50 : 45);
        
        // Clean totals background without heavy shadows
        doc.setFillColor(lightGray);
        doc.roundedRect(110, yPos, 80, totalsHeight, 2, 2, 'F');
        
        // Add subtle border
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.3);
        doc.roundedRect(110, yPos, 80, totalsHeight, 2, 2, 'S');
        
        doc.setTextColor(textColor);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        
        let totalsYPos = yPos + 15;
        doc.text('Subtotal:', 115, totalsYPos);
        doc.text(formatPrice(data.subtotal || 0), 185, totalsYPos, { align: 'right' });
        
        totalsYPos += 9;
        doc.text('Shipping:', 115, totalsYPos);
        doc.text(formatPrice(data.shippingCost || 0), 185, totalsYPos, { align: 'right' });
        
        // Tax display temporarily disabled
        // if ((data.tax || 0) > 0) {
        //   totalsYPos += 8;
        //   const taxLabel = data.taxRate ? `Tax (${data.taxRate}%):` : 'Tax:';
        //   doc.text(taxLabel, 115, totalsYPos);
        //   doc.text(formatPrice(data.tax || 0), 185, totalsYPos, { align: 'right' });
        // }
        
        if ((data.discountAmount || 0) > 0) {
          totalsYPos += 9;
          doc.setTextColor(76, 175, 80); // Material Green for discount
          doc.text('Discount:', 115, totalsYPos);
          doc.text(`-${formatPrice(data.discountAmount || 0)}`, 185, totalsYPos, { align: 'right' });
          doc.setTextColor(textColor);
        }
        
        // Total with clean, professional highlighting
        totalsYPos += 12;
        
        // Subtle shadow for total
        doc.setFillColor(210, 210, 210);
        doc.roundedRect(111, totalsYPos - 2, 80, 15, 2, 2, 'F');
        
        // Main total background
        doc.setFillColor(primaryColor);
        doc.roundedRect(110, totalsYPos - 3, 80, 15, 2, 2, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('TOTAL:', 115, totalsYPos + 3);
        doc.text(formatPrice(data.total || 0), 185, totalsYPos + 3, { align: 'right' });
        
        yPos = totalsYPos + 15;
        
        // Payment and delivery info with enhanced styling
        yPos += 25;
        
        // Create info section background
        doc.setFillColor(248, 249, 250);
        doc.roundedRect(20, yPos - 5, 170, 35, 2, 2, 'F');
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.3);
        doc.roundedRect(20, yPos - 5, 170, 35, 2, 2, 'S');
        
        doc.setTextColor(textColor);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        
        // Payment method with icon-like formatting
        const paymentMethodText = data.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 
                                 data.paymentMethod === 'online' ? 'Online Payment' :
                                 (data.paymentMethod || 'N/A').replace('_', ' ').toUpperCase();
        doc.setFont('helvetica', 'bold');
        doc.text('Payment Method:', 25, yPos + 5);
        doc.setFont('helvetica', 'normal');
        doc.text(paymentMethodText, 70, yPos + 5);
        
        // Delivery type formatting
        const deliveryTypeText = (data.deliveryType || 'N/A').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        doc.setFont('helvetica', 'bold');
        doc.text('Delivery Type:', 25, yPos + 15);
        doc.setFont('helvetica', 'normal');
        doc.text(deliveryTypeText, 70, yPos + 15);
        
        if (data.expectedDelivery) {
          doc.setFont('helvetica', 'bold');
          doc.text('Expected Delivery:', 25, yPos + 25);
          doc.setFont('helvetica', 'normal');
          doc.text(formatDate(data.expectedDelivery), 80, yPos + 25);
          yPos += 10;
        }
        
        if (data.notes) {
          yPos += 45;
          
          // Notes section with background
          doc.setFillColor(252, 252, 252);
          doc.roundedRect(20, yPos - 5, 170, 25, 2, 2, 'F');
          doc.setDrawColor(230, 230, 230);
          doc.setLineWidth(0.3);
          doc.roundedRect(20, yPos - 5, 170, 25, 2, 2, 'S');
          
          doc.setFont('helvetica', 'bold');
          doc.text('ORDER NOTES:', 25, yPos + 5);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          const noteLines = doc.splitTextToSize(data.notes, 160);
          let noteYPos = yPos + 12;
          noteLines.forEach((line: string) => {
            if (noteYPos < yPos + 18) {
              doc.text(line, 25, noteYPos);
              noteYPos += 5;
            }
          });
          yPos += 25;
        }
        
        // Standard footer positioning - keep with content unless truly necessary to split
        const footerHeight = 20;
        let footerY = yPos + 15;
        
        // Standard practice: Only create new page if footer would extend beyond page (297-10 margin = 287)
        if (footerY + footerHeight > 287) {
          doc.addPage();
          footerY = 20; // Start at top margin of new page, not bottom
        }
        
        // Simple, professional footer with standard height
        doc.setFillColor(primaryColor);
        doc.rect(0, footerY, 210, footerHeight, 'F');
        
        // Standard footer content - professional and minimal
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Thank you for choosing TSR Gallery!', 20, footerY + 8);
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`© ${new Date().getFullYear()} TSR Gallery. All rights reserved.`, 20, footerY + 15);
        
        // Generate PDF in memory (Vercel-compatible)
        const pdfOutput = doc.output('arraybuffer');
        const pdfBuffer = Buffer.from(pdfOutput);
        
        // For Vercel, we'll return the buffer directly
        // The queue service will handle Cloudinary upload
        logger.info(`Invoice PDF generated successfully in memory for order: ${data.orderNumber}`);
        resolve(pdfBuffer);
        
      } catch (error) {
        logger.error('Error generating invoice PDF:', error);
        reject(error);
      }
    });
  }
}

export default new SimplePDFService();
