import mongoose from 'mongoose';

// Import all models to ensure they are registered
import './models/AuditLog';
import './models/Banner';
import './models/Blog';
import './models/Category';
import './models/Coupon';
import './models/GeneralSettings';
import './models/Order';
import './models/PaymentSettings';
import './models/Product';
import './models/ReturnExchangeRequest';
import './models/ReturnRequest';
import './models/User';

const PRIMARY_MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://invalid/placeholder';
const FALLBACK_MONGODB_URI = process.env.MONGODB_URI_FALLBACK || 'mongodb://127.0.0.1:27017/smartcommerce-bd';

let cached = (global as any).mongoose as
  | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
  | undefined;

if (!cached) {
  (global as any).mongoose = { conn: null, promise: null };
  cached = (global as any).mongoose;
}

function isDnsSrvFailure(error: unknown): boolean {
  const err = error as any;
  return (
    !!err &&
    (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') &&
    (err.syscall === 'querySrv' || /querySrv/i.test(String(err.message)))
  );
}

async function connectDB() {
  if (cached && cached.conn) {
    return cached.conn;
  }

  const opts = {
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000,
  } as const;

  // First attempt: primary URI (likely Atlas SRV)
  try {
    if (!cached!.promise) {
      cached!.promise = mongoose.connect(PRIMARY_MONGODB_URI, opts);
    }
    cached!.conn = await cached!.promise;
    return cached!.conn;
  } catch (primaryError) {
    // If the primary URI fails due to DNS SRV lookup issues, try local fallback
    if (isDnsSrvFailure(primaryError)) {
      console.warn(
        '[MongoDB] Primary connection failed due to DNS SRV lookup. Falling back to local MongoDB at 127.0.0.1.'
      );
      try {
        cached!.promise = null;
        cached!.promise = mongoose.connect(FALLBACK_MONGODB_URI, opts);
        cached!.conn = await cached!.promise;
        return cached!.conn;
      } catch (fallbackError) {
        cached!.promise = null;
        throw fallbackError;
      }
    }
    // Non-DNS errors: rethrow
    cached!.promise = null;
    throw primaryError;
  }
}

export default connectDB;