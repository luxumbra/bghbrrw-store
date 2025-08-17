"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { Transition } from "@headlessui/react"
import { clx } from "@medusajs/ui"
import { CheckCircleSolid, ExclamationCircleSolid, XCircleSolid } from "@medusajs/icons"
import X from "@modules/common/icons/x"

export type ToastType = "success" | "error" | "warning" | "info"

export interface Toast {
  id: string
  type: ToastType
  title?: string
  message: string
  duration?: number
  autoClose?: boolean
}

interface ToastContextValue {
  toasts: Toast[]
  showToast: (toast: Omit<Toast, "id">) => void
  hideToast: (id: string) => void
  clearAllToasts: () => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    // Provide a fallback instead of throwing an error during SSR/mounting
    console.warn("useToast used outside ToastProvider - providing fallback")
    return {
      toasts: [],
      showToast: () => {},
      hideToast: () => {},
      clearAllToasts: () => {}
    }
  }
  return context
}

interface ToastProviderProps {
  children: React.ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 15)
    const newToast: Toast = {
      id,
      autoClose: true,
      duration: 8000,
      ...toast,
    }

    setToasts(prev => [...prev, newToast])

    // Auto-remove toast after duration
    if (newToast.autoClose && newToast.duration) {
      setTimeout(() => {
        hideToast(id)
      }, newToast.duration)
    }
  }, [])

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast, clearAllToasts }}>
      {children}
      <ToastContainer toasts={toasts} onHideToast={hideToast} />
    </ToastContext.Provider>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onHideToast: (id: string) => void
}

function ToastContainer({ toasts, onHideToast }: ToastContainerProps) {
  return (
    <div
      className="fixed top-4 right-4 z-50 w-full max-w-sm space-y-2"
      data-testid="toast-container"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onHide={onHideToast} />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
  onHide: (id: string) => void
}

function ToastItem({ toast, onHide }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    setIsVisible(true)
  }, [])

  const handleHide = () => {
    setIsVisible(false)
    // Wait for exit animation to complete
    setTimeout(() => onHide(toast.id), 300)
  }

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircleSolid className="h-5 w-5 text-green-400" />
      case "error":
        return <XCircleSolid className="h-5 w-5 text-red-400" />
      case "warning":
        return <ExclamationCircleSolid className="h-5 w-5 text-yellow-400" />
      case "info":
      default:
        return <ExclamationCircleSolid className="h-5 w-5 text-blue-400" />
    }
  }

  const getBackgroundColor = () => {
    switch (toast.type) {
      case "success":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      case "info":
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  return (
    <Transition
      show={isVisible}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div
        className={clx(
          "pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg",
          getBackgroundColor()
        )}
        data-testid={`toast-${toast.type}`}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              {toast.title && (
                <p className="text-sm font-medium text-gray-900">
                  {toast.title}
                </p>
              )}
              <p className={clx(
                "text-sm text-gray-500",
                { "mt-1": toast.title }
              )}>
                {toast.message}
              </p>
            </div>
            <div className="ml-4 flex flex-shrink-0">
              <button
                className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                onClick={handleHide}
                data-testid="toast-close-button"
              >
                <span className="sr-only">Close</span>
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  )
}

// Convenience hooks for different toast types
export const useSuccessToast = () => {
  const { showToast } = useToast()
  return useCallback((message: string, title?: string, options?: Partial<Toast>) => {
    showToast({ type: "success", message, title, ...options })
  }, [showToast])
}

export const useErrorToast = () => {
  const { showToast } = useToast()
  return useCallback((message: string, title?: string, options?: Partial<Toast>) => {
    showToast({ type: "error", message, title, ...options })
  }, [showToast])
}

export const useWarningToast = () => {
  const { showToast } = useToast()
  return useCallback((message: string, title?: string, options?: Partial<Toast>) => {
    showToast({ type: "warning", message, title, ...options })
  }, [showToast])
}

export const useInfoToast = () => {
  const { showToast } = useToast()
  return useCallback((message: string, title?: string, options?: Partial<Toast>) => {
    showToast({ type: "info", message, title, ...options })
  }, [showToast])
}