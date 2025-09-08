import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Manual queue consumption started...');
    
    // Check environment variables
    const envCheck = {
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ? 'Set' : 'Missing',
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ? 'Set' : 'Missing',
      RESEND_API_KEY: process.env.RESEND_API_KEY ? 'Set' : 'Missing',
      FROM_EMAIL: process.env.FROM_EMAIL || 'Not set',
      FROM_NAME: process.env.FROM_NAME || 'Not set',
    };

    console.log('Environment check:', envCheck);

    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return NextResponse.json({
        success: false,
        error: 'Upstash Redis credentials not found',
        envCheck
      }, { status: 500 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'RESEND_API_KEY not found',
        envCheck
      }, { status: 500 });
    }

    // Import dependencies
    const { Redis } = await import('@upstash/redis');
    const { Resend } = await import('resend');

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Get queue stats
    const queueName = 'nextecom_tasks';
    const queueLength = await redis.llen(queueName);
    
    console.log('📊 Queue stats:', {
      queueName,
      queueLength
    });

    if (queueLength === 0) {
      return NextResponse.json({
        success: true,
        message: 'No jobs in queue',
        queueLength: 0,
        processed: 0,
        envCheck
      });
    }

    // Dequeue one job
    const jobData = await redis.rpop(queueName);
    
    if (!jobData) {
      return NextResponse.json({
        success: true,
        message: 'No job data received',
        queueLength,
        processed: 0,
        envCheck
      });
    }

    console.log('📦 Job dequeued:', jobData);

    let job;
    try {
      // Handle double-stringified JSON
      let parsedData = jobData;
      if (typeof jobData === 'string') {
        parsedData = JSON.parse(jobData);
      }
      if (typeof parsedData === 'string') {
        job = JSON.parse(parsedData);
      } else {
        job = parsedData;
      }
      
      console.log('✅ Job parsed successfully:', {
        id: job.id,
        type: job.type,
        timestamp: job.timestamp
      });
    } catch (parseError) {
      console.error('❌ Failed to parse job data:', parseError);
      return NextResponse.json({
        success: false,
        error: 'Failed to parse job data',
        jobData,
        envCheck
      }, { status: 500 });
    }

    // Process the job
    if (job.type === 'send_email') {
      console.log('📧 Processing email job:', {
        to: job.payload.to,
        subject: job.payload.subject
      });

      try {
        const emailResult = await resend.emails.send({
          from: process.env.FROM_EMAIL ? 
            `${process.env.FROM_NAME || 'TSR Gallery'} <${process.env.FROM_EMAIL}>` : 
            'TSR Gallery <onboarding@resend.dev>',
          to: [job.payload.to],
          subject: job.payload.subject,
          html: job.payload.html
        });

        console.log('📧 Email sent successfully:', {
          jobId: job.id,
          emailId: emailResult.data?.id,
          to: job.payload.to,
          subject: job.payload.subject
        });

        return NextResponse.json({
          success: true,
          message: 'Job processed successfully',
          jobId: job.id,
          jobType: job.type,
          emailResult: {
            id: emailResult.data?.id,
            error: emailResult.error
          },
          queueLength: queueLength - 1,
          processed: 1,
          envCheck
        });

      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError);
        
        // Put job back in queue for retry
        await redis.lpush(queueName, jobData);
        
        return NextResponse.json({
          success: false,
          error: 'Email sending failed',
          jobId: job.id,
          emailError: emailError instanceof Error ? emailError.message : 'Unknown error',
          queueLength,
          processed: 0,
          envCheck
        }, { status: 500 });
      }
    } else {
      console.log('⚠️ Unknown job type:', job.type);
      return NextResponse.json({
        success: false,
        error: `Unknown job type: ${job.type}`,
        jobId: job.id,
        jobType: job.type,
        queueLength,
        processed: 0,
        envCheck
      }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Queue consumption failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Queue consumption endpoint - Use POST to manually process one job',
    methods: ['POST'],
    timestamp: new Date().toISOString()
  });
}
