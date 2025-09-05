import startupService from '@/lib/startup';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Initialize startup service
    const initialized = await startupService.initialize();
    
    // Get consumer status dynamically
    const { default: consumerService } = await import('@/lib/consumerService');
    const status = consumerService.getStatus();
    
    return NextResponse.json({
      message: 'Startup check completed',
      autoStartEnabled: process.env.AUTO_START_CONSUMERS === 'true',
      startupInitialized: startupService.isInitialized(),
      initializationSuccess: initialized,
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
