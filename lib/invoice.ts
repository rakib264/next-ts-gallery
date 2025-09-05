import fs from 'fs/promises';
import path from 'path';
import * as puppeteer from 'puppeteer';
import winston from 'winston';

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'invoice-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/invoice-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/invoice-combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

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

class InvoiceService {
  private browser: puppeteer.Browser | null = null;

  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Puppeteer browser...');
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      logger.info('Puppeteer browser initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Puppeteer browser:', error);
      throw error;
    }
  }

  private generateInvoiceHTML(data: InvoiceData): string {
    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('en-BD', {
        style: 'currency',
        currency: 'BDT',
        minimumFractionDigits: 0
      }).format(price);
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice - ${data.orderNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
          }
          
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #3949AB;
            padding-bottom: 20px;
          }
          
          .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #3949AB;
            margin-bottom: 10px;
          }
          
          .company-tagline {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
          }
          
          .invoice-title {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin: 20px 0;
          }
          
          .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            flex-wrap: wrap;
          }
          
          .invoice-info, .customer-info {
            flex: 1;
            min-width: 300px;
          }
          
          .info-group {
            margin-bottom: 15px;
          }
          
          .info-label {
            font-weight: bold;
            color: #555;
            font-size: 14px;
            margin-bottom: 5px;
          }
          
          .info-value {
            color: #333;
            font-size: 16px;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
          }
          
          .items-table th {
            background: #f8f9fa;
            padding: 15px 10px;
            text-align: left;
            font-weight: bold;
            color: #333;
            border-bottom: 2px solid #dee2e6;
          }
          
          .items-table td {
            padding: 15px 10px;
            border-bottom: 1px solid #dee2e6;
            vertical-align: top;
          }
          
          .item-image {
            width: 50px;
            height: 50px;
            object-fit: cover;
            border-radius: 4px;
          }
          
          .item-details {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .item-name {
            font-weight: 500;
            margin-bottom: 5px;
          }
          
          .item-variant {
            font-size: 12px;
            color: #666;
          }
          
          .text-right {
            text-align: right;
          }
          
          .text-center {
            text-align: center;
          }
          
          .summary {
            margin-top: 30px;
            border-top: 2px solid #dee2e6;
            padding-top: 20px;
          }
          
          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 16px;
          }
          
          .summary-row.total {
            font-size: 20px;
            font-weight: bold;
            color: #3949AB;
            border-top: 2px solid #3949AB;
            padding-top: 10px;
            margin-top: 10px;
          }
          
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 14px;
            border-top: 1px solid #dee2e6;
            padding-top: 20px;
          }
          
          .notes {
            margin-top: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 5px;
            border-left: 4px solid #3949AB;
          }
          
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="company-name">${process.env.NEXT_PUBLIC_SITE_NAME || 'TSR Gallery'}</div>
            <div class="company-tagline">${process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Your Trusted Online Shopping Destination'}</div>
            <div class="company-tagline">Email: ${process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@tsrgallery.com'} | Phone: ${process.env.NEXT_PUBLIC_CONTACT_PHONE || '8801828123264'}</div>
          </div>
          
          <div class="invoice-title">INVOICE</div>
          
          <div class="invoice-details">
            <div class="invoice-info">
              <div class="info-group">
                <div class="info-label">Invoice Number:</div>
                <div class="info-value">${data.orderNumber}</div>
              </div>
              <div class="info-group">
                <div class="info-label">Order Date:</div>
                <div class="info-value">${formatDate(data.orderDate)}</div>
              </div>
              <div class="info-group">
                <div class="info-label">Payment Method:</div>
                <div class="info-value">${data.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</div>
              </div>
              <div class="info-group">
                <div class="info-label">Delivery Type:</div>
                <div class="info-value">${data.deliveryType.replace('-', ' ')}</div>
              </div>
              ${data.expectedDelivery ? `
              <div class="info-group">
                <div class="info-label">Expected Delivery:</div>
                <div class="info-value">${formatDate(data.expectedDelivery)}</div>
              </div>
              ` : ''}
            </div>
            
            <div class="customer-info">
              <div class="info-group">
                <div class="info-label">Bill To:</div>
                <div class="info-value">${data.customerName}</div>
              </div>
              ${data.customerEmail ? `
              <div class="info-group">
                <div class="info-label">Email:</div>
                <div class="info-value">${data.customerEmail}</div>
              </div>
              ` : ''}
              <div class="info-group">
                <div class="info-label">Phone:</div>
                <div class="info-value">${data.customerPhone}</div>
              </div>
              <div class="info-group">
                <div class="info-label">Address:</div>
                <div class="info-value">
                  ${data.shippingAddress.street}<br>
                  ${data.shippingAddress.city}, ${data.shippingAddress.district}<br>
                  ${data.shippingAddress.division}
                  ${data.shippingAddress.postalCode ? `<br>${data.shippingAddress.postalCode}` : ''}
                </div>
              </div>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th class="text-center">Quantity</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${data.items.map(item => `
                <tr>
                  <td>
                    <div class="item-details">
                      ${item.image ? `<img src="${item.image}" alt="${item.name}" class="item-image">` : ''}
                      <div>
                        <div class="item-name">${item.name}</div>
                        ${item.variant ? `<div class="item-variant">Variant: ${item.variant}</div>` : ''}
                      </div>
                    </div>
                  </td>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-right">${formatPrice(item.price)}</td>
                  <td class="text-right">${formatPrice(item.price * item.quantity)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="summary">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>${formatPrice(data.subtotal)}</span>
            </div>
            <div class="summary-row">
              <span>Shipping:</span>
              <span>${formatPrice(data.shippingCost)}</span>
            </div>
            <div class="summary-row">
              <span>Tax:</span>
              <span>${formatPrice(data.tax)}</span>
            </div>
            ${data.discountAmount > 0 ? `
            <div class="summary-row">
              <span>Discount:</span>
              <span style="color: #3949AB;">-${formatPrice(data.discountAmount)}</span>
            </div>
            ` : ''}
            <div class="summary-row total">
              <span>Total:</span>
              <span>${formatPrice(data.total)}</span>
            </div>
          </div>
          
          ${data.notes ? `
          <div class="notes">
            <strong>Order Notes:</strong><br>
            ${data.notes}
          </div>
          ` : ''}
          
          <div class="footer">
            <p>Thank you for your purchase! We appreciate your business.</p>
            <p>For any questions or concerns, please contact our customer support.</p>
            <p>© ${new Date().getFullYear()} ${process.env.NEXT_PUBLIC_SITE_NAME || 'TSR Gallery'}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async generateInvoice(data: InvoiceData): Promise<string> {
    try {
      if (!this.browser) {
        await this.initialize();
      }

      if (!this.browser) {
        throw new Error('Browser not initialized');
      }

      logger.info(`Generating invoice for order ${data.orderNumber}`, { orderId: data.orderId });

      const page = await this.browser.newPage();
      
      // Generate HTML content
      const htmlContent = this.generateInvoiceHTML(data);
      
      // Set content and wait for network idle
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      // Ensure images are loaded
      await page.evaluate(() => {
        return Promise.all(
          Array.from(document.images)
            .filter(img => !img.complete)
            .map(img => new Promise(resolve => {
              img.onload = img.onerror = resolve;
            }))
        );
      });

      // Create invoices directory if it doesn't exist
      const invoicesDir = path.join(process.cwd(), 'public', 'invoices');
      await fs.mkdir(invoicesDir, { recursive: true });

      // Generate unique filename
      const filename = `invoice-${data.orderNumber}-${Date.now()}.pdf`;
      const filepath = path.join(invoicesDir, filename);

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        }
      });

      // Save PDF to file
      await fs.writeFile(filepath, pdfBuffer);
      
      // Close the page
      await page.close();

      const relativePath = `/invoices/${filename}`;
      
      logger.info(`Invoice generated successfully for order ${data.orderNumber}`, { 
        orderId: data.orderId, 
        filepath: relativePath 
      });

      return relativePath;

    } catch (error) {
      logger.error(`Error generating invoice for order ${data.orderNumber}:`, error);
      throw error;
    }
  }

  async close(): Promise<void> {
    try {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        logger.info('Invoice service browser closed');
      }
    } catch (error) {
      logger.error('Error closing invoice service browser:', error);
    }
  }
}

// Create singleton instance
const invoiceService = new InvoiceService();

export default invoiceService;
