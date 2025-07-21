'use client';

import { useCallback, useEffect, useState } from 'react';

interface Customer {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export const useCustomer = () => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Get customer token from localStorage or cookies
  const getCustomerToken = useCallback(() => {
    // Try to get from localStorage first
    const token = localStorage.getItem('medusa_customer_token');
    if (token) return token;

    // Fallback to cookies
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('medusa_customer_token='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
  }, []);

  // Fetch customer data
  const fetchCustomer = useCallback(async () => {
    const token = getCustomerToken();
    if (!token) {
      setIsLoading(false);
      setIsAuthenticated(false);
      return;
    }

    try {
      const response = await fetch('/api/store/customers/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
        }
      });

      if (response.ok) {
        const customerData = await response.json();
        setCustomer(customerData.customer);
        setIsAuthenticated(true);
      } else {
        // Token might be invalid, clear it
        localStorage.removeItem('medusa_customer_token');
        setCustomer(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
      setCustomer(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [getCustomerToken]);

  // Initialize on mount
  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  // Listen for storage changes (for cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'medusa_customer_token') {
        fetchCustomer();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchCustomer]);

  return {
    customer,
    isLoading,
    isAuthenticated,
    getCustomerToken,
    refetch: fetchCustomer
  };
};