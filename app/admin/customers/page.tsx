'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import DataTable from '@/components/admin/DataTable';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { motion } from 'framer-motion';
import {
  Ban,
  Calendar,
  DollarSign,
  Eye,
  EyeOff,
  Mail,
  MapPin,
  Phone,
  TrendingUp,
  UserPlus,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    division: string;
    district: string;
    postCode: string;
  };
  isActive: boolean;
  lastLogin?: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  createdAt: string;
  updatedAt: string;
}

// Validation schemas
const addCustomerSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required').min(2, 'First name must be at least 2 characters'),
  lastName: Yup.string().required('Last name is required').min(2, 'Last name must be at least 2 characters'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phone: Yup.string().required('Phone number is required'),
  password: Yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),
  address: Yup.object().shape({
    street: Yup.string(),
    division: Yup.string(),
    district: Yup.string(),
    postCode: Yup.string()
  })
});

const editCustomerSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required').min(2, 'First name must be at least 2 characters'),
  lastName: Yup.string().required('Last name is required').min(2, 'Last name must be at least 2 characters'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phone: Yup.string().required('Phone number is required'),
  isActive: Yup.boolean(),
  address: Yup.object().shape({
    street: Yup.string(),
    division: Yup.string(),
    district: Yup.string(),
    postCode: Yup.string()
  })
});

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [selectedForBulkDelete, setSelectedForBulkDelete] = useState<Customer[]>([]);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [customerOrdersOpen, setCustomerOrdersOpen] = useState(false);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    address: {
      street: '',
      division: '',
      district: '',
      postCode: ''
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  
  // Enhanced state for server-side operations
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'createdAt',
    direction: 'desc'
  });
  const [total, setTotal] = useState(0);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchCustomers();
  }, [debouncedSearchQuery, filters, currentPage, pageSize, sortConfig]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // Clean filters - remove 'all' values as they should not be sent to API
      const cleanedFilters = Object.fromEntries(
        Object.entries(filters).filter(([key, value]) => value && value !== 'all')
      );

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        search: debouncedSearchQuery,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
        ...cleanedFilters
      });

      const response = await fetch(`/api/admin/customers?${params}`);
      const data = await response.json();
      
      if (data.customers && Array.isArray(data.customers)) {
        setCustomers(data.customers);
        setTotal(data.pagination?.total || 0);
      } else if (Array.isArray(data)) {
        setCustomers(data);
        setTotal(data.length);
      } else {
        console.error('Unexpected response format:', data);
        setCustomers([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
      setTotal(0);
      toast({
        title: "Error",
        description: "Failed to fetch customers. Please try again.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (customer: Customer) => {
    try {
      const response = await fetch(`/api/admin/customers/${customer._id}`);
      const detailedCustomer = await response.json();
      setSelectedCustomer(detailedCustomer);
      setDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching customer details:', error);
      toast({
        title: "Error",
        description: "Failed to load customer details.",
        variant: "error",
      });
    }
  };

  const handleViewOrders = async (customer: Customer) => {
    try {
      // Fetch orders for this customer from admin orders API with customer filter
      const response = await fetch(`/api/admin/orders?customer=${customer._id}`);
      const data = await response.json();
      setCustomerOrders(data.orders || []);
      setCustomerOrdersOpen(true);
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      toast({
        title: "Error",
        description: "Failed to load customer orders.",
        variant: "error",
      });
    }
  };

  const handleAddCustomer = () => {
    setNewCustomer({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      address: {
        street: '',
        division: '',
        district: '',
        postCode: ''
      }
    });
    setShowPassword(false);
    setAddCustomerOpen(true);
  };

  const saveNewCustomer = async (values: any) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          role: 'customer'
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Customer registered successfully.",
        });
        fetchCustomers();
        setAddCustomerOpen(false);
        setShowPassword(false);
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || 'Failed to register customer',
          variant: "error",
        });
        throw new Error(errorData.error || 'Failed to register customer');
      }
    } catch (error) {
      console.error('Error registering customer:', error);
      if (!(error instanceof Error) || !error.message.includes('Failed to register customer')) {
        toast({
          title: "Error",
          description: "Network error. Please check your connection and try again.",
          variant: "error",
        });
      }
    }
  };

  const saveCustomerEditWithFormik = async (values: any) => {
    try {
      const response = await fetch(`/api/admin/customers/${values._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Customer updated successfully.",
        });
        fetchCustomers();
        setEditOpen(false);
        setEditingCustomer(null);
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || 'Failed to update customer',
          variant: "error",
        });
        throw new Error(errorData.error || 'Failed to update customer');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      if (!(error instanceof Error) || !error.message.includes('Failed to update customer')) {
        toast({
          title: "Error",
          description: "Network error. Please check your connection and try again.",
          variant: "error",
        });
      }
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer({ ...customer });
    setEditOpen(true);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setDeletingCustomer(customer);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingCustomer) return;

    try {
      const response = await fetch(`/api/admin/customers/${deletingCustomer._id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Customer deleted successfully.",
        });
        fetchCustomers();
      } else {
        throw new Error('Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: "Error",
        description: "Failed to delete customer. Please try again.",
        variant: "error",
      });
    } finally {
      setDeleteConfirmOpen(false);
      setDeletingCustomer(null);
    }
  };

  const saveCustomerEdit = async () => {
    if (!editingCustomer) return;

    try {
      const response = await fetch(`/api/admin/customers/${editingCustomer._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCustomer)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Customer updated successfully.",
        });
        fetchCustomers();
        setEditOpen(false);
        setEditingCustomer(null);
      } else {
        throw new Error('Failed to update customer');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      toast({
        title: "Error",
        description: "Failed to update customer. Please try again.",
        variant: "error",
      });
    }
  };

  const toggleCustomerStatus = async (customerId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/customers/${customerId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Customer ${!isActive ? 'activated' : 'deactivated'} successfully.`,
        });
        fetchCustomers();
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating customer status:', error);
      toast({
        title: "Error",
        description: "Failed to update customer status. Please try again.",
        variant: "error",
      });
    }
  };

  const handleBulkAction = async (action: string, selectedCustomers: Customer[]) => {
    if (selectedCustomers.length === 0) {
      toast({
        title: "Warning",
        description: "Please select customers first.",
        variant: "error",
      });
      return;
    }

    // Show confirmation dialog for delete action
    if (action === 'delete') {
      setSelectedForBulkDelete(selectedCustomers);
      setBulkDeleteConfirmOpen(true);
      return;
    }

    await executeBulkAction(action, selectedCustomers);
  };

  const executeBulkAction = async (action: string, selectedCustomers: Customer[]) => {
    const customerIds = selectedCustomers.map(c => c._id);

    try {
      let response;
      
      switch (action) {
        case 'activate':
          toast({
            title: "Processing",
            description: `Activating ${selectedCustomers.length} customers...`,
          });
          response = await fetch('/api/admin/customers/bulk-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerIds, isActive: true })
          });
          break;
        case 'deactivate':
          toast({
            title: "Processing",
            description: `Deactivating ${selectedCustomers.length} customers...`,
          });
          response = await fetch('/api/admin/customers/bulk-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerIds, isActive: false })
          });
          break;
        case 'delete':
          toast({
            title: "Processing",
            description: `Deleting ${selectedCustomers.length} customers...`,
          });
          response = await fetch('/api/admin/customers/bulk-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerIds })
          });
          break;
        case 'export':
          toast({
            title: "Processing",
            description: `Exporting ${selectedCustomers.length} customers...`,
          });
          response = await fetch('/api/admin/customers/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerIds, format: 'csv', includeOrders: true })
          });
          
          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `customers_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast({
              title: "Success",
              description: `Successfully exported ${selectedCustomers.length} customers.`,
            });
          } else {
            throw new Error('Export failed');
          }
          return;
        default:
          return;
      }

      if (response && response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: result.message || `Successfully ${action}d ${selectedCustomers.length} customers.`,
        });
        fetchCustomers();
      } else {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to ${action} customers`);
      }
    } catch (error) {
      console.error(`Error in bulk ${action}:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} customers: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "error",
      });
    }
  };

  const confirmBulkDelete = async () => {
    await executeBulkAction('delete', selectedForBulkDelete);
    setBulkDeleteConfirmOpen(false);
    setSelectedForBulkDelete([]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getCustomerSegment = (totalSpent: number) => {
    if (totalSpent >= 50000) return { label: 'VIP', color: 'bg-purple-100 text-purple-800' };
    if (totalSpent >= 20000) return { label: 'Premium', color: 'bg-blue-100 text-blue-800' };
    if (totalSpent >= 5000) return { label: 'Regular', color: 'bg-green-100 text-green-800' };
    return { label: 'New', color: 'bg-gray-100 text-gray-800' };
  };

  const columns = [
    {
      key: 'name',
      label: 'Customer',
      sortable: true,
      render: (value: any, row: Customer) => (
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${row.firstName} ${row.lastName}`} />
            <AvatarFallback>
              {row.firstName.charAt(0)}{row.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-gray-900">
              {row.firstName} {row.lastName}
            </p>
            <p className="text-sm text-gray-500">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Contact',
      render: (value: string, row: Customer) => (
        <div>
          {value && (
            <div className="flex items-center space-x-1 mb-1">
              <Phone size={14} className="text-gray-400" />
              <span className="text-sm">{value}</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <Mail size={14} className="text-gray-400" />
            <span className="text-sm">{row.email}</span>
          </div>
        </div>
      )
    },
    {
      key: 'address',
      label: 'Location',
      render: (value: any) => (
        value ? (
          <div className="flex items-center space-x-1">
            <MapPin size={14} className="text-gray-400" />
            <span className="text-sm">{value.division}, {value.district}</span>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">No address</span>
        )
      )
    },
    {
      key: 'totalOrders',
      label: 'Orders',
      sortable: true,
      render: (value: number) => (
        <div className="text-center">
          <p className="font-medium">{value}</p>
          <p className="text-xs text-gray-500">orders</p>
        </div>
      )
    },
    {
      key: 'totalSpent',
      label: 'Total Spent',
      sortable: true,
      render: (value: number, row: Customer) => {
        const segment = getCustomerSegment(value);
        return (
          <div>
            <p className="font-medium">{formatCurrency(value)}</p>
            <Badge className={`text-xs ${segment.color}`}>
              {segment.label}
            </Badge>
          </div>
        );
      }
    },
    {
      key: 'averageOrderValue',
      label: 'Avg Order',
      sortable: true,
      render: (value: number) => (
        <span className="text-sm font-medium">{formatCurrency(value)}</span>
      )
    },
    {
      key: 'lastLogin',
      label: 'Last Active',
      sortable: true,
      render: (value: string) => (
        value ? (
          <span className="text-sm text-gray-500">
            {new Date(value).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-gray-400 text-sm">Never</span>
        )
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      filterable: true,
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      label: 'Joined',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-500">
          {new Date(value).toLocaleDateString()}
        </span>
      )
    },

  ];

  const enhancedFilters = [
    {
      key: 'active',
      label: 'Status',
      type: 'select' as const,
      options: [
        { label: 'All', value: 'all' },
        { label: 'Active', value: 'true' },
        { label: 'Inactive', value: 'false' }
      ]
    },
    {
      key: 'division',
      label: 'Division',
      type: 'select' as const,
      options: [
        { label: 'All Divisions', value: 'all' },
        { label: 'Dhaka', value: 'Dhaka' },
        { label: 'Chittagong', value: 'Chittagong' },
        { label: 'Sylhet', value: 'Sylhet' },
        { label: 'Rajshahi', value: 'Rajshahi' },
        { label: 'Khulna', value: 'Khulna' },
        { label: 'Barisal', value: 'Barisal' },
        { label: 'Rangpur', value: 'Rangpur' }
      ]
    },
    {
      key: 'minSpent',
      label: 'Min Spent (BDT)',
      type: 'number' as const,
      min: 0,
      max: 100000,
      step: 500
    },
    {
      key: 'maxSpent',
      label: 'Max Spent (BDT)',
      type: 'number' as const,
      min: 0,
      max: 100000,
      step: 500
    },
    {
      key: 'minOrders',
      label: 'Min Orders',
      type: 'number' as const,
      min: 0,
      max: 100,
      step: 1
    },
    {
      key: 'maxOrders',
      label: 'Max Orders',
      type: 'number' as const,
      min: 0,
      max: 100,
      step: 1
    }
  ];

  const bulkActions = [
    {
      label: 'Activate',
      action: (selectedRows: Customer[]) => handleBulkAction('activate', selectedRows),
      variant: 'default' as const
    },
    {
      label: 'Deactivate',
      action: (selectedRows: Customer[]) => handleBulkAction('deactivate', selectedRows),
      variant: 'default' as const
    },
    {
      label: 'Export Selected',
      action: (selectedRows: Customer[]) => handleBulkAction('export', selectedRows),
      variant: 'default' as const
    },
    {
      label: 'Bulk Delete',
      action: (selectedRows: Customer[]) => handleBulkAction('delete', selectedRows),
      variant: 'destructive' as const
    }
  ];

  // Calculate stats
  const stats = {
    total: Array.isArray(customers) ? customers.length : 0,
    active: Array.isArray(customers) ? customers.filter(c => c.isActive).length : 0,
    newThisMonth: Array.isArray(customers) ? customers.filter(c => {
      const createdDate = new Date(c.createdAt);
      const now = new Date();
      return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
    }).length : 0,
    totalRevenue: Array.isArray(customers) ? customers.reduce((sum, customer) => sum + customer.totalSpent, 0) : 0,
    avgOrderValue: Array.isArray(customers) && customers.length > 0 
      ? customers.reduce((sum, customer) => sum + customer.averageOrderValue, 0) / customers.length 
      : 0
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-600 mt-1">
              Manage your customer base and relationships
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button onClick={handleAddCustomer} className="flex-shrink-0">
              <UserPlus size={16} className="mr-2" />
              <span className="hidden sm:inline">Add Customer</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Customers</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-blue-100 rounded-full flex-shrink-0">
                    <Users className="text-blue-600" size={16} />
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
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Active Customers</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{stats.active}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-green-100 rounded-full flex-shrink-0">
                    <UserPlus className="text-green-600" size={16} />
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
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">New This Month</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{stats.newThisMonth}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-purple-100 rounded-full flex-shrink-0">
                    <Calendar className="text-purple-600" size={16} />
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
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Revenue</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1 truncate">
                      {formatCurrency(stats.totalRevenue)}
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-yellow-100 rounded-full flex-shrink-0">
                    <DollarSign className="text-yellow-600" size={16} />
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
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Avg Order Value</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1 truncate">
                      {formatCurrency(stats.avgOrderValue)}
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-orange-100 rounded-full flex-shrink-0">
                    <TrendingUp className="text-orange-600" size={16} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Customers List</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={customers}
              columns={columns}
              filters={enhancedFilters}
              bulkActions={bulkActions}
              selectable
              exportable
              searchable
              filterable
              pagination
              pageSize={pageSize}
              onRowClick={handleViewDetails}
              onView={handleViewDetails}
              onEdit={handleEditCustomer}
              onDelete={handleDeleteCustomer}
              serverPagination={{
                page: currentPage,
                pageSize,
                total,
                onPageChange: setCurrentPage,
                onPageSizeChange: setPageSize,
                pageSizeOptions: [10, 20, 50, 100]
              }}
              serverSort={{
                sortKey: sortConfig.key,
                sortDirection: sortConfig.direction,
                onChange: (key, direction) => {
                  if (key && direction) {
                    setSortConfig({ key, direction });
                  }
                }
              }}
              serverSearch={{
                value: searchQuery,
                onChange: setSearchQuery
              }}
              serverFilters={{
                values: filters,
                onChange: setFilters
              }}
            />
          </CardContent>
        </Card>

        {/* Customer Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
            </DialogHeader>
            {selectedCustomer && (
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedCustomer.firstName} ${selectedCustomer.lastName}`} />
                    <AvatarFallback className="text-lg">
                      {selectedCustomer.firstName.charAt(0)}{selectedCustomer.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">
                      {selectedCustomer.firstName} {selectedCustomer.lastName}
                    </h3>
                    <p className="text-gray-600">{selectedCustomer.email}</p>
                    {selectedCustomer.phone && (
                      <p className="text-gray-600">{selectedCustomer.phone}</p>
                    )}
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant={selectedCustomer.isActive ? "default" : "secondary"}>
                        {selectedCustomer.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge className={getCustomerSegment(selectedCustomer.totalSpent).color}>
                        {getCustomerSegment(selectedCustomer.totalSpent).label}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-blue-600">{selectedCustomer.totalOrders}</p>
                      <p className="text-sm text-gray-600">Total Orders</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(selectedCustomer.totalSpent)}
                      </p>
                      <p className="text-sm text-gray-600">Total Spent</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {formatCurrency(selectedCustomer.averageOrderValue)}
                      </p>
                      <p className="text-sm text-gray-600">Avg Order</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Address */}
                {selectedCustomer.address && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Address</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start space-x-2">
                        <MapPin size={16} className="text-gray-400 mt-1" />
                        <div>
                          <p>{selectedCustomer.address.street}</p>
                          <p>{selectedCustomer.address.division}, {selectedCustomer.address.district}</p>
                          {selectedCustomer.address.postCode && (
                            <p>Post Code: {selectedCustomer.address.postCode}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Account Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Account Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Joined:</span>
                        <span>{new Date(selectedCustomer.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Login:</span>
                        <span>
                          {selectedCustomer.lastLogin 
                            ? new Date(selectedCustomer.lastLogin).toLocaleDateString()
                            : 'Never'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge variant={selectedCustomer.isActive ? "default" : "secondary"}>
                          {selectedCustomer.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end space-x-2">

                  <Button variant="outline" onClick={() => handleViewOrders(selectedCustomer)}>
                    <Eye size={16} className="mr-2" />
                    View Orders
                  </Button>
                  <Button
                    variant={selectedCustomer.isActive ? "destructive" : "default"}
                    onClick={() => toggleCustomerStatus(selectedCustomer._id, selectedCustomer.isActive)}
                  >
                    <Ban size={16} className="mr-2" />
                    {selectedCustomer.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Customer Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle>Edit Customer</DialogTitle>
            </DialogHeader>
            {editingCustomer && (
              <Formik
                initialValues={{
                  _id: editingCustomer._id,
                  firstName: editingCustomer.firstName,
                  lastName: editingCustomer.lastName,
                  email: editingCustomer.email,
                  phone: editingCustomer.phone || '',
                  isActive: editingCustomer.isActive,
                  address: {
                    street: editingCustomer.address?.street || '',
                    division: editingCustomer.address?.division || '',
                    district: editingCustomer.address?.district || '',
                    postCode: editingCustomer.address?.postCode || ''
                  }
                }}
                validationSchema={editCustomerSchema}
                onSubmit={saveCustomerEditWithFormik}
              >
                {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
                  <Form className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Field
                          as={Input}
                          id="firstName"
                          name="firstName"
                          value={values.firstName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={errors.firstName && touched.firstName ? 'border-red-500' : ''}
                        />
                        <ErrorMessage name="firstName" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Field
                          as={Input}
                          id="lastName"
                          name="lastName"
                          value={values.lastName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={errors.lastName && touched.lastName ? 'border-red-500' : ''}
                        />
                        <ErrorMessage name="lastName" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Field
                        as={Input}
                        id="email"
                        name="email"
                        type="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={errors.email && touched.email ? 'border-red-500' : ''}
                      />
                      <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Field
                        as={Input}
                        id="phone"
                        name="phone"
                        value={values.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={errors.phone && touched.phone ? 'border-red-500' : ''}
                      />
                      <ErrorMessage name="phone" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={values.isActive ? 'active' : 'inactive'}
                        onValueChange={(value) => setFieldValue('isActive', value === 'active')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium">Address (Optional)</h4>
                      <div>
                        <Label htmlFor="address.street">Street</Label>
                        <Field
                          as={Textarea}
                          id="address.street"
                          name="address.street"
                          value={values.address.street}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="address.division">Division</Label>
                          <Field
                            as={Input}
                            id="address.division"
                            name="address.division"
                            value={values.address.division}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </div>
                        <div>
                          <Label htmlFor="address.district">District</Label>
                          <Field
                            as={Input}
                            id="address.district"
                            name="address.district"
                            value={values.address.district}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </div>
                        <div>
                          <Label htmlFor="address.postCode">Post Code</Label>
                          <Field
                            as={Input}
                            id="address.postCode"
                            name="address.postCode"
                            value={values.address.postCode}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        Save Changes
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            {deletingCustomer && (
              <div className="space-y-4">
                <p>
                  Are you sure you want to delete <strong>{deletingCustomer.firstName} {deletingCustomer.lastName}</strong>?
                </p>
                <p className="text-sm text-gray-600">
                  This action cannot be undone. If the customer has existing orders, they will be deactivated instead of deleted.
                </p>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={confirmDelete}>
                    Delete Customer
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Bulk Delete Confirmation Dialog */}
        <Dialog open={bulkDeleteConfirmOpen} onOpenChange={setBulkDeleteConfirmOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle>Confirm Bulk Deletion</DialogTitle>
            </DialogHeader>
            {selectedForBulkDelete.length > 0 && (
              <div className="space-y-4">
                <p>
                  Are you sure you want to delete <strong>{selectedForBulkDelete.length}</strong> customers?
                </p>
                <div className="bg-gray-50 p-3 rounded-md max-h-32 overflow-y-auto">
                  <p className="text-sm font-medium mb-2">Selected customers:</p>
                  <ul className="text-sm space-y-1">
                    {selectedForBulkDelete.slice(0, 5).map(customer => (
                      <li key={customer._id}>
                        {customer.firstName} {customer.lastName} ({customer.email})
                      </li>
                    ))}
                    {selectedForBulkDelete.length > 5 && (
                      <li className="font-medium">...and {selectedForBulkDelete.length - 5} more</li>
                    )}
                  </ul>
                </div>
                <p className="text-sm text-gray-600">
                  This action cannot be undone. Customers with existing orders will be deactivated instead of deleted to maintain data integrity.
                </p>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => {
                    setBulkDeleteConfirmOpen(false);
                    setSelectedForBulkDelete([]);
                  }}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={confirmBulkDelete}>
                    Delete {selectedForBulkDelete.length} Customers
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Customer Orders Dialog */}
        <Dialog open={customerOrdersOpen} onOpenChange={setCustomerOrdersOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle>Customer Orders</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {customerOrders.length > 0 ? (
                <div className="space-y-3">
                  {customerOrders.map((order) => (
                    <Card key={order._id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-lg">Order #{order.orderNumber}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString()} • {formatCurrency(order.total)}
                          </p>
                          <Badge className="mt-1" variant={
                            order.orderStatus === 'delivered' ? 'default' :
                            order.orderStatus === 'cancelled' ? 'destructive' : 'secondary'
                          }>
                            {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(`/admin/orders`, '_blank')}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                      {order.items && order.items.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {order.items.slice(0, 3).map((item: any, index: number) => (
                            <div key={index} className="text-sm text-gray-600">
                              {item.quantity}x {item.product?.name || 'Product'}
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="text-sm text-gray-500">
                              ...and {order.items.length - 3} more items
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">This customer has no orders yet.</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Customer Dialog */}
        <Dialog open={addCustomerOpen} onOpenChange={setAddCustomerOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <Formik
              initialValues={newCustomer}
              validationSchema={addCustomerSchema}
              onSubmit={saveNewCustomer}
            >
              {({ values, errors, touched, handleChange, handleBlur }) => (
                <Form className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Field
                        as={Input}
                        id="firstName"
                        name="firstName"
                        value={values.firstName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={errors.firstName && touched.firstName ? 'border-red-500' : ''}
                      />
                      <ErrorMessage name="firstName" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Field
                        as={Input}
                        id="lastName"
                        name="lastName"
                        value={values.lastName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={errors.lastName && touched.lastName ? 'border-red-500' : ''}
                      />
                      <ErrorMessage name="lastName" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Field
                      as={Input}
                      id="email"
                      name="email"
                      type="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={errors.email && touched.email ? 'border-red-500' : ''}
                    />
                    <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Field
                      as={Input}
                      id="phone"
                      name="phone"
                      value={values.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={errors.phone && touched.phone ? 'border-red-500' : ''}
                    />
                    <ErrorMessage name="phone" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Field
                        as={Input}
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`pr-10 ${errors.password && touched.password ? 'border-red-500' : ''}`}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Address (Optional)</h4>
                    <div>
                      <Label htmlFor="address.street">Street</Label>
                      <Field
                        as={Textarea}
                        id="address.street"
                        name="address.street"
                        value={values.address.street}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="address.division">Division</Label>
                        <Field
                          as={Input}
                          id="address.division"
                          name="address.division"
                          value={values.address.division}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </div>
                      <div>
                        <Label htmlFor="address.district">District</Label>
                        <Field
                          as={Input}
                          id="address.district"
                          name="address.district"
                          value={values.address.district}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </div>
                      <div>
                        <Label htmlFor="address.postCode">Post Code</Label>
                        <Field
                          as={Input}
                          id="address.postCode"
                          name="address.postCode"
                          value={values.address.postCode}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setAddCustomerOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Add Customer
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}