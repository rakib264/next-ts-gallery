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
    <div className="w-full space-y-8">

      <div className="w-full px-4 md:px-6 lg:px-8 space-y-8">
        {/* Enhanced Tracking Input with Gradient */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white via-gray-50 to-primary/5">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5"></div>
            <CardHeader className="relative pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-2xl font-bold text-gray-900">
                  <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary to-primary-600 rounded-2xl mr-4 shadow-lg">
                    <Search className="text-white" size={24} />
                  </div>
                  Track Your Return
                </CardTitle>
                <div className="px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full">
                  <span className="text-sm font-semibold text-primary">Real-time Tracking</span>
                </div>
              </div>
              <p className="text-gray-600 mt-3 text-lg">
                Enter your request ID or order number to track your return status
              </p>
            </CardHeader>
            <CardContent className="relative space-y-6">
              <div>
                <Label htmlFor="tracking-id" className="text-base font-bold flex items-center mb-4 text-gray-900">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg mr-3">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  Request ID or Order Number
                </Label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input
                    id="tracking-id"
                    placeholder="Enter your request ID or order number"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="flex-1 h-14 border-2 border-gray-200 focus:border-primary/50 transition-all duration-300 rounded-xl text-lg bg-white/80 backdrop-blur-sm shadow-inner"
                    onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
                  />
                  <Button 
                    onClick={handleTrack}
                    disabled={loading}
                    className="h-14 px-8 bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 min-w-[120px]"
                  >
                    {loading ? (
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Search className="w-5 h-5 mr-2" />
                    )}
                    Track
                  </Button>
                </div>
              </div>
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-center space-x-3 text-red-700">
                    <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                      <AlertCircle size={18} />
                    </div>
                    <span className="font-medium">{error}</span>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

      {/* Return Request Details */}
      <AnimatePresence>
        {returnRequest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Enhanced Request Overview */}
            <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white via-gray-50 to-green-50">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-primary/5"></div>
              <CardHeader className="relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle className="flex items-center text-2xl font-bold text-gray-900">
                    <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mr-4 shadow-lg">
                      <CheckCircle className="text-white" size={24} />
                    </div>
                    Return Request Details
                  </CardTitle>
                  <Badge className={`${getStatusColor(returnRequest.status)} px-4 py-2 text-base font-semibold rounded-full shadow-md`}>
                    {returnRequest.status.charAt(0).toUpperCase() + returnRequest.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
                      <h4 className="font-bold mb-4 flex items-center text-xl text-gray-900">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-xl mr-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        Request Information
                      </h4>
                      <div className="space-y-3 text-base">
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600 font-medium">Request ID:</span>
                          <span className="font-mono font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">{returnRequest.requestId}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600 font-medium">Order ID:</span>
                          <span className="font-mono font-semibold text-gray-800">{returnRequest.orderId}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600 font-medium">Type:</span>
                          <span className="capitalize font-semibold text-gray-800 bg-primary/10 px-3 py-1 rounded-lg">{returnRequest.type}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600 font-medium">Reason:</span>
                          <span className="text-gray-800 font-medium">{returnRequest.reason}</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-gray-600 font-medium">Submitted:</span>
                          <span className="text-gray-800 font-medium">{formatDate(returnRequest.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
                      <h4 className="font-bold mb-4 flex items-center text-xl text-gray-900">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-xl mr-3">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        Customer Information
                      </h4>
                      <div className="space-y-3 text-base">
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600 font-medium">Name:</span>
                          <span className="text-gray-800 font-semibold">{returnRequest.customerName}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600 font-medium">Email:</span>
                          <span className="text-gray-800 font-medium">{returnRequest.email}</span>
                        </div>
                        {returnRequest.phone && (
                          <div className="flex items-center justify-between py-2">
                            <span className="text-gray-600 font-medium">Phone:</span>
                            <span className="text-gray-800 font-medium">{returnRequest.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Progress Bar */}
                <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 p-8 rounded-3xl shadow-inner border border-primary/20">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-3xl"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary to-primary-600 rounded-2xl shadow-lg">
                          <RefreshCw className="text-white" size={20} />
                        </div>
                        <div>
                          <span className="text-xl font-bold text-gray-900">Overall Progress</span>
                          <p className="text-gray-600">Track your request status</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent">{getProgressPercentage(returnRequest.status)}%</span>
                        <p className="text-sm text-gray-600 font-medium">Complete</p>
                      </div>
                    </div>
                    <div className="relative">
                      <Progress value={getProgressPercentage(returnRequest.status)} className="h-4 bg-white/50 rounded-full shadow-inner" />
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-sm"></div>
                    </div>
                    <p className="text-center mt-4 text-gray-700 font-medium text-lg">
                      Current status: <span className="font-bold text-primary">{returnRequest.status.charAt(0).toUpperCase() + returnRequest.status.slice(1)}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Status Timeline with Gradient Stepper */}
            <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white via-blue-50/50 to-primary/5">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-primary/5"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center text-2xl font-bold text-gray-900">
                  <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mr-4 shadow-lg">
                    <Clock className="text-white" size={24} />
                  </div>
                  Status Timeline
                </CardTitle>
                <p className="text-gray-600 mt-2 text-lg">Track your return progress step by step</p>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-6">
                  {statusSteps[returnRequest.status]?.map((step, index) => (
                    <motion.div 
                      key={index} 
                      className="relative"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {/* Connecting Line */}
                      {index < statusSteps[returnRequest.status].length - 1 && (
                        <div className="absolute left-8 top-16 w-0.5 h-12 bg-gradient-to-b from-gray-200 to-gray-300 z-0"></div>
                      )}
                      
                      <div className={`relative flex items-start space-x-6 p-6 rounded-2xl transition-all duration-300 ${
                        step.completed 
                          ? 'bg-gradient-to-r from-green-50 to-green-100/50 border-2 border-green-200 shadow-lg' 
                          : 'bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-gray-300'
                      }`}>
                        {/* Step Icon */}
                        <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg transition-all duration-300 ${
                          step.completed 
                            ? 'bg-gradient-to-br from-green-500 to-green-600 scale-110' 
                            : 'bg-gradient-to-br from-gray-300 to-gray-400'
                        }`}>
                          <step.icon className="text-white" size={24} />
                        </div>
                        
                        {/* Step Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                            <h3 className={`text-xl font-bold ${
                              step.completed ? 'text-gray-900' : 'text-gray-600'
                            }`}>
                              {step.status}
                            </h3>
                            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                              step.completed 
                                ? 'bg-green-200 text-green-800 border border-green-300' 
                                : 'bg-gray-200 text-gray-600 border border-gray-300'
                            }`}>
                              {step.date || 'Pending'}
                            </div>
                          </div>
                          
                          <p className={`text-base leading-relaxed ${
                            step.completed ? 'text-gray-700' : 'text-gray-500'
                          }`}>
                            {step.description}
                          </p>
                          
                          {step.completed && (
                            <motion.div 
                              className="flex items-center mt-3"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              <div className="flex items-center justify-center w-6 h-6 bg-green-500 rounded-full mr-2">
                                <CheckCircle className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-sm font-semibold text-green-700">Completed Successfully</span>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Progress Indicator */}
                <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-gray-900">Timeline Progress</span>
                    <span className="text-lg font-bold text-primary">
                      {statusSteps[returnRequest.status]?.filter(step => step.completed).length || 0} of {statusSteps[returnRequest.status]?.length || 0} Steps
                    </span>
                  </div>
                  <div className="relative">
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                          width: `${((statusSteps[returnRequest.status]?.filter(step => step.completed).length || 0) / (statusSteps[returnRequest.status]?.length || 1)) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Products Section */}
            <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white via-purple-50/50 to-secondary/5">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-secondary/5"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center text-2xl font-bold text-gray-900">
                  <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mr-4 shadow-lg">
                    <Package className="text-white" size={24} />
                  </div>
                  Products to {returnRequest.type === 'return' ? 'Return' : 'Exchange'}
                </CardTitle>
                <p className="text-gray-600 mt-2 text-lg">Items included in your request</p>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-6">
                  {returnRequest.products.map((product, index) => (
                    <motion.div 
                      key={index}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-900 mb-4">{product.productName}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                              <span className="text-gray-600 font-medium">Quantity:</span>
                              <span className="font-semibold text-gray-900 bg-primary/10 px-3 py-1 rounded-lg">{product.quantity}</span>
                            </div>
                            {product.variant && (
                              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-600 font-medium">Variant:</span>
                                <span className="text-gray-800 font-medium">{product.variant}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                              <span className="text-gray-600 font-medium">Reason:</span>
                              <span className="text-gray-800 font-medium">{product.reason}</span>
                            </div>
                            {product.details && (
                              <div className="col-span-full">
                                <span className="text-gray-600 font-medium">Details:</span>
                                <p className="text-gray-800 font-medium mt-1 bg-gray-50 p-3 rounded-lg">{product.details}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Additional Information */}
            {(returnRequest.details || returnRequest.adminNotes || returnRequest.trackingNumber) && (
              <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white via-orange-50/50 to-orange-100/20">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-yellow-500/5"></div>
                <CardHeader className="relative">
                  <CardTitle className="flex items-center text-2xl font-bold text-gray-900">
                    <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mr-4 shadow-lg">
                      <FileText className="text-white" size={24} />
                    </div>
                    Additional Information
                  </CardTitle>
                  <p className="text-gray-600 mt-2 text-lg">Extra details about your request</p>
                </CardHeader>
                <CardContent className="relative space-y-6">
                  {returnRequest.details && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
                      <h4 className="text-xl font-bold mb-4 text-gray-900 flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mr-3">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        Customer Details
                      </h4>
                      <p className="text-base text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl">{returnRequest.details}</p>
                    </div>
                  )}
                  
                  {returnRequest.adminNotes && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
                      <h4 className="text-xl font-bold mb-4 text-gray-900 flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mr-3">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        Admin Notes
                      </h4>
                      <p className="text-base text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl">{returnRequest.adminNotes}</p>
                    </div>
                  )}
                  
                  {returnRequest.trackingNumber && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
                      <h4 className="text-xl font-bold mb-4 flex items-center text-gray-900">
                        <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg mr-3">
                          <Truck className="w-4 h-4 text-purple-600" />
                        </div>
                        Tracking Information
                      </h4>
                      <div className="space-y-3 text-base">
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600 font-medium">Tracking Number:</span>
                          <span className="font-mono font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">{returnRequest.trackingNumber}</span>
                        </div>
                        {returnRequest.courierName && (
                          <div className="flex items-center justify-between py-2">
                            <span className="text-gray-600 font-medium">Courier:</span>
                            <span className="text-gray-800 font-semibold">{returnRequest.courierName}</span>
                          </div>
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

    </div>
  );
}
