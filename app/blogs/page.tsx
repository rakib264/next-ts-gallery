'use client';

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock, Eye, Filter, Heart, Search, Star, User, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  publishedAt: string;
  author: {
    firstName: string;
    lastName: string;
  };
  categories: string[];
  tags: string[];
  readTime: number;
  viewCount: number;
  likes: number;
  isFeatured: boolean;
}

interface BlogsResponse {
  blogs: Blog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: {
    categories: string[];
    tags: string[];
  };
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFeatured, setShowFeatured] = useState(false);
  const [sortBy, setSortBy] = useState('publishedAt');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });
  const [allCategories, setAllCategories] = useState<string[]>([]);
  
  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        search: debouncedSearchQuery,
        category: selectedCategories.join(','),
        featured: showFeatured.toString(),
        sortBy,
        sortOrder: 'desc',
      });

      const response = await fetch(`/api/blogs?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data: BlogsResponse = await response.json();
      
      setBlogs(data.blogs || []);
      setPagination(data.pagination || { page: 1, limit: 12, total: 0, pages: 0 });
      
      // Set all categories from response
      if (data.filters?.categories) {
        setAllCategories(data.filters.categories);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch blogs');
      setBlogs([]);
      setPagination({ page: 1, limit: 12, total: 0, pages: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [page, debouncedSearchQuery, selectedCategories, showFeatured, sortBy]);

  useEffect(() => {
    // Reset page when filters change
    setPage(1);
  }, [debouncedSearchQuery, selectedCategories, showFeatured]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setShowFeatured(false);
    setPage(1);
  };

  const clearAll = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setShowFeatured(false);
    setSortBy('publishedAt');
    setPage(1);
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16 md:pt-20 mb-20 md:mb-0">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Our Blog</h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Discover insights, trends, and stories from our community
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side - Blog Posts */}
          <div className="lg:w-80">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-6">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full"
                variant="outline"
              >
                <Filter size={16} className="mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
                {(selectedCategories.length > 0 || showFeatured) && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedCategories.length + (showFeatured ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </div>

            <div className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
              <div className="sticky top-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Filter size={20} />
                        Filters
                      </h3>
                      {(selectedCategories.length > 0 || showFeatured) && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={clearFilters}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Sort Options */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Sort By</h4>
                      <div className="space-y-2">
                        {[
                          { value: 'publishedAt', label: 'Latest' },
                          { value: 'viewCount', label: 'Most Viewed' },
                          { value: 'likes', label: 'Most Liked' },
                          { value: 'title', label: 'Title A-Z' }
                        ].map((option) => (
                          <label key={option.value} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input
                              type="radio"
                              name="sort"
                              value={option.value}
                              checked={sortBy === option.value}
                              onChange={(e) => setSortBy(e.target.value)}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-gray-700">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Categories */}
                    {allCategories.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {allCategories.map((category) => (
                            <label key={category} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                              <Checkbox
                                checked={selectedCategories.includes(category)}
                                onCheckedChange={() => handleCategoryToggle(category)}
                              />
                              <span className="text-gray-700 text-sm">{category}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Active Filters Summary */}
                    {(debouncedSearchQuery || selectedCategories.length > 0 || showFeatured) && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Active Filters</h4>
                        <div className="space-y-2">
                          {debouncedSearchQuery && (
                            <Badge variant="secondary" className="block w-fit">
                              Search: {truncateText(debouncedSearchQuery, 20)}
                            </Badge>
                          )}
                          {showFeatured && (
                            <Badge variant="secondary" className="block w-fit">
                              Featured Posts
                            </Badge>
                          )}
                          {selectedCategories.map((category) => (
                            <Badge key={category} variant="secondary" className="block w-fit">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Right Side - Filter Panel */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-10 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>

            {/* Featured Toggle */}
            <div className="mb-8">
              <div className="flex items-center space-x-4">
                <Button
                  variant={!showFeatured ? "default" : "outline"}
                  onClick={() => setShowFeatured(false)}
                  className="px-6 py-2"
                >
                  All Posts
                </Button>
                <Button
                  variant={showFeatured ? "default" : "outline"}
                  onClick={() => setShowFeatured(true)}
                  className="px-6 py-2 flex items-center gap-2"
                >
                  <Star size={16} />
                  Featured
                </Button>
              </div>
            </div>

            {/* Blog Content */}
            {error ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-500 text-2xl">⚠️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Blogs</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setError(null);
                    fetchBlogs();
                  }}
                >
                  Try Again
                </Button>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                    <div className="bg-gray-300 h-4 rounded mb-2"></div>
                    <div className="bg-gray-300 h-4 rounded mb-2 w-3/4"></div>
                    <div className="bg-gray-300 h-4 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : blogs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {blogs.map((blog, index) => (
                    <motion.div
                      key={blog._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-md">
                        {blog.coverImage && (
                          <div className="relative h-48 overflow-hidden rounded-t-lg">
                            <img 
                              src={blog.coverImage} 
                              alt={blog.title}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                            {blog.isFeatured && (
                              <Badge className="absolute top-4 right-4 bg-yellow-500 hover:bg-yellow-600">
                                <Star size={12} className="mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>
                        )}
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                            <div className="flex items-center space-x-2">
                              <User size={14} />
                              <span>{blog.author.firstName} {blog.author.lastName}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar size={14} />
                              <span>{formatDate(blog.publishedAt)}</span>
                            </div>
                          </div>
                          
                          {blog.categories.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {blog.categories.slice(0, 2).map((category, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {category}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 mb-2">
                            {blog.title}
                          </h3>
                          
                          {blog.excerpt && (
                            <p className="text-gray-600 line-clamp-3 text-sm">
                              {blog.excerpt}
                            </p>
                          )}
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Clock size={14} />
                                <span>{blog.readTime}m</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Eye size={14} />
                                <span>{blog.viewCount}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Heart size={14} />
                                <span>{blog.likes}</span>
                              </div>
                            </div>
                            <Link href={`/blogs/${blog.slug}`}>
                              <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">
                                Read More
                                <ArrowRight size={14} className="ml-1" />
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center mt-12">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      
                      {Array.from({ length: Math.min(5, pagination.pages) }).map((_, idx) => {
                        const pageNum = idx + 1;
                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? 'default' : 'outline'}
                            onClick={() => setPage(pageNum)}
                            className="w-10 h-10 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                      
                      <Button
                        variant="outline"
                        onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                        disabled={page === pagination.pages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No blogs found</h3>
                <p className="text-gray-600 mb-4">
                  {debouncedSearchQuery || selectedCategories.length > 0 || showFeatured
                    ? 'Try adjusting your search criteria'
                    : 'No blog posts have been published yet'}
                </p>
                {(debouncedSearchQuery || selectedCategories.length > 0 || showFeatured) && (
                  <Button variant="outline" onClick={clearAll}>
                    Clear All Filters
                  </Button>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
      </div>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

