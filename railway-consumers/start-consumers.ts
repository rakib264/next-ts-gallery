#!/usr/bin/env tsx

/**
 * Railway Consumer Startup Script
 * This script starts all RabbitMQ consumers for processing events
 */

import healthCheckServer from './health-check';
import { EventHandlers } from './lib/eventHandlers';
import rabbitMQService, { EventType } from './lib/rabbitmq';

class ConsumerManager {
  private isRunning = false;
  private consumers: EventType[] = [];

  private validateEnvironmentVariables(): void {
    const requiredVars = [
      'RABBITMQ_URL',
      'DATABASE_URL',
      'SMTP_HOST',
      'SMTP_USER',
      'SMTP_PASS',
      'FROM_EMAIL',
      'ADMIN_EMAIL'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:', missingVars);
      console.error('Please set the following environment variables in Railway:');
      missingVars.forEach(varName => {
        console.error(`  - ${varName}`);
      });
      process.exit(1);
    }

    console.log('✅ All required environment variables are set');
  }

  async start(): Promise<void> {
    try {
      console.log('🚀 Starting RabbitMQ consumers on Railway...');
      
      // Validate required environment variables
      this.validateEnvironmentVariables();
      
      // Start health check server first
      console.log('🏥 Starting health check server...');
      await healthCheckServer;
      
      // Connect to RabbitMQ
      if (!rabbitMQService.isReady()) {
        console.log('🔌 Connecting to RabbitMQ...');
        await rabbitMQService.connect();
      }

      // Start individual consumers
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

      for (const config of consumerConfigs) {
        try {
          console.log(`🔄 Starting ${config.name} consumer...`);
          await rabbitMQService.consumeEvents(config.eventType, config.handler);
          console.log(`✅ ${config.name} consumer started successfully`);
          this.consumers.push(config.eventType);
        } catch (error) {
          console.error(`❌ Failed to start ${config.name} consumer:`, error);
          // Don't exit on individual consumer failures, but log them
        }
      }

      this.isRunning = true;
      console.log(`🎉 All consumers started successfully! Running ${this.consumers.length} consumers.`);
      console.log('📨 Consumers are now listening for events...');

    } catch (error) {
      console.error('💥 Failed to start consumers:', error);
      process.exit(1);
    }
  }

  async stop(): Promise<void> {
    try {
      console.log('\n🛑 Stopping consumers...');
      await rabbitMQService.close();
      this.isRunning = false;
      console.log('✅ Consumers stopped successfully');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error stopping consumers:', error);
      process.exit(1);
    }
  }

  setupGracefulShutdown(): void {
    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
    signals.forEach(signal => {
      process.on(signal, () => {
        console.log(`\n📡 Received ${signal}, shutting down gracefully...`);
        this.stop();
      });
    });

    process.on('uncaughtException', (error) => {
      console.error('💥 Uncaught Exception:', error);
      this.stop();
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      this.stop();
    });
  }
}

// Main execution
async function main() {
  const manager = new ConsumerManager();
  
  // Set up graceful shutdown
  manager.setupGracefulShutdown();
  
  // Start consumers
  await manager.start();
  
  // Keep the process alive
  setInterval(() => {
    console.log(`💓 Consumers heartbeat - ${new Date().toISOString()}`);
  }, 60000); // Log every minute
}

// Run if this script is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

export { ConsumerManager };
