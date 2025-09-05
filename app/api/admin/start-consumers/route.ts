import { auth } from '@/lib/auth';
import consumerService from '@/lib/consumerService';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !['admin', 'manager'].includes(session.user?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const status = consumerService.getStatus();
    
    if (status.isRunning) {
      return NextResponse.json({ 
        message: 'Consumers are already running',
        status: 'already_running',
        ...status
      });
    }

    // console.log('Starting RabbitMQ consumers...');
    
    const success = await consumerService.startAll();

    if (success) {
      const newStatus = consumerService.getStatus();
      return NextResponse.json({ 
        message: 'RabbitMQ consumers started successfully',
        status: 'started',
        ...newStatus
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to start some or all consumers',
        status: 'partial_failure'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error starting consumers:', error);
    return NextResponse.json({ 
      error: 'Failed to start consumers',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !['admin', 'manager'].includes(session.user?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const status = consumerService.getStatus();
    return NextResponse.json(status);

  } catch (error) {
    console.error('Error checking consumer status:', error);
    return NextResponse.json({ 
      error: 'Failed to check consumer status'
    }, { status: 500 });
  }
}
