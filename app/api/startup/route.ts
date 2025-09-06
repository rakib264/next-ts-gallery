import startupService from '@/lib/startup';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Initialize startup service
    const initialized = await startupService.initialize();
    
    // Only get consumer status if not in serverless environment
    let status = {};
    const isVercel = process.env.VERCEL === '1';
    
    if (!isVercel) {
      try {
        const { default: consumerService } = await import('@/lib/consumerService');
        status = consumerService.getStatus();
      } catch (error) {
        console.warn('Could not get consumer status:', error);
        status = { error: 'Consumer service not available' };
      }
    } else {
      status = { 
        message: 'Consumer service disabled in serverless environment',
        isRunning: false,
        consumers: []
      };
    }
    
    return NextResponse.json({
      message: 'Startup check completed',
      autoStartEnabled: process.env.AUTO_START_CONSUMERS === 'true',
      startupInitialized: startupService.isInitialized(),
      initializationSuccess: initialized,
      isServerless: isVercel,
      ...status
    });

  } catch (error) {
    console.error('Startup error:', error);
    return NextResponse.json({ 
      error: 'Startup check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
