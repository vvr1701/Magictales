/**
 * API Client for Magictales Backend
 *
 * Shopify Integration:
 * - In Shopify (*.myshopify.com): API calls go through Shopify App Proxy at /apps/zelavo/api/*
 * - In development: Vite proxies /proxy/api/* to local backend
 *
 * The App Proxy is configured as:
 * - Prefix: apps
 * - Subpath: zelavo/api
 * - Proxy URL: https://your-backend.com/proxy/api
 */

import type {
    PhotoUploadResponse,
    PreviewCreateRequest,
    JobStartResponse,
    JobStatusResponse,
    PreviewResponse,
    DownloadResponse,
    ErrorResponse,
} from '../types/api.types';
import { JobStatus } from '../types/api.types';

// ==================
// Configuration
// ==================

/**
 * Check if Shopify test mode is enabled for local development
 * Set VITE_SHOPIFY_TEST_MODE=true in .env to test Shopify flow locally
 */
const isShopifyTestMode = (): boolean => {
    if (typeof window === 'undefined') return false;
    // Check for test mode flag (set via Vite define or URL param)
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('shopify_test') === 'true' ||
        (window as any).__SHOPIFY_TEST_MODE__ === true;
};

/**
 * Detect if running inside Shopify storefront (or test mode)
 */
export const isShopifyEnvironment = (): boolean => {
    if (typeof window === 'undefined') return false;
    // Real Shopify OR test mode
    return window.location.hostname.endsWith('myshopify.com') || isShopifyTestMode();
};

/**
 * Get API base URL based on environment
 * - Shopify: /apps/zelavo/api (goes through Shopify App Proxy)
 * - Development: /proxy/api (Vite proxies to local backend)
 */
const getApiBase = (): string => {
    // In test mode, still use local proxy
    if (isShopifyTestMode()) {
        return '/proxy/api';
    }
    return isShopifyEnvironment() ? '/apps/zelavo/api' : '/proxy/api';
};

const API_BASE = getApiBase();

/**
 * Get Shopify customer context from Liquid-injected data attributes
 * The Liquid template should inject: <div id="zelavo-app" data-customer-id="..." data-customer-email="...">
 */
export const getShopifyCustomerContext = (): { customerId: string | null; customerEmail: string | null; shopDomain: string | null } => {
    if (typeof document === 'undefined') {
        return { customerId: null, customerEmail: null, shopDomain: null };
    }

    const appElement = document.getElementById('zelavo-app');
    if (!appElement) {
        return { customerId: null, customerEmail: null, shopDomain: null };
    }

    return {
        customerId: appElement.dataset.customerId || null,
        customerEmail: appElement.dataset.customerEmail || null,
        shopDomain: appElement.dataset.shopDomain || null,
    };
};

/**
 * Check if user is logged into Shopify
 */
export const isShopifyCustomerLoggedIn = (): boolean => {
    const { customerId } = getShopifyCustomerContext();
    return !!customerId && customerId !== 'null' && customerId !== '';
};

// ==================
// Helper Functions
// ==================

class ApiError extends Error {
    constructor(
        message: string,
        public code: string,
        public details?: Record<string, unknown>
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Get or create a session ID for guest users (same as AuthModal)
 */
const getOrCreateSessionId = (): string => {
    if (typeof localStorage === 'undefined') {
        return `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    let sessionId = localStorage.getItem('magictales_session_id');
    if (!sessionId) {
        sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('magictales_session_id', sessionId);
    }
    return sessionId;
};

/**
 * Build headers for API requests, including Shopify customer context when available
 */
function buildHeaders(additionalHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
        ...additionalHeaders,
    };

    // Add Shopify customer ID header if available (for tracking/linking)
    const { customerId, customerEmail } = getShopifyCustomerContext();
    if (customerId) {
        headers['X-Shopify-Customer-Id'] = customerId;
    }
    if (customerEmail) {
        headers['X-Shopify-Customer-Email'] = customerEmail;
    }

    // Add session ID for guest users (used for linking previews when they sign up)
    if (!customerId) {
        headers['X-Session-Id'] = getOrCreateSessionId();
    }

    return headers;
}


async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        let errorData: ErrorResponse | null = null;
        try {
            errorData = await response.json();
        } catch {
            // Response was not JSON
        }

        if (errorData?.error) {
            throw new ApiError(
                errorData.error.message,
                errorData.error.code,
                errorData.error.details
            );
        }

        throw new ApiError(
            `Request failed with status ${response.status}`,
            'REQUEST_FAILED'
        );
    }

    return response.json();
}

// ==================
// API Methods
// ==================

/**
 * Upload a child's photo for face validation
 */
export async function uploadPhoto(file: File): Promise<PhotoUploadResponse> {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await fetch(`${API_BASE}/upload-photo`, {
        method: 'POST',
        headers: buildHeaders(),
        body: formData,
    });

    return handleResponse<PhotoUploadResponse>(response);
}

/**
 * Create a new preview generation job
 */
export async function createPreview(
    request: PreviewCreateRequest
): Promise<JobStartResponse> {
    const response = await fetch(`${API_BASE}/preview`, {
        method: 'POST',
        headers: buildHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(request),
    });

    return handleResponse<JobStartResponse>(response);
}

/**
 * Get the status of a generation job
 */
export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
    const response = await fetch(`${API_BASE}/status/${jobId}`, {
        headers: buildHeaders(),
    });
    return handleResponse<JobStatusResponse>(response);
}

/**
 * Get preview data for display
 */
export async function getPreview(previewId: string): Promise<PreviewResponse> {
    const response = await fetch(`${API_BASE}/preview/${previewId}`, {
        headers: buildHeaders(),
    });
    return handleResponse<PreviewResponse>(response);
}

/**
 * Get download links for a completed order
 */
export async function getDownload(orderId: string): Promise<DownloadResponse> {
    const response = await fetch(`${API_BASE}/download/${orderId}`, {
        headers: buildHeaders(),
    });
    return handleResponse<DownloadResponse>(response);
}

/**
 * Retry a failed generation job
 * Returns a new job_id to poll for status
 */
export async function retryJob(jobId: string): Promise<JobStartResponse> {
    const response = await fetch(`${API_BASE}/preview/${jobId}/retry`, {
        method: 'POST',
        headers: buildHeaders(),
    });
    return handleResponse<JobStartResponse>(response);
}

// ==================
// Polling Helpers
// ==================

interface PollOptions {
    /** Interval between polls in ms (default: 2000) */
    interval?: number;
    /** Maximum time to wait in ms (default: 300000 = 5 minutes) */
    timeout?: number;
    /** Callback for progress updates */
    onProgress?: (progress: number, step?: string) => void;
}

/**
 * Poll a job until completion or failure
 */
export async function pollJobUntilComplete(
    jobId: string,
    options: PollOptions = {}
): Promise<JobStatusResponse> {
    const { interval = 2000, timeout = 300000, onProgress } = options;
    const startTime = Date.now();

    while (true) {
        const status = await getJobStatus(jobId);

        // Report progress
        if (onProgress) {
            onProgress(status.progress, status.current_step);
        }

        // Check terminal states
        if (status.status === JobStatus.COMPLETED) {
            return status;
        }

        if (status.status === JobStatus.FAILED) {
            throw new ApiError(
                status.error || 'Job failed',
                'JOB_FAILED',
                { can_retry: status.can_retry }
            );
        }

        // Check timeout
        if (Date.now() - startTime > timeout) {
            throw new ApiError(
                'Job timed out waiting for completion',
                'JOB_TIMEOUT'
            );
        }

        // Wait before next poll
        await new Promise((resolve) => setTimeout(resolve, interval));
    }
}

// ==================
// Shopify Cart Integration
// ==================

/**
 * Shopify product configuration
 * UPDATE THIS with your actual Shopify product variant ID
 */
export const SHOPIFY_CONFIG = {
    // The numeric variant ID of your "Personalized MagicTales Storybook" product
    // Store: storygift-2061.myshopify.com
    PRODUCT_VARIANT_ID: 10089880912148, // Your actual variant ID
    PRODUCT_PRICE_USD: 29.99, // Display price (actual price set in Shopify)
};

/**
 * Add the storybook to Shopify cart with preview_id as line item property
 * This allows the webhook to link the order to the specific preview
 *
 * In test mode, calls the backend mock cart endpoint instead
 */
export async function addToShopifyCart(previewId: string): Promise<{ success: boolean; error?: string; testOrderId?: string }> {
    // In test mode, call our backend mock endpoint
    if (isShopifyTestMode()) {
        console.log('[Shopify Test] Using mock cart endpoint for testing');
        try {
            const response = await fetch(`${API_BASE}/test/cart/add`, {
                method: 'POST',
                headers: buildHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({
                    preview_id: previewId,
                    variant_id: SHOPIFY_CONFIG.PRODUCT_VARIANT_ID || 'test-variant',
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[Shopify Test] Mock cart failed:', errorText);
                return { success: false, error: 'Failed to add to cart' };
            }

            const data = await response.json();
            console.log('[Shopify Test] Mock cart success:', data);
            return { success: true, testOrderId: data.order_id };
        } catch (error) {
            console.error('[Shopify Test] Mock cart error:', error);
            return { success: false, error: 'Network error' };
        }
    }

    // Real Shopify environment
    if (!isShopifyEnvironment()) {
        console.warn('[Shopify Cart] Not in Shopify environment, cannot add to cart');
        return { success: false, error: 'Not in Shopify environment' };
    }

    if (SHOPIFY_CONFIG.PRODUCT_VARIANT_ID === 0) {
        console.error('[Shopify Cart] PRODUCT_VARIANT_ID not configured!');
        return { success: false, error: 'Product not configured' };
    }

    try {
        const response = await fetch('/cart/add.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                items: [{
                    id: SHOPIFY_CONFIG.PRODUCT_VARIANT_ID,
                    quantity: 1,
                    properties: {
                        '_preview_id': previewId, // Underscore prefix hides from customer but available to backend
                        'Child\'s Story': 'Personalized Storybook', // Visible to customer
                    }
                }]
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Shopify Cart] Failed to add to cart:', errorText);
            return { success: false, error: 'Failed to add to cart' };
        }

        console.log('[Shopify Cart] Successfully added to cart with preview_id:', previewId);
        return { success: true };
    } catch (error) {
        console.error('[Shopify Cart] Error adding to cart:', error);
        return { success: false, error: 'Network error' };
    }
}

/**
 * Redirect to Shopify checkout with return URL
 * After checkout completion, user returns to preview page with ?checkout_success=true
 */
export function redirectToShopifyCheckout(previewId: string, testOrderId?: string): void {
    if (isShopifyTestMode() && testOrderId) {
        // In test mode, redirect to our test checkout simulation
        window.location.href = `/preview/${testOrderId}?checkout_success=true`;
        return;
    }

    if (isShopifyEnvironment()) {
        // Redirect to checkout with return URL that brings user back to preview
        const returnUrl = encodeURIComponent(`/apps/zelavo/preview/${previewId}?checkout_success=true`);
        window.location.href = `/checkout?return_to=${returnUrl}`;
    } else {
        console.warn('[Shopify] Not in Shopify environment, cannot redirect to checkout');
    }
}

/**
 * Add to cart and immediately redirect to checkout (Buy Now flow)
 * In test mode, simulates the entire payment flow
 */
export async function buyNowWithShopify(previewId: string): Promise<void> {
    const result = await addToShopifyCart(previewId);
    if (result.success) {
        if (isShopifyTestMode()) {
            // In test mode, trigger the test webhook and show success
            console.log('[Shopify Test] Triggering test payment webhook...');
            try {
                const webhookResponse = await fetch(`${API_BASE}/test/simulate-payment`, {
                    method: 'POST',
                    headers: buildHeaders({ 'Content-Type': 'application/json' }),
                    body: JSON.stringify({
                        preview_id: previewId,
                        order_id: result.testOrderId || `test-order-${Date.now()}`,
                    }),
                });

                if (webhookResponse.ok) {
                    const data = await webhookResponse.json();
                    console.log('[Shopify Test] Payment simulation complete:', data);
                    // Redirect to preview with success message
                    window.location.href = `/preview/${previewId}?payment_success=true&order_id=${data.order_id}`;
                    return;
                }
            } catch (error) {
                console.error('[Shopify Test] Payment simulation failed:', error);
            }
        }
        redirectToShopifyCheckout(previewId, result.testOrderId);
    } else {
        throw new ApiError(result.error || 'Failed to add to cart', 'CART_ERROR');
    }
}

// ==================
// Export API object for convenience
// ==================

export const api = {
    uploadPhoto,
    createPreview,
    getJobStatus,
    getPreview,
    getDownload,
    retryJob,
    pollJobUntilComplete,
    ApiError,
    // Shopify integration
    isShopifyEnvironment,
    getShopifyCustomerContext,
    isShopifyCustomerLoggedIn,
    addToShopifyCart,
    redirectToShopifyCheckout,
    buyNowWithShopify,
    SHOPIFY_CONFIG,
};

export default api;
