'use client';

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { addToCart } from '@/lib/store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '@/lib/store/slices/wishlistSlice';
import { RootState } from '@/lib/store/store';
import { formatBDTCurrency, formatDhakaDate } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Facebook,
  FileText,
  Heart,
  MessageCircle,
  Minus,
  Package,
  Play,
  Plus,
  RotateCcw,
  Ruler,
  Search,
  Share2,
  Shield,
  ShoppingCart,
  Star,
  ThumbsDown,
  ThumbsUp,
  Truck,
  Video
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  comparePrice?: number;
  thumbnailImage: string;
  images: string[];
  videoLinks?: string[];
  sizeImage?: string;
  category: {
    _id: string;
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
  quantity: number;
  sku: string;
  tags: string[];
  productSize?: string[];
  averageRating: number;
  totalReviews: number;
  totalSales: number;
  isActive: boolean;
  isFeatured: boolean;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  reviews: Array<{
    _id: string;
    user: {
      _id: string;
      firstName: string;
      lastName: string;
    };
    rating: number;
    comment: string;
    verified: boolean;
    helpful: number;
    createdAt: string;
    userPurchased?: boolean;
  }>;
}

interface RelatedProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  thumbnailImage: string;
  averageRating: number;
  totalReviews: number;
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewFilter, setReviewFilter] = useState('all');
  const [showVideos, setShowVideos] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isSwiping = useRef(false);
  const SWIPE_THRESHOLD = 40;

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    isSwiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartX.current;
    const dy = touch.clientY - touchStartY.current;
    if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
      isSwiping.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartX.current;
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      if (dx < 0) {
        // swipe left -> next
        setSelectedImage(prev => Math.min(galleryImages.length - 1, prev + 1));
      } else {
        // swipe right -> prev
        setSelectedImage(prev => Math.max(0, prev - 1));
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
    // keep isSwiping flag for click suppression
  };

  useEffect(() => {
    if (params.slug) {
      fetchProduct();
    }
  }, [params.slug]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.slug}`);
      const data = await response.json();
      
      if (response.ok) {
        setProduct(data.product);
        setRelatedProducts(data.relatedProducts || []);
      } else {
        router.push('/products');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    const variants = Object.entries(selectedVariants)
      .map(([key, value]) => `${key}: ${value}`);
    
    if (selectedSize) {
      variants.push(`Size: ${selectedSize}`);
    }

    const variantString = variants.join(', ');

    dispatch(addToCart({
      id: product._id,
      name: product.name,
      price: getSelectedPrice(),
      quantity,
      image: galleryImages[selectedImage] || product.thumbnailImage,
      variant: variantString || undefined,
      maxQuantity: getAvailableStock()
    }));
  };

  const handleWishlistToggle = () => {
    if (!product) return;

    const isInWishlist = wishlistItems.some(item => item.id === product._id);
    
    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id));
    } else {
      dispatch(addToWishlist({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.thumbnailImage,
        comparePrice: product.comparePrice,
        inStock: product.quantity > 0
      }));
    }
  };

  const getSelectedPrice = () => {
    if (!product) return 0;
    
    // Check if any variant has a different price
    const variantWithPrice = product.variants?.find(variant => 
      selectedVariants[variant.name] === variant.value && variant.price
    );
    
    return variantWithPrice?.price || product.price;
  };

  const getAvailableStock = () => {
    if (!product) return 0;
    
    // Check if any variant has specific quantity
    const variantWithQuantity = product.variants?.find(variant => 
      selectedVariants[variant.name] === variant.value && variant.quantity !== undefined
    );
    
    return variantWithQuantity?.quantity ?? product.quantity;
  };

  const handleImageHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  // Render product description without raw HTML tags, preserving entities
  const cleanHtml = (html: string): string => {
    if (!html) return '';
    // Avoid server/client branching; consistently strip tags using regex
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  };

  const submitReview = async () => {
    if (!product || !session) return;

    setSubmittingReview(true);
    try {
      const response = await fetch(`/api/products/${product.slug}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      });

      if (response.ok) {
        setReviewDialogOpen(false);
        setNewReview({ rating: 5, comment: '' });
        fetchProduct(); // Refresh to show new review
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatPrice = (price: number) => formatBDTCurrency(price);

  const getDiscountPercentage = () => {
    if (!product?.comparePrice) return 0;
    return Math.round(((product.comparePrice - getSelectedPrice()) / product.comparePrice) * 100);
  };

  const canWriteReview = () => {
    if (!session || !product) return false;
    
    // Check if user has already reviewed this product
    const hasReviewed = product.reviews.some(review => 
      review.user._id === session.user.id
    );
    
    if (hasReviewed) return false;
    
    // Check if user has purchased this product (simplified check - in real app you'd check orders)
    // For now, we'll allow if user is logged in
    return true;
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = product?.name || 'Check out this product';
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast({
          title: "Link copied!",
          description: "Product link has been copied to your clipboard.",
        });
        break;
    }
  };

  const convertVideoUrl = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/');
    }
    if (url.includes('vimeo.com')) {
      return url.replace('vimeo.com/', 'player.vimeo.com/video/');
    }
    return url;
  };

  const filteredReviews = product?.reviews.filter(review => {
    if (reviewFilter === 'all') return true;
    if (reviewFilter === 'verified') return review.verified;
    return review.rating === parseInt(reviewFilter);
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="animate-pulse">
              <div className="bg-gray-200 h-96 rounded-lg mb-4"></div>
              <div className="flex space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-200 h-20 w-20 rounded-lg"></div>
                ))}
              </div>
            </div>
            <div className="animate-pulse space-y-4">
              <div className="bg-gray-200 h-8 rounded w-3/4"></div>
              <div className="bg-gray-200 h-6 rounded w-1/2"></div>
              <div className="bg-gray-200 h-4 rounded w-full"></div>
              <div className="bg-gray-200 h-4 rounded w-full"></div>
              <div className="bg-gray-200 h-12 rounded w-full"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 mt-20">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isInWishlist = wishlistItems.some(item => item.id === product._id);
  const availableStock = getAvailableStock();
  const selectedPrice = getSelectedPrice();
  const galleryImages = [product.thumbnailImage, ...product.images.filter(img => img !== product.thumbnailImage)];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 mt-16 sm:mt-18 md:mt-20">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 text-sm text-muted-foreground mb-6"
        >
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary">Products</Link>
          <span>/</span>
          <Link href={`/categories/${product.category.slug}`} className="hover:text-primary">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {/* Desktop: Vertical Thumbs + Main Image */}
            <div className="hidden lg:grid lg:grid-cols-12 lg:gap-4">
              {/* Vertical thumbnails */}
              {galleryImages.length > 1 && (
                <div className="lg:col-span-2 max-h-[500px] overflow-y-auto pr-1">
                  <div className="flex lg:flex-col gap-2">
                    {galleryImages.map((image, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedImage(index)}
                        className={`relative w-20 h-20 rounded-xl overflow-hidden border-3 transition-all duration-300 ${
                          selectedImage === index 
                            ? 'border-primary shadow-lg shadow-primary/25' 
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }`}
                        aria-label={`Show image ${index + 1}`}
                      >
                        <img src={image} alt={`${product.name} ${index + 1}`} loading="lazy" className="w-full h-full object-cover" />
                        {selectedImage === index && (
                          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                            <div className="w-3 h-3 bg-primary rounded-full"></div>
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Image with smooth magnify */}
              <div className="lg:col-span-10 relative group">
                <div
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 cursor-zoom-in shadow-2xl border border-gray-200/50"
                  onMouseEnter={() => setIsZooming(true)}
                  onMouseLeave={() => setIsZooming(false)}
                  onMouseMove={handleImageHover}
                  onClick={() => setIsLightboxOpen(true)}
                >
                  <img
                    src={galleryImages[selectedImage] || product.thumbnailImage}
                    alt={product.name}
                    className="w-full h-[500px] object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
                    style={{
                      transform: isZooming ? 'scale(2.05)' : 'scale(1)',
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                    }}
                  />

                  {/* Subtle vignette while zooming */}
                  <div
                    className={`pointer-events-none absolute inset-0 transition-opacity duration-500 bg-gradient-to-t from-black/10 via-transparent to-black/10 ${
                      isZooming ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  {/* Zoom/Expand Icon */}
                  <div className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Search size={16} />
                  </div>

                  {/* Navigation Arrows */}
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

                {/* Discount Badge */}
                {product.comparePrice && (
                  <Badge className="absolute top-4 left-4 bg-red-500 text-white shadow">
                    {getDiscountPercentage()}% OFF
                  </Badge>
                )}
              </div>
            </div>

            {/* Mobile/Tablet: Main image + horizontal thumbnails */}
            <div className="lg:hidden">
              <div
                className="relative overflow-hidden rounded-xl bg-gray-100 cursor-zoom-in group"
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
                onMouseMove={handleImageHover}
                onClick={() => { if (!isSwiping.current) setIsLightboxOpen(true); isSwiping.current = false; }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  src={galleryImages[selectedImage] || product.thumbnailImage}
                  alt={product.name}
                  className="w-full h-64 sm:h-80 md:h-96 object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{
                    transform: isZooming ? 'scale(2.05)' : 'scale(1)',
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                  }}
                />

                {/* Discount Badge */}
                {product.comparePrice && (
                  <Badge className="absolute top-3 left-3 bg-red-500 text-white shadow text-xs sm:text-sm">
                    {getDiscountPercentage()}% OFF
                  </Badge>
                )}

                <div className="absolute top-3 right-3 bg-black/60 text-white p-2 rounded-full">
                  <Search size={16} />
                </div>

                {/* Mobile Navigation Arrows */}
                {galleryImages.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 opacity-70 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(Math.max(0, selectedImage - 1));
                      }}
                      disabled={selectedImage === 0}
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 opacity-70 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(Math.min(galleryImages.length - 1, selectedImage + 1));
                      }}
                      disabled={selectedImage === galleryImages.length - 1}
                      aria-label="Next image"
                    >
                      <ChevronRight size={18} />
                    </Button>
                  </>
                )}

                {/* Image indicator dots for mobile */}
                {galleryImages.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1">
                    {galleryImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage(index);
                        }}
                        className={`w-2 h-2 rounded-full transition-all ${
                          selectedImage === index ? 'bg-white' : 'bg-white/50'
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {galleryImages.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2 mt-3 scrollbar-hide snap-x snap-mandatory overscroll-x-contain">
                  {galleryImages.map((image, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedImage(index)}
                      className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all duration-300 snap-start ${
                        selectedImage === index 
                          ? 'border-primary shadow-lg shadow-primary/25' 
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                      aria-label={`Show image ${index + 1}`}
                    >
                      <img src={image} alt={`${product.name} ${index + 1}`} loading="lazy" className="w-full h-full object-cover" />
                      {selectedImage === index && (
                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Lightbox Dialog */}
            <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
              <DialogContent className="max-w-5xl p-0 overflow-hidden bg-white">
                <DialogHeader>
                  <DialogTitle className="sr-only">{product.name} image preview</DialogTitle>
                </DialogHeader>
                <div className="relative bg-black">
                  <img
                    src={galleryImages[selectedImage] || product.thumbnailImage}
                    alt={product.name}
                    className="w-full max-h-[80vh] object-contain bg-black"
                  />
                  {galleryImages.length > 1 && (
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
                        onClick={() => setSelectedImage(Math.min(galleryImages.length - 1, selectedImage + 1))}
                        disabled={selectedImage === galleryImages.length - 1}
                        aria-label="Next image"
                      >
                        <ChevronRight />
                      </Button>
                    </>
                  )}
                </div>
                {galleryImages.length > 1 && (
                  <div className="flex gap-2 p-3 bg-background">
                    {galleryImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`w-16 h-16 rounded-md overflow-hidden border ${
                          selectedImage === index ? 'border-primary' : 'border-transparent'
                        }`}
                        aria-label={`Select image ${index + 1}`}
                      >
                        <img src={image} alt={`${product.name} ${index + 1}`} loading="lazy" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* Product Title & Rating */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline">{product.category.name}</Badge>
                {product.isFeatured && (
                  <Badge variant="secondary">Featured</Badge>
                )}
              </div>
              
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={`sm:w-[18px] sm:h-[18px] ${
                        i < Math.floor(product.averageRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">
                    {product.averageRating.toFixed(1)} ({product.totalReviews} reviews)
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.totalSales} sold
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <span className="text-2xl sm:text-3xl font-bold text-primary">
                  {formatPrice(selectedPrice)}
                </span>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {product.comparePrice && (
                    <span className="text-lg sm:text-xl text-muted-foreground line-through">
                      {formatPrice(product.comparePrice)}
                    </span>
                  )}
                  {product.comparePrice && (
                    <Badge className="bg-red-500 text-white text-xs sm:text-sm">
                      Save {formatPrice(product.comparePrice - selectedPrice)}
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                SKU: {product.sku} | {availableStock} in stock
              </p>
            </div>

            {/* Description */}
            <div>
              <p className="text-muted-foreground leading-relaxed">
                {cleanHtml(product.shortDescription || product.description)}
              </p>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4">
                {Object.entries(
                  product.variants.reduce((acc, variant) => {
                    if (!acc[variant.name]) acc[variant.name] = [];
                    acc[variant.name].push(variant);
                    return acc;
                  }, {} as Record<string, typeof product.variants>)
                ).map(([variantName, options]) => (
                  <div key={variantName}>
                    <Label className="text-sm font-medium mb-2 block">
                      {variantName}: {selectedVariants[variantName] || 'Select'}
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {options.map((option) => (
                        <Button
                          key={option.value}
                          variant={selectedVariants[variantName] === option.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setSelectedVariants(prev => ({
                              ...prev,
                              [variantName]: option.value
                            }));
                            // Update selected image if variant has one
                            if (option.image) {
                              const variantImageIndex = galleryImages.findIndex(img => img === option.image);
                              if (variantImageIndex !== -1) {
                                setSelectedImage(variantImageIndex);
                              }
                            }
                          }}
                          className="min-w-[80px] flex flex-col items-center gap-2 h-auto py-3 px-4 transition-all duration-200 hover:shadow-md hover:scale-105 border-2 hover:border-primary/20"
                        >
                          {option.image && (
                            <div className="w-12 h-12 overflow-hidden rounded-full border-2 border-gray-200">
                              <img 
                                src={option.image} 
                                alt={option.value}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <span className="font-medium text-sm">{option.value}</span>
                          {option.price && option.price !== product.price && (
                            <span className="text-xs text-primary font-semibold">
                              +{formatPrice(option.price - product.price)}
                            </span>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Product Sizes */}
            {product.productSize && product.productSize.length > 0 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Size: {selectedSize || 'Select a size'}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {product.productSize.map((size) => (
                      <Button
                        key={size}
                        variant={selectedSize === size ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedSize(size)}
                        className="min-w-[60px] h-12 transition-all duration-200 hover:shadow-md hover:scale-105 border-2 hover:border-primary/20"
                      >
                        <span className="font-medium">{size}</span>
                      </Button>
                    ))}
                  </div>
                  {selectedSize && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Selected size: <span className="font-medium text-foreground">{selectedSize}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center border rounded-lg w-fit">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="px-3 h-10"
                  >
                    <Minus size={16} />
                  </Button>
                  <span className="px-4 py-2 font-medium min-w-[60px] text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                    disabled={quantity >= availableStock}
                    className="px-3 h-10"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {availableStock} available
                </span>
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1"
                >
                  <Button
                    onClick={handleAddToCart}
                    disabled={availableStock === 0}
                    className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <ShoppingCart size={18} className="mr-2 sm:mr-3" />
                    {availableStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                </motion.div>
                
                {/* Mobile: Row of action buttons */}
                <div className="flex space-x-2 sm:hidden">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      onClick={handleWishlistToggle}
                      className={`h-12 px-3 border-2 transition-all duration-300 ${
                        isInWishlist 
                          ? 'border-red-200 bg-red-50 hover:bg-red-100' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Heart 
                        size={18} 
                        className={`transition-colors duration-300 ${
                          isInWishlist ? 'fill-current text-red-500' : 'text-gray-400 hover:text-red-400'
                        }`} 
                      />
                    </Button>
                  </motion.div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button variant="outline" className="h-12 px-3 border-2 hover:border-gray-300 transition-all duration-300">
                          <Share2 size={18} />
                        </Button>
                      </motion.div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleShare('facebook')}>
                        <Facebook size={16} className="mr-2" />
                        Share on Facebook
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
                        <MessageCircle size={16} className="mr-2" />
                        Share on WhatsApp
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShare('copy')}>
                        <Copy size={16} className="mr-2" />
                        Copy Link
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Size Chart Button - Mobile */}
                  {product.sizeImage && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="outline"
                            className="h-12 px-3 border-2 hover:border-gray-300 transition-all duration-300"
                          >
                            <Ruler size={18} />
                          </Button>
                        </motion.div>
                      </DialogTrigger>
                      <DialogContent className="max-w-[90vw] sm:max-w-4xl bg-white">
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
                </div>

                {/* Desktop: Horizontal action buttons */}
                <div className="hidden sm:flex sm:space-x-3">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      onClick={handleWishlistToggle}
                      className={`h-14 px-4 border-2 transition-all duration-300 ${
                        isInWishlist 
                          ? 'border-red-200 bg-red-50 hover:bg-red-100' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Heart 
                        size={20} 
                        className={`transition-colors duration-300 ${
                          isInWishlist ? 'fill-current text-red-500' : 'text-gray-400 hover:text-red-400'
                        }`} 
                      />
                    </Button>
                  </motion.div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button variant="outline" className="h-14 px-4 border-2 hover:border-gray-300 transition-all duration-300">
                          <Share2 size={20} />
                        </Button>
                      </motion.div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleShare('facebook')}>
                        <Facebook size={16} className="mr-2" />
                        Share on Facebook
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
                        <MessageCircle size={16} className="mr-2" />
                        Share on WhatsApp
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShare('copy')}>
                        <Copy size={16} className="mr-2" />
                        Copy Link
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Size Chart Button - Desktop */}
                  {product.sizeImage && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="outline"
                            className="h-14 px-4 border-2 hover:border-gray-300 transition-all duration-300"
                          >
                            <Ruler size={20} />
                          </Button>
                        </motion.div>
                      </DialogTrigger>
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
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-4 border-t">
              <div className="flex items-center space-x-2 text-sm">
                <Truck size={16} className="text-green-600 flex-shrink-0" />
                <span>Free shipping over ৳1000</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Shield size={16} className="text-blue-600 flex-shrink-0" />
                <span>1 year warranty</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <RotateCcw size={16} className="text-purple-600 flex-shrink-0" />
                <span>30-day returns</span>
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              {availableStock > 10 ? (
                <>
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="text-sm text-green-600 font-medium">In Stock</span>
                </>
              ) : availableStock > 0 ? (
                <>
                  <AlertCircle size={16} className="text-yellow-600" />
                  <span className="text-sm text-yellow-600 font-medium">
                    Only {availableStock} left in stock
                  </span>
                </>
              ) : (
                <>
                  <Clock size={16} className="text-red-600" />
                  <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Product Details Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 sm:mt-12 md:mt-16"
        >
          <Tabs defaultValue="description" className="w-full">
            <TabsList className={`grid w-full ${product.videoLinks && product.videoLinks.length > 0 ? 'grid-cols-4' : 'grid-cols-3'}`}>
              <TabsTrigger value="description" className="text-xs sm:text-sm">
              <FileText size={14} className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Description </span>
                </TabsTrigger>
              <TabsTrigger value="specifications" className="text-xs sm:text-sm">
                <Package size={14} className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Specifications </span>
                </TabsTrigger>
              {product.videoLinks && product.videoLinks.length > 0 && (
                <TabsTrigger value="videos" className="text-xs sm:text-sm">
                  <Video size={14} className="mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Videos </span>({product.videoLinks.length})
                </TabsTrigger>
              )}
              <TabsTrigger value="reviews" className="text-xs sm:text-sm">
                <MessageCircle size={14} className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Reviews </span>({product.totalReviews})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="prose max-w-none">
                    <p className="text-muted-foreground leading-relaxed">
                      {cleanHtml(product.description)}
                    </p>
                    
                    {product.tags.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-medium mb-3">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {product.tags.map((tag, index) => (
                            <Badge key={index} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Product Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">SKU:</span>
                          <span className="font-medium">{product.sku}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Category:</span>
                          <span className="font-medium">{product.category.name}</span>
                        </div>
                        {product.weight && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Weight:</span>
                            <span className="font-medium">{product.weight} kg</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Availability:</span>
                          <span className="font-medium">
                            {availableStock > 0 ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {product.dimensions && (
                      <div>
                        <h4 className="font-medium mb-3">Dimensions</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Length:</span>
                            <span className="font-medium">{product.dimensions.length} cm</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Width:</span>
                            <span className="font-medium">{product.dimensions.width} cm</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Height:</span>
                            <span className="font-medium">{product.dimensions.height} cm</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Videos Tab */}
            {product.videoLinks && product.videoLinks.length > 0 && (
              <TabsContent value="videos" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Videos</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {product.videoLinks.map((link, index) => (
                        <motion.div 
                          key={index} 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="space-y-3"
                        >
                          <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
                            <iframe
                              src={convertVideoUrl(link)}
                              className="w-full h-full"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              title={`${product.name} - Video ${index + 1}`}
                            />
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                              <div className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full">
                                <Play size={16} />
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground text-center font-medium">
                            Video {index + 1}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                {/* Review Summary */}
                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-primary mb-2">
                          {product.averageRating.toFixed(1)}
                        </div>
                        <div className="flex items-center justify-center space-x-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={20}
                              className={`${
                                i < Math.floor(product.averageRating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Based on {product.totalReviews} reviews
                        </p>
                      </div>

                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const count = product.reviews.filter(r => r.rating === rating).length;
                          const percentage = product.totalReviews > 0 ? (count / product.totalReviews) * 100 : 0;
                          
                          return (
                            <div key={rating} className="flex items-center space-x-2 text-sm">
                              <span className="w-8">{rating}★</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="w-8 text-muted-foreground">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Write Review */}
                {session ? (
                  canWriteReview() ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Write a Review</span>
                          <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                            <DialogTrigger asChild>
                              <Button>
                                <MessageCircle size={16} className="mr-2" />
                                Write Review
                              </Button>
                            </DialogTrigger>
                          <DialogContent className="bg-white">
                            <DialogHeader>
                              <DialogTitle>Write a Review for {product.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium mb-2 block">Rating</Label>
                                <div className="flex space-x-1">
                                  {[1, 2, 3, 4, 5].map((rating) => (
                                    <Button
                                      key={rating}
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setNewReview(prev => ({ ...prev, rating }))}
                                      className="p-1"
                                    >
                                      <Star
                                        size={24}
                                        className={`${
                                          rating <= newReview.rating
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    </Button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <Label htmlFor="comment" className="text-sm font-medium mb-2 block">
                                  Your Review
                                </Label>
                                <Textarea
                                  id="comment"
                                  value={newReview.comment}
                                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                                  placeholder="Share your experience with this product..."
                                  rows={4}
                                />
                              </div>

                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={submitReview} disabled={submittingReview}>
                                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <MessageCircle size={48} className="mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-medium mb-2">You've already reviewed this product</h3>
                        <p className="text-muted-foreground text-sm">
                          Thank you for your feedback! You can only review a product once.
                        </p>
                      </CardContent>
                    </Card>
                  )
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <MessageCircle size={48} className="mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-medium mb-2">Sign in to write a review</h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        Share your experience with this product by signing in first.
                      </p>
                      <Link href="/auth/signin">
                        <Button>Sign In</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}

                {/* Review Filters */}
                <div className="flex items-center space-x-4">
                  <Select value={reviewFilter} onValueChange={setReviewFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Reviews</SelectItem>
                      <SelectItem value="verified">Verified Purchases</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">
                    {filteredReviews.length} reviews
                  </span>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {filteredReviews.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <MessageCircle size={48} className="mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-medium mb-2">No reviews yet</h3>
                        <p className="text-muted-foreground">
                          Be the first to review this product!
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredReviews.map((review) => (
                      <Card key={review._id}>
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <Avatar>
                              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.user.firstName} ${review.user.lastName}`} />
                              <AvatarFallback>
                                {review.user.firstName.charAt(0)}{review.user.lastName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h4 className="font-medium">
                                    {review.user.firstName} {review.user.lastName}
                                  </h4>
                                  <div className="flex items-center space-x-2">
                                    <div className="flex items-center space-x-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          size={14}
                                          className={`${
                                            i < review.rating
                                              ? 'text-yellow-400 fill-current'
                                              : 'text-gray-300'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    {review.verified && (
                                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                        <CheckCircle size={12} className="mr-1" />
                                        Verified Purchase
                                      </Badge>
                                    )}
                                    {review.userPurchased && (
                                      <Badge variant="outline" className="text-xs">
                                        Purchased
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {formatDhakaDate(review.createdAt)}
                                </span>
                              </div>
                              
                              <p className="text-muted-foreground mb-3">
                                {review.comment}
                              </p>
                              
                              <div className="flex items-center space-x-4">
                                <Button variant="ghost" size="sm" className="text-muted-foreground">
                                  <ThumbsUp size={14} className="mr-1" />
                                  Helpful ({review.helpful})
                                </Button>
                                <Button variant="ghost" size="sm" className="text-muted-foreground">
                                  <ThumbsDown size={14} className="mr-1" />
                                  Not Helpful
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 sm:mt-12 md:mt-16"
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {relatedProducts.map((relatedProduct, index) => (
                <motion.div
                  key={relatedProduct._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Link href={`/products/${relatedProduct.slug}`}>
                    <Card className="group cursor-pointer border-0 shadow-md hover:shadow-lg transition-all duration-300">
                      <div className="relative overflow-hidden rounded-t-lg">
                        <img
                          src={relatedProduct.thumbnailImage}
                          alt={relatedProduct.name}
                          className="w-full h-32 sm:h-40 md:h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {relatedProduct.comparePrice && (
                          <Badge className="absolute top-2 right-2 bg-red-500 text-xs">
                            {Math.round(((relatedProduct.comparePrice - relatedProduct.price) / relatedProduct.comparePrice) * 100)}% OFF
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-2 sm:p-3 md:p-4">
                        <div className="flex items-center mb-1 sm:mb-2">
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={10}
                                className={`sm:w-3 sm:h-3 ${
                                  i < Math.floor(relatedProduct.averageRating)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground ml-1">
                            ({relatedProduct.totalReviews})
                          </span>
                        </div>
                        <h3 className="font-medium text-xs sm:text-sm mb-1 sm:mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {relatedProduct.name}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                          <span className="font-bold text-primary text-sm">
                            {formatPrice(relatedProduct.price)}
                          </span>
                          {relatedProduct.comparePrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatPrice(relatedProduct.comparePrice)}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}