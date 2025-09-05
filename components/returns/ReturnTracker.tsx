'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    CheckCircle,
    Clock,
    FileText,
    Package,
    RefreshCw,
    Search,
    Truck,
    User
} from 'lucide-react';
import { useState } from 'react';

interface StatusStep {
  status: string;
  date: string;
  completed: boolean;
  icon: any;
  color: string;
  description: string;
}

interface ReturnRequest {
  requestId: string;
  orderId: string;
  customerName: string;
  email: string;
  phone: string;
  type: 'return' | 'exchange';
  reason: string;
  details: string;
  products: {
    productName: string;
    quantity: number;
    variant?: string;
    reason: string;
    details?: string;
  }[];
  attachments: string[];
  status: string;
  statusHistory: {
    status: string;
    message: string;
    timestamp: string;
    updatedBy?: string;
  }[];
  adminNotes?: string;
  refundAmount?: number;
  refundMethod?: string;
  trackingNumber?: string;
  courierName?: string;
  createdAt: string;
  updatedAt: string;
}

const statusSteps: { [key: string]: StatusStep[] } = {
  pending: [
    { status: 'Request Submitted', date: '', completed: true, icon: FileText, color: 'bg-blue-500', description: 'Your return request has been submitted' },
    { status: 'Under Review', date: '', completed: false, icon: Clock, color: 'bg-yellow-500', description: 'We are reviewing your request' },
    { status: 'Approval Decision', date: '', completed: false, icon: CheckCircle, color: 'bg-gray-400', description: 'Awaiting approval decision' },
    { status: 'Processing', date: '', completed: false, icon: RefreshCw, color: 'bg-gray-400', description: 'Processing your request' },
    { status: 'Completed', date: '', completed: false, icon: CheckCircle, color: 'bg-gray-400', description: 'Request completed' }
  ],
  approved: [
    { status: 'Request Submitted', date: '', completed: true, icon: FileText, color: 'bg-blue-500', description: 'Your return request has been submitted' },
    { status: 'Under Review', date: '', completed: true, icon: Clock, color: 'bg-yellow-500', description: 'We reviewed your request' },
    { status: 'Approved', date: '', completed: true, icon: CheckCircle, color: 'bg-green-500', description: 'Your request has been approved' },
    { status: 'Processing', date: '', completed: false, icon: RefreshCw, color: 'bg-orange-500', description: 'Processing your request' },
    { status: 'Completed', date: '', completed: false, icon: CheckCircle, color: 'bg-gray-400', description: 'Request completed' }
  ],
  processing: [
    { status: 'Request Submitted', date: '', completed: true, icon: FileText, color: 'bg-blue-500', description: 'Your return request has been submitted' },
    { status: 'Under Review', date: '', completed: true, icon: Clock, color: 'bg-yellow-500', description: 'We reviewed your request' },
    { status: 'Approved', date: '', completed: true, icon: CheckCircle, color: 'bg-green-500', description: 'Your request has been approved' },
    { status: 'Processing', date: '', completed: true, icon: RefreshCw, color: 'bg-orange-500', description: 'Processing your request' },
    { status: 'Completed', date: '', completed: false, icon: CheckCircle, color: 'bg-gray-400', description: 'Request completed' }
  ],
  shipped: [
    { status: 'Request Submitted', date: '', completed: true, icon: FileText, color: 'bg-blue-500', description: 'Your return request has been submitted' },
    { status: 'Under Review', date: '', completed: true, icon: Clock, color: 'bg-yellow-500', description: 'We reviewed your request' },
    { status: 'Approved', date: '', completed: true, icon: CheckCircle, color: 'bg-green-500', description: 'Your request has been approved' },
    { status: 'Processing', date: '', completed: true, icon: RefreshCw, color: 'bg-orange-500', description: 'Processing your request' },
    { status: 'Shipped', date: '', completed: true, icon: Truck, color: 'bg-purple-500', description: 'Package has been shipped' },
    { status: 'Completed', date: '', completed: false, icon: CheckCircle, color: 'bg-gray-400', description: 'Request completed' }
  ],
  completed: [
    { status: 'Request Submitted', date: '', completed: true, icon: FileText, color: 'bg-blue-500', description: 'Your return request has been submitted' },
    { status: 'Under Review', date: '', completed: true, icon: Clock, color: 'bg-yellow-500', description: 'We reviewed your request' },
    { status: 'Approved', date: '', completed: true, icon: CheckCircle, color: 'bg-green-500', description: 'Your request has been approved' },
    { status: 'Processing', date: '', completed: true, icon: RefreshCw, color: 'bg-orange-500', description: 'Processing your request' },
    { status: 'Shipped', date: '', completed: true, icon: Truck, color: 'bg-purple-500', description: 'Package has been shipped' },
    { status: 'Completed', date: '', completed: true, icon: CheckCircle, color: 'bg-green-500', description: 'Request completed successfully' }
  ],
  rejected: [
    { status: 'Request Submitted', date: '', completed: true, icon: FileText, color: 'bg-blue-500', description: 'Your return request has been submitted' },
    { status: 'Under Review', date: '', completed: true, icon: Clock, color: 'bg-yellow-500', description: 'We reviewed your request' },
    { status: 'Rejected', date: '', completed: true, icon: AlertCircle, color: 'bg-red-500', description: 'Request has been rejected' }
  ]
};

const getStatusColor = (status: string) => {
  const colors: { [key: string]: string } = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-indigo-100 text-indigo-800',
    completed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getProgressPercentage = (status: string) => {
  const percentages: { [key: string]: number } = {
    pending: 20,
    approved: 40,
    processing: 60,
    shipped: 80,
    delivered: 90,
    completed: 100,
    rejected: 100,
    cancelled: 100
  };
  return percentages[status] || 0;
};

export default function ReturnTracker() {
  const [trackingId, setTrackingId] = useState('');
  const [returnRequest, setReturnRequest] = useState<ReturnRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async () => {
    if (!trackingId.trim()) {
      setError('Please enter a request ID or order number');
      return;
    }

    setLoading(true);
    setError('');
    setReturnRequest(null);

    try {
      const response = await fetch(`/api/returns?requestId=${trackingId}&orderId=${trackingId}`);
      const data = await response.json();

      if (response.ok) {
        setReturnRequest(data.returnRequest);
      } else {
        setError(data.error || 'Return request not found');
      }
    } catch (err) {
      setError('Failed to fetch return request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Tracking Input */}
      <Card className="border-2 hover:border-primary/20 transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-xl mr-3">
              <Search className="text-primary" size={20} />
            </div>
            Track Your Return
          </CardTitle>
          <p className="text-muted-foreground">
            Enter your request ID or order number to track your return status
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="tracking-id" className="text-sm font-semibold flex items-center mb-2">
              <Package className="w-4 h-4 mr-2 text-primary" />
              Request ID or Order Number
            </Label>
            <div className="flex space-x-3">
              <Input
                id="tracking-id"
                placeholder="Enter your request ID or order number"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="flex-1 h-12 border-2 focus:border-primary/50 transition-colors"
                onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
              />
              <Button 
                onClick={handleTrack}
                disabled={loading}
                className="h-12 px-6"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Track
              </Button>
            </div>
          </div>
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4"
            >
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle size={16} />
                <span className="text-sm">{error}</span>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Return Request Details */}
      <AnimatePresence>
        {returnRequest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Request Overview */}
            <Card className="border-2 hover:border-primary/20 transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-xl">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-500/10 rounded-xl mr-3">
                      <CheckCircle className="text-green-500" size={20} />
                    </div>
                    Return Request Details
                  </CardTitle>
                  <Badge className={getStatusColor(returnRequest.status)}>
                    {returnRequest.status.charAt(0).toUpperCase() + returnRequest.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-primary" />
                        Request Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">Request ID:</span> <span className="font-mono font-semibold">{returnRequest.requestId}</span></p>
                        <p><span className="text-muted-foreground">Order ID:</span> <span className="font-mono">{returnRequest.orderId}</span></p>
                        <p><span className="text-muted-foreground">Type:</span> <span className="capitalize">{returnRequest.type}</span></p>
                        <p><span className="text-muted-foreground">Reason:</span> {returnRequest.reason}</p>
                        <p><span className="text-muted-foreground">Submitted:</span> {formatDate(returnRequest.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center">
                        <User className="w-4 h-4 mr-2 text-primary" />
                        Customer Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">Name:</span> {returnRequest.customerName}</p>
                        <p><span className="text-muted-foreground">Email:</span> {returnRequest.email}</p>
                        {returnRequest.phone && (
                          <p><span className="text-muted-foreground">Phone:</span> {returnRequest.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm font-bold text-primary">{getProgressPercentage(returnRequest.status)}%</span>
                  </div>
                  <Progress value={getProgressPercentage(returnRequest.status)} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Current status: {returnRequest.status.charAt(0).toUpperCase() + returnRequest.status.slice(1)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Status Timeline */}
            <Card className="border-2 hover:border-primary/20 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-500/10 rounded-xl mr-3">
                    <Clock className="text-blue-500" size={20} />
                  </div>
                  Status Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statusSteps[returnRequest.status]?.map((step, index) => (
                    <motion.div 
                      key={index} 
                      className="flex items-center space-x-4 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        step.completed ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <step.icon className={`${
                          step.completed ? 'text-green-500' : 'text-gray-400'
                        }`} size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className={`font-medium ${
                            step.completed ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {step.status}
                          </span>
                          <span className={`text-sm px-2 py-1 rounded-full ${
                            step.completed 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {step.date || 'Pending'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                        {step.completed && (
                          <div className="flex items-center mt-1">
                            <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                            <span className="text-xs text-green-600">Completed</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Products */}
            <Card className="border-2 hover:border-primary/20 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <div className="flex items-center justify-center w-10 h-10 bg-purple-500/10 rounded-xl mr-3">
                    <Package className="text-purple-500" size={20} />
                  </div>
                  Products to {returnRequest.type === 'return' ? 'Return' : 'Exchange'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {returnRequest.products.map((product, index) => (
                    <motion.div 
                      key={index}
                      className="p-4 bg-muted/50 rounded-lg"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold">{product.productName}</h4>
                          <div className="text-sm text-muted-foreground mt-1 space-y-1">
                            <p>Quantity: {product.quantity}</p>
                            {product.variant && <p>Variant: {product.variant}</p>}
                            <p>Reason: {product.reason}</p>
                            {product.details && <p>Details: {product.details}</p>}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            {(returnRequest.details || returnRequest.adminNotes || returnRequest.trackingNumber) && (
              <Card className="border-2 hover:border-primary/20 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <div className="flex items-center justify-center w-10 h-10 bg-orange-500/10 rounded-xl mr-3">
                      <FileText className="text-orange-500" size={20} />
                    </div>
                    Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {returnRequest.details && (
                    <div>
                      <h4 className="font-semibold mb-2">Customer Details</h4>
                      <p className="text-sm text-muted-foreground">{returnRequest.details}</p>
                    </div>
                  )}
                  
                  {returnRequest.adminNotes && (
                    <div>
                      <h4 className="font-semibold mb-2">Admin Notes</h4>
                      <p className="text-sm text-muted-foreground">{returnRequest.adminNotes}</p>
                    </div>
                  )}
                  
                  {returnRequest.trackingNumber && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center">
                        <Truck className="w-4 h-4 mr-2" />
                        Tracking Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">Tracking Number:</span> <span className="font-mono font-semibold">{returnRequest.trackingNumber}</span></p>
                        {returnRequest.courierName && (
                          <p><span className="text-muted-foreground">Courier:</span> {returnRequest.courierName}</p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
