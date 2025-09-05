'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FileUpload from '@/components/ui/file-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToastWithTypes } from '@/hooks/use-toast';
import { ErrorMessage, Field, FieldArray, Form, Formik } from 'formik';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Save, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

interface ProductFormValues {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string;
  price: number;
  comparePrice: number;
  cost: number;
  sku: string;
  barcode: string;
  trackQuantity: boolean;
  quantity: number;
  lowStockThreshold: number;
  thumbnailImage: string;
  images: string[];
  videoLinks: string[];
  sizeImage: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  shippingCost: number;
  taxRate: number;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isLimitedEdition: boolean;
  tags: string[];
  productSize: string[];
  metaTitle: string;
  metaDescription: string;
  seoKeywords: string[];
  variants: Array<{
    name: string;
    value: string;
    price?: number;
    sku: string;
    quantity?: number;
    image?: string;
  }>;
}

const productValidationSchema = Yup.object({
  name: Yup.string()
    .min(1, 'Product name is required')
    .required('Product name is required'),
  slug: Yup.string()
    .min(1, 'Product slug is required')
    .required('Product slug is required'),
  description: Yup.string()
    .min(1, 'Product description is required')
    .required('Product description is required'),
  shortDescription: Yup.string().optional(),
  category: Yup.string()
    .min(1, 'Please select a category')
    .required('Please select a category'),
  price: Yup.number()
    .positive('Price must be greater than 0')
    .required('Price is required'),
  comparePrice: Yup.number()
    .min(0, 'Compare price must be 0 or greater')
    .test('compare-price', 'Compare price must be greater than regular price', function(value) {
      const { price } = this.parent;
      if (value !== undefined && value > 0 && value <= price) {
        return false;
      }
      return true;
    }),
  cost: Yup.number()
    .min(0, 'Cost must be 0 or greater')
    .test('cost', 'Cost cannot be greater than selling price', function(value) {
      const { price } = this.parent;
      if (value !== undefined && value > 0 && value > price) {
        return false;
      }
      return true;
    }),
  sku: Yup.string()
    .min(1, 'SKU is required')
    .required('SKU is required'),
  barcode: Yup.string().optional(),
  trackQuantity: Yup.boolean().required(),
  quantity: Yup.number()
    .min(0, 'Quantity must be 0 or greater')
    .default(0),
  lowStockThreshold: Yup.number()
    .min(0, 'Low stock threshold must be 0 or greater')
    .default(10),
  thumbnailImage: Yup.string()
    .min(1, 'Thumbnail image is required')
    .required('Thumbnail image is required'),
  images: Yup.array().of(Yup.string()).default([]),
  videoLinks: Yup.array().of(Yup.string().url('Must be a valid URL')).default([]),
  sizeImage: Yup.string().optional(),
  weight: Yup.number().default(0),
  dimensions: Yup.object({
    length: Yup.number().default(0),
    width: Yup.number().default(0),
    height: Yup.number().default(0),
  }).default({ length: 0, width: 0, height: 0 }),
  shippingCost: Yup.number().default(0),
  taxRate: Yup.number().default(0),
  isActive: Yup.boolean().required(),
  isFeatured: Yup.boolean().required(),
  isNewArrival: Yup.boolean().required(),
  isLimitedEdition: Yup.boolean().required(),
  tags: Yup.array().of(Yup.string()).default([]),
  productSize: Yup.array().of(Yup.string()).default([]),
  metaTitle: Yup.string().optional(),
  metaDescription: Yup.string().optional(),
  seoKeywords: Yup.array().of(Yup.string()).default([]),
  variants: Yup.array().of(
    Yup.object({
      name: Yup.string()
        .min(1, 'Variant name is required')
        .required('Variant name is required'),
      value: Yup.string()
        .min(1, 'Variant value is required')
        .required('Variant value is required'),
      price: Yup.number()
        .optional()
        .test('variant-price', 'Variant price must be greater than 0', function(value) {
          if (value !== undefined && value !== null && value <= 0) {
            return false;
          }
          return true;
        }),
      sku: Yup.string().optional(),
      quantity: Yup.number()
        .optional()
        .test('variant-quantity', 'Variant quantity must be 0 or greater', function(value) {
          if (value !== undefined && value !== null && value < 0) {
            return false;
          }
          return true;
        }),
      image: Yup.string().optional(),
    })
  ).default([]),
});

const initialValues: ProductFormValues = {
  name: '',
  slug: '',
  description: '',
  shortDescription: '',
  category: '',
  price: 0,
  comparePrice: 0,
  cost: 0,
  sku: '',
  barcode: '',
  trackQuantity: true,
  quantity: 0,
  lowStockThreshold: 10,
  thumbnailImage: '',
  images: [],
  videoLinks: [],
  sizeImage: '',
  weight: 0,
  dimensions: { length: 0, width: 0, height: 0 },
  shippingCost: 0,
  taxRate: 0,
  isActive: true,
  isFeatured: false,
  isNewArrival: false,
  isLimitedEdition: false,
  tags: [],
  productSize: [],
  metaTitle: '',
  metaDescription: '',
  seoKeywords: [],
  variants: [],
};

export default function NewProduct() {
  const router = useRouter();
  const { success, error, warning, info } = useToastWithTypes();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [productSize, setProductSize] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [productSizeInput, setProductSizeInput] = useState('');
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [videoLinks, setVideoLinks] = useState<string[]>([]);
  const [videoInput, setVideoInput] = useState('');
  const [sizeImage, setSizeImage] = useState<string>('');

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories?active=true');
        if (response.ok) {
          const data = await response.json();
          setCategories(Array.isArray(data?.categories) ? data?.categories : []);
        } else {
          error('Failed to load categories', 'Please refresh the page and try again.');
        }
      } catch (err) {
        error('Network Error', 'Failed to load categories. Please check your connection.');
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Slug generator
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Add tag with validation
  const handleAddTag = (setFieldValue: any) => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setFieldValue('tags', newTags);
      setTagInput('');
      info('Tag Added', `Tag "${tagInput.trim()}" has been added to your product.`);
    } else if (tags.includes(tagInput.trim())) {
      warning('Duplicate Tag', 'This tag already exists for this product.');
    }
  };

  const handleAddProductSize = (setFieldValue: any) => {
    if (productSizeInput.trim() && !productSize.includes(productSizeInput.trim())) {
      const newProductSize = [...productSize, productSizeInput.trim()];
      setProductSize(newProductSize);
      setFieldValue('productSize', newProductSize);
      setProductSizeInput('');
      info('Product Size Added', `Product size "${productSizeInput.trim()}" has been added to your product.`);
    } else if (productSize.includes(productSizeInput.trim())) {
      warning('Duplicate Product Size', 'This product size already exists for this product.');
    }
  };

  const handleRemoveTag = (index: number, setFieldValue: any) => {
    const newTags = tags.filter((_, i) => i !== index);
    setTags(newTags);
    setFieldValue('tags', newTags);
  };

  const handleRemoveProductSize = (index: number, setFieldValue: any) => {
    const newProductSize = productSize.filter((_, i) => i !== index);
    setProductSize(newProductSize);
    setFieldValue('productSize', newProductSize);
  };

  // Add keyword with validation
  const handleAddKeyword = (setFieldValue: any) => {
    if (keywordInput.trim() && !seoKeywords.includes(keywordInput.trim())) {
      const newKeywords = [...seoKeywords, keywordInput.trim()];
      setSeoKeywords(newKeywords);
      setFieldValue('seoKeywords', newKeywords);
      setKeywordInput('');
      info('Keyword Added', `SEO keyword "${keywordInput.trim()}" has been added.`);
    } else if (seoKeywords.includes(keywordInput.trim())) {
      warning('Duplicate Keyword', 'This SEO keyword already exists.');
    }
  };

  const handleRemoveKeyword = (index: number, setFieldValue: any) => {
    const newKeywords = seoKeywords.filter((_, i) => i !== index);
    setSeoKeywords(newKeywords);
    setFieldValue('seoKeywords', newKeywords);
  };

  // Convert video URL to embeddable format
  const convertVideoUrl = (url: string): string => {
    try {
      // YouTube URLs
      if (url.includes('youtube.com/watch?v=')) {
        return url.replace('youtube.com/watch?v=', 'youtube.com/embed/');
      }
      if (url.includes('youtu.be/')) {
        return url.replace('youtu.be/', 'youtube.com/embed/');
      }
      
      // Vimeo URLs
      if (url.includes('vimeo.com/')) {
        const videoId = url.split('vimeo.com/')[1]?.split('/')[0];
        return `https://player.vimeo.com/video/${videoId}`;
      }
      
      // Direct video files or other platforms
      return url;
    } catch (error) {
      console.error('Error converting video URL:', error);
      return url;
    }
  };

  // Validate video URL
  const isValidVideoUrl = (url: string): boolean => {
    try {
      const validUrl = new URL(url);
      const supportedDomains = [
        'youtube.com', 'youtu.be', 'vimeo.com', 
        'dailymotion.com', 'twitch.tv', 'facebook.com'
      ];
      
      return supportedDomains.some(domain => validUrl.hostname.includes(domain)) ||
             url.match(/\.(mp4|webm|ogg|avi|mov)$/i) !== null;
    } catch {
      return false;
    }
  };

  // Add video link with enhanced validation
  const handleAddVideoLink = (setFieldValue: any) => {
    const trimmedUrl = videoInput.trim();
    
    if (!trimmedUrl) {
      warning('Empty URL', 'Please enter a video URL.');
      return;
    }

    if (!isValidVideoUrl(trimmedUrl)) {
      warning('Invalid URL', 'Please enter a valid YouTube, Vimeo, or direct video URL.');
      return;
    }

    if (videoLinks.includes(trimmedUrl)) {
      warning('Duplicate Video', 'This video link already exists for this product.');
      return;
    }

    const newVideoLinks = [...videoLinks, trimmedUrl];
    setVideoLinks(newVideoLinks);
    setFieldValue('videoLinks', newVideoLinks);
    setVideoInput('');
    info('Video Added', `Video ${newVideoLinks.length} has been added successfully with real-time preview.`);
  };

  const handleRemoveVideoLink = (index: number, setFieldValue: any) => {
    const newVideoLinks = videoLinks.filter((_, i) => i !== index);
    setVideoLinks(newVideoLinks);
    setFieldValue('videoLinks', newVideoLinks);
    info('Video Removed', 'Video has been removed from your product.');
  };

  // Handle size image upload
  const handleSizeImageUpload = (url: string, setFieldValue: any) => {
    setSizeImage(url);
    setFieldValue('sizeImage', url);
  };

  const handleSubmit = async (values: ProductFormValues, { setSubmitting }: any) => {
    setLoading(true);
    info('Creating Product', 'Please wait while we create your product...');
    
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        success('Product Created Successfully', 'Your product has been created and is now available in your store.');
        router.push('/admin/products');
      } else {
        const errorMessage = result.details ? result.details.join(', ') : result.error || 'Failed to create product';
        error('Product Creation Failed', errorMessage);
      }
    } catch (err: unknown) {
      error('Network Error', 'Please check your connection and try again.');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/products">
              <Button variant="outline" size="sm">
                <ArrowLeft size={16} className="mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
              <p className="text-gray-600 mt-1">Create a new product for your store</p>
            </div>
          </div>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={productValidationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue, isSubmitting, errors, touched }) => {
            // Initialize tags and seoKeywords from form values if they're empty
            React.useEffect(() => {
              if (values.tags.length > 0 && tags.length === 0) {
                setTags(values.tags);
              }
              if (values.productSize.length > 0 && productSize.length === 0) {
                setProductSize(values.productSize);
              }
              if (values.seoKeywords.length > 0 && seoKeywords.length === 0) {
                setSeoKeywords(values.seoKeywords);
              }
              if (values.videoLinks.length > 0 && videoLinks.length === 0) {
                setVideoLinks(values.videoLinks);
              }
              if (values.sizeImage && sizeImage !== values.sizeImage) {
                setSizeImage(values.sizeImage);
              }
            }, [values.tags, values.productSize, values.seoKeywords, values.videoLinks, values.sizeImage]);

            return (
            <Form className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Product Name *</Label>
                        <Field
                          as={Input}
                          id="name"
                          name="name"
                          placeholder="Enter product name"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const name = e.target.value;
                            setFieldValue('name', name);
                            setFieldValue('slug', generateSlug(name));
                            setFieldValue('metaTitle', name);
                          }}
                          className={errors.name && touched.name ? 'border-red-500' : ''}
                        />
                        <ErrorMessage name="name" component="p" className="text-red-500 text-sm mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="slug">Slug</Label>
                        <Field
                          as={Input}
                          id="slug"
                          name="slug"
                          placeholder="product-slug"
                          className={errors.slug && touched.slug ? 'border-red-500' : ''}
                        />
                        <ErrorMessage name="slug" component="p" className="text-red-500 text-sm mt-1" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="shortDescription">Short Description</Label>
                      <Field
                        as={Input}
                        id="shortDescription"
                        name="shortDescription"
                        placeholder="Brief product description"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Field name="description">
                        {({ field }: any) => (
                          <RichTextEditor
                            value={field.value}
                            onChange={(content: string) => setFieldValue('description', content)}
                            placeholder="Detailed product description"
                            className={errors.description && touched.description ? 'border-red-500' : ''}
                          />
                        )}
                      </Field>
                      <ErrorMessage name="description" component="p" className="text-red-500 text-sm mt-1" />
                    </div>
                  </CardContent>
                </Card>

                {/* Images */}
                <Card>
                  <CardHeader>
                    <CardTitle>Product Images</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Thumbnail Image *</Label>
                      <FileUpload
                        onUpload={(url) => setFieldValue('thumbnailImage', url)}
                        accept="image/*"
                        maxSize={5 * 1024 * 1024}
                      />
                      {values.thumbnailImage && (
                        <div className="mt-2">
                          <img
                            src={values.thumbnailImage}
                            alt="Thumbnail"
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        </div>
                      )}
                      <ErrorMessage name="thumbnailImage" component="p" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <Label>Additional Images</Label>
                      <FileUpload
                        onUploadMultiple={(urls) => setFieldValue('images', [...values.images, ...urls])}
                        accept="image/*"
                        maxSize={5 * 1024 * 1024}
                        multiple
                      />
                      {values.images.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {values.images.map((image, index) => (
                            <div key={index} className="relative">
                              <img
                                src={image}
                                alt={`Additional ${index + 1}`}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute -top-2 -right-2 w-6 h-6 p-0"
                                onClick={() => setFieldValue('images', values.images.filter((_, i) => i !== index))}
                              >
                                <X size={12} />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Product Videos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>Product Videos</span>
                      {videoLinks.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {videoLinks.length} video{videoLinks.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Add Video Section */}
                    <div className="space-y-3">
                      <Label htmlFor="video-input">Add Video URL</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="video-input"
                          value={videoInput}
                          onChange={(e) => setVideoInput(e.target.value)}
                          placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddVideoLink(setFieldValue))}
                          className="flex-1"
                        />
                        <Button 
                          type="button" 
                          onClick={() => handleAddVideoLink(setFieldValue)}
                          disabled={!videoInput.trim()}
                          className="px-4"
                        >
                          <Plus size={16} className="mr-2" />
                          Add
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Supports YouTube, Vimeo, and direct video URLs. Videos will be displayed as real-time previews below.
                      </p>
                    </div>

                    {/* Video Previews Grid */}
                    {videoLinks.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-medium">Video Previews ({videoLinks.length})</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setVideoLinks([]);
                              setFieldValue('videoLinks', []);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            Clear All
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {videoLinks.map((link, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                              className="border rounded-lg p-4 bg-card hover:shadow-md transition-shadow"
                            >
                              {/* Video Header */}
                              <div className="flex items-start justify-between mb-3 gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground">
                                    Video {index + 1}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate mt-1" title={link}>
                                    {link}
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveVideoLink(index, setFieldValue)}
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                  title="Remove video"
                                >
                                  <X size={14} />
                                </Button>
                              </div>
                              
                              {/* Video Preview */}
                              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden border shadow-md hover:shadow-lg transition-all duration-300">
                                <iframe
                                  src={convertVideoUrl(link)}
                                  className="w-full h-full"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  title={`Product video ${index + 1}`}
                                  loading="lazy"
                                />
                              </div>
                              
                              {/* Video Actions */}
                              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                                <Badge variant="outline" className="text-xs">
                                  {link.includes('youtube.com') || link.includes('youtu.be') ? 'YouTube' :
                                   link.includes('vimeo.com') ? 'Vimeo' : 'Direct Link'}
                                </Badge>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(link, '_blank')}
                                  className="text-xs h-7 px-2 hover:bg-primary/10"
                                >
                                  Open Link
                                </Button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                        
                        {/* Video Summary */}
                        <div className="text-center p-4 bg-muted/50 rounded-lg border">
                          <p className="text-sm text-muted-foreground">
                            {videoLinks.length} video{videoLinks.length > 1 ? 's' : ''} added. 
                            Videos will be displayed on the product page for customers to view.
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Pricing & Inventory */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pricing & Inventory</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="price">Price *</Label>
                        <Field
                          as={Input}
                          id="price"
                          name="price"
                          type="number"
                          placeholder="0.00"
                          className={errors.price && touched.price ? 'border-red-500' : ''}
                        />
                        <ErrorMessage name="price" component="p" className="text-red-500 text-sm mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="comparePrice">Compare Price</Label>
                        <Field
                          as={Input}
                          id="comparePrice"
                          name="comparePrice"
                          type="number"
                          placeholder="0.00"
                          className={errors.comparePrice && touched.comparePrice ? 'border-red-500' : ''}
                        />
                        <ErrorMessage name="comparePrice" component="p" className="text-red-500 text-sm mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="cost">Cost</Label>
                        <Field
                          as={Input}
                          id="cost"
                          name="cost"
                          type="number"
                          placeholder="0.00"
                          className={errors.cost && touched.cost ? 'border-red-500' : ''}
                        />
                        <ErrorMessage name="cost" component="p" className="text-red-500 text-sm mt-1" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sku">SKU *</Label>
                        <Field
                          as={Input}
                          id="sku"
                          name="sku"
                          placeholder="PROD-001"
                          className={errors.sku && touched.sku ? 'border-red-500' : ''}
                        />
                        <ErrorMessage name="sku" component="p" className="text-red-500 text-sm mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="barcode">Barcode</Label>
                        <Field
                          as={Input}
                          id="barcode"
                          name="barcode"
                          placeholder="123456789"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Field
                        as={Switch}
                        id="trackQuantity"
                        name="trackQuantity"
                        checked={values.trackQuantity}
                        onCheckedChange={(checked: boolean) => setFieldValue('trackQuantity', checked)}
                      />
                      <Label htmlFor="trackQuantity">Track Quantity</Label>
                    </div>

                    {values.trackQuantity && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="quantity">Quantity</Label>
                          <Field
                            as={Input}
                            id="quantity"
                            name="quantity"
                            type="number"
                            placeholder="0"
                            className={errors.quantity && touched.quantity ? 'border-red-500' : ''}
                          />
                          <ErrorMessage name="quantity" component="p" className="text-red-500 text-sm mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                          <Field
                            as={Input}
                            id="lowStockThreshold"
                            name="lowStockThreshold"
                            type="number"
                            placeholder="10"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Variants */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Product Variants
                      <FieldArray name="variants">
                        {({ push }) => (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => push({ name: '', value: '', price: 0, sku: '', quantity: 0, image: '' })}
                          >
                            <Plus size={16} className="mr-2" />
                            Add Variant
                          </Button>
                        )}
                      </FieldArray>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FieldArray name="variants">
                      {({ remove }) => (
                        <>
                          {values.variants.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No variants added</p>
                          ) : (
                            <div className="space-y-4">
                              {values.variants.map((variant, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-medium">Variant {index + 1}</h4>
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => remove(index)}
                                    >
                                      <X size={16} />
                                    </Button>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div>
                                      <Label>Name</Label>
                                      <Field
                                         as={Input}
                                         name={`variants.${index}.name`}
                                         placeholder="Size"
                                         className={errors.variants?.[index] && typeof errors.variants[index] === 'object' && (errors.variants[index] as any)?.name && touched.variants?.[index] && typeof touched.variants[index] === 'object' && (touched.variants[index] as any)?.name ? 'border-red-500' : ''}
                                       />
                                       <ErrorMessage name={`variants.${index}.name`} component="p" className="text-red-500 text-sm mt-1" />
                                    </div>
                                    <div>
                                      <Label>Value</Label>
                                      <Field
                                         as={Input}
                                         name={`variants.${index}.value`}
                                         placeholder="Large"
                                         className={errors.variants?.[index] && typeof errors.variants[index] === 'object' && (errors.variants[index] as any)?.value && touched.variants?.[index] && typeof touched.variants[index] === 'object' && (touched.variants[index] as any)?.value ? 'border-red-500' : ''}
                                       />
                                       <ErrorMessage name={`variants.${index}.value`} component="p" className="text-red-500 text-sm mt-1" />
                                    </div>
                                    <div>
                                      <Label>Price</Label>
                                      <Field
                                         as={Input}
                                         type="number"
                                         name={`variants.${index}.price`}
                                         placeholder="0.00"
                                         className={errors.variants?.[index] && typeof errors.variants[index] === 'object' && (errors.variants[index] as any)?.price && touched.variants?.[index] && typeof touched.variants[index] === 'object' && (touched.variants[index] as any)?.price ? 'border-red-500' : ''}
                                       />
                                       <ErrorMessage name={`variants.${index}.price`} component="p" className="text-red-500 text-sm mt-1" />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                      <Label>SKU</Label>
                                      <Field
                                        as={Input}
                                        name={`variants.${index}.sku`}
                                        placeholder="PROD-001-L"
                                      />
                                    </div>
                                    <div>
                                      <Label>Quantity</Label>
                                      <Field
                                         as={Input}
                                         type="number"
                                         name={`variants.${index}.quantity`}
                                         placeholder="0"
                                         className={errors.variants?.[index] && typeof errors.variants[index] === 'object' && (errors.variants[index] as any)?.quantity && touched.variants?.[index] && typeof touched.variants[index] === 'object' && (touched.variants[index] as any)?.quantity ? 'border-red-500' : ''}
                                       />
                                       <ErrorMessage name={`variants.${index}.quantity`} component="p" className="text-red-500 text-sm mt-1" />
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Variant Image</Label>
                                    <FileUpload
                                      onUpload={(url) => setFieldValue(`variants.${index}.image`, url)}
                                      accept="image/*"
                                      maxSize={5 * 1024 * 1024}
                                    />
                                    {variant.image && (
                                      <div className="mt-2 relative inline-block">
                                        <img
                                          src={variant.image}
                                          alt={`${variant.name} ${variant.value}`}
                                          className="w-20 h-20 object-cover rounded-lg"
                                        />
                                        <Button
                                          type="button"
                                          variant="destructive"
                                          size="sm"
                                          className="absolute -top-2 -right-2 w-6 h-6 p-0"
                                          onClick={() => setFieldValue(`variants.${index}.image`, '')}
                                        >
                                          <X size={12} />
                                        </Button>
                                      </div>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Upload a specific image for this size/variant
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </FieldArray>
                  </CardContent>
                </Card>

                {/* SEO */}
                <Card>
                  <CardHeader>
                    <CardTitle>SEO & Meta</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="metaTitle">Meta Title</Label>
                      <Field
                        as={Input}
                        id="metaTitle"
                        name="metaTitle"
                        placeholder="SEO title"
                      />
                    </div>

                    <div>
                      <Label htmlFor="metaDescription">Meta Description</Label>
                      <Field
                        as={Textarea}
                        id="metaDescription"
                        name="metaDescription"
                        placeholder="SEO description"
                        rows={3}
                      />
                    </div>

                                         <div>
                       <Label>SEO Keywords</Label>
                       <div className="flex space-x-2">
                         <Input
                           value={keywordInput}
                           onChange={(e) => setKeywordInput(e.target.value)}
                           placeholder="Add keyword"
                           onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword(setFieldValue))}
                         />
                         <Button type="button" onClick={() => handleAddKeyword(setFieldValue)}>Add</Button>
                       </div>
                       <div className="flex flex-wrap gap-2 mt-2">
                         {seoKeywords.map((keyword, index) => (
                           <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveKeyword(index, setFieldValue)}>
                             {keyword} <X size={12} className="ml-1" />
                           </Badge>
                         ))}
                       </div>
                     </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Save Button */}
                <Card>
                  <CardContent className="pt-6">
                    <Button type="submit" disabled={loading || isSubmitting} className="w-full">
                      <Save size={16} className="mr-2" />
                      {loading ? 'Saving...' : 'Save Product'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Field
                        as={Switch}
                        id="isActive"
                        name="isActive"
                        checked={values.isActive}
                        onCheckedChange={(checked: boolean) => setFieldValue('isActive', checked)}
                      />
                      <Label htmlFor="isActive">Active</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Field
                        as={Switch}
                        id="isFeatured"
                        name="isFeatured"
                        checked={values.isFeatured}
                        onCheckedChange={(checked: boolean) => setFieldValue('isFeatured', checked)}
                      />
                      <Label htmlFor="isFeatured">Featured</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Field
                        as={Switch}
                        id="isNewArrival"
                        name="isNewArrival"
                        checked={values.isNewArrival}
                        onCheckedChange={(checked: boolean) => setFieldValue('isNewArrival', checked)}
                      />
                      <Label htmlFor="isNewArrival">New Arrival</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Field
                        as={Switch}
                        id="isLimitedEdition"
                        name="isLimitedEdition"
                        checked={values.isLimitedEdition}
                        onCheckedChange={(checked: boolean) => setFieldValue('isLimitedEdition', checked)}
                      />
                      <Label htmlFor="isLimitedEdition">Limited Edition</Label>
                    </div>
                  </CardContent>
                </Card>

                {/* Category */}
                <Card>
                  <CardHeader>
                    <CardTitle>Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Field name="category">
                      {({ field }: any) => (
                        <Select value={field.value} onValueChange={(val) => setFieldValue('category', val)}>
                          <SelectTrigger className={errors.category && touched.category ? 'border-red-500' : ''}>
                            <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select category"} />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category._id} value={category._id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </Field>
                    <ErrorMessage name="category" component="p" className="text-red-500 text-sm mt-1" />
                  </CardContent>
                </Card>

                {/* Tags */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tags</CardTitle>
                  </CardHeader>
                                     <CardContent className="space-y-4">
                     <div className="flex space-x-2">
                       <Input
                         value={tagInput}
                         onChange={(e) => setTagInput(e.target.value)}
                         placeholder="Add tag"
                         onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag(setFieldValue))}
                       />
                       <Button type="button" onClick={() => handleAddTag(setFieldValue)}>Add</Button>
                     </div>
                     <div className="flex flex-wrap gap-2">
                       {tags.map((tag, index) => (
                         <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(index, setFieldValue)}>
                           {tag} <X size={12} className="ml-1" />
                         </Badge>
                       ))}
                     </div>
                   </CardContent>
                </Card>

                {/* Product Size */}

                <Card>
                  <CardHeader>
                    <CardTitle>Product Size</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex space-x-2">
                      <Input
                        value={productSizeInput}
                        onChange={(e) => setProductSizeInput(e.target.value)}
                        placeholder="Add product size"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddProductSize(setFieldValue))}
                      />
                      <Button type="button" onClick={() => handleAddProductSize(setFieldValue)}>Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {productSize.map((size, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveProductSize(index, setFieldValue)}>
                          {size} <X size={12} className="ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping */}
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping & Dimensions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Field
                        as={Input}
                        id="weight"
                        name="weight"
                        type="number"
                        placeholder="0.0"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor="length">Length</Label>
                        <Field
                          as={Input}
                          id="length"
                          name="dimensions.length"
                          type="number"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="width">Width</Label>
                        <Field
                          as={Input}
                          id="width"
                          name="dimensions.width"
                          type="number"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="height">Height</Label>
                        <Field
                          as={Input}
                          id="height"
                          name="dimensions.height"
                          type="number"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="shippingCost">Shipping Cost</Label>
                      <Field
                        as={Input}
                        id="shippingCost"
                        name="shippingCost"
                        type="number"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="taxRate">Tax Rate (%)</Label>
                      <Field
                        as={Input}
                        id="taxRate"
                        name="taxRate"
                        type="number"
                        placeholder="0"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Size Image */}
                <Card>
                  <CardHeader>
                    <CardTitle>Size Reference Image</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Size Image</Label>
                      <FileUpload
                        onUpload={(url) => handleSizeImageUpload(url, setFieldValue)}
                        accept="image/*"
                        maxSize={5 * 1024 * 1024}
                      />
                      {values.sizeImage && (
                        <div className="mt-2 relative inline-block">
                          <img
                            src={values.sizeImage}
                            alt="Size reference"
                            className="w-32 h-32 object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 w-6 h-6 p-0"
                            onClick={() => handleSizeImageUpload('', setFieldValue)}
                          >
                            <X size={12} />
                          </Button>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Upload a size reference image to help customers understand product sizing
                      </p>
                    </div>
                  </CardContent>
                </Card>
               </div>
             </Form>
           );
         }}
        </Formik>
      </div>
    </AdminLayout>
  );
}