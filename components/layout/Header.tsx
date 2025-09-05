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
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="lg:hidden w-10 h-10" />
            <Link href="/" className="flex items-center space-x-2">
              <div className="font-bold text-xl lg:text-2xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                {settings?.siteName || process.env.Next_PUBLIC_SITE_NAME}
              </div>
            </Link>
            <div className="flex items-center space-x-2 lg:space-x-4">
              <div className="w-8 h-8" />
              <div className="w-8 h-8" />
              <div className="w-8 h-8" />
              <div className="w-8 h-8" />
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
            ? "bg-background/95 backdrop-blur-md border-b shadow-sm"
            : "bg-gradient-to-b from-black/50 via-black/20 to-transparent backdrop-blur-sm"
        }`}
        suppressHydrationWarning
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile: Logo on left, hamburger on right */}
            <div className="flex items-center justify-between w-full">
              {/* Mobile Hamburger Menu */}
              {/* Logo */}
              <Link
                href="/"
                className="flex items-center space-x-2 ml-2 lg:ml-0"
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
                    <div className="font-bold text-xl lg:text-2xl text-white lg:bg-gradient-to-r lg:from-primary lg:to-blue-600 lg:bg-clip-text lg:text-transparent">
                      {settings?.siteName || process.env.Next_PUBLIC_SITE_NAME}
                    </div>
                  )}
                </motion.div>
              </Link>
              <div className="lg:hidden">
                <Sheet
                  open={mobileDrawerOpen}
                  onOpenChange={setMobileDrawerOpen}
                >
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 text-white hover:bg-white/10"
                    >
                      <Menu size={24} />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-80 p-0 overflow-hidden bg-white"
                  >
                    <SheetHeader className="px-6 py-4 border-b bg-muted/30">
                      <SheetTitle className="text-left text-xl font-semibold flex items-center">
                        <Menu className="mr-2" size={20} />
                        Menu
                      </SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto h-full">
                      <div className="p-6 space-y-6">
                        {/* Mobile Search */}
                        <div className="relative">
                          <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                            size={20}
                          />
                          <Input
                            placeholder="Search products..."
                            className="pl-10 h-12"
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
                          <div className="border-t pt-6 space-y-2">
                            <div className="px-4 py-3 bg-muted/30 rounded-lg">
                              <div className="font-medium text-foreground">
                                {session.user?.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
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
                                <LogOut className="h-5 w-5" />
                              </div>
                              <span className="font-medium ml-3">Sign Out</span>
                            </button>
                          </div>
                        ) : (
                          <div className="border-t pt-6">
                            <Link
                              href="/auth/signin"
                              onClick={() => setMobileDrawerOpen(false)}
                            >
                              <div className="flex items-center px-4 py-4 text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 group">
                                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                  <User className="h-5 w-5 text-primary" />
                                </div>
                                <span className="font-medium ml-3">
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
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {/* <Link href="/explore" className="text-sm font-medium text-white/90 hover:text-white transition-colors">
                Explore
              </Link> */}
              <Link
                href="/products"
                className="text-sm font-medium text-white/90 hover:text-white transition-colors"
              >
                Products
              </Link>
              <Link
                href="/blogs"
                className="text-sm font-medium text-white/90 hover:text-white transition-colors"
              >
                Blog
              </Link>
              <Link
                href="/deals"
                className="text-sm font-medium text-white/90 hover:text-white transition-colors"
              >
                Deals
              </Link>
              <Link
                href="/contact"
                className="text-sm font-medium text-white/90 hover:text-white transition-colors"
              >
                Contact
              </Link>
              {/* {session?.user?.role === 'admin' && (
                <Link href="/admin" className="text-sm font-medium text-white/90 hover:text-white transition-colors">
                  Admin
                </Link>
              )} */}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4 ml-8">
              {/* Search */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(toggleSearch())}
                className="p-2 text-white hover:bg-white/10"
              >
                <Search size={20} />
              </Button>

              {/* Wishlist */}
              <Link href="/wishlist">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 relative text-white hover:bg-white/10"
                >
                  <Heart size={20} />
                  {isHydrated && wishlistCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
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
                className="p-2 relative text-white hover:bg-white/10"
              >
                <ShoppingBag size={20} />
                {isHydrated && itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </Button>

              {/* User Account */}
              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 text-white hover:bg-white/10"
                    >
                      <User size={20} />
                    </Button>
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
                    className="p-2 text-white hover:bg-white/10"
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
      <div className="flex items-center justify-between px-4 py-4 hover:bg-muted/50 rounded-lg transition-all duration-200 group">
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <span className="font-medium ml-3 text-foreground group-hover:text-primary transition-colors">
            {label}
          </span>
        </div>
        {badge && badge > 0 && (
          <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full min-w-[20px] text-center font-medium">
            {badge}
          </span>
        )}
      </div>
    </Link>
  );
}
