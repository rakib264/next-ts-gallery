'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import DataTable from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DeleteConfirmationDialog from '@/components/ui/delete-confirmation-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Edit,
  Eye,
  MapPin,
  Package,
  Phone,
  Plus, Truck,
  User,
  Weight,
  XCircle
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface Courier {
  _id: string;
  courierId: string;
  order: {
    _id: string;
    orderNumber: string;
    total: number;
  };
  sender: {
    name: string;
    phone: string;
    address: string;
    division: string;
    district: string;
  };
  receiver: {
    name: string;
    phone: string;
    address: string;
    division: string;
    district: string;
  };
  parcel: {
    type: 'regular' | 'express' | 'fragile';
    quantity: number;
    weight: number;
    value: number;
    description: string;
  };
  isCOD: boolean;
  codAmount?: number;
  isFragile: boolean;
  charges: {
    deliveryCharge: number;
    codCharge: number;
    totalCharge: number;
  };
  status: 'pending' | 'picked' | 'in_transit' | 'delivered' | 'returned' | 'cancelled';
  trackingNumber?: string;
  courierPartner?: string;
  pickupDate?: string;
  deliveryDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface CourierFormData {
  orderId: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  senderDivision: string;
  senderDistrict: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverDivision: string;
  receiverDistrict: string;
  parcelType: 'regular' | 'express' | 'fragile';
  quantity: number;
  weight: number;
  value: number;
  description: string;
  isCOD: boolean;
  codAmount: number;
  isFragile: boolean;
  deliveryCharge: number;
  codCharge: number;
  courierPartner: string;
  notes: string;
  status: 'pending' | 'picked' | 'in_transit' | 'delivered' | 'returned' | 'cancelled';
  trackingNumber: string;
}

export default function AdminCourier() {
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourier, setEditingCourier] = useState<Courier | null>(null);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState<Courier | null>(null);
  const [courierSettings, setCourierSettings] = useState<any>(null);
  
  // New modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courierToDelete, setCourierToDelete] = useState<Courier | null>(null);
  const [courierToView, setCourierToView] = useState<Courier | null>(null);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [couriersToDelete, setCouriersToDelete] = useState<Courier[]>([]);
  
  const [formData, setFormData] = useState<CourierFormData>({
    orderId: '',
    senderName: process.env.NEXT_PUBLIC_SITE_NAME || 'TSR Gallery',
    senderPhone: '+8801234567890',
    senderAddress: '123 Technology Street',
    senderDivision: 'Dhaka',
    senderDistrict: 'Dhaka',
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    receiverDivision: '',
    receiverDistrict: '',
    parcelType: 'regular',
    quantity: 1,
    weight: 0,
    value: 0,
    description: '',
    isCOD: false,
    codAmount: 0,
    isFragile: false,
    deliveryCharge: 60,
    codCharge: 0,
    courierPartner: '',
    notes: '',
    status: 'pending',
    trackingNumber: ''
  });

  useEffect(() => {
    fetchCouriers();
    fetchCourierSettings();
  }, []);

  const fetchCourierSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings/courier');
      if (response.ok) {
        const settings = await response.json();
        setCourierSettings(settings);
        // Update form data with settings
        setFormData(prev => ({
          ...prev,
          senderName: settings.senderInfo?.name || prev.senderName,
          senderPhone: settings.senderInfo?.phone || prev.senderPhone,
          senderAddress: settings.senderInfo?.address || prev.senderAddress,
          senderDivision: settings.senderInfo?.division || prev.senderDivision,
          senderDistrict: settings.senderInfo?.district || prev.senderDistrict,
          courierPartner: settings.defaultCourierPartners?.[0] || prev.courierPartner,
        }));
      }
    } catch (error) {
      console.error('Error fetching courier settings:', error);
    }
  };

  const fetchCouriers = async () => {
    try {
      const response = await fetch('/api/admin/courier');
      const data = await response.json();
      setCouriers(data.couriers || []);
    } catch (error) {
      console.error('Error fetching couriers:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCourierId = () => {
    return `CR${Date.now().toString().slice(-8)}`;
  };

  const calculateCharges = () => {
    if (!courierSettings) return;
    
    let deliveryCharge = 60; // Default fallback
    const isWithinDhaka = formData.receiverDivision?.toLowerCase().includes('dhaka') || 
                         formData.receiverDistrict?.toLowerCase().includes('dhaka');
    
    // Calculate delivery charge based on type and location
    if (formData.parcelType === 'regular') {
      deliveryCharge = isWithinDhaka ? 
        courierSettings.deliveryCharges.regularWithinDhaka : 
        courierSettings.deliveryCharges.regularOutsideDhaka;
    } else if (formData.parcelType === 'express') {
      deliveryCharge = isWithinDhaka ? 
        courierSettings.deliveryCharges.expressWithinDhaka : 
        courierSettings.deliveryCharges.expressOutsideDhaka;
    }
    
    // Add fragile handling charge
    if (formData.isFragile) {
      deliveryCharge += courierSettings.deliveryCharges.fragileHandlingCharge;
    }
    
    // Weight-based charges (if enabled)
    if (courierSettings.weightBasedCharging && formData.weight > 1) {
      deliveryCharge += Math.ceil(formData.weight - 1) * 10;
    }
    
    // COD charges
    let codCharge = 0;
    if (formData.isCOD && formData.codAmount > 0) {
      codCharge = Math.max(10, (formData.codAmount * courierSettings.codChargeRate) / 100);
    }
    
    setFormData(prev => ({
      ...prev,
      deliveryCharge,
      codCharge
    }));
  };

  useEffect(() => {
    calculateCharges();
  }, [formData.parcelType, formData.isFragile, formData.weight, formData.isCOD, formData.codAmount, formData.receiverDivision, formData.receiverDistrict, courierSettings]);

  const resetForm = () => {
    setFormData({
      orderId: '',
      senderName: courierSettings?.senderInfo?.name || process.env.NEXT_PUBLIC_SITE_NAME || 'TSR Gallery',
      senderPhone: courierSettings?.senderInfo?.phone || '+8801234567890',
      senderAddress: courierSettings?.senderInfo?.address || '123 Technology Street',
      senderDivision: courierSettings?.senderInfo?.division || 'Dhaka',
      senderDistrict: courierSettings?.senderInfo?.district || 'Dhaka',
      receiverName: '',
      receiverPhone: '',
      receiverAddress: '',
      receiverDivision: '',
      receiverDistrict: '',
      parcelType: 'regular',
      quantity: 1,
      weight: 0,
      value: 0,
      description: '',
      isCOD: false,
      codAmount: 0,
      isFragile: false,
      deliveryCharge: 60,
      codCharge: 0,
      courierPartner: courierSettings?.defaultCourierPartners?.[0] || '',
      notes: '',
      status: 'pending',
      trackingNumber: ''
    });
    setEditingCourier(null);
  };

  const handleEdit = (courier: Courier) => {
    setEditingCourier(courier);
    setFormData({
      orderId: courier.order._id,
      senderName: courier.sender.name,
      senderPhone: courier.sender.phone,
      senderAddress: courier.sender.address,
      senderDivision: courier.sender.division,
      senderDistrict: courier.sender.district,
      receiverName: courier.receiver.name,
      receiverPhone: courier.receiver.phone,
      receiverAddress: courier.receiver.address,
      receiverDivision: courier.receiver.division,
      receiverDistrict: courier.receiver.district,
      parcelType: courier.parcel.type,
      quantity: courier.parcel.quantity,
      weight: courier.parcel.weight,
      value: courier.parcel.value,
      description: courier.parcel.description,
      isCOD: courier.isCOD,
      codAmount: courier.codAmount || 0,
      isFragile: courier.isFragile,
      deliveryCharge: courier.charges.deliveryCharge,
      codCharge: courier.charges.codCharge,
      courierPartner: courier.courierPartner || '',
      notes: courier.notes || '',
      status: courier.status,
      trackingNumber: courier.trackingNumber || ''
    });
    setDialogOpen(true);
  };

  // New action handlers
  const handleView = (courier: Courier) => {
    setCourierToView(courier);
    setViewModalOpen(true);
  };

  const handleUpdate = (courier: Courier) => {
    setEditingCourier(courier);
    setFormData({
      orderId: courier.order._id,
      senderName: courier.sender.name,
      senderPhone: courier.sender.phone,
      senderAddress: courier.sender.address,
      senderDivision: courier.sender.division,
      senderDistrict: courier.sender.district,
      receiverName: courier.receiver.name,
      receiverPhone: courier.receiver.phone,
      receiverAddress: courier.receiver.address,
      receiverDivision: courier.receiver.division,
      receiverDistrict: courier.receiver.district,
      parcelType: courier.parcel.type,
      quantity: courier.parcel.quantity,
      weight: courier.parcel.weight,
      value: courier.parcel.value,
      description: courier.parcel.description,
      isCOD: courier.isCOD,
      codAmount: courier.codAmount || 0,
      isFragile: courier.isFragile,
      deliveryCharge: courier.charges.deliveryCharge,
      codCharge: courier.charges.codCharge,
      courierPartner: courier.courierPartner || '',
      notes: courier.notes || '',
      status: courier.status,
      trackingNumber: courier.trackingNumber || ''
    });
    setUpdateModalOpen(true);
  };

  const handleDelete = (courier: Courier) => {
    setCourierToDelete(courier);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!courierToDelete) return;
    
    try {
      const response = await fetch(`/api/admin/courier/${courierToDelete._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchCouriers();
        setDeleteModalOpen(false);
        setCourierToDelete(null);
      } else {
        const errorData = await response.json();
        alert('Error deleting courier: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting courier:', error);
      alert('Error deleting courier: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingCourier 
        ? `/api/admin/courier/${editingCourier._id}`
        : '/api/admin/courier';
      
      const method = editingCourier ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          courierId: editingCourier?.courierId || generateCourierId()
        })
      });

      if (response.ok) {
        fetchCouriers();
        setDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving courier:', error);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCourier) return;
    
    try {
      const response = await fetch(`/api/admin/courier/${editingCourier._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          courierId: editingCourier.courierId
        })
      });

      if (response.ok) {
        fetchCouriers();
        setUpdateModalOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error updating courier:', error);
    }
  };

  const updateStatus = async (courierId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/courier/${courierId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchCouriers();
      }
    } catch (error) {
      console.error('Error updating courier status:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_transit': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'picked': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'returned': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle size={14} className="text-green-600" />;
      case 'in_transit': return <Truck size={14} className="text-blue-600" />;
      case 'picked': return <Package size={14} className="text-purple-600" />;
      case 'pending': return <Clock size={14} className="text-yellow-600" />;
      case 'returned': return <AlertTriangle size={14} className="text-orange-600" />;
      case 'cancelled': return <XCircle size={14} className="text-red-600" />;
      default: return <Clock size={14} className="text-gray-600" />;
    }
  };

  const getStatusProgress = (status: string) => {
    const statusOrder = ['pending', 'picked', 'in_transit', 'delivered'];
    const currentIndex = statusOrder.indexOf(status);
    return currentIndex >= 0 ? ((currentIndex + 1) / statusOrder.length) * 100 : 0;
  };

  const columns = [
    {
      key: 'courierId',
      label: 'Courier ID',
      sortable: true,
      render: (value: string, row: Courier) => (
        <div>
          <p className="font-mono font-medium">{value}</p>
          <p className="text-sm text-gray-500">{row.order.orderNumber}</p>
        </div>
      )
    },
    {
      key: 'receiver',
      label: 'Receiver',
      render: (value: any) => (
        <div>
          <p className="font-medium">{value.name}</p>
          <p className="text-sm text-gray-500">{value.phone}</p>
          <p className="text-sm text-gray-500">{value.division}, {value.district}</p>
        </div>
      )
    },
    {
      key: 'parcel',
      label: 'Parcel',
      render: (value: any, row: Courier) => (
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Badge variant="outline" className="capitalize">
              {value.type}
            </Badge>
            {row.isCOD && <Badge variant="secondary">COD</Badge>}
            {row.isFragile && <Badge variant="destructive">Fragile</Badge>}
          </div>
          <p className="text-sm text-gray-600">
            {value.quantity} items • {value.weight}kg
          </p>
          <p className="text-sm text-gray-600">
            Value: {formatCurrency(value.value)}
          </p>
        </div>
      )
    },
    {
      key: 'charges',
      label: 'Charges',
      render: (value: any, row: Courier) => (
        <div>
          <p className="font-medium">{formatCurrency(value.totalCharge)}</p>
          <p className="text-sm text-gray-500">
            Delivery: {formatCurrency(value.deliveryCharge)}
          </p>
          {row.isCOD && (
            <p className="text-sm text-gray-500">
              COD: {formatCurrency(value.codCharge)}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status & Progress',
      filterable: true,
      render: (value: string, row: Courier) => (
        <div className="space-y-2">
          <Badge className={`${getStatusColor(value)} flex items-center space-x-1 border`}>
            {getStatusIcon(value)}
            <span className="capitalize">{value.replace('_', ' ')}</span>
          </Badge>
          {!['returned', 'cancelled'].includes(value) && (
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
                style={{ width: `${getStatusProgress(value)}%` }}
              ></div>
            </div>
          )}
          {row.trackingNumber && (
            <div className="text-xs text-gray-500 font-mono">
              {row.trackingNumber}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'courierPartner',
      label: 'Partner',
      render: (value: string) => (
        value ? (
          <Badge variant="outline">{value}</Badge>
        ) : (
          <span className="text-gray-400">Not assigned</span>
        )
      )
    },
    {
      key: 'trackingNumber',
      label: 'Tracking',
      render: (value: string) => (
        value ? (
          <span className="font-mono text-sm">{value}</span>
        ) : (
          <span className="text-gray-400">-</span>
        )
      )
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

  // Transform data to flatten nested properties for filtering
  const transformedCouriers = useMemo(() => {
    return couriers.map(courier => ({
      ...courier,
      parcelType: courier.parcel.type, // Flatten parcel.type to parcelType
    }));
  }, [couriers]);

  const filters = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Picked', value: 'picked' },
        { label: 'In Transit', value: 'in_transit' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Returned', value: 'returned' },
        { label: 'Cancelled', value: 'cancelled' }
      ]
    },
    {
      key: 'courierPartner',
      label: 'Delivery Partner',
      options: [
        { label: 'Steadfast', value: 'steadfast' },
        { label: 'Pathao', value: 'pathao' },
        { label: 'RedX', value: 'redx' },
        { label: 'Paperfly', value: 'paperfly' },
        { label: 'Sundarban', value: 'sundarban' }
      ]
    },
    {
      type: 'boolean' as const,
      key: 'isCOD',
      label: 'Payment Method',
      trueLabel: 'Cash on Delivery',
      falseLabel: 'Prepaid'
    },
    {
      key: 'parcelType',
      label: 'Parcel Type',
      options: [
        { label: 'Regular', value: 'regular' },
        { label: 'Express', value: 'express' },
        { label: 'Fragile', value: 'fragile' }
      ]
    },
    {
      type: 'boolean' as const,
      key: 'isFragile',
      label: 'Fragile Items',
      trueLabel: 'Yes',
      falseLabel: 'No'
    }
  ];

  const handleBulkStatusUpdate = async (selectedRows: Courier[], status: string) => {
    try {
      const courierIds = selectedRows.map(courier => courier._id);
      const response = await fetch('/api/admin/courier/bulk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courierIds, status })
      });

      if (response.ok) {
        fetchCouriers();
      } else {
        throw new Error('Failed to update courier statuses');
      }
    } catch (error) {
      console.error('Error updating courier statuses:', error);
    }
  };

  const handleBulkDelete = async (selectedRows: Courier[]) => {
    setCouriersToDelete(selectedRows);
    setBulkDeleteModalOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      const courierIds = couriersToDelete.map(courier => courier._id);
      const response = await fetch('/api/admin/courier/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courierIds })
      });

      if (response.ok) {
        fetchCouriers();
        setBulkDeleteModalOpen(false);
        setCouriersToDelete([]);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete couriers');
      }
    } catch (error) {
      console.error('Error deleting couriers:', error);
      alert('Error deleting couriers: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const exportSelectedCouriers = (selectedRows: Courier[]) => {
    const headers = [
      'Courier ID',
      'Order Number', 
      'Receiver Name',
      'Receiver Phone',
      'Receiver Address',
      'Status',
      'Delivery Partner',
      'Parcel Type',
      'Weight (kg)',
      'Value (BDT)',
      'Delivery Charge',
      'COD Amount',
      'Total Charge',
      'Created At'
    ];

    const rows = selectedRows.map(courier => [
      courier.courierId,
      courier.order.orderNumber,
      courier.receiver.name,
      courier.receiver.phone,
      `${courier.receiver.address}, ${courier.receiver.district}, ${courier.receiver.division}`,
      courier.status,
      courier.courierPartner || 'Not assigned',
      courier.parcel.type,
      courier.parcel.weight,
      courier.parcel.value,
      courier.charges.deliveryCharge,
      courier.isCOD ? (courier.codAmount || 0) : 0,
      courier.charges.totalCharge,
      new Date(courier.createdAt).toLocaleDateString()
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `couriers-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const bulkActions = [
    {
      label: 'Mark as Picked',
      action: (selectedRows: Courier[]) => handleBulkStatusUpdate(selectedRows, 'picked'),
      condition: (selectedRows: Courier[]) => selectedRows.some(c => c.status === 'pending')
    },
    {
      label: 'Mark as In Transit',
      action: (selectedRows: Courier[]) => handleBulkStatusUpdate(selectedRows, 'in_transit'),
      condition: (selectedRows: Courier[]) => selectedRows.some(c => ['pending', 'picked'].includes(c.status))
    },
    {
      label: 'Mark as Delivered',
      action: (selectedRows: Courier[]) => handleBulkStatusUpdate(selectedRows, 'delivered'),
      condition: (selectedRows: Courier[]) => selectedRows.some(c => ['picked', 'in_transit'].includes(c.status))
    },
    {
      label: 'Mark as Returned',
      action: (selectedRows: Courier[]) => handleBulkStatusUpdate(selectedRows, 'returned'),
      variant: 'destructive' as 'destructive',
      condition: (selectedRows: Courier[]) => selectedRows.some(c => ['picked', 'in_transit'].includes(c.status))
    },
    {
      label: 'Delete Selected',
      action: handleBulkDelete,
      variant: 'destructive' as 'destructive',
      condition: (selectedRows: Courier[]) => selectedRows.length > 0 && selectedRows.every(c => !['in_transit', 'delivered'].includes(c.status))
    },
    {
      label: 'Export Selected',
      action: (selectedRows: Courier[]) => {
        exportSelectedCouriers(selectedRows);
      }
    }
  ];

  // Calculate stats
  const stats = {
    total: couriers?.length || 0,
    pending: couriers?.filter(c => c.status === 'pending')?.length || 0,
    picked: couriers?.filter(c => c.status === 'picked')?.length || 0,
    inTransit: couriers?.filter(c => c.status === 'in_transit')?.length || 0,
    delivered: couriers?.filter(c => c.status === 'delivered')?.length || 0,
    returned: couriers?.filter(c => c.status === 'returned')?.length || 0,
    cancelled: couriers?.filter(c => c.status === 'cancelled')?.length || 0,
    cod: couriers?.filter(c => c.isCOD)?.length || 0,
    totalRevenue: couriers?.reduce((sum, courier) => sum + (courier.charges?.totalCharge || 0), 0) || 0,
    averageDeliveryTime: 0, // This would be calculated from delivery data
    onTimeDeliveryRate: 0, // This would be calculated from delivery performance
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
            <h1 className="text-3xl font-bold text-gray-900">Courier Management</h1>
            <p className="text-gray-600 mt-1">
              Manage deliveries and track shipments
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus size={16} className="mr-2" />
                Create Courier
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
              <DialogHeader>
                <DialogTitle>
                  {editingCourier ? 'Edit Courier' : 'Create New Courier'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Order Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Order Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label htmlFor="orderId">Order ID</Label>
                      <Input
                        id="orderId"
                        value={formData.orderId}
                        onChange={(e) => setFormData(prev => ({ ...prev, orderId: e.target.value }))}
                        placeholder="Select or enter order ID"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Sender & Receiver */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Sender Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="senderName">Name</Label>
                        <Input
                          id="senderName"
                          value={formData.senderName}
                          onChange={(e) => setFormData(prev => ({ ...prev, senderName: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="senderPhone">Phone</Label>
                        <Input
                          id="senderPhone"
                          value={formData.senderPhone}
                          onChange={(e) => setFormData(prev => ({ ...prev, senderPhone: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="senderAddress">Address</Label>
                        <Textarea
                          id="senderAddress"
                          value={formData.senderAddress}
                          onChange={(e) => setFormData(prev => ({ ...prev, senderAddress: e.target.value }))}
                          rows={2}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="senderDivision">Division</Label>
                          <Input
                            id="senderDivision"
                            value={formData.senderDivision}
                            onChange={(e) => setFormData(prev => ({ ...prev, senderDivision: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="senderDistrict">District</Label>
                          <Input
                            id="senderDistrict"
                            value={formData.senderDistrict}
                            onChange={(e) => setFormData(prev => ({ ...prev, senderDistrict: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Receiver Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="receiverName">Name</Label>
                        <Input
                          id="receiverName"
                          value={formData.receiverName}
                          onChange={(e) => setFormData(prev => ({ ...prev, receiverName: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="receiverPhone">Phone</Label>
                        <Input
                          id="receiverPhone"
                          value={formData.receiverPhone}
                          onChange={(e) => setFormData(prev => ({ ...prev, receiverPhone: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="receiverAddress">Address</Label>
                        <Textarea
                          id="receiverAddress"
                          value={formData.receiverAddress}
                          onChange={(e) => setFormData(prev => ({ ...prev, receiverAddress: e.target.value }))}
                          rows={2}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="receiverDivision">Division</Label>
                          <Input
                            id="receiverDivision"
                            value={formData.receiverDivision}
                            onChange={(e) => setFormData(prev => ({ ...prev, receiverDivision: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="receiverDistrict">District</Label>
                          <Input
                            id="receiverDistrict"
                            value={formData.receiverDistrict}
                            onChange={(e) => setFormData(prev => ({ ...prev, receiverDistrict: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Parcel Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Parcel Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="parcelType">Type</Label>
                        <Select value={formData.parcelType} onValueChange={(value: 'regular' | 'express' | 'fragile') => setFormData(prev => ({ ...prev, parcelType: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="regular">Regular</SelectItem>
                            <SelectItem value="express">Express</SelectItem>
                            <SelectItem value="fragile">Fragile</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          value={formData.quantity}
                          onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.1"
                          value={formData.weight}
                          onChange={(e) => setFormData(prev => ({ ...prev, weight: Number(e.target.value) }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="value">Value (BDT)</Label>
                        <Input
                          id="value"
                          type="number"
                          value={formData.value}
                          onChange={(e) => setFormData(prev => ({ ...prev, value: Number(e.target.value) }))}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe the parcel contents"
                        rows={2}
                        required
                      />
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isCOD"
                          checked={formData.isCOD}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isCOD: checked }))}
                        />
                        <Label htmlFor="isCOD">Cash on Delivery</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isFragile"
                          checked={formData.isFragile}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFragile: checked }))}
                        />
                        <Label htmlFor="isFragile">Fragile</Label>
                      </div>
                    </div>

                    {formData.isCOD && (
                      <div>
                        <Label htmlFor="codAmount">COD Amount (BDT)</Label>
                        <Input
                          id="codAmount"
                          type="number"
                          value={formData.codAmount}
                          onChange={(e) => setFormData(prev => ({ ...prev, codAmount: Number(e.target.value) }))}
                          required
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Charges & Partner */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Charges</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="deliveryCharge">Delivery Charge</Label>
                        <Input
                          id="deliveryCharge"
                          type="number"
                          value={formData.deliveryCharge}
                          onChange={(e) => setFormData(prev => ({ ...prev, deliveryCharge: Number(e.target.value) }))}
                          required
                        />
                      </div>
                      {formData.isCOD && (
                        <div>
                          <Label htmlFor="codCharge">COD Charge</Label>
                          <Input
                            id="codCharge"
                            type="number"
                            value={formData.codCharge}
                            onChange={(e) => setFormData(prev => ({ ...prev, codCharge: Number(e.target.value) }))}
                            required
                          />
                        </div>
                      )}
                      <div className="pt-2 border-t">
                        <div className="flex justify-between font-medium">
                          <span>Total Charge:</span>
                          <span>{formatCurrency(formData.deliveryCharge + formData.codCharge)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Courier Partner</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="courierPartner">Partner</Label>
                        <Select value={formData.courierPartner} onValueChange={(value) => setFormData(prev => ({ ...prev, courierPartner: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select courier partner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="steadfast">Steadfast</SelectItem>
                            <SelectItem value="pathao">Pathao</SelectItem>
                            <SelectItem value="redx">RedX</SelectItem>
                            <SelectItem value="paperfly">Paperfly</SelectItem>
                            <SelectItem value="sundarban">Sundarban</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Additional notes or instructions"
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingCourier ? 'Update' : 'Create'} Courier
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Enhanced Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Total</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
                    <p className="text-xs text-blue-600">Shipments</p>
                  </div>
                  <div className="p-2 bg-blue-500 rounded-lg shadow-lg">
                    <Package className="text-white" size={16} />
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
            <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-yellow-700 uppercase tracking-wide">Pending</p>
                    <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
                    <p className="text-xs text-yellow-600">⏳ Awaiting</p>
                  </div>
                  <div className="p-2 bg-yellow-500 rounded-lg shadow-lg">
                    <Clock className="text-white" size={16} />
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
            <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">In Transit</p>
                    <p className="text-2xl font-bold text-purple-900 mt-1">{stats.inTransit}</p>
                    <p className="text-xs text-purple-600">🚛 Moving</p>
                  </div>
                  <div className="p-2 bg-purple-500 rounded-lg shadow-lg">
                    <Truck className="text-white" size={16} />
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
            <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Delivered</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">{stats.delivered}</p>
                    <p className="text-xs text-green-600">✅ Complete</p>
                  </div>
                  <div className="p-2 bg-green-500 rounded-lg shadow-lg">
                    <CheckCircle className="text-white" size={16} />
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
            <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-orange-700 uppercase tracking-wide">Returned</p>
                    <p className="text-2xl font-bold text-orange-900 mt-1">{stats.returned}</p>
                    <p className="text-xs text-orange-600">↩️ Back</p>
                  </div>
                  <div className="p-2 bg-orange-500 rounded-lg shadow-lg">
                    <AlertTriangle className="text-white" size={16} />
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
            <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide">COD</p>
                    <p className="text-2xl font-bold text-emerald-900 mt-1">{stats.cod}</p>
                    <p className="text-xs text-emerald-600">💰 Cash</p>
                  </div>
                  <div className="p-2 bg-emerald-500 rounded-lg shadow-lg">
                    <MapPin className="text-white" size={16} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Couriers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Courier List</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={transformedCouriers}
              columns={columns}
              filters={filters}
              bulkActions={bulkActions}
              selectable
              exportable
              onRowClick={(courier) => handleView(courier)}
              onView={handleView}
              onEdit={handleUpdate}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>

        {/* View Courier Modal */}
        <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Eye size={20} />
                <span>Courier Details - {courierToView?.courierId}</span>
              </DialogTitle>
            </DialogHeader>
            {courierToView && (
              <div className="space-y-6">
                {/* Order Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <Package size={16} />
                      <span>Order Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-600">Order Number</Label>
                      <p className="font-medium">{courierToView.order.orderNumber}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Order Total</Label>
                      <p className="font-medium">{formatCurrency(courierToView.order.total)}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Sender & Receiver Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center space-x-2">
                        <User size={16} />
                        <span>Sender Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-gray-600">Name</Label>
                        <p className="font-medium">{courierToView.sender.name}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Phone</Label>
                        <p className="font-medium flex items-center space-x-2">
                          <Phone size={14} />
                          <span>{courierToView.sender.phone}</span>
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Address</Label>
                        <p className="font-medium">{courierToView.sender.address}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Location</Label>
                        <p className="font-medium">{courierToView.sender.division}, {courierToView.sender.district}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center space-x-2">
                        <User size={16} />
                        <span>Receiver Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-gray-600">Name</Label>
                        <p className="font-medium">{courierToView.receiver.name}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Phone</Label>
                        <p className="font-medium flex items-center space-x-2">
                          <Phone size={14} />
                          <span>{courierToView.receiver.phone}</span>
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Address</Label>
                        <p className="font-medium">{courierToView.receiver.address}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Location</Label>
                        <p className="font-medium">{courierToView.receiver.division}, {courierToView.receiver.district}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Parcel Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <Package size={16} />
                      <span>Parcel Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <Label className="text-gray-600">Type</Label>
                        <Badge variant="outline" className="capitalize">
                          {courierToView.parcel.type}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-gray-600">Quantity</Label>
                        <p className="font-medium">{courierToView.parcel.quantity} items</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Weight</Label>
                        <p className="font-medium flex items-center space-x-1">
                          <Weight size={14} />
                          <span>{courierToView.parcel.weight} kg</span>
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Value</Label>
                        <p className="font-medium">{formatCurrency(courierToView.parcel.value)}</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <Label className="text-gray-600">Description</Label>
                      <p className="font-medium">{courierToView.parcel.description}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      {courierToView.isCOD && (
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <CreditCard size={14} />
                          <span>COD: {formatCurrency(courierToView.codAmount || 0)}</span>
                        </Badge>
                      )}
                      {courierToView.isFragile && (
                        <Badge variant="destructive">Fragile</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Charges & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center space-x-2">
                        <CreditCard size={16} />
                        <span>Charges</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Charge:</span>
                        <span className="font-medium">{formatCurrency(courierToView.charges.deliveryCharge)}</span>
                      </div>
                      {courierToView.isCOD && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">COD Charge:</span>
                          <span className="font-medium">{formatCurrency(courierToView.charges.codCharge)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold text-lg border-t pt-3">
                        <span>Total Charge:</span>
                        <span>{formatCurrency(courierToView.charges.totalCharge)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center space-x-2">
                        <Truck size={16} />
                        <span>Delivery Details</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-gray-600">Status</Label>
                        <Badge className={`${getStatusColor(courierToView.status)} flex items-center space-x-1 border w-fit mt-1`}>
                          {getStatusIcon(courierToView.status)}
                          <span className="capitalize">{courierToView.status.replace('_', ' ')}</span>
                        </Badge>
                      </div>
                      {courierToView.courierPartner && (
                        <div>
                          <Label className="text-gray-600">Courier Partner</Label>
                          <p className="font-medium">{courierToView.courierPartner}</p>
                        </div>
                      )}
                      {courierToView.trackingNumber && (
                        <div>
                          <Label className="text-gray-600">Tracking Number</Label>
                          <p className="font-mono font-medium">{courierToView.trackingNumber}</p>
                        </div>
                      )}
                      <div>
                        <Label className="text-gray-600">Created At</Label>
                        <p className="font-medium flex items-center space-x-2">
                          <Calendar size={14} />
                          <span>{new Date(courierToView.createdAt).toLocaleDateString()}</span>
                        </p>
                      </div>
                      {courierToView.notes && (
                        <div>
                          <Label className="text-gray-600">Notes</Label>
                          <p className="font-medium">{courierToView.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Update Courier Modal */}
        <Dialog open={updateModalOpen} onOpenChange={setUpdateModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Edit size={20} />
                <span>Update Courier - {editingCourier?.courierId}</span>
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateSubmit} className="space-y-6">
              {/* Order Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Order Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="orderId">Order ID</Label>
                    <Input
                      id="orderId"
                      value={formData.orderId}
                      onChange={(e) => setFormData(prev => ({ ...prev, orderId: e.target.value }))}
                      placeholder="Select or enter order ID"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Sender & Receiver */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Sender Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="senderName">Name</Label>
                      <Input
                        id="senderName"
                        value={formData.senderName}
                        onChange={(e) => setFormData(prev => ({ ...prev, senderName: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="senderPhone">Phone</Label>
                      <Input
                        id="senderPhone"
                        value={formData.senderPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, senderPhone: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="senderAddress">Address</Label>
                      <Textarea
                        id="senderAddress"
                        value={formData.senderAddress}
                        onChange={(e) => setFormData(prev => ({ ...prev, senderAddress: e.target.value }))}
                        rows={2}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="senderDivision">Division</Label>
                        <Input
                          id="senderDivision"
                          value={formData.senderDivision}
                          onChange={(e) => setFormData(prev => ({ ...prev, senderDivision: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="senderDistrict">District</Label>
                        <Input
                          id="senderDistrict"
                          value={formData.senderDistrict}
                          onChange={(e) => setFormData(prev => ({ ...prev, senderDistrict: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Receiver Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="receiverName">Name</Label>
                      <Input
                        id="receiverName"
                        value={formData.receiverName}
                        onChange={(e) => setFormData(prev => ({ ...prev, receiverName: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="receiverPhone">Phone</Label>
                      <Input
                        id="receiverPhone"
                        value={formData.receiverPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, receiverPhone: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="receiverAddress">Address</Label>
                      <Textarea
                        id="receiverAddress"
                        value={formData.receiverAddress}
                        onChange={(e) => setFormData(prev => ({ ...prev, receiverAddress: e.target.value }))}
                        rows={2}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="receiverDivision">Division</Label>
                        <Input
                          id="receiverDivision"
                          value={formData.receiverDivision}
                          onChange={(e) => setFormData(prev => ({ ...prev, receiverDivision: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="receiverDistrict">District</Label>
                        <Input
                          id="receiverDistrict"
                          value={formData.receiverDistrict}
                          onChange={(e) => setFormData(prev => ({ ...prev, receiverDistrict: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Parcel Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Parcel Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="parcelType">Type</Label>
                      <Select value={formData.parcelType} onValueChange={(value: 'regular' | 'express' | 'fragile') => setFormData(prev => ({ ...prev, parcelType: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="regular">Regular</SelectItem>
                          <SelectItem value="express">Express</SelectItem>
                          <SelectItem value="fragile">Fragile</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        value={formData.weight}
                        onChange={(e) => setFormData(prev => ({ ...prev, weight: Number(e.target.value) }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="value">Value (BDT)</Label>
                      <Input
                        id="value"
                        type="number"
                        value={formData.value}
                        onChange={(e) => setFormData(prev => ({ ...prev, value: Number(e.target.value) }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the parcel contents"
                      rows={2}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isCOD"
                        checked={formData.isCOD}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isCOD: checked }))}
                      />
                      <Label htmlFor="isCOD">Cash on Delivery</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isFragile"
                        checked={formData.isFragile}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFragile: checked }))}
                      />
                      <Label htmlFor="isFragile">Fragile</Label>
                    </div>
                  </div>

                  {formData.isCOD && (
                    <div>
                      <Label htmlFor="codAmount">COD Amount (BDT)</Label>
                      <Input
                        id="codAmount"
                        type="number"
                        value={formData.codAmount}
                        onChange={(e) => setFormData(prev => ({ ...prev, codAmount: Number(e.target.value) }))}
                        required
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Charges & Partner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Charges</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="deliveryCharge">Delivery Charge</Label>
                      <Input
                        id="deliveryCharge"
                        type="number"
                        value={formData.deliveryCharge}
                        onChange={(e) => setFormData(prev => ({ ...prev, deliveryCharge: Number(e.target.value) }))}
                        required
                      />
                    </div>
                    {formData.isCOD && (
                      <div>
                        <Label htmlFor="codCharge">COD Charge</Label>
                        <Input
                          id="codCharge"
                          type="number"
                          value={formData.codCharge}
                          onChange={(e) => setFormData(prev => ({ ...prev, codCharge: Number(e.target.value) }))}
                          required
                        />
                      </div>
                    )}
                    <div className="pt-2 border-t">
                      <div className="flex justify-between font-medium">
                        <span>Total Charge:</span>
                        <span>{formatCurrency(formData.deliveryCharge + formData.codCharge)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Courier Partner & Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="courierPartner">Partner</Label>
                      <Select value={formData.courierPartner} onValueChange={(value) => setFormData(prev => ({ ...prev, courierPartner: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select courier partner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="steadfast">Steadfast</SelectItem>
                          <SelectItem value="pathao">Pathao</SelectItem>
                          <SelectItem value="redx">RedX</SelectItem>
                          <SelectItem value="paperfly">Paperfly</SelectItem>
                          <SelectItem value="sundarban">Sundarban</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(value: 'pending' | 'picked' | 'in_transit' | 'delivered' | 'returned' | 'cancelled') => 
                          setFormData(prev => ({ ...prev, status: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="picked">Picked</SelectItem>
                          <SelectItem value="in_transit">In Transit</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="returned">Returned</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="trackingNumber">Tracking Number</Label>
                      <Input
                        id="trackingNumber"
                        value={formData.trackingNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                        placeholder="Enter tracking number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Additional notes or instructions"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setUpdateModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Update Courier
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationDialog
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          onConfirm={confirmDelete}
          title="Delete Courier"
          description={`Are you sure you want to delete courier ${courierToDelete?.courierId}? This action cannot be undone.`}
          entityName="courier"
        />

        {/* Bulk Delete Confirmation Modal */}
        <DeleteConfirmationDialog
          open={bulkDeleteModalOpen}
          onOpenChange={setBulkDeleteModalOpen}
          onConfirm={confirmBulkDelete}
          title="Delete Multiple Couriers"
          description={`Are you sure you want to delete ${couriersToDelete.length} courier(s)? This action cannot be undone.`}
          entityName="courier"
          entityCount={couriersToDelete.length}
        />
      </div>
    </AdminLayout>
  );
}