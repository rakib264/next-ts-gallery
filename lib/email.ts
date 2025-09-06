import fs from 'fs/promises';
import nodemailer from 'nodemailer';
import path from 'path';
import createLogger from './logger';
import IntegrationSettings from './models/IntegrationSettings';
import connectDB from './mongodb';
import { EmailTemplates } from './templates/email-templates';
import { EmailTemplateData } from './types/email-settings';
import { getEmailSettings } from './utils/email-settings';

// Configure Winston logger
const logger = createLogger('email-service');

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
};

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@tsrgallery.com';
const FROM_NAME = process.env.FROM_NAME || 'TSR Gallery';

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  async initialize(): Promise<void> {
    try {
      // Try to get settings from database first
      try {
        await connectDB();
        const settings = await IntegrationSettings.findOne();
        
        if (settings && settings.emailEnabled && settings.smtpHost && settings.smtpUser) {
          const dbConfig = {
            host: settings.smtpHost,
            port: settings.smtpPort,
            secure: settings.smtpPort === 465,
            auth: {
              user: settings.smtpUser,
              pass: settings.smtpPassword
            }
          };
          this.transporter = nodemailer.createTransport(dbConfig);
        } else {
          // Check if essential SMTP config is available
          if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
            logger.warn('SMTP configuration is incomplete. Email services will be disabled.');
            logger.warn('Missing SMTP_USER or SMTP_PASS environment variables.');
            logger.warn('Please configure SMTP in admin settings or set environment variables.');
            return; // Don't throw error, just disable email service
          }
          
          this.transporter = nodemailer.createTransport(EMAIL_CONFIG);
        }
      } catch (dbError) {
        // Check if essential SMTP config is available
        if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
          logger.warn('SMTP configuration is incomplete. Email services will be disabled.');
          logger.warn('Missing SMTP_USER or SMTP_PASS environment variables.');
          logger.warn('Please configure SMTP in admin settings or set environment variables.');
          return; // Don't throw error, just disable email service
        }
        
        this.transporter = nodemailer.createTransport(EMAIL_CONFIG);
      }

      if (this.transporter) {
        await this.transporter.verify();
      }
      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
      throw error;
    }
  }

  async sendInvoiceEmail(
    toEmail: string,
    customerName: string,
    orderData: {
      orderNumber: string;
      orderDate: string;
      total: string;
      paymentMethod: string;
      deliveryType: string;
    },
    invoicePath: string
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        await this.initialize();
      }

      if (!this.transporter) {
        logger.warn('Email transporter not initialized. Skipping invoice email.');
        return false;
      }

      // Get dynamic email settings
      const emailSettings = await getEmailSettings();

      // Prepare template data
      const templateData: EmailTemplateData = {
        ...emailSettings,
        customerName,
        orderNumber: orderData.orderNumber,
        orderDate: orderData.orderDate,
        total: orderData.total,
        paymentMethod: orderData.paymentMethod,
        deliveryType: orderData.deliveryType
      };

      // Read invoice file
      const invoiceFilePath = path.join(process.cwd(), 'public', invoicePath);
      const invoiceBuffer = await fs.readFile(invoiceFilePath);

      const mailOptions = {
        from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to: toEmail,
        subject: `Invoice for Order ${orderData.orderNumber} - ${emailSettings.siteName}`,
        html: EmailTemplates.generateInvoiceEmail(templateData),
        attachments: [
          {
            filename: `invoice-${orderData.orderNumber}.pdf`,
            content: invoiceBuffer,
            contentType: 'application/pdf'
          }
        ]
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info(`Invoice email sent successfully to ${toEmail}`, {
        orderNumber: orderData.orderNumber,
        messageId: result.messageId
      });

      return true;
    } catch (error) {
      logger.error(`Error sending invoice email to ${toEmail}:`, error);
      return false;
    }
  }

  async sendOrderConfirmation(
    toEmail: string,
    customerName: string,
    orderDetails: {
      orderNumber: string;
      orderDate: string;
      total: string;
      paymentMethod: string;
      deliveryType: string;
      items: Array<{ name: string; quantity: number; price: number }>;
    }
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        await this.initialize();
      }

      if (!this.transporter) {
        logger.warn('Email transporter not initialized. Skipping email.');
        return false;
      }

      // Get dynamic email settings
      const emailSettings = await getEmailSettings();

      // Prepare template data
      const templateData: EmailTemplateData = {
        ...emailSettings,
        customerName,
        orderNumber: orderDetails.orderNumber,
        orderDate: orderDetails.orderDate,
        total: orderDetails.total,
        paymentMethod: orderDetails.paymentMethod,
        deliveryType: orderDetails.deliveryType,
        items: orderDetails.items
      };

      const mailOptions = {
        from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to: toEmail,
        subject: `Order Confirmation - ${orderDetails.orderNumber} - ${emailSettings.siteName}`,
        html: EmailTemplates.generateOrderConfirmationEmail(templateData)
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info(`Order confirmation sent successfully to ${toEmail}`, {
        orderNumber: orderDetails.orderNumber,
        messageId: result.messageId
      });

      return true;
    } catch (error) {
      logger.error(`Error sending order confirmation to ${toEmail}:`, error);
      return false;
    }
  }

  async sendContactFormEmail(
    toEmail: string,
    replyEmail: string,
    payload: { name: string; email: string; subject: string; message: string },
    branding?: { siteName?: string; logoUrl?: string; primaryColor?: string; secondaryColor?: string }
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        await this.initialize();
      }

      if (!this.transporter) {
        logger.warn('Email transporter not initialized. Skipping email.');
        return false;
      }

      // Get dynamic email settings
      const emailSettings = await getEmailSettings();

      // Override with provided branding if available
      const siteName = branding?.siteName || emailSettings.siteName;
      const logoUrl = branding?.logoUrl || emailSettings.logo;
      const primary = branding?.primaryColor || emailSettings.primaryColor;
      const secondary = branding?.secondaryColor || emailSettings.secondaryColor;

      // Prepare template data
      const templateData = {
        ...emailSettings,
        siteName,
        logo: logoUrl,
        primaryColor: primary,
        secondaryColor: secondary,
        senderName: payload.name,
        senderEmail: payload.email,
        message: payload.message
      };

      const html = EmailTemplates.generateContactFormEmail(templateData);

      const mailOptions: nodemailer.SendMailOptions = {
        from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to: toEmail,
        subject: `[${siteName}] ${payload.subject}`,
        html,
        replyTo: `${payload.name} <${replyEmail}>`
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Contact form email sent successfully to ${toEmail}`, {
        messageId: result.messageId
      });
      return true;
    } catch (error) {
      logger.error(`Error sending contact form email to ${toEmail}:`, error);
      return false;
    }
  }

  async sendAdminNotification(
    toEmail: string,
    subject: string,
    content: string
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        await this.initialize();
      }

      if (!this.transporter) {
        logger.warn('Email transporter not initialized. Skipping email.');
        return false;
      }

      // Get dynamic email settings
      const emailSettings = await getEmailSettings();

      // Prepare template data
      const templateData: EmailTemplateData = {
        ...emailSettings,
        subject,
        content
      };

      const mailOptions = {
        from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to: toEmail,
        subject: `[${emailSettings.siteName}] ${subject}`,
        html: EmailTemplates.generateAdminNotificationEmail(templateData)
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info(`Admin notification sent successfully to ${toEmail}`, {
        subject,
        messageId: result.messageId
      });

      return true;
    } catch (error) {
      logger.error(`Error sending admin notification to ${toEmail}:`, error);
      return false;
    }
  }

  async sendOTPEmail(
    toEmail: string,
    otp: string,
    userName: string,
    type: 'password_reset' | 'email_verification' = 'password_reset'
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        await this.initialize();
      }

      if (!this.transporter) {
        logger.error('Email transporter not initialized');
        throw new Error('Email transporter not initialized');
      }

      // Get dynamic email settings
      const emailSettings = await getEmailSettings();

      const subject = type === 'password_reset' 
        ? `Password Reset Verification Code - ${emailSettings.siteName}` 
        : `Email Verification Code - ${emailSettings.siteName}`;

      // Prepare template data
      const templateData: EmailTemplateData & {
        userName: string;
        otp: string;
        type: 'password_reset' | 'email_verification';
      } = {
        ...emailSettings,
        userName,
        otp,
        type
      };

      const mailOptions = {
        from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to: toEmail,
        subject,
        html: EmailTemplates.generateOTPEmail(templateData)
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info(`OTP email sent successfully to ${toEmail}`, {
        type,
        messageId: result.messageId
      });

      return true;
    } catch (error) {
      logger.error(`Error sending OTP email to ${toEmail}:`, error);
      return false;
    }
  }

  async sendReturnExchangeConfirmation(
    toEmail: string,
    customerName: string,
    requestData: {
      requestId: string;
      orderId: string;
      type: 'return' | 'exchange';
      products: Array<{
        productName: string;
        quantity: number;
        variant?: string;
        reason: string;
      }>;
    }
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        await this.initialize();
      }

      if (!this.transporter) {
        logger.warn('Email transporter not initialized. Skipping email.');
        return false;
      }

      // Get dynamic email settings
      const emailSettings = await getEmailSettings();

      // Prepare template data
      const templateData: EmailTemplateData & {
        requestId: string;
        orderId: string;
        type: 'return' | 'exchange';
        products: Array<{
          productName: string;
          quantity: number;
          variant?: string;
          reason: string;
        }>;
      } = {
        ...emailSettings,
        customerName,
        requestId: requestData.requestId,
        orderId: requestData.orderId,
        type: requestData.type,
        products: requestData.products
      };

      const typeText = requestData.type === 'return' ? 'Return' : 'Exchange';

      const mailOptions = {
        from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to: toEmail,
        subject: `${typeText} Request Confirmation - ${requestData.requestId} - ${emailSettings.siteName}`,
        html: EmailTemplates.generateReturnExchangeConfirmationEmail(templateData)
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info(`${typeText} confirmation email sent successfully to ${toEmail}`, {
        requestId: requestData.requestId,
        messageId: result.messageId
      });

      return true;
    } catch (error) {
      logger.error(`Error sending ${requestData.type} confirmation email to ${toEmail}:`, error);
      return false;
    }
  }

  async sendReturnExchangeStatusUpdate(
    toEmail: string,
    customerName: string,
    requestData: {
      requestId: string;
      orderId: string;
      type: 'return' | 'exchange';
      status: 'approved' | 'rejected' | 'resolved';
      adminNotes?: string;
      resolutionNotes?: string;
    }
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        await this.initialize();
      }

      if (!this.transporter) {
        logger.warn('Email transporter not initialized. Skipping email.');
        return false;
      }

      // Get dynamic email settings
      const emailSettings = await getEmailSettings();

      // Prepare template data
      const templateData: EmailTemplateData & {
        requestId: string;
        orderId: string;
        type: 'return' | 'exchange';
        status: 'approved' | 'rejected' | 'resolved';
        adminNotes?: string;
        resolutionNotes?: string;
      } = {
        ...emailSettings,
        customerName,
        requestId: requestData.requestId,
        orderId: requestData.orderId,
        type: requestData.type,
        status: requestData.status,
        adminNotes: requestData.adminNotes,
        resolutionNotes: requestData.resolutionNotes
      };

      const typeText = requestData.type === 'return' ? 'Return' : 'Exchange';
      const statusText = requestData.status.charAt(0).toUpperCase() + requestData.status.slice(1);

      const mailOptions = {
        from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to: toEmail,
        subject: `${typeText} Request ${statusText} - ${requestData.requestId} - ${emailSettings.siteName}`,
        html: EmailTemplates.generateReturnExchangeStatusUpdateEmail(templateData)
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info(`${typeText} status update email sent successfully to ${toEmail}`, {
        requestId: requestData.requestId,
        status: requestData.status,
        messageId: result.messageId
      });

      return true;
    } catch (error) {
      logger.error(`Error sending ${requestData.type} status update email to ${toEmail}:`, error);
      return false;
    }
  }

  async close(): Promise<void> {
    try {
      if (this.transporter) {
        await this.transporter.close();
        this.transporter = null;
        logger.info('Email service closed');
      }
    } catch (error) {
      logger.error('Error closing email service:', error);
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

export default emailService;
