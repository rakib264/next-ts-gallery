"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import SearchComponent from "@/components/ui/search";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useHydration } from "@/hooks/use-hydration";
import { useSettings } from "@/hooks/use-settings";
import {
  reloadCartFromStorage,
  toggleCart,
} from "@/lib/store/slices/cartSlice";
import { toggleSearch } from "@/lib/store/slices/uiSlice";
import { loadWishlistFromStorage } from "@/lib/store/slices/wishlistSlice";
import { RootState } from "@/lib/store/store";
import { motion } from "framer-motion";
import {
  BookOpen,
  Heart,
  LogOut,
  Menu,
  Package,
  Percent,
  Phone,
  RotateCcw,
  Search,
  Settings,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function Header() {
  const dispatch = useDispatch();
  const { itemCount } = useSelector((state: RootState) => state.cart);
  const { itemCount: wishlistCount } = useSelector(
    (state: RootState) => state.wishlist
  );
  const { searchOpen, mobileMenuOpen } = useSelector(
    (state: RootState) => state.ui
  );
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const isHydrated = useHydration();
  const { settings } = useSettings();

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    // Only add scroll listener after component is mounted
    window.addEventListener("scroll", handleScroll);

    // Load cart and wishlist from localStorage on mount
    dispatch(reloadCartFromStorage());
    dispatch(loadWishlistFromStorage());

    return () => window.removeEventListener("scroll", handleScroll);
  }, [dispatch]);

  // Don't render anything until mounted to prevent hydration mismatches
  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-600/90 via-violet-600/90 to-indigo-600/90 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="lg:hidden w-10 h-10" />
            <Link href="/" className="flex items-center space-x-2">
              <div className="font-bold text-xl lg:text-2xl text-white drop-shadow-lg">
                {settings?.siteName || process.env.Next_PUBLIC_SITE_NAME}
              </div>
            </Link>
            <div className="flex items-center space-x-2 lg:space-x-4">
              <div className="w-8 h-8 bg-white/10 rounded animate-pulse" />
              <div className="w-8 h-8 bg-white/10 rounded animate-pulse" />
              <div className="w-8 h-8 bg-white/10 rounded animate-pulse" />
              <div className="w-8 h-8 bg-white/10 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 backdrop-blur-md border-b border-white/20 shadow-lg"
            : "bg-gradient-to-r from-indigo-600/90 via-violet-600/90 to-indigo-600/90 backdrop-blur-sm"
        }`}
        suppressHydrationWarning
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile Layout: Menu (left) | Logo (center) | Search & Cart (right) */}
            <div className="flex items-center justify-between w-full lg:justify-start">
              {/* Mobile Hamburger Menu - Left Side */}
              <div className="lg:hidden">
                <Sheet
                  open={mobileDrawerOpen}
                  onOpenChange={setMobileDrawerOpen}
                >
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 text-white hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
                    >
                      <Menu size={24} />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-80 p-0 overflow-hidden bg-white flex flex-col max-h-screen"
                  >
                    {/* <SheetHeader className="px-6 py-4 border-b bg-gradient-to-r from-indigo-50 to-violet-50 flex-shrink-0">
                      <SheetTitle className="text-left text-xl font-semibold flex items-center text-gray-900">
                        <Menu className="mr-2 text-indigo-600" size={20} />
                        Menu
                      </SheetTitle>
                    </SheetHeader> */}

                    <SheetHeader className="p-6 pb-4 border-b">
                    <div className="flex items-center justify-between">
                      <SheetTitle className="text-lg text-gray-900 font-semibold">Menu</SheetTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMobileDrawerOpen(false)}
                        className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </SheetHeader>


                    <div className="flex-1 overflow-y-auto min-h-0">
                      <div className="p-6 space-y-6">
                        {/* Mobile Search */}
                        <div className="relative mx-1">
                          <Search
                            className="absolute z-10 left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                            size={20}
                          />
                          
                          <Input
                            placeholder="Search products..."
                            className="pl-10 h-12 border border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 placeholder:text-gray-500"
                            onClick={() => {
                              setMobileDrawerOpen(false);
                              dispatch(toggleSearch());
                            }}
                          />
                        </div>

                        {/* Navigation Items */}
                        <div className="space-y-1">
                          <MobileNavItem
                            href="/products"
                            icon={Package}
                            label="Products"
                            onClose={() => setMobileDrawerOpen(false)}
                          />
                          <MobileNavItem
                            href="/deals"
                            icon={Percent}
                            label="Deals"
                            onClose={() => setMobileDrawerOpen(false)}
                          />
                          <MobileNavItem
                            href="/wishlist"
                            icon={Heart}
                            label="Wishlist"
                            badge={wishlistCount}
                            onClose={() => setMobileDrawerOpen(false)}
                          />
                          <MobileNavItem
                            href="/cart"
                            icon={ShoppingBag}
                            label="Cart"
                            badge={itemCount}
                            onClose={() => setMobileDrawerOpen(false)}
                          />
                          <MobileNavItem
                            href="/blogs"
                            icon={BookOpen}
                            label="Blog"
                            onClose={() => setMobileDrawerOpen(false)}
                          />
                          <MobileNavItem
                            href="/contact"
                            icon={Phone}
                            label="Contact"
                            onClose={() => setMobileDrawerOpen(false)}
                          />
                          <MobileNavItem
                            href="/returns"
                            icon={RotateCcw}
                            label="Returns & Exchanges"
                            onClose={() => setMobileDrawerOpen(false)}
                          />
                        </div>

                        {/* User Section */}
                        {session ? (
                          <div className="border-t border-gray-200 pt-6 space-y-2">
                            <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-lg border border-indigo-100">
                              <div className="font-medium text-gray-900">
                                {session.user?.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {session.user?.email}
                              </div>
                            </div>
                            <MobileNavItem
                              href="/profile"
                              icon={User}
                              label="Profile"
                              onClose={() => setMobileDrawerOpen(false)}
                            />
                            {session.user?.role === "admin" && (
                              <MobileNavItem
                                href="/admin"
                                icon={Settings}
                                label="Admin Panel"
                                onClose={() => setMobileDrawerOpen(false)}
                              />
                            )}
                            <button
                              onClick={() => {
                                setMobileDrawerOpen(false);
                                signOut();
                              }}
                              className="flex items-center w-full px-4 py-4 text-left text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                            >
                              <div className="p-2 rounded-lg bg-red-100 group-hover:bg-red-200 transition-colors">
                                <LogOut className="h-5 w-5 text-red-600" />
                              </div>
                              <span className="font-medium ml-3 text-red-600">Sign Out</span>
                            </button>
                          </div>
                        ) : (
                          <div className="border-t border-gray-200 pt-6">
                            <Link
                              href="/auth/signin"
                              onClick={() => setMobileDrawerOpen(false)}
                            >
                              <div className="flex items-center px-4 py-4 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 group">
                                <div className="p-2 rounded-lg bg-indigo-100 group-hover:bg-indigo-200 transition-colors">
                                  <User className="h-5 w-5 text-indigo-600" />
                                </div>
                                <span className="font-medium ml-3 text-gray-900">
                                  Sign In
                                </span>
                              </div>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Logo - Center (Mobile) */}
              <Link
                href="/"
                className="flex items-center justify-center flex-1 lg:flex-none lg:ml-0"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2"
                >
                  {settings?.logo1 ? (
                    <img
                      src={
                        settings.logo1 ?? "/lib/assets/images/tsrgallery.png"
                      }
                      alt={
                        settings.siteName || process.env.Next_PUBLIC_SITE_NAME
                      }
                      className="h-8 lg:h-10 w-auto"
                    />
                  ) : (
                    <div className="font-bold text-xl lg:text-2xl text-white drop-shadow-lg">
                      {settings?.siteName || process.env.Next_PUBLIC_SITE_NAME}
                    </div>
                  )}
                </motion.div>
              </Link>

              {/* Mobile Actions - Right Side (Search & Cart) */}
              <div className="flex items-center space-x-1 lg:hidden">
                {/* Search */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dispatch(toggleSearch())}
                  className="p-2 text-white hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
                  aria-label="Search"
                >
                  <Search size={20} className="text-white stroke-2 drop-shadow-sm flex-shrink-0" />
                </Button>

                {/* Cart */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dispatch(toggleCart())}
                  className="p-2 relative text-white hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
                >
                  <ShoppingBag size={20} />
                  {isHydrated && itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-yellow-500 text-yellow-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-lg"
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </Button>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8 ml-8">
              <Link
                href="/products"
                className="text-sm font-medium text-white hover:text-white/80 transition-all duration-200 drop-shadow-sm hover:drop-shadow-md"
              >
                Products
              </Link>
              <Link
                href="/blogs"
                className="text-sm font-medium text-white hover:text-white/80 transition-all duration-200 drop-shadow-sm hover:drop-shadow-md"
              >
                Blog
              </Link>
              <Link
                href="/deals"
                className="text-sm font-medium text-white hover:text-white/80 transition-all duration-200 drop-shadow-sm hover:drop-shadow-md"
              >
                Deals
              </Link>
              <Link
                href="/contact"
                className="text-sm font-medium text-white hover:text-white/80 transition-all duration-200 drop-shadow-sm hover:drop-shadow-md"
              >
                Contact
              </Link>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4 ml-8">
              {/* Search */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(toggleSearch())}
                className="p-2 text-white hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
                aria-label="Search"
              >
                <Search size={20} className="text-white stroke-2 drop-shadow-sm flex-shrink-0" />
              </Button>

              {/* Wishlist */}
              <Link href="/wishlist">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 relative text-white hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
                >
                  <Heart size={20} className="text-white stroke-2 drop-shadow-sm flex-shrink-0" />
                  {isHydrated && wishlistCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-lg"
                    >
                      {wishlistCount}
                    </motion.span>
                  )}
                </Button>
              </Link>

              {/* Cart */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(toggleCart())}
                className="p-2 relative text-white hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
              >
                <ShoppingBag size={20} className="text-white stroke-2 drop-shadow-sm flex-shrink-0" />
                {isHydrated && itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-yellow-500 text-yellow-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-lg"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </Button>

              {/* User Account */}
              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    {/* <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 text-white hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
                    >
                      {
                        session.user?.profileImage ? (
                          <Image src={session.user?.profileImage} alt={session.user?.name} width={10} height={10} className="text-white stroke-2 drop-shadow-sm flex-shrink-0" />
                        ) : (
                          <User size={20} className="text-white stroke-2 drop-shadow-sm flex-shrink-0" />
                        )
                      }
                    </Button> */}
                    {
                        session.user?.profileImage ? (
                          <Image src={session.user?.profileImage} alt={session.user?.name} width={28} height={28} className="text-white stroke-2 drop-shadow-sm flex-shrink-0 rounded-full cursor-pointer object-cover ring-[2px] ring-white p-0.5" />
                        ) : (
                          <User size={20} className="text-white stroke-2 drop-shadow-sm flex-shrink-0" />
                        )
                      }
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5 text-sm font-medium">
                      {session.user?.name}
                    </div>
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">
                      {session.user?.email}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    {(session.user?.role === "admin" ||
                      session.user?.role === "manager") && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin">
                            <Settings className="mr-2 h-4 w-4" />
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      )}
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/auth/signin">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 text-white hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
                  >
                    <User size={20} />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Enhanced Search Component */}
      <SearchComponent
        isOpen={searchOpen}
        onClose={() => dispatch(toggleSearch())}
      />
    </>
  );
}

// Mobile Navigation Item Component
interface MobileNavItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
  onClose: () => void;
}

function MobileNavItem({
  href,
  icon: Icon,
  label,
  badge,
  onClose,
}: MobileNavItemProps) {
  return (
    <Link href={href} onClick={onClose}>
      <div className="flex items-center justify-between px-4 py-4 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-violet-50 rounded-lg transition-all duration-200 group">
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-indigo-100 group-hover:bg-indigo-200 transition-colors">
            <Icon className="h-5 w-5 text-indigo-600" />
          </div>
          <span className="font-medium ml-3 text-gray-900 group-hover:text-indigo-700 transition-colors">
            {label}
          </span>
        </div>
        {badge && badge > 0 && (
          <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center font-medium shadow-sm">
            {badge}
          </span>
        )}
      </div>
    </Link>
  );
}
