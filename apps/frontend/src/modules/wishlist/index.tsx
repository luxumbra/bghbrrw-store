'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Heart } from '@medusajs/icons';
import { Button } from '@medusajs/ui';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';

interface WishlistButtonProps {
  productId: string;
  variantId?: string;
  productTitle?: string;
  size?: number;
  className?: string;
  onWishlistChange?: (isFavorited: boolean, wishlist: any) => void;
  initialFavorited?: boolean;
  variant?: 'icon' | 'button';
}

// Custom hook for wishlist management
const useWishlist = (productId: string, variantId?: string) => {
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const [updateTrigger, setUpdateTrigger] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const router = useRouter();

  // Get customer token from cookies
  const getCustomerToken = useCallback(() => {
    if (typeof document === 'undefined') return null;

    const cookies = document.cookie.split(';');
    console.log('=== COOKIE DEBUG ===');
    console.log('All available cookies:', cookies);
    console.log('Document cookie string:', document.cookie);

    // Look for the correct Medusa JWT cookie
    const tokenCookie = cookies.find(cookie =>
      cookie.trim().startsWith('_medusa_jwt=')
    );

    if (tokenCookie) {
      const token = tokenCookie.split('=')[1];
      console.log('Found Medusa JWT token:', token ? 'exists' : 'empty');
      setIsAuthenticated(true);
      return token;
    }

    // Check for other possible cookie names
    const alternativeCookies = [
      'medusa_customer_token=',
      'customer_token=',
      'auth_token=',
      'session_token=',
      'medusa_token=',
      'jwt=',
      'token=',
      'auth='
    ];

    for (const cookieName of alternativeCookies) {
      const altCookie = cookies.find(cookie =>
        cookie.trim().startsWith(cookieName)
      );
      if (altCookie) {
        const token = altCookie.split('=')[1];
        console.log(`Found alternative token in ${cookieName}:`, token ? 'exists' : 'empty');
        setIsAuthenticated(true);
        return token;
      }
    }

    // Check if any cookie contains 'medusa' or 'jwt'
    const medusaCookies = cookies.filter(cookie =>
      cookie.toLowerCase().includes('medusa') ||
      cookie.toLowerCase().includes('jwt') ||
      cookie.toLowerCase().includes('auth')
    );

    if (medusaCookies.length > 0) {
      console.log('Found potential auth cookies:', medusaCookies);
      // Try the first one that looks like an auth cookie
      const firstAuthCookie = medusaCookies[0];
      const token = firstAuthCookie.split('=')[1];
      console.log('Using first auth cookie:', firstAuthCookie);
      setIsAuthenticated(true);
      return token;
    }

    console.log('No authentication token found in cookies');
    console.log('=== END COOKIE DEBUG ===');
    setIsAuthenticated(false);
    return null;
  }, []);

  // Check authentication via API call (for HttpOnly cookies)
  const checkAuthViaAPI = useCallback(async () => {
    try {
      const response = await fetch('/api/store/customers/me', {
        headers: {
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
        }
      });

      if (response.ok) {
        console.log('User is authenticated via API check');
        setIsAuthenticated(true);
        return true;
      } else {
        console.log('User is not authenticated via API check');
        setIsAuthenticated(false);
        return false;
      }
    } catch (error) {
      console.error('Error checking authentication via API:', error);
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  // Fetch wishlist from backend
  const fetchWishlist = useCallback(async () => {
    const customerToken = getCustomerToken();

    // If no token found in cookies, try API authentication check
    if (!customerToken) {
      const isAuth = await checkAuthViaAPI();
      if (!isAuth) {
        setIsAuthenticated(false);
        return;
      }
      // If authenticated via API but no token in cookies, we'll use the API call
      // without Authorization header (cookies will be sent automatically)
    }

    try {
      const headers: Record<string, string> = {
        'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
      };

      // Only add Authorization header if we have a token
      if (customerToken) {
        headers['Authorization'] = `Bearer ${customerToken}`;
      }

      const response = await fetch('/api/store/customers/me/wishlist', {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        const wishlist = data.wishlist;

        if (wishlist && wishlist.items) {
          const isInWishlist = wishlist.items.some((item: any) =>
            item.productId === productId && (!variantId || item.productVariantId === variantId)
          );
          setIsFavorited(isInWishlist);
          setWishlistCount(wishlist.items.length);
        }
      } else if (response.status === 401) {
        // Token is invalid or expired
        console.log('Token is invalid or expired');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setIsAuthenticated(false);
    }
  }, [productId, variantId, getCustomerToken, checkAuthViaAPI]);

  // Initialize state on mount
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist, updateTrigger]);

  // Listen for storage changes (for cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === '_medusa_jwt' || e.key === 'medusa_customer_token') {
        setUpdateTrigger(prev => prev + 1);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Toggle wishlist item
  const toggleWishlist = useCallback(async () => {
    const customerToken = getCustomerToken();

    // If no token found, check if user is authenticated via API
    if (!customerToken) {
      const isAuth = await checkAuthViaAPI();
      if (!isAuth) {
        console.log('User not authenticated, redirecting to login...');
        router.push('/account/login');
        return;
      }
    }

    setIsLoading(true);

    try {
      const headers: Record<string, string> = {
        'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
      };

      // Only add Authorization header if we have a token
      if (customerToken) {
        headers['Authorization'] = `Bearer ${customerToken}`;
      }

      if (isFavorited) {
        // Remove from wishlist
        await fetch('/api/store/customers/me/wishlist/items', {
          method: 'DELETE',
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            productId: productId,
            productVariantId: variantId || productId
          })
        });
      } else {
        // Add to wishlist
        await fetch('/api/store/customers/me/wishlist/items', {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            productId: productId,
            productVariantId: variantId || productId,
            quantity: 1
          })
        });
      }

      // Refresh wishlist data
      setUpdateTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isFavorited, productId, variantId, getCustomerToken, checkAuthViaAPI, router]);

  return {
    isFavorited,
    setIsFavorited,
    wishlistCount,
    toggleWishlist,
    isLoading,
    isAuthenticated
  };
};

const WishlistButton = React.memo(({
  productId,
  variantId,
  productTitle = "Product",
  size = 24,
  className = "",
  onWishlistChange,
  initialFavorited = false,
  variant = 'icon'
}: WishlistButtonProps) => {
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const { isFavorited, setIsFavorited, wishlistCount, toggleWishlist, isLoading, isAuthenticated } = useWishlist(productId, variantId);

  // Memoized toggle function to prevent unnecessary re-renders
  const handleToggle = useCallback(async () => {
    if (isAnimating || isLoading) return;

    setIsAnimating(true);

    try {
      await toggleWishlist();

      // Call optional callback
      if (onWishlistChange) {
        onWishlistChange(!isFavorited, { count: wishlistCount });
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setIsAnimating(false);
    }
  }, [isAnimating, isLoading, toggleWishlist, isFavorited, onWishlistChange, wishlistCount]);

  // Memoized icon to prevent unnecessary re-renders
  const heartIcon = useMemo(() => (
    <Icon
      icon={isFavorited ? "mdi:heart" : "mdi:heart-outline"}
      className={`transition-all duration-200 ${
        isFavorited
          ? 'text-red-500 fill-current'
          : 'text-gray-400 hover:text-red-400'
      } ${isAnimating ? 'scale-110' : ''}`}
      width={size}
      height={size}
    />
  ), [isFavorited, isAnimating, size]);

  // Don't render the button if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  if (variant === 'button') {
    return (
      <Button
        onClick={handleToggle}
        disabled={isLoading}
        variant="secondary"
        size="base"
        className={`flex items-center gap-2 ${className}`}
      >
        {heartIcon}
        <span>{isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
      </Button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${className}`}
      aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
      title={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {heartIcon}
    </button>
  );
});

WishlistButton.displayName = 'WishlistButton';

export default WishlistButton;
