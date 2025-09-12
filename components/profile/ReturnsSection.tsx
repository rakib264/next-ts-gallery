'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clock,
  Eye,
  Package,
  Plus,
  RefreshCw,
  Search,
  Truck
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ReturnRequest {
  _id: string;
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

const getStatusColor = (status: string) => {
  const colors: { [key: string]: string } = {
    pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    approved: 'bg-green-100 text-green-800 hover:bg-green-200',
    processing: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    shipped: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    delivered: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
    completed: 'bg-green-100 text-green-800 hover:bg-green-200',
    rejected: 'bg-red-100 text-red-800 hover:bg-red-200',
    cancelled: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
  };
  return colors[status] || 'bg-gray-100 text-gray-800 hover:bg-gray-200';
};

const getStatusIcon = (status: string) => {
  const icons: { [key: string]: any } = {
    pending: Clock,
    approved: CheckCircle,
    processing: RefreshCw,
    shipped: Truck,
    delivered: Package,
    completed: CheckCircle,
    rejected: AlertCircle,
    cancelled: AlertCircle
  };
  return icons[status] || Clock;
};

export default function ReturnsSection() {
  const { data: session } = useSession();
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (session?.user?.id) {
      fetchReturnRequests();
    }
  }, [session]);

  const fetchReturnRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/returns');
      const data = await response.json();
      
      if (response.ok) {
        setReturnRequests(data.returnRequests || []);
      } else {
        console.error('Error fetching return requests:', data.error);
      }
    } catch (error) {
      console.error('Error fetching return requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredRequests = returnRequests.filter(request => {
    const matchesSearch = 
      request.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.products.some(p => p.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const statusCounts = returnRequests.reduce((acc, request) => {
    acc[request.status] = (acc[request.status] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary-600 to-violet-600 text-white p-8">
          <CardTitle className="text-2xl text-white font-semibold flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-xl mr-3">
              <Package className="text-white" size={20} />
            </div>
            My Returns & Exchanges
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="py-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600" />
            <p className="text-slate-600">Loading your return requests...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
        {/* <CardHeader className="bg-gradient-to-r from-primary-600 to-violet-600 text-white p-8">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl text-white font-semibold flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-xl mr-3">
                <Package className="text-white" size={20} />
              </div>
              My Returns & Exchanges
            </CardTitle>
            <Link href="/returns">
              <Button className="group bg-white/20 hover:bg-white/30 text-white border-white/30">
                <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                New Request
              </Button>
            </Link>
          </div>
        </CardHeader> */}
        <CardContent className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Object.entries(statusCounts).map(([status, count]) => {
              const StatusIcon = getStatusIcon(status);
              return (
                <motion.div
                  key={status}
                  className="text-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-primary-500 to-violet-500 rounded-lg mx-auto mb-2">
                    <StatusIcon className="text-white" size={16} />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{count}</div>
                  <div className="text-sm text-slate-600 capitalize">{status}</div>
                </motion.div>
              );
            })}
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search-returns" className="text-sm font-semibold flex items-center mb-2 text-slate-700">
                <Search className="w-4 h-4 mr-2 text-primary-600" />
                Search Returns
              </Label>
              <Input
                id="search-returns"
                placeholder="Search by request ID, order ID, or product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 rounded-xl border-slate-200 focus:border-primary-500 focus:ring-primary-500/20 transition-all duration-300"
              />
            </div>
            <div className="md:w-48">
              <Label htmlFor="filter-status" className="text-sm font-semibold mb-2 block text-slate-700">
                Filter by Status
              </Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full h-12 rounded-xl border-slate-200 focus:border-primary-500 focus:ring-primary-500/20">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Return Requests List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredRequests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full mx-auto mb-4">
                <Package className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-700">No return requests found</h3>
              <p className="text-slate-500 mb-4">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'You haven\'t submitted any return or exchange requests yet'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <Link href="/returns">
                  <Button className="bg-gradient-to-r from-primary-600 to-violet-600 hover:from-primary-700 hover:to-violet-700 text-white px-6 py-3 rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    Submit Your First Request
                  </Button>
                </Link>
              )}
            </motion.div>
          ) : (
            filteredRequests.map((request, index) => {
              const StatusIcon = getStatusIcon(request.status);
              return (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group rounded-2xl overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-primary-500 to-violet-500 rounded-lg">
                              <StatusIcon className="text-white" size={18} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-slate-900">{request.requestId}</h3>
                              <p className="text-sm text-slate-600">
                                Order: {request.orderId} • {request.type === 'return' ? 'Return' : 'Exchange'}
                              </p>
                            </div>
                            <Badge className={`${getStatusColor(request.status)} text-xs font-medium px-3 py-1 rounded-full`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </Badge>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="font-medium mb-2 text-slate-700">Products</h4>
                              <div className="space-y-1">
                                {request.products.slice(0, 2).map((product, idx) => (
                                  <div key={idx} className="text-sm text-slate-600">
                                    {product.productName} (Qty: {product.quantity})
                                  </div>
                                ))}
                                {request.products.length > 2 && (
                                  <div className="text-sm text-slate-500">
                                    +{request.products.length - 2} more products
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2 text-slate-700">Request Details</h4>
                              <div className="space-y-1 text-sm text-slate-600">
                                <p>Reason: {request.reason}</p>
                                <p>Submitted: {formatDate(request.createdAt)}</p>
                                {request.trackingNumber && (
                                  <p>Tracking: {request.trackingNumber}</p>
                                )}
                              </div>
                            </div>
                          </div>

                          {request.statusHistory.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-medium mb-2 text-slate-700">Latest Update</h4>
                              <div className="flex items-center space-x-2 text-sm text-slate-600">
                                <Clock className="w-4 h-4" />
                                <span>{request.statusHistory[request.statusHistory.length - 1].message}</span>
                                <span>•</span>
                                <span>{formatDate(request.statusHistory[request.statusHistory.length - 1].timestamp)}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          <Link href={`/returns?track=${request.requestId}`}>
                            <Button variant="outline" size="sm" className="group border-slate-200 hover:border-primary-300 hover:bg-primary-50 text-slate-700 hover:text-primary-700">
                              <Eye className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                              View Details
                            </Button>
                          </Link>
                          <Link href="/returns">
                            <Button variant="ghost" size="sm" className="group text-slate-600 hover:text-primary-600 hover:bg-primary-50">
                              <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                              Track Status
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
