#!/usr/bin/env tsx

/**
 * RabbitMQ Debug Script
 * This script helps debug RabbitMQ connection and message flow issues
 */

import * as amqp from 'amqplib';
import winston from 'winston';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'rabbitmq-debug' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const EXCHANGE_NAME = 'nextecom_events';

interface QueueInfo {
  name: string;
  messageCount: number;
  consumerCount: number;
}

class RabbitMQDebugger {
  private connection: any = null;
  private channel: any = null;

  async connect(): Promise<void> {
    try {
      logger.info('🔌 Connecting to RabbitMQ...', { 
        url: RABBITMQ_URL.replace(/\/\/.*@/, '//***:***@') 
      });
      
      this.connection = await amqp.connect(RABBITMQ_URL, {
        heartbeat: 60,
        connection_timeout: 30000
      });
      
      this.channel = await this.connection.createChannel();
      
      logger.info('✅ Successfully connected to RabbitMQ');
    } catch (error) {
      logger.error('❌ Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async checkExchange(): Promise<void> {
    try {
      logger.info('🔍 Checking exchange...', { exchangeName: EXCHANGE_NAME });
      
      const exchange = await this.channel.checkExchange(EXCHANGE_NAME);
      logger.info('✅ Exchange exists:', exchange);
    } catch (error) {
      logger.error('❌ Exchange check failed:', error);
      throw error;
    }
  }

  async listQueues(): Promise<QueueInfo[]> {
    try {
      logger.info('📋 Listing all queues...');
      
      const queues = await this.channel.assertQueue('', { exclusive: true });
      const queueList: QueueInfo[] = [];
      
      // Check our specific queues
      const expectedQueues = [
        'low_stock_alerts',
        'new_customer_registrations', 
        'new_product_creations',
        'new_order_creations',
        'invoice_generation'
      ];
      
      for (const queueName of expectedQueues) {
        try {
          const queue = await this.channel.checkQueue(queueName);
          queueList.push({
            name: queueName,
            messageCount: queue.messageCount,
            consumerCount: queue.consumerCount
          });
          logger.info(`📦 Queue: ${queueName}`, {
            messageCount: queue.messageCount,
            consumerCount: queue.consumerCount
          });
        } catch (error) {
          logger.warn(`⚠️ Queue ${queueName} not found or not accessible`);
        }
      }
      
      return queueList;
    } catch (error) {
      logger.error('❌ Failed to list queues:', error);
      throw error;
    }
  }

  async publishTestMessage(): Promise<void> {
    try {
      logger.info('📤 Publishing test message...');
      
      const testEvent = {
        type: 'new_order_creation',
        id: `test-${Date.now()}`,
        timestamp: new Date().toISOString(),
        orderId: 'test-order-123',
        orderNumber: 'TEST-123456',
        customerEmail: 'test@example.com',
        total: 1000
      };
      
      const message = JSON.stringify(testEvent);
      const success = this.channel.publish(
        EXCHANGE_NAME,
        'new_order_creation',
        Buffer.from(message),
        {
          persistent: true,
          messageId: testEvent.id,
          timestamp: Date.now()
        }
      );
      
      if (success) {
        logger.info('✅ Test message published successfully');
      } else {
        logger.error('❌ Failed to publish test message');
      }
    } catch (error) {
      logger.error('❌ Error publishing test message:', error);
      throw error;
    }
  }

  async consumeTestMessage(): Promise<void> {
    try {
      logger.info('📥 Setting up test consumer...');
      
      await this.channel.consume('new_order_creations', (msg: any) => {
        if (msg) {
          const content = JSON.parse(msg.content.toString());
          logger.info('📨 Received test message:', content);
          this.channel.ack(msg);
        }
      });
      
      logger.info('✅ Test consumer set up successfully');
    } catch (error) {
      logger.error('❌ Error setting up test consumer:', error);
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
      logger.info('🔌 Connection closed');
    } catch (error) {
      logger.error('❌ Error closing connection:', error);
    }
  }
}

async function main() {
  const debugger = new RabbitMQDebugger();
  
  try {
    // Connect to RabbitMQ
    await debugger.connect();
    
    // Check exchange
    await debugger.checkExchange();
    
    // List queues
    const queues = await debugger.listQueues();
    
    // Publish test message
    await debugger.publishTestMessage();
    
    // Set up test consumer
    await debugger.consumeTestMessage();
    
    logger.info('🎉 Debug script completed successfully');
    logger.info('📊 Summary:', {
      totalQueues: queues.length,
      queuesWithMessages: queues.filter(q => q.messageCount > 0).length,
      queuesWithConsumers: queues.filter(q => q.consumerCount > 0).length
    });
    
  } catch (error) {
    logger.error('💥 Debug script failed:', error);
    process.exit(1);
  } finally {
    await debugger.close();
  }
}

// Run if this script is executed directly
if (require.main === module) {
  main().catch(error => {
    logger.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

export { RabbitMQDebugger };
