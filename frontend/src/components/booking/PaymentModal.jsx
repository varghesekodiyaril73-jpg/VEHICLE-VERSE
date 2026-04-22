import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard, Smartphone, X, Lock, Shield,
    CheckCircle, Loader2, AlertCircle
} from 'lucide-react';
import styles from '../../styles/PaymentModal.module.css';

// ── Validation Helpers ──

const luhnCheck = (num) => {
    const digits = num.replace(/\s/g, '').split('').reverse().map(Number);
    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
        let d = digits[i];
        if (i % 2 === 1) {
            d *= 2;
            if (d > 9) d -= 9;
        }
        sum += d;
    }
    return sum % 10 === 0;
};

const isExpiryValid = (expiry) => {
    if (!expiry || expiry.length !== 5) return false;
    const [monthStr, yearStr] = expiry.split('/');
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10) + 2000;

    if (month < 1 || month > 12) return false;

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;

    return true;
};

const validateCardForm = (cardNumber, cardName, cardExpiry, cardCvv) => {
    const errors = {};
    const cleanNum = cardNumber.replace(/\s/g, '');

    if (!cleanNum || cleanNum.length !== 16) {
        errors.cardNumber = 'Card number must be exactly 16 digits';
    } else if (!luhnCheck(cleanNum)) {
        errors.cardNumber = 'Invalid card number';
    }

    if (!cardName || cardName.trim().length < 2) {
        errors.cardName = 'Cardholder name is required';
    } else if (!/^[a-zA-Z\s.]+$/.test(cardName.trim())) {
        errors.cardName = 'Name must contain only letters and spaces';
    }

    if (!cardExpiry || cardExpiry.length !== 5) {
        errors.cardExpiry = 'Expiry date is required (MM/YY)';
    } else if (!isExpiryValid(cardExpiry)) {
        errors.cardExpiry = 'Card is expired or invalid date';
    }

    if (!cardCvv || cardCvv.length !== 3) {
        errors.cardCvv = 'CVV must be exactly 3 digits';
    }

    return errors;
};

const validateUpiForm = (upiId) => {
    const errors = {};
    if (!upiId || !upiId.trim()) {
        errors.upiId = 'UPI ID is required';
    } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z]+$/.test(upiId.trim())) {
        errors.upiId = 'Invalid UPI ID format (e.g., name@upi)';
    }
    return errors;
};

const PaymentModal = ({
    isOpen,
    onClose,
    amount,
    minAmount = 0,
    allowHigherAmount = true,
    onPaymentComplete,
    title = 'Secure Payment',
    description = 'Complete your payment with confidence'
}) => {
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [customAmount, setCustomAmount] = useState(amount);
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    // Card form state
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');

    // UPI form state
    const [upiId, setUpiId] = useState('');

    // Format card number with spaces
    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        return parts.length ? parts.join(' ') : value;
    };

    // Format expiry date
    const formatExpiry = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            // Validate month range (01-12)
            let month = parseInt(v.slice(0, 2), 10);
            if (month > 12) month = 12;
            if (month < 1 && v.length >= 2) month = 1;
            const monthStr = month.toString().padStart(2, '0');
            return monthStr + '/' + v.slice(2, 4);
        }
        return v;
    };

    const handleCardNumberChange = (e) => {
        const formatted = formatCardNumber(e.target.value);
        if (formatted.length <= 19) setCardNumber(formatted);
        if (formErrors.cardNumber) setFormErrors(prev => ({ ...prev, cardNumber: '' }));
    };

    const handleExpiryChange = (e) => {
        const formatted = formatExpiry(e.target.value.replace('/', ''));
        if (formatted.length <= 5) setCardExpiry(formatted);
        if (formErrors.cardExpiry) setFormErrors(prev => ({ ...prev, cardExpiry: '' }));
    };

    const handleCvvChange = (e) => {
        const v = e.target.value.replace(/[^0-9]/g, '');
        if (v.length <= 3) setCardCvv(v);
        if (formErrors.cardCvv) setFormErrors(prev => ({ ...prev, cardCvv: '' }));
    };

    const handleCardNameChange = (e) => {
        setCardName(e.target.value);
        if (formErrors.cardName) setFormErrors(prev => ({ ...prev, cardName: '' }));
    };

    const handleUpiChange = (e) => {
        setUpiId(e.target.value);
        if (formErrors.upiId) setFormErrors(prev => ({ ...prev, upiId: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate based on payment method
        let errors = {};
        if (paymentMethod === 'card') {
            errors = validateCardForm(cardNumber, cardName, cardExpiry, cardCvv);
        } else {
            errors = validateUpiForm(upiId);
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setFormErrors({});
        setProcessing(true);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        setProcessing(false);
        setSuccess(true);

        // Wait for success animation then call callback
        setTimeout(() => {
            const paymentData = {
                amount: customAmount,
                payment_method: paymentMethod,
                ...(paymentMethod === 'card' ? {
                    card_number: cardNumber,
                    card_name: cardName,
                    card_expiry: cardExpiry,
                    card_cvv: cardCvv
                } : {
                    upi_id: upiId
                })
            };
            onPaymentComplete(paymentData);
        }, 1500);
    };

    const handleClose = () => {
        if (!processing && !success) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className={styles.overlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
            >
                <motion.div
                    className={styles.modal}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Processing/Success Overlay */}
                    <AnimatePresence>
                        {(processing || success) && (
                            <motion.div
                                className={styles.processingOverlay}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {processing ? (
                                    <div className={styles.processingContent}>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        >
                                            <Loader2 size={48} className={styles.spinner} />
                                        </motion.div>
                                        <h3>Processing Payment...</h3>
                                        <p>Please wait while we process your payment</p>
                                    </div>
                                ) : (
                                    <motion.div
                                        className={styles.successContent}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', damping: 15 }}
                                    >
                                        <motion.div
                                            className={styles.successIcon}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.2, type: 'spring' }}
                                        >
                                            <CheckCircle size={64} />
                                        </motion.div>
                                        <h3>Payment Successful!</h3>
                                        <p>Your payment of ₹{customAmount} has been processed</p>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Close Button */}
                    {!processing && !success && (
                        <button className={styles.closeBtn} onClick={handleClose}>
                            <X size={20} />
                        </button>
                    )}

                    {/* Header */}
                    <div className={styles.header}>
                        <div className={styles.headerIcon}>
                            <CreditCard size={32} />
                        </div>
                        <h2>{title}</h2>
                        <p>{description}</p>
                    </div>

                    {/* Body */}
                    <div className={styles.body}>
                        {/* Payment Method Tabs */}
                        <div className={styles.methodTabs}>
                            <button
                                className={`${styles.methodTab} ${paymentMethod === 'card' ? styles.active : ''}`}
                                onClick={() => setPaymentMethod('card')}
                            >
                                <CreditCard size={16} /> Credit Card
                            </button>
                            <button
                                className={`${styles.methodTab} ${paymentMethod === 'upi' ? styles.active : ''}`}
                                onClick={() => setPaymentMethod('upi')}
                            >
                                <Smartphone size={16} /> UPI
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Card Form */}
                            {paymentMethod === 'card' && (
                                <div className={styles.cardForm}>
                                    {/* Card Preview */}
                                    <div className={styles.cardPreview}>
                                        <div className={styles.cardChip}>
                                            <div className={styles.chipLines}></div>
                                        </div>
                                        <div className={styles.cardNumber}>
                                            {cardNumber || '•••• •••• •••• ••••'}
                                        </div>
                                        <div className={styles.cardDetails}>
                                            <div className={styles.cardName}>
                                                {cardName.toUpperCase() || 'CARDHOLDER NAME'}
                                            </div>
                                            <div className={styles.cardExpiry}>
                                                {cardExpiry || '••/••'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Card Number</label>
                                        <input
                                            type="text"
                                            className={`${styles.formControl} ${formErrors.cardNumber ? styles.formControlError : ''}`}
                                            placeholder="1234 5678 9012 3456"
                                            value={cardNumber}
                                            onChange={handleCardNumberChange}
                                            required
                                        />
                                        {formErrors.cardNumber && (
                                            <span className={styles.fieldError}>
                                                <AlertCircle size={12} />
                                                {formErrors.cardNumber}
                                            </span>
                                        )}
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Cardholder Name</label>
                                        <input
                                            type="text"
                                            className={`${styles.formControl} ${formErrors.cardName ? styles.formControlError : ''}`}
                                            placeholder="Name as on card"
                                            value={cardName}
                                            onChange={handleCardNameChange}
                                            required
                                        />
                                        {formErrors.cardName && (
                                            <span className={styles.fieldError}>
                                                <AlertCircle size={12} />
                                                {formErrors.cardName}
                                            </span>
                                        )}
                                    </div>

                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Expiry Date</label>
                                            <input
                                                type="text"
                                                className={`${styles.formControl} ${formErrors.cardExpiry ? styles.formControlError : ''}`}
                                                placeholder="MM/YY"
                                                value={cardExpiry}
                                                onChange={handleExpiryChange}
                                                required
                                            />
                                            {formErrors.cardExpiry && (
                                                <span className={styles.fieldError}>
                                                    <AlertCircle size={12} />
                                                    {formErrors.cardExpiry}
                                                </span>
                                            )}
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>CVV</label>
                                            <input
                                                type="password"
                                                className={`${styles.formControl} ${formErrors.cardCvv ? styles.formControlError : ''}`}
                                                placeholder="•••"
                                                value={cardCvv}
                                                onChange={handleCvvChange}
                                                required
                                            />
                                            {formErrors.cardCvv && (
                                                <span className={styles.fieldError}>
                                                    <AlertCircle size={12} />
                                                    {formErrors.cardCvv}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* UPI Form */}
                            {paymentMethod === 'upi' && (
                                <div className={styles.upiForm}>
                                    <div className={styles.upiApps}>
                                        <div className={styles.upiApp} onClick={() => setUpiId('googlepay@upi')}>
                                            <div className={`${styles.upiAppIcon} ${styles.gpay}`}>G</div>
                                            <span>Google Pay</span>
                                        </div>
                                        <div className={styles.upiApp} onClick={() => setUpiId('phonepe@ybl')}>
                                            <div className={`${styles.upiAppIcon} ${styles.phonepe}`}>P</div>
                                            <span>PhonePe</span>
                                        </div>
                                        <div className={styles.upiApp} onClick={() => setUpiId('paytm@paytm')}>
                                            <div className={`${styles.upiAppIcon} ${styles.paytm}`}>₹</div>
                                            <span>Paytm</span>
                                        </div>
                                        <div className={styles.upiApp} onClick={() => setUpiId('amazon@apl')}>
                                            <div className={`${styles.upiAppIcon} ${styles.amazon}`}>A</div>
                                            <span>Amazon</span>
                                        </div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Enter UPI ID</label>
                                        <input
                                            type="text"
                                            className={`${styles.formControl} ${formErrors.upiId ? styles.formControlError : ''}`}
                                            placeholder="yourname@upi"
                                            value={upiId}
                                            onChange={handleUpiChange}
                                            required
                                        />
                                        {formErrors.upiId && (
                                            <span className={styles.fieldError}>
                                                <AlertCircle size={12} />
                                                {formErrors.upiId}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Amount */}
                            <div className={styles.amountSection}>
                                <div className={styles.amountLabel}>Total Amount</div>
                                {allowHigherAmount ? (
                                    <div className={styles.amountInput}>
                                        <span className={styles.currencySymbol}>₹</span>
                                        <input
                                            type="number"
                                            value={customAmount}
                                            onChange={(e) => setCustomAmount(Math.max(minAmount, Number(e.target.value)))}
                                            min={minAmount}
                                            className={styles.amountField}
                                        />
                                    </div>
                                ) : (
                                    <div className={styles.amountValue}>₹{amount}</div>
                                )}
                                {minAmount > 0 && (
                                    <div className={styles.minNote}>Minimum: ₹{minAmount}</div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                type="submit"
                                className={styles.payButton}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={processing}
                            >
                                <Lock size={18} />
                                Pay ₹{customAmount}
                            </motion.button>

                            {/* Security Note */}
                            <div className={styles.securityNote}>
                                <Shield size={14} />
                                <span>Your payment is secured with 256-bit encryption</span>
                            </div>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className={styles.footer}>
                        <span className={styles.cardIcon}>VISA</span>
                        <span className={styles.cardIcon}>MC</span>
                        <span className={styles.cardIcon}>AMEX</span>
                        <span className={styles.cardIcon}>UPI</span>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PaymentModal;
