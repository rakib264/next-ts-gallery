#!/usr/bin/env tsx

/**
 * Environment Validation Script
 * This script validates all required environment variables for Railway deployment
 */

import winston from 'winston';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'env-validator' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

interface EnvVar {
  name: string;
  required: boolean;
  description: string;
  validator?: (value: string) => boolean;
}

const ENVIRONMENT_VARIABLES: EnvVar[] = [
  {
    name: 'NODE_ENV',
    required: true,
    description: 'Node environment (production/development)',
    validator: (value) => ['production', 'development', 'test'].includes(value)
  },
  {
    name: 'RABBITMQ_URL',
    required: true,
    description: 'RabbitMQ connection URL',
    validator: (value) => value.startsWith('amqp://') && value !== 'amqp://localhost:5672'
  },
  {
    name: 'DATABASE_URL',
    required: true,
    description: 'MongoDB connection URL',
    validator: (value) => value.startsWith('mongodb://') || value.startsWith('mongodb+srv://')
  },
  {
    name: 'SMTP_HOST',
    required: true,
    description: 'SMTP server hostname',
    validator: (value) => value.length > 0 && value.includes('.')
  },
  {
    name: 'SMTP_PORT',
    required: true,
    description: 'SMTP server port',
    validator: (value) => {
      const port = parseInt(value);
      return !isNaN(port) && port > 0 && port <= 65535;
    }
  },
  {
    name: 'SMTP_USER',
    required: true,
    description: 'SMTP username/email',
    validator: (value) => value.includes('@') && value.length > 5
  },
  {
    name: 'SMTP_PASS',
    required: true,
    description: 'SMTP password/app password',
    validator: (value) => value.length >= 8
  },
  {
    name: 'FROM_EMAIL',
    required: true,
    description: 'From email address for outgoing emails',
    validator: (value) => value.includes('@') && value.length > 5
  },
  {
    name: 'FROM_NAME',
    required: false,
    description: 'From name for outgoing emails',
    validator: (value) => value.length > 0
  },
  {
    name: 'ADMIN_EMAIL',
    required: true,
    description: 'Admin email for notifications',
    validator: (value) => value.includes('@') && value.length > 5
  },
  {
    name: 'CLOUDINARY_CLOUD_NAME',
    required: false,
    description: 'Cloudinary cloud name for file uploads',
    validator: (value) => value.length > 0
  },
  {
    name: 'CLOUDINARY_API_KEY',
    required: false,
    description: 'Cloudinary API key',
    validator: (value) => value.length > 0
  },
  {
    name: 'CLOUDINARY_API_SECRET',
    required: false,
    description: 'Cloudinary API secret',
    validator: (value) => value.length > 0
  },
  {
    name: 'TWILIO_ACCOUNT_SID',
    required: false,
    description: 'Twilio account SID for SMS',
    validator: (value) => value.length > 0
  },
  {
    name: 'TWILIO_AUTH_TOKEN',
    required: false,
    description: 'Twilio auth token for SMS',
    validator: (value) => value.length > 0
  },
  {
    name: 'TWILIO_PHONE_NUMBER',
    required: false,
    description: 'Twilio phone number for SMS',
    validator: (value) => value.length > 0
  },
  {
    name: 'JWT_SECRET',
    required: false,
    description: 'JWT secret for token signing',
    validator: (value) => value.length >= 32
  }
];

class EnvironmentValidator {
  private results: { [key: string]: { valid: boolean; error?: string } } = {};

  validate(): boolean {
    logger.info('🔍 Validating environment variables...');
    
    let allValid = true;
    
    for (const envVar of ENVIRONMENT_VARIABLES) {
      const value = process.env[envVar.name];
      const result = this.validateVariable(envVar, value);
      this.results[envVar.name] = result;
      
      if (!result.valid) {
        allValid = false;
        if (envVar.required) {
          logger.error(`❌ ${envVar.name}: ${result.error}`);
        } else {
          logger.warn(`⚠️ ${envVar.name}: ${result.error}`);
        }
      } else {
        logger.info(`✅ ${envVar.name}: Valid`);
      }
    }
    
    return allValid;
  }

  private validateVariable(envVar: EnvVar, value: string | undefined): { valid: boolean; error?: string } {
    // Check if variable exists
    if (!value) {
      if (envVar.required) {
        return { valid: false, error: 'Required but not set' };
      } else {
        return { valid: true }; // Optional variables can be undefined
      }
    }
    
    // Check if validator exists and run it
    if (envVar.validator) {
      try {
        if (!envVar.validator(value)) {
          return { valid: false, error: 'Invalid format or value' };
        }
      } catch (error) {
        return { valid: false, error: `Validation error: ${error}` };
      }
    }
    
    return { valid: true };
  }

  generateReport(): void {
    logger.info('\n📊 Environment Validation Report');
    logger.info('================================');
    
    const required = ENVIRONMENT_VARIABLES.filter(v => v.required);
    const optional = ENVIRONMENT_VARIABLES.filter(v => !v.required);
    
    logger.info(`\n🔴 Required Variables (${required.length}):`);
    required.forEach(envVar => {
      const result = this.results[envVar.name];
      const status = result.valid ? '✅' : '❌';
      logger.info(`  ${status} ${envVar.name}: ${envVar.description}`);
      if (!result.valid && result.error) {
        logger.info(`     Error: ${result.error}`);
      }
    });
    
    logger.info(`\n🟡 Optional Variables (${optional.length}):`);
    optional.forEach(envVar => {
      const result = this.results[envVar.name];
      const status = result.valid ? '✅' : '⚠️';
      logger.info(`  ${status} ${envVar.name}: ${envVar.description}`);
      if (!result.valid && result.error) {
        logger.info(`     Warning: ${result.error}`);
      }
    });
    
    const validRequired = required.filter(v => this.results[v.name].valid).length;
    const validOptional = optional.filter(v => this.results[v.name].valid).length;
    
    logger.info(`\n📈 Summary:`);
    logger.info(`  Required: ${validRequired}/${required.length} valid`);
    logger.info(`  Optional: ${validOptional}/${optional.length} valid`);
    logger.info(`  Overall: ${validRequired + validOptional}/${ENVIRONMENT_VARIABLES.length} valid`);
  }

  generateRailwayConfig(): void {
    logger.info('\n🚂 Railway Environment Variables Configuration');
    logger.info('=============================================');
    
    logger.info('\nCopy and paste these into your Railway project environment variables:');
    logger.info('(Go to your Railway project → Variables tab → Add the following)');
    
    ENVIRONMENT_VARIABLES.forEach(envVar => {
      const result = this.results[envVar.name];
      const currentValue = process.env[envVar.name];
      
      if (envVar.required && !result.valid) {
        logger.info(`\n🔴 ${envVar.name} (REQUIRED - NOT SET)`);
        logger.info(`   Description: ${envVar.description}`);
        logger.info(`   Example: [SET YOUR VALUE HERE]`);
      } else if (envVar.required && result.valid) {
        logger.info(`\n✅ ${envVar.name} (REQUIRED - SET)`);
        logger.info(`   Description: ${envVar.description}`);
        logger.info(`   Current: ${this.maskSensitiveValue(envVar.name, currentValue)}`);
      } else if (!envVar.required && !result.valid) {
        logger.info(`\n⚠️ ${envVar.name} (OPTIONAL - NOT SET)`);
        logger.info(`   Description: ${envVar.description}`);
        logger.info(`   Example: [SET YOUR VALUE HERE]`);
      }
    });
  }

  private maskSensitiveValue(name: string, value: string | undefined): string {
    if (!value) return 'NOT SET';
    
    const sensitiveKeys = ['PASS', 'SECRET', 'TOKEN', 'KEY', 'URL'];
    const isSensitive = sensitiveKeys.some(key => name.toUpperCase().includes(key));
    
    if (isSensitive) {
      if (value.length <= 8) {
        return '*'.repeat(value.length);
      } else {
        return value.substring(0, 4) + '*'.repeat(value.length - 8) + value.substring(value.length - 4);
      }
    }
    
    return value;
  }
}

async function main() {
  const validator = new EnvironmentValidator();
  
  logger.info('🚀 Starting environment validation...');
  logger.info(`Environment: ${process.env.NODE_ENV || 'not set'}`);
  logger.info(`Platform: ${process.platform}`);
  logger.info(`Node Version: ${process.version}`);
  
  const isValid = validator.validate();
  
  validator.generateReport();
  validator.generateRailwayConfig();
  
  if (isValid) {
    logger.info('\n🎉 All required environment variables are valid!');
    logger.info('✅ Your Railway deployment should work correctly.');
  } else {
    logger.error('\n💥 Environment validation failed!');
    logger.error('❌ Please fix the required environment variables before deploying.');
    process.exit(1);
  }
}

// Run if this script is executed directly
if (require.main === module) {
  main().catch(error => {
    logger.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

export { EnvironmentValidator };
