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
import ProductCard from '@/components/ui/product-card';
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
  ShoppingBasket,
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
    if (!product?.comparePrice || product.comparePrice <= 0) return 0;
    return Math.round(((product.comparePrice - getSelectedPrice()) / product.comparePrice) * 100);
  };

  const canWriteReview = () => {
    if (!session || !product) return false;
    
    // Check if user has already reviewed this product
    const hasReviewed = product.reviews.some(review => 
      review.user._id === session.user.id
    );
    
    if (hasReviewed) return false;
    
    // In a real application, you would check if the user has purchased this product
    // with verified payment. For now, we'll allow logged-in users to review
    // TODO: Implement proper purchase verification logic
    return true;
  };

  const hasUserPurchased = () => {
    if (!session || !product) return false;
    
    // TODO: Implement actual purchase verification by checking user's orders
    // This should verify that the user has purchased this specific product
    // and the payment has been verified
    return false; // Placeholder - implement actual logic
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
      <div className="min-h-screen bg-white">
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
      <div className="min-h-screen bg-white">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30">
      <Header />
      
      <div className="container mx-auto px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 lg:py-6 mt-16 sm:mt-18 md:mt-20">
        {/* Enhanced Responsive Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl px-3 py-2 mb-4 sm:mb-6 shadow-sm"
        >
          <div className="flex items-center space-x-1 sm:space-x-1.5 md:space-x-2 text-[10px] sm:text-xs md:text-sm text-muted-foreground overflow-x-auto scrollbar-hide">
            <Link 
              href="/" 
              className="hover:text-primary font-medium transition-all duration-200 whitespace-nowrap text-gray-600 hover:text-primary-600 px-1.5 py-1 rounded-md hover:bg-primary/10 text-[10px] sm:text-xs md:text-sm"
            >
              Home
            </Link>
            <span className="text-gray-400 flex-shrink-0 text-[10px] sm:text-xs">/</span>
            <Link 
              href="/products" 
              className="hover:text-primary font-medium transition-all duration-200 whitespace-nowrap text-gray-600 hover:text-primary-600 px-1.5 py-1 rounded-md hover:bg-primary/10 text-[10px] sm:text-xs md:text-sm"
            >
              Products
            </Link>
            <span className="text-gray-400 flex-shrink-0 text-[10px] sm:text-xs">/</span>
            <Link 
              href={`/categories/${product.category.slug}`} 
              className="hover:text-primary font-medium transition-all duration-200 whitespace-nowrap text-gray-600 hover:text-primary-600 px-1.5 py-1 rounded-md hover:bg-primary/10 text-[10px] sm:text-xs md:text-sm max-w-[80px] sm:max-w-[100px] md:max-w-[120px] lg:max-w-none truncate"
            >
              {product.category.name}
            </Link>
            <span className="text-gray-400 flex-shrink-0 text-[10px] sm:text-xs">/</span>
            <span className="text-foreground font-semibold truncate text-[10px] sm:text-xs md:text-sm text-gray-900 max-w-[100px] sm:max-w-[120px] md:max-w-[150px] lg:max-w-none px-1.5 py-1 bg-gray-50 rounded-md">
              {product.name}
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {/* Enhanced Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-3 sm:space-y-4 md:space-y-6"
          >
            {/* Enhanced Desktop: Vertical Thumbs + Main Image */}
            <div className="hidden lg:grid lg:grid-cols-12 lg:gap-6">
              {/* Enhanced Vertical thumbnails */}
              {galleryImages.length > 1 && (
                <div className="lg:col-span-2 max-h-[500px] overflow-y-auto pr-2">
                  <div className="flex lg:flex-col gap-3">
                    {galleryImages.map((image, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedImage(index)}
                        className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 shadow-sm hover:shadow-md ${
                          selectedImage === index 
                            ? 'border-primary shadow-lg shadow-primary/25 bg-primary/5' 
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }`}
                        aria-label={`Show image ${index + 1}`}
                      >
                        <img src={image} alt={`${product.name} ${index + 1}`} loading="lazy" className="w-full h-full object-cover" />
                        {selectedImage === index && (
                          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                            <div className="w-3 h-3 bg-primary rounded-full shadow-sm"></div>
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Main Image with smooth magnify */}
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

                  {/* Enhanced subtle vignette while zooming */}
                  <div
                    className={`pointer-events-none absolute inset-0 transition-opacity duration-500 bg-gradient-to-t from-black/10 via-transparent to-black/10 ${
                      isZooming ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  {/* Enhanced Zoom/Expand Icon */}
                  <div className="absolute top-4 right-4 bg-black/70 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
                    <Search size={18} />
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

                {/* Enhanced Discount Badge */}
                {product?.comparePrice !== 0 && product?.comparePrice !== undefined && product?.comparePrice > 0 && getDiscountPercentage() > 0 && (
                  <Badge className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold px-3 py-1.5 rounded-full shadow-lg text-sm">
                    {getDiscountPercentage()}% OFF
                  </Badge>
                )}
              </div>
            </div>

            {/* Enhanced Mobile/Tablet: Main image + horizontal thumbnails */}
            <div className="lg:hidden">
              <div
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 cursor-zoom-in group shadow-xl border border-gray-200/50"
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

                {/* Enhanced Discount Badge */}
                {product?.comparePrice !== 0 && product?.comparePrice !== undefined && product?.comparePrice && product?.comparePrice > 0 && getDiscountPercentage() > 0 && (
                  <Badge className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold px-3 py-1.5 rounded-full shadow-lg text-xs sm:text-sm">
                    {getDiscountPercentage()}% OFF
                  </Badge>
                )}

                <div className="absolute top-3 right-3 bg-black/70 text-white p-2.5 rounded-full shadow-lg">
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
                <div className="flex space-x-3 overflow-x-auto pb-2 mt-4 scrollbar-hide snap-x snap-mandatory overscroll-x-contain">
                  {galleryImages.map((image, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedImage(index)}
                      className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 snap-start shadow-sm hover:shadow-md ${
                        selectedImage === index 
                          ? 'border-primary shadow-lg shadow-primary/25 bg-primary/5' 
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                      aria-label={`Show image ${index + 1}`}
                    >
                      <img src={image} alt={`${product.name} ${index + 1}`} loading="lazy" className="w-full h-full object-cover" />
                      {selectedImage === index && (
                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                          <div className="w-2 h-2 bg-primary rounded-full shadow-sm"></div>
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
                  <div className="flex gap-2 p-3 bg-white">
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

          {/* Enhanced Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-3 sm:space-y-4 md:space-y-6"
          >
            {/* Enhanced Product Title & Rating */}
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Badge variant="outline" className="text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 sm:py-1.5">
                  {product.category.name}
                </Badge>
                {product.isFeatured && (
                  <Badge variant="secondary" className="text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 sm:py-1.5">
                    Featured
                  </Badge>
                )}
              </div>
              
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={`sm:w-4 sm:h-4 md:w-5 md:h-5 ${
                          i < Math.floor(product.averageRating)
                            ? 'text-yellow-400 fill-current drop-shadow-sm'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm md:text-base text-gray-600 font-semibold ml-1 sm:ml-2">
                    {product.averageRating.toFixed(1)} ({product.totalReviews} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Enhanced Price */}
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  {formatPrice(selectedPrice)}
                </span>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4">
                  {product.comparePrice !== 0 && product.comparePrice !== undefined && product.comparePrice && product.comparePrice > 0 && (
                    <span className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-500 line-through font-semibold">
                      {formatPrice(product.comparePrice)}
                    </span>
                  )}
                  {product.comparePrice !== 0 && product.comparePrice !== undefined && product.comparePrice && product.comparePrice > 0 && (
                    <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg">
                      Save {formatPrice(product.comparePrice - selectedPrice)}
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 font-semibold">
                SKU: {product.sku} | {availableStock} in stock
              </p>
            </div>

            {/* Enhanced Description */}
            <div>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base md:text-lg font-medium">
                {cleanHtml(product.shortDescription || product.description)}
              </p>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3 sm:space-y-4">
                {Object.entries(
                  product.variants.reduce((acc, variant) => {
                    if (!acc[variant.name]) acc[variant.name] = [];
                    acc[variant.name].push(variant);
                    return acc;
                  }, {} as Record<string, typeof product.variants>)
                ).map(([variantName, options]) => (
                  <div key={variantName}>
                    <Label className="text-xs sm:text-sm font-medium mb-2 block">
                      {variantName}: {selectedVariants[variantName] || 'Select'}
                    </Label>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
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
                          className="min-w-[70px] sm:min-w-[80px] flex flex-col items-center gap-1 sm:gap-2 h-auto py-2 sm:py-3 px-2 sm:px-4 transition-all duration-200 hover:shadow-md hover:scale-105 border-2 hover:border-primary/20"
                        >
                          {option.image && (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 overflow-hidden rounded-full border-2 border-gray-200">
                              <img 
                                src={option.image} 
                                alt={option.value}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <span className="font-medium text-xs sm:text-sm">{option.value}</span>
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

            {/* Enhanced Product Sizes */}
            {product.productSize && product.productSize.length > 0 && (
              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                <div>
                  <Label className="text-sm sm:text-base md:text-lg font-bold mb-3 sm:mb-4 block text-gray-900">
                    Size: {selectedSize || 'Select a size'}
                  </Label>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {product.productSize.map((size) => (
                      <Button
                        key={size}
                        variant={selectedSize === size ? "default" : "outline"}
                        size="lg"
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[60px] sm:min-w-[70px] h-12 sm:h-14 transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 font-bold text-sm sm:text-base ${
                          selectedSize === size 
                            ? 'bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white shadow-lg' 
                            : 'hover:border-primary/30 hover:bg-primary/5'
                        }`}
                      >
                        <span className="font-bold">{size}</span>
                      </Button>
                    ))}
                  </div>
                  {selectedSize && (
                    <div className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base text-gray-600 font-semibold">
                      Selected size: <span className="font-bold text-primary">{selectedSize}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Enhanced Quantity & Add to Cart */}
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 md:space-x-6">
                <div className="flex items-center border-2 border-gray-300 rounded-xl w-fit shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="px-3 sm:px-4 h-10 sm:h-12 hover:bg-primary/10 transition-colors text-gray-700 hover:text-primary-600"
                  >
                    <Minus size={16} className="sm:w-5 sm:h-5" />
                  </Button>
                  <span className="px-4 sm:px-6 py-2 sm:py-3 font-bold min-w-[60px] sm:min-w-[80px] text-center text-lg sm:text-xl text-gray-900 bg-gray-50 border-x border-gray-200">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                    disabled={quantity >= availableStock}
                    className="px-3 sm:px-4 h-10 sm:h-12 hover:bg-primary/10 transition-colors text-gray-700 hover:text-primary-600"
                  >
                    <Plus size={16} className="sm:w-5 sm:h-5" />
                  </Button>
                </div>
                <span className="text-xs sm:text-sm md:text-base text-gray-700 font-bold bg-gray-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
                  {availableStock} available
                </span>
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1"
                >
                  <Button
                    onClick={handleAddToCart}
                    disabled={availableStock === 0}
                    size="lg"
                    className="w-full h-12 sm:h-14 md:h-16 text-sm sm:text-base md:text-lg lg:text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl"
                  >
                    <ShoppingBasket size={16} className="mr-2 sm:mr-3" />
                    {availableStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                </motion.div>
                
                {/* Enhanced Mobile: Row of action buttons */}
                <div className="flex space-x-2 sm:hidden">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleWishlistToggle}
                      className={`h-12 px-3 border-2 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md ${
                        isInWishlist 
                          ? 'border-red-200 bg-red-50 hover:bg-red-100' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
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
                        <Button variant="outline" size="lg" className="h-12 px-3 border-2 hover:border-gray-300 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md">
                          <Share2 size={18} />
                        </Button>
                      </motion.div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-xl p-2">
                      <DropdownMenuItem 
                        onClick={() => handleShare('facebook')}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Facebook size={18} className="text-blue-600" />
                        </div>
                        <span className="font-semibold text-gray-700">Share on Facebook</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleShare('whatsapp')}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-green-50 transition-colors cursor-pointer"
                      >
                        <div className="p-2 bg-green-100 rounded-full">
                          <MessageCircle size={18} className="text-green-600" />
                        </div>
                        <span className="font-semibold text-gray-700">Share on WhatsApp</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleShare('copy')}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="p-2 bg-gray-100 rounded-full">
                          <Copy size={18} className="text-gray-600" />
                        </div>
                        <span className="font-semibold text-gray-700">Copy Link</span>
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
                            className="h-12 px-3 border-2 hover:border-gray-300 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md"
                          >
                            <Ruler size={18} />
                          </Button>
                        </motion.div>
                      </DialogTrigger>
                      <DialogContent className="max-w-[90vw] sm:max-w-4xl bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-2xl">
                        <DialogHeader className="pb-4">
                          <DialogTitle className="text-2xl font-bold text-gray-900 text-center">Size Chart</DialogTitle>
                        </DialogHeader>
                        <div className="max-h-[70vh] overflow-auto bg-gray-50 rounded-xl p-4">
                          <img
                            src={product.sizeImage}
                            alt="Size chart"
                            className="w-full h-auto object-contain rounded-lg shadow-lg"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                {/* Enhanced Desktop: Horizontal action buttons */}
                <div className="hidden sm:flex sm:space-x-3 md:space-x-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleWishlistToggle}
                      className={`h-14 md:h-16 px-4 md:px-6 border-2 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md ${
                        isInWishlist 
                          ? 'border-red-200 bg-red-50 hover:bg-red-100' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Heart 
                        size={20} 
                        className={`md:w-5 md:h-5 transition-colors duration-300 ${
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
                        <Button variant="outline" size="lg" className="h-14 md:h-16 px-4 md:px-6 border-2 hover:border-gray-300 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md">
                          <Share2 size={20} className="md:w-5 md:h-5" />
                        </Button>
                      </motion.div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-xl p-2">
                      <DropdownMenuItem 
                        onClick={() => handleShare('facebook')}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Facebook size={18} className="text-blue-600" />
                        </div>
                        <span className="font-semibold text-gray-700">Share on Facebook</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleShare('whatsapp')}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-green-50 transition-colors cursor-pointer"
                      >
                        <div className="p-2 bg-green-100 rounded-full">
                          <MessageCircle size={18} className="text-green-600" />
                        </div>
                        <span className="font-semibold text-gray-700">Share on WhatsApp</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleShare('copy')}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="p-2 bg-gray-100 rounded-full">
                          <Copy size={18} className="text-gray-600" />
                        </div>
                        <span className="font-semibold text-gray-700">Copy Link</span>
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
                            className="h-14 md:h-16 px-4 md:px-6 border-2 hover:border-gray-300 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md"
                          >
                            <Ruler size={20} className="md:w-5 md:h-5" />
                          </Button>
                        </motion.div>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-2xl">
                        <DialogHeader className="pb-4">
                          <DialogTitle className="text-2xl font-bold text-gray-900 text-center">Size Chart</DialogTitle>
                        </DialogHeader>
                        <div className="max-h-[70vh] overflow-auto bg-gray-50 rounded-xl p-4">
                          <img
                            src={product.sizeImage}
                            alt="Size chart"
                            className="w-full h-auto object-contain rounded-lg shadow-lg"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 pt-4 sm:pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm md:text-base">
                <div className="p-1.5 sm:p-2 bg-green-100 rounded-full">
                  <Truck size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-600" />
                </div>
                <span className="font-semibold text-gray-700">Free shipping over ৳ 2000</span>
              </div>
              {/* <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm md:text-base">
                <div className="p-1.5 sm:p-2 bg-blue-100 rounded-full">
                  <Shield size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-600" />
                </div>
                <span className="font-semibold text-gray-700">1 year warranty</span>
              </div> */}
              <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm md:text-base">
                <div className="p-1.5 sm:p-2 bg-purple-100 rounded-full">
                  <RotateCcw size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5 text-purple-600" />
                </div>
                <span className="font-semibold text-gray-700">15-day returns</span>
              </div>
            </div>

            {/* Enhanced Stock Status */}
            <div className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
              {availableStock > 10 ? (
                <>
                  <div className="p-1.5 sm:p-2 bg-green-100 rounded-full">
                    <CheckCircle size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-600" />
                  </div>
                  <span className="text-xs sm:text-sm md:text-base text-green-600 font-bold">In Stock</span>
                </>
              ) : availableStock > 0 ? (
                <>
                  <div className="p-1.5 sm:p-2 bg-yellow-100 rounded-full">
                    <AlertCircle size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5 text-yellow-600" />
                  </div>
                  <span className="text-xs sm:text-sm md:text-base text-yellow-600 font-bold">
                    Only {availableStock} left in stock
                  </span>
                </>
              ) : (
                <>
                  <div className="p-1.5 sm:p-2 bg-red-100 rounded-full">
                    <Clock size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5 text-red-600" />
                  </div>
                  <span className="text-xs sm:text-sm md:text-base text-red-600 font-bold">Out of Stock</span>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Enhanced Product Details Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 sm:mt-12 md:mt-16 lg:mt-20"
        >
          <Tabs defaultValue="description" className="w-full">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-xl p-1 sm:p-2 mb-6 sm:mb-8">
              <TabsList className={`grid w-full h-10 sm:h-12 md:h-16 ${product.videoLinks && product.videoLinks.length > 0 ? 'grid-cols-4' : 'grid-cols-3'} bg-transparent gap-1 sm:gap-2`}>
                <TabsTrigger 
                  value="description" 
                  className="text-xs sm:text-sm md:text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary-600 data-[state=active]:to-secondary-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg sm:rounded-xl transition-all duration-300 hover:bg-primary/10"
                >
                  <FileText size={12} className="sm:w-3 sm:h-3 md:w-4 md:h-4 sm:mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Description</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="specifications" 
                  className="text-xs sm:text-sm md:text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary-600 data-[state=active]:to-secondary-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg sm:rounded-xl transition-all duration-300 hover:bg-primary/10"
                >
                  <Package size={12} className="sm:w-3 sm:h-3 md:w-4 md:h-4 sm:mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Specifications</span>
                </TabsTrigger>
                {product.videoLinks && product.videoLinks.length > 0 && (
                  <TabsTrigger 
                    value="videos" 
                    className="text-xs sm:text-sm md:text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary-600 data-[state=active]:to-secondary-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg sm:rounded-xl transition-all duration-300 hover:bg-primary/10"
                  >
                    <Video size={12} className="sm:w-3 sm:h-3 md:w-4 md:h-4 sm:mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Videos</span>
                    <span className="ml-1 bg-primary/20 text-primary px-1 sm:px-2 py-0.5 rounded-full text-xs font-bold">
                      {product.videoLinks.length}
                    </span>
                  </TabsTrigger>
                )}
                <TabsTrigger 
                  value="reviews" 
                  className="text-xs sm:text-sm md:text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary-600 data-[state=active]:to-secondary-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg sm:rounded-xl transition-all duration-300 hover:bg-primary/10"
                >
                  <MessageCircle size={12} className="sm:w-3 sm:h-3 md:w-4 md:h-4 sm:mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Reviews</span>
                  <span className="ml-1 bg-primary/20 text-primary px-1 sm:px-2 py-0.5 rounded-full text-xs font-bold">
                    {product.totalReviews}
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="description" className="mt-0">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-3 sm:p-4 md:p-6 lg:p-8">
                  <div className="prose max-w-none">
                    <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">Product Description</h3>
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base md:text-lg mb-4 sm:mb-6 md:mb-8">
                      {cleanHtml(product.description)}
                    </p>
                    
                    {product.tags.length > 0 && (
                      <div className="mt-4 sm:mt-6 md:mt-8 pt-3 sm:pt-4 md:pt-6 border-t border-gray-200">
                        <h4 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">Product Tags</h4>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-3">
                          {product.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm font-semibold border-2 hover:bg-primary/10 transition-colors">
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

            <TabsContent value="specifications" className="mt-0">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-3 sm:p-4 md:p-6 lg:p-8">
                  <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8">Product Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                    <div className="bg-gray-50 rounded-xl p-3 sm:p-4 md:p-6">
                      <h4 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 flex items-center">
                        <Package size={16} className="mr-2 sm:mr-3 text-primary-600 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                        Product Details
                      </h4>
                      <div className="space-y-2 sm:space-y-3 md:space-y-4">
                        <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-200">
                          <span className="text-gray-600 font-semibold text-xs sm:text-sm md:text-base">SKU:</span>
                          <span className="font-bold text-gray-900 text-xs sm:text-sm md:text-base">{product.sku}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-200">
                          <span className="text-gray-600 font-semibold text-xs sm:text-sm md:text-base">Category:</span>
                          <span className="font-bold text-gray-900 text-xs sm:text-sm md:text-base">{product.category.name}</span>
                        </div>
                        {product.weight && (
                          <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-200">
                            <span className="text-gray-600 font-semibold text-xs sm:text-sm md:text-base">Weight:</span>
                            <span className="font-bold text-gray-900 text-xs sm:text-sm md:text-base">{product.weight} kg</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center py-2 sm:py-3">
                          <span className="text-gray-600 font-semibold text-xs sm:text-sm md:text-base">Availability:</span>
                          <span className={`font-bold text-xs sm:text-sm md:text-base ${availableStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {availableStock > 0 ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {product.dimensions && (
                      <div className="bg-gray-50 rounded-xl p-3 sm:p-4 md:p-6">
                        <h4 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 flex items-center">
                          <Ruler size={16} className="mr-2 sm:mr-3 text-primary-600 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                          Dimensions
                        </h4>
                        <div className="space-y-2 sm:space-y-3 md:space-y-4">
                          <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-200">
                            <span className="text-gray-600 font-semibold text-xs sm:text-sm md:text-base">Length:</span>
                            <span className="font-bold text-gray-900 text-xs sm:text-sm md:text-base">{product.dimensions.length} cm</span>
                          </div>
                          <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-200">
                            <span className="text-gray-600 font-semibold text-xs sm:text-sm md:text-base">Width:</span>
                            <span className="font-bold text-gray-900 text-xs sm:text-sm md:text-base">{product.dimensions.width} cm</span>
                          </div>
                          <div className="flex justify-between items-center py-2 sm:py-3">
                            <span className="text-gray-600 font-semibold text-xs sm:text-sm md:text-base">Height:</span>
                            <span className="font-bold text-gray-900 text-xs sm:text-sm md:text-base">{product.dimensions.height} cm</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Enhanced Videos Tab */}
            {product.videoLinks && product.videoLinks.length > 0 && (
              <TabsContent value="videos" className="mt-0">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-3 sm:pb-4 md:pb-6">
                    <CardTitle className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 flex items-center">
                      <Video size={18} className="mr-2 sm:mr-3 text-primary-600 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                      Product Videos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 md:p-6 lg:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                      {product.videoLinks.map((link, index) => (
                        <motion.div 
                          key={index} 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="space-y-2 sm:space-y-3 md:space-y-4"
                        >
                          <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 group">
                            <iframe
                              src={convertVideoUrl(link)}
                              className="w-full h-full"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              title={`${product.name} - Video ${index + 1}`}
                            />
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                              <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 bg-black/70 text-white p-1.5 sm:p-2 md:p-3 rounded-full shadow-lg">
                                <Play size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                              </div>
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-700 text-center font-bold">
                            Video {index + 1}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <TabsContent value="reviews" className="mt-0">
              <div className="space-y-4 sm:space-y-6 md:space-y-8">
                {/* Enhanced Review Summary */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-3 sm:p-4 md:p-6 lg:p-8">
                    <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 flex items-center">
                      <MessageCircle size={18} className="mr-2 sm:mr-3 text-primary-600 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                      Customer Reviews
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                      <div className="text-center bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
                        <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2 sm:mb-3 md:mb-4">
                          {product.averageRating.toFixed(1)}
                        </div>
                        <div className="flex items-center justify-center space-x-1 mb-2 sm:mb-3 md:mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={`sm:w-4 sm:h-4 md:w-5 md:h-5 ${
                                i < Math.floor(product.averageRating)
                                  ? 'text-yellow-400 fill-current drop-shadow-sm'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-700 font-semibold">
                          Based on {product.totalReviews} reviews
                        </p>
                      </div>

                      <div className="space-y-2 sm:space-y-3 md:space-y-4">
                        <h4 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">Rating Breakdown</h4>
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const count = product.reviews.filter(r => r.rating === rating).length;
                          const percentage = product.totalReviews > 0 ? (count / product.totalReviews) * 100 : 0;
                          
                          return (
                            <div key={rating} className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
                              <span className="w-8 sm:w-10 md:w-12 text-xs sm:text-sm md:text-base lg:text-lg font-bold text-gray-700">{rating}★</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-1.5 sm:h-2 md:h-3">
                                <div 
                                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-1.5 sm:h-2 md:h-3 rounded-full transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="w-8 sm:w-10 md:w-12 text-xs sm:text-sm md:text-base lg:text-lg font-bold text-gray-700">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Enhanced Write Review Section */}
                {session ? (
                  canWriteReview() ? (
                    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                      <CardHeader className="pb-3 sm:pb-4 md:pb-6">
                        <CardTitle className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                          <span className="flex items-center">
                            <MessageCircle size={18} className="mr-2 sm:mr-3 text-primary-600 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                            Write a Review
                          </span>
                          <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                            <DialogTrigger asChild>
                              <Button className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm md:text-base font-bold bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 rounded-xl shadow-lg">
                                <MessageCircle size={14} className="mr-1 sm:mr-2 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Write Review</span>
                                <span className="sm:hidden">Review</span>
                              </Button>
                            </DialogTrigger>
                          <DialogContent className="bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-2xl max-w-2xl mx-4">
                            <DialogHeader className="pb-4 sm:pb-6">
                              <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 text-center">
                                Write a Review for {product.name}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 sm:space-y-6">
                              <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                                <Label className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 block">Your Rating</Label>
                                <div className="flex space-x-1 sm:space-x-2 justify-center">
                                  {[1, 2, 3, 4, 5].map((rating) => (
                                    <Button
                                      key={rating}
                                      variant="ghost"
                                      size="lg"
                                      onClick={() => setNewReview(prev => ({ ...prev, rating }))}
                                      className="p-2 sm:p-3 hover:bg-yellow-50 transition-colors"
                                    >
                                      <Star
                                        size={24}
                                        className={`sm:hidden transition-all duration-300 ${
                                          rating <= newReview.rating
                                            ? 'text-yellow-400 fill-current drop-shadow-sm'
                                            : 'text-gray-300 hover:text-yellow-300'
                                        }`}
                                      />
                                      <Star
                                        size={32}
                                        className={`hidden sm:block transition-all duration-300 ${
                                          rating <= newReview.rating
                                            ? 'text-yellow-400 fill-current drop-shadow-sm'
                                            : 'text-gray-300 hover:text-yellow-300'
                                        }`}
                                      />
                                    </Button>
                                  ))}
                                </div>
                                <p className="text-center text-xs sm:text-sm text-gray-600 mt-2">
                                  {newReview.rating === 1 && "Poor"}
                                  {newReview.rating === 2 && "Fair"}
                                  {newReview.rating === 3 && "Good"}
                                  {newReview.rating === 4 && "Very Good"}
                                  {newReview.rating === 5 && "Excellent"}
                                </p>
                              </div>

                              <div>
                                <Label htmlFor="comment" className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 block">
                                  Your Review
                                </Label>
                                <Textarea
                                  id="comment"
                                  value={newReview.comment}
                                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                                  placeholder="Share your experience with this product..."
                                  rows={4}
                                  className="text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:border-primary-500 transition-colors"
                                />
                              </div>

                              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4">
                                <Button 
                                  variant="outline" 
                                  onClick={() => setReviewDialogOpen(false)}
                                  className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold border-2 rounded-xl"
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  onClick={submitReview} 
                                  disabled={submittingReview}
                                  className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-bold bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 rounded-xl shadow-lg"
                                >
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
                    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-8 sm:p-12 text-center">
                        <MessageCircle size={48} className="mx-auto text-gray-400 mb-4 sm:mb-6" />
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">You've already reviewed this product</h3>
                        <p className="text-sm sm:text-base lg:text-lg text-gray-600">
                          Thank you for your feedback! You can only review a product once.
                        </p>
                      </CardContent>
                    </Card>
                  )
                ) : (
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-8 sm:p-12 text-center">
                      <MessageCircle size={48} className="mx-auto text-gray-400 mb-4 sm:mb-6" />
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Sign in to write a review</h3>
                      <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-6 sm:mb-8">
                        Share your experience with this product by signing in first.
                      </p>
                      <Link href="/auth/signin">
                        <Button className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-bold bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 rounded-xl shadow-lg">
                          Sign In
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}

                {/* Enhanced Review Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0 sm:space-x-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                    <Select value={reviewFilter} onValueChange={setReviewFilter}>
                      <SelectTrigger className="w-full sm:w-56 h-10 sm:h-12 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-xl">
                        <SelectItem value="all" className="text-gray-700 hover:bg-primary/10 text-sm sm:text-base">All Reviews</SelectItem>
                        <SelectItem value="verified" className="text-gray-700 hover:bg-primary/10 text-sm sm:text-base">Verified Purchases</SelectItem>
                        <SelectItem value="5" className="text-gray-700 hover:bg-primary/10 text-sm sm:text-base">5 Stars</SelectItem>
                        <SelectItem value="4" className="text-gray-700 hover:bg-primary/10 text-sm sm:text-base">4 Stars</SelectItem>
                        <SelectItem value="3" className="text-gray-700 hover:bg-primary/10 text-sm sm:text-base">3 Stars</SelectItem>
                        <SelectItem value="2" className="text-gray-700 hover:bg-primary/10 text-sm sm:text-base">2 Stars</SelectItem>
                        <SelectItem value="1" className="text-gray-700 hover:bg-primary/10 text-sm sm:text-base">1 Star</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm sm:text-base lg:text-lg text-gray-700 font-semibold bg-gray-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg">
                      {filteredReviews.length} reviews
                    </span>
                  </div>
                </div>

                {/* Enhanced Reviews List */}
                <div className="space-y-4 sm:space-y-6">
                  {filteredReviews.length === 0 ? (
                    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-8 sm:p-12 text-center">
                        <MessageCircle size={48} className="mx-auto text-gray-400 mb-4 sm:mb-6" />
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">No reviews yet</h3>
                        <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-4 sm:mb-6">
                          Be the first to review this product and help other customers!
                        </p>
                        {session ? (
                          <Button 
                            onClick={() => setReviewDialogOpen(true)}
                            className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-bold bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 rounded-xl shadow-lg"
                          >
                            Write First Review
                          </Button>
                        ) : (
                          <Link href="/auth/signin">
                            <Button className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-bold bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 rounded-xl shadow-lg">
                              Sign In to Review
                            </Button>
                          </Link>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    filteredReviews.map((review) => (
                      <Card key={review._id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-4 sm:p-6 lg:p-8">
                          <div className="flex items-start space-x-4 sm:space-x-6">
                            <Avatar className="w-12 h-12 sm:w-16 sm:h-16">
                              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.user.firstName} ${review.user.lastName}`} />
                              <AvatarFallback className="text-sm sm:text-lg font-bold">
                                {review.user.firstName.charAt(0)}{review.user.lastName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                                <div>
                                  <h4 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-1 sm:mb-2">
                                    {review.user.firstName} {review.user.lastName}
                                  </h4>
                                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                                    <div className="flex items-center space-x-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          size={16}
                                          className={`${
                                            i < review.rating
                                              ? 'text-yellow-400 fill-current drop-shadow-sm'
                                              : 'text-gray-300'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {review.verified && (
                                        <Badge variant="secondary" className="text-xs sm:text-sm bg-green-100 text-green-800 px-2 sm:px-3 py-0.5 sm:py-1">
                                          <CheckCircle size={12} className="mr-1" />
                                          <span className="hidden sm:inline">Verified Purchase</span>
                                          <span className="sm:hidden">Verified</span>
                                        </Badge>
                                      )}
                                      {review.userPurchased && (
                                        <Badge variant="outline" className="text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1">
                                          Purchased
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <span className="text-xs sm:text-sm text-gray-600 font-semibold">
                                  {formatDhakaDate(review.createdAt)}
                                </span>
                              </div>
                              
                              <p className="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed mb-4 sm:mb-6">
                                {review.comment}
                              </p>
                              
                              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
                                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600 hover:bg-primary/10 transition-colors text-xs sm:text-sm">
                                  <ThumbsUp size={16} className="mr-1 sm:mr-2" />
                                  Helpful ({review.helpful})
                                </Button>
                                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors text-xs sm:text-sm">
                                  <ThumbsDown size={16} className="mr-1 sm:mr-2" />
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

        {/* Enhanced Related Products */}
        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 sm:mt-16 md:mt-20"
          >
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-gray-900 leading-tight">
                Related Products
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mx-auto"></div>
            </div>
            
            {/* Responsive Grid - 2 columns on mobile, 4 on desktop */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {relatedProducts.map((relatedProduct, index) => (
                <motion.div
                  key={relatedProduct._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ProductCard 
                    product={relatedProduct}
                    variant="default"
                    showQuickActions={true}
                    className="h-full"
                  />
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