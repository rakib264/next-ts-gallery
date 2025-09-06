import emailService from './email';
import invoiceService, { InvoiceData } from './invoice';
import createLogger from './logger';
import { Event, EventType } from './rabbitmq';

// Configure Winston logger
const logger = createLogger('event-handlers');

// Admin email for notifications
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@nextecom.com';

export class EventHandlers {
  /**
   * Handle invoice generation events
   */
  static async handleInvoiceGeneration(event: Event): Promise<void> {
    try {
      logger.info('Processing invoice generation event', { eventId: event.id });

      if (event.type !== EventType.INVOICE_GENERATION) {
        throw new Error('Invalid event type for invoice generation handler');
      }

      const invoiceEvent = event as any; // Type assertion for now
      const orderData = invoiceEvent.orderData;

      // Prepare invoice data
      const invoiceData: InvoiceData = {
        orderId: orderData._id,
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

      // Generate invoice
      const invoicePath = await invoiceService.generateInvoice(invoiceData);
      
      // Update order with invoice URL
      const Order = (await import('./models/Order')).default;
      await Order.findByIdAndUpdate(orderData._id, { invoiceUrl: invoicePath });
      
      logger.info('Invoice generated successfully', { 
        orderId: orderData._id, 
        invoicePath 
      });

      // Send email if customer email exists (logged-in user)
      if (orderData.shippingAddress.email) {
        const emailSent = await emailService.sendInvoiceEmail(
          orderData.shippingAddress.email,
          orderData.shippingAddress.name,
          {
            orderNumber: orderData.orderNumber,
            orderDate: new Date(orderData.createdAt).toLocaleDateString(),
            total: new Intl.NumberFormat('en-BD', {
              style: 'currency',
              currency: 'BDT',
              minimumFractionDigits: 0
            }).format(orderData.total),
            paymentMethod: orderData.paymentMethod,
            deliveryType: orderData.deliveryType
          },
          invoicePath
        );

        if (emailSent) {
          logger.info('Invoice email sent successfully', { 
            orderId: orderData._id, 
            customerEmail: orderData.shippingAddress.email 
          });
        } else {
          logger.error('Failed to send invoice email', { 
            orderId: orderData._id, 
            customerEmail: orderData.shippingAddress.email 
          });
        }
      } else {
        logger.info('No customer email provided, invoice generated but not sent', { 
          orderId: orderData._id 
        });
      }

    } catch (error) {
      logger.error('Error processing invoice generation event:', error);
      throw error;
    }
  }

  /**
   * Handle low stock alert events
   */
  static async handleLowStockAlert(event: Event): Promise<void> {
    try {
      logger.info('Processing low stock alert event', { eventId: event.id });

      if (event.type !== EventType.LOW_STOCK_ALERT) {
        throw new Error('Invalid event type for low stock alert handler');
      }

      const stockEvent = event as any;
      
      // Send admin notification
      const emailSent = await emailService.sendAdminNotification(
        ADMIN_EMAIL,
        `Low Stock Alert - ${stockEvent.productName}`,
        `
          <h3>⚠️ Low Stock Alert</h3>
          <p>The following product is running low on stock:</p>
          <div style="background: #fef3c7; padding: 15px; border-radius: 5px; border-left: 4px solid #f59e0b;">
            <h4>${stockEvent.productName}</h4>
            <p><strong>Product ID:</strong> ${stockEvent.productId}</p>
            <p><strong>Current Stock:</strong> ${stockEvent.currentStock}</p>
            <p><strong>Threshold:</strong> ${stockEvent.threshold}</p>
          </div>
          <p>Please consider restocking this product to avoid stockouts.</p>
        `
      );

      if (emailSent) {
        logger.info('Low stock alert sent successfully', { 
          productId: stockEvent.productId 
        });
      } else {
        logger.error('Failed to send low stock alert', { 
          productId: stockEvent.productId 
        });
      }

    } catch (error) {
      logger.error('Error processing low stock alert event:', error);
      throw error;
    }
  }

  /**
   * Handle new customer registration events
   */
  static async handleNewCustomerRegistration(event: Event): Promise<void> {
    try {
      logger.info('Processing new customer registration event', { eventId: event.id });

      if (event.type !== EventType.NEW_CUSTOMER_REGISTRATION) {
        throw new Error('Invalid event type for new customer registration handler');
      }

      const customerEvent = event as any;
      
      // Send admin notification
      const emailSent = await emailService.sendAdminNotification(
        ADMIN_EMAIL,
        `New Customer Registration - ${customerEvent.customerName}`,
        `
          <h3>👤 New Customer Registration</h3>
          <div style="background: #eff6ff; padding: 15px; border-radius: 5px; border-left: 4px solid #3b82f6;">
            <h4>New Customer Details:</h4>
            <p><strong>Name:</strong> ${customerEvent.customerName}</p>
            <p><strong>Email:</strong> ${customerEvent.customerEmail}</p>
            <p><strong>Customer ID:</strong> ${customerEvent.customerId}</p>
            <p><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <p>A new customer has registered on your platform.</p>
        `
      );

      if (emailSent) {
        logger.info('New customer notification sent successfully', { 
          customerId: customerEvent.customerId 
        });
      } else {
        logger.error('Failed to send new customer notification', { 
          customerId: customerEvent.customerId 
        });
      }

    } catch (error) {
      logger.error('Error processing new customer registration event:', error);
      throw error;
    }
  }

  /**
   * Handle new product creation events
   */
  static async handleNewProductCreation(event: Event): Promise<void> {
    try {
      logger.info('Processing new product creation event', { eventId: event.id });

      if (event.type !== EventType.NEW_PRODUCT_CREATION) {
        throw new Error('Invalid event type for new product creation handler');
      }

      const productEvent = event as any;
      
      // Send admin notification
      const emailSent = await emailService.sendAdminNotification(
        ADMIN_EMAIL,
        `New Product Created - ${productEvent.productName}`,
        `
          <h3>🆕 New Product Created</h3>
          <div style="background: #ecfdf5; padding: 15px; border-radius: 5px; border-left: 4px solid #10b981;">
            <h4>Product Details:</h4>
            <p><strong>Name:</strong> ${productEvent.productName}</p>
            <p><strong>Product ID:</strong> ${productEvent.productId}</p>
            <p><strong>Created By:</strong> ${productEvent.adminId}</p>
            <p><strong>Creation Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <p>A new product has been added to your inventory.</p>
        `
      );

      if (emailSent) {
        logger.info('New product notification sent successfully', { 
          productId: productEvent.productId 
        });
      } else {
        logger.error('Failed to send new product notification', { 
          productId: productEvent.productId 
        });
      }

    } catch (error) {
      logger.error('Error processing new product creation event:', error);
      throw error;
    }
  }

  /**
   * Handle new order creation events
   */
  static async handleNewOrderCreation(event: Event): Promise<void> {
    try {
      logger.info('Processing new order creation event', { eventId: event.id });

      if (event.type !== EventType.NEW_ORDER_CREATION) {
        throw new Error('Invalid event type for new order creation handler');
      }

      const orderEvent = event as any;
      
      // Send admin notification
      const emailSent = await emailService.sendAdminNotification(
        ADMIN_EMAIL,
        `New Order Received - #${orderEvent.orderNumber}`,
        `
          <h3>🛒 New Order Received</h3>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; border-left: 4px solid #8b5cf6;">
            <h4>Order Details:</h4>
            <p><strong>Order Number:</strong> ${orderEvent.orderNumber}</p>
            <p><strong>Order ID:</strong> ${orderEvent.orderId}</p>
            <p><strong>Customer:</strong> ${orderEvent.customerEmail || 'Guest User'}</p>
            <p><strong>Email:</strong> ${orderEvent.customerEmail || 'N/A'}</p>
            <p><strong>Total Amount:</strong> ৳${orderEvent.total.toLocaleString()}</p>
            <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <p>A new order has been placed and requires processing.</p>
        `
      );

      if (emailSent) {
        logger.info('New order notification sent successfully', { 
          orderId: orderEvent.orderId 
        });
      } else {
        logger.error('Failed to send new order notification', { 
          orderId: orderEvent.orderId 
        });
      }

    } catch (error) {
      logger.error('Error processing new order creation event:', error);
      throw error;
    }
  }

  /**
   * Get handler for specific event type
   */
  static getHandler(eventType: EventType): (event: Event) => Promise<void> {
    switch (eventType) {
      case EventType.INVOICE_GENERATION:
        return this.handleInvoiceGeneration;
      case EventType.LOW_STOCK_ALERT:
        return this.handleLowStockAlert;
      case EventType.NEW_CUSTOMER_REGISTRATION:
        return this.handleNewCustomerRegistration;
      case EventType.NEW_PRODUCT_CREATION:
        return this.handleNewProductCreation;
      case EventType.NEW_ORDER_CREATION:
        return this.handleNewOrderCreation;
      default:
        throw new Error(`No handler found for event type: ${eventType}`);
    }
  }
}
