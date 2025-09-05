import * as amqp from 'amqplib';
import winston from 'winston';

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'rabbitmq-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/rabbitmq-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/rabbitmq-combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Event types
export enum EventType {
  LOW_STOCK_ALERT = 'low_stock_alert',
  NEW_CUSTOMER_REGISTRATION = 'new_customer_registration',
  NEW_PRODUCT_CREATION = 'new_product_creation',
  NEW_ORDER_CREATION = 'new_order_creation',
  INVOICE_GENERATION = 'invoice_generation'
}

// Event interfaces
export interface BaseEvent {
  type: EventType;
  timestamp: Date;
  id: string;
}

export interface LowStockAlertEvent extends BaseEvent {
  type: EventType.LOW_STOCK_ALERT;
  productId: string;
  productName: string;
  currentStock: number;
  threshold: number;
}

export interface NewCustomerRegistrationEvent extends BaseEvent {
  type: EventType.NEW_CUSTOMER_REGISTRATION;
  customerId: string;
  customerEmail: string;
  customerName: string;
}

export interface NewProductCreationEvent extends BaseEvent {
  type: EventType.NEW_PRODUCT_CREATION;
  productId: string;
  productName: string;
  adminId: string;
}

export interface NewOrderCreationEvent extends BaseEvent {
  type: EventType.NEW_ORDER_CREATION;
  orderId: string;
  orderNumber: string;
  customerEmail?: string;
  customerId?: string;
  total: number;
}

export interface InvoiceGenerationEvent extends BaseEvent {
  type: EventType.INVOICE_GENERATION;
  orderId: string;
  orderNumber: string;
  customerEmail?: string;
  customerId?: string;
  orderData: any;
}

export type Event = 
  | LowStockAlertEvent 
  | NewCustomerRegistrationEvent 
  | NewProductCreationEvent 
  | NewOrderCreationEvent 
  | InvoiceGenerationEvent;

// RabbitMQ configuration
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const EXCHANGE_NAME = 'nextecom_events';

// Queue configurations
const QUEUE_CONFIGS = {
  [EventType.LOW_STOCK_ALERT]: {
    name: 'low_stock_alerts',
    routingKey: 'low_stock_alert',
    durable: true
  },
  [EventType.NEW_CUSTOMER_REGISTRATION]: {
    name: 'new_customer_registrations',
    routingKey: 'new_customer_registration',
    durable: true
  },
  [EventType.NEW_PRODUCT_CREATION]: {
    name: 'new_product_creations',
    routingKey: 'new_product_creation',
    durable: true
  },
  [EventType.NEW_ORDER_CREATION]: {
    name: 'new_order_creations',
    routingKey: 'new_order_creation',
    durable: true
  },
  [EventType.INVOICE_GENERATION]: {
    name: 'invoice_generation',
    routingKey: 'invoice_generation',
    durable: true
  }
};

class RabbitMQService {
  private connection: any = null;
  private channel: any = null;
  private isConnected = false;

  async connect(): Promise<void> {
    try {
      logger.info('Connecting to RabbitMQ...');
      this.connection = await amqp.connect(RABBITMQ_URL);
      this.channel = await this.connection.createChannel();
      
      // Set up exchanges and queues
      await this.setupExchangesAndQueues();
      
      this.isConnected = true;
      logger.info('Successfully connected to RabbitMQ');
    } catch (error) {
      logger.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  private async setupExchangesAndQueues(): Promise<void> {
    if (!this.channel) throw new Error('Channel not available');

    // Create main exchange
    await this.channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });

    // Set up queues for each event type
    for (const [eventType, config] of Object.entries(QUEUE_CONFIGS)) {
      const queueName = config.name;
      const routingKey = config.routingKey;
      
      // Create queue
      await this.channel.assertQueue(queueName, {
        durable: config.durable
      });

      // Bind queue to exchange
      await this.channel.bindQueue(queueName, EXCHANGE_NAME, routingKey);
      
      logger.info(`Queue ${queueName} set up with routing key ${routingKey}`);
    }
  }

  async publishEvent(event: Event): Promise<boolean> {
    try {
      if (!this.isConnected || !this.channel) {
        await this.connect();
      }

      if (!this.channel) {
        throw new Error('Channel not available');
      }

      const config = QUEUE_CONFIGS[event.type];
      if (!config) {
        throw new Error(`Unknown event type: ${event.type}`);
      }

      const message = JSON.stringify({
        ...event,
        timestamp: event.timestamp.toISOString()
      });

      const success = this.channel.publish(
        EXCHANGE_NAME,
        config.routingKey,
        Buffer.from(message),
        {
          persistent: true,
          messageId: event.id,
          timestamp: Date.now()
        }
      );

      if (success) {
        logger.info(`Event published successfully: ${event.type}`, { eventId: event.id });
        return true;
      } else {
        logger.error(`Failed to publish event: ${event.type}`, { eventId: event.id });
        return false;
      }
    } catch (error) {
      logger.error(`Error publishing event ${event.type}:`, error);
      return false;
    }
  }

  async consumeEvents(
    eventType: EventType,
    handler: (event: Event) => Promise<void>
  ): Promise<void> {
    try {
      if (!this.isConnected || !this.channel) {
        await this.connect();
      }

      if (!this.channel) {
        throw new Error('Channel not available');
      }

      const config = QUEUE_CONFIGS[eventType];
      if (!config) {
        throw new Error(`Unknown event type: ${eventType}`);
      }

      logger.info(`Starting consumer for ${eventType}...`);

      await this.channel.consume(config.name, async (msg: any) => {
        if (!msg) return;

        try {
          const content = JSON.parse(msg.content.toString());

          logger.info(`Processing ${eventType} event`, { 
            eventId: content.id 
          });

          await handler(content);
          
          // Acknowledge the message
          this.channel?.ack(msg);
          
          logger.info(`Successfully processed ${eventType} event`, { 
            eventId: content.id 
          });

        } catch (error) {
          logger.error(`Error processing ${eventType} event:`, error);
          
          // Reject and requeue
          this.channel?.nack(msg, false, true);
        }
      });

      logger.info(`Consumer started for ${eventType}`);
    } catch (error) {
      logger.error(`Error setting up consumer for ${eventType}:`, error);
      throw error;
    }
  }

  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.isConnected = false;
      logger.info('RabbitMQ connection closed');
    } catch (error) {
      logger.error('Error closing RabbitMQ connection:', error);
    }
  }

  isReady(): boolean {
    return this.isConnected && this.channel !== null;
  }
}

// Create singleton instance
const rabbitMQService = new RabbitMQService();

export default rabbitMQService;
