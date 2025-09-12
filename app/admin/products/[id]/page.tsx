'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DeleteConfirmationDialog from '@/components/ui/delete-confirmation-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, Edit, Package, Search, Star, Trash2, TrendingUp } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  cost?: number;
  sku: string;
  barcode?: string;
  trackQuantity?: boolean;
  quantity: number;
  lowStockThreshold?: number;
  thumbnailImage: string;
  images: string[];
  videoLinks?: string[];
  sizeImage?: string;
  category: {
    name: string;
    slug: string;
  };
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  shippingCost?: number;
  taxRate?: number;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isLimitedEdition: boolean;
  averageRating: number;
  totalSales: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  productSize?: string[];
  metaTitle?: string;
  metaDescription?: string;
  seoKeywords?: string[];
  variants?: Array<{
    name: string;
    value: string;
    price?: number;
    sku?: string;
    quantity?: number;
    image?: string;
  }>;
}

export default function ProductView() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else {
        console.error('Failed to fetch product');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
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
    return new Date(dateString).toLocaleDateString('en-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEdit = () => {
    router.push(`/admin/products/${params.id}/edit`);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/admin/products/${params.id}`, { method: 'DELETE' });
      if (response.ok) {
        setIsDeleteOpen(false);
        router.push('/admin/products');
      } else {
        console.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImageHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  // Render description without raw HTML tags
  const cleanHtml = (html: string): string => {
    if (!html) return '';
    if (typeof window === 'undefined') {
      return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    const el = document.createElement('div');
    el.innerHTML = html;
    const text = el.textContent || el.innerText || '';
    return text.replace(/\s+/g, ' ').trim();
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

  if (!product) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/admin/products')}>
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
        <Button
              variant="outline"
              onClick={() => router.push('/admin/products')}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
            <div className="flex items-center justify-between">
          <div className="">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-gray-600 mt-1">Product Details</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={handleEdit}>
              <Edit size={16} className="mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setIsDeleteOpen(true)}>
              <Trash2 size={16} className="mr-2" />
              Delete
            </Button>
          </div>
        </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Gallery */}
            <Card>
              <CardHeader>
                <CardTitle>Product Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const galleryImages = [product.thumbnailImage, ...(product.images || []).filter((img) => img !== product.thumbnailImage)];
                  return galleryImages.length > 0 ? (
                  <div className="hidden lg:grid lg:grid-cols-12 lg:gap-4">
                    {/* Vertical thumbnails */}
                    <div className="lg:col-span-2 max-h-[480px] overflow-y-auto pr-1">
                      <div className="flex lg:flex-col gap-2">
                        {galleryImages.map((image, index) => (
                          <motion.button
                            key={index}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setSelectedImage(index)}
                            className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                              selectedImage === index ? 'border-primary' : 'border-gray-200 hover:border-gray-300'
                            }`}
                            aria-label={`Show image ${index + 1}`}
                          >
                            <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Main Image */}
                    <div className="lg:col-span-10 relative group">
                      <div
                        className="relative overflow-hidden rounded-xl bg-gray-100 cursor-zoom-in ring-1 ring-gray-200"
                        onMouseEnter={() => setIsZooming(true)}
                        onMouseLeave={() => setIsZooming(false)}
                        onMouseMove={handleImageHover}
                        onClick={() => setIsLightboxOpen(true)}
                      >
                        <img
                          src={galleryImages[selectedImage] || product.thumbnailImage}
                          alt={product.name}
                          className="w-full h-[480px] object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                          style={{
                            transform: isZooming ? 'scale(2.05)' : 'scale(1)',
                            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                          }}
                        />
                        <div
                          className={`pointer-events-none absolute inset-0 transition-opacity duration-500 bg-gradient-to-t from-black/10 via-transparent to-black/10 ${
                            isZooming ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                        <div className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <Search size={16} />
                        </div>
                        {galleryImages.length > 1 && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(Math.max(0, selectedImage - 1));
                              }}
                              disabled={selectedImage === 0}
                              aria-label="Previous image"
                            >
                              <ChevronLeft size={20} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(Math.min(galleryImages.length - 1, selectedImage + 1));
                              }}
                              disabled={selectedImage === galleryImages.length - 1}
                              aria-label="Next image"
                            >
                              <ChevronRight size={20} />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  ) : (
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package size={48} className="text-gray-400" />
                  </div>
                  );
                })()}

                {/* Mobile thumbnails */}
                {(() => {
                  const galleryImages = [product.thumbnailImage, ...(product.images || []).filter((img) => img !== product.thumbnailImage)];
                  return galleryImages.length > 1 ? (
                  <div className="lg:hidden mt-3 flex gap-2 overflow-x-auto pb-2">
                    {galleryImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                          selectedImage === index ? 'border-primary' : 'border-gray-200'
                        }`}
                        aria-label={`Show image ${index + 1}`}
                      >
                        <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                  ) : null;
                })()}

                {/* Lightbox */}
                <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
                  <DialogContent className="max-w-5xl p-0 overflow-hidden bg-white">
                    <DialogHeader>
                      <DialogTitle className="sr-only">{product.name} image preview</DialogTitle>
                    </DialogHeader>
                    <div className="relative bg-black">
                      <img
                        src={([product.thumbnailImage, ...(product.images || []).filter((img) => img !== product.thumbnailImage)][selectedImage]) || product.thumbnailImage}
                        alt={product.name}
                        className="w-full max-h-[80vh] object-contain bg-black"
                      />
                      {([product.thumbnailImage, ...(product.images || []).filter((img) => img !== product.thumbnailImage)].length > 1) && (
                        <>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute left-3 top-1/2 -translate-y-1/2"
                            onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))}
                            disabled={selectedImage === 0}
                            aria-label="Previous image"
                          >
                            <ChevronLeft />
                          </Button>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                            onClick={() => {
                              const galleryLength = [product.thumbnailImage, ...(product.images || []).filter((img) => img !== product.thumbnailImage)].length;
                              setSelectedImage(Math.min(galleryLength - 1, selectedImage + 1));
                            }}
                            disabled={selectedImage === ([product.thumbnailImage, ...(product.images || []).filter((img) => img !== product.thumbnailImage)].length - 1)}
                            aria-label="Next image"
                          >
                            <ChevronRight />
                          </Button>
                        </>
                      )}
                    </div>
                    {[product.thumbnailImage, ...(product.images || []).filter((img) => img !== product.thumbnailImage)].length > 1 && (
                      <div className="flex gap-2 p-3 bg-white">
                        {[product.thumbnailImage, ...(product.images || []).filter((img) => img !== product.thumbnailImage)].map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`w-16 h-16 rounded-md overflow-hidden border ${
                              selectedImage === index ? 'border-primary' : 'border-transparent'
                            }`}
                            aria-label={`Select image ${index + 1}`}
                          >
                            <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                <DeleteConfirmationDialog
                  open={isDeleteOpen}
                  onOpenChange={setIsDeleteOpen}
                  onConfirm={confirmDelete}
                  title="Delete Product"
                  description="Are you sure you want to delete this product? This action cannot be undone."
                  entityName="product"
                  isLoading={isDeleting}
                />

                {/* Size Chart Dialog */}
                {product.sizeImage && (
                  <Dialog open={isSizeChartOpen} onOpenChange={setIsSizeChartOpen}>
                    <DialogContent className="max-w-4xl bg-white">
                      <DialogHeader>
                        <DialogTitle>Size Chart</DialogTitle>
                      </DialogHeader>
                      <div className="max-h-[70vh] overflow-auto">
                        <img
                          src={product.sizeImage}
                          alt="Size chart"
                          className="w-full h-auto object-contain"
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>

            {/* Product Information */}
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-600">{cleanHtml(product.shortDescription || product.description) || 'No description available.'}</p>
                </div>

                {/* Variants */}
                {product.variants && product.variants.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Variants</h3>
                      {Object.entries(
                        product.variants.reduce((acc, variant) => {
                          if (!acc[variant.name]) acc[variant.name] = [] as typeof product.variants;
                          acc[variant.name].push(variant);
                          return acc;
                        }, {} as Record<string, NonNullable<Product['variants']>>)
                      ).map(([variantName, options]) => (
                        <div key={variantName}>
                          <Label className="text-sm font-medium mb-2 block">{variantName}</Label>
                          <div className="flex flex-wrap gap-3">
                            {options.map((option) => (
                              <div key={`${variantName}-${option.value}`} className="flex items-center gap-2 p-2 border rounded-lg">
                                {option.image && (
                                  <img 
                                    src={option.image} 
                                    alt={option.value}
                                    className="w-10 h-10 rounded object-cover border"
                                  />
                                )}
                                <div className="flex flex-col">
                                  <Badge variant="outline" className="mb-1">
                                    {option.value}
                                  </Badge>
                                  <div className="flex gap-2 text-xs text-muted-foreground">
                                    {typeof option.price === 'number' && (
                                      <span>+{formatPrice(option.price)}</span>
                                    )}
                                    {typeof option.quantity === 'number' && (
                                      <span>qty {option.quantity}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Basic Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">SKU:</span>
                        <span className="font-medium">{product.sku}</span>
                      </div>
                      {product.barcode && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Barcode:</span>
                          <span className="font-medium">{product.barcode}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <Badge variant="outline">{product.category?.name || 'Uncategorized'}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <Badge variant={product.isActive ? "default" : "secondary"}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      {product.isFeatured && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Featured:</span>
                          <Badge variant="outline">Featured</Badge>
                        </div>
                      )}
                      {product.isNewArrival && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">New Arrival:</span>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">New Arrival</Badge>
                        </div>
                      )}
                      {product.isLimitedEdition && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Limited Edition:</span>
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Limited Edition</Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Pricing & Stock</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-medium">{formatPrice(product.price)}</span>
                      </div>
                      {product.comparePrice && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Compare Price:</span>
                          <span className="font-medium line-through text-gray-500">
                            {formatPrice(product.comparePrice)}
                          </span>
                        </div>
                      )}
                      {product.cost && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cost:</span>
                          <span className="font-medium text-green-600">
                            {formatPrice(product.cost)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Stock:</span>
                        <Badge 
                          variant={product.quantity < 10 ? "destructive" : product.quantity < 50 ? "secondary" : "default"}
                        >
                          {product.quantity} units
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {product.weight || product.dimensions && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Physical Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {product.weight && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Weight:</span>
                            <span className="font-medium">{product.weight} kg</span>
                          </div>
                        )}
                        {product.dimensions && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Dimensions:</span>
                            <span className="font-medium">
                              {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} cm
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {product?.tags && product?.tags?.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {product?.productSize && product?.productSize?.length > 0 && (
                  <>
                    <Separator />
                    <div className="flex flex-col sm:flex-row items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Product Size</h3>
                      <div className="flex flex-wrap gap-2">
                        {product.productSize.map((size, index) => (
                          <Badge key={index} variant="secondary">
                            {size}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setIsSizeChartOpen(true)}>Size Chart</Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Product Videos */}
            {product.videoLinks && product.videoLinks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Product Videos ({product.videoLinks.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {product.videoLinks.map((link, index) => (
                      <div key={index} className="space-y-2">
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          <iframe
                            src={link.includes('youtube.com') || link.includes('youtu.be') 
                              ? link.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')
                              : link.includes('vimeo.com') 
                                ? link.replace('vimeo.com/', 'player.vimeo.com/video/')
                                : link
                            }
                            className="w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={`${product.name} - Video ${index + 1}`}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Video {index + 1}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {link}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Size Reference Image */}
            {product.sizeImage && (
              <Card>
                <CardHeader>
                  <CardTitle>Size Reference Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="w-fit">
                      <div 
                        className="relative cursor-pointer group"
                        onClick={() => {
                          const dialog = document.createElement('div');
                          dialog.innerHTML = `
                            <div class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onclick="this.remove()">
                              <div class="relative max-w-4xl max-h-[90vh]">
                                <img src="${product.sizeImage}" alt="Size reference chart" class="max-w-full max-h-full object-contain rounded-lg" />
                                <button onclick="this.closest('.fixed').remove()" class="absolute top-2 right-2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors">
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                  </svg>
                                </button>
                              </div>
                            </div>
                          `;
                          document.body.appendChild(dialog);
                        }}
                      >
                        <img
                          src={product.sizeImage}
                          alt="Size reference"
                          className="w-64 h-64 object-cover rounded-lg border shadow-md group-hover:shadow-lg transition-shadow"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
                          <Search className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Size reference chart to help customers understand product sizing. Click to view full size.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="text-yellow-400" size={16} />
                    <span className="text-sm text-gray-600">Rating</span>
                  </div>
                  <span className="font-medium">{product.averageRating.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="text-green-600" size={16} />
                    <span className="text-sm text-gray-600">Total Sales</span>
                  </div>
                  <span className="font-medium">{product.totalSales}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="text-blue-600" size={16} />
                    <span className="text-sm text-gray-600">Reviews</span>
                  </div>
                  <span className="font-medium">{product.totalReviews}</span>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="text-sm font-medium">{formatDate(product.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="text-sm font-medium">{formatDate(product.updatedAt)}</p>
                </div>
              </CardContent>
            </Card>

            {/* SEO Details */}
            {(product.metaTitle || product.metaDescription || (product.seoKeywords && product.seoKeywords.length > 0)) && (
              <Card>
                <CardHeader>
                  <CardTitle>SEO & Meta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {product.metaTitle && (
                    <div>
                      <p className="text-sm text-gray-600">Meta Title</p>
                      <p className="text-sm font-medium">{product.metaTitle}</p>
                    </div>
                  )}
                  {product.metaDescription && (
                    <div>
                      <p className="text-sm text-gray-600">Meta Description</p>
                      <p className="text-sm font-medium">{product.metaDescription}</p>
                    </div>
                  )}
                  {product.seoKeywords && product.seoKeywords.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">SEO Keywords</p>
                      <div className="flex flex-wrap gap-1">
                        {product.seoKeywords.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 