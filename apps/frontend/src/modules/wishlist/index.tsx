'use client';

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Icon } from "@iconify/react";

interface WishlistButtonProps {
  productId: string;
  productTitle?: string;
  size?: number;
  className?: string;
  onWishlistChange?: (isFavorited: boolean, wishlist: string[]) => void;
  initialFavorited?: boolean;
  displayCount?: boolean;
}

// Custom hook for wishlist management
const useWishlist = (productId: string) => {
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const [updateTrigger, setUpdateTrigger] = useState<number>(0);

  // Get wishlist data from localStorage
  const getWishlistData = useCallback(() => {
    try {
      const stored = localStorage.getItem('medusa-wishlist');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading wishlist from localStorage:', error);
      return [];
    }
  }, []);

  // Initialize state on mount and when productId changes
  useEffect(() => {
    const wishlistData = getWishlistData();
    const isInWishlist = wishlistData.includes(productId);
    setIsFavorited(isInWishlist);
    setWishlistCount(wishlistData.length);
  }, [productId, getWishlistData, updateTrigger]);

  // Listen for storage changes (for cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'medusa-wishlist') {
        setUpdateTrigger(prev => prev + 1);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Memoized function to update wishlist
  const updateWishlist = useCallback((newWishlist: string[]) => {
    try {
      localStorage.setItem('medusa-wishlist', JSON.stringify(newWishlist));
      setWishlistCount(newWishlist.length);
      setUpdateTrigger(prev => prev + 1); // Force re-render
    } catch (error) {
      console.error('Error updating wishlist in localStorage:', error);
    }
  }, []);

  return {
    isFavorited,
    setIsFavorited,
    wishlistCount,
    updateWishlist,
    getWishlistData
  };
};

const WishlistButton = React.memo(({
  productId,
  productTitle = "Product",
  size = 24,
  className = "",
  onWishlistChange,
  initialFavorited = false,
  displayCount = false
}: WishlistButtonProps) => {
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const { isFavorited, setIsFavorited, wishlistCount, updateWishlist, getWishlistData } = useWishlist(productId);

  // Memoized toggle function to prevent unnecessary re-renders
  const toggleWishlist = useCallback(async () => {
    if (isAnimating) return;

    setIsAnimating(true);

    // Get current wishlist
    const currentWishlist = getWishlistData();
    let newWishlist: string[];
    let newFavoritedState: boolean;

    if (currentWishlist.includes(productId)) {
      // Remove from wishlist
      newWishlist = currentWishlist.filter((id: string) => id !== productId);
      newFavoritedState = false;
    } else {
      // Add to wishlist
      newWishlist = [...currentWishlist, productId];
      newFavoritedState = true;
    }

    // Update local storage and state
    updateWishlist(newWishlist);
    setIsFavorited(newFavoritedState);

    // Call optional callback
    if (onWishlistChange) {
      onWishlistChange(newFavoritedState, newWishlist);
    }

    // Here you would typically make an API call to your MedusaJS backend
    // Example:
    // try {
    //   const response = await fetch('/api/wishlist', {
    //     method: newFavoritedState ? 'POST' : 'DELETE',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ productId })
    //   });
    //   if (!response.ok) throw new Error('Failed to update wishlist');
    // } catch (error) {
    //   console.error('Error updating wishlist:', error);
    //   // Revert state on error
    //   setIsFavorited(!newFavoritedState);
    //   updateWishlist(currentWishlist);
    // }

    // Reset animation after delay
    setTimeout(() => setIsAnimating(false), 300);
  }, [isAnimating, productId, getWishlistData, updateWishlist, onWishlistChange]);

  // Memoized aria-label to prevent unnecessary re-renders
  const ariaLabel = useMemo(() =>
    isFavorited ? `Remove ${productTitle} from wishlist` : `Add ${productTitle} to wishlist`,
    [isFavorited, productTitle]
  );

  // Memoized title to prevent unnecessary re-renders
  const title = useMemo(() =>
    isFavorited ? "Remove from wishlist" : "Add to wishlist",
    [isFavorited]
  );

  // Memoized icon to prevent unnecessary re-renders
  const iconName = useMemo(() =>
    isFavorited ? "mdi:heart" : "mdi:heart-outline",
    [isFavorited]
  );

  // Memoized icon className to prevent unnecessary re-renders
  const iconClassName = useMemo(() => `
    transition-all duration-300 ease-in-out
    ${isFavorited
      ? 'fill-red-500 text-red-500 drop-shadow-xl'
      : 'text-gray-400 hover:text-red-400'
    }
    ${isAnimating ? 'animate-pulse scale-125' : ''}
  `, [isFavorited, isAnimating]);

  // Memoized button className to prevent unnecessary re-renders
  const buttonClassName = useMemo(() => `
    relative p-2 rounded-full transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50
    ${isAnimating ? 'scale-110' : 'hover:scale-105'}
    ${className}
  `, [isAnimating, className]);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleWishlist}
        disabled={isAnimating}
        className={buttonClassName}
        aria-label={ariaLabel}
        title={title}
      >
        <Icon
          icon={iconName}
          width={size}
          height={size}
          className={iconClassName}
        />

        {/* Animated ripple effect */}
        {isAnimating && (
          <div className="absolute inset-0 border-2 border-red-500 rounded-full opacity-75 animate-ping" />
        )}
      </button>

      {/* Optional wishlist counter */}
      {displayCount && wishlistCount > 0 && (
        <span className="text-sm font-medium text-gray-600">
          {wishlistCount} item{wishlistCount !== 1 ? 's' : ''} in wishlist
        </span>
      )}
    </div>
  );
});

// Add display name for debugging
WishlistButton.displayName = 'WishlistButton';

// Demo component showing different usage examples
const WishlistDemo = () => {
  const [notifications, setNotifications] = useState<any[]>([]);

  const handleWishlistChange = useCallback((isFavorited: boolean, wishlist: string[]) => {
    const message = isFavorited
      ? "Added to wishlist!"
      : "Removed from wishlist";

    const notification = {
      id: Date.now(),
      message,
      type: isFavorited ? 'success' : 'info'
    };

    setNotifications(prev => [...prev, notification]);

    // Remove notification after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 3000);
  }, []);

  const clearWishlist = useCallback(() => {
    localStorage.removeItem('medusa-wishlist');
    window.location.reload();
  }, []);

  // Memoize product data to prevent unnecessary re-renders
  const demoProducts = useMemo(() => [
    { id: "product-1", title: "Premium T-Shirt", price: "$29.99", image: "👕" },
    { id: "product-2", title: "Sneakers", price: "$89.99", image: "👟" },
    { id: "product-3", title: "Watch", price: "$199.99", image: "⌚" }
  ], []);

  return (
    <div className="max-w-2xl p-8 mx-auto">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-800">
          MedusaJS Wishlist Component
        </h1>
        <p className="text-gray-600">
          Animated heart button for adding products to user wishlist
        </p>
      </div>

      {/* Sample product cards */}
      <div className="grid gap-6 mb-8">
        {demoProducts.map(product => (
          <div key={product.id} className="p-6 transition-shadow bg-white border rounded-lg shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{product.image}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{product.title}</h3>
                  <p className="text-gray-600">{product.price}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700">
                  Add to Cart
                </button>
                <WishlistButton
                  productId={product.id}
                  productTitle={product.title}
                  onWishlistChange={handleWishlistChange}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Different sizes demo */}
      <div className="p-6 mb-6 rounded-lg bg-gray-50">
        <h3 className="mb-4 font-semibold text-gray-800">Different Sizes</h3>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <WishlistButton productId="demo-small" size={16} />
            <p className="mt-1 text-sm text-gray-600">Small (16px)</p>
          </div>
          <div className="text-center">
            <WishlistButton productId="demo-medium" size={24} />
            <p className="mt-1 text-sm text-gray-600">Medium (24px)</p>
          </div>
          <div className="text-center">
            <WishlistButton productId="demo-large" size={32} />
            <p className="mt-1 text-sm text-gray-600">Large (32px)</p>
          </div>
        </div>
      </div>

      {/* Utility button */}
      <div className="mb-6 text-center">
        <button
          onClick={clearWishlist}
          className="px-4 py-2 text-sm text-red-700 transition-colors bg-red-100 rounded-lg hover:bg-red-200"
        >
          Clear Wishlist (Demo)
        </button>
      </div>

      {/* Notifications */}
      <div className="fixed z-50 space-y-2 top-4 right-4">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`
              px-4 py-2 rounded-lg shadow-lg transition-all duration-300
              ${notification.type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 text-white'
              }
            `}
          >
            {notification.message}
          </div>
        ))}
      </div>

      {/* Integration guide */}
      <div className="p-6 mt-8 border border-blue-200 rounded-lg bg-blue-50">
        <h3 className="mb-3 font-semibold text-blue-900">Integration with MedusaJS</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>To integrate with your MedusaJS backend:</p>
          <ul className="ml-4 space-y-1 list-disc list-inside">
            <li>Uncomment the API call section in the toggleWishlist function</li>
            <li>Create a wishlist endpoint in your MedusaJS API</li>
            <li>Replace localStorage with proper user authentication</li>
            <li>Add error handling for network requests</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export { WishlistButton };

export default WishlistDemo;
