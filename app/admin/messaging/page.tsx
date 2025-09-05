'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import DataTable from '@/components/admin/DataTable';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useErrorDialog } from '@/components/ui/error-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToastWithTypes } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  MessageSquare,
  Phone,
  RefreshCw,
  Send,
  Target,
  XCircle
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  createdAt: string;
}

interface Message {
  _id: string;
  content: string;
  type: 'bulk' | 'individual';
  targetFilter: {
    type: string;
    criteria?: any;
  };
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  provider: string;
  cost?: number;
  sender: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  completedAt?: string;
}

interface MessageFormData {
  content: string;
  targetType: 'all' | 'new' | 'repeated' | 'best' | 'single';
  singleCustomerId?: string;
  messageType: 'bulk' | 'individual';
  scheduledAt?: string;
}

export default function AdminMessaging() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState<MessageFormData>({
    content: '',
    targetType: 'all',
    messageType: 'bulk'
  });

  const [stats, setStats] = useState({
    totalMessages: 0,
    totalSent: 0,
    totalDelivered: 0,
    totalFailed: 0,
    totalCost: 0
  });

  // Server-side data management
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  });

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{ key?: string; direction?: 'asc' | 'desc' }>({});

  // Hooks
  const { showError, ErrorDialogComponent } = useErrorDialog();
  const { success, error: showToastError, warning } = useToastWithTypes();
  const { showDeleteConfirmation, DeleteConfirmationComponent } = useDeleteConfirmationDialog();

  useEffect(() => {
    fetchMessages();
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [formData.targetType, customers, customerSearch]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch messages when debounced search, filters, sort, or pagination changes
  useEffect(() => {
    fetchMessages();
  }, [debouncedSearch, filters, sort, pagination.page, pagination.pageSize]);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.pageSize.toString(),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(filters.type && { type: filters.type }),
        ...(filters.provider && { provider: filters.provider }),
        ...(filters.status && { status: filters.status }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(sort.key && { sortBy: sort.key }),
        ...(sort.direction && { sortOrder: sort.direction })
      });

      const response = await fetch(`/api/admin/messaging?${params}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch messages');
      }

      setMessages(data.messages || []);
      setPagination(prev => ({ ...prev, total: data.pagination?.total || 0 }));
      
      // Calculate stats - for stats we might want to fetch all messages or have a separate stats endpoint
      const totalMessages = data.pagination?.total || 0;
      const totalSent = data.messages?.reduce((sum: number, msg: Message) => sum + msg.sentCount, 0) || 0;
      const totalDelivered = data.messages?.reduce((sum: number, msg: Message) => sum + msg.deliveredCount, 0) || 0;
      const totalFailed = data.messages?.reduce((sum: number, msg: Message) => sum + msg.failedCount, 0) || 0;
      const totalCost = data.messages?.reduce((sum: number, msg: Message) => sum + (msg.cost || 0), 0) || 0;
      
      setStats({ totalMessages, totalSent, totalDelivered, totalFailed, totalCost });
    } catch (error) {
      console.error('Error fetching messages:', error);
      showToastError('Failed to fetch messages', 'Please try again');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, debouncedSearch, filters, sort, showToastError]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/admin/customers?limit=1000');
      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  // Message actions
  const handleViewMessage = async (message: Message) => {
    try {
      const response = await fetch(`/api/admin/messaging/${message._id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch message details');
      }
      
      setSelectedMessage(data.message);
      setViewDialogOpen(true);
    } catch (error) {
      console.error('Error fetching message details:', error);
      showToastError('Failed to load message details', 'Please try again');
    }
  };

  const handleDeleteMessage = (message: Message) => {
    showDeleteConfirmation({
      title: 'Delete Message',
      description: `Are you sure you want to delete this message? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/admin/messaging/${message._id}`, {
            method: 'DELETE'
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to delete message');
          }

          success('Message deleted successfully');
          fetchMessages();
        } catch (error) {
          console.error('Error deleting message:', error);
          showToastError('Failed to delete message', 'Please try again');
        }
      }
    });
  };

  const handleBulkDelete = (selectedMessages: Message[]) => {
    const messageIds = selectedMessages.map(msg => msg._id);
    
    showDeleteConfirmation({
      title: 'Delete Messages',
      description: `Are you sure you want to delete ${selectedMessages.length} message(s)? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/admin/messaging?ids=${messageIds.join(',')}`, {
            method: 'DELETE'
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to delete messages');
          }

          success(`${data.deletedCount} message(s) deleted successfully`);
          fetchMessages();
        } catch (error) {
          console.error('Error deleting messages:', error);
          showToastError('Failed to delete messages', 'Please try again');
        }
      }
    });
  };

  const handleExportSelected = (selectedMessages: Message[]) => {
    const headers = ['Content', 'Type', 'Target', 'Recipients', 'Sent', 'Delivered', 'Failed', 'Cost', 'Sender', 'Created At'];
            const rows = selectedMessages.map(msg => [
      msg.content,
      msg.type,
      msg.targetFilter.type,
      msg.totalRecipients,
      msg.sentCount,
      msg.deliveredCount,
      msg.failedCount,
      msg.cost || 0,
      msg.sender?.firstName && msg.sender?.lastName 
        ? `${msg.sender.firstName} ${msg.sender.lastName}` 
        : 'Unknown User',
      new Date(msg.createdAt).toLocaleDateString()
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `messages-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    success(`${selectedMessages.length} message(s) exported successfully`);
  };

  const filterCustomers = () => {
    let filtered = customers;

    // Apply search filter
    if (customerSearch) {
      filtered = filtered.filter(customer =>
        `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(customerSearch.toLowerCase()) ||
        customer.phone.includes(customerSearch) ||
        customer.email.toLowerCase().includes(customerSearch.toLowerCase())
      );
    }

    // Apply target type filter
    switch (formData.targetType) {
      case 'new':
        // Customers with 0-1 orders
        filtered = filtered.filter(customer => customer.totalOrders <= 1);
        break;
      case 'repeated':
        // Customers with 2+ orders
        filtered = filtered.filter(customer => customer.totalOrders >= 2);
        break;
      case 'best':
        // Top 20% customers by spending
        const sortedBySpending = [...filtered].sort((a, b) => b.totalSpent - a.totalSpent);
        const top20Percent = Math.ceil(sortedBySpending.length * 0.2);
        filtered = sortedBySpending.slice(0, top20Percent);
        break;
      case 'single':
        // Will be handled separately in single customer selection
        filtered = [];
        break;
      default:
        // All customers
        break;
    }

    setFilteredCustomers(filtered);
  };

  const getTargetDescription = () => {
    switch (formData.targetType) {
      case 'new':
        return `New customers (${filteredCustomers.length} customers with 0-1 orders)`;
      case 'repeated':
        return `Repeated buyers (${filteredCustomers.length} customers with 2+ orders)`;
      case 'best':
        return `Best customers (${filteredCustomers.length} top 20% by spending)`;
      case 'single':
        return 'Single customer';
      default:
        return `All customers (${filteredCustomers.length} total customers)`;
    }
  };

  const calculateEstimatedCost = () => {
    const recipientCount = formData.targetType === 'single' ? 1 : filteredCustomers.length;
    const costPerSMS = 0.5; // Estimated cost in BDT
    return recipientCount * costPerSMS;
  };

  const handlePreview = () => {
    if (!formData.content.trim()) {
      showError('Please enter a message', 'Validation Error');
      return;
    }
    setPreviewOpen(true);
  };

  const handleSendMessage = async () => {
    if (!formData.content.trim()) {
      showError('Please enter a message', 'Validation Error');
      return;
    }

    if (formData.targetType === 'single' && !formData.singleCustomerId) {
      showError('Please select a customer', 'Validation Error');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/admin/messaging/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        success('Message sent successfully', 'Your message has been queued for delivery');
        setComposeOpen(false);
        setPreviewOpen(false);
        setFormData({
          content: '',
          targetType: 'all',
          messageType: 'bulk'
        });
        fetchMessages();
      } else {
        showToastError('Failed to send message', data.error || 'Please try again');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showToastError('Failed to send message', 'Please check your connection and try again');
    } finally {
      setSending(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle size={14} />;
      case 'sent': return <Send size={14} />;
      case 'failed': return <XCircle size={14} />;
      case 'pending': return <Clock size={14} />;
      default: return <AlertTriangle size={14} />;
    }
  };

  // Define filter options
  const messageFilters = [
    {
      type: 'select' as const,
      key: 'type',
      label: 'Message Type',
      options: [
        { label: 'Bulk SMS', value: 'bulk' },
        { label: 'Individual SMS', value: 'individual' }
      ]
    },
    {
      type: 'select' as const,
      key: 'status',
      label: 'Status',
      options: [
        { label: 'Sent', value: 'sent' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Failed', value: 'failed' },
        { label: 'Pending', value: 'pending' }
      ]
    },
    {
      type: 'select' as const,
      key: 'provider',
      label: 'Provider',
      options: [
        { label: 'Twilio', value: 'twilio' },
        { label: 'Teletalk', value: 'teletalk' },
        { label: 'ZamanIT', value: 'zamanit' }
      ]
    },
    {
      type: 'dateRange' as const,
      label: 'Date Range',
      fromKey: 'dateFrom',
      toKey: 'dateTo'
    }
  ];

  // Define bulk actions
  const bulkActions = [
    {
      label: 'Export Selected',
      action: handleExportSelected,
      variant: 'default' as const
    },
    {
      label: 'Delete Selected',
      action: handleBulkDelete,
      variant: 'destructive' as const
    }
  ];

  const messageColumns = [
    {
      key: 'content',
      label: 'Message',
      render: (value: string, row: Message) => (
        <div>
          <p className="font-medium text-gray-900 line-clamp-2">{value}</p>
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant="outline" className="capitalize">
              {row.type}
            </Badge>
            <Badge variant="secondary">
              {row.targetFilter.type}
            </Badge>
          </div>
        </div>
      )
    },
    {
      key: 'totalRecipients',
      label: 'Recipients',
      sortable: true,
      render: (value: number) => (
        <div className="text-center">
          <p className="font-medium">{value}</p>
          <p className="text-xs text-gray-500">recipients</p>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: any, row: Message) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Badge className={`${getStatusColor('sent')} flex items-center space-x-1`}>
              <Send size={12} />
              <span>{row.sentCount}</span>
            </Badge>
            <Badge className={`${getStatusColor('delivered')} flex items-center space-x-1`}>
              <CheckCircle size={12} />
              <span>{row.deliveredCount}</span>
            </Badge>
            {row.failedCount > 0 && (
              <Badge className={`${getStatusColor('failed')} flex items-center space-x-1`}>
                <XCircle size={12} />
                <span>{row.failedCount}</span>
              </Badge>
            )}
          </div>
          <Progress 
            value={(row.sentCount / row.totalRecipients) * 100} 
            className="h-1"
          />
        </div>
      )
    },
    {
      key: 'cost',
      label: 'Cost',
      sortable: true,
      render: (value: number) => (
        value ? (
          <span className="font-medium">{formatCurrency(value)}</span>
        ) : (
          <span className="text-gray-400">-</span>
        )
      )
    },
    {
      key: 'sender',
      label: 'Sent By',
      render: (value: any) => {
        if (!value || !value.firstName || !value.lastName) {
          return (
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">
                  N/A
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-500">Unknown</span>
            </div>
          );
        }
        
        return (
          <div className="flex items-center space-x-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${value.firstName} ${value.lastName}`} />
              <AvatarFallback className="text-xs">
                {value.firstName.charAt(0)}{value.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{value.firstName} {value.lastName}</span>
          </div>
        );
      }
    },
    {
      key: 'createdAt',
      label: 'Sent At',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm">
          <p>{new Date(value).toLocaleDateString()}</p>
          <p className="text-gray-500">{new Date(value).toLocaleTimeString()}</p>
        </div>
      )
    }
  ];

  const customerColumns = [
    {
      key: 'name',
      label: 'Customer',
      render: (value: any, row: Customer) => (
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${row.firstName} ${row.lastName}`} />
            <AvatarFallback>
              {row.firstName.charAt(0)}{row.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.firstName} {row.lastName}</p>
            <p className="text-sm text-gray-500">{row.phone}</p>
          </div>
        </div>
      )
    },
    {
      key: 'totalOrders',
      label: 'Orders',
      sortable: true,
      render: (value: number) => (
        <Badge variant="outline">{value}</Badge>
      )
    },
    {
      key: 'totalSpent',
      label: 'Total Spent',
      sortable: true,
      render: (value: number) => (
        <span className="font-medium">{formatCurrency(value)}</span>
      )
    },
    {
      key: 'lastOrderDate',
      label: 'Last Order',
      render: (value: string) => (
        value ? (
          <span className="text-sm">{new Date(value).toLocaleDateString()}</span>
        ) : (
          <span className="text-gray-400">Never</span>
        )
      )
    }
  ];

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messaging</h1>
            <p className="text-gray-600 mt-1">
              Send SMS messages to your customers
            </p>
          </div>
          <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
            <DialogTrigger asChild>
              <Button>
                <MessageSquare size={16} className="mr-2" />
                Compose Message
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
              <DialogHeader>
                <DialogTitle>Compose SMS Message</DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="compose" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="compose">Compose</TabsTrigger>
                  <TabsTrigger value="preview">Preview & Send</TabsTrigger>
                </TabsList>

                <TabsContent value="compose" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Message Composition */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="content">Message Content *</Label>
                        <Textarea
                          id="content"
                          value={formData.content}
                          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Type your message here..."
                          rows={6}
                          maxLength={1600}
                          className="resize-none"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>{formData.content.length}/1600 characters</span>
                          <span>{Math.ceil(formData.content.length / 160)} SMS</span>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="messageType">Message Type</Label>
                        <Select 
                          value={formData.messageType} 
                          onValueChange={(value: 'bulk' | 'individual') => setFormData(prev => ({ ...prev, messageType: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bulk">Bulk SMS</SelectItem>
                            <SelectItem value="individual">Individual SMS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Target Selection */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="targetType">Target Customers</Label>
                        <Select 
                          value={formData.targetType} 
                          onValueChange={(value: any) => setFormData(prev => ({ ...prev, targetType: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Customers</SelectItem>
                            <SelectItem value="new">New Customers</SelectItem>
                            <SelectItem value="repeated">Repeated Buyers</SelectItem>
                            <SelectItem value="best">Best Customers</SelectItem>
                            <SelectItem value="single">Single Customer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.targetType === 'single' && (
                        <div>
                          <Label htmlFor="customer">Select Customer</Label>
                          <div className="space-y-2">
                            <Input
                              placeholder="Search customers..."
                              value={customerSearch}
                              onChange={(e) => setCustomerSearch(e.target.value)}
                            />
                            <Select 
                              value={formData.singleCustomerId} 
                              onValueChange={(value) => setFormData(prev => ({ ...prev, singleCustomerId: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a customer" />
                              </SelectTrigger>
                              <SelectContent>
                                {customers
                                  .filter(customer =>
                                    `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(customerSearch.toLowerCase()) ||
                                    customer.phone.includes(customerSearch)
                                  )
                                  .slice(0, 50)
                                  .map(customer => (
                                    <SelectItem key={customer._id} value={customer._id}>
                                      {customer.firstName} {customer.lastName} - {customer.phone}
                                    </SelectItem>
                                  ))
                                }
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      {/* Target Summary */}
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Target size={16} className="text-blue-600" />
                          <span className="font-medium text-blue-800">Target Summary</span>
                        </div>
                        <p className="text-sm text-blue-700">{getTargetDescription()}</p>
                        <div className="flex items-center justify-between mt-2 text-sm">
                          <span>Estimated Cost:</span>
                          <span className="font-medium">{formatCurrency(calculateEstimatedCost())}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="space-y-6">
                  {/* Message Preview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Message Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                        <p className="whitespace-pre-wrap">{formData.content}</p>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>Length: {formData.content.length} characters</span>
                        <span>SMS Count: {Math.ceil(formData.content.length / 160)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recipients Preview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center justify-between">
                        <span>Recipients ({formData.targetType === 'single' ? 1 : filteredCustomers.length})</span>
                        <Badge variant="outline">{getTargetDescription()}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {formData.targetType === 'single' ? (
                        <div className="text-center py-4">
                          <p className="text-gray-600">Single customer selected</p>
                        </div>
                      ) : (
                        <div className="max-h-40 overflow-y-auto">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {filteredCustomers.slice(0, 10).map(customer => (
                              <div key={customer._id} className="flex items-center space-x-2 text-sm p-2 bg-gray-50 rounded">
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="text-xs">
                                    {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{customer.firstName} {customer.lastName}</span>
                                <span className="text-gray-500">{customer.phone}</span>
                              </div>
                            ))}
                          </div>
                          {filteredCustomers.length > 10 && (
                            <p className="text-center text-gray-500 text-sm mt-2">
                              +{filteredCustomers.length - 10} more customers
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Cost Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Cost Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Recipients:</span>
                          <span>{formData.targetType === 'single' ? 1 : filteredCustomers.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>SMS per recipient:</span>
                          <span>{Math.ceil(formData.content.length / 160)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cost per SMS:</span>
                          <span>৳0.50</span>
                        </div>
                        <div className="flex justify-between font-medium text-base border-t pt-2">
                          <span>Total Estimated Cost:</span>
                          <span>{formatCurrency(calculateEstimatedCost())}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Send Button */}
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setComposeOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSendMessage} disabled={sending}>
                      {sending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={16} className="mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Messages</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalMessages}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <MessageSquare className="text-blue-600" size={20} />
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
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">SMS Sent</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalSent}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Send className="text-green-600" size={20} />
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
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Delivered</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalDelivered}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <CheckCircle className="text-purple-600" size={20} />
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
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Failed</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalFailed}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <XCircle className="text-red-600" size={20} />
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
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Cost</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatCurrency(stats.totalCost)}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Phone className="text-yellow-600" size={20} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Messages History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Message History</span>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={fetchMessages}>
                  <RefreshCw size={16} className="mr-2" />
                  Refresh
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={messages}
              columns={messageColumns}
              searchable
              filterable
              exportable
              selectable
              pagination
              pageSize={pagination.pageSize}
              filters={messageFilters}
              bulkActions={bulkActions}
              onView={handleViewMessage}
              onDelete={handleDeleteMessage}
              serverPagination={{
                page: pagination.page,
                pageSize: pagination.pageSize,
                total: pagination.total,
                onPageChange: (page) => setPagination(prev => ({ ...prev, page })),
                onPageSizeChange: (size) => setPagination(prev => ({ ...prev, pageSize: size, page: 1 })),
                pageSizeOptions: [10, 25, 50, 100]
              }}
              serverSort={{
                sortKey: sort.key,
                sortDirection: sort.direction,
                onChange: (key, direction) => setSort({ key, direction })
              }}
              serverSearch={{
                value: search,
                onChange: setSearch
              }}
              serverFilters={{
                values: filters,
                onChange: setFilters
              }}
            />
          </CardContent>
        </Card>

        {/* Message Details Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle>Message Details</DialogTitle>
            </DialogHeader>
            
            {selectedMessage && (
              <div className="space-y-6">
                {/* Message Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Message Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Message Type</Label>
                        <Badge variant="outline" className="mt-1 capitalize">
                          {selectedMessage.type}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Target Filter</Label>
                        <Badge variant="secondary" className="mt-1">
                          {selectedMessage.targetFilter.type}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Provider</Label>
                        <p className="text-sm">{selectedMessage.provider}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Total Recipients</Label>
                        <p className="text-sm font-medium">{selectedMessage.totalRecipients}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Message Content */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Message Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Length: {selectedMessage.content.length} characters</span>
                      <span>SMS Count: {Math.ceil(selectedMessage.content.length / 160)}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Delivery Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          <Send className="text-blue-600" size={20} />
                        </div>
                        <p className="text-2xl font-bold text-blue-600">{selectedMessage.sentCount}</p>
                        <p className="text-sm text-gray-600">Sent</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          <CheckCircle className="text-green-600" size={20} />
                        </div>
                        <p className="text-2xl font-bold text-green-600">{selectedMessage.deliveredCount}</p>
                        <p className="text-sm text-gray-600">Delivered</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          <XCircle className="text-red-600" size={20} />
                        </div>
                        <p className="text-2xl font-bold text-red-600">{selectedMessage.failedCount}</p>
                        <p className="text-sm text-gray-600">Failed</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          <Clock className="text-yellow-600" size={20} />
                        </div>
                        <p className="text-2xl font-bold text-yellow-600">
                          {selectedMessage.totalRecipients - selectedMessage.sentCount}
                        </p>
                        <p className="text-sm text-gray-600">Pending</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Delivery Progress</span>
                        <span>{Math.round((selectedMessage.sentCount / selectedMessage.totalRecipients) * 100)}%</span>
                      </div>
                      <Progress 
                        value={(selectedMessage.sentCount / selectedMessage.totalRecipients) * 100} 
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Sender & Cost Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sender & Cost Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Sent By</Label>
                        <div className="flex items-center space-x-3 mt-2">
                          <Avatar className="w-10 h-10">
                            {selectedMessage.sender?.firstName && selectedMessage.sender?.lastName ? (
                              <>
                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedMessage.sender.firstName} ${selectedMessage.sender.lastName}`} />
                                <AvatarFallback>
                                  {selectedMessage.sender.firstName.charAt(0)}{selectedMessage.sender.lastName.charAt(0)}
                                </AvatarFallback>
                              </>
                            ) : (
                              <AvatarFallback>
                                N/A
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {selectedMessage.sender?.firstName && selectedMessage.sender?.lastName 
                                ? `${selectedMessage.sender.firstName} ${selectedMessage.sender.lastName}`
                                : 'Unknown User'
                              }
                            </p>
                            <p className="text-sm text-gray-500">{(selectedMessage.sender as any)?.email || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Cost Information</Label>
                        <div className="mt-2 space-y-2">
                          {selectedMessage.cost ? (
                            <p className="text-lg font-bold text-green-600">{formatCurrency(selectedMessage.cost)}</p>
                          ) : (
                            <p className="text-gray-400">Cost not available</p>
                          )}
                          <div className="text-xs text-gray-500">
                            <p>SMS Count: {Math.ceil(selectedMessage.content.length / 160)}</p>
                            <p>Recipients: {selectedMessage.totalRecipients}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Timestamps */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Timestamps</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Created At</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Calendar size={16} className="text-gray-500" />
                          <div>
                            <p className="text-sm">{new Date(selectedMessage.createdAt).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500">{new Date(selectedMessage.createdAt).toLocaleTimeString()}</p>
                          </div>
                        </div>
                      </div>
                      {selectedMessage.completedAt && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Completed At</Label>
                          <div className="flex items-center space-x-2 mt-1">
                            <CheckCircle size={16} className="text-green-500" />
                            <div>
                              <p className="text-sm">{new Date(selectedMessage.completedAt).toLocaleDateString()}</p>
                              <p className="text-xs text-gray-500">{new Date(selectedMessage.completedAt).toLocaleTimeString()}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <ErrorDialogComponent />
      <DeleteConfirmationComponent />
    </AdminLayout>
  );
}