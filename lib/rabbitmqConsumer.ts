import winston from 'winston';
import { EventHandlers } from './eventHandlers';
import rabbitMQService, { EventType } from './rabbitmq';

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'rabbitmq-consumer' },
  transports: [
    new winston.transports.File({ filename: 'logs/consumer-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/consumer-combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

class RabbitMQConsumer {
  private isRunning = false;
  private consumers: Map<EventType, boolean> = new Map();

  async start(): Promise<void> {
    try {
      logger.info('Starting RabbitMQ consumer service...');
      
      // Connect to RabbitMQ
      await rabbitMQService.connect();
      
      this.isRunning = true;
      
      // Start consumers for all event types
      await this.startAllConsumers();
      
      logger.info('RabbitMQ consumer service started successfully');
      
      // Handle graceful shutdown
      this.setupGracefulShutdown();
      
    } catch (error) {
      logger.error('Failed to start RabbitMQ consumer service:', error);
      throw error;
    }
  }

  private async startAllConsumers(): Promise<void> {
    const eventTypes = Object.values(EventType);
    
    for (const eventType of eventTypes) {
      try {
        await this.startConsumer(eventType);
        this.consumers.set(eventType, true);
        logger.info(`Consumer started for event type: ${eventType}`);
      } catch (error) {
        logger.error(`Failed to start consumer for event type ${eventType}:`, error);
        this.consumers.set(eventType, false);
      }
    }
  }

  private async startConsumer(eventType: EventType): Promise<void> {
    try {
      const handler = EventHandlers.getHandler(eventType);
      
      await rabbitMQService.consumeEvents(eventType, async (event) => {
        try {
          logger.info(`Processing ${eventType} event`, { eventId: event.id });
          await handler(event);
          logger.info(`Successfully processed ${eventType} event`, { eventId: event.id });
        } catch (error) {
          logger.error(`Error processing ${eventType} event:`, error);
          throw error; // Re-throw to trigger retry/dead letter queue
        }
      });
      
    } catch (error) {
      logger.error(`Error setting up consumer for ${eventType}:`, error);
      throw error;
    }
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      this.isRunning = false;
      
      try {
        // Close RabbitMQ connection
        await rabbitMQService.close();
        logger.info('RabbitMQ consumer service shut down successfully');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    // Handle different shutdown signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGUSR2', () => shutdown('SIGUSR2')); // For nodemon

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception:', error);
      shutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection at:', promise, 'reason:', reason);
      shutdown('unhandledRejection');
    });
  }

  async stop(): Promise<void> {
    logger.info('Stopping RabbitMQ consumer service...');
    this.isRunning = false;
    await rabbitMQService.close();
    logger.info('RabbitMQ consumer service stopped');
  }

  isActive(): boolean {
    return this.isRunning;
  }

  getConsumerStatus(): Record<EventType, boolean> {
    const status: Record<EventType, boolean> = {} as Record<EventType, boolean>;
    for (const [eventType, isActive] of this.consumers) {
      status[eventType] = isActive;
    }
    return status;
  }
}

// Create singleton instance
const rabbitMQConsumer = new RabbitMQConsumer();

// Export for use in other files
export default rabbitMQConsumer;

// Start the consumer if this file is run directly
if (require.main === module) {
  rabbitMQConsumer.start().catch((error) => {
    logger.error('Failed to start consumer:', error);
    process.exit(1);
  });
}
