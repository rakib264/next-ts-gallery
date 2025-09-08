import { jsPDF } from 'jspdf';
import createLogger from './logger';

// Configure Winston logger
const logger = createLogger('pdf-simple-service');

// Invoice data interface
export interface InvoiceData {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  shippingAddress: {
    street: string;
    city: string;
    district: string;
    division: string;
    postalCode?: string;
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
  discountAmount: number;
  total: number;
  paymentMethod: string;
  deliveryType: string;
  orderDate: string;
  expectedDelivery?: string;
  notes?: string;
}

class SimplePDFService {
  generateInvoice(data: InvoiceData): Promise<string> {
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
        
        // Helper function to format currency
        const formatPrice = (price: number) => {
          return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0
          }).format(price);
        };
        
        // Header
        doc.setFillColor(primaryColor);
        doc.rect(0, 0, 210, 40, 'F');
        
        // Company name
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('TSR Gallery', 20, 25);
        
        // Tagline
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Premium Fashion E-commerce Platform', 20, 32);
        
        // Invoice title
        doc.setTextColor(textColor);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('INVOICE', 150, 25);
        
        // Invoice number and date
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Invoice #: ${data.orderNumber}`, 150, 32);
        doc.text(`Date: ${data.orderDate}`, 150, 37);
        
        // Customer information section
        let yPos = 60;
        doc.setFillColor(lightGray);
        doc.rect(20, yPos, 170, 25, 'F');
        
        doc.setTextColor(textColor);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Bill To:', 25, yPos + 8);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(data.customerName || 'Customer', 25, yPos + 15);
        doc.text(data.customerPhone || 'N/A', 25, yPos + 20);
        if (data.customerEmail) {
          doc.text(data.customerEmail, 25, yPos + 25);
        }
        
        // Shipping address
        yPos += 35;
        doc.setFillColor(lightGray);
        doc.rect(20, yPos, 170, 25, 'F');
        
        doc.setTextColor(textColor);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Ship To:', 25, yPos + 8);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(data.shippingAddress?.street || 'N/A', 25, yPos + 15);
        doc.text(`${data.shippingAddress?.city || 'N/A'}, ${data.shippingAddress?.district || 'N/A'}`, 25, yPos + 20);
        doc.text(data.shippingAddress?.division || 'N/A', 25, yPos + 25);
        
        // Items table header
        yPos += 40;
        doc.setFillColor(secondaryColor);
        doc.rect(20, yPos, 170, 12, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Item', 25, yPos + 8);
        doc.text('Qty', 120, yPos + 8);
        doc.text('Price', 140, yPos + 8);
        doc.text('Total', 170, yPos + 8);
        
        // Items
        yPos += 15;
        doc.setTextColor(textColor);
        doc.setFont('helvetica', 'normal');
        
        (data.items || []).forEach((item, index) => {
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.text(item.name || 'Unknown Item', 25, yPos);
          doc.text((item.quantity || 0).toString(), 120, yPos);
          doc.text(formatPrice(item.price || 0), 140, yPos);
          doc.text(formatPrice((item.price || 0) * (item.quantity || 0)), 170, yPos);
          
          yPos += 8;
        });
        
        // Totals section
        yPos += 10;
        doc.setFillColor(lightGray);
        doc.rect(120, yPos, 70, 30, 'F');
        
        doc.setTextColor(textColor);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Subtotal:', 130, yPos + 8);
        doc.text(formatPrice(data.subtotal || 0), 170, yPos + 8);
        
        if ((data.discountAmount || 0) > 0) {
          doc.text('Discount:', 130, yPos + 15);
          doc.text(`-${formatPrice(data.discountAmount || 0)}`, 170, yPos + 15);
        }
        
        if ((data.tax || 0) > 0) {
          doc.text('Tax:', 130, yPos + 22);
          doc.text(formatPrice(data.tax || 0), 170, yPos + 22);
        }
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Total:', 130, yPos + 30);
        doc.text(formatPrice(data.total || 0), 170, yPos + 30);
        
        // Payment and delivery info
        yPos += 50;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Payment Method: ${(data.paymentMethod || 'N/A').replace('_', ' ').toUpperCase()}`, 20, yPos);
        doc.text(`Delivery Type: ${(data.deliveryType || 'N/A').replace('_', ' ').toUpperCase()}`, 20, yPos + 8);
        
        if (data.expectedDelivery) {
          doc.text(`Expected Delivery: ${data.expectedDelivery}`, 20, yPos + 16);
        }
        
        // Footer
        doc.setFillColor(primaryColor);
        doc.rect(0, 280, 210, 20, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('Thank you for your business!', 20, 290);
        doc.text('TSR Gallery - Premium Fashion E-commerce Platform', 20, 295);
        
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
