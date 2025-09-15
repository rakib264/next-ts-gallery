'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import DataTable from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DeleteConfirmationDialog from '@/components/ui/delete-confirmation-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import {
    Calendar,
    CheckCircle,
    Clock,
    CreditCard,
    DollarSign,
    Download,
    Edit,
    FileText,
    Mail,
    MapPin,
    Package,
    Phone,
    Printer,
    Send,
    ShoppingBag,
    ShoppingBasket,
    TrendingUp,
    Truck,
    User,
    XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    _id: string | null;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  } | null;
  items: Array<{
    product: {
      _id: string;
      name: string;
      thumbnailImage: string;
    };
    name: string;
    price: number;
    quantity: number;
    variant?: string;
  }>;
  subtotal: number;
  tax: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  paymentMethod: 'cod' | 'sslcommerz' | 'bkash' | 'nagad';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    name: string;
    phone: string;
    email?: string;
    street: string;
    city: string;
    district: string;
    division: string;
  };
  deliveryType: 'regular' | 'express' | 'same-day';
  expectedDelivery?: string;
  deliveredAt?: string;
  notes?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);
  const [smsConfirmationOpen, setSmsConfirmationOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [bulkStatus, setBulkStatus] = useState('');
  const [editingOrder, setEditingOrder] = useState<Partial<Order>>({});
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [customerStats, setCustomerStats] = useState<{ orderCount: number; lifetimeValue: number }>({ orderCount: 0, lifetimeValue: 0 });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle size={14} />;
      case 'shipped': return <Package size={14} />;
      case 'processing': return <Clock size={14} />;
      case 'confirmed': return <CheckCircle size={14} />;
      case 'pending': return <Clock size={14} />;
      case 'cancelled': return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          notes: statusNotes
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.courierAutoGenerated) {
          toast({
            title: 'Courier Auto-Generated',
            description: `Courier record has been automatically created for order ${selectedOrder.orderNumber}`,
          });
        }
        
        fetchOrders();
        setStatusUpdateOpen(false);
        setNewStatus('');
        setStatusNotes('');
      } else {
        const errorData = await response.json();
        console.error('Order status update failed:', errorData);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    fetchCustomerStats(order.customer?._id);
    setDetailsOpen(true);
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setEditingOrder({
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber || '',
      notes: order.notes || '',
      shippingAddress: order.shippingAddress
    });
    setEditOpen(true);
  };

  const handleDeleteOrder = (order: Order) => {
    setOrderToDelete(order);
    setDeleteOpen(true);
  };

  const handleUpdateStatus = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setStatusUpdateOpen(true);
  };

  const fetchCustomerStats = async (customerId: string | null | undefined) => {
    if (!customerId) {
      setCustomerStats({ orderCount: 0, lifetimeValue: 0 });
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/customers/${customerId}/stats`);
      if (response.ok) {
        const stats = await response.json();
        setCustomerStats(stats);
      }
    } catch (error) {
      console.error('Error fetching customer stats:', error);
      setCustomerStats({ orderCount: 0, lifetimeValue: 0 });
    }
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderToDelete._id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast({
          title: 'Order deleted',
          description: `Order ${orderToDelete.orderNumber} has been deleted successfully.`
        });
        fetchOrders();
        setDeleteOpen(false);
        setOrderToDelete(null);
      } else {
        throw new Error('Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete order. Please try again.'
      });
    } finally {
      setDeleting(false);
    }
  };

  const saveOrderEdit = async () => {
    if (!selectedOrder) return;
    
    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingOrder)
      });
      
      if (response.ok) {
        const result = await response.json();

        
        if (result.courierAutoGenerated) {
          toast({
            title: 'Order Updated & Courier Created',
            description: `Order ${selectedOrder.orderNumber} has been updated and courier record was automatically created.`
          });
        } else {
          toast({
            title: 'Order updated',
            description: `Order ${selectedOrder.orderNumber} has been updated successfully.`
          });
        }
        
        fetchOrders();
        setEditOpen(false);
        setSelectedOrder(null);
        setEditingOrder({});
      } else {
        const errorData = await response.json();
        console.error('Order edit failed:', errorData);
        throw new Error('Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order. Please try again.'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleBulkDelete = () => {
    setBulkDeleteOpen(true);
  };

  const confirmBulkDelete = async () => {
    setDeleting(true);
    try {
      const orderIds = selectedOrders.map(order => order._id);
      const response = await fetch('/api/admin/orders/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds })
      });
      
      if (response.ok) {
        toast({
          title: 'Orders deleted',
          description: `${selectedOrders.length} orders have been deleted successfully.`
        });
        fetchOrders();
        setSelectedOrders([]);
        setBulkDeleteOpen(false);
      } else {
        throw new Error('Failed to delete orders');
      }
    } catch (error) {
      console.error('Error deleting orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete orders. Please try again.'
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkStatusUpdate = (status: string) => {
    setBulkStatus(status);
    setBulkStatusOpen(true);
  };

  const confirmBulkStatusUpdate = async () => {
    setUpdating(true);
    try {
      const orderIds = selectedOrders.map(order => order._id);
      const response = await fetch('/api/admin/orders/bulk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds, status: bulkStatus })
      });
      
      if (response.ok) {
        toast({
          title: 'Orders updated',
          description: `${selectedOrders.length} orders have been updated to ${bulkStatus}.`
        });
        fetchOrders();
        setSelectedOrders([]);
        setBulkStatusOpen(false);
      } else {
        throw new Error('Failed to update orders');
      }
    } catch (error) {
      console.error('Error updating orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to update orders. Please try again.'
      });
    } finally {
      setUpdating(false);
    }
  };

  const exportSelected = async () => {
    try {
      const orderIds = selectedOrders.map(order => order._id);
      const response = await fetch('/api/admin/orders/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        
        toast({
          title: 'Export successful',
          description: `${selectedOrders.length} orders exported successfully.`
        });
      } else {
        throw new Error('Failed to export orders');
      }
    } catch (error) {
      console.error('Error exporting orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to export orders. Please try again.'
      });
    }
  };

  const sendInvoice = async (order: Order) => {
    try {
      const response = await fetch(`/api/admin/orders/${order._id}/send-invoice`, {
        method: 'POST'
      });
      
      if (response.ok) {
        toast({
          title: 'Invoice sent',
          description: `Invoice for order ${order.orderNumber} has been sent successfully.`
        });
      } else {
        throw new Error('Failed to send invoice');
      }
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to send invoice. Please try again.'
      });
    }
  };

  const resendConfirmation = async (order: Order) => {
    try {
      const response = await fetch(`/api/admin/orders/${order._id}/resend-confirmation`, {
        method: 'POST'
      });
      
      if (response.ok) {
        toast({
          title: 'Confirmation sent',
          description: `Confirmation email for order ${order.orderNumber} has been sent.`
        });
      } else {
        throw new Error('Failed to send confirmation');
      }
    } catch (error) {
      console.error('Error sending confirmation:', error);
      toast({
        title: 'Error',
        description: 'Failed to send confirmation. Please try again.'
      });
    }
  };

  const downloadPDF = async (order: Order) => {
    try {
      const response = await fetch(`/api/admin/orders/${order._id}/download-pdf`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${order.orderNumber}.html`;
        a.click();
        URL.revokeObjectURL(url);
        
        toast({
          title: 'Download started',
          description: `Invoice for order ${order.orderNumber} is being downloaded.`
        });
      } else {
        throw new Error('Failed to download PDF');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to download PDF. Please try again.'
      });
    }
  };

  const printInvoice = async (order: Order) => {
    try {
      const response = await fetch(`/api/admin/orders/${order._id}/download-pdf`);
      
      if (response.ok) {
        const htmlContent = await response.text();
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
          printWindow.close();
          
          toast({
            title: 'Print dialog opened',
            description: `Invoice for order ${order.orderNumber} is ready to print.`
          });
        }
      } else {
        throw new Error('Failed to load invoice');
      }
    } catch (error) {
      console.error('Error printing invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to print invoice. Please try again.'
      });
    }
  };

  const handleSMSConfirmation = () => {
    // Open confirmation modal
    setSmsConfirmationOpen(true);
  };

  const confirmSMSSending = async () => {
    try {
      const orderIds = selectedOrders.map(order => order._id);
      
      const response = await fetch('/api/admin/orders/sms-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: 'SMS Confirmation Sent',
          description: `${result.successfulSends} SMS confirmations sent successfully out of ${result.eligibleOrders} confirmed orders.`
        });
        setSelectedOrders([]);
        setSmsConfirmationOpen(false);
      } else {
        console.error('SMS confirmation failed:', result);
        toast({
          title: 'SMS Confirmation Failed',
          description: result.error || 'Failed to send SMS confirmations.'
        });
      }
    } catch (error) {
      console.error('Error sending SMS confirmations:', error);
      toast({
        title: 'Error',
        description: 'Failed to send SMS confirmations. Please try again.'
      });
    }
  };

  // Get eligible orders for SMS (confirmed orders with phone numbers)
  const getEligibleSMSOrders = () => {
    return selectedOrders.filter(order => {
      const hasPhone = order.customer?.phone || order.shippingAddress?.phone;
      const isConfirmed = order.orderStatus === 'confirmed';
      return hasPhone && isConfirmed;
    });
  };

  const eligibleSMSOrders = getEligibleSMSOrders();

  const columns = [
    {
      key: 'orderNumber',
      label: 'Order ID',
      sortable: true,
      render: (value: string, row: Order) => (
        <div className="space-y-1">
          <p className="font-medium text-gray-900 font-mono text-sm">{value}</p>
          <p className="text-xs text-gray-500">
            {formatDate(row.createdAt)}
          </p>
        </div>
      )
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (value: any, row: Order) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <User size={14} className="text-gray-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">
                {value ? `${value.firstName} ${value.lastName}` : row.shippingAddress?.name || 'Guest User'}
              </p>
              <p className="text-xs text-gray-500 flex items-center space-x-1">
                <Mail size={10} />
                <span>{value ? value.email : row.shippingAddress?.email || 'No email'}</span>
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'shippingAddress',
      label: 'Email',
      render: (value: any, row: Order) => (
        <div className="text-sm">
          <p className="text-gray-900">
            {row.customer?.email || value?.email || 'No email provided'}
          </p>
        </div>
      )
    },
    {
      key: 'total',
      label: 'Total Amount',
      sortable: true,
      render: (value: number) => (
        <div className="text-right">
          <p className="font-semibold text-gray-900">{formatCurrency(value)}</p>
        </div>
      )
    },
    {
      key: 'orderStatus',
      label: 'Order Status',
      filterable: true,
      render: (value: string) => (
        <Badge className={`${getStatusColor(value)} flex items-center space-x-1 w-fit`}>
          {getStatusIcon(value)}
          <span className="capitalize">{value}</span>
        </Badge>
      )
    },
    {
      key: 'paymentMethod',
      label: 'Payment Method',
      render: (value: string, row: Order) => (
        <div className="space-y-1">
          <Badge variant="outline" className="text-xs font-medium">
            {value.toUpperCase()}
          </Badge>
          <div className="flex items-center space-x-1">
            <CreditCard size={10} className="text-gray-400" />
            <Badge className={`text-xs ${getPaymentStatusColor(row.paymentStatus)}`}>
              {row.paymentStatus}
            </Badge>
          </div>
        </div>
      )
    },
    {
      key: 'deliveryType',
      label: 'Shipping Method',
      render: (value: string, row: Order) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <Truck size={12} className="text-gray-400" />
            <Badge variant="outline" className="capitalize text-xs">
              {value}
            </Badge>
          </div>
          {row.trackingNumber && (
            <p className="text-xs text-gray-500 font-mono">
              {row.trackingNumber}
            </p>
          )}
        </div>
      )
    }
  ];

  const filters = [
    {
      key: 'orderStatus',
      label: 'Order Status',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Processing', value: 'processing' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Cancelled', value: 'cancelled' }
      ]
    },
    {
      key: 'paymentStatus',
      label: 'Payment Status',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Failed', value: 'failed' },
        { label: 'Refunded', value: 'refunded' }
      ]
    },
    {
      key: 'paymentMethod',
      label: 'Payment Method',
      options: [
        { label: 'Cash on Delivery', value: 'cod' },
        { label: 'SSLCommerz', value: 'sslcommerz' },
        { label: 'bKash', value: 'bkash' },
        { label: 'Nagad', value: 'nagad' }
      ]
    },
    {
      key: 'deliveryType',
      label: 'Delivery Type',
      options: [
        { label: 'Regular', value: 'regular' },
        { label: 'Express', value: 'express' },
        { label: 'Same Day', value: 'same-day' }
      ]
    },
    {
      type: 'dateRange' as const,
      label: 'Order Date',
      fromKey: 'dateFrom',
      toKey: 'dateTo'
    }
  ];

  const bulkActions = [
    {
      label: 'Delete Selected',
      action: (selectedRows: Order[]) => {
        setSelectedOrders(selectedRows);
        handleBulkDelete();
      },
      variant: 'destructive' as 'destructive'
    },
    {
      label: 'Mark as Confirmed',
      action: (selectedRows: Order[]) => {
        setSelectedOrders(selectedRows);
        handleBulkStatusUpdate('confirmed');
      }
    },
    {
      label: 'Mark as Shipped',
      action: (selectedRows: Order[]) => {
        setSelectedOrders(selectedRows);
        handleBulkStatusUpdate('shipped');
      }
    },
    {
      label: 'Mark as Delivered',
      action: (selectedRows: Order[]) => {
        setSelectedOrders(selectedRows);
        handleBulkStatusUpdate('delivered');
      }
    },
    {
      label: 'Phone Confirmation',
      action: (selectedRows: Order[]) => {
        setSelectedOrders(selectedRows);
        handleSMSConfirmation();
      }
    },
    {
      label: 'Export Selected',
      action: (selectedRows: Order[]) => {
        setSelectedOrders(selectedRows);
        exportSelected();
      }
    }
  ];

  // Calculate stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.orderStatus === 'pending').length,
    processing: orders.filter(o => ['confirmed', 'processing'].includes(o.orderStatus)).length,
    shipped: orders.filter(o => o.orderStatus === 'shipped').length,
    delivered: orders.filter(o => o.orderStatus === 'delivered').length,
    cancelled: orders.filter(o => o.orderStatus === 'cancelled').length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    avgOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0,
    monthlyRevenue: orders
      .filter(o => new Date(o.createdAt).getMonth() === new Date().getMonth())
      .reduce((sum, order) => sum + order.total, 0),
    topCustomers: orders
      .filter(o => o.customer)
      .reduce((acc: any[], order) => {
        const existing = acc.find(c => c.customerId === order.customer?._id);
        if (existing) {
          existing.orderCount++;
          existing.totalSpent += order.total;
        } else {
          acc.push({
            customerId: order.customer?._id,
            name: `${order.customer?.firstName} ${order.customer?.lastName}`,
            orderCount: 1,
            totalSpent: order.total
          });
        }
        return acc;
      }, [])
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5)
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6 w-full max-w-full">
        {/* Enhanced Mobile-First Header */}
        <div className="flex flex-col gap-4">
          <div className="text-left">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              📦 Orders Management
            </h1>
            <p className="text-gray-600 mt-2 text-sm">
              Manage and track all customer orders
            </p>
          </div>
        </div>

        {/* Mobile-First Vertically Stacked Stats Cards */}
        <div className="flex flex-col space-y-3 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 sm:gap-3 sm:space-y-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 h-full">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-3 sm:flex-col sm:space-x-0 sm:space-y-2 sm:text-center">
                  <div className="p-2 sm:p-3 bg-blue-500 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
                    <ShoppingBasket className="text-white" size={16} />
                  </div>
                  <div className="flex-1 sm:flex-none">
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">TOTAL</p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-900">{stats.total}</p>
                    <p className="text-xs text-green-600 font-medium">+12%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 h-full">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-3 sm:flex-col sm:space-x-0 sm:space-y-2 sm:text-center">
                  <div className="p-2 sm:p-3 bg-amber-500 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
                    <Clock className="text-white" size={16} />
                  </div>
                  <div className="flex-1 sm:flex-none">
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">PENDING</p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-900">{stats.pending}</p>
                    <p className="text-xs text-red-600 font-medium">⚠️ Attention</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 h-full">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-3 sm:flex-col sm:space-x-0 sm:space-y-2 sm:text-center">
                  <div className="p-2 sm:p-3 bg-purple-500 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
                    <Package className="text-white" size={16} />
                  </div>
                  <div className="flex-1 sm:flex-none">
                    <p className="text-xs font-bold text-purple-700 uppercase tracking-wide">PROCESS</p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-900">{stats.processing}</p>
                    <p className="text-xs text-blue-600 font-medium">📦 Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 border-green-200 h-full">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-3 sm:flex-col sm:space-x-0 sm:space-y-2 sm:text-center">
                  <div className="p-2 sm:p-3 bg-green-500 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
                    <CheckCircle className="text-white" size={16} />
                  </div>
                  <div className="flex-1 sm:flex-none">
                    <p className="text-xs font-bold text-green-700 uppercase tracking-wide">DELIVERED</p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-900">{stats.delivered}</p>
                    <p className="text-xs text-green-600 font-medium">✅ Complete</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 h-full">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-3 sm:flex-col sm:space-x-0 sm:space-y-2 sm:text-center">
                  <div className="p-2 sm:p-3 bg-emerald-500 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
                    <DollarSign className="text-white" size={16} />
                  </div>
                  <div className="flex-1 sm:flex-none">
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide">REVENUE</p>
                    <p className="text-base sm:text-lg md:text-xl font-bold text-emerald-900">
                      {formatCurrency(stats.totalRevenue)}
                    </p>
                    <p className="text-xs text-emerald-600 font-medium">+8% Growth</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 h-full">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-3 sm:flex-col sm:space-x-0 sm:space-y-2 sm:text-center">
                  <div className="p-2 sm:p-3 bg-indigo-500 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
                    <TrendingUp className="text-white" size={16} />
                  </div>
                  <div className="flex-1 sm:flex-none">
                    <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide">AVG VALUE</p>
                    <p className="text-base sm:text-lg md:text-xl font-bold text-indigo-900">
                      {formatCurrency(stats.avgOrderValue)}
                    </p>
                    <p className="text-xs text-indigo-600 font-medium">📊 Trending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Mobile-First Insights Cards */}
        <div className="flex flex-col space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center justify-center sm:justify-start space-x-2 text-green-800">
                  <div className="p-2 sm:p-3 bg-green-500 rounded-lg sm:rounded-xl shadow-lg">
                    <TrendingUp size={16} className="text-white" />
                  </div>
                  <span>💰 Monthly Revenue</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="text-center sm:text-left">
                    <span className="block text-gray-700 font-medium mb-2">This Month</span>
                    <span className="text-2xl md:text-3xl font-bold text-green-600 block">
                      {formatCurrency(stats.monthlyRevenue)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full transition-all duration-500 shadow-sm" 
                      style={{ width: `${Math.min((stats.monthlyRevenue / stats.totalRevenue) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                    <span className="text-gray-600 text-center sm:text-left">
                      {((stats.monthlyRevenue / stats.totalRevenue) * 100).toFixed(1)}% of total revenue
                    </span>
                    <span className="text-green-600 font-medium text-center sm:text-right">↗️ +8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center justify-center sm:justify-start space-x-2 text-blue-800">
                  <div className="p-2 sm:p-3 bg-blue-500 rounded-lg sm:rounded-xl shadow-lg">
                    <User size={16} className="text-white" />
                  </div>
                  <span>🏆 Top Customers</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {stats.topCustomers.slice(0, 3).map((customer, index) => (
                    <motion.div 
                      key={customer.customerId} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                          index === 0 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' :
                          index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400' :
                          'bg-gradient-to-r from-amber-600 to-orange-500'
                        }`}>
                          <span className="text-sm font-bold text-white">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{customer.name}</p>
                          <p className="text-xs text-gray-600">📚 {customer.orderCount} orders</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-green-600 text-sm">{formatCurrency(customer.totalSpent)}</span>
                        <div className="text-xs text-gray-500">lifetime</div>
                      </div>
                    </motion.div>
                  ))}
                  {stats.topCustomers.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">📊</div>
                      <p className="text-gray-500">No customer data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Enhanced Mobile-Responsive Orders Table */}
        <Card className="bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 p-4">
            <div className="flex flex-col gap-4">
              <div className="text-center sm:text-left">
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center justify-center sm:justify-start space-x-2">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <ShoppingBasket size={18} className="text-white" />
                  </div>
                  <span>📋 Orders Management</span>
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">Manage all customer orders efficiently</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2">
                <Badge variant="outline" className="text-xs px-3 py-1">
                  {orders.length} Total Orders
                </Badge>
                <Badge variant="secondary" className="text-xs px-3 py-1">
                  {stats.pending} Pending
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <DataTable
                data={orders}
                columns={columns}
                filters={filters}
                bulkActions={bulkActions}
                selectable
                exportable
                onRowClick={handleViewDetails}
                onView={handleViewDetails}
                onEdit={handleEditOrder}
                onDelete={handleDeleteOrder}
                onSelectionChange={setSelectedOrders}
                pageSize={10}
              />
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Mobile-Responsive Order Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="w-[95vw] max-w-6xl max-h-[95vh] overflow-y-auto bg-white">
            <DialogHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-center sm:text-left">
                  <DialogTitle className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    📦 Order Details
                  </DialogTitle>
                  <p className="text-gray-500 font-mono text-sm mt-1">{selectedOrder?.orderNumber}</p>
                </div>
                <div className="flex items-center justify-center sm:justify-end space-x-3">
                  <Badge className={`${selectedOrder ? getStatusColor(selectedOrder.orderStatus) : ''} px-4 py-2 text-sm`}>
                    {selectedOrder && getStatusIcon(selectedOrder.orderStatus)}
                    <span className="ml-2 capitalize font-medium">{selectedOrder?.orderStatus}</span>
                  </Badge>
                </div>
              </div>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                {/* Mobile-Optimized Order Info Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-3 md:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                        <div className="p-2 bg-blue-500 rounded-lg self-center sm:self-auto">
                          <ShoppingBag className="text-white" size={16} />
                        </div>
                        <div className="text-center sm:text-left">
                          <p className="text-xs md:text-sm text-blue-700 font-medium">Order Status</p>
                          <p className="font-bold capitalize text-blue-900 text-sm md:text-base">{selectedOrder.orderStatus}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-3 md:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                        <div className="p-2 bg-green-500 rounded-lg self-center sm:self-auto">
                          <CreditCard className="text-white" size={16} />
                        </div>
                        <div className="text-center sm:text-left">
                          <p className="text-xs md:text-sm text-green-700 font-medium">Payment</p>
                          <p className="font-bold text-green-900 text-xs md:text-sm">{selectedOrder.paymentMethod.toUpperCase()}</p>
                          <p className="text-xs capitalize text-green-600">{selectedOrder.paymentStatus}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-3 md:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                        <div className="p-2 bg-purple-500 rounded-lg self-center sm:self-auto">
                          <Truck className="text-white" size={16} />
                        </div>
                        <div className="text-center sm:text-left">
                          <p className="text-xs md:text-sm text-purple-700 font-medium">Delivery</p>
                          <p className="font-bold capitalize text-purple-900 text-xs md:text-sm">{selectedOrder.deliveryType}</p>
                          {selectedOrder.trackingNumber && (
                            <p className="text-xs font-mono text-purple-600 break-all">{selectedOrder.trackingNumber}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-all duration-300 col-span-2 lg:col-span-1">
                    <CardContent className="p-3 md:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                        <div className="p-2 bg-orange-500 rounded-lg self-center sm:self-auto">
                          <DollarSign className="text-white" size={16} />
                        </div>
                        <div className="text-center sm:text-left">
                          <p className="text-xs md:text-sm text-orange-700 font-medium">Total Amount</p>
                          <p className="font-bold text-orange-900 text-base md:text-lg">{formatCurrency(selectedOrder.total)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Order Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Clock size={18} />
                      <span>Order Timeline</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <ShoppingBasket className="text-white" size={16} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Order Placed</p>
                          <p className="text-sm text-gray-600">{formatDate(selectedOrder.createdAt)}</p>
                        </div>
                      </div>
                      
                      {selectedOrder.orderStatus !== 'pending' && (
                        <div className="flex items-center space-x-4 p-3 bg-yellow-50 rounded-lg">
                          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="text-white" size={16} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">Order Confirmed</p>
                            <p className="text-sm text-gray-600">Status updated to {selectedOrder.orderStatus}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedOrder.orderStatus === 'shipped' && (
                        <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <Package className="text-white" size={16} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">Order Shipped</p>
                            <p className="text-sm text-gray-600">Package is on its way</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedOrder.orderStatus === 'delivered' && selectedOrder.deliveredAt && (
                        <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="text-white" size={16} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">Order Delivered</p>
                            <p className="text-sm text-gray-600">{formatDate(selectedOrder.deliveredAt)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Customer & Shipping Enhanced */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <User size={18} />
                        <span>Customer Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <User size={20} className="text-gray-500" />
                          </div>
                          <div>
                            <p className="font-semibold text-lg">
                              {selectedOrder.customer 
                                ? `${selectedOrder.customer.firstName} ${selectedOrder.customer.lastName}`
                                : selectedOrder.shippingAddress.name || 'Guest User'
                              }
                            </p>
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <Mail size={12} />
                              <span>
                                {selectedOrder.customer 
                                  ? selectedOrder.customer.email
                                  : selectedOrder.shippingAddress.email || 'No email provided'
                                }
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <Phone size={12} />
                              <span>
                                {selectedOrder.customer 
                                  ? selectedOrder.customer.phone
                                  : selectedOrder.shippingAddress.phone || 'No phone provided'
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {selectedOrder.customer && (
                          <div className="pt-4 border-t">
                            <h4 className="font-medium mb-3">Customer Insights</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="text-2xl font-bold text-blue-600">{customerStats.orderCount}</p>
                                <p className="text-sm text-blue-600">Total Orders</p>
                              </div>
                              <div className="bg-green-50 p-3 rounded-lg">
                                <p className="text-2xl font-bold text-green-600">{formatCurrency(customerStats.lifetimeValue)}</p>
                                <p className="text-sm text-green-600">Lifetime Value</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <MapPin size={18} />
                        <span>Shipping Address</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="font-semibold">{selectedOrder.shippingAddress.name}</p>
                          <p className="text-sm text-gray-600 mt-1">{selectedOrder.shippingAddress.phone}</p>
                          <div className="mt-3 space-y-1 text-sm">
                            <p>{selectedOrder.shippingAddress.street}</p>
                            <p>
                              {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.district}
                            </p>
                            <p>{selectedOrder.shippingAddress.division}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Truck size={14} />
                          <span>Delivery: {selectedOrder.deliveryType} shipping</span>
                        </div>
                        
                        {selectedOrder.expectedDelivery && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar size={14} />
                            <span>Expected: {formatDate(selectedOrder.expectedDelivery)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Order Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Order Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <img
                            src={item.product.thumbnailImage}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            {item.variant && (
                              <p className="text-sm text-gray-600">Variant: {item.variant}</p>
                            )}
                            <p className="text-sm text-gray-600">
                              {formatCurrency(item.price)} × {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Order Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(selectedOrder.subtotal)}</span>
                      </div>
                      {selectedOrder.discountAmount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount:</span>
                          <span>-{formatCurrency(selectedOrder.discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>{formatCurrency(selectedOrder.shippingCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>{formatCurrency(selectedOrder.tax)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>{formatCurrency(selectedOrder.total)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                {selectedOrder.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Order Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{selectedOrder.notes}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Mobile-Optimized Quick Actions */}
                <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-base md:text-lg flex items-center space-x-2 text-gray-800">
                      <div className="p-2 bg-indigo-500 rounded-lg">
                        <Send size={16} className="text-white" />
                      </div>
                      <span>⚡ Quick Actions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => sendInvoice(selectedOrder)} 
                        className="flex items-center justify-center space-x-2 p-4 h-auto bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800 transition-all duration-200"
                      >
                        <FileText size={18} />
                        <span className="font-medium">Send Invoice</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => resendConfirmation(selectedOrder)} 
                        className="flex items-center justify-center space-x-2 p-4 h-auto bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800 transition-all duration-200"
                      >
                        <Send size={18} />
                        <span className="font-medium">Resend Email</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleUpdateStatus(selectedOrder)} 
                        className="flex items-center justify-center space-x-2 p-4 h-auto bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700 hover:text-purple-800 transition-all duration-200 sm:col-span-2 lg:col-span-1"
                      >
                        <Edit size={18} />
                        <span className="font-medium">Update Status</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Mobile-Friendly Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => selectedOrder && printInvoice(selectedOrder)}
                    className="flex-1 sm:flex-none bg-gray-50 hover:bg-gray-100 border-gray-300 text-gray-700 hover:text-gray-800 transition-all duration-200"
                  >
                    <Printer size={16} className="mr-2" />
                    🖨️ Print Invoice
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => selectedOrder && downloadPDF(selectedOrder)}
                    className="flex-1 sm:flex-none bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-700 hover:text-blue-800 transition-all duration-200"
                  >
                    <Download size={16} className="mr-2" />
                    💾 Download PDF
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Order Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle>Edit Order - {selectedOrder?.orderNumber}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="orderStatus">Order Status</Label>
                  <Select 
                    value={editingOrder.orderStatus || ''} 
                    onValueChange={(value) => setEditingOrder(prev => ({ ...prev, orderStatus: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="paymentStatus">Payment Status</Label>
                  <Select 
                    value={editingOrder.paymentStatus || ''} 
                    onValueChange={(value) => setEditingOrder(prev => ({ ...prev, paymentStatus: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Order Notes</Label>
                <Textarea
                  id="notes"
                  value={editingOrder.notes || ''}
                  onChange={(e) => setEditingOrder(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add order notes..."
                  rows={3}
                />
              </div>

              {editingOrder.shippingAddress && (
                <div>
                  <Label>Shipping Address</Label>
                  <div className="space-y-2 mt-2">
                    <Input
                      value={editingOrder.shippingAddress.name || ''}
                      onChange={(e) => setEditingOrder(prev => ({ 
                        ...prev, 
                        shippingAddress: { ...prev.shippingAddress!, name: e.target.value }
                      }))}
                      placeholder="Name"
                    />
                    <Input
                      value={editingOrder.shippingAddress.phone || ''}
                      onChange={(e) => setEditingOrder(prev => ({ 
                        ...prev, 
                        shippingAddress: { ...prev.shippingAddress!, phone: e.target.value }
                      }))}
                      placeholder="Phone"
                    />
                    <Input
                      value={editingOrder.shippingAddress.street || ''}
                      onChange={(e) => setEditingOrder(prev => ({ 
                        ...prev, 
                        shippingAddress: { ...prev.shippingAddress!, street: e.target.value }
                      }))}
                      placeholder="Street Address"
                    />
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveOrderEdit} disabled={updating}>
                {updating ? 'Updating...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Status Update Dialog */}
        <Dialog open={statusUpdateOpen} onOpenChange={setStatusUpdateOpen}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Update Order Status</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Add any notes about this status change..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setStatusUpdateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleStatusUpdate}>
                  Update Status
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Order Dialog */}
        <DeleteConfirmationDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onConfirm={confirmDelete}
          title="Delete Order"
          description={`Are you sure you want to delete order ${orderToDelete?.orderNumber}? This action cannot be undone and will permanently remove the order from the system.`}
          entityName="order"
          isLoading={deleting}
        />

        {/* Bulk Delete Dialog */}
        <DeleteConfirmationDialog
          open={bulkDeleteOpen}
          onOpenChange={setBulkDeleteOpen}
          onConfirm={confirmBulkDelete}
          title="Delete Selected Orders"
          description={`Are you sure you want to delete ${selectedOrders.length} selected orders? This action cannot be undone and will permanently remove all selected orders from the system.`}
          entityName="order"
          entityCount={selectedOrders.length}
          isLoading={deleting}
        />

        {/* Bulk Status Update Dialog */}
        <Dialog open={bulkStatusOpen} onOpenChange={setBulkStatusOpen}>
          <DialogContent className="w-[95vw] max-w-md bg-white">
            <DialogHeader>
              <DialogTitle>Update Order Status</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                Update status for {selectedOrders.length} selected orders to:
              </p>
              <div className="p-4 bg-gray-50 rounded-lg">
                <Badge className={`${getStatusColor(bulkStatus)} capitalize px-3 py-1`}>
                  {getStatusIcon(bulkStatus)}
                  <span className="ml-1">{bulkStatus}</span>
                </Badge>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setBulkStatusOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={confirmBulkStatusUpdate} disabled={updating}>
                  {updating ? 'Updating...' : `Update ${selectedOrders.length} Orders`}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Enhanced Mobile-Responsive SMS Confirmation Dialog */}
        <Dialog open={smsConfirmationOpen} onOpenChange={setSmsConfirmationOpen}>
          <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-center sm:text-left gap-2">
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Phone size={18} className="text-white" />
                  </div>
                  <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                     SMS Confirmation
                  </span>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Mobile-Optimized Summary */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center space-x-2">
                  <span>📊 SMS Summary</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600 font-medium">Total Selected:</span>
                      <span className="font-bold text-blue-800">{selectedOrders.length} orders</span>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-green-100">
                    <div className="flex items-center justify-between">
                      <span className="text-green-600 font-medium">Eligible SMS:</span>
                      <span className="font-bold text-green-800">{eligibleSMSOrders.length} orders</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirements Info */}
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="font-medium text-amber-800 mb-2">📋 SMS Requirements</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Only <strong>confirmed</strong> orders are eligible for SMS</li>
                  <li>• Customer must have a valid phone number</li>
                  <li>• SMS will be sent in Bangladesh format (880XXXXXXXXX)</li>
                </ul>
              </div>

              {/* Eligible Customers List */}
              {eligibleSMSOrders.length > 0 ? (
                <div>
                  <h4 className="font-medium mb-3">Customers who will receive SMS ({eligibleSMSOrders.length}):</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto border rounded-lg p-3">
                    {eligibleSMSOrders.map((order, index) => {
                      const customerName = order.customer
                        ? `${order.customer.firstName} ${order.customer.lastName}`
                        : order.shippingAddress?.name || 'Guest User';
                      const phoneNumber = order.customer?.phone || order.shippingAddress?.phone || 'No phone';
                      
                      return (
                        <div key={order._id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-green-600">{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium text-green-800">{customerName}</p>
                              <p className="text-sm text-green-600">Order: {order.orderNumber}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-green-800">{phoneNumber}</p>
                            <p className="text-xs text-green-600">Status: {order.orderStatus}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center border-2 border-dashed border-gray-300 rounded-lg">
                  <Phone size={48} className="mx-auto text-gray-400 mb-4" />
                  <h4 className="font-medium text-gray-600 mb-2">No Eligible Orders</h4>
                  <p className="text-sm text-gray-500">No confirmed orders with valid phone numbers found in your selection.</p>
                </div>
              )}

              {/* Ineligible Orders Info */}
              {selectedOrders.length > eligibleSMSOrders.length && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-medium text-red-800 mb-2">⚠️ Ineligible Orders ({selectedOrders.length - eligibleSMSOrders.length})</h4>
                  <p className="text-sm text-red-700">
                    {selectedOrders.length - eligibleSMSOrders.length} orders cannot receive SMS because they are either not confirmed or don't have valid phone numbers.
                  </p>
                </div>
              )}

              {/* SMS Message Preview */}
              {eligibleSMSOrders.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-medium mb-2">📱 SMS Message Preview</h4>
                  <div className="space-y-2">
                    {eligibleSMSOrders.slice(0, 3).map((order, index) => {
                      const customerName = (order.customer
                        ? `${order.customer.firstName} ${order.customer.lastName}`
                        : order.shippingAddress?.name || 'Customer').split(' ')[0]; // First name only
                      
                      return (
                        <div key={order._id} className="bg-white p-3 rounded border">
                          <div className="text-xs text-gray-500 mb-1">Message for {customerName}:</div>
                          <div className="text-sm font-mono text-gray-800">
                            "Hi {customerName}, Order {order.orderNumber} confirmed! Amount: {formatCurrency(order.total)}\nRegards, NextGen"
                          </div>
                        </div>
                      );
                    })}
                    {eligibleSMSOrders.length > 3 && (
                      <div className="text-xs text-gray-500 text-center py-2">
                        ... and {eligibleSMSOrders.length - 3} more personalized messages
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                onClick={() => setSmsConfirmationOpen(false)}
                className="flex-1 sm:flex-none order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmSMSSending} 
                disabled={eligibleSMSOrders.length === 0 || updating}
                className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white order-1 sm:order-2 shadow-lg"
              >
                {updating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Sending SMS...
                  </>
                ) : (
                  <>
                    <Phone size={16} className="mr-2" />
                    Send to {eligibleSMSOrders.length} Customer{eligibleSMSOrders.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}