
import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface PaymentDetails {
    bookId: string;
    userId: string;
    razorpayPaymentId: string;
    razorpayOrderId?: string;
    razorpaySignature?: string;
    amount: number; // in paise
    currency?: string;
}

/**
 * Save payment details to database after successful Razorpay payment
 */
export const savePayment = async (payment: PaymentDetails): Promise<boolean> => {
    if (!isSupabaseConfigured() || !supabase) {
        console.log('📦 [Payment] Supabase not configured, skipping payment save');
        return true; // Return true to not block the flow
    }

    try {
        console.log('💳 [Payment] Saving payment details...', {
            bookId: payment.bookId,
            paymentId: payment.razorpayPaymentId,
            amount: payment.amount / 100 // Convert to rupees for logging
        });

        const { error } = await supabase
            .from('payments')
            .insert({
                book_id: payment.bookId,
                user_id: payment.userId,
                razorpay_payment_id: payment.razorpayPaymentId,
                razorpay_order_id: payment.razorpayOrderId,
                razorpay_signature: payment.razorpaySignature,
                amount: payment.amount,
                currency: payment.currency || 'INR',
                status: 'success'
            });

        if (error) {
            console.error('❌ [Payment] Failed to save payment:', error);
            return false;
        }

        console.log('✅ [Payment] Payment saved successfully');
        return true;
    } catch (err) {
        console.error('❌ [Payment] Error saving payment:', err);
        return false;
    }
};

/**
 * Get payment history for a user
 */
export const getPaymentsByUser = async (userId: string): Promise<any[]> => {
    if (!isSupabaseConfigured() || !supabase) {
        return [];
    }

    try {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ [Payment] Failed to fetch payments:', error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('❌ [Payment] Error fetching payments:', err);
        return [];
    }
};

/**
 * Check if a book has been paid for
 */
export const isBookPaid = async (bookId: string): Promise<boolean> => {
    if (!isSupabaseConfigured() || !supabase) {
        return false;
    }

    try {
        const { data, error } = await supabase
            .from('payments')
            .select('id')
            .eq('book_id', bookId)
            .eq('status', 'success')
            .limit(1);

        if (error) {
            console.error('❌ [Payment] Failed to check payment:', error);
            return false;
        }

        return (data && data.length > 0);
    } catch (err) {
        console.error('❌ [Payment] Error checking payment:', err);
        return false;
    }
};
