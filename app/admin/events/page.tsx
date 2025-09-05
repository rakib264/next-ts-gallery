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
import { Calendar, Clock, Package, Plus, Star, Zap } from 'lucide-react';
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
            <h1 className="text-3xl font-bold text-gray-900">Events</h1>
            <p className="text-gray-600 mt-1">
              Manage promotional events and special offers
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus size={16} className="mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Events</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Calendar className="text-blue-600" size={20} />
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
                    <p className="text-sm font-medium text-gray-600">Active Events</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.active}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Zap className="text-green-600" size={20} />
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
                    <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.upcoming}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Clock className="text-yellow-600" size={20} />
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
                    <p className="text-sm font-medium text-gray-600">Expired Events</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.expired}</p>
                  </div>
                  <div className="p-3 bg-gray-100 rounded-full">
                    <Star className="text-gray-600" size={20} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Events Table */}
        <Card>
          <CardHeader>
            <CardTitle>Events List</CardTitle>
          </CardHeader>
          <CardContent>
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
    </AdminLayout>
  );
}
