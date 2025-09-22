'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import DataTable from '@/components/admin/DataTable';
import EventPreview from '@/components/events/EventPreview';
import ActionConfirmationDialog from '@/components/ui/action-confirmation-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DateTimePicker from '@/components/ui/datetime-picker';
import DeleteConfirmationDialog from '@/components/ui/delete-confirmation-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import FileUpload from '@/components/ui/file-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ProductSelector from '@/components/ui/product-selector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToastWithTypes } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { BarChart3, Calendar, Clock, Package, Plus, Sparkles, Star, Zap } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface Event {
  _id: string;
  title: string;
  subtitle?: string;
  bannerImage?: string;
  discountText: string;
  startDate: string;
  endDate: string;
  products: Array<{
    _id: string;
    name: string;
    thumbnailImage?: string;
    price: number;
    comparePrice?: number;
    slug: string;
  }>;
  productsCount: number;
  isActive: boolean;
  status: 'active' | 'upcoming' | 'expired' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

interface EventFormData {
  title: string;
  subtitle: string;
  bannerImage: string;
  discountText: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  products: string[];
  isActive: boolean;
  status?: 'active' | 'upcoming' | 'expired' | 'inactive';
}

export default function AdminEvents() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | undefined>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | undefined>('desc');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const abortRef = useRef<AbortController | null>(null);
  
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    upcoming: 0,
    expired: 0
  });

  const { success, error } = useToastWithTypes();

  // Form and dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    subtitle: '',
    bannerImage: '',
    discountText: '',
    startDate: undefined,
    endDate: undefined,
    products: [],
    isActive: true,
    status: 'active'
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Confirmation dialogs
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionConfirmOpen, setActionConfirmOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [pendingAction, setPendingAction] = useState<null | 'activate' | 'deactivate' | 'delete'>(null);
  const [pendingRows, setPendingRows] = useState<Event[]>([]);

  // Preview dialog
  const [previewEvent, setPreviewEvent] = useState<Event | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

  // GSAP animations
  useEffect(() => {
    if (!loading) {
      const tl = gsap.timeline();
      
      // Animate header
      if (headerRef.current) {
        tl.fromTo(headerRef.current, 
          { y: -50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
        );
      }
      
      // Animate stats cards
      if (statsRef.current) {
        tl.fromTo(statsRef.current.children,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" },
          "-=0.4"
        );
      }
    }
  }, [loading]);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchEvents = async () => {
    try {
      setLoading(true);

      // cancel previous
      if (abortRef.current) abortRef.current.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (search) params.set('search', search);
      if (sortKey && sortDirection) {
        params.set('sortBy', sortKey);
        params.set('sortOrder', sortDirection);
      }

      // Apply filters
      const { status, dateFrom, dateTo } = filterValues;
      if (status) params.set('status', status);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);

      const response = await fetch(`/api/admin/events?${params.toString()}`, { signal: ac.signal });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch events');
      }

      setEvents(data.events || []);
      setTotal(data.pagination?.total || 0);

      // Calculate stats
      const allEvents = data.events || [];
      const activeCount = allEvents.filter((e: Event) => e.status === 'active').length;
      const upcomingCount = allEvents.filter((e: Event) => e.status === 'upcoming').length;
      const expiredCount = allEvents.filter((e: Event) => e.status === 'expired').length;
      setStats({
        total: data.pagination?.total || 0,
        active: activeCount,
        upcoming: upcomingCount,
        expired: expiredCount
      });
    } catch (err) {
      if ((err as any)?.name !== 'AbortError') {
        console.error('Error fetching events:', err);
        error('Failed to load events', 'Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch when query state changes
  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, sortKey, sortDirection, filterValues]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      bannerImage: '',
      discountText: '',
      startDate: undefined,
      endDate: undefined,
      products: [],
      isActive: true,
      status: 'active'
    });
    setFormErrors({});
    setEditingEvent(null);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Event title is required';
    }

    if (!formData.discountText.trim()) {
      errors.discountText = 'Discount text is required';
    }

    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      errors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      errors.endDate = 'End date must be after start date';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setFormLoading(true);
    try {
      const payload = {
        ...formData,
        startDate: formData.startDate?.toISOString(),
        endDate: formData.endDate?.toISOString()
      };

      const url = editingEvent ? `/api/admin/events/${editingEvent._id}` : '/api/admin/events';
      const method = editingEvent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details?.join(', ') || data.error || 'Failed to save event');
      }

      success(
        editingEvent ? 'Event updated' : 'Event created',
        editingEvent ? 'Event has been updated successfully.' : 'Event has been created successfully.'
      );

      setShowCreateDialog(false);
      resetForm();
      fetchEvents();
    } catch (err: any) {
      error('Save failed', err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleView = (event: Event) => {
    setPreviewEvent(event);
    setShowPreviewDialog(true);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      subtitle: event.subtitle || '',
      bannerImage: event.bannerImage || '',
      discountText: event.discountText,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      products: event.products.map(p => p._id),
      isActive: event.isActive,
      status: event.status
    });
    setShowCreateDialog(true);
  };

  const handleDelete = (event: Event) => {
    setPendingAction('delete');
    setPendingRows([event]);
    setConfirmOpen(true);
  };

  const applyOptimisticRemoval = (ids: string[]) => {
    if (!ids?.length) return;
    setEvents((prev) => prev.filter((e) => !ids.includes(e._id)));
    setTotal((t) => Math.max(0, t - ids.length));
  };

  const performBulkStatus = async (rows: Event[], isActive: boolean) => {
    const ids = rows.map((r) => r._id);
    try {
      const res = await fetch('/api/admin/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, isActive })
      });
      
      if (!res.ok) {
        throw new Error('Failed to update events');
      }
      
      success(
        isActive ? 'Events activated' : 'Events deactivated',
        `${ids.length} event${ids.length > 1 ? 's' : ''} ${isActive ? 'activated' : 'deactivated'} successfully.`
      );
      
      // Always refresh the data to get the latest status
      await fetchEvents();
    } catch (e) {
      await fetchEvents();
      error('Action failed', 'Something went wrong while applying bulk action.');
    }
  };

  const performBulkDelete = async (rows: Event[]) => {
    const ids = rows.map((r) => r._id);
    try {
      applyOptimisticRemoval(ids);
      const res = await fetch('/api/admin/events', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      if (!res.ok) {
        await fetchEvents();
      } else {
        success('Events deleted', `${ids.length} event${ids.length > 1 ? 's' : ''} deleted successfully.`);
      }
    } catch (e) {
      await fetchEvents();
      error('Delete failed', 'Something went wrong while deleting events.');
    }
  };

  const columns = [
    {
      key: 'bannerImage',
      label: 'Banner',
      render: (value: string, row: Event) => (
        <div className="w-16 h-10 bg-gray-100 rounded-lg overflow-hidden">
          {value ? (
            <img
              src={value}
              alt={row.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={12} className="text-gray-400" />
            </div>
          )}
        </div>
      ),
      width: '80px'
    },
    {
      key: 'title',
      label: 'Event Title',
      sortable: true,
      render: (value: string, row: Event) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          {row.subtitle && (
            <p className="text-sm text-gray-500">{row.subtitle}</p>
          )}
        </div>
      )
    },
    {
      key: 'discountText',
      label: 'Discount Text',
      render: (value: string) => (
        <Badge variant="outline" className="text-green-600 border-green-200">
          {value}
        </Badge>
      )
    },
    {
      key: 'startDate',
      label: 'Start Date',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {formatDate(value)}
        </span>
      )
    },
    {
      key: 'endDate',
      label: 'End Date',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {formatDate(value)}
        </span>
      )
    },
    {
      key: 'productsCount',
      label: 'Products',
      sortable: true,
      render: (value: number, row: Event) => (
        <div className="flex items-center space-x-1">
          <Package size={14} className="text-gray-400" />
          <span className="text-sm font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      filterable: true,
      render: (value: string) => (
        <Badge className={`text-xs ${getStatusColor(value)}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-500">
          {formatDate(value)}
        </span>
      )
    }
  ];

  const filters = useMemo(() => [
    {
      key: 'status',
      label: 'Status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Upcoming', value: 'upcoming' },
        { label: 'Expired', value: 'expired' },
        { label: 'Inactive', value: 'inactive' }
      ]
    },
    {
      type: 'dateRange' as const,
      label: 'Start Date Range',
      fromKey: 'dateFrom',
      toKey: 'dateTo'
    }
  ], []);

  const bulkActions = [
    {
      label: 'Activate',
      action: (selectedRows: Event[]) => {
        setPendingAction('activate');
        setPendingRows(selectedRows);
        setActionConfirmOpen(true);
      }
    },
    {
      label: 'Deactivate',
      action: (selectedRows: Event[]) => {
        setPendingAction('deactivate');
        setPendingRows(selectedRows);
        setActionConfirmOpen(true);
      }
    },
    {
      label: 'Delete',
      action: (selectedRows: Event[]) => {
        setPendingAction('delete');
        setPendingRows(selectedRows);
        setConfirmOpen(true);
      },
      variant: 'destructive' as const
    }
  ];

  const onConfirmAction = async () => {
    if (!pendingAction || pendingRows.length === 0) return;
    setIsConfirming(true);
    try {
      if (pendingAction === 'delete') await performBulkDelete(pendingRows);
      if (pendingAction === 'activate') await performBulkStatus(pendingRows, true);
      if (pendingAction === 'deactivate') await performBulkStatus(pendingRows, false);
    } finally {
      setIsConfirming(false);
      setConfirmOpen(false);
      setActionConfirmOpen(false);
      setPendingAction(null);
      setPendingRows([]);
    }
  };

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
        <div ref={containerRef} className="space-y-8 p-4 sm:p-6 lg:p-8">
          {/* Stunning Header Section */}
        <motion.div 
            ref={headerRef}
            className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700 rounded-3xl shadow-2xl border border-primary-200/20"
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600/90 to-secondary-600/90" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-2xl" />
            
            {/* Header Content */}
            <div className="relative p-6 sm:p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Calendar className="text-white" size={24} />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                      Events Management
                    </h1>
                    <p className="text-pink-100 text-lg">
                      Create and manage promotional events and special offers
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mt-6">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                    <Sparkles className="text-yellow-300" size={16} />
                    <span className="text-white font-medium">Promotional Campaigns</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                    <BarChart3 className="text-green-300" size={16} />
                    <span className="text-white font-medium">Event Analytics</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={resetForm}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white hover:text-white transition-all duration-300"
                    >
                      <Plus size={16} className="mr-2" />
                      <span className="hidden sm:inline">Create Event</span>
                      <span className="sm:hidden">Create</span>
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Stats Cards */}
        <div ref={statsRef} className="px-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="group"
            >
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-1">Total Events</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                      <div className="flex items-center mt-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-xs text-gray-500">All time</span>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                      <Calendar className="text-white" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="group"
            >
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-1">Active Events</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
                      <div className="flex items-center mt-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-xs text-gray-500">Running now</span>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg">
                      <Zap className="text-white" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="group"
            >
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-1">Upcoming</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.upcoming}</p>
                      <div className="flex items-center mt-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                        <span className="text-xs text-gray-500">Scheduled</span>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-lg">
                      <Clock className="text-white" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="group"
            >
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-1">Expired</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.expired}</p>
                      <div className="flex items-center mt-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
                        <span className="text-xs text-gray-500">Completed</span>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl shadow-lg">
                      <Star className="text-white" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Enhanced Events Table */}
        <div className="px-6 pb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-xl">
              <CardTitle className="text-xl font-semibold text-gray-800">Events Database</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <DataTable
                data={events}
                columns={columns}
                filters={filters}
                bulkActions={bulkActions}
                selectable
                exportable
                serverSearch={{
                  value: searchInput,
                  onChange: (v) => setSearchInput(v)
                }}
                serverFilters={{
                  values: filterValues,
                  onChange: (v) => { setFilterValues(v); setPage(1); }
                }}
                serverSort={{
                  sortKey: sortKey,
                  sortDirection: sortDirection as any,
                  onChange: (key, dir) => { setSortKey(key); setSortDirection(dir); setPage(1); }
                }}
                serverPagination={{
                  page,
                  pageSize: limit,
                  total,
                  onPageChange: (p) => setPage(p),
                  onPageSizeChange: (size) => { setLimit(size); setPage(1); },
                  pageSizeOptions: [5, 10, 25, 50]
                }}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>
        </div>

        {/* Create/Edit Event Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Summer Sale Event"
                  />
                  {formErrors.title && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.title}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="subtitle">Event Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Up to 50% off selected items"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="discountText">Discount Text *</Label>
                <Input
                  id="discountText"
                  value={formData.discountText}
                  onChange={(e) => setFormData({ ...formData, discountText: e.target.value })}
                  placeholder="Save up to 50%"
                />
                {formErrors.discountText && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.discountText}</p>
                )}
              </div>

              <div>
                <Label>Event Banner Image</Label>
                <FileUpload
                  accept="image/*"
                  onUpload={(url) => setFormData({ ...formData, bannerImage: url })}
                  className="mt-2"
                />
                {formData.bannerImage && (
                  <div className="mt-2">
                    <img
                      src={formData.bannerImage}
                      alt="Banner preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date & Time <span className="text-red-500">*</span></Label>
                  <DateTimePicker
                    selected={formData.startDate}
                    onChange={(date) => setFormData({ ...formData, startDate: date || undefined })}
                    placeholder="Select start date and time"
                    error={!!formErrors.startDate}
                  />
                  {formErrors.startDate && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.startDate}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="endDate">End Date & Time <span className="text-red-500">*</span></Label>
                  <DateTimePicker
                    selected={formData.endDate}
                    onChange={(date) => setFormData({ ...formData, endDate: date || undefined })}
                    placeholder="Select end date and time"
                    error={!!formErrors.endDate}
                  />
                  {formErrors.endDate && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.endDate}</p>
                  )}
                </div>
              </div>

              <ProductSelector
                selectedProducts={formData.products}
                onProductsChange={(products) => setFormData({ ...formData, products })}
                placeholder="Select products for this event"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Event Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ 
                      ...formData, 
                      status: value as 'active' | 'upcoming' | 'expired' | 'inactive',
                      isActive: value !== 'inactive' // Auto-update isActive based on status
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Status will be auto-computed based on dates, but you can override it manually
                  </p>
                </div>

                {/* <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Event is active</Label>
                </div> */}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={formLoading}>
                  {formLoading ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle>Event Preview</DialogTitle>
            </DialogHeader>
            
            {previewEvent && (
              <div className="py-4">
                <EventPreview event={previewEvent} />
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete confirmation */}
        <DeleteConfirmationDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          onConfirm={onConfirmAction}
          title={`Delete ${pendingRows.length} selected event${pendingRows.length > 1 ? 's' : ''}?`}
          description="This action cannot be undone and will permanently remove the selected events."
          entityName="Event"
          entityCount={pendingRows.length}
          isLoading={isConfirming}
        />

        {/* Activate/Deactivate confirmation */}
        <ActionConfirmationDialog
          open={actionConfirmOpen && pendingAction !== 'delete'}
          onOpenChange={setActionConfirmOpen}
          onConfirm={onConfirmAction}
          title={pendingAction === 'activate' ? `Activate ${pendingRows.length} event${pendingRows.length > 1 ? 's' : ''}?` : `Deactivate ${pendingRows.length} event${pendingRows.length > 1 ? 's' : ''}?`}
          description={pendingAction === 'activate' ? 'Selected events will become active and visible to customers.' : 'Selected events will be deactivated and hidden from customers.'}
          confirmLabel={pendingAction === 'activate' ? 'Activate' : 'Deactivate'}
          isLoading={isConfirming}
          tone={pendingAction === 'activate' ? 'success' : 'warning'}
        />
        </div>
      </div>
    </AdminLayout>
  );
}
