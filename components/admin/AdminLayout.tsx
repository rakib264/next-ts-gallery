'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/toaster';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSettings } from '@/hooks/use-settings';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  Bell,
  Calendar,
  ChevronDown,
  Database,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShoppingCart, Tag, Truck,
  User,
  Users,
  X
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const sidebarItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin',
    roles: ['admin', 'manager', 'staff']
  },
  {
    title: 'Products',
    icon: Package,
    href: '/admin/products',
    roles: ['admin', 'manager', 'staff']
  },
  {
    title: 'Categories',
    icon: Tag,
    href: '/admin/categories',
    roles: ['admin', 'manager', 'staff']
  },
  {
    title: 'Orders',
    icon: ShoppingCart,
    href: '/admin/orders',
    roles: ['admin', 'manager', 'staff']
  },
  {
    title: 'Coupons',
    icon: FileText,
    href: '/admin/coupons',
    roles: ['admin', 'manager']
  },
  {
    title: 'Courier',
    icon: Truck,
    href: '/admin/courier',
    roles: ['admin', 'manager', 'staff']
  },
  {
    title: 'Customers',
    icon: Users,
    href: '/admin/customers',
    roles: ['admin', 'manager']
  },
  {
    title: 'Messaging',
    icon: MessageSquare,
    href: '/admin/messaging',
    roles: ['admin', 'manager']
  },
  {
    title: 'Events',
    icon: Calendar,
    href: '/admin/events',
    roles: ['admin', 'manager']
  },

  {
    title: 'Customer Target',
    icon: BarChart3,
    href: '/admin/customer-trends',
    roles: ['admin', 'manager']
  },

  // {
  //   title: 'Customer Target',
  //   icon: BarChart3,
  //   href: '/admin/customer-target',
  //   roles: ['admin', 'manager']
  // },
  {
    title: 'Blogs',
    icon: FileText,
    href: '/admin/blogs',
    roles: ['admin', 'manager']
  },
  {
    title: 'Return & Exchange',
    icon: RefreshCw,
    href: '/admin/returns',
    roles: ['admin', 'manager']
  },
  {
    title: 'Admin Manager',
    icon: User,
    href: '/admin/admin-manager',
    roles: ['admin']
  },
  {
    title: 'Audit Logs',
    icon: Database,
    href: '/admin/audit-logs',
    roles: ['admin']
  },
  {
    title: 'Settings',
    icon: Settings,
    href: '/admin/settings',
    roles: ['admin']
  }
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default to true for desktop
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New order received', time: '2 min ago', unread: true },
    { id: 2, title: 'Low stock alert', time: '1 hour ago', unread: true },
    { id: 3, title: 'Payment failed', time: '3 hours ago', unread: false },
  ]);
  const { settings } = useSettings();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !['admin', 'manager', 'staff'].includes(session.user?.role)) {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  // Handle responsive sidebar state
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width < 768; // md breakpoint
      const tablet = width >= 768 && width < 1024; // lg breakpoint
      
      // console.log('Resize detected:', { width, mobile, tablet });
      
      setIsMobile(mobile);
      setIsTablet(tablet);
      
      if (mobile) {
        // Mobile: sidebar closed by default, use drawer
        setSidebarOpen(false);
        setMobileMenuOpen(false);
      } else if (tablet) {
        // Tablet: sidebar open by default, can be collapsed
        setSidebarOpen(true);
        setMobileMenuOpen(false);
      } else {
        // Desktop: sidebar open by default, can be collapsed
        setSidebarOpen(true);
        setMobileMenuOpen(false);
      }
    };

    // Set initial state
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);



  const filteredSidebarItems = sidebarItems.filter(item => 
    item.roles.includes(session?.user?.role || '')
  );


  const unreadCount = notifications.filter(n => n.unread).length;

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop/Tablet Sidebar */}
      {!isMobile && (
        <motion.aside
          initial={false}
          animate={{
            width: sidebarOpen ? 280 : 80,
          }}
          transition={{ 
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1]
          }}
          className="fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-40 md:relative md:z-auto md:translate-x-0 flex-shrink-0 overflow-hidden"
        >
          {/* Desktop/Tablet Sidebar Content */}
          <div className="flex items-center justify-between p-4 border-b h-16 min-w-0">
            <AnimatePresence mode="wait">
              {sidebarOpen ? (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center space-x-2 min-w-0"
                >
                  <Link href="/" className="flex items-center space-x-2 min-w-0">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-2 min-w-0"
                    >
                      {settings?.logo1 ? (
                        <img
                          src={settings.logo1 ?? '/lib/assets/images/tsrgallery.png'}
                          alt={settings.siteName || process.env.Next_PUBLIC_SITE_NAME}
                          className="h-8 w-auto flex-shrink-0"
                        />
                      ) : (
                        <div className="font-bold text-lg bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent whitespace-nowrap">
                          {settings?.siteName || process.env.Next_PUBLIC_SITE_NAME}
                        </div>
                      )}
                    </motion.div>
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  key="collapsed"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center w-full"
                >
                  <Link href="/" className="flex items-center justify-center">
                    {settings?.logo1 ? (
                      <img
                        src={settings.logo1 ?? '/lib/assets/images/tsrgallery.png'}
                        alt={settings.siteName || process.env.Next_PUBLIC_SITE_NAME}
                        className="h-8 w-8 object-contain"
                      />
                    ) : (
                      <div className="font-bold text-lg bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        SC
                      </div>
                    )}
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Desktop/Tablet Toggle Button */}
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex-shrink-0"
            >
              <Menu size={16} />
            </Button> */}
          </div>

          {/* Desktop/Tablet Navigation */}
          <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
            <TooltipProvider>
              {filteredSidebarItems.map((item) => {
                const isActive = pathname === item.href;
                const navItem = (
                  <motion.div
                    whileHover={{ x: sidebarOpen ? 4 : 0 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      flex items-center px-3 py-3 rounded-lg transition-all duration-200 cursor-pointer
                      ${isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'hover:bg-gray-100 text-gray-700'
                      }
                      ${!sidebarOpen ? 'justify-center' : ''}
                    `}
                  >
                    <item.icon 
                      size={20} 
                      className={`${!sidebarOpen ? 'mx-auto' : ''}`}
                    />
                    <AnimatePresence>
                      {sidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                          animate={{ opacity: 1, width: 'auto', marginLeft: 12 }}
                          exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                          transition={{ duration: 0.2 }}
                          className="font-medium whitespace-nowrap overflow-hidden"
                        >
                          {item.title}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );

                return (
                  <Link key={item.href} href={item.href}>
                    {!sidebarOpen ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          {navItem}
                        </TooltipTrigger>
                        <TooltipContent side="right" className="ml-2">
                          <p>{item.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      navItem
                    )}
                  </Link>
                );
              })}
            </TooltipProvider>
          </nav>

          {/* Desktop/Tablet User Info */}
          <div className="p-4 border-t">
            {!sidebarOpen ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg transition-all duration-200 cursor-pointer">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/placeholder-avatar.jpg" />
                      <AvatarFallback>
                        {session?.user?.name?.charAt(0) || 'A'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-2">
                  <div>
                    <p className="font-medium">{session?.user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{session?.user?.role}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg transition-all duration-200">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback>
                    {session?.user?.name?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
                <motion.div
                  initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                  animate={{ opacity: 1, width: 'auto', marginLeft: 12 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize truncate">
                    {session?.user?.role}
                  </p>
                </motion.div>
              </div>
            )}
          </div>
        </motion.aside>
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <motion.aside
          initial={false}
          animate={{
            transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
          }}
          transition={{ 
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1]
          }}
          className="fixed left-0 top-0 h-full w-full bg-white z-[60] flex-shrink-0 overflow-y-auto"
        >
          {/* Mobile Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b h-16 min-w-0">
            <Link href="/" className="flex items-center space-x-2 min-w-0">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 min-w-0"
              >
                {settings?.logo1 ? (
                  <img
                    src={settings.logo1 ?? '/lib/assets/images/tsrgallery.png'}
                    alt={settings.siteName || process.env.Next_PUBLIC_SITE_NAME}
                    className="h-8 w-auto flex-shrink-0"
                  />
                ) : (
                  <div className="font-bold text-lg bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent whitespace-nowrap">
                    {settings?.siteName || process.env.Next_PUBLIC_SITE_NAME}
                  </div>
                )}
              </motion.div>
            </Link>
            
            {/* Mobile Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-shrink-0"
            >
              <X size={16} />
            </Button>
          </div>

                  {/* Mobile Navigation */}
          <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
            {filteredSidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={() => {
                    // console.log('Mobile navigation item clicked:', item.href);
                    // Close mobile menu when navigation item is clicked
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full"
                >
                  <motion.div
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      flex items-center px-3 py-3 rounded-lg transition-all duration-200 cursor-pointer
                      ${isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'hover:bg-gray-100 text-gray-700'
                      }
                    `}
                  >
                    <item.icon size={20} />
                    <span className="font-medium whitespace-nowrap ml-3">
                      {item.title}
                    </span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Mobile User Info */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>
                  {session?.user?.name?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-gray-500 capitalize truncate">
                  {session?.user?.role}
                </p>
              </div>
            </div>
          </div>
        </motion.aside>
      )}

      {/* Main Content */}
      <div className={`
        flex-1 flex flex-col min-h-screen w-full min-w-0
        transition-all duration-300 ease-in-out
        ${!isMobile && !sidebarOpen ? 'ml-0' : ''}
      `}>
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 py-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // console.log('Mobile menu button clicked!');
                setMobileMenuOpen(true);
              }}
              className="md:hidden flex-shrink-0 z-10 relative"
            >
              <Menu size={20} />
            </Button>
            
            {/* Desktop/Tablet Sidebar Toggle */}
            {!isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden md:flex flex-shrink-0"
              >
                <Menu size={20} />
              </Button>
            )}
            
            <div className="relative flex-1 max-w-sm sm:max-w-md lg:max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full text-sm"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            {/* Quick Actions */}
            <div className="hidden md:flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm">
                    <Plus size={16} className="mr-2" />
                    Quick Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/admin/products/new">
                      <Package size={16} className="mr-2" />
                      Add Product
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/categories">
                      <Tag size={16} className="mr-2" />
                      Add Category
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/coupons">
                      <FileText size={16} className="mr-2" />
                      Create Coupon
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/courier">
                      <Truck size={16} className="mr-2" />
                      Create Courier
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-3 border-b">
                  <h3 className="font-semibold">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b hover:bg-gray-50 ${
                        notification.unread ? 'bg-blue-50' : ''
                      }`}
                    >
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-gray-500">{notification.time}</p>
                    </div>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback>
                      {session?.user?.name?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="p-2 border-b">
                  <p className="font-medium">{session?.user?.name}</p>
                  <p className="text-sm text-gray-500">{session?.user?.email}</p>
                  <Badge variant="outline" className="mt-1 capitalize">
                    {session?.user?.role}
                  </Badge>
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto w-full min-w-0">
          <div className="w-full max-w-full overflow-hidden">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
    </TooltipProvider>
  );
}