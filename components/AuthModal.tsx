/**
 * AuthModal Component
 * 
 * Displays a modal prompting users to login, signup, or continue as guest.
 * Uses Shopify's customer account system for authentication.
 */

import React from 'react';
import { X, User, UserPlus, ArrowRight, AlertCircle } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGuestContinue: () => void;
    title?: string;
    subtitle?: string;
    returnPath?: string;
    showGuestWarning?: boolean;
}

/**
 * Get Shopify login URL with return path
 */
export const getShopifyLoginUrl = (returnPath?: string): string => {
    const currentPath = returnPath || window.location.pathname + window.location.search;
    return `/account/login?return_url=${encodeURIComponent(currentPath)}`;
};

/**
 * Get Shopify signup URL with return path
 */
export const getShopifySignupUrl = (returnPath?: string): string => {
    const currentPath = returnPath || window.location.pathname + window.location.search;
    return `/account/register?return_url=${encodeURIComponent(currentPath)}`;
};

/**
 * Check if user has chosen guest mode previously
 */
export const hasChosenGuestMode = (): boolean => {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem('magictales_guest_mode') === 'true';
};

/**
 * Set guest mode preference
 */
export const setGuestMode = (value: boolean): void => {
    if (typeof localStorage !== 'undefined') {
        if (value) {
            localStorage.setItem('magictales_guest_mode', 'true');
        } else {
            localStorage.removeItem('magictales_guest_mode');
        }
    }
};

/**
 * Get or create a session ID for guest users
 */
export const getOrCreateSessionId = (): string => {
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

const AuthModal: React.FC<AuthModalProps> = ({
    isOpen,
    onClose,
    onGuestContinue,
    title = "Sign in to save your creations",
    subtitle = "Your magical stories will be saved to your account for 7 days",
    returnPath,
    showGuestWarning = true,
}) => {
    if (!isOpen) return null;

    const handleLogin = () => {
        // Save any form data to localStorage before redirect
        window.location.href = getShopifyLoginUrl(returnPath);
    };

    const handleSignup = () => {
        // Save any form data to localStorage before redirect
        window.location.href = getShopifySignupUrl(returnPath);
    };

    const handleGuestContinue = () => {
        setGuestMode(true);
        getOrCreateSessionId(); // Ensure session ID exists
        onGuestContinue();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-pink-400 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-heading text-center text-gray-800 mb-2">
                    {title}
                </h2>

                {/* Subtitle */}
                <p className="text-gray-500 text-center mb-6">
                    {subtitle}
                </p>

                {/* Buttons */}
                <div className="space-y-3">
                    {/* Login Button */}
                    <button
                        onClick={handleLogin}
                        className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
                    >
                        <User className="w-5 h-5" />
                        Sign in with Shopify
                        <ArrowRight className="w-4 h-4 ml-auto" />
                    </button>

                    {/* Signup Button */}
                    <button
                        onClick={handleSignup}
                        className="w-full py-3 px-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-primary/50"
                    >
                        <UserPlus className="w-5 h-5" />
                        Create Account
                        <ArrowRight className="w-4 h-4 ml-auto" />
                    </button>

                    {/* Divider */}
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-400">or</span>
                        </div>
                    </div>

                    {/* Guest Continue */}
                    <button
                        onClick={handleGuestContinue}
                        className="w-full py-2 text-gray-500 hover:text-primary font-medium transition-colors"
                    >
                        Continue as Guest
                    </button>
                </div>

                {/* Guest Warning */}
                {showGuestWarning && (
                    <div className="mt-4 p-3 bg-amber-50 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-700">
                            Guest creations won't appear in your dashboard and can't be recovered if you clear your browser data.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthModal;
