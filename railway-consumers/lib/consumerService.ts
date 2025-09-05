import winston from 'winston';
import { EventHandlers } from './eventHandlers';
import rabbitMQService, { EventType } from './rabbitmq';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'consumer-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/consumer-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/consumer-combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

class ConsumerService {
  private static instance: ConsumerService;
  private isRunning = false;
  private consumers: EventType[] = [];

  static getInstance(): ConsumerService {
    if (!ConsumerService.instance) {
      ConsumerService.instance = new ConsumerService();
    }
    return ConsumerService.instance;
  }

  async startAll(): Promise<boolean> {
    if (this.isRunning) {
      logger.info('Consumers are already running');
      return true;
    }

    try {
      logger.info('Starting RabbitMQ consumers...');
      
      // Connect to RabbitMQ if not connected
      if (!rabbitMQService.isReady()) {
        await rabbitMQService.connect();
      }

      // Consumer configurations
      const consumerConfigs = [
        {
          eventType: EventType.INVOICE_GENERATION,
          handler: EventHandlers.handleInvoiceGeneration,
          name: 'Invoice Generation'
        },
        {
          eventType: EventType.NEW_ORDER_CREATION,
          handler: EventHandlers.handleNewOrderCreation,
          name: 'New Order Creation'
        },
        {
          eventType: EventType.LOW_STOCK_ALERT,
          handler: EventHandlers.handleLowStockAlert,
          name: 'Low Stock Alert'
        },
        {
          eventType: EventType.NEW_CUSTOMER_REGISTRATION,
          handler: EventHandlers.handleNewCustomerRegistration,
          name: 'New Customer Registration'
        },
        {
          eventType: EventType.NEW_PRODUCT_CREATION,
          handler: EventHandlers.handleNewProductCreation,
          name: 'New Product Creation'
        }
      ];

      // Start each consumer
      for (const config of consumerConfigs) {
        try {
          await rabbitMQService.consumeEvents(config.eventType, config.handler);
          logger.info(`${config.name} consumer started successfully`);
          this.consumers.push(config.eventType);
        } catch (error) {
          logger.error(`Failed to start ${config.name} consumer:`, error);
        }
      }

      this.isRunning = true;
      logger.info(`All consumers started successfully! Running ${this.consumers.length} consumers.`);
      
      return true;
    } catch (error) {
      logger.error('Failed to start consumers:', error);
      return false;
    }
  }

  async stop(): Promise<boolean> {
    try {
      logger.info('Stopping consumers...');
      await rabbitMQService.close();
      this.isRunning = false;
      this.consumers = [];
      logger.info('Consumers stopped successfully');
      return true;
    } catch (error) {
      logger.error('Error stopping consumers:', error);
      return false;
    }
  }

  getStatus(): { isRunning: boolean; consumers: EventType[]; rabbitMQReady: boolean } {
    return {
      isRunning: this.isRunning,
      consumers: [...this.consumers],
      rabbitMQReady: rabbitMQService.isReady()
    };
  }

  async restart(): Promise<boolean> {
    logger.info('Restarting consumers...');
    await this.stop();
    // Wait a bit before restarting
    await new Promise(resolve => setTimeout(resolve, 2000));
    return await this.startAll();
  }
}

// Export singleton instance
export default ConsumerService.getInstance();
