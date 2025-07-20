'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  FacebookShareButton,
  TwitterShareButton,
  PinterestShareButton,
  EmailShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  PinterestIcon,
  EmailIcon,
  WhatsappIcon,
} from 'react-share';
import { XMark } from '@medusajs/icons';
import { Text, Button } from '@medusajs/ui';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    title: string;
    description?: string;
    images?: Array<{ url: string }>;
    handle: string;
  };
  url: string;
}

const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  product,
  url,
}) => {
  const [copied, setCopied] = useState(false);

  // Memoize share data to prevent unnecessary re-renders
  const shareData = useMemo(() => {
    const title = `${product.title} - Bough & Burrow`;
    const description = product.description || `Check out this beautiful ${product.title} from Bough & Burrow`;
    const imageUrl = product.images?.[0]?.url || '';

    return {
      title,
      description,
      imageUrl,
      url,
    };
  }, [product, url]);

  // Copy URL to clipboard
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  }, [url]);

  // Handle escape key
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-lg"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md mx-4 bg-primary-bg rounded-lg shadow-2xl shadow-black/70"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-copy-color/20">
          <Text className="text-lg font-semibold text-copy-color">
            Share this product
          </Text>
          <button
            onClick={onClose}
            className="p-1 text-copy-color hover:text-copy-color/70 transition-colors"
            aria-label="Close modal"
          >
            <XMark className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Product preview */}
          <div className="mb-6 p-4 bg-primary-bg rounded-lg">
            <div className="flex items-center space-x-3">
              {product.images?.[0] && (
                <img
                  src={product.images[0].url}
                  alt={product.title}
                  className="w-16 h-16 object-cover rounded-md"
                />
              )}
              <div className="flex-1 min-w-0">
                <Text className="text-sm font-medium text-primary truncate">
                  {product.title}
                </Text>
                <Text className="text-xs text-copy-color">
                  Bough & Burrow
                </Text>
              </div>
            </div>
          </div>

          {/* Social share buttons */}
          <div className="space-y-3">
            <Text className="text-sm font-medium text-copy-color mb-4">
              Share on social media
            </Text>

            <div className="grid grid-cols-2 gap-3">
              <FacebookShareButton
                url={url}
                title={shareData.title}
                hashtag="#BoughAndBurrow"
                className="flex items-center justify-center p-3 bg-blue-600 text-copy-color rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FacebookIcon size={20} round />
                <span className="ml-2 text-sm font-medium">Facebook</span>
              </FacebookShareButton>

              <TwitterShareButton
                url={url}
                title={shareData.title}
                hashtags={['BoughAndBurrow', 'WoodenCrafts']}
                className="flex items-center justify-center p-3 bg-sky-500 text-copy-color rounded-lg hover:bg-sky-600 transition-colors"
              >
                <TwitterIcon size={20} round />
                <span className="ml-2 text-sm font-medium">Twitter</span>
              </TwitterShareButton>

              <PinterestShareButton
                url={url}
                description={shareData.description}
                media={shareData.imageUrl}
                className="flex items-center justify-center p-3 bg-red-600 text-copy-color rounded-lg hover:bg-red-700 transition-colors"
              >
                <PinterestIcon size={20} round />
                <span className="ml-2 text-sm font-medium">Pinterest</span>
              </PinterestShareButton>

              <WhatsappShareButton
                url={url}
                title={shareData.title}
                className="flex items-center justify-center p-3 bg-green-600 text-copy-color rounded-lg hover:bg-green-700 transition-colors"
              >
                <WhatsappIcon size={20} round />
                <span className="ml-2 text-sm font-medium">WhatsApp</span>
              </WhatsappShareButton>
            </div>

            <EmailShareButton
              url={url}
              subject={shareData.title}
              body={shareData.description}
              className="w-full flex items-center justify-center p-3 bg-gray-600 text-copy-color rounded-lg hover:bg-gray-700 transition-colors"
            >
              <EmailIcon size={20} round />
              <span className="ml-2 text-sm font-medium">Email</span>
            </EmailShareButton>
          </div>

          {/* Copy link section */}
          <div className="mt-6 pt-6 border-t border-copy-color/20">
            <Text className="text-sm font-medium text-copy-color mb-3">
              Or copy the link
            </Text>
            <div className="flex space-x-2">
              <input
                type="text"
                value={url}
                readOnly
                className="flex-1 px-3 py-2 text-sm border text-primary-bg border-copy-color/30 rounded-md bg-copy-color focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button
                onClick={copyToClipboard}
                variant="secondary"
                size="small"
                className="whitespace-nowrap text-copy-color"
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialShareModal;