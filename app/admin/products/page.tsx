'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import DataTable from '@/components/admin/DataTable';
import ActionConfirmationDialog from '@/components/ui/action-confirmation-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DeleteConfirmationDialog from '@/components/ui/delete-confirmation-dialog';
import { useToastWithTypes } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { AlertTriangle, BarChart3, Eye, Package, Plus, Sparkles, Star } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  quantity: number;
  thumbnailImage: string;
  images: string[];
  videoLinks?: string[];
  sizeImage?: string;
  category: {
    name: string;
    slug: string;
  };
  variants?: Array<{
    name: string;
    value: string;
    price?: number;
    sku?: string;
    quantity?: number;
    image?: string;
  }>;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isLimitedEdition: boolean;
  averageRating: number;
  totalSales: number;
  createdAt: string;
  sku: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Array<{ label: string; value: string }>>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
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
    featured: 0,
    lowStock: 0
  });

  const { success, error } = useToastWithTypes();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionConfirmOpen, setActionConfirmOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [pendingAction, setPendingAction] = useState<null | 'activate' | 'deactivate' | 'delete'>(null);
  const [pendingRows, setPendingRows] = useState<Product[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    // initial categories fetch
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/admin/categories');
        if (!res.ok) return;
        const data = await res.json();
        const opts = Array.isArray(data) ? data.map((c: any) => ({ label: c.name, value: c.slug })) : [];
        setCategories(opts);
      } catch (e) {
        console.error('Failed to load categories', e);
      }
    };
    fetchCategories();
    
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

  const fetchProducts = async () => {
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
      // backend-friendly filters mapping
      const { category, isActive, minRating, dateFrom, dateTo, stock } = filterValues;
      if (category) params.set('category', category);
      if (isActive) params.set('active', isActive);
      if (minRating) params.set('minRating', minRating);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      if (stock) params.set('stock', stock);

      const response = await fetch(`/api/admin/products?${params.toString()}`, { signal: ac.signal });
      const data = await response.json();

      setProducts(data.products || []);
      setTotal(data.pagination?.total || 0);

      // Stats: total from backend; others approximate from current page to keep UI responsive
      const activeCount = (data.products || []).filter((p: Product) => p.isActive).length;
      const featuredCount = (data.products || []).filter((p: Product) => p.isFeatured).length;
      const lowStockCount = (data.products || []).filter((p: Product) => p.quantity < 10).length;
      setStats({ total: data.pagination?.total || 0, active: activeCount, featured: featuredCount, lowStock: lowStockCount });
    } catch (error) {
      if ((error as any)?.name !== 'AbortError') {
        console.error('Error fetching products:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-BD');
  };

  const handleView = (product: Product) => {
    window.open(`/admin/products/${product._id}`, '_blank');
  };

  const handleEdit = (product: Product) => {
    window.open(`/admin/products/${product._id}/edit`, '_blank');
  };

  const handleDelete = (product: Product) => {
    setPendingAction('delete');
    setPendingRows([product]);
    setConfirmOpen(true);
  };

  const columns = [
    {
      key: 'thumbnailImage',
      label: 'Image',
      render: (value: string, row: Product) => (
        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
          {value ? (
            <img
              src={value}
              alt={row.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={16} className="text-gray-400" />
            </div>
          )}
        </div>
      ),
      width: '80px'
    },
    {
      key: 'name',
      label: 'Product',
      sortable: true,
      render: (value: string, row: Product) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">SKU: {row.sku}</p>
          {row.variants && row.variants.length > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-gray-400">Variants:</span>
              <div className="flex gap-1">
                {row.variants.slice(0, 3).map((variant, index) => (
                  <div key={index} className="relative group">
                    {variant.image ? (
                      <img 
                        src={variant.image} 
                        alt={variant.value}
                        className="w-5 h-5 rounded object-cover border border-gray-200"
                        title={`${variant.name}: ${variant.value}`}
                      />
                    ) : (
                      <div 
                        className="w-5 h-5 rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-400"
                        title={`${variant.name}: ${variant.value}`}
                      >
                        {variant.value.charAt(0)}
                      </div>
                    )}
                  </div>
                ))}
                {row.variants.length > 3 && (
                  <div className="w-5 h-5 rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-400">
                    +{row.variants.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}
          {row.videoLinks && row.videoLinks.length > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-blue-500">📹 {row.videoLinks.length} video{row.videoLinks.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      filterable: true,
      render: (value: any) => (
        <div className="text-sm text-gray-600">
          {value?.name || 'Uncategorized'}
        </div>
      )
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (value: number, row: Product) => (
        <div>
          <p className="font-medium">{formatPrice(value)}</p>
          {row?.comparePrice !== 0 && row.comparePrice !== undefined && row.comparePrice > 0 && (
            <p className="text-sm text-gray-500 line-through">
              {formatPrice(row.comparePrice)}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'quantity',
      label: 'Stock',
      sortable: true,
      render: (value: number) => (
        <Badge 
          variant={value < 10 ? "destructive" : value < 50 ? "secondary" : "default"}
        >
          {value}
        </Badge>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      filterable: true,
      render: (value: boolean, row: Product) => (
        <div className="space-y-1">
          <Badge variant={value ? "default" : "secondary"}>
            {value ? 'Active' : 'Inactive'}
          </Badge>
          <div className="flex flex-wrap gap-1">
            {row.isFeatured && (
              <Badge variant="outline" className="text-xs">
                Featured
              </Badge>
            )}
            {row.isNewArrival && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                New Arrival
              </Badge>
            )}
            {row.isLimitedEdition && (
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                Limited Edition
              </Badge>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'averageRating',
      label: 'Rating',
      sortable: true,
      render: (value: number, row: Product) => (
        <div className="flex items-center space-x-1">
          <Star size={14} className="text-yellow-400 fill-current" />
          <span className="text-sm">
            {value.toFixed(1)} ({row.totalSales})
          </span>
        </div>
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

  const filters = useMemo(() => {
    return [
      {
        key: 'category',
        label: 'Category',
        options: categories
      },
      {
        type: 'boolean' as const,
        key: 'isActive',
        label: 'Status',
        trueLabel: 'Active',
        falseLabel: 'Inactive'
      },
      {
        type: 'rating' as const,
        key: 'minRating',
        label: 'Min Rating',
        min: 0,
        max: 5,
        step: 0.5
      },
      {
        type: 'select' as const,
        key: 'stock',
        label: 'Stock',
        options: [
          { label: 'In stock', value: 'in' },
          { label: 'Out of stock', value: 'out' }
        ]
      },
      {
        type: 'dateRange' as const,
        label: 'Created Between',
        fromKey: 'dateFrom',
        toKey: 'dateTo'
      }
    ];
  }, [categories]);

  // Fetch when query state changes
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, sortKey, sortDirection, filterValues]);

  const applyOptimisticRemoval = (ids: string[]) => {
    if (!ids?.length) return;
    setProducts((prev) => prev.filter((p) => !ids.includes(p._id)));
    // Adjust total count optimistically
    setTotal((t) => Math.max(0, t - ids.length));
  };

  const performBulkStatus = async (rows: Product[], isActive: boolean) => {
    const ids = rows.map((r) => r._id);
    try {
      // Optimistic UI: hide affected rows immediately as requested
      applyOptimisticRemoval(ids);
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, isActive })
      });
      if (!res.ok) {
        // On failure, refetch to reconcile
        await fetchProducts();
      } else {
        success(
          isActive ? 'Products activated' : 'Products deactivated',
          `${ids.length} product${ids.length > 1 ? 's' : ''} ${isActive ? 'activated' : 'deactivated'} successfully.`
        );
      }
    } catch (e) {
      await fetchProducts();
      error('Action failed', 'Something went wrong while applying bulk action.');
    }
  };

  const performBulkDelete = async (rows: Product[]) => {
    const ids = rows.map((r) => r._id);
    try {
      // Optimistic UI: hide affected rows immediately as requested
      applyOptimisticRemoval(ids);
      const res = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      if (!res.ok) {
        await fetchProducts();
      } else {
        success('Products deleted', `${ids.length} product${ids.length > 1 ? 's' : ''} deleted successfully.`);
      }
    } catch (e) {
      await fetchProducts();
      error('Delete failed', 'Something went wrong while deleting products.');
    }
  };

  const bulkActions = [
    {
      label: 'Activate',
      action: (selectedRows: Product[]) => {
        setPendingAction('activate');
        setPendingRows(selectedRows);
        setActionConfirmOpen(true);
      }
    },
    {
      label: 'Deactivate',
      action: (selectedRows: Product[]) => {
        setPendingAction('deactivate');
        setPendingRows(selectedRows);
        setActionConfirmOpen(true);
      }
    },
    {
      label: 'Delete',
      action: (selectedRows: Product[]) => {
        setPendingAction('delete');
        setPendingRows(selectedRows);
        setConfirmOpen(true);
      },
      variant: 'destructive' as const
    }
  ];

  const confirmTitle = pendingAction === 'delete'
    ? `Delete ${pendingRows.length} selected product${pendingRows.length > 1 ? 's' : ''}?`
    : pendingAction === 'activate'
      ? `Activate ${pendingRows.length} selected product${pendingRows.length > 1 ? 's' : ''}?`
      : pendingAction === 'deactivate'
        ? `Deactivate ${pendingRows.length} selected product${pendingRows.length > 1 ? 's' : ''}?`
        : '';

  const confirmDescription = pendingAction === 'delete'
    ? 'This action cannot be undone and will permanently remove the selected products.'
    : pendingAction === 'activate'
      ? 'Selected products will become active and visible to customers.'
      : pendingAction === 'deactivate'
        ? 'Selected products will be deactivated and hidden from customers. They will be removed from the current list.'
        : '';

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
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="flex items-center gap-3"
                  >
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/20">
                      <Package className="text-white" size={28} />
                    </div>
                    <div>
                      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                        Products
                      </h1>
                      <p className="text-primary-100 text-sm sm:text-base lg:text-lg mt-1">
                        Manage your product catalog with elegance
                      </p>
                    </div>
                  </motion.div>
                  
                  <motion.p 
                    className="text-white/90 text-sm sm:text-base max-w-2xl leading-relaxed"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    Create stunning product listings with advanced inventory management, SEO optimization, and seamless organization for your e-commerce platform.
                  </motion.p>
                </div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <Link href="/admin/products/new">
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        className="bg-white text-primary-700 hover:bg-primary-50 hover:text-primary-800 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold px-6 py-3 rounded-xl"
                        size="lg"
                      >
                        <Plus size={20} className="mr-2" />
                        <span className="hidden sm:inline">Add Product</span>
                        <span className="sm:hidden">Add</span>
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Stats Cards */}
          <motion.div 
            ref={statsRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="group"
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200 hover:shadow-xl transition-all duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-400/20 to-transparent rounded-full blur-xl" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-primary-700 mb-1">Total Products</p>
                      <p className="text-3xl font-bold text-primary-900">{stats.total}</p>
                      <p className="text-xs text-primary-600 mt-1">In catalog</p>
                    </div>
                    <div className="p-4 bg-primary-200/50 rounded-2xl group-hover:bg-primary-300/50 transition-colors">
                      <Package className="text-primary-700" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="group"
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-xl transition-all duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-full blur-xl" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-700 mb-1">Active Products</p>
                      <p className="text-3xl font-bold text-emerald-900">{stats.active}</p>
                      <p className="text-xs text-emerald-600 mt-1">Live & visible</p>
                    </div>
                    <div className="p-4 bg-emerald-200/50 rounded-2xl group-hover:bg-emerald-300/50 transition-colors">
                      <Eye className="text-emerald-700" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="group"
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200 hover:shadow-xl transition-all duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-400/20 to-transparent rounded-full blur-xl" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-violet-700 mb-1">Featured Products</p>
                      <p className="text-3xl font-bold text-violet-900">{stats.featured}</p>
                      <p className="text-xs text-violet-600 mt-1">Highlighted</p>
                    </div>
                    <div className="p-4 bg-violet-200/50 rounded-2xl group-hover:bg-violet-300/50 transition-colors">
                      <Star className="text-violet-700" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="group"
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-xl transition-all duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-transparent rounded-full blur-xl" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-700 mb-1">Low Stock</p>
                      <p className="text-3xl font-bold text-amber-900">{stats.lowStock}</p>
                      <p className="text-xs text-amber-600 mt-1">Need restocking</p>
                    </div>
                    <div className="p-4 bg-amber-200/50 rounded-2xl group-hover:bg-amber-300/50 transition-colors">
                      <AlertTriangle className="text-amber-700" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Products Grid/List View */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-lg rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary-50 to-secondary-50 border-b border-primary-100 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 rounded-xl">
                      <BarChart3 className="text-primary-700" size={20} />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900">Product Management</CardTitle>
                      <p className="text-gray-600 mt-1">
                        {products.length} of {total} products
                        {searchInput && ` matching "${searchInput}"`}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <DataTable
                  data={products}
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
                    pageSizeOptions: [5, 10, 12, 25, 50, 100]
                  }}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onRowClick={(product) => {
                    // console.log('View product:', product);
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Delete confirmation */}
        <DeleteConfirmationDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          onConfirm={onConfirmAction}
          title={confirmTitle}
          description={confirmDescription}
          entityName="Product"
          entityCount={pendingRows.length}
          isLoading={isConfirming}
        />

        {/* Activate/Deactivate confirmation */}
        <ActionConfirmationDialog
          open={actionConfirmOpen && pendingAction !== 'delete'}
          onOpenChange={setActionConfirmOpen}
          onConfirm={onConfirmAction}
          title={pendingAction === 'activate' ? `Activate ${pendingRows.length} product${pendingRows.length > 1 ? 's' : ''}?` : `Deactivate ${pendingRows.length} product${pendingRows.length > 1 ? 's' : ''}?`}
          description={pendingAction === 'activate' ? 'Selected products will become active and visible to customers.' : 'Selected products will be deactivated and hidden from customers. They will be removed from the current list.'}
          confirmLabel={pendingAction === 'activate' ? 'Activate' : 'Deactivate'}
          isLoading={isConfirming}
          tone={pendingAction === 'activate' ? 'success' : 'warning'}
        />
      </div>
    </AdminLayout>
    );
  }