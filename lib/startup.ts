/**
 * Application Startup Service - Server Only
 * Automatically starts RabbitMQ consumers when the Next.js app starts
 */

// Simple server-only startup without winston to avoid webpack issues
class StartupService {
  private static instance: StartupService;
  private initialized = false;

  static getInstance(): StartupService {
    if (!StartupService.instance) {
      StartupService.instance = new StartupService();
    }
    return StartupService.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }

    try {
      // console.log('🚀 Initializing application...');

      // Auto-start consumers if environment variable is set
      const autoStartConsumers = process.env.AUTO_START_CONSUMERS === 'true';
      const isVercel = process.env.VERCEL === '1';
      
      if (autoStartConsumers && !isVercel) {
        // console.log('📨 Auto-starting RabbitMQ consumers...');
        
        // Import consumerService dynamically to avoid webpack issues
        const { default: consumerService } = await import('./consumerService');
        
        // Wait a bit for the app to fully start
        setTimeout(async () => {
          try {
            const success = await consumerService.startAll();
            if (success) {
              // console.log('✅ RabbitMQ consumers started automatically');
            } else {
              console.error('❌ Failed to auto-start RabbitMQ consumers');
            }
          } catch (error) {
            console.error('❌ Error auto-starting consumers:', error);
          }
        }, 3000); // Wait 3 seconds after app start
      } else if (isVercel) {
        console.log('📨 RabbitMQ consumers disabled on Vercel (serverless environment)');
      } else {
        // console.log('📨 RabbitMQ consumers auto-start disabled. Use AUTO_START_CONSUMERS=true to enable.');
      }

      this.initialized = true;
      // console.log('✅ Application initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize application:', error);
      return false;
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export default StartupService.getInstance();
