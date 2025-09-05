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
import { AlertTriangle, Package, Plus, Star, TrendingUp } from 'lucide-react';
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
        <Badge variant="outline">
          {value?.name || 'Uncategorized'}
        </Badge>
      )
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (value: number, row: Product) => (
        <div>
          <p className="font-medium">{formatPrice(value)}</p>
          {row.comparePrice && (
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
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-1">
              Manage your product catalog and inventory
            </p>
          </div>
          <Link href="/admin/products/new">
            <Button>
              <Plus size={16} className="mr-2" />
              Add Product
            </Button>
          </Link>
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
                    <p className="text-sm font-medium text-gray-600">Total Products</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Package className="text-blue-600" size={20} />
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
                    <p className="text-sm font-medium text-gray-600">Active Products</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.active}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <TrendingUp className="text-green-600" size={20} />
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
                    <p className="text-sm font-medium text-gray-600">Featured Products</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.featured}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Star className="text-yellow-600" size={20} />
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
                    <p className="text-sm font-medium text-gray-600">Low Stock</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.lowStock}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <AlertTriangle className="text-red-600" size={20} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Products List</CardTitle>
          </CardHeader>
          <CardContent>
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