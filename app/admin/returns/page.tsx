'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationWrapper } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PAGE_SIZE_OPTIONS } from '@/constants';
import { toast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { gsap } from 'gsap';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  Eye,
  FileText,
  MapPin,
  Package,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Truck,
  User,
  X
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ReturnRequest {
  _id: string;
  requestId: string;
  orderId: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
  };
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

interface Order {
  _id: string;
  orderNumber: string;
  customer?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  items: {
    product: {
      _id: string;
      name: string;
      thumbnailImage?: string;
    };
    name: string;
    price: number;
    quantity: number;
    variant?: string;
    image?: string;
  }[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  shippingAddress: {
    name: string;
    phone: string;
    email?: string;
    street: string;
    city: string;
    district: string;
    division: string;
    postalCode?: string;
  };
  createdAt: string;
  updatedAt: string;
}

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

export default function AdminReturnsPage() {
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<ReturnRequest | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZE_OPTIONS[0]);
  const { showDeleteConfirmation, DeleteConfirmationComponent } = useDeleteConfirmationDialog();
  const [updateData, setUpdateData] = useState({
    status: '',
    message: '',
    adminNotes: '',
    refundAmount: '',
    refundMethod: '',
    trackingNumber: '',
    courierName: ''
  });

  // Animation refs
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchReturnRequests(currentPage);
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchReturnRequests();
    
    // Enhanced GSAP animations with staggered entrance
    const tl = gsap.timeline({ delay: 0.2 });
    
    if (headerRef.current) {
      tl.fromTo(headerRef.current, 
        { opacity: 0, y: -30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power2.out" }
      );
    }
    
    if (statsRef.current) {
      tl.fromTo(statsRef.current.children, 
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.7)" },
        "-=0.4"
      );
    }
    
    if (containerRef.current) {
      tl.fromTo(containerRef.current.children, 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power2.out" },
        "-=0.2"
      );
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (currentPage === 1) {
        fetchReturnRequests(1);
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, filterStatus]);

  const clearSearch = () => {
    setSearchTerm('');
  };

  const fetchReturnRequests = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm,
        status: filterStatus === 'all' ? '' : filterStatus
      });
      
      const response = await fetch(`/api/admin/returns?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setReturnRequests(data.returnRequests || []);
        setTotalPages(data.pagination?.pages || 1);
        setTotalCount(data.pagination?.total || 0);
        setCurrentPage(page);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to fetch return requests',
          variant: 'error'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch return requests',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderByNumber = async (orderNumber: string) => {
    if (!orderNumber.trim()) return;
    
    try {
      setOrderLoading(true);
      const response = await fetch(`/api/admin/orders/by-number?orderNumber=${encodeURIComponent(orderNumber)}`);
      const data = await response.json();
      
      if (response.ok) {
        setOrderData(data.order);
        // Auto-populate refund amount from order total
        if (data.order && !updateData.refundAmount) {
          setUpdateData(prev => ({
            ...prev,
            refundAmount: data.order.total.toString()
          }));
        }
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Order not found',
          variant: 'error'
        });
        setOrderData(null);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch order details',
        variant: 'error'
      });
      setOrderData(null);
    } finally {
      setOrderLoading(false);
    }
  };

  const handleUpdateRequest = async () => {
    if (!selectedRequest) return;

    try {
      const response = await fetch(`/api/admin/returns/${selectedRequest._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updateData,
          refundAmount: updateData.refundAmount ? parseFloat(updateData.refundAmount) : undefined
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Return request updated successfully'
        });
        setShowUpdateModal(false);
        setShowRefundDialog(false);
        setSelectedRequest(null);
        setOrderData(null);
        setOrderSearchTerm('');
        setUpdateData({
          status: '',
          message: '',
          adminNotes: '',
          refundAmount: '',
          refundMethod: '',
          trackingNumber: '',
          courierName: ''
        });
        fetchReturnRequests();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update return request',
          variant: 'error'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update return request',
        variant: 'error'
      });
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    showDeleteConfirmation({
      title: 'Delete Return Request',
      description: `Are you sure you want to delete return request ${requestId}? This action cannot be undone and will permanently remove all associated data.`,
      entityName: 'return request',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/admin/returns?requestId=${requestId}`, {
            method: 'DELETE'
          });

          const data = await response.json();

          if (response.ok) {
            toast({
              title: 'Success',
              description: 'Return request deleted successfully'
            });
            fetchReturnRequests(currentPage);
          } else {
            toast({
              title: 'Error',
              description: data.error || 'Failed to delete return request',
              variant: 'error'
            });
          }
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to delete return request',
            variant: 'error'
          });
        }
      }
    });
  };

  const openUpdateModal = (request: ReturnRequest) => {
    setSelectedRequest(request);
    setUpdateData({
      status: request.status,
      message: '',
      adminNotes: request.adminNotes || '',
      refundAmount: request.refundAmount?.toString() || '',
      refundMethod: request.refundMethod || '',
      trackingNumber: request.trackingNumber || '',
      courierName: request.courierName || ''
    });
    setShowUpdateModal(true);
  };

  const openRefundDialog = (request: ReturnRequest) => {
    setSelectedRequest(request);
    setOrderSearchTerm(request.orderId);
    setUpdateData({
      status: request.status,
      message: '',
      adminNotes: request.adminNotes || '',
      refundAmount: request.refundAmount?.toString() || '',
      refundMethod: request.refundMethod || '',
      trackingNumber: request.trackingNumber || '',
      courierName: request.courierName || ''
    });
    setShowRefundDialog(true);
    // Auto-fetch order if orderId is provided
    if (request.orderId) {
      fetchOrderByNumber(request.orderId);
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

  const filteredRequests = returnRequests; // No client-side filtering needed since we have server-side pagination

  const statusCounts = returnRequests.reduce((acc, request) => {
    acc[request.status] = (acc[request.status] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <motion.div 
            className="relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full blur-xl opacity-30 animate-pulse" />
            <motion.div 
              className="relative animate-spin rounded-full h-32 w-32 border-4 border-primary-200 border-t-primary-600"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="text-primary-600" size={32} />
            </motion.div>
          </motion.div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-secondary-50/30">
        <div 
          ref={containerRef} 
          className="space-y-8 p-4 sm:p-6 lg:p-8"
        >
          {/* Stunning Header Section */}
          <motion.div 
            ref={headerRef}
            className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700 rounded-3xl shadow-2xl border border-primary-200/20"
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Animated background elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/10"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-48 translate-x-48 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-white/5 to-transparent rounded-full translate-y-32 -translate-x-32 animate-pulse"></div>
            
            {/* Header Content */}
            <div className="relative p-6 sm:p-8 lg:p-12">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                      <RefreshCw className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl lg:text-4xl font-bold text-white">
                        Return & Exchange Management
                      </h1>
                      <p className="text-white/80 text-lg">
                        Manage customer return and exchange requests
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      onClick={() => fetchReturnRequests(currentPage)}
                      className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300 px-6 py-3 rounded-xl font-semibold"
                    >
                      <RefreshCw className="w-5 h-5 mr-2" />
                      Refresh
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Stats Cards */}
          <motion.div 
            ref={statsRef}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8"
          >
            {Object.entries(statusCounts).map(([status, count]) => {
              const StatusIcon = getStatusIcon(status);
              return (
                <motion.div
                  key={status}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="group"
                >
                  <Card className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:shadow-xl transition-all duration-500">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-400/20 to-transparent rounded-full blur-xl" />
                    <CardContent className="relative p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{count}</p>
                          <p className="text-sm text-gray-600 capitalize font-medium">{status}</p>
                        </div>
                        <div className="p-3 bg-primary-200/50 rounded-2xl group-hover:bg-primary-300/50 transition-colors">
                          <StatusIcon className="text-primary-700" size={18} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Enhanced Search and Filter Bar */}
          <Card className="bg-white/80 backdrop-blur-lg rounded-2xl border border-primary-200/50 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search-returns" className="text-sm font-semibold flex items-center mb-2 text-gray-700">
                <Search className="w-4 h-4 mr-2 text-primary" />
                Search Returns
              </Label>
              <div className="relative">
                <Input
                  id="search-returns"
                  placeholder="Search by request ID, order ID, customer name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-11 bg-white border-gray-200 focus:border-primary focus:ring-primary/20 pr-10"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="md:w-48">
              <Label htmlFor="filter-status" className="text-sm font-semibold mb-2 block text-gray-700">
                Filter by Status
              </Label>
              <select
                id="filter-status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full h-11 px-3 py-2 border border-gray-200 bg-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

          {/* Enhanced Return Requests Table */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-lg rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Package className="w-5 h-5 mr-2 text-primary" />
              Return Requests
            </div>
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} requests
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <AnimatePresence>
              {filteredRequests.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full mx-auto mb-4">
                    <Package className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No return requests found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'No return requests have been submitted yet'
                    }
                  </p>
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
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 border-gray-200 bg-gradient-to-r from-white to-gray-50/50">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                                  <StatusIcon className="text-primary" size={18} />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg">{request.requestId}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    Order: {request.orderId} • {request.type === 'return' ? 'Return' : 'Exchange'}
                                  </p>
                                </div>
                                <Badge className={getStatusColor(request.status)}>
                                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </Badge>
                              </div>

                              <div className="grid md:grid-cols-3 gap-4 mb-4">
                                <div>
                                  <h4 className="font-medium mb-2">Customer</h4>
                                  <div className="text-sm text-muted-foreground space-y-1">
                                    <p>{request.customerName}</p>
                                    <p>{request.email}</p>
                                    {request.phone && <p>{request.phone}</p>}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Products</h4>
                                  <div className="space-y-1">
                                    {request.products.slice(0, 2).map((product, idx) => (
                                      <div key={idx} className="text-sm text-muted-foreground">
                                        {product.productName} (Qty: {product.quantity})
                                      </div>
                                    ))}
                                    {request.products.length > 2 && (
                                      <div className="text-sm text-muted-foreground">
                                        +{request.products.length - 2} more products
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Request Details</h4>
                                  <div className="space-y-1 text-sm text-muted-foreground">
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
                                  <h4 className="font-medium mb-2">Latest Update</h4>
                                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                    <Clock className="w-4 h-4" />
                                    <span>{request.statusHistory[request.statusHistory.length - 1].message}</span>
                                    <span>•</span>
                                    <span>{formatDate(request.statusHistory[request.statusHistory.length - 1].timestamp)}</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col space-y-2 ml-4">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => openRefundDialog(request)}
                                className="bg-white hover:bg-primary hover:text-white border-primary/20 text-primary hover:border-primary transition-all duration-200"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                              {/* <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => openUpdateModal(request)}
                                className="bg-white hover:bg-gray-100 border-gray-200 text-gray-700"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Update
                              </Button> */}
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleDeleteRequest(request.requestId)}
                                className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800 transition-all duration-200"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </Button>
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
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Items per page selector */}
        <div className="flex items-center gap-2">
          <Label htmlFor="items-per-page" className="text-sm text-gray-600">
            Items per page:
          </Label>
          <Select value={itemsPerPage.toString()} onValueChange={(value) => {
            setItemsPerPage(parseInt(value));
            setCurrentPage(1);
          }}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <PaginationWrapper>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                    }
                  }}
                  className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-primary hover:text-white'}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(pageNum);
                      }}
                      isActive={currentPage === pageNum}
                      className={`cursor-pointer transition-all duration-200 ${
                        currentPage === pageNum 
                          ? 'bg-primary text-white border-primary' 
                          : 'hover:bg-primary/10 hover:text-primary'
                      }`}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) {
                      setCurrentPage(currentPage + 1);
                    }
                  }}
                  className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-primary hover:text-white'}
                />
              </PaginationItem>
            </PaginationContent>
          </PaginationWrapper>
        )}
      </div>

      {/* Update Modal */}
      <AnimatePresence>
        {showUpdateModal && selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowUpdateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">Update Return Request</h2>
              <p className="text-muted-foreground mb-6">
                Request ID: {selectedRequest.requestId}
              </p>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={updateData.status} onValueChange={(value) => setUpdateData({...updateData, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
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

                <div>
                  <Label htmlFor="message">Status Message</Label>
                  <Input
                    id="message"
                    placeholder="Enter status update message"
                    value={updateData.message}
                    onChange={(e) => setUpdateData({...updateData, message: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="adminNotes">Admin Notes</Label>
                  <Textarea
                    id="adminNotes"
                    placeholder="Enter admin notes"
                    value={updateData.adminNotes}
                    onChange={(e) => setUpdateData({...updateData, adminNotes: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="refundAmount">Refund Amount</Label>
                    <Input
                      id="refundAmount"
                      type="number"
                      placeholder="0.00"
                      value={updateData.refundAmount}
                      onChange={(e) => setUpdateData({...updateData, refundAmount: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="refundMethod">Refund Method</Label>
                    <Select value={updateData.refundMethod} onValueChange={(value) => setUpdateData({...updateData, refundMethod: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="original_payment">Original Payment</SelectItem>
                        <SelectItem value="store_credit">Store Credit</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="trackingNumber">Tracking Number</Label>
                    <Input
                      id="trackingNumber"
                      placeholder="Enter tracking number"
                      value={updateData.trackingNumber}
                      onChange={(e) => setUpdateData({...updateData, trackingNumber: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="courierName">Courier Name</Label>
                    <Input
                      id="courierName"
                      placeholder="Enter courier name"
                      value={updateData.courierName}
                      onChange={(e) => setUpdateData({...updateData, courierName: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={() => setShowUpdateModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateRequest}>
                  Update Request
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Refund Details Dialog */}
      <AnimatePresence>
        {showRefundDialog && selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowRefundDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold flex items-center">
                    <CreditCard className="w-6 h-6 mr-2 text-primary" />
                    Refund Details & Order Information
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    Request ID: {selectedRequest.requestId}
                  </p>
                </div>
                <Button variant="outline" onClick={() => setShowRefundDialog(false)}>
                  Close
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Search Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Search className="w-5 h-5 mr-2" />
                      Order Lookup
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="orderSearch">Order Number</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="orderSearch"
                          placeholder="Enter order number (e.g., ORD-17652398)"
                          value={orderSearchTerm}
                          onChange={(e) => setOrderSearchTerm(e.target.value)}
                          className="flex-1"
                        />
                        <Button 
                          onClick={() => fetchOrderByNumber(orderSearchTerm)}
                          disabled={orderLoading || !orderSearchTerm.trim()}
                        >
                          {orderLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Search className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {orderData && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center mb-2">
                            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                            <span className="font-semibold text-green-800">Order Found</span>
                          </div>
                          <p className="text-sm text-green-700">
                            Order Number: {orderData.orderNumber}
                          </p>
                        </div>

                        {/* Order Summary */}
                        <div className="space-y-3">
                          <h4 className="font-semibold flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            Order Summary
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Total Amount:</span>
                              <span className="font-semibold ml-2">৳{orderData.total}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Payment Method:</span>
                              <span className="font-semibold ml-2 capitalize">{orderData.paymentMethod}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Order Status:</span>
                              <Badge className={getStatusColor(orderData.orderStatus)}>
                                {orderData.orderStatus}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Payment Status:</span>
                              <Badge className={getStatusColor(orderData.paymentStatus)}>
                                {orderData.paymentStatus}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Customer Info */}
                        <div className="space-y-3">
                          <h4 className="font-semibold flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            Customer Information
                          </h4>
                          <div className="text-sm space-y-1">
                            <p><span className="text-muted-foreground">Name:</span> {orderData.customer?.firstName} {orderData.customer?.lastName}</p>
                            <p><span className="text-muted-foreground">Email:</span> {orderData.customer?.email}</p>
                            <p><span className="text-muted-foreground">Phone:</span> {orderData.customer?.phone}</p>
                          </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="space-y-3">
                          <h4 className="font-semibold flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            Shipping Address
                          </h4>
                          <div className="text-sm text-muted-foreground">
                            <p>{orderData.shippingAddress.name}</p>
                            <p>{orderData.shippingAddress.street}</p>
                            <p>{orderData.shippingAddress.city}, {orderData.shippingAddress.district}</p>
                            <p>{orderData.shippingAddress.division}</p>
                            <p>Phone: {orderData.shippingAddress.phone}</p>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-3">
                          <h4 className="font-semibold">Order Items</h4>
                          <div className="space-y-2">
                            {orderData.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{item.name}</p>
                                  {item.variant && (
                                    <p className="text-xs text-muted-foreground">Variant: {item.variant}</p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold">Qty: {item.quantity}</p>
                                  <p className="text-sm text-muted-foreground">৳{item.price}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>

                {/* Return Request Details & Update Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Package className="w-5 h-5 mr-2" />
                      Return Request Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Return Request Info */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Request Type:</span>
                          <Badge className="ml-2" variant={selectedRequest.type === 'return' ? 'destructive' : 'default'}>
                            {selectedRequest.type === 'return' ? 'Return' : 'Exchange'}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Current Status:</span>
                          <Badge className={getStatusColor(selectedRequest.status)}>
                            {selectedRequest.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground text-sm">Reason:</span>
                        <p className="text-sm font-medium">{selectedRequest.reason}</p>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground text-sm">Details:</span>
                        <p className="text-sm">{selectedRequest.details}</p>
                      </div>

                      <div>
                        <span className="text-muted-foreground text-sm">Products:</span>
                        <div className="space-y-1 mt-1">
                          {selectedRequest.products.map((product, idx) => (
                            <div key={idx} className="text-sm p-2 bg-gray-50 rounded">
                              <p className="font-medium">{product.productName}</p>
                              <p className="text-muted-foreground">Qty: {product.quantity} • Reason: {product.reason}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-4">Update Status & Refund</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="refundStatus">Status</Label>
                          <Select value={updateData.status} onValueChange={(value) => setUpdateData({...updateData, status: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
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

                        <div>
                          <Label htmlFor="refundMessage">Status Message</Label>
                          <Input
                            id="refundMessage"
                            placeholder="Enter status update message"
                            value={updateData.message}
                            onChange={(e) => setUpdateData({...updateData, message: e.target.value})}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="refundAmount">Refund Amount</Label>
                            <div className="relative">
                              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                              <Input
                                id="refundAmount"
                                type="number"
                                placeholder="0.00"
                                value={updateData.refundAmount}
                                onChange={(e) => setUpdateData({...updateData, refundAmount: e.target.value})}
                                className="pl-10"
                              />
                            </div>
                            {orderData && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Order total: ৳{orderData.total}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="refundMethod">Refund Method</Label>
                            <Select value={updateData.refundMethod} onValueChange={(value) => setUpdateData({...updateData, refundMethod: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select method" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="original_payment">Original Payment</SelectItem>
                                <SelectItem value="store_credit">Store Credit</SelectItem>
                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="refundAdminNotes">Admin Notes</Label>
                          <Textarea
                            id="refundAdminNotes"
                            placeholder="Enter admin notes"
                            value={updateData.adminNotes}
                            onChange={(e) => setUpdateData({...updateData, adminNotes: e.target.value})}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="refundTrackingNumber">Tracking Number</Label>
                            <Input
                              id="refundTrackingNumber"
                              placeholder="Enter tracking number"
                              value={updateData.trackingNumber}
                              onChange={(e) => setUpdateData({...updateData, trackingNumber: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="refundCourierName">Courier Name</Label>
                            <Input
                              id="refundCourierName"
                              placeholder="Enter courier name"
                              value={updateData.courierName}
                              onChange={(e) => setUpdateData({...updateData, courierName: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3 mt-6">
                        <Button variant="outline" onClick={() => setShowRefundDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleUpdateRequest}>
                          Update Request
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
          {/* Delete Confirmation Dialog */}
          <DeleteConfirmationComponent />
        </div>
      </div>
    </AdminLayout>
  );
}
