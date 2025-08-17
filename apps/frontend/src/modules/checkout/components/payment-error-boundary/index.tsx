"use client"

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Alert, Button, Text } from '@medusajs/ui'
import { RefreshCw } from '@medusajs/icons'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorId: string
}

class PaymentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { 
      hasError: false,
      errorId: Date.now().toString(36)
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      errorId: Date.now().toString(36)
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Payment Error Boundary caught an error:', error, errorInfo)
    
    // Log error details for debugging
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      errorId: this.state.errorId,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    })

    // Call optional error handler
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: undefined,
      errorId: Date.now().toString(36)
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="p-6 max-w-md mx-auto">
          <Alert variant="error" className="mb-4">
            <div className="flex flex-col gap-4">
              <div>
                <Text className="font-medium mb-2">Payment System Error</Text>
                <Text className="text-sm mb-3">
                  Something went wrong with the payment system. This could be due to a temporary issue.
                </Text>
                <Text className="text-xs text-ui-fg-muted mb-3">
                  Error ID: {this.state.errorId}
                </Text>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  size="small"
                  onClick={this.handleRetry}
                  className="flex items-center gap-2"
                >
                  <RefreshCw size={14} />
                  Try Again
                </Button>
                
                <Button 
                  variant="secondary" 
                  size="small"
                  onClick={this.handleReload}
                >
                  Reload Page
                </Button>
              </div>
              
              <Text className="text-xs text-ui-fg-muted">
                If the problem persists, please contact support with the error ID above.
              </Text>
            </div>
          </Alert>
        </div>
      )
    }

    return this.props.children
  }
}

export default PaymentErrorBoundary