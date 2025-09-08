import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('🔄 Worker started - Processing queue...');
    
    // Check environment variables
    const envCheck = {
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ? 'Set' : 'Missing',
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ? 'Set' : 'Missing',
      RESEND_API_KEY: process.env.RESEND_API_KEY ? 'Set' : 'Missing',
      FROM_EMAIL: process.env.FROM_EMAIL || 'Not set',
      FROM_NAME: process.env.FROM_NAME || 'Not set',
    };

    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.error('❌ Upstash Redis credentials not found');
      return NextResponse.json({
        success: false,
        error: 'Upstash Redis credentials not found',
        envCheck
      }, { status: 500 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not found');
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
      console.log('📭 No jobs in queue');
      return NextResponse.json({
        success: true,
        message: 'No jobs in queue',
        queueLength: 0,
        processed: 0,
        processingTime: Date.now() - startTime,
        envCheck
      });
    }

    let processed = 0;
    let failed = 0;
    const maxJobs = 10; // Process max 10 jobs per run
    const maxRunTime = 25000; // 25 seconds max for Vercel

    // Process jobs
    for (let i = 0; i < Math.min(queueLength, maxJobs); i++) {
      // Check if we're running out of time
      if (Date.now() - startTime > maxRunTime) {
        console.log('⏰ Time limit reached, stopping processing');
        break;
      }

      try {
        // Dequeue one job
        const jobData = await redis.rpop(queueName);
        
        if (!jobData) {
          console.log('📭 No more jobs available');
          break;
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
          failed++;
          continue;
        }

        // Process the job based on type
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

            processed++;

          } catch (emailError) {
            console.error('❌ Email sending failed:', emailError);
            
            // Put job back in queue for retry (with retry limit)
            if (job.retries < (job.maxRetries || 3)) {
              job.retries = (job.retries || 0) + 1;
              await redis.lpush(queueName, JSON.stringify(job));
              console.log('🔄 Job requeued for retry:', {
                jobId: job.id,
                retries: job.retries,
                maxRetries: job.maxRetries || 3
              });
            } else {
              console.error('💀 Job failed permanently:', {
                jobId: job.id,
                retries: job.retries,
                maxRetries: job.maxRetries || 3
              });
            }
            
            failed++;
          }
        } else if (job.type === 'contact_form_notification') {
          console.log('📧 Processing contact form notification:', {
            to: job.adminEmail,
            from: job.email,
            subject: job.subject
          });

          try {
            const emailResult = await resend.emails.send({
              from: process.env.FROM_EMAIL ? 
                `${process.env.FROM_NAME || 'TSR Gallery'} <${process.env.FROM_EMAIL}>` : 
                'TSR Gallery <onboarding@resend.dev>',
              to: [job.adminEmail],
              subject: `[TSR Gallery] ${job.subject}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h2 style="color: #3949AB;">New Contact Form Submission</h2>
                  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Name:</strong> ${job.name}</p>
                    <p><strong>Email:</strong> ${job.email}</p>
                    <p><strong>Subject:</strong> ${job.subject}</p>
                    <p><strong>Message:</strong></p>
                    <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #3949AB;">
                      ${job.message.replace(/\n/g, '<br>')}
                    </div>
                  </div>
                  <p style="color: #666; font-size: 14px;">
                    This message was sent via the TSR Gallery contact form.
                  </p>
                </div>
              `,
              replyTo: `${job.name} <${job.email}>`
            });

            console.log('📧 Contact form notification sent successfully:', {
              jobId: job.id,
              emailId: emailResult.data?.id,
              to: job.adminEmail,
              from: job.email,
              subject: job.subject
            });

            processed++;

          } catch (emailError) {
            console.error('❌ Contact form email sending failed:', emailError);
            
            // Put job back in queue for retry (with retry limit)
            if (job.retries < (job.maxRetries || 3)) {
              job.retries = (job.retries || 0) + 1;
              await redis.lpush(queueName, JSON.stringify(job));
              console.log('🔄 Job requeued for retry:', {
                jobId: job.id,
                retries: job.retries,
                maxRetries: job.maxRetries || 3
              });
            } else {
              console.error('💀 Job failed permanently:', {
                jobId: job.id,
                retries: job.retries,
                maxRetries: job.maxRetries || 3
              });
            }
            
            failed++;
          }
        } else {
          console.log('⚠️ Unknown job type:', job.type);
          failed++;
        }

      } catch (jobError) {
        console.error('❌ Job processing error:', jobError);
        failed++;
      }
    }

    const processingTime = Date.now() - startTime;
    const finalQueueLength = await redis.llen(queueName);

    console.log('🎉 Worker completed:', {
      processed,
      failed,
      initialQueueLength: queueLength,
      finalQueueLength,
      processingTime: `${processingTime}ms`
    });

    return NextResponse.json({
      success: true,
      message: 'Worker completed',
      processed,
      failed,
      initialQueueLength: queueLength,
      finalQueueLength,
      processingTime: `${processingTime}ms`,
      envCheck
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ Worker failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      processingTime: `${processingTime}ms`,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Worker endpoint - Use POST to process queue jobs',
    methods: ['POST'],
    timestamp: new Date().toISOString()
  });
}
