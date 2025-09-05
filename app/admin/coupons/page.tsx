'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import DataTable from '@/components/admin/DataTable';
import ActionConfirmationDialog from '@/components/ui/action-confirmation-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DeleteConfirmationDialog from '@/components/ui/delete-confirmation-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PAGE_SIZE_OPTIONS } from '@/constants';
import { useToastWithTypes } from '@/hooks/use-toast';
import { ErrorMessage, Field, Formik, Form as FormikForm } from 'formik';
import { motion } from 'framer-motion';
import {
  Calendar,
  Plus, Tag,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';

interface Coupon {
  _id: string;
  code: string;
  type: 'fixed' | 'percentage';
  value: number;
  minSpend?: number;
  maxDiscount?: number;
  applicableCategories?: string[];
  applicableProducts?: string[];
  startDate: string;
  expiryDate: string;
  usageLimit?: number;
  usageLimitPerCustomer?: number;
  currentUsage: number;
  isActive: boolean;
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface CouponFormData {
  code: string;
  type: 'fixed' | 'percentage';
  value: number;
  minSpend: number;
  maxDiscount: number;
  applicableCategories: string[];
  applicableProducts: string[];
  startDate: string;
  expiryDate: string;
  usageLimit: number;
  usageLimitPerCustomer: number;
  isActive: boolean;
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [serverFiltersValues, setServerFiltersValues] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<string | undefined>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>('desc');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const { success, error } = useToastWithTypes();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionConfirmOpen, setActionConfirmOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [pendingAction, setPendingAction] = useState<null | 'activate' | 'deactivate' | 'delete'>(null);
  const [pendingRows, setPendingRows] = useState<Coupon[]>([]);
  
  const [formData, setFormData] = useState<CouponFormData>({
    code: '',
    type: 'percentage',
    value: 0,
    minSpend: 0,
    maxDiscount: 0,
    applicableCategories: [],
    applicableProducts: [],
    startDate: '',
    expiryDate: '',
    usageLimit: 0,
    usageLimitPerCustomer: 1,
    isActive: true
  });

  const initialFormValues: CouponFormData = {
    code: '',
    type: 'percentage',
    value: 0,
    minSpend: 0,
    maxDiscount: 0,
    applicableCategories: [],
    applicableProducts: [],
    startDate: '',
    expiryDate: '',
    usageLimit: 0,
    usageLimitPerCustomer: 1,
    isActive: true
  };

  const validationSchema = Yup.object<CouponFormData>({
    code: Yup.string().trim().required('Code is required').max(32, 'Max 32 characters'),
    type: Yup.mixed<'fixed' | 'percentage'>().oneOf(['fixed', 'percentage']).required('Type is required'),
    value: Yup.number().required('Value is required').min(0, 'Must be ≥ 0'),
    minSpend: Yup.number().min(0, 'Must be ≥ 0').default(0),
    maxDiscount: Yup.number().when('type', {
      is: 'percentage',
      then: (schema: any) => schema.min(0, 'Must be ≥ 0'),
      otherwise: (schema: any) => schema.default(0)
    }),
    applicableCategories: Yup.array(Yup.string()),
    applicableProducts: Yup.array(Yup.string()),
    startDate: Yup.string().required('Start date is required'),
    expiryDate: Yup.string().required('Expiry date is required'),
    usageLimit: Yup.number().min(0, 'Must be ≥ 0').default(0),
    usageLimitPerCustomer: Yup.number().min(1, 'Must be ≥ 1').default(1),
    isActive: Yup.boolean().required()
  });

  useEffect(() => {
    fetchCoupons();
  }, [page, pageSize, search, serverFiltersValues, sortKey, sortOrder]);

  const buildQueryString = (): string => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(pageSize));
    if (search) params.set('search', search);
    if (sortKey && sortOrder) {
      params.set('sortBy', sortKey);
      params.set('sortOrder', sortOrder);
    }
    if (serverFiltersValues.type) params.set('type', serverFiltersValues.type);
    if (serverFiltersValues.isActive) params.set('active', serverFiltersValues.isActive);
    return params.toString();
  };

  const fetchCoupons = async () => {
    try {
      const qs = buildQueryString();
      const response = await fetch(`/api/admin/coupons?${qs}`);
      const data = await response.json();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.coupons)
          ? data.coupons
          : [];
      setCoupons(list);
      const totalItems = (data?.pagination?.total as number) ?? list.length ?? 0;
      setTotal(totalItems);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCouponCode = (setFieldValue?: (field: string, value: any) => void) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (setFieldValue) {
      setFieldValue('code', result);
    } else {
      setFormData(prev => ({ ...prev, code: result }));
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'percentage',
      value: 0,
      minSpend: 0,
      maxDiscount: 0,
      applicableCategories: [],
      applicableProducts: [],
      startDate: '',
      expiryDate: '',
      usageLimit: 0,
      usageLimitPerCustomer: 1,
      isActive: true
    });
    setEditingCoupon(null);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minSpend: coupon.minSpend || 0,
      maxDiscount: coupon.maxDiscount || 0,
      applicableCategories: coupon.applicableCategories || [],
      applicableProducts: coupon.applicableProducts || [],
      startDate: coupon.startDate.split('T')[0],
      expiryDate: coupon.expiryDate.split('T')[0],
      usageLimit: coupon.usageLimit || 0,
      usageLimitPerCustomer: coupon.usageLimitPerCustomer || 1,
      isActive: coupon.isActive
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (values: CouponFormData) => {
    try {
      const url = editingCoupon
        ? `/api/admin/coupons/${editingCoupon._id}`
        : '/api/admin/coupons';

      const method = editingCoupon ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        await fetchCoupons();
        setDialogOpen(false);
        resetForm();
        success(editingCoupon ? 'Coupon updated' : 'Coupon created', 'Changes saved successfully.');
      } else {
        error('Save failed', 'Could not save coupon.');
      }
    } catch (err) {
      console.error('Error saving coupon:', err);
      error('Save failed', 'Unexpected error while saving.');
    }
  };

  const handleDelete = (couponId: string) => {
    const couponToDelete = coupons.find(c => c._id === couponId);
    if (!couponToDelete) return;
    setPendingAction('delete');
    setPendingRows([couponToDelete]);
    setConfirmOpen(true);
  };

  const duplicateCoupon = (coupon: Coupon) => {
    setFormData({
      code: `${coupon.code}_COPY`,
      type: coupon.type,
      value: coupon.value,
      minSpend: coupon.minSpend || 0,
      maxDiscount: coupon.maxDiscount || 0,
      applicableCategories: coupon.applicableCategories || [],
      applicableProducts: coupon.applicableProducts || [],
      startDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      usageLimit: coupon.usageLimit || 0,
      usageLimitPerCustomer: coupon.usageLimitPerCustomer || 1,
      isActive: true
    });
    setDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getUsagePercentage = (coupon: Coupon) => {
    if (!coupon.usageLimit) return 0;
    return (coupon.currentUsage / coupon.usageLimit) * 100;
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  const columns = [
    {
      key: 'code',
      label: 'Coupon Code',
      sortable: true,
      render: (value: string, row: Coupon) => (
        <div>
          <p className="font-mono font-bold text-lg">{value}</p>
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant={row.type === 'percentage' ? 'default' : 'secondary'}>
              {row.type === 'percentage' ? `${row.value}%` : formatCurrency(row.value)} OFF
            </Badge>
            {isExpired(row.expiryDate) && (
              <Badge variant="destructive">Expired</Badge>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      filterable: true,
      render: (value: string, row: Coupon) => (
        <div>
          <Badge variant="outline" className="capitalize mb-1">
            {value}
          </Badge>
          <p className="text-sm text-gray-600">
            {value === 'percentage' ? `${row.value}%` : formatCurrency(row.value)}
          </p>
        </div>
      )
    },
    {
      key: 'minSpend',
      label: 'Min Spend',
      render: (value: number) => (
        value > 0 ? formatCurrency(value) : <span className="text-gray-400">No minimum</span>
      )
    },
    {
      key: 'usage',
      label: 'Usage',
      render: (value: any, row: Coupon) => (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{row.currentUsage}</span>
            <span>{row.usageLimit || '∞'}</span>
          </div>
          {row.usageLimit && (
            <Progress value={getUsagePercentage(row)} className="h-2" />
          )}
        </div>
      )
    },
    {
      key: 'startDate',
      label: 'Valid Period',
      render: (value: string, row: Coupon) => (
        <div className="text-sm">
          <p>{new Date(value).toLocaleDateString()}</p>
          <p className="text-gray-500">to</p>
          <p className={isExpired(row.expiryDate) ? 'text-red-600' : ''}>
            {new Date(row.expiryDate).toLocaleDateString()}
          </p>
        </div>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      filterable: true,
      render: (value: boolean, row: Coupon) => {
        if (!value) {
          return <Badge variant="secondary">Inactive</Badge>;
        }
        if (isExpired(row.expiryDate)) {
          return <Badge variant="destructive">Expired</Badge>;
        }
        return <Badge variant="default">Active</Badge>;
      }
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-500">
          {new Date(value).toLocaleDateString()}
        </span>
      )
    }
  ];

  const filters = [
    {
      key: 'type',
      label: 'Type',
      options: [
        { label: 'Percentage', value: 'percentage' },
        { label: 'Fixed Amount', value: 'fixed' }
      ]
    },
    {
      key: 'isActive',
      label: 'Status',
      options: [
        { label: 'Active', value: 'true' },
        { label: 'Inactive', value: 'false' }
      ]
    }
  ];

  const removeCouponsOptimistically = (ids: string[]) => {
    if (!ids?.length) return;
    setCoupons(prev => prev.filter(c => !ids.includes(c._id)));
  };

  const bulkStatus = async (rows: Coupon[], isActive: boolean) => {
    const ids = rows.map(r => r._id);
    try {
      removeCouponsOptimistically(ids);
      const res = await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, isActive })
      });
      if (!res.ok) {
        await fetchCoupons();
        error('Action failed', 'Could not update selected coupons.');
      } else {
        success(
          isActive ? 'Coupons activated' : 'Coupons deactivated',
          `${ids.length} coupon${ids.length > 1 ? 's' : ''} ${isActive ? 'activated' : 'deactivated'} successfully.`
        );
      }
    } catch (e) {
      await fetchCoupons();
      error('Action failed', 'Could not update selected coupons.');
    }
  };

  const bulkDelete = async (rows: Coupon[]) => {
    const ids = rows.map(r => r._id);
    try {
      removeCouponsOptimistically(ids);
      const res = await fetch('/api/admin/coupons', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      if (!res.ok) {
        await fetchCoupons();
        error('Delete failed', 'Could not delete selected coupons.');
      } else {
        success('Coupons deleted', `${ids.length} coupon${ids.length > 1 ? 's' : ''} deleted successfully.`);
      }
    } catch (e) {
      await fetchCoupons();
      error('Delete failed', 'Could not delete selected coupons.');
    }
  };

  const bulkActions = [
    { label: 'Activate', action: (rows: Coupon[]) => { setPendingAction('activate'); setPendingRows(rows); setActionConfirmOpen(true); } },
    { label: 'Deactivate', action: (rows: Coupon[]) => { setPendingAction('deactivate'); setPendingRows(rows); setActionConfirmOpen(true); } },
    { label: 'Delete', action: (rows: Coupon[]) => { setPendingAction('delete'); setPendingRows(rows); setConfirmOpen(true); }, variant: 'destructive' as const }
  ];

  const confirmTitle = pendingAction === 'delete'
    ? `Delete ${pendingRows.length} selected coupon${pendingRows.length > 1 ? 's' : ''}?`
    : pendingAction === 'activate'
      ? `Activate ${pendingRows.length} selected coupon${pendingRows.length > 1 ? 's' : ''}?`
      : pendingAction === 'deactivate'
        ? `Deactivate ${pendingRows.length} selected coupon${pendingRows.length > 1 ? 's' : ''}?`
        : '';

  const confirmDescription = pendingAction === 'delete'
    ? 'This action cannot be undone and will permanently remove the selected coupons.'
    : pendingAction === 'activate'
      ? 'Selected coupons will become active and available for use.'
      : pendingAction === 'deactivate'
        ? 'Selected coupons will be deactivated and hidden from customers. They will be removed from the current list.'
        : '';

  const onConfirmAction = async () => {
    if (!pendingAction || pendingRows.length === 0) return;
    setIsConfirming(true);
    try {
      if (pendingAction === 'delete') await bulkDelete(pendingRows);
      if (pendingAction === 'activate') await bulkStatus(pendingRows, true);
      if (pendingAction === 'deactivate') await bulkStatus(pendingRows, false);
    } finally {
      setIsConfirming(false);
      setConfirmOpen(false);
      setActionConfirmOpen(false);
      setPendingAction(null);
      setPendingRows([]);
    }
  };

  // Calculate stats
  const stats = {
    total: coupons?.length,
    active: coupons?.filter(c => c.isActive && !isExpired(c.expiryDate)).length,
    expired: coupons?.filter(c => isExpired(c.expiryDate)).length,
    totalUsage: coupons?.reduce((sum, coupon) => sum + coupon.currentUsage, 0)
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
            <h1 className="text-3xl font-bold text-gray-900">Coupons</h1>
            <p className="text-gray-600 mt-1">
              Create and manage discount coupons for your store
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
                <Plus size={16} className="mr-2" />
                Create Coupon
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
              <DialogHeader>
                <DialogTitle>
                  {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                </DialogTitle>
              </DialogHeader>
              <Formik
                enableReinitialize
                initialValues={editingCoupon ? {
                  code: editingCoupon.code,
                  type: editingCoupon.type,
                  value: editingCoupon.value,
                  minSpend: editingCoupon.minSpend || 0,
                  maxDiscount: editingCoupon.maxDiscount || 0,
                  applicableCategories: editingCoupon.applicableCategories || [],
                  applicableProducts: editingCoupon.applicableProducts || [],
                  startDate: editingCoupon.startDate.split('T')[0],
                  expiryDate: editingCoupon.expiryDate.split('T')[0],
                  usageLimit: editingCoupon.usageLimit || 0,
                  usageLimitPerCustomer: editingCoupon.usageLimitPerCustomer || 1,
                  isActive: editingCoupon.isActive,
                } : initialFormValues}
                validationSchema={validationSchema}
                onSubmit={async (values, { setSubmitting }) => {
                  await handleSubmit(values);
                  setSubmitting(false);
                }}
              >
                {({ values, setFieldValue, isSubmitting }) => (
                  <FormikForm className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code">Coupon Code *</Label>
                    <div className="flex space-x-2">
                      <Field name="code">
                        {({ field }: any) => (
                          <Input
                            id="code"
                            {...field}
                            value={field.value}
                            onChange={(e) => setFieldValue('code', String(e.target.value).toUpperCase())}
                            placeholder="DISCOUNT10"
                            className="font-mono"
                          />
                        )}
                      </Field>
                      <Button type="button" variant="outline" onClick={() => generateCouponCode(setFieldValue)}>
                        Generate
                      </Button>
                    </div>
                    <p className="text-xs text-red-600 mt-1"><ErrorMessage name="code" /></p>
                  </div>
                  <div>
                    <Label htmlFor="type">Discount Type *</Label>
                    <Select value={values.type} onValueChange={(value: 'fixed' | 'percentage') => setFieldValue('type', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-red-600 mt-1"><ErrorMessage name="type" /></p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="value">
                      {values.type === 'percentage' ? 'Percentage (%)' : 'Amount (BDT)'} *
                    </Label>
                    <Field name="value">
                      {({ field }: any) => (
                        <Input id="value" type="number" {...field} placeholder={values.type === 'percentage' ? '10' : '100'} />
                      )}
                    </Field>
                    <p className="text-xs text-red-600 mt-1"><ErrorMessage name="value" /></p>
                  </div>
                  <div>
                    <Label htmlFor="minSpend">Minimum Spend</Label>
                    <Field name="minSpend">
                      {({ field }: any) => (
                        <Input id="minSpend" type="number" {...field} placeholder="0" />
                      )}
                    </Field>
                  </div>
                  {values.type === 'percentage' && (
                    <div>
                      <Label htmlFor="maxDiscount">Max Discount</Label>
                      <Field name="maxDiscount">
                        {({ field }: any) => (
                          <Input id="maxDiscount" type="number" {...field} placeholder="0" />
                        )}
                      </Field>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Field name="startDate">
                      {({ field }: any) => (
                        <Input id="startDate" type="date" {...field} />
                      )}
                    </Field>
                    <p className="text-xs text-red-600 mt-1"><ErrorMessage name="startDate" /></p>
                  </div>
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date *</Label>
                    <Field name="expiryDate">
                      {({ field }: any) => (
                        <Input id="expiryDate" type="date" {...field} />
                      )}
                    </Field>
                    <p className="text-xs text-red-600 mt-1"><ErrorMessage name="expiryDate" /></p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="usageLimit">Usage Limit</Label>
                    <Field name="usageLimit">
                      {({ field }: any) => (
                        <Input id="usageLimit" type="number" {...field} placeholder="0 = Unlimited" />
                      )}
                    </Field>
                  </div>
                  <div>
                    <Label htmlFor="usageLimitPerCustomer">Usage Limit Per Customer</Label>
                    <Field name="usageLimitPerCustomer">
                      {({ field }: any) => (
                        <Input id="usageLimitPerCustomer" type="number" {...field} placeholder="1" />
                      )}
                    </Field>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="isActive" checked={values.isActive} onCheckedChange={(checked) => setFieldValue('isActive', checked)} />
                  <Label htmlFor="isActive">Active</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>{editingCoupon ? 'Update' : 'Create'} Coupon</Button>
                </div>
                  </FormikForm>
                )}
              </Formik>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
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
                    <p className="text-sm font-medium text-gray-600">Total Coupons</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Tag className="text-blue-600" size={20} />
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
                    <p className="text-sm font-medium text-gray-600">Active Coupons</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.active}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Calendar className="text-green-600" size={20} />
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
                    <p className="text-sm font-medium text-gray-600">Total Usage</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalUsage}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Users className="text-purple-600" size={20} />
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
                    <p className="text-sm font-medium text-gray-600">Expired</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.expired}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <Calendar className="text-red-600" size={20} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Coupons Table */}
        <Card>
          <CardHeader>
            <CardTitle>Coupons List</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={coupons}
              columns={columns}
              filters={filters}
              bulkActions={bulkActions}
              selectable
              exportable
              onView={(row) => { setSelectedCoupon(row as Coupon); setAnalyticsOpen(true); }}
              onEdit={(row) => handleEdit(row as Coupon)}
              onDelete={(row) => handleDelete((row as Coupon)._id)}
              serverPagination={{
                page,
                pageSize,
                total,
                onPageChange: (p: number) => setPage(p),
                onPageSizeChange: (size: number) => { setPageSize(size); setPage(1); },
                pageSizeOptions: PAGE_SIZE_OPTIONS
              }}
              serverSort={{
                sortKey,
                sortDirection: sortOrder,
                onChange: (key, direction) => { setSortKey(key); setSortOrder(direction); setPage(1); }
              }}
              serverSearch={{ value: search, onChange: (v: string) => { setSearch(v); setPage(1); } }}
              serverFilters={{ values: serverFiltersValues, onChange: (vals) => { setServerFiltersValues(vals); setPage(1); } }}
            />
          </CardContent>
        </Card>

        <DeleteConfirmationDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          onConfirm={onConfirmAction}
          title={confirmTitle}
          description={confirmDescription}
          entityName="Coupon"
          entityCount={pendingRows.length}
          isLoading={isConfirming}
        />

        <ActionConfirmationDialog
          open={actionConfirmOpen && pendingAction !== 'delete'}
          onOpenChange={setActionConfirmOpen}
          onConfirm={onConfirmAction}
          title={pendingAction === 'activate' ? `Activate ${pendingRows.length} coupon${pendingRows.length > 1 ? 's' : ''}?` : `Deactivate ${pendingRows.length} coupon${pendingRows.length > 1 ? 's' : ''}?`}
          description={pendingAction === 'activate' ? 'Selected coupons will become active and available for use.' : 'Selected coupons will be deactivated and hidden from customers. They will be removed from the current list.'}
          confirmLabel={pendingAction === 'activate' ? 'Activate' : 'Deactivate'}
          isLoading={isConfirming}
          tone={pendingAction === 'activate' ? 'success' : 'warning'}
        />

        {/* View / Analytics Dialog */}
        <Dialog open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
          <DialogContent className="max-w-xl bg-white">
            <DialogHeader>
              <DialogTitle>Coupon Details</DialogTitle>
            </DialogHeader>
            {selectedCoupon && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Code</p>
                    <p className="font-mono font-bold text-lg">{selectedCoupon.code}</p>
                  </div>
                  <Badge variant={selectedCoupon.type === 'percentage' ? 'default' : 'secondary'}>
                    {selectedCoupon.type === 'percentage' ? `${selectedCoupon.value}%` : formatCurrency(selectedCoupon.value)} OFF
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="capitalize">{selectedCoupon.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    {selectedCoupon.isActive ? (
                      isExpired(selectedCoupon.expiryDate) ? (
                        <Badge variant="destructive">Expired</Badge>
                      ) : (
                        <Badge variant="default">Active</Badge>
                      )
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Min Spend</p>
                    <p>{selectedCoupon.minSpend ? formatCurrency(selectedCoupon.minSpend) : 'No minimum'}</p>
                  </div>
                  {selectedCoupon.type === 'percentage' && (
                    <div>
                      <p className="text-sm text-gray-500">Max Discount</p>
                      <p>{selectedCoupon.maxDiscount ? formatCurrency(selectedCoupon.maxDiscount) : 'Unlimited'}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p>{new Date(selectedCoupon.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Expiry Date</p>
                    <p className={isExpired(selectedCoupon.expiryDate) ? 'text-red-600' : ''}>
                      {new Date(selectedCoupon.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Usage</p>
                  <div className="flex justify-between text-sm">
                    <span>{selectedCoupon.currentUsage}</span>
                    <span>{selectedCoupon.usageLimit || '∞'}</span>
                  </div>
                  {selectedCoupon.usageLimit && (
                    <Progress value={getUsagePercentage(selectedCoupon)} className="h-2 mt-2" />
                  )}
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setAnalyticsOpen(false)}>Close</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}