/**
 * Axios API Client with Auth Interceptor
 *
 * This module configures the Axios client for making HTTP requests to the CMS API.
 * It includes authentication token injection and error handling.
 */

import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { toast } from 'sonner'
import type { ApiError } from './types'

// ============================================================================
// Configuration
// ============================================================================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'
const API_TIMEOUT = 30000 // 30 seconds

// ============================================================================
// Auth Token Management
// ============================================================================

/**
 * Get the authentication token from storage
 * Uses Clerk's token management if available, otherwise falls back to localStorage
 */
async function getAuthToken(): Promise<string | null> {
  // Try to get token from Clerk (if available)
  if (window.Clerk?.session) {
    try {
      const token = await window.Clerk.session.getToken()
      return token
    } catch {
      // Fall through to localStorage
    }
  }

  // Fallback to localStorage
  return localStorage.getItem('auth_token')
}

/**
 * Get current user info for request headers
 */
function getCurrentUser() {
  if (window.Clerk?.user) {
    return {
      id: window.Clerk.user.id,
      email: window.Clerk.user.primaryEmailAddress?.emailAddress,
      name: `${window.Clerk.user.firstName || ''} ${window.Clerk.user.lastName || ''}`.trim(),
    }
  }

  // Try to get from localStorage
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }

  return null
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Extract error information from Axios error or API error response
 */
function extractErrorInfo(error: unknown): { code: ApiError['error']; message: string } {
  // Network error
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>

    // No response from server (network error, timeout, etc.)
    if (!axiosError.response) {
      return {
        code: 'NETWORK_ERROR',
        message: axiosError.code === 'ECONNABORTED'
          ? 'Request timeout. Please try again.'
          : 'Network error. Please check your connection.',
      }
    }

    // Server responded with error
    const { data } = axiosError.response
    if (data?.error && data?.message) {
      return {
        code: data.error,
        message: data.message,
      }
    }

    // Default HTTP error messages
    const statusMessages: Record<number, string> = {
      400: 'Invalid request. Please check your input.',
      401: 'Authentication required. Please sign in.',
      403: 'You do not have permission to perform this action.',
      404: 'The requested resource was not found.',
      409: 'This resource already exists.',
      422: 'Validation error. Please check your input.',
      429: 'Too many requests. Please try again later.',
      500: 'Server error. Please try again later.',
      502: 'Service unavailable. Please try again later.',
      503: 'Service temporarily unavailable.',
    }

    return {
      code: 'INTERNAL_ERROR',
      message: statusMessages[axiosError.response.status] || 'An unexpected error occurred.',
    }
  }

  // Unknown error
  return {
    code: 'INTERNAL_ERROR',
    message: error instanceof Error ? error.message : 'An unexpected error occurred.',
  }
}

/**
 * Show error toast with appropriate message
 */
function showErrorToast(error: unknown) {
  const { message } = extractErrorInfo(error)
  toast.error(message)
}

// ============================================================================
// Axios Instance Creation
// ============================================================================

/**
 * Create and configure the Axios instance
 */
function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: `${API_URL}/api`,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request interceptor - Add auth token
  client.interceptors.request.use(
    async (config) => {
      // Add auth token if available
      const token = await getAuthToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      // Add user context if available
      const user = getCurrentUser()
      if (user) {
        config.headers['X-User-ID'] = user.id
        config.headers['X-User-Email'] = user.email
      }

      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor - Handle errors
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      // Handle 401 Unauthorized - redirect to login
      if (error.response?.status === 401) {
        // Clear stored auth data
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')

        // Redirect to sign-in page
        window.location.href = '/sign-in'

        return Promise.reject(error)
      }

      // Show error toast for other errors
      showErrorToast(error)

      return Promise.reject(error)
    }
  )

  return client
}

// ============================================================================
// Export
// ============================================================================

export const apiClient = createApiClient()

export { extractErrorInfo, showErrorToast }

// Re-export types
export type { ApiError }

// Extend Window interface for Clerk
declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken(): Promise<string | null>
      }
      user?: {
        id: string
        primaryEmailAddress?: {
          emailAddress: string
        }
        firstName?: string | null
        lastName?: string | null
      }
    }
  }
}
