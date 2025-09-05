'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import ActionConfirmationDialog from '@/components/ui/action-confirmation-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ColorPicker } from '@/components/ui/color-picker';
import { useDeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useErrorDialog } from '@/components/ui/error-dialog';
import { ImageUploader } from '@/components/ui/image-uploader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapLocationPicker } from '@/components/ui/map-location-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useSuccessDialog } from '@/components/ui/success-dialog';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useDebounce } from '@/hooks/use-debounce';
import PaymentSettings from '@/lib/models/PaymentSettings';
import { useFormik } from 'formik';
import {
    ArrowRight,
    Bell,
    ChevronDown,
    ChevronUp,
    CreditCard,
    Database,
    Edit,
    Eye,
    Facebook,
    Filter,
    Globe,
    Image,
    ImageIcon,
    Instagram,
    Mail,
    MapPin,
    Palette,
    Phone,
    Plus,
    RefreshCw,
    Save,
    Search,
    Shield,
    Sparkles,
    Star,
    Trash2,
    X,
    Youtube
} from 'lucide-react';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';

interface AuthSettings {
  googleAuthEnabled: boolean;
  facebookAuthEnabled: boolean;
  emailAuthEnabled: boolean;
  otpAuthEnabled: boolean;
  passwordMinLength: number;
  requireEmailVerification: boolean;
  allowSelfRegistration: boolean;
}

interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  contactEmail: string;
  contactPhone: string;
  contactPerson: string;
  address: string;
  logo1: string;
  logo2: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
    placeId?: string;
    formattedAddress?: string;
  };
  socialLinks?: {
    facebook?: string;
    youtube?: string;
    instagram?: string;
    tiktok?: string;
  };
  currency: string;
  timezone: string;
  language: string;
}

interface IntegrationSettings {
  cloudinaryEnabled: boolean;
  cloudinaryCloudName: string;
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
  twilioEnabled: boolean;
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioPhoneNumber: string;
  zamanitEnabled: boolean;
  zamanitApiKey: string;
  zamanitSenderId: string;
  zamanitBaseUrl: string;
  emailEnabled: boolean;
  emailProvider: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
}

interface CourierSettings {
  senderInfo: {
    name: string;
    phone: string;
    address: string;
    division: string;
    district: string;
  };
  deliveryCharges: {
    regularWithinDhaka: number;
    regularOutsideDhaka: number;
    expressWithinDhaka: number;
    expressOutsideDhaka: number;
    sameDayWithinDhaka: number;
    fragileHandlingCharge: number;
  };
  codChargeRate: number;
  weightBasedCharging: boolean;
  freeDeliveryThreshold: number;
  defaultCourierPartners: string[];
}

interface PaymentSettings {
  isPaymentGatewayEnabled: boolean;
  sslcommerzStoreId: string;
  sslcommerzStorePassword: string;
  sslcommerzSandbox: boolean;
  codEnabled: boolean;
}

interface CTAButton {
  label: string;
  url: string;
}

interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  discount?: string;
  image: string;
  ctaButtons: CTAButton[];
  // Legacy fields for backward compatibility
  ctaButtonLabel?: string;
  ctaButtonUrl?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M13 3v9.5a3.5 3.5 0 1 1-3.5-3.5" />
    <path d="M13 6c1.2 1.8 3.2 3 5.5 3" />
  </svg>
);

export default function AdminSettings() {
  const { showError, ErrorDialogComponent } = useErrorDialog();
  const { showSuccess, SuccessDialogComponent } = useSuccessDialog();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Courier Settings Validation Schema (simplified delivery charges)
  const courierValidationSchema = Yup.object({
    senderInfo: Yup.object({
      name: Yup.string().required('Sender name is required').min(2, 'Name must be at least 2 characters'),
      phone: Yup.string().required('Sender phone is required').matches(/^(\+88)?01[3-9]\d{8}$/, 'Invalid phone number format'),
      address: Yup.string().required('Sender address is required').min(10, 'Address must be at least 10 characters'),
      division: Yup.string().required('Sender division is required'),
      district: Yup.string().required('Sender district is required'),
    }),
    deliveryCharges: Yup.object({
      regularWithinDhaka: Yup.number().required('Inside Dhaka charge is required').min(1, 'Must be greater than 0'),
      regularOutsideDhaka: Yup.number().required('Outside Dhaka charge is required').min(1, 'Must be greater than 0'),
    }),
    codChargeRate: Yup.number().required('COD charge rate is required').min(0, 'Must be 0 or greater').max(100, 'Must be 100 or less'),
    weightBasedCharging: Yup.boolean(),
    freeDeliveryThreshold: Yup.number().required('Free delivery threshold is required').min(0, 'Must be 0 or greater'),
    defaultCourierPartners: Yup.array().of(Yup.string()).min(1, 'At least one courier partner must be selected'),
  });

  // Banner Validation Schema
  const bannerValidationSchema = Yup.object({
    title: Yup.string().required('Title is required').min(2, 'Title must be at least 2 characters').max(100, 'Title must be less than 100 characters'),
    subtitle: Yup.string().max(200, 'Subtitle must be less than 200 characters'),
    description: Yup.string().max(300, 'Description must be less than 300 characters'),
    discount: Yup.string().max(50, 'Discount text must be less than 50 characters'),
    image: Yup.string().required('Image is required'),
    ctaButtons: Yup.array().of(
      Yup.object({
        label: Yup.string().required('Button label is required').max(30, 'Button label must be less than 30 characters'),
        url: Yup.string().required('Button URL is required').url('Please enter a valid URL'),
      })
    ).min(1, 'At least one CTA button is required').max(3, 'Maximum 3 CTA buttons allowed'),
    isActive: Yup.boolean(),
  });
  
  const [authSettings, setAuthSettings] = useState<AuthSettings>({
    googleAuthEnabled: false,
    facebookAuthEnabled: false,
    emailAuthEnabled: true,
    otpAuthEnabled: true,
    passwordMinLength: 8,
    requireEmailVerification: false,
    allowSelfRegistration: true
  });

  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    siteName: process.env.NEXT_PUBLIC_SITE_NAME || '',
    siteDescription: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || '',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || '',
    contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || '',
    contactPhone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '',
    contactPerson: process.env.NEXT_PUBLIC_CONTACT_PERSON || '',
    address: process.env.NEXT_PUBLIC_CONTACT_ADDRESS || '',
    logo1: '',
    logo2: '',
    favicon: '',
    primaryColor: '#000000',
    secondaryColor: '#666666',
    location: {
      address: '',
      latitude: 23.8103,
      longitude: 90.4125,
      placeId: '',
      formattedAddress: ''
    },
    socialLinks: {
      facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || '',
      youtube: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE || '',
      instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || '',
      tiktok: process.env.NEXT_PUBLIC_SOCIAL_TIKTOK || ''
    },
    currency: 'BDT',
    timezone: 'Asia/Dhaka',
    language: 'en'
  });

  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>({
    cloudinaryEnabled: true,
    cloudinaryCloudName: '',
    cloudinaryApiKey: '',
    cloudinaryApiSecret: '',
    twilioEnabled: false,
    twilioAccountSid: '',
    twilioAuthToken: '',
    twilioPhoneNumber: '',
    zamanitEnabled: true,
    zamanitApiKey: '',
    zamanitSenderId: '',
    zamanitBaseUrl: process.env.NEXT_PUBLIC_SMS_API_BASE_URL || 'http://45.120.38.242/api/sendsms',
    emailEnabled: true,
    emailProvider: 'smtp',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: ''
  });

  // Initialize courier settings with proper default values to prevent undefined issues
  const defaultCourierSettings: CourierSettings = {
    senderInfo: {
      name: '',
      phone: '',
      address: '',
      division: '',
      district: '',
    },
    deliveryCharges: {
      regularWithinDhaka: 60,
      regularOutsideDhaka: 100,
      expressWithinDhaka: 100,
      expressOutsideDhaka: 150,
      sameDayWithinDhaka: 150,
      fragileHandlingCharge: 20,
    },
    codChargeRate: 1,
    weightBasedCharging: true,
    freeDeliveryThreshold: 1000,
    defaultCourierPartners: ['steadfast']
  };

  const [courierSettings, setCourierSettings] = useState<CourierSettings>(defaultCourierSettings);

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    isPaymentGatewayEnabled: false,
    sslcommerzStoreId: '',
    sslcommerzStorePassword: '',
    sslcommerzSandbox: true,
    codEnabled: true
  });

  // Banner states
  const [banners, setBanners] = useState<Banner[]>([]);
  const [selectedBanners, setSelectedBanners] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBanners, setTotalBanners] = useState(0);
  const [sortBy, setSortBy] = useState('order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [previewBanner, setPreviewBanner] = useState<Banner | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);
  
  // Confirmation dialogs
  const { showDeleteConfirmation, DeleteConfirmationComponent } = useDeleteConfirmationDialog();
  const [actionConfirmOpen, setActionConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'activate' | 'deactivate' | null>(null);
  const [pendingRows, setPendingRows] = useState<string[]>([]);
  const [isConfirming, setIsConfirming] = useState(false);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Formik for Courier Settings
  const courierFormik = useFormik({
    initialValues: courierSettings,
    validationSchema: courierValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setSaving(true);
      try {
        const response = await fetch('/api/admin/settings/courier', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        });

        if (response.ok) {
          const updatedSettings = await response.json();
          // Merge with defaults to ensure all properties exist
          setCourierSettings({
            ...defaultCourierSettings,
            ...updatedSettings,
            senderInfo: {
              ...defaultCourierSettings.senderInfo,
              ...updatedSettings.senderInfo
            },
            deliveryCharges: {
              ...defaultCourierSettings.deliveryCharges,
              ...updatedSettings.deliveryCharges
            },
            defaultCourierPartners: updatedSettings.defaultCourierPartners || defaultCourierSettings.defaultCourierPartners
          });
          showSuccess('Courier settings saved successfully!', 'Success');
        } else {
          const errorData = await response.json();
          showError(errorData.error || 'Failed to save courier settings', 'Save Failed');
        }
      } catch (error) {
        console.error('Error saving courier settings:', error);
        showError('Failed to save courier settings', 'Save Failed');
      } finally {
        setSaving(false);
      }
    }
  });

  // Formik for Banner Management
  const bannerFormik = useFormik({
    initialValues: {
      title: editingBanner?.title || '',
      subtitle: editingBanner?.subtitle || '',
      description: editingBanner?.description || 'Discover our carefully curated collection of premium fashion pieces designed for the modern lifestyle',
      discount: editingBanner?.discount || '',
      image: editingBanner?.image || '',
      ctaButtons: (editingBanner?.ctaButtons && editingBanner.ctaButtons.length > 0) 
        ? editingBanner.ctaButtons 
        : editingBanner?.ctaButtonLabel 
          ? [{ label: editingBanner.ctaButtonLabel, url: editingBanner.ctaButtonUrl || '' }]
          : [{ label: 'Order Now', url: '/products' }],
      isActive: editingBanner?.isActive ?? true,
    },
    validationSchema: bannerValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setSaving(true);
      try {
        const url = editingBanner 
          ? `/api/admin/banners/${editingBanner._id}`
          : '/api/admin/banners';
        
        const method = editingBanner ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        });

        if (response.ok) {
          showSuccess(
            editingBanner ? 'Banner updated successfully!' : 'Banner created successfully!',
            'Success'
          );
          setBannerModalOpen(false);
          setEditingBanner(null);
          setImagePreview('');
          bannerFormik.resetForm();
          fetchBanners();
        } else {
          const errorData = await response.json();
          showError(errorData.error || 'Failed to save banner', 'Save Failed');
        }
      } catch (error) {
        console.error('Error saving banner:', error);
        showError('Failed to save banner', 'Save Failed');
      } finally {
        setSaving(false);
      }
    }
  });

  // Helper component for field errors
  const FieldError = ({ name }: { name: string }) => {
    const error = courierFormik.errors[name as keyof typeof courierFormik.errors];
    const touched = courierFormik.touched[name as keyof typeof courierFormik.touched];
    
    if (typeof error === 'object' && error !== null) {
      // Handle nested errors
      const nestedErrors = Object.entries(error).map(([key, value]) => {
        const nestedTouched = touched && typeof touched === 'object' && touched[key as keyof typeof touched];
        return nestedTouched && value ? (
          <p key={key} className="text-sm text-red-600 mt-1">{String(value)}</p>
        ) : null;
      });
      return <>{nestedErrors}</>;
    }
    
    return touched && error ? (
      <p className="text-sm text-red-600 mt-1">{String(error)}</p>
    ) : null;
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Fetch banners when search term, filter, or page changes
  useEffect(() => {
    fetchBanners();
  }, [debouncedSearchTerm, statusFilter, currentPage, sortBy, sortOrder]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // Fetch all settings from different endpoints
      const [authRes, generalRes, integrationRes, courierRes, paymentRes] = await Promise.all([
        fetch('/api/admin/settings/auth'),
        fetch('/api/admin/settings/general'),
        fetch('/api/admin/settings/integrations'),
        fetch('/api/admin/settings/courier'),
        fetch('/api/admin/settings/payment')
      ]);

      if (authRes.ok) {
        const authData = await authRes.json();
        setAuthSettings(authData);
      } else {
        console.error('Failed to fetch auth settings:', authRes.status, await authRes.text());
      }

      if (generalRes.ok) {
        const generalData = await generalRes.json();
        setGeneralSettings(prev => ({
          ...prev,
          ...generalData,
          socialLinks: {
            ...(prev.socialLinks || {}),
            ...((generalData as any).socialLinks || {})
          }
        }));
      }

      if (integrationRes.ok) {
        const integrationData = await integrationRes.json();
        setIntegrationSettings(integrationData);
      }

      if (courierRes.ok) {
        const courierData = await courierRes.json();
        // Merge with defaults to ensure all properties exist
        setCourierSettings({
          ...defaultCourierSettings,
          ...courierData,
          senderInfo: {
            ...defaultCourierSettings.senderInfo,
            ...courierData.senderInfo
          },
          deliveryCharges: {
            ...defaultCourierSettings.deliveryCharges,
            ...courierData.deliveryCharges
          },
          defaultCourierPartners: courierData.defaultCourierPartners || defaultCourierSettings.defaultCourierPartners
        });
      }

      if (paymentRes.ok) {
        const paymentData = await paymentRes.json();
        setPaymentSettings(paymentData);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (type: string, data: any) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/settings/${type}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        showSuccess(`${type} settings saved successfully!`, 'Success');
      } else {
        const errorData = await response.json();
        showError(errorData.error || `Failed to save ${type} settings`, 'Save Failed');
        console.error(`Error saving ${type} settings:`, errorData.error);
      }
    } catch (error) {
      console.error(`Error saving ${type} settings:`, error);
      showError(`Failed to save ${type} settings`, 'Save Failed');
    } finally {
      setSaving(false);
    }
  };

  const testIntegration = async (type: string) => {
    try {
      if (type === 'sms') {
        const phoneNumber = prompt('Enter a phone number to test SMS (e.g., +8801234567890):');
        if (!phoneNumber) return;
        
        const response = await fetch('/api/admin/settings/test/sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber })
        });
        
        const result = await response.json();
        if (result.success) {
          showSuccess(`SMS test successful! Message ID: ${result.messageId}`, 'Success');
        } else {
          showError(`SMS test failed: ${result.error}`, 'SMS Test Failed');
        }
        return;
      }
      
      const response = await fetch(`/api/admin/settings/test/${type}`, {
        method: 'POST'
      });

      const result = await response.json();
      if (result.success) {
        showSuccess(`${type} test successful!`, 'Success');
      } else {
        showError(`${type} test failed: ${result.error}`, `${type} Test Failed`);
      }
    } catch (error) {
      showError(`${type} test failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'Test Failed');
    }
  };

  // Banner Management Functions
  const fetchBanners = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        sortBy,
        sortOrder,
      });

      if (debouncedSearchTerm) {
        params.append('search', debouncedSearchTerm);
      }

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/admin/banners?${params}`);
      if (response.ok) {
        const data = await response.json();
        setBanners(data.banners);
        setTotalPages(data.pagination.pages);
        setTotalBanners(data.pagination.total);
      } else {
        console.error('Failed to fetch banners');
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Please select a valid image file', 'Invalid File');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('Image size must be less than 5MB', 'File Too Large');
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        bannerFormik.setFieldValue('image', data.url);
        setImagePreview(data.url);
      } else {
        showError('Failed to upload image', 'Upload Failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      showError('Failed to upload image', 'Upload Failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteBanner = (bannerId: string) => {
    const banner = banners.find(b => b._id === bannerId);
    if (!banner) return;

    showDeleteConfirmation({
      title: 'Delete Banner',
      description: `Are you sure you want to delete "${banner.title}"? This action cannot be undone and the banner will be permanently removed from your carousel.`,
      entityName: 'banner',
      entityCount: 1,
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/admin/banners/${bannerId}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            showSuccess('Banner deleted successfully!', 'Success');
            fetchBanners();
          } else {
            const errorData = await response.json();
            showError(errorData.error || 'Failed to delete banner', 'Delete Failed');
          }
        } catch (error) {
          console.error('Error deleting banner:', error);
          showError('Failed to delete banner', 'Delete Failed');
        }
      }
    });
  };

  const handleBulkAction = (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedBanners.length === 0) {
      showError('Please select at least one banner', 'No Selection');
      return;
    }

    if (action === 'delete') {
      showDeleteConfirmation({
        title: `Delete ${selectedBanners.length} Banner${selectedBanners.length > 1 ? 's' : ''}`,
        description: `Are you sure you want to delete ${selectedBanners.length} banner${selectedBanners.length > 1 ? 's' : ''}? This action cannot be undone and the banner${selectedBanners.length > 1 ? 's' : ''} will be permanently removed from your carousel.`,
        entityName: 'banner',
        entityCount: selectedBanners.length,
        onConfirm: async () => {
          await performBulkAction(action);
        }
      });
    } else {
      setPendingAction(action);
      setPendingRows(selectedBanners);
      setActionConfirmOpen(true);
    }
  };

  const performBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    try {
      const response = await fetch('/api/admin/banners/bulk-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          bannerIds: selectedBanners
        })
      });

      if (response.ok) {
        const data = await response.json();
        showSuccess(data.message, 'Success');
        setSelectedBanners([]);
        fetchBanners();
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to perform bulk action', 'Action Failed');
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      showError('Failed to perform bulk action', 'Action Failed');
    }
  };

  const onConfirmAction = async () => {
    if (!pendingAction) return;
    
    setIsConfirming(true);
    try {
      await performBulkAction(pendingAction);
      setActionConfirmOpen(false);
      setPendingAction(null);
      setPendingRows([]);
    } catch (error) {
      console.error('Bulk action error:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleSelectAllBanners = (checked: boolean) => {
    if (checked) {
      setSelectedBanners(banners.map(banner => banner._id));
    } else {
      setSelectedBanners([]);
    }
  };

  const handleSelectBanner = (bannerId: string, checked: boolean) => {
    if (checked) {
      setSelectedBanners(prev => [...prev, bannerId]);
    } else {
      setSelectedBanners(prev => prev.filter(id => id !== bannerId));
    }
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setImagePreview(banner.image);
    setBannerModalOpen(true);
  };

  const handleCreateNewBanner = () => {
    setEditingBanner(null);
    setImagePreview('');
    bannerFormik.resetForm();
    setBannerModalOpen(true);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setCurrentPage(1);
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
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">
              Configure your application settings and integrations
            </p>
          </div>
          <Button onClick={fetchSettings} variant="outline">
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="auth">Authentication</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="courier">Courier</TabsTrigger>
            <TabsTrigger value="banners">Carousel Banners</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <div className="space-y-6">
              {/* Basic Site Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe size={20} />
                    <span>Basic Site Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="siteName">Site Name</Label>
                      <Input
                        id="siteName"
                        value={generalSettings.siteName}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="siteUrl">Site URL</Label>
                      <Input
                        id="siteUrl"
                        value={generalSettings.siteUrl}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteUrl: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Textarea
                      id="siteDescription"
                      value={generalSettings.siteDescription}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={generalSettings.currency} onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, currency: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BDT">BDT - Bangladeshi Taka</SelectItem>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select value={generalSettings.timezone} onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, timezone: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Dhaka">Asia/Dhaka</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">America/New_York</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="language">Language</Label>
                      <Select value={generalSettings.language} onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, language: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="bn">Bengali</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Phone size={20} />
                    <span>Contact Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={generalSettings.contactEmail}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input
                        id="contactPhone"
                        value={generalSettings.contactPhone}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, contactPhone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPerson">Contact Person</Label>
                      <Input
                        id="contactPerson"
                        value={generalSettings.contactPerson}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, contactPerson: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={generalSettings.address}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, address: e.target.value }))}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Logo & Branding */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ImageIcon size={20} />
                    <span>Logo & Branding</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ImageUploader
                      value={generalSettings.logo1}
                      onChange={(url) => setGeneralSettings(prev => ({ ...prev, logo1: url }))}
                      label="Primary Logo"
                      description="Main logo for your website"
                      dimensions="200x80px"
                    />
                    <ImageUploader
                      value={generalSettings.logo2}
                      onChange={(url) => setGeneralSettings(prev => ({ ...prev, logo2: url }))}
                      label="Secondary Logo"
                      description="Alternative logo (e.g., light version)"
                      dimensions="200x80px"
                    />
                    <ImageUploader
                      value={generalSettings.favicon}
                      onChange={(url) => setGeneralSettings(prev => ({ ...prev, favicon: url }))}
                      label="Favicon"
                      description="Website icon shown in browser tabs"
                      dimensions="32x32px"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Social Media Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe size={20} />
                    <span>Social Media Links</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="facebookUrl">Facebook</Label>
                      <div className="mt-2 flex items-center space-x-2">
                        <div className="p-2 rounded-md bg-gray-100 text-gray-700"><Facebook size={16} /></div>
                        <Input
                          id="facebookUrl"
                          placeholder="https://facebook.com/yourpage"
                          value={generalSettings.socialLinks?.facebook || ''}
                          onChange={(e) => setGeneralSettings(prev => ({
                            ...prev,
                            socialLinks: { ...(prev.socialLinks || {}), facebook: e.target.value }
                          }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="instagramUrl">Instagram</Label>
                      <div className="mt-2 flex items-center space-x-2">
                        <div className="p-2 rounded-md bg-gray-100 text-gray-700"><Instagram size={16} /></div>
                        <Input
                          id="instagramUrl"
                          placeholder="https://instagram.com/yourhandle"
                          value={generalSettings.socialLinks?.instagram || ''}
                          onChange={(e) => setGeneralSettings(prev => ({
                            ...prev,
                            socialLinks: { ...(prev.socialLinks || {}), instagram: e.target.value }
                          }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="youtubeUrl">YouTube</Label>
                      <div className="mt-2 flex items-center space-x-2">
                        <div className="p-2 rounded-md bg-gray-100 text-gray-700"><Youtube size={16} /></div>
                        <Input
                          id="youtubeUrl"
                          placeholder="https://youtube.com/@yourchannel"
                          value={generalSettings.socialLinks?.youtube || ''}
                          onChange={(e) => setGeneralSettings(prev => ({
                            ...prev,
                            socialLinks: { ...(prev.socialLinks || {}), youtube: e.target.value }
                          }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="tiktokUrl">TikTok</Label>
                      <div className="mt-2 flex items-center space-x-2">
                        <div className="p-2 rounded-md bg-gray-100 text-gray-700"><TikTokIcon /></div>
                        <Input
                          id="tiktokUrl"
                          placeholder="https://www.tiktok.com/@yourhandle"
                          value={generalSettings.socialLinks?.tiktok || ''}
                          onChange={(e) => setGeneralSettings(prev => ({
                            ...prev,
                            socialLinks: { ...(prev.socialLinks || {}), tiktok: e.target.value }
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Leave a field empty to hide that social icon on the site.</p>
                </CardContent>
              </Card>

              {/* Theme Colors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Palette size={20} />
                    <span>Theme Colors</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ColorPicker
                      color={generalSettings.primaryColor}
                      onChange={(color) => setGeneralSettings(prev => ({ ...prev, primaryColor: color }))}
                      label="Primary Color"
                    />
                    <ColorPicker
                      color={generalSettings.secondaryColor}
                      onChange={(color) => setGeneralSettings(prev => ({ ...prev, secondaryColor: color }))}
                      label="Secondary Color"
                    />
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-gray-800 mb-2">Color Preview:</h5>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-8 h-8 rounded border"
                          style={{ backgroundColor: generalSettings.primaryColor }}
                        />
                        <span className="text-sm">Primary</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-8 h-8 rounded border"
                          style={{ backgroundColor: generalSettings.secondaryColor }}
                        />
                        <span className="text-sm">Secondary</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location & Map */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin size={20} />
                    <span>Business Location</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MapLocationPicker
                    value={generalSettings.location}
                    onChange={(location) => setGeneralSettings(prev => ({ ...prev, location }))}
                    label="Business Location"
                  />
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={() => saveSettings('general', generalSettings)} disabled={saving}>
                  <Save size={16} className="mr-2" />
                  {saving ? 'Saving...' : 'Save General Settings'}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Authentication Settings */}
          <TabsContent value="auth">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield size={20} />
                  <span>Authentication Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="googleAuth">Google Authentication</Label>
                      <p className="text-sm text-gray-600">Allow users to sign in with Google</p>
                    </div>
                    <Switch
                      id="googleAuth"
                      checked={authSettings.googleAuthEnabled}
                      onCheckedChange={(checked) => setAuthSettings(prev => ({ ...prev, googleAuthEnabled: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="facebookAuth">Facebook Authentication</Label>
                      <p className="text-sm text-gray-600">Allow users to sign in with Facebook</p>
                    </div>
                    <Switch
                      id="facebookAuth"
                      checked={authSettings.facebookAuthEnabled}
                      onCheckedChange={(checked) => setAuthSettings(prev => ({ ...prev, facebookAuthEnabled: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailAuth">Email Authentication</Label>
                      <p className="text-sm text-gray-600">Allow users to sign in with email and password</p>
                    </div>
                    <Switch
                      id="emailAuth"
                      checked={authSettings.emailAuthEnabled}
                      onCheckedChange={(checked) => setAuthSettings(prev => ({ ...prev, emailAuthEnabled: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="otpAuth">Phone Verification</Label>
                      <p className="text-sm text-gray-600">Enable phone number verification with OTP</p>
                    </div>
                    <Switch
                      id="otpAuth"
                      checked={authSettings.otpAuthEnabled}
                      onCheckedChange={(checked) => setAuthSettings(prev => ({ ...prev, otpAuthEnabled: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailVerification">Email Verification</Label>
                      <p className="text-sm text-gray-600">Enable email verification with OTP</p>
                    </div>
                    <Switch
                      id="emailVerification"
                      checked={authSettings.requireEmailVerification}
                      onCheckedChange={(checked) => setAuthSettings(prev => ({ ...prev, requireEmailVerification: checked }))}
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      value={authSettings.passwordMinLength}
                      onChange={(e) => setAuthSettings(prev => ({ ...prev, passwordMinLength: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-4">

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="allowSelfRegistration"
                        checked={authSettings.allowSelfRegistration}
                        onCheckedChange={(checked) => setAuthSettings(prev => ({ ...prev, allowSelfRegistration: checked }))}
                      />
                      <Label htmlFor="allowSelfRegistration">Allow Self Registration</Label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => saveSettings('auth', authSettings)} disabled={saving}>
                    <Save size={16} className="mr-2" />
                    {saving ? 'Saving...' : 'Save Auth Settings'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Settings */}
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard size={20} />
                  <span>Payment Gateway Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="paymentGatewayEnabled">Enable Payment Gateway</Label>
                      <p className="text-sm text-gray-600">Allow customers to pay online via SSLCommerz</p>
                    </div>
                    <Switch
                      id="paymentGatewayEnabled"
                      checked={paymentSettings.isPaymentGatewayEnabled}
                      onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, isPaymentGatewayEnabled: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="codEnabled">Cash on Delivery</Label>
                      <p className="text-sm text-gray-600">Allow customers to pay on delivery</p>
                    </div>
                    <Switch
                      id="codEnabled"
                      checked={paymentSettings.codEnabled}
                      onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, codEnabled: checked }))}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">SSLCommerz Configuration</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sslcommerzStoreId">Store ID</Label>
                      <Input
                        id="sslcommerzStoreId"
                        value={paymentSettings.sslcommerzStoreId}
                        onChange={(e) => setPaymentSettings(prev => ({ ...prev, sslcommerzStoreId: e.target.value }))}
                        placeholder="Your SSLCommerz Store ID"
                        disabled={!paymentSettings.isPaymentGatewayEnabled}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sslcommerzStorePassword">Store Password</Label>
                      <Input
                        id="sslcommerzStorePassword"
                        type="password"
                        value={paymentSettings.sslcommerzStorePassword}
                        onChange={(e) => setPaymentSettings(prev => ({ ...prev, sslcommerzStorePassword: e.target.value }))}
                        placeholder="Your SSLCommerz Store Password"
                        disabled={!paymentSettings.isPaymentGatewayEnabled}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sslcommerzSandbox"
                      checked={paymentSettings.sslcommerzSandbox}
                      onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, sslcommerzSandbox: checked }))}
                      disabled={!paymentSettings.isPaymentGatewayEnabled}
                    />
                    <Label htmlFor="sslcommerzSandbox">Sandbox Mode (for testing)</Label>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h5 className="font-medium text-yellow-800 mb-2">Important Notes:</h5>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Use sandbox mode for testing with test credentials</li>
                      <li>• Switch to live mode only after thorough testing</li>
                      <li>• Ensure your domain is whitelisted in SSLCommerz dashboard</li>
                      <li>• Test all payment methods before going live</li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => testIntegration('sslcommerz')}
                    disabled={!paymentSettings.isPaymentGatewayEnabled}
                  >
                    Test Connection
                  </Button>
                  <Button onClick={() => saveSettings('payment', paymentSettings)} disabled={saving}>
                    <Save size={16} className="mr-2" />
                    {saving ? 'Saving...' : 'Save Payment Settings'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integration Settings */}
          <TabsContent value="integrations">
            <div className="space-y-6">
              {/* Cloudinary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Image size={20} />
                      <span>Cloudinary (Image Storage)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={integrationSettings.cloudinaryEnabled}
                        onCheckedChange={(checked) => setIntegrationSettings(prev => ({ ...prev, cloudinaryEnabled: checked }))}
                      />
                      <Button variant="outline" size="sm" onClick={() => testIntegration('cloudinary')}>
                        Test
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="cloudinaryCloudName">Cloud Name</Label>
                      <Input
                        id="cloudinaryCloudName"
                        value={integrationSettings.cloudinaryCloudName}
                        onChange={(e) => setIntegrationSettings(prev => ({ ...prev, cloudinaryCloudName: e.target.value }))}
                        disabled={!integrationSettings.cloudinaryEnabled}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cloudinaryApiKey">API Key</Label>
                      <Input
                        id="cloudinaryApiKey"
                        value={integrationSettings.cloudinaryApiKey}
                        onChange={(e) => setIntegrationSettings(prev => ({ ...prev, cloudinaryApiKey: e.target.value }))}
                        disabled={!integrationSettings.cloudinaryEnabled}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cloudinaryApiSecret">API Secret</Label>
                      <Input
                        id="cloudinaryApiSecret"
                        type="password"
                        value={integrationSettings.cloudinaryApiSecret}
                        onChange={(e) => setIntegrationSettings(prev => ({ ...prev, cloudinaryApiSecret: e.target.value }))}
                        disabled={!integrationSettings.cloudinaryEnabled}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Twilio */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Phone size={20} />
                      <span>Twilio (SMS)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={integrationSettings.twilioEnabled}
                        onCheckedChange={(checked) => setIntegrationSettings(prev => ({ ...prev, twilioEnabled: checked }))}
                      />
                      <Button variant="outline" size="sm" onClick={() => testIntegration('twilio')}>
                        Test
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="twilioAccountSid">Account SID</Label>
                      <Input
                        id="twilioAccountSid"
                        value={integrationSettings.twilioAccountSid}
                        onChange={(e) => setIntegrationSettings(prev => ({ ...prev, twilioAccountSid: e.target.value }))}
                        disabled={!integrationSettings.twilioEnabled}
                      />
                    </div>
                    <div>
                      <Label htmlFor="twilioAuthToken">Auth Token</Label>
                      <Input
                        id="twilioAuthToken"
                        type="password"
                        value={integrationSettings.twilioAuthToken}
                        onChange={(e) => setIntegrationSettings(prev => ({ ...prev, twilioAuthToken: e.target.value }))}
                        disabled={!integrationSettings.twilioEnabled}
                      />
                    </div>
                    <div>
                      <Label htmlFor="twilioPhoneNumber">Phone Number</Label>
                      <Input
                        id="twilioPhoneNumber"
                        value={integrationSettings.twilioPhoneNumber}
                        onChange={(e) => setIntegrationSettings(prev => ({ ...prev, twilioPhoneNumber: e.target.value }))}
                        disabled={!integrationSettings.twilioEnabled}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ZamanIT SMS */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Phone size={20} />
                      <span>ZamanIT (Bangladesh SMS)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={integrationSettings.zamanitEnabled}
                        onCheckedChange={(checked) => setIntegrationSettings(prev => ({ ...prev, zamanitEnabled: checked }))}
                      />
                      <Button variant="outline" size="sm" onClick={() => testIntegration('zamanit')}>
                        Test
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="zamanitApiKey">API Key</Label>
                      <Input
                        id="zamanitApiKey"
                        type="password"
                        value={integrationSettings.zamanitApiKey}
                        onChange={(e) => setIntegrationSettings(prev => ({ ...prev, zamanitApiKey: e.target.value }))}
                        disabled={!integrationSettings.zamanitEnabled}
                        placeholder="Your ZamanIT API Key"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zamanitSenderId">Sender ID</Label>
                      <Input
                        id="zamanitSenderId"
                        value={integrationSettings.zamanitSenderId}
                        onChange={(e) => setIntegrationSettings(prev => ({ ...prev, zamanitSenderId: e.target.value }))}
                        disabled={!integrationSettings.zamanitEnabled}
                        placeholder="e.g., 8809604903051"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zamanitBaseUrl">Base URL</Label>
                      <Input
                        id="zamanitBaseUrl"
                        value={integrationSettings.zamanitBaseUrl}
                        onChange={(e) => setIntegrationSettings(prev => ({ ...prev, zamanitBaseUrl: e.target.value }))}
                        disabled={!integrationSettings.zamanitEnabled}
                        placeholder="http://45.120.38.242/api/sendsms"
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-medium text-blue-800 mb-2">ZamanIT SMS Configuration:</h5>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Optimized for Bangladesh mobile networks</li>
                      <li>• Supports bulk SMS with rate limiting</li>
                      <li>• Cost-effective solution for local businesses</li>
                      <li>• Automatic phone number normalization for BD numbers</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Email */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail size={20} />
                      <span>Email (SMTP)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={integrationSettings.emailEnabled}
                        onCheckedChange={(checked) => setIntegrationSettings(prev => ({ ...prev, emailEnabled: checked }))}
                      />
                      <Button variant="outline" size="sm" onClick={() => testIntegration('email')}>
                        Test
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input
                        id="smtpHost"
                        value={integrationSettings.smtpHost}
                        onChange={(e) => setIntegrationSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                        disabled={!integrationSettings.emailEnabled}
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input
                        id="smtpPort"
                        type="number"
                        value={integrationSettings.smtpPort}
                        onChange={(e) => setIntegrationSettings(prev => ({ ...prev, smtpPort: Number(e.target.value) }))}
                        disabled={!integrationSettings.emailEnabled}
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtpUser">SMTP Username</Label>
                      <Input
                        id="smtpUser"
                        value={integrationSettings.smtpUser}
                        onChange={(e) => setIntegrationSettings(prev => ({ ...prev, smtpUser: e.target.value }))}
                        disabled={!integrationSettings.emailEnabled}
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtpPassword">SMTP Password</Label>
                      <Input
                        id="smtpPassword"
                        type="password"
                        value={integrationSettings.smtpPassword}
                        onChange={(e) => setIntegrationSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                        disabled={!integrationSettings.emailEnabled}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={() => saveSettings('integrations', integrationSettings)} disabled={saving}>
                  <Save size={16} className="mr-2" />
                  {saving ? 'Saving...' : 'Save Integration Settings'}
                </Button>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => testIntegration('sms')}
                  disabled={!integrationSettings.twilioEnabled && !integrationSettings.zamanitEnabled}
                >
                  Test SMS
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Courier Settings */}
          <TabsContent value="courier">
            <form onSubmit={courierFormik.handleSubmit} className="space-y-6">
              {/* Sender Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database size={20} />
                    <span>Sender Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="senderName">Sender Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="senderName"
                        name="senderInfo.name"
                        value={courierFormik.values.senderInfo.name}
                        onChange={courierFormik.handleChange}
                        onBlur={courierFormik.handleBlur}
                        placeholder="Enter sender name"
                        className={courierFormik.touched.senderInfo?.name && courierFormik.errors.senderInfo?.name ? 'border-red-500' : ''}
                      />
                      {courierFormik.touched.senderInfo?.name && courierFormik.errors.senderInfo?.name && (
                        <p className="text-sm text-red-600 mt-1">{courierFormik.errors.senderInfo.name}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="senderPhone">Sender Phone <span className="text-red-500">*</span></Label>
                      <Input
                        id="senderPhone"
                        name="senderInfo.phone"
                        value={courierFormik.values.senderInfo.phone}
                        onChange={courierFormik.handleChange}
                        onBlur={courierFormik.handleBlur}
                        placeholder="Enter sender phone number"
                        className={courierFormik.touched.senderInfo?.phone && courierFormik.errors.senderInfo?.phone ? 'border-red-500' : ''}
                      />
                      {courierFormik.touched.senderInfo?.phone && courierFormik.errors.senderInfo?.phone && (
                        <p className="text-sm text-red-600 mt-1">{courierFormik.errors.senderInfo.phone}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="senderAddress">Sender Address <span className="text-red-500">*</span></Label>
                      <Textarea
                        id="senderAddress"
                        name="senderInfo.address"
                        value={courierFormik.values.senderInfo.address}
                        onChange={courierFormik.handleChange}
                        onBlur={courierFormik.handleBlur}
                        placeholder="Enter sender full address"
                        rows={2}
                        className={courierFormik.touched.senderInfo?.address && courierFormik.errors.senderInfo?.address ? 'border-red-500' : ''}
                      />
                      {courierFormik.touched.senderInfo?.address && courierFormik.errors.senderInfo?.address && (
                        <p className="text-sm text-red-600 mt-1">{courierFormik.errors.senderInfo.address}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="senderDivision">Sender Division <span className="text-red-500">*</span></Label>
                      <Input
                        id="senderDivision"
                        name="senderInfo.division"
                        value={courierFormik.values.senderInfo.division}
                        onChange={courierFormik.handleChange}
                        onBlur={courierFormik.handleBlur}
                        placeholder="Enter sender division"
                        className={courierFormik.touched.senderInfo?.division && courierFormik.errors.senderInfo?.division ? 'border-red-500' : ''}
                      />
                      {courierFormik.touched.senderInfo?.division && courierFormik.errors.senderInfo?.division && (
                        <p className="text-sm text-red-600 mt-1">{courierFormik.errors.senderInfo.division}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="senderDistrict">Sender District <span className="text-red-500">*</span></Label>
                      <Input
                        id="senderDistrict"
                        name="senderInfo.district"
                        value={courierFormik.values.senderInfo.district}
                        onChange={courierFormik.handleChange}
                        onBlur={courierFormik.handleBlur}
                        placeholder="Enter sender district"
                        className={courierFormik.touched.senderInfo?.district && courierFormik.errors.senderInfo?.district ? 'border-red-500' : ''}
                      />
                      {courierFormik.touched.senderInfo?.district && courierFormik.errors.senderInfo?.district && (
                        <p className="text-sm text-red-600 mt-1">{courierFormik.errors.senderInfo.district}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Charges (Simplified) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard size={20} />
                    <span>Delivery Charges</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="regularWithinDhaka">Inside Dhaka (BDT) <span className="text-red-500">*</span></Label>
                      <Input
                        id="regularWithinDhaka"
                        name="deliveryCharges.regularWithinDhaka"
                        type="number"
                        value={courierFormik.values.deliveryCharges.regularWithinDhaka}
                        onChange={courierFormik.handleChange}
                        onBlur={courierFormik.handleBlur}
                        className={courierFormik.touched.deliveryCharges?.regularWithinDhaka && courierFormik.errors.deliveryCharges?.regularWithinDhaka ? 'border-red-500' : ''}
                      />
                      {courierFormik.touched.deliveryCharges?.regularWithinDhaka && courierFormik.errors.deliveryCharges?.regularWithinDhaka && (
                        <p className="text-sm text-red-600 mt-1">{courierFormik.errors.deliveryCharges.regularWithinDhaka}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="regularOutsideDhaka">Outside Dhaka (BDT) <span className="text-red-500">*</span></Label>
                      <Input
                        id="regularOutsideDhaka"
                        name="deliveryCharges.regularOutsideDhaka"
                        type="number"
                        value={courierFormik.values.deliveryCharges.regularOutsideDhaka}
                        onChange={courierFormik.handleChange}
                        onBlur={courierFormik.handleBlur}
                        className={courierFormik.touched.deliveryCharges?.regularOutsideDhaka && courierFormik.errors.deliveryCharges?.regularOutsideDhaka ? 'border-red-500' : ''}
                      />
                      {courierFormik.touched.deliveryCharges?.regularOutsideDhaka && courierFormik.errors.deliveryCharges?.regularOutsideDhaka && (
                        <p className="text-sm text-red-600 mt-1">{courierFormik.errors.deliveryCharges.regularOutsideDhaka}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield size={20} />
                    <span>Additional Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="freeDeliveryThreshold">Free Delivery Threshold (BDT) <span className="text-red-500">*</span></Label>
                      <Input
                        id="freeDeliveryThreshold"
                        name="freeDeliveryThreshold"
                        type="number"
                        value={courierFormik.values.freeDeliveryThreshold}
                        onChange={courierFormik.handleChange}
                        onBlur={courierFormik.handleBlur}
                        className={courierFormik.touched.freeDeliveryThreshold && courierFormik.errors.freeDeliveryThreshold ? 'border-red-500' : ''}
                      />
                      {courierFormik.touched.freeDeliveryThreshold && courierFormik.errors.freeDeliveryThreshold && (
                        <p className="text-sm text-red-600 mt-1">{courierFormik.errors.freeDeliveryThreshold}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="codChargeRate">COD Charge Rate (%) <span className="text-red-500">*</span></Label>
                      <Input
                        id="codChargeRate"
                        name="codChargeRate"
                        type="number"
                        step="0.1"
                        value={courierFormik.values.codChargeRate}
                        onChange={courierFormik.handleChange}
                        onBlur={courierFormik.handleBlur}
                        className={courierFormik.touched.codChargeRate && courierFormik.errors.codChargeRate ? 'border-red-500' : ''}
                      />
                      {courierFormik.touched.codChargeRate && courierFormik.errors.codChargeRate && (
                        <p className="text-sm text-red-600 mt-1">{courierFormik.errors.codChargeRate}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="defaultCourierPartners">Default Courier Partners <span className="text-red-500">*</span></Label>
                    <p className="text-sm text-gray-600 mb-2">Select at least one default courier partner</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['steadfast', 'pathao', 'redx', 'paperfly', 'sundarban'].map((partner) => (
                        <div key={partner} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`courier-${partner}`}
                            checked={courierFormik.values.defaultCourierPartners.includes(partner)}
                            onChange={(e) => {
                              const currentPartners = courierFormik.values.defaultCourierPartners;
                              if (e.target.checked) {
                                courierFormik.setFieldValue('defaultCourierPartners', [...currentPartners, partner]);
                              } else {
                                courierFormik.setFieldValue('defaultCourierPartners', currentPartners.filter(p => p !== partner));
                              }
                            }}
                            onBlur={() => courierFormik.setFieldTouched('defaultCourierPartners', true)}
                            className="rounded border-gray-300"
                          />
                          <Label 
                            htmlFor={`courier-${partner}`} 
                            className="text-sm font-normal capitalize cursor-pointer"
                          >
                            {partner}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {courierFormik.touched.defaultCourierPartners && courierFormik.errors.defaultCourierPartners && (
                      <p className="text-sm text-red-600 mt-1">{courierFormik.errors.defaultCourierPartners}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="weightBasedCharging"
                      checked={courierFormik.values.weightBasedCharging}
                      onCheckedChange={(checked) => courierFormik.setFieldValue('weightBasedCharging', checked)}
                    />
                    <Label htmlFor="weightBasedCharging">Enable Weight-based Charging</Label>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={saving || !courierFormik.isValid}>
                      <Save size={16} className="mr-2" />
                      {saving ? 'Saving...' : 'Save Courier Settings'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </TabsContent>

          {/* Carousel Banners */}
          <TabsContent value="banners">
            <div className="space-y-6">
              {/* Header with Create Button */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Carousel Banners Management</h3>
                  <p className="text-sm text-gray-600">Manage your homepage carousel banners</p>
                </div>
                <Button onClick={handleCreateNewBanner} className="bg-primary hover:bg-primary/90">
                  <Plus size={16} className="mr-2" />
                  Create Banner
                </Button>
              </div>

              {/* Search and Filters */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="flex-1 relative">
                      <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search banners..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'inactive') => setStatusFilter(value)}>
                      <SelectTrigger className="w-48">
                        <Filter size={16} className="mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Banners</SelectItem>
                        <SelectItem value="active">Active Only</SelectItem>
                        <SelectItem value="inactive">Inactive Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Bulk Actions */}
                  {selectedBanners.length > 0 && (
                    <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-blue-700">
                        {selectedBanners.length} banner(s) selected
                      </span>
                      <div className="flex gap-2 ml-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBulkAction('activate')}
                          className="text-green-600 border-green-200 hover:bg-green-50"
                        >
                          Activate
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBulkAction('deactivate')}
                          className="text-orange-600 border-orange-200 hover:bg-orange-50"
                        >
                          Deactivate
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBulkAction('delete')}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 size={14} className="mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Data Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedBanners.length === banners.length && banners.length > 0}
                              onCheckedChange={handleSelectAllBanners}
                            />
                          </TableHead>
                          <TableHead>Image</TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('title')}
                          >
                            <div className="flex items-center">
                              Title
                              {sortBy === 'title' && (
                                sortOrder === 'asc' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead>Subtitle</TableHead>
                          <TableHead>Discount</TableHead>
                          <TableHead>CTA Buttons</TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('isActive')}
                          >
                            <div className="flex items-center">
                              Status
                              {sortBy === 'isActive' && (
                                sortOrder === 'asc' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('order')}
                          >
                            <div className="flex items-center">
                              Order
                              {sortBy === 'order' && (
                                sortOrder === 'asc' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {banners.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-12">
                              <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
                              <p className="text-gray-500 mb-2">No banners found</p>
                              <Button onClick={handleCreateNewBanner} variant="outline">
                                Create your first banner
                              </Button>
                            </TableCell>
                          </TableRow>
                        ) : (
                          banners.map((banner) => (
                            <TableRow key={banner._id} className="hover:bg-gray-50">
                              <TableCell>
                                <Checkbox
                                  checked={selectedBanners.includes(banner._id)}
                                  onCheckedChange={(checked) => handleSelectBanner(banner._id, checked as boolean)}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="relative w-16 h-10 rounded-md overflow-hidden bg-gray-100">
                                  <img
                                    src={banner.image}
                                    alt={banner.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium text-gray-900 truncate max-w-[200px]">
                                  {banner.title}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-gray-600 truncate max-w-[150px]">
                                  {banner.subtitle || '-'}
                                </div>
                              </TableCell>
                              <TableCell>
                                {banner.discount ? (
                                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    ⭐ {banner.discount}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="text-sm space-y-1">
                                  {(() => {
                                    // Support new ctaButtons array format
                                    if (banner.ctaButtons && banner.ctaButtons.length > 0) {
                                      return banner.ctaButtons.slice(0, 2).map((btn, index) => (
                                        <div key={index} className="flex items-center space-x-1">
                                          <span className="font-medium">{btn.label}</span>
                                          <span className="text-xs text-gray-500">→ {btn.url}</span>
                                        </div>
                                      ));
                                    }
                                    // Fallback to legacy format
                                    if (banner.ctaButtonLabel) {
                                      return (
                                        <div className="flex items-center space-x-1">
                                          <span className="font-medium">{banner.ctaButtonLabel}</span>
                                          {banner.ctaButtonUrl && (
                                            <span className="text-xs text-gray-500">→ {banner.ctaButtonUrl}</span>
                                          )}
                                        </div>
                                      );
                                    }
                                    return <span className="text-gray-400">-</span>;
                                  })()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={banner.isActive ? "default" : "secondary"}>
                                  {banner.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm font-medium">{banner.order}</span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setPreviewBanner(banner)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Eye size={14} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditBanner(banner)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit size={14} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteBanner(banner._id)}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-600">
                        Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalBanners)} of {totalBanners} banners
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <span className="text-sm">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell size={20} />
                  <span>Notification Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Order Notifications</Label>
                      <p className="text-sm text-gray-600">Send notifications for new orders</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Low Stock Alerts</Label>
                      <p className="text-sm text-gray-600">Alert when products are running low</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Payment Notifications</Label>
                      <p className="text-sm text-gray-600">Notify about payment status changes</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Customer Registration</Label>
                      <p className="text-sm text-gray-600">Alert when new customers register</p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <Separator />

                <div>
                  <Label>Notification Recipients</Label>
                  <p className="text-sm text-gray-600 mb-2">Email addresses to receive admin notifications (comma-separated)</p>
                  <Textarea
                    placeholder="admin@example.com, manager@example.com"
                    rows={2}
                  />
                </div>

                <div className="flex justify-end">
                  <Button disabled={saving}>
                    <Save size={16} className="mr-2" />
                    {saving ? 'Saving...' : 'Save Notification Settings'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Banner Creation/Edit Modal */}
      <Dialog open={bannerModalOpen} onOpenChange={setBannerModalOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingBanner ? 'Edit Banner' : 'Create New Banner'}
            </DialogTitle>
            <p className="text-gray-600">
              Design beautiful carousel banners that will captivate your customers
            </p>
          </DialogHeader>
          <form onSubmit={bannerFormik.handleSubmit} className="space-y-8">
            
            {/* Image Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ImageIcon size={20} />
                  <span>Banner Image</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="bannerImage"
                      className="flex flex-col items-center justify-center w-full h-72 sm:h-80 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      {imagePreview ? (
                        <div className="relative w-full h-full group">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                            <div className="text-center text-white">
                              <ImageIcon size={32} className="mx-auto mb-2" />
                              <p className="font-medium">Click to change image</p>
                              <p className="text-sm text-gray-300">Recommended: 1920x800px</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <ImageIcon size={64} className="text-gray-400 mb-4" />
                          <p className="mb-2 text-lg text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-sm text-gray-500">PNG, JPG, GIF up to 5MB</p>
                          <p className="text-xs text-gray-400 mt-1">Recommended: 1920x800px</p>
                        </div>
                      )}
                      <input
                        id="bannerImage"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                  {uploadingImage && (
                    <div className="flex items-center justify-center space-x-2 text-blue-600">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Uploading image...</span>
                    </div>
                  )}
                  {bannerFormik.touched.image && bannerFormik.errors.image && (
                    <p className="text-sm text-red-600">{bannerFormik.errors.image}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Content Section */}
            <Card>
              <CardHeader>
                <CardTitle>Banner Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="lg:col-span-2">
                    <Label htmlFor="bannerTitle" className="text-base font-medium">
                      Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="bannerTitle"
                      name="title"
                      value={bannerFormik.values.title}
                      onChange={bannerFormik.handleChange}
                      onBlur={bannerFormik.handleBlur}
                      placeholder="Modern Design"
                      className={`mt-2 text-lg ${bannerFormik.touched.title && bannerFormik.errors.title ? 'border-red-500' : ''}`}
                    />
                    {bannerFormik.touched.title && bannerFormik.errors.title && (
                      <p className="text-sm text-red-600 mt-1">{bannerFormik.errors.title}</p>
                    )}
                  </div>

                  {/* Subtitle */}
                  <div className="lg:col-span-2">
                    <Label htmlFor="bannerSubtitle" className="text-base font-medium">Subtitle</Label>
                    <Input
                      id="bannerSubtitle"
                      name="subtitle"
                      value={bannerFormik.values.subtitle}
                      onChange={bannerFormik.handleChange}
                      onBlur={bannerFormik.handleBlur}
                      placeholder="New Collection 2024"
                      className={`mt-2 ${bannerFormik.touched.subtitle && bannerFormik.errors.subtitle ? 'border-red-500' : ''}`}
                    />
                    {bannerFormik.touched.subtitle && bannerFormik.errors.subtitle && (
                      <p className="text-sm text-red-600 mt-1">{bannerFormik.errors.subtitle}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="lg:col-span-2">
                    <Label htmlFor="bannerDescription" className="text-base font-medium">Description</Label>
                    <Textarea
                      id="bannerDescription"
                      name="description"
                      value={bannerFormik.values.description}
                      onChange={bannerFormik.handleChange}
                      onBlur={bannerFormik.handleBlur}
                      placeholder="Discover our carefully curated collection of premium fashion pieces designed for the modern lifestyle"
                      rows={3}
                      className={`mt-2 ${bannerFormik.touched.description && bannerFormik.errors.description ? 'border-red-500' : ''}`}
                    />
                    {bannerFormik.touched.description && bannerFormik.errors.description && (
                      <p className="text-sm text-red-600 mt-1">{bannerFormik.errors.description}</p>
                    )}
                  </div>

                  {/* Discount */}
                  <div>
                    <Label htmlFor="bannerDiscount" className="text-base font-medium">Discount Badge</Label>
                    <Input
                      id="bannerDiscount"
                      name="discount"
                      value={bannerFormik.values.discount}
                      onChange={bannerFormik.handleChange}
                      onBlur={bannerFormik.handleBlur}
                      placeholder="Limited Edition Stock"
                      className={`mt-2 ${bannerFormik.touched.discount && bannerFormik.errors.discount ? 'border-red-500' : ''}`}
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty to hide discount badge</p>
                    {bannerFormik.touched.discount && bannerFormik.errors.discount && (
                      <p className="text-sm text-red-600 mt-1">{bannerFormik.errors.discount}</p>
                    )}
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="bannerActive"
                      checked={bannerFormik.values.isActive}
                      onCheckedChange={(checked) => bannerFormik.setFieldValue('isActive', checked)}
                    />
                    <div>
                      <Label htmlFor="bannerActive" className="text-base font-medium cursor-pointer">Make banner active</Label>
                      <p className="text-xs text-gray-500">Only active banners will be displayed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA Buttons Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Call-to-Action Buttons</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentButtons = bannerFormik.values.ctaButtons;
                      if (currentButtons.length < 3) {
                        bannerFormik.setFieldValue('ctaButtons', [
                          ...currentButtons,
                          { label: '', url: '' }
                        ]);
                      }
                    }}
                    disabled={bannerFormik.values.ctaButtons.length >= 3}
                    className="flex items-center space-x-1"
                  >
                    <Plus size={16} />
                    <span>Add Button</span>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bannerFormik.values.ctaButtons.map((button, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Label htmlFor={`cta-label-${index}`} className="text-sm font-medium">
                          Button {index + 1} Label <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id={`cta-label-${index}`}
                          value={button.label}
                          onChange={(e) => {
                            const newButtons = [...bannerFormik.values.ctaButtons];
                            newButtons[index] = { ...newButtons[index], label: e.target.value };
                            bannerFormik.setFieldValue('ctaButtons', newButtons);
                          }}
                          placeholder={index === 0 ? 'Order Now' : index === 1 ? 'View Collection' : 'Learn More'}
                          className="mt-1"
                        />
                        {bannerFormik.touched.ctaButtons?.[index]?.label && 
                         bannerFormik.errors.ctaButtons?.[index] && 
                         typeof bannerFormik.errors.ctaButtons[index] === 'object' &&
                         'label' in bannerFormik.errors.ctaButtons[index] && (
                          <p className="text-sm text-red-600 mt-1">{(bannerFormik.errors.ctaButtons[index] as any).label}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor={`cta-url-${index}`} className="text-sm font-medium">
                          Button {index + 1} URL <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex space-x-2 mt-1">
                          <Input
                            id={`cta-url-${index}`}
                            value={button.url}
                            onChange={(e) => {
                              const newButtons = [...bannerFormik.values.ctaButtons];
                              newButtons[index] = { ...newButtons[index], url: e.target.value };
                              bannerFormik.setFieldValue('ctaButtons', newButtons);
                            }}
                            placeholder="/products"
                            className="flex-1"
                          />
                          {bannerFormik.values.ctaButtons.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newButtons = bannerFormik.values.ctaButtons.filter((_, i) => i !== index);
                                bannerFormik.setFieldValue('ctaButtons', newButtons);
                              }}
                              className="px-2"
                            >
                              <X size={16} />
                            </Button>
                          )}
                        </div>
                        {bannerFormik.touched.ctaButtons?.[index]?.url && 
                         bannerFormik.errors.ctaButtons?.[index] && 
                         typeof bannerFormik.errors.ctaButtons[index] === 'object' &&
                         'url' in bannerFormik.errors.ctaButtons[index] && (
                          <p className="text-sm text-red-600 mt-1">{(bannerFormik.errors.ctaButtons[index] as any).url}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {bannerFormik.touched.ctaButtons && typeof bannerFormik.errors.ctaButtons === 'string' && (
                    <p className="text-sm text-red-600">{bannerFormik.errors.ctaButtons}</p>
                  )}
                  
                  <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                    <p className="font-medium mb-1">💡 CTA Button Tips:</p>
                    <ul className="space-y-1">
                      <li>• Use action-oriented text (Order Now, Shop Collection, View More)</li>
                      <li>• Keep labels under 20 characters for better mobile display</li>
                      <li>• First button will be styled as primary, others as secondary</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Preview Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye size={20} />
                    <CardTitle>Live Preview</CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="livePreviewToggle" className="text-sm font-medium cursor-pointer">
                      Show Preview
                    </Label>
                    <Switch
                      id="livePreviewToggle"
                      checked={showLivePreview}
                      onCheckedChange={setShowLivePreview}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  See how your banner will appear on the homepage
                </p>
              </CardHeader>
              {showLivePreview && (bannerFormik.values.title || imagePreview) && (
                <CardContent>
                  {/* Desktop Preview */}
                  <div className="space-y-6">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
                        <span>🖥️ Desktop View</span>
                      </h5>
                      <div className="relative w-full h-64 lg:h-80 bg-gray-900 rounded-lg overflow-hidden">
                        {imagePreview && (
                          <img
                            src={imagePreview}
                            alt="Desktop preview"
                            className="w-full h-full object-cover"
                          />
                        )}
                        
                        {/* Gradient Overlays */}
                        <div className="absolute inset-0">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/20" />
                        </div>

                        {/* Discount Badge */}
                        {bannerFormik.values.discount && (
                          <div className="absolute top-4 right-4 z-10">
                            <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                              ⭐ {bannerFormik.values.discount}
                            </div>
                          </div>
                        )}
                        
                        {/* Content */}
                        <div className="absolute inset-0 flex items-center z-10">
                          <div className="container mx-auto px-6 lg:px-8">
                            <div className="max-w-2xl">
                              <div className="space-y-6">
                                {bannerFormik.values.subtitle && (
                                  <div className="flex items-center space-x-3">
                                    <Sparkles className="text-yellow-400 w-5 h-5" />
                                    <span className="text-white/90 font-light text-sm uppercase tracking-[2px] border-l border-white/30 pl-3">
                                      {bannerFormik.values.subtitle}
                                    </span>
                                  </div>
                                )}
                                
                                {bannerFormik.values.title && (
                                  <h1 className="text-4xl lg:text-5xl xl:text-6xl font-thin text-white leading-tight tracking-tight">
                                    {bannerFormik.values.title}
                                  </h1>
                                )}

                                {bannerFormik.values.description && (
                                  <p className="text-lg text-white/80 font-light leading-relaxed max-w-md">
                                    {bannerFormik.values.description}
                                  </p>
                                )}

                                {bannerFormik.values.ctaButtons.length > 0 && (
                                  <div className="flex items-center space-x-4">
                                    {bannerFormik.values.ctaButtons.slice(0, 2).map((button, index) => (
                                      button.label && (
                                        <Button 
                                          key={index}
                                          size="lg"
                                          className={index === 0 
                                            ? "bg-white text-black hover:bg-white/90 px-8 py-3 text-base font-medium tracking-wide uppercase border-0"
                                            : "bg-transparent text-white border border-white/40 hover:bg-white/10 px-8 py-3 text-base font-medium tracking-wide uppercase"
                                          }
                                        >
                                          {button.label}
                                          {index === 0 && <ArrowRight className="ml-3 w-5 h-5" />}
                                        </Button>
                                      )
                                    ))}
                                  </div>
                                )}

                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                  </div>
                                  <span className="text-white/70 text-sm tracking-wide">Trusted by 50,000+ customers</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Preview */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
                        <span>📱 Mobile View</span>
                      </h5>
                      <div className="max-w-sm mx-auto">
                        <div className="relative w-full h-96 bg-gray-900 rounded-lg overflow-hidden">
                          {imagePreview && (
                            <img
                              src={imagePreview}
                              alt="Mobile preview"
                              className="w-full h-full object-cover"
                            />
                          )}
                          
                          {/* Mobile Gradient Overlays */}
                          <div className="absolute inset-0">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/20" />
                          </div>

                          {/* Mobile Discount Badge */}
                          {bannerFormik.values.discount && (
                            <div className="absolute top-3 right-3 z-10">
                              <div className="bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold uppercase">
                                ⭐ {bannerFormik.values.discount}
                              </div>
                            </div>
                          )}
                          
                          {/* Mobile Content */}
                          <div className="absolute inset-0 flex flex-col justify-end z-10">
                            <div className="px-6 pb-16 pt-8">
                              <div className="text-center space-y-4">
                                {bannerFormik.values.subtitle && (
                                  <div className="flex items-center justify-center space-x-2">
                                    <div className="h-px w-6 bg-gradient-to-r from-transparent to-white/60" />
                                    <span className="text-white/90 font-light text-xs uppercase tracking-[2px]">
                                      {bannerFormik.values.subtitle}
                                    </span>
                                    <div className="h-px w-6 bg-gradient-to-l from-transparent to-white/60" />
                                  </div>
                                )}
                                
                                {bannerFormik.values.title && (
                                  <h1 className="text-3xl font-light text-white leading-tight tracking-wide">
                                    {bannerFormik.values.title}
                                  </h1>
                                )}

                                <div className="flex justify-center">
                                  <div className="h-0.5 w-12 bg-gradient-to-r from-white to-white/40" />
                                </div>

                                {bannerFormik.values.ctaButtons.length > 0 && bannerFormik.values.ctaButtons[0].label && (
                                  <div className="pt-2">
                                    <Button 
                                      className="bg-white text-black hover:bg-white/90 px-6 py-2 text-sm font-medium tracking-wide uppercase border-0"
                                    >
                                      {bannerFormik.values.ctaButtons[0].label}
                                      <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setBannerModalOpen(false);
                  setEditingBanner(null);
                  setImagePreview('');
                  bannerFormik.resetForm();
                }}
                disabled={saving}
              >
                Cancel
              </Button>
                              <Button
                  type="submit"
                  disabled={saving || !bannerFormik.isValid || uploadingImage}
                  className="bg-primary hover:bg-primary/90"
                >
                {saving ? 'Saving...' : editingBanner ? 'Update Banner' : 'Create Banner'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Banner Preview Modal */}
      <Dialog open={!!previewBanner} onOpenChange={() => setPreviewBanner(null)}>
        <DialogContent className="max-w-4xl bg-white">
          <DialogHeader>
            <DialogTitle>Banner Preview</DialogTitle>
          </DialogHeader>
          {previewBanner && (
            <div className="space-y-6">
              {/* Desktop Preview */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-3">🖥️ Desktop View</h5>
                <div className="relative w-full h-80 bg-gray-900 rounded-lg overflow-hidden">
                  <img
                    src={previewBanner.image}
                    alt={previewBanner.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Gradient Overlays */}
                  <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/20" />
                  </div>

                  {/* Discount Badge */}
                  {previewBanner.discount && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                        ⭐ {previewBanner.discount}
                      </div>
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="absolute inset-0 flex items-center z-10">
                    <div className="container mx-auto px-6 lg:px-8">
                      <div className="max-w-2xl">
                        <div className="space-y-6">
                          {previewBanner.subtitle && (
                            <div className="flex items-center space-x-3">
                              <Sparkles className="text-yellow-400 w-5 h-5" />
                              <span className="text-white/90 font-light text-sm uppercase tracking-[2px] border-l border-white/30 pl-3">
                                {previewBanner.subtitle}
                              </span>
                            </div>
                          )}
                          
                          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-thin text-white leading-tight tracking-tight">
                            {previewBanner.title}
                          </h1>

                          {previewBanner.description && (
                            <p className="text-lg text-white/80 font-light leading-relaxed max-w-md">
                              {previewBanner.description}
                            </p>
                          )}

                          <div className="flex items-center space-x-4">
                            {(() => {
                              // Support new ctaButtons array format
                              if (previewBanner.ctaButtons && previewBanner.ctaButtons.length > 0) {
                                return previewBanner.ctaButtons.slice(0, 2).map((button, index) => (
                                  <Button 
                                    key={index}
                                    size="lg"
                                    className={index === 0 
                                      ? "bg-white text-black hover:bg-white/90 px-8 py-3 text-base font-medium tracking-wide uppercase border-0"
                                      : "bg-transparent text-white border border-white/40 hover:bg-white/10 px-8 py-3 text-base font-medium tracking-wide uppercase"
                                    }
                                    onClick={() => window.open(button.url, '_blank')}
                                  >
                                    {button.label}
                                    {index === 0 && <ArrowRight className="ml-3 w-5 h-5" />}
                                  </Button>
                                ));
                              }
                              // Fallback to legacy format
                              if (previewBanner.ctaButtonLabel) {
                                return (
                                  <Button
                                    size="lg"
                                    className="bg-white text-black hover:bg-white/90 px-8 py-3 text-base font-medium tracking-wide uppercase border-0"
                                    onClick={() => previewBanner.ctaButtonUrl && window.open(previewBanner.ctaButtonUrl, '_blank')}
                                  >
                                    {previewBanner.ctaButtonLabel}
                                    <ArrowRight className="ml-3 w-5 h-5" />
                                  </Button>
                                );
                              }
                              return null;
                            })()}
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                            <span className="text-white/70 text-sm tracking-wide">Trusted by 50,000+ customers</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Status:</span>{' '}
                  <Badge variant={previewBanner.isActive ? "default" : "secondary"}>
                    {previewBanner.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Order:</span> {previewBanner.order}
                </div>
                {previewBanner.discount && (
                  <div>
                    <span className="font-medium">Discount:</span>{' '}
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      ⭐ {previewBanner.discount}
                    </span>
                  </div>
                )}
                <div className="col-span-2">
                  <span className="font-medium">CTA Buttons:</span>
                  <div className="mt-1 space-y-1">
                    {(() => {
                      // Support new ctaButtons array format
                      if (previewBanner.ctaButtons && previewBanner.ctaButtons.length > 0) {
                        return previewBanner.ctaButtons.map((btn, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <span className="px-2 py-1 bg-gray-100 rounded text-sm">{btn.label}</span>
                            <span className="text-gray-500">→</span>
                            <a
                              href={btn.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm break-all"
                            >
                              {btn.url}
                            </a>
                          </div>
                        ));
                      }
                      // Fallback to legacy format
                      if (previewBanner.ctaButtonLabel) {
                        return (
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-1 bg-gray-100 rounded text-sm">{previewBanner.ctaButtonLabel}</span>
                            {previewBanner.ctaButtonUrl && (
                              <>
                                <span className="text-gray-500">→</span>
                                <a
                                  href={previewBanner.ctaButtonUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm break-all"
                                >
                                  {previewBanner.ctaButtonUrl}
                                </a>
                              </>
                            )}
                          </div>
                        );
                      }
                      return <span className="text-gray-500 text-sm">No CTA buttons configured</span>;
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ErrorDialogComponent />
      <SuccessDialogComponent />
      <DeleteConfirmationComponent />
      
      {/* Activate/Deactivate confirmation */}
      <ActionConfirmationDialog
        open={actionConfirmOpen && pendingAction !== null}
        onOpenChange={setActionConfirmOpen}
        onConfirm={onConfirmAction}
        title={pendingAction === 'activate' ? `Activate ${pendingRows.length} Banner${pendingRows.length > 1 ? 's' : ''}?` : `Deactivate ${pendingRows.length} Banner${pendingRows.length > 1 ? 's' : ''}?`}
        description={pendingAction === 'activate' ? 'Selected banners will become active and visible to customers on your homepage carousel.' : 'Selected banners will be deactivated and hidden from customers. They will be removed from the current list.'}
        confirmLabel={pendingAction === 'activate' ? 'Activate' : 'Deactivate'}
        isLoading={isConfirming}
        tone={pendingAction === 'activate' ? 'success' : 'warning'}
      />
    </AdminLayout>
  );
}