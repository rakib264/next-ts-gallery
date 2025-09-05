'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import DataTable from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DeleteConfirmationDialog from '@/components/ui/delete-confirmation-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import FileUpload from '@/components/ui/file-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Form, Formik } from 'formik';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { AlertCircle, CheckCircle, Eye, Plus, Tag } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import * as Yup from 'yup';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: {
    _id: string;
    name: string;
  };
  image?: string;
  isActive: boolean;
  sortOrder: number;
  metaTitle?: string;
  metaDescription?: string;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  parent: string;
  image: string;
  isActive: boolean;
  sortOrder: number;
  metaTitle: string;
  metaDescription: string;
}

interface FormikFormValues extends CategoryFormData {}

// Enhanced validation schema
const categoryValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, 'Category name must be at least 2 characters')
    .max(80, 'Category name cannot exceed 80 characters')
    .required('Category name is required'),
  slug: Yup.string()
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .required('Slug is required'),
  description: Yup.string()
    .max(500, 'Description cannot exceed 500 characters')
    .nullable(),
  parent: Yup.string().nullable(),
  image: Yup.string()
    .url('Please enter a valid image URL')
    .nullable()
    .optional(),
  isActive: Yup.boolean().required(),
  sortOrder: Yup.number()
    .min(0, 'Sort order must be 0 or greater')
    .max(100000, 'Sort order cannot exceed 100,000')
    .required('Sort order is required'),
  metaTitle: Yup.string()
    .max(120, 'Meta title cannot exceed 120 characters')
    .nullable(),
  metaDescription: Yup.string()
    .max(300, 'Meta description cannot exceed 300 characters')
    .nullable(),
});

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [categoriesToDelete, setCategoriesToDelete] = useState<Category[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    parent: '',
    image: '',
    isActive: true,
    sortOrder: 0,
    metaTitle: '',
    metaDescription: ''
  });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCategories();
    // Initialize GSAP animations
    if (containerRef.current) {
      gsap.fromTo(containerRef.current.children, 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        console.warn('Unexpected categories payload:', data);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      parent: '',
      image: '',
      isActive: true,
      sortOrder: 0,
      metaTitle: '',
      metaDescription: ''
    });
    setEditingCategory(null);
    setViewMode(false);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setViewMode(false);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parent: category.parent?._id || '',
      image: category.image || '',
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      metaTitle: category.metaTitle || '',
      metaDescription: category.metaDescription || ''
    });
    setDialogOpen(true);
  };

  const handleView = (category: Category) => {
    setEditingCategory(category);
    setViewMode(true);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parent: category.parent?._id || '',
      image: category.image || '',
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      metaTitle: category.metaTitle || '',
      metaDescription: category.metaDescription || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/categories/${categoryToDelete._id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchCategories();
        setDeleteDialogOpen(false);
        setCategoryToDelete(null);
        // Animate success
        gsap.to('.success-indicator', { 
          scale: 1.2, 
          duration: 0.3, 
          yoyo: true, 
          repeat: 1 
        });
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (categoriesToDelete.length === 0) return;
    
    setIsDeleting(true);
    try {
      const ids = categoriesToDelete.map(cat => cat._id);
      const response = await fetch('/api/admin/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });

      if (response.ok) {
        await fetchCategories();
        setDeleteDialogOpen(false);
        setCategoriesToDelete([]);
        setSelectedRows([]);
        
        // Reset to first page if we're on a page that no longer exists
        setCurrentPage(1);
        
        // Animate success
        gsap.to('.bulk-success-indicator', { 
          scale: 1.2, 
          duration: 0.3, 
          yoyo: true, 
          repeat: 1 
        });
      }
    } catch (error) {
      console.error('Error bulk deleting categories:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Category',
      sortable: true,
      render: (value: string, row: Category) => (
        <motion.div 
          className="flex items-center space-x-3"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          {row.image ? (
            <div className="relative">
              <img
                src={row.image}
                alt={value}
                className="w-12 h-12 object-cover rounded-xl shadow-sm"
              />
              <div className="absolute inset-0 bg-black/10 rounded-xl"></div>
            </div>
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center shadow-sm">
              <Tag size={18} className="text-indigo-500" />
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 font-mono">/{row.slug}</p>
          </div>
        </motion.div>
      )
    },
    {
      key: 'parent',
      label: 'Parent',
      render: (value: any) => (
        value ? (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {value.name}
          </Badge>
        ) : (
          <span className="text-gray-400 italic">Root Category</span>
        )
      )
    },
    {
      key: 'productCount',
      label: 'Products',
      sortable: true,
      render: (value: number = 0) => (
        <Badge variant="secondary" className="bg-gray-100 text-gray-700">
          {value} {value === 1 ? 'product' : 'products'}
        </Badge>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      filterable: true,
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "secondary"} className={value ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'sortOrder',
      label: 'Order',
      sortable: true,
      render: (value: number) => (
        <span className="text-sm font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
          {value}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-500">
          {new Date(value).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          })}
        </span>
      )
    }
  ];

  const filters = [
    {
      key: 'isActive',
      label: 'Status',
      options: [
        { label: 'Active', value: 'true' },
        { label: 'Inactive', value: 'false' }
      ]
    }
  ];

  // Enhanced bulk delete handler that ensures proper state management
  const handleBulkAction = (selectedRows: Category[]) => {
    if (selectedRows.length === 0) return;
    
    setCategoriesToDelete(selectedRows);
    setDeleteDialogOpen(true);
  };

  const bulkActions = [
    {
      label: 'Delete Selected',
      action: handleBulkAction,
      variant: 'destructive' as const
    }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <motion.div 
            className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div ref={containerRef} className="space-y-8">
        {/* Enhanced Header */}
        <motion.div 
          className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Categories
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Organize your products with elegant categories and subcategories
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={resetForm}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                  size="lg"
                >
                  <Plus size={20} className="mr-2" />
                  Add Category
                </Button>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto custom-scrollbar bg-white">
              <DialogHeader className="pb-6">
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {viewMode ? 'View Category Details' : (editingCategory ? 'Edit Category' : 'Create New Category')}
                </DialogTitle>
                {viewMode && (
                  <p className="text-gray-600 mt-2">
                    Viewing category information. Click outside to close.
                  </p>
                )}
              </DialogHeader>
              
              <Formik
                enableReinitialize
                initialValues={formData}
                validationSchema={categoryValidationSchema}
                onSubmit={async (values: FormikFormValues) => {
                  const payload = {
                    ...values,
                    parent: values.parent ? values.parent : undefined,
                  };
                  try {
                    const url = editingCategory
                      ? `/api/admin/categories/${editingCategory._id}`
                      : '/api/admin/categories';
                    const method = editingCategory ? 'PUT' : 'POST';
                    const res = await fetch(url, {
                      method,
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload),
                    });
                    if (res.ok) {
                      await fetchCategories();
                      setDialogOpen(false);
                      resetForm();
                      // Success animation
                      gsap.to('.form-success', { 
                        scale: 1.1, 
                        duration: 0.3, 
                        yoyo: true, 
                        repeat: 1 
                      });
                    } else {
                      console.error('Save failed');
                    }
                  } catch (err) {
                    console.error('Save error', err);
                  }
                }}
              >
                {({ values, errors, touched, setFieldValue, isSubmitting }: any) => (
                  <Form className="space-y-8">

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name" className="text-base font-semibold text-gray-900">
                            Category Name *
                          </Label>
                          <Input
                            id="name"
                            value={values.name}
                            onChange={(e) => {
                              setFieldValue('name', e.target.value);
                              setFieldValue('slug', generateSlug(e.target.value));
                              setFieldValue('metaTitle', e.target.value);
                            }}
                            placeholder="Enter category name"
                            className="mt-2 h-12 text-base"
                            required
                            disabled={viewMode}
                          />
                          {touched.name && errors.name && (
                            <motion.p 
                              className="text-sm text-red-600 mt-2 flex items-center"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                            >
                              <AlertCircle size={16} className="mr-1" />
                              {errors.name}
                            </motion.p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="slug" className="text-base font-semibold text-gray-900">
                            URL Slug
                          </Label>
                          <Input
                            id="slug"
                            value={values.slug}
                            onChange={(e) => setFieldValue('slug', e.target.value)}
                            placeholder="category-slug"
                            className="mt-2 h-12 text-base font-mono"
                            disabled={viewMode}
                          />
                          {touched.slug && errors.slug && (
                            <motion.p 
                              className="text-sm text-red-600 mt-2 flex items-center"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                            >
                              <AlertCircle size={16} className="mr-1" />
                              {errors.slug}
                            </motion.p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="parent" className="text-base font-semibold text-gray-900">
                            Parent Category
                          </Label>
                          <Select
                            value={values.parent || '__root__'}
                            onValueChange={(value) => setFieldValue('parent', value === '__root__' ? '' : value)}
                            disabled={viewMode}
                          >
                            <SelectTrigger className="mt-2 h-12 text-base">
                              <SelectValue placeholder="Select parent (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__root__">None (Root Category)</SelectItem>
                              {categories?.filter(cat => cat._id !== editingCategory?._id).map((category: Category) => (
                                <SelectItem key={category._id} value={category._id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="sortOrder" className="text-base font-semibold text-gray-900">
                            Sort Order
                          </Label>
                          <Input
                            id="sortOrder"
                            type="number"
                            value={values.sortOrder}
                            onChange={(e) => setFieldValue('sortOrder', Number(e.target.value))}
                            placeholder="0"
                            className="mt-2 h-12 text-base"
                            disabled={viewMode}
                          />
                          {touched.sortOrder && errors.sortOrder && (
                            <motion.p 
                              className="text-sm text-red-600 mt-2 flex items-center"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                            >
                              <AlertCircle size={16} className="mr-1" />
                              {errors.sortOrder as any}
                            </motion.p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="description" className="text-base font-semibold text-gray-900">
                            Description
                          </Label>
                          <Textarea
                            id="description"
                            value={values.description}
                            onChange={(e) => setFieldValue('description', e.target.value)}
                            placeholder="Category description"
                            rows={4}
                            className="mt-2 text-base resize-none"
                            disabled={viewMode}
                          />
                          {touched.description && errors.description && (
                            <motion.p 
                              className="text-sm text-red-600 mt-2 flex items-center"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                            >
                              <AlertCircle size={16} className="mr-1" />
                              {errors.description}
                            </motion.p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="metaTitle" className="text-base font-semibold text-gray-900">
                            Meta Title
                          </Label>
                          <Input
                            id="metaTitle"
                            value={values.metaTitle}
                            onChange={(e) => setFieldValue('metaTitle', e.target.value)}
                            placeholder="SEO title"
                            className="mt-2 h-12 text-base"
                            disabled={viewMode}
                          />
                          {touched.metaTitle && errors.metaTitle && (
                            <motion.p 
                              className="text-sm text-red-600 mt-2 flex items-center"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                            >
                              <AlertCircle size={16} className="mr-1" />
                              {errors.metaTitle}
                            </motion.p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="metaDescription" className="text-base font-semibold text-gray-900">
                            Meta Description
                          </Label>
                          <Textarea
                            id="metaDescription"
                            value={values.metaDescription}
                            onChange={(e) => setFieldValue('metaDescription', e.target.value)}
                            placeholder="SEO description"
                            rows={3}
                            className="mt-2 text-base resize-none"
                            disabled={viewMode}
                          />
                          {touched.metaDescription && errors.metaDescription && (
                            <motion.p 
                              className="text-sm text-red-600 mt-2 flex items-center"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                            >
                              <AlertCircle size={16} className="mr-1" />
                              {errors.metaDescription}
                            </motion.p>
                          )}
                        </div>

                        <div className="flex items-center space-x-3 pt-4">
                          {viewMode ? (
                            <div className="flex items-center space-x-2">
                              <Badge variant={values.isActive ? "default" : "secondary"} className={values.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>
                                Status: {values.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          ) : (
                            <>
                              <Switch
                                id="isActive"
                                checked={values.isActive}
                                onCheckedChange={(checked) => setFieldValue('isActive', checked)}
                                className="data-[state=checked]:bg-blue-600"
                              />
                              <Label htmlFor="isActive" className="text-base font-semibold text-gray-900">
                                Active Status
                              </Label>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                                                            {/* Category Image - Full Width */}
                    {(values.image || !viewMode) && (
                      <div className="space-y-4">
                        <Label className="text-lg font-semibold text-gray-900">Category Image</Label>
                        {!viewMode && (
                          <div>
                            <FileUpload
                              accept="image/*"
                              multiple={false}
                              onUpload={(url) => setFieldValue('image', url)}
                              className="w-full"
                            />
                          </div>
                        )}
                        {values.image && (
                          <motion.div 
                            className="mt-4"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <img 
                              src={values.image} 
                              alt="Category preview" 
                              className="w-full h-48 object-cover rounded-xl border-2 border-gray-200 shadow-lg" 
                            />
                          </motion.div>
                        )}
                        {touched.image && errors.image && (
                          <motion.p 
                            className="text-sm text-red-600 mt-2 flex items-center"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                          >
                            <AlertCircle size={16} className="mr-1" />
                            {String(errors.image)}
                          </motion.p>
                        )}
                      </div>
                    )}

                    {/* Form Actions */}
                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                      {viewMode ? (
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setDialogOpen(false)}
                          className="px-6 py-2"
                        >
                          Close
                        </Button>
                      ) : (
                        <>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setDialogOpen(false)}
                            className="px-6 py-2"
                          >
                            Cancel
                          </Button>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button 
                              type="submit" 
                              disabled={isSubmitting}
                              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            >
                              {isSubmitting ? (
                                <motion.div 
                                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                              ) : (
                                <>
                                  <CheckCircle size={18} className="mr-2" />
                                  {editingCategory ? 'Update' : 'Create'} Category
                                </>
                              )}
                            </Button>
                          </motion.div>
                        </>
                      )}
                    </div>
                  </Form>
                )}
              </Formik>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -5 }}
          >
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Categories</p>
                    <p className="text-3xl font-bold text-blue-900 mt-1">{categories.length}</p>
                  </div>
                  <div className="p-4 bg-blue-200 rounded-full">
                    <Tag className="text-blue-700" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -5 }}
          >
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Active Categories</p>
                    <p className="text-3xl font-bold text-green-900 mt-1">
                      {categories.filter(c => c.isActive).length}
                    </p>
                  </div>
                  <div className="p-4 bg-green-200 rounded-full">
                    <Eye className="text-green-700" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -5 }}
          >
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Root Categories</p>
                    <p className="text-3xl font-bold text-purple-900 mt-1">
                      {categories.filter(c => !c.parent).length}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-200 rounded-full">
                    <Tag className="text-purple-700" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -5 }}
          >
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-700">Subcategories</p>
                    <p className="text-3xl font-bold text-orange-900 mt-1">
                      {categories.filter(c => c.parent).length}
                    </p>
                  </div>
                  <div className="p-4 bg-orange-200 rounded-full">
                    <Tag className="text-orange-700" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Enhanced Categories Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <CardTitle className="text-2xl font-bold text-gray-900">Categories Management</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <DataTable
                key={`categories-${categories.length}`}
                data={categories}
                columns={columns}
                filters={filters}
                bulkActions={bulkActions}
                selectable
                exportable
                onRowClick={(category) => handleEdit(category)}
                onView={(category) => handleView(category)}
                onEdit={(category) => handleEdit(category)}
                onDelete={(category) => handleDelete(category)}
                onSelectionChange={setSelectedRows}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Reusable Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={categoryToDelete ? confirmDelete : handleBulkDelete}
        title={categoryToDelete ? 'Delete Category' : 'Delete Multiple Categories'}
        description={
          categoryToDelete 
            ? `Are you sure you want to delete "${categoryToDelete.name}"? This action cannot be undone and will remove all associated data.`
            : `Are you sure you want to delete ${categoriesToDelete.length} selected categor${categoriesToDelete.length > 1 ? 'ies' : 'y'}? This action cannot be undone.`
        }
        entityName="Category"
        entityCount={categoryToDelete ? 1 : categoriesToDelete.length}
        isLoading={isDeleting}
      />
    </AdminLayout>
  );
}