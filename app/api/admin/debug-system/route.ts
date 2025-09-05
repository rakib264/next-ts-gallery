import { auth } from '@/lib/auth';
import rabbitMQService from '@/lib/rabbitmq';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !['admin', 'manager'].includes(session.user?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const systemStatus = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        rabbitmqUrl: process.env.RABBITMQ_URL ? 'Set' : 'Not Set',
        smtpHost: process.env.SMTP_HOST || 'Not Set',
        smtpUser: process.env.SMTP_USER ? 'Set' : 'Not Set',
        smtpPass: process.env.SMTP_PASS ? 'Set' : 'Not Set',
        fromEmail: process.env.FROM_EMAIL || 'Not Set',
        adminEmail: process.env.ADMIN_EMAIL || 'Not Set',
        smsApiKey: process.env.SMS_API_KEY ? 'Set' : 'Not Set',
        smsApiBaseUrl: process.env.SMS_API_BASE_URL || 'Not Set',
        smsSenderId: process.env.SMS_SENDER_ID || 'Not Set'
      },
      services: {
        rabbitmq: {
          isReady: rabbitMQService.isReady(),
          status: rabbitMQService.isReady() ? 'Connected' : 'Disconnected'
        },
        email: {
          configured: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
          status: (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) ? 'Configured' : 'Not Configured'
        },
        sms: {
          configured: !!(process.env.SMS_API_KEY && process.env.SMS_API_BASE_URL),
          status: (process.env.SMS_API_KEY && process.env.SMS_API_BASE_URL) ? 'Configured' : 'Not Configured'
        }
      },
      recommendations: [] as string[]
    };

    // Add recommendations based on missing configurations
    if (!systemStatus.services.rabbitmq.isReady) {
      systemStatus.recommendations.push('RabbitMQ is not connected. Check RABBITMQ_URL and ensure RabbitMQ server is running.');
    }

    if (!systemStatus.services.email.configured) {
      systemStatus.recommendations.push('Email service is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables.');
    }

    if (!systemStatus.services.sms.configured) {
      systemStatus.recommendations.push('SMS service is not configured. Set SMS_API_KEY and SMS_API_BASE_URL environment variables.');
    }

    if (!systemStatus.environment.adminEmail || systemStatus.environment.adminEmail === 'Not Set') {
      systemStatus.recommendations.push('ADMIN_EMAIL is not set. Admin notifications will not be sent.');
    }

    return NextResponse.json(systemStatus);

  } catch (error) {
    console.error('System debug error:', error);
    return NextResponse.json({ 
      error: 'Failed to get system status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
