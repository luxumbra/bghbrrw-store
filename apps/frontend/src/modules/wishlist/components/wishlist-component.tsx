import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

const WishlistButton = ({ 
  productId, 
  productTitle = "Product",
  size = 24,
  className = "",
  onWishlistChange = null,
  initialFavorited = false 
}) => {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isAnimating, setIsAnimating] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Load wishlist from memory on component mount
  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('medusa-wishlist') || '[]');
    setIsFavorited(wishlist.includes(productId));
    setWishlistCount(wishlist.length);
  }, [productId]);

  const toggleWishlist = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // Get current wishlist
    const currentWishlist = JSON.parse(localStorage.getItem('medusa-wishlist') || '[]');
    let newWishlist;
    let newFavoritedState;

    if (currentWishlist.includes(productId)) {
      // Remove from wishlist
      newWishlist = currentWishlist.filter(id => id !== productId);
      newFavoritedState = false;
    } else {
      // Add to wishlist
      newWishlist = [...currentWishlist, productId];
      newFavoritedState = true;
    }

    // Update local storage
    localStorage.setItem('medusa-wishlist', JSON.stringify(newWishlist));
    
    // Update state
    setIsFavorited(newFavoritedState);
    setWishlistCount(newWishlist.length);

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
    //   setWishlistCount(currentWishlist.length);
    // }

    // Reset animation after delay
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleWishlist}
        disabled={isAnimating}
        className={`
          relative p-2 rounded-full transition-all duration-200 ease-in-out
          hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50
          ${isAnimating ? 'scale-110' : 'hover:scale-105'}
          ${className}
        `}
        aria-label={isFavorited ? `Remove ${productTitle} from wishlist` : `Add ${productTitle} to wishlist`}
        title={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart
          size={size}
          className={`
            transition-all duration-300 ease-in-out
            ${isFavorited 
              ? 'fill-red-500 text-red-500 drop-shadow-sm' 
              : 'text-gray-400 hover:text-red-400'
            }
            ${isAnimating ? 'animate-pulse scale-125' : ''}
          `}
        />
        
        {/* Animated ripple effect */}
        {isAnimating && (
          <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-75" />
        )}
      </button>

      {/* Optional wishlist counter */}
      {wishlistCount > 0 && (
        <span className="text-sm text-gray-600 font-medium">
          {wishlistCount} item{wishlistCount !== 1 ? 's' : ''} in wishlist
        </span>
      )}
    </div>
  );
};

// Demo component showing different usage examples
const WishlistDemo = () => {
  const [notifications, setNotifications] = useState([]);

  const handleWishlistChange = (isFavorited, wishlist) => {
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
  };

  const clearWishlist = () => {
    localStorage.removeItem('medusa-wishlist');
    window.location.reload();
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          MedusaJS Wishlist Component
        </h1>
        <p className="text-gray-600">
          Animated heart button for adding products to user wishlist
        </p>
      </div>

      {/* Sample product cards */}
      <div className="grid gap-6 mb-8">
        {[
          { id: "product-1", title: "Premium T-Shirt", price: "$29.99", image: "👕" },
          { id: "product-2", title: "Sneakers", price: "$89.99", image: "👟" },
          { id: "product-3", title: "Watch", price: "$199.99", image: "⌚" }
        ].map(product => (
          <div key={product.id} className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{product.image}</div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">{product.title}</h3>
                  <p className="text-gray-600">{product.price}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="font-semibold mb-4 text-gray-800">Different Sizes</h3>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <WishlistButton productId="demo-small" size={16} />
            <p className="text-sm text-gray-600 mt-1">Small (16px)</p>
          </div>
          <div className="text-center">
            <WishlistButton productId="demo-medium" size={24} />
            <p className="text-sm text-gray-600 mt-1">Medium (24px)</p>
          </div>
          <div className="text-center">
            <WishlistButton productId="demo-large" size={32} />
            <p className="text-sm text-gray-600 mt-1">Large (32px)</p>
          </div>
        </div>
      </div>

      {/* Utility button */}
      <div className="text-center mb-6">
        <button 
          onClick={clearWishlist}
          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
        >
          Clear Wishlist (Demo)
        </button>
      </div>

      {/* Notifications */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
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
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
        <h3 className="font-semibold text-blue-900 mb-3">Integration with MedusaJS</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>To integrate with your MedusaJS backend:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
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

export default WishlistDemo;