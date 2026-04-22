import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, FileText, Car, User, CreditCard, Receipt,
    Percent, Wallet, Banknote
} from 'lucide-react';
import styles from '../../styles/BillModal.module.css';

const BillModal = ({ isOpen, onClose, bills = [] }) => {
    const [activeBillIndex, setActiveBillIndex] = useState(0);

    if (!isOpen) return null;

    const hasBills = bills && bills.length > 0;
    const currentBill = hasBills ? bills[activeBillIndex] : null;

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AnimatePresence>
            <motion.div
                className={styles.overlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className={styles.modal}
                    initial={{ opacity: 0, scale: 0.92, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 30 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={18} />
                    </button>

                    {/* Receipt Header */}
                    <div className={styles.receiptHeader}>
                        <div className={styles.brandLogo}>
                            <Car size={22} style={{ color: '#818cf8' }} />
                            <span className={styles.brandName}>VehicleVerse</span>
                        </div>
                        <div className={styles.receiptLabel}>Payment Receipt</div>
                    </div>

                    {!hasBills ? (
                        <div className={styles.emptyBills}>
                            <div className={styles.emptyBillsIcon}>
                                <Receipt size={48} />
                            </div>
                            <h3>No Bills Yet</h3>
                            <p>Bills will appear here once payments are processed.</p>
                        </div>
                    ) : (
                        <>
                            {/* Bill Tabs (if more than 1 bill) */}
                            {bills.length > 1 && (
                                <div className={styles.billTabs}>
                                    {bills.map((bill, index) => (
                                        <button
                                            key={bill.id || index}
                                            className={`${styles.billTab} ${activeBillIndex === index ? styles.billTabActive : ''}`}
                                            onClick={() => setActiveBillIndex(index)}
                                        >
                                            <span className={styles.billTabLabel}>
                                                {bill.bill_type === 'ADVANCE' ? 'Advance' : 'Final'}
                                            </span>
                                            <span className={styles.billTabAmount}>
                                                ₹{bill.total_amount}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Bill Number & Type */}
                            <div className={styles.billInfoRow}>
                                <div className={styles.billInfoItem}>
                                    <span className={styles.billInfoLabel}>Bill No.</span>
                                    <span className={styles.billInfoValue}>{currentBill.bill_number}</span>
                                </div>
                                <div className={styles.billInfoItem}>
                                    <span className={styles.billInfoLabel}>Type</span>
                                    <span className={`${styles.billTypeBadge} ${currentBill.bill_type === 'ADVANCE' ? styles.advanceBadge : styles.finalBadge}`}>
                                        {currentBill.bill_type_display || currentBill.bill_type}
                                    </span>
                                </div>
                                <div className={styles.billInfoItem}>
                                    <span className={styles.billInfoLabel}>Date</span>
                                    <span className={styles.billInfoValue}>{formatDate(currentBill.created_at)}</span>
                                </div>
                            </div>

                            {/* Booking Details */}
                            <div className={styles.section}>
                                <div className={styles.sectionTitle}>
                                    <FileText size={14} />
                                    Booking Details
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Booking ID</span>
                                    <span className={styles.detailValue}>#{currentBill.booking}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Service Type</span>
                                    <span className={styles.detailValue}>{currentBill.service_type}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Vehicle</span>
                                    <span className={styles.detailValue}>{currentBill.vehicle_name}</span>
                                </div>
                                {currentBill.service_details && (
                                    <div className={styles.detailRow}>
                                        <span className={styles.detailLabel}>Description</span>
                                        <span className={styles.detailValue}>
                                            {currentBill.service_details.length > 80
                                                ? currentBill.service_details.substring(0, 80) + '...'
                                                : currentBill.service_details}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Parties */}
                            <div className={styles.section}>
                                <div className={styles.sectionTitle}>
                                    <User size={14} />
                                    Parties
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Customer</span>
                                    <span className={styles.detailValue}>{currentBill.customer_name}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Mechanic</span>
                                    <span className={styles.detailValue}>{currentBill.mechanic_name}</span>
                                </div>
                            </div>

                            {/* Payment Breakdown */}
                            <div className={styles.amountSection}>
                                <div className={styles.sectionTitle}>
                                    <Wallet size={14} />
                                    Payment Breakdown
                                </div>

                                {/* Total */}
                                <div className={`${styles.amountRow} ${styles.totalRow}`}>
                                    <span className={styles.amountLabel}>Total Amount</span>
                                    <span className={styles.amountValue}>₹{currentBill.total_amount}</span>
                                </div>

                                <div className={styles.divider} />

                                {/* Admin Commission */}
                                <div className={`${styles.amountRow} ${styles.commissionRow}`}>
                                    <span className={styles.amountLabel}>
                                        <Percent size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                                        Platform Fee ({currentBill.admin_commission_percent}%)
                                    </span>
                                    <span className={styles.amountValue}>₹{currentBill.admin_commission_amount}</span>
                                </div>

                                {/* Mechanic Payout */}
                                <div className={`${styles.amountRow} ${styles.mechanicPayoutRow}`}>
                                    <span className={styles.amountLabel}>
                                        <Banknote size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                                        Mechanic Payout
                                    </span>
                                    <span className={styles.amountValue}>₹{currentBill.mechanic_amount}</span>
                                </div>

                                <div className={styles.divider} />

                                {/* Payment Method */}
                                <div className={styles.amountRow}>
                                    <span className={styles.amountLabel}>
                                        <CreditCard size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                                        Payment Method
                                    </span>
                                    <span className={styles.amountValue}>
                                        {currentBill.payment_method
                                            ? currentBill.payment_method.toUpperCase()
                                            : 'N/A'}
                                    </span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className={styles.receiptFooter}>
                                <p className={styles.thankYou}>Thank you for using VehicleVerse!</p>
                                <p className={styles.autoGenNote}>This is an auto-generated receipt. A copy has been emailed.</p>
                            </div>
                        </>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default BillModal;
