'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@medusajs/ui';
import SocialShareModal from '../social-share-modal';
import { Icon } from '@iconify/react';

interface ShareButtonProps {
  product: {
    title: string;
    description?: string;
    images?: Array<{ url: string }>;
    handle: string;
  };
  className?: string;
  variant?: 'button' | 'icon';
  size?: 'small' | 'medium' | 'large';
  iconSize?: number;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  product,
  className = 'flex items-center justify-center gap-x-2',
  variant = 'button',
  size = 'medium',
  iconSize = 24,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleShare = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Get current URL
  const currentUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/products/${product.handle}`
    : '';

  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={handleShare}
          className={`text-copy-color hover:text-primary transition-all hover:scale-105 ${className}`}
          aria-label="Share product"
          title="Share this product"
        >
          <Icon icon="tabler:share" width={iconSize} height={iconSize} />
        </button>

        <SocialShareModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          product={product}
          url={currentUrl}
        />
      </>
    );
  }

  return (
    <>
      <Button
        onClick={handleShare}
        variant="secondary"
        size="base"
        className={className}
      >
        <Icon icon="tabler:share" width={iconSize} height={iconSize} />
        <span className="text-copy-color">Share</span>
      </Button>

      <SocialShareModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={product}
        url={currentUrl}
      />
    </>
  );
};

export default ShareButton;