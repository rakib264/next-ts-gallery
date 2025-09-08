import { jsPDF } from 'jspdf';
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
        doc.rect(0, 0, 210, 50, 'F');
        
        // Add logo placeholder (you can replace this with actual logo implementation)
        // For now, we'll use a stylized company initial
        doc.setFillColor(whiteColor);
        doc.circle(30, 25, 8, 'F');
        doc.setTextColor(primaryColor);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('TSR', 26, 28);
        
        // Company name with better positioning
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.text('TSR Gallery', 45, 28);
        
        // Tagline with better spacing
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Premium Fashion E-commerce Platform', 20, 38);
        doc.text('Email: support@tsrgallery.com | Phone: +8801828123264', 20, 45);
        
        // Invoice title - WHITE TEXT for visibility
        doc.setTextColor(255, 255, 255); // Changed to white
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('INVOICE', 150, 28);
        
        // Invoice number and date - WHITE TEXT for visibility
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Invoice #: ${data.orderNumber}`, 150, 37);
        doc.text(`Date: ${formatDate(data.invoiceGeneratedAt || data.createdAt)}`, 150, 44);
        
        // Customer information section - Improved Bill To
        let yPos = 65;
        doc.setFillColor(lightGray);
        doc.rect(20, yPos, 80, 35, 'F'); // Adjusted width and height
        
        doc.setTextColor(textColor);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Bill To:', 25, yPos + 10);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        // Use shippingAddress data as requested
        doc.text(data.shippingAddress?.name || 'Customer', 25, yPos + 18);
        doc.text(data.shippingAddress?.email || 'N/A', 25, yPos + 25);
        doc.text(data.shippingAddress?.phone || 'N/A', 25, yPos + 32);
        
        // Shipping address - Improved Ship To with coordinates data
        doc.setFillColor(lightGray);
        doc.rect(110, yPos, 80, 35, 'F'); // Positioned next to Bill To
        
        doc.setTextColor(textColor);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Ship To:', 115, yPos + 10);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        // Format address with coordinates data as requested
        const street = data.shippingAddress?.street || '';
        const placeName = data.shippingAddress?.coordinates?.placeName || '';
        const district = data.shippingAddress?.coordinates?.district || data.shippingAddress?.district || '';
        const divisionName = data.shippingAddress?.coordinates?.divisionName || data.shippingAddress?.division || '';
        const postalCode = data.shippingAddress?.postalCode || '';
        
        // Example: "Road 2, New Market TSO, Dhaka, Dhaka, 1209"
        const fullAddress = `${street}${placeName ? ', ' + placeName : ''}${district ? ', ' + district : ''}${divisionName ? ', ' + divisionName : ''}${postalCode ? ', ' + postalCode : ''}`;
        
        // Split address into multiple lines if too long
        const addressLines = doc.splitTextToSize(fullAddress, 70);
        let addressYPos = yPos + 18;
        addressLines.forEach((line: string) => {
          if (addressYPos < yPos + 32) {
            doc.text(line, 115, addressYPos);
            addressYPos += 7;
          }
        });
        
        // Items table header - Improved design
        yPos += 50;
        doc.setFillColor(secondaryColor);
        doc.rect(20, yPos, 170, 15, 'F'); // Increased height
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Item', 25, yPos + 10);
        doc.text('Qty', 125, yPos + 10);
        doc.text('Price', 145, yPos + 10);
        doc.text('Total', 170, yPos + 10);
        
        // Items - Improved layout with better spacing
        yPos += 20;
        doc.setTextColor(textColor);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        (data.items || []).forEach((item, index) => {
          if (yPos > 240) {
            doc.addPage();
            yPos = 30;
          }
          
          // Add alternating row background
          if (index % 2 === 0) {
            doc.setFillColor('#f9f9f9');
            doc.rect(20, yPos - 3, 170, 12, 'F');
          }
          
          // Item name with text wrapping
          const itemName = item.name || 'Unknown Item';
          const wrappedText = doc.splitTextToSize(itemName, 90);
          doc.text(wrappedText[0], 25, yPos + 3);
          
          // Aligned columns
          doc.text((item.quantity || 0).toString(), 125, yPos + 3, { align: 'center' });
          doc.text(formatPrice(item.price || 0), 145, yPos + 3, { align: 'right' });
          doc.text(formatPrice((item.price || 0) * (item.quantity || 0)), 185, yPos + 3, { align: 'right' });
          
          yPos += 15;
        });
        
        // Totals section - Improved design with better spacing and highlighting
        yPos += 15;
        const totalsHeight = (data.discountAmount > 0 ? 50 : 45) + (data.tax > 0 ? 8 : 0);
        doc.setFillColor(lightGray);
        doc.rect(110, yPos, 80, totalsHeight, 'F');
        
        doc.setTextColor(textColor);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        
        let totalsYPos = yPos + 12;
        doc.text('Subtotal:', 115, totalsYPos);
        doc.text(formatPrice(data.subtotal || 0), 185, totalsYPos, { align: 'right' });
        
        totalsYPos += 8;
        doc.text('Shipping:', 115, totalsYPos);
        doc.text(formatPrice(data.shippingCost || 0), 185, totalsYPos, { align: 'right' });
        
        if ((data.tax || 0) > 0) {
          totalsYPos += 8;
          const taxLabel = data.taxRate ? `Tax (${data.taxRate}%):` : 'Tax:';
          doc.text(taxLabel, 115, totalsYPos);
          doc.text(formatPrice(data.tax || 0), 185, totalsYPos, { align: 'right' });
        }
        
        if ((data.discountAmount || 0) > 0) {
          totalsYPos += 8;
          doc.setTextColor('#4CAF50'); // Green for discount
          doc.text('Discount:', 115, totalsYPos);
          doc.text(`-${formatPrice(data.discountAmount || 0)}`, 185, totalsYPos, { align: 'right' });
          doc.setTextColor(textColor);
        }
        
        // Total with highlighting
        totalsYPos += 12;
        doc.setFillColor(primaryColor);
        doc.rect(110, totalsYPos - 5, 80, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('TOTAL:', 115, totalsYPos + 3);
        doc.text(formatPrice(data.total || 0), 185, totalsYPos + 3, { align: 'right' });
        
        yPos = totalsYPos + 15;
        
        // Payment and delivery info - Improved layout
        yPos += 20;
        doc.setTextColor(textColor);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        
        // Payment method formatting
        const paymentMethodText = data.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 
                                 data.paymentMethod === 'online' ? 'Online Payment' :
                                 (data.paymentMethod || 'N/A').replace('_', ' ').toUpperCase();
        doc.text(`Payment Method: ${paymentMethodText}`, 20, yPos);
        
        // Delivery type formatting
        const deliveryTypeText = (data.deliveryType || 'N/A').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        doc.text(`Delivery Type: ${deliveryTypeText}`, 20, yPos + 10);
        
        if (data.expectedDelivery) {
          doc.text(`Expected Delivery: ${formatDate(data.expectedDelivery)}`, 20, yPos + 20);
          yPos += 10;
        }
        
        if (data.notes) {
          yPos += 15;
          doc.setFont('helvetica', 'bold');
          doc.text('Order Notes:', 20, yPos);
          doc.setFont('helvetica', 'normal');
          const noteLines = doc.splitTextToSize(data.notes, 170);
          yPos += 8;
          noteLines.forEach((line: string) => {
            doc.text(line, 20, yPos);
            yPos += 6;
          });
        }
        
        // Footer - Professional and elegant
        const footerY = Math.max(yPos + 30, 270);
        doc.setFillColor(primaryColor);
        doc.rect(0, footerY, 210, 25, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Thank you for choosing TSR Gallery!', 20, footerY + 10);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Your trusted premium fashion e-commerce platform', 20, footerY + 17);
        doc.text(`© ${new Date().getFullYear()} TSR Gallery. All rights reserved.`, 20, footerY + 22);
        
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
