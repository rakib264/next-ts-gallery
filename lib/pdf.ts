import fs from 'fs/promises';
import path from 'path';
import * as puppeteer from 'puppeteer';
import createLogger from './logger';

// Configure Winston logger
const logger = createLogger('pdf-service');

// Invoice data interface (same as the original)
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

class PDFService {
  private browser: puppeteer.Browser | null = null;

  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Puppeteer browser...');
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
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
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
            font-size: 32px;
            font-weight: bold;
            color: #3949AB;
            margin-bottom: 10px;
          }
          
          .company-tagline {
            font-size: 16px;
            color: #666;
            margin-bottom: 5px;
          }
          
          .invoice-title {
            font-size: 28px;
            font-weight: bold;
            color: #333;
            margin: 30px 0 20px 0;
          }
          
          .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
            gap: 40px;
          }
          
          .invoice-info, .customer-info {
            flex: 1;
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
            line-height: 1.4;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          
          .items-table th {
            background: linear-gradient(135deg, #3949AB 0%, #5C6BC0 100%);
            color: white;
            padding: 16px 12px;
            text-align: left;
            font-weight: bold;
            font-size: 14px;
            border-bottom: 2px solid #303F9F;
          }
          
          .items-table td {
            padding: 16px 12px;
            border-bottom: 1px solid #e0e0e0;
            vertical-align: top;
          }
          
          .items-table tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          
          .item-image {
            width: 50px;
            height: 50px;
            object-fit: cover;
            border-radius: 6px;
            border: 1px solid #e0e0e0;
          }
          
          .item-details {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .item-name {
            font-weight: 600;
            margin-bottom: 4px;
            color: #333;
          }
          
          .item-variant {
            font-size: 13px;
            color: #666;
            font-style: italic;
          }
          
          .text-right {
            text-align: right;
          }
          
          .text-center {
            text-align: center;
          }
          
          .summary {
            margin-top: 40px;
            border-top: 2px solid #3949AB;
            padding-top: 20px;
          }
          
          .summary-table {
            width: 100%;
            max-width: 400px;
            margin-left: auto;
          }
          
          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            font-size: 16px;
            padding: 8px 0;
          }
          
          .summary-row.total {
            font-size: 22px;
            font-weight: bold;
            color: #3949AB;
            border-top: 2px solid #3949AB;
            padding-top: 15px;
            margin-top: 15px;
          }
          
          .summary-row.discount {
            color: #4CAF50;
            font-weight: 600;
          }
          
          .footer {
            margin-top: 50px;
            text-align: center;
            color: #666;
            font-size: 14px;
            border-top: 1px solid #e0e0e0;
            padding-top: 30px;
          }
          
          .footer p {
            margin-bottom: 8px;
          }
          
          .notes {
            margin-top: 30px;
            padding: 20px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 8px;
            border-left: 4px solid #3949AB;
          }
          
          .notes h4 {
            color: #3949AB;
            margin-bottom: 10px;
          }
          
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
            .invoice-container {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="company-name">TSR Gallery</div>
            <div class="company-tagline">Your Trusted Online Shopping Destination</div>
            <div class="company-tagline">Email: support@tsrgallery.com | Phone: +8801828123264</div>
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
                <div class="info-value">${data.deliveryType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
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
                <div class="info-label">Shipping Address:</div>
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
                <th style="width: 50%;">Item</th>
                <th class="text-center" style="width: 15%;">Quantity</th>
                <th class="text-right" style="width: 17.5%;">Unit Price</th>
                <th class="text-right" style="width: 17.5%;">Total</th>
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
            <div class="summary-table">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>${formatPrice(data.subtotal)}</span>
              </div>
              <div class="summary-row">
                <span>Shipping:</span>
                <span>${formatPrice(data.shippingCost)}</span>
              </div>
              <div class="summary-row">
                <span>Tax (5%):</span>
                <span>${formatPrice(data.tax)}</span>
              </div>
              ${data.discountAmount > 0 ? `
              <div class="summary-row discount">
                <span>Discount:</span>
                <span>-${formatPrice(data.discountAmount)}</span>
              </div>
              ` : ''}
              <div class="summary-row total">
                <span>Total:</span>
                <span>${formatPrice(data.total)}</span>
              </div>
            </div>
          </div>
          
          ${data.notes ? `
          <div class="notes">
            <h4>Order Notes:</h4>
            <p>${data.notes}</p>
          </div>
          ` : ''}
          
          <div class="footer">
            <p><strong>Thank you for your purchase!</strong></p>
            <p>We appreciate your business and trust in TSR Gallery.</p>
            <p>For any questions or concerns, please contact our customer support.</p>
            <p style="margin-top: 20px;">© ${new Date().getFullYear()} TSR Gallery. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async generateInvoice(orderData: any): Promise<string> {
    try {
      if (!this.browser) {
        await this.initialize();
      }

      if (!this.browser) {
        throw new Error('Browser not initialized');
      }

      logger.info(`Generating invoice for order ${orderData.orderNumber}`, { 
        orderId: orderData._id || orderData.orderId 
      });

      const page = await this.browser.newPage();
      
      // Prepare invoice data
      const invoiceData: InvoiceData = {
        orderId: orderData._id || orderData.orderId,
        orderNumber: orderData.orderNumber,
        customerName: orderData.shippingAddress.name,
        customerEmail: orderData.shippingAddress.email,
        customerPhone: orderData.shippingAddress.phone,
        shippingAddress: {
          street: orderData.shippingAddress.street,
          city: orderData.shippingAddress.city,
          district: orderData.shippingAddress.district,
          division: orderData.shippingAddress.division,
          postalCode: orderData.shippingAddress.postalCode
        },
        items: orderData.items.map((item: any) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          variant: item.variant,
          image: item.image
        })),
        subtotal: orderData.subtotal,
        shippingCost: orderData.shippingCost,
        tax: orderData.tax || 0,
        discountAmount: orderData.discountAmount || 0,
        total: orderData.total,
        paymentMethod: orderData.paymentMethod,
        deliveryType: orderData.deliveryType,
        orderDate: orderData.createdAt,
        expectedDelivery: orderData.expectedDelivery,
        notes: orderData.notes
      };
      
      // Generate HTML content
      const htmlContent = this.generateInvoiceHTML(invoiceData);
      
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
      const filename = `invoice-${invoiceData.orderNumber}-${Date.now()}.pdf`;
      const filepath = path.join(invoicesDir, filename);

      // Generate PDF with better quality settings
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      });

      // Save PDF to file
      await fs.writeFile(filepath, pdfBuffer);
      
      // Close the page
      await page.close();

      const relativePath = `/invoices/${filename}`;
      
      logger.info(`Invoice generated successfully for order ${invoiceData.orderNumber}`, { 
        orderId: invoiceData.orderId, 
        filepath: relativePath 
      });

      return relativePath;

    } catch (error) {
      logger.error(`Error generating invoice for order:`, error);
      throw error;
    }
  }

  async close(): Promise<void> {
    try {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        logger.info('PDF service browser closed');
      }
    } catch (error) {
      logger.error('Error closing PDF service browser:', error);
    }
  }
}

// Create singleton instance
const pdfService = new PDFService();

export default pdfService;
