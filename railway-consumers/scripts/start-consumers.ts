#!/usr/bin/env tsx

/**
 * RabbitMQ Consumers Startup Script (TypeScript)
 * This script starts all RabbitMQ consumers for processing invoice generation and other events
 */

import { EventHandlers } from '../lib/eventHandlers';
import rabbitMQService, { EventType } from '../lib/rabbitmq';

class ConsumerManager {
  private isRunning = false;
  private consumers: EventType[] = [];

  async start(): Promise<void> {
    try {
      // console.log('🚀 Starting RabbitMQ consumers...');
      
      // Connect to RabbitMQ
      if (!rabbitMQService.isReady()) {
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
          await rabbitMQService.consumeEvents(config.eventType, config.handler);
          // console.log(`✅ ${config.name} consumer started`);
          this.consumers.push(config.eventType);
        } catch (error) {
          console.error(`❌ Failed to start ${config.name} consumer:`, error);
        }
      }

      this.isRunning = true;
      // console.log(`🎉 All consumers started successfully! Running ${this.consumers.length} consumers.`);
      // console.log('📨 Consumers are now listening for events...');
      // console.log('Press Ctrl+C to stop the consumers');

    } catch (error) {
      console.error('💥 Failed to start consumers:', error);
      process.exit(1);
    }
  }

  async stop(): Promise<void> {
    try {
      // console.log('\n🛑 Stopping consumers...');
      await rabbitMQService.close();
      this.isRunning = false;
      // console.log('✅ Consumers stopped successfully');
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
        // console.log(`\n📡 Received ${signal}, shutting down gracefully...`);
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
    // console.log(`💓 Consumers heartbeat - ${new Date().toISOString()}`);
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
