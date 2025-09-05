import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
};

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@nextecom.com';
const FROM_NAME = process.env.FROM_NAME || 'NextEcom';

export async function POST(request: NextRequest) {
  try {
    const { toEmail, subject, message } = await request.json();

    // Validate required fields
    if (!toEmail || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: toEmail, subject, message' },
        { status: 400 }
      );
    }

    // Check if SMTP credentials are configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json(
        { 
          error: 'SMTP credentials not configured',
          message: 'Please set SMTP_USER and SMTP_PASS in your .env.local file'
        },
        { status: 500 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport(EMAIL_CONFIG);

    // Verify connection
    await transporter.verify();

    // Email content
    const mailOptions = {
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: toEmail,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">🎉 NextEcom Test Email</h1>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #333;">Hello!</h2>
            <p style="color: #666; line-height: 1.6;">
              This is a test email from your NextEcom application to verify that the email system is working correctly.
            </p>
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Test Message:</h3>
              <p style="color: #666;">${message}</p>
            </div>
            <p style="color: #666;">
              If you received this email, it means your SMTP configuration is working correctly!
            </p>
            <div style="text-align: center; margin-top: 30px;">
              <a href="http://localhost:3001" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Visit NextEcom
              </a>
            </div>
          </div>
          <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">This is a test email from NextEcom - RabbitMQ Invoice Generation System</p>
          </div>
        </div>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully!',
      messageId: info.messageId,
      to: toEmail,
      subject: subject
    });

  } catch (error) {
    console.error('Email test failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error',
        message: 'Please check your SMTP configuration in .env.local'
      },
      { status: 500 }
    );
  }
}
