'use client';

import WishlistButton from "@modules/wishlist";

interface WishlistWrapperProps {
  productId: string;
  variantId?: string;
  size?: number;
  className?: string;
  variant?: 'icon' | 'button';
}

const WishlistWrapper: React.FC<WishlistWrapperProps> = ({
  productId,
  variantId,
  size = 36,
  className = "",
  variant = 'icon'
}) => {
  return (
    <WishlistButton
      productId={productId}
      variantId={variantId}
      size={size}
      className={className}
      variant={variant}
    />
  );
};

export default WishlistWrapper;