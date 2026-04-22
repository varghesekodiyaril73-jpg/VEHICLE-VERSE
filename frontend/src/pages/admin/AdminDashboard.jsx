import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart2, TrendingUp, TrendingDown, DollarSign, Users, Wrench,
    Calendar, AlertTriangle, CheckCircle, Clock, Car, X
} from 'lucide-react';
import styles from '../../styles/AdminDashboard.module.css';
import AdminLayout from '../../components/layout/AdminLayout';
import { getAdminStats } from '../../services/bookingService';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month');
    const [customDates, setCustomDates] = useState({ start: '', end: '' });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (period !== 'custom') {
            fetchStats(period);
        }
    }, [period]);

    const fetchStats = async (periodToFetch = period, start = customDates.start, end = customDates.end) => {
        try {
            setLoading(true);
            const data = await getAdminStats(periodToFetch, start, end);
            setStats(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching admin stats:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getPeriodLabel = () => {
        switch (period) {
            case 'week': return 'This Week';
            case 'year': return 'This Year';
            case 'custom': return 'Custom Period';
            default: return 'This Month';
        }
    };

    // Generate smooth bezier curve path from data
    const generateSmoothChartPath = (data, key) => {
        if (!data || data.length === 0) return "M 0 100 L 800 100";

        const maxVal = Math.max(...data.map(d => Math.max(d.current || 0, d.previous || 0)), 1);
        const yRatio = 160 / maxVal; // Max height is 160 (leaves 20px padding)

        const points = data.map((d, i) => {
            const x = (i / (data.length - 1 || 1)) * 800;
            const y = 180 - ((d[key] || 0) * yRatio);
            return { x, y };
        });

        if (points.length === 1) return `M 0 ${points[0].y} L 800 ${points[0].y}`;

        // Create smooth cubic bezier curve
        let path = `M ${points[0].x} ${points[0].y}`;

        for (let i = 0; i < points.length - 1; i++) {
            const current = points[i];
            const next = points[i + 1];

            // Calculate control points (horizontal tension)
            const tension = 0.4;
            const cp1x = current.x + (next.x - current.x) * tension;
            const cp1y = current.y;
            const cp2x = next.x - (next.x - current.x) * tension;
            const cp2y = next.y;

            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
        }

        return path;
    };

    if (loading && !stats) {
        return (
            <AdminLayout>
                <div className={styles.loadingState}>Loading dashboard...</div>
            </AdminLayout>
        );
    }

    const statsCards = stats ? [
        {
            label: `Revenue ${getPeriodLabel()}`,
            value: formatCurrency(stats.revenue?.current_period || 0),
            icon: TrendingUp,
            change: stats.revenue?.percentage_change || 0
        },
        {
            label: 'Total Customers',
            value: stats.users?.total_customers?.toString() || '0',
            icon: Users
        },
        {
            label: 'Total Mechanics',
            value: stats.users?.total_mechanics?.toString() || '0',
            icon: Wrench
        },
    ] : [];

    const chartPath1 = stats?.revenue?.chart_data ? generateSmoothChartPath(stats.revenue.chart_data, 'current') : "M 0 100 L 800 100";
    const chartPath2 = stats?.revenue?.chart_data ? generateSmoothChartPath(stats.revenue.chart_data, 'previous') : "M 0 120 L 800 120";
    const chartLabels = stats?.revenue?.chart_data?.map(d => d.label) || [];

    return (
        <AdminLayout>
            {/* Page Header */}
            <motion.div
                className={styles.pageHeader}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <p className={styles.breadcrumb}>Pages / Dashboard</p>
                <h1 className={styles.pageTitle}>Main Dashboard</h1>
            </motion.div>

            {error && (
                <div className={styles.errorBanner}>
                    <AlertTriangle size={18} />
                    {error}
                </div>
            )}

            {/* Stats Grid */}
            <motion.div
                className={styles.statsGrid}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                {statsCards.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        className={styles.statCard}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        whileHover={{ y: -4 }}
                    >
                        <div className={styles.statIcon}>
                            <stat.icon size={22} />
                        </div>
                        <div className={styles.statInfo}>
                            <p className={styles.statLabel}>{stat.label}</p>
                            <h3 className={styles.statValue}>{stat.value}</h3>
                            {stat.change !== undefined && (
                                <span className={`${styles.statChange} ${stat.change >= 0 ? styles.positive : styles.negative}`}>
                                    {stat.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                    {stat.change >= 0 ? '+' : ''}{stat.change.toFixed(1)}%
                                </span>
                            )}
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Chart Card */}
            <motion.div
                className={styles.chartCard}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <div className={styles.chartHeader}>
                    <div className={styles.periodSelectorWrapper}>
                        <div className={styles.periodButtons}>
                            <button
                                className={`${styles.chartToggle} ${period === 'week' ? styles.active : ''}`}
                                onClick={() => setPeriod('week')}
                            >
                                Week
                            </button>
                            <button
                                className={`${styles.chartToggle} ${period === 'month' ? styles.active : ''}`}
                                onClick={() => setPeriod('month')}
                            >
                                Month
                            </button>
                            <button
                                className={`${styles.chartToggle} ${period === 'year' ? styles.active : ''}`}
                                onClick={() => setPeriod('year')}
                            >
                                Year
                            </button>
                            <button
                                className={`${styles.chartToggle} ${period === 'custom' ? styles.active : ''}`}
                                onClick={() => setShowDatePicker(!showDatePicker)}
                            >
                                Custom <Calendar size={14} className={styles.customBtnIcon} />
                            </button>
                        </div>

                        {/* Custom Date Picker Popup */}
                        {showDatePicker && (
                            <motion.div
                                className={styles.datePickerPopup}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                            >
                                <div className={styles.datePickerHeader}>
                                    <h4>Select Range</h4>
                                    <button className={styles.closePickerBtn} onClick={() => setShowDatePicker(false)}>
                                        <X size={16} />
                                    </button>
                                </div>
                                <div className={styles.dateInputs}>
                                    <div className={styles.dateInputWrapper}>
                                        <label>From</label>
                                        <input
                                            type="date"
                                            value={customDates.start}
                                            onChange={(e) => setCustomDates({ ...customDates, start: e.target.value })}
                                            max={customDates.end || undefined}
                                        />
                                    </div>
                                    <div className={styles.dateInputWrapper}>
                                        <label>To</label>
                                        <input
                                            type="date"
                                            value={customDates.end}
                                            onChange={(e) => setCustomDates({ ...customDates, end: e.target.value })}
                                            min={customDates.start || undefined}
                                        />
                                    </div>
                                </div>
                                <button
                                    className={styles.applyDateBtn}
                                    disabled={!customDates.start || !customDates.end}
                                    onClick={() => {
                                        if (customDates.start && customDates.end) {
                                            setPeriod('custom');
                                            setShowDatePicker(false);
                                            fetchStats('custom', customDates.start, customDates.end);
                                        }
                                    }}
                                >
                                    Apply Range
                                </button>
                            </motion.div>
                        )}
                    </div>
                    <button className={styles.chartIconBtn}>
                        <BarChart2 size={18} />
                    </button>
                </div>

                <div className={styles.chartStats}>
                    <h2 className={styles.chartAmount}>{formatCurrency(stats?.revenue?.total || 0)}</h2>
                    <div className={styles.chartMeta}>
                        <span className={styles.chartLabel}>Total Revenue</span>
                        <span className={`${styles.chartChange} ${(stats?.revenue?.percentage_change || 0) >= 0 ? '' : styles.negative}`}>
                            {(stats?.revenue?.percentage_change || 0) >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {(stats?.revenue?.percentage_change || 0) >= 0 ? '+' : ''}{(stats?.revenue?.percentage_change || 0).toFixed(1)}%
                        </span>
                    </div>
                    <div className={styles.statusBadge}>
                        <span className={styles.statusDot}></span>
                        {(stats?.revenue?.percentage_change || 0) >= 0 ? 'On track' : 'Below target'}
                    </div>

                    <div className={styles.chartLegend}>
                        <div className={styles.legendItem}>
                            <span className={`${styles.legendDot} ${styles.legendDotOrange}`}></span>
                            Current Period
                        </div>
                        <div className={styles.legendItem}>
                            <span className={`${styles.legendDot} ${styles.legendDotWhite}`}></span>
                            Previous Period
                        </div>
                    </div>
                </div>

                {/* Chart SVG */}
                <div className={styles.chartInteractiveContainer}>
                    {/* Y-Axis Labels */}
                    <div className={styles.yAxisLabels}>
                        {(() => {
                            if (!stats?.revenue?.chart_data || stats.revenue.chart_data.length === 0) return null;
                            const maxVal = Math.max(...stats.revenue.chart_data.map(d => Math.max(d.current || 0, d.previous || 0)), 1);
                            return [1, 0.75, 0.5, 0.25, 0].map(multiplier => (
                                <span key={multiplier} className={styles.yAxisLabel}>
                                    ₹{Math.round((maxVal * multiplier) / 1000)}k
                                </span>
                            ));
                        })()}
                    </div>

                    <div className={styles.chartArea}>
                        <svg className={styles.chartSvg} viewBox="0 0 800 200" preserveAspectRatio="none">
                            {/* Grid Lines */}
                            <g className={styles.chartGrids}>
                                {/* Horizontal Grids */}
                                {[20, 60, 100, 140, 180].map(y => (
                                    <line key={y} x1="0" y1={y} x2="800" y2={y} className={styles.gridLineHorizontal} />
                                ))}
                                {/* Vertical Grids */}
                                {chartLabels.map((_, i) => {
                                    const x = (i / (chartLabels.length - 1 || 1)) * 800;
                                    return <line key={i} x1={x} y1="20" x2={x} y2="180" className={styles.gridLineVertical} />;
                                })}
                            </g>

                            {/* Gradient Fill for Orange Line */}
                            <defs>
                                <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.5" />
                                    <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                                </linearGradient>
                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>

                            {/* Orange Area Fill */}
                            <path
                                d={`${chartPath1} L 800 200 L 0 200 Z`}
                                fill="url(#orangeGradient)"
                                className={styles.chartFill}
                            />

                            {/* White Line (Previous Period) */}
                            <motion.path
                                d={chartPath2}
                                className={`${styles.chartLine} ${styles.chartLineWhite}`}
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.5, delay: 0.5 }}
                            />

                            {/* Orange Line (Current Period) */}
                            <motion.path
                                d={chartPath1}
                                className={`${styles.chartLine} ${styles.chartLineOrange}`}
                                filter="url(#glow)"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.5, delay: 0.3 }}
                            />

                            {/* Data Points (Dots) */}
                            {stats?.revenue?.chart_data?.map((d, i) => {
                                const maxVal = Math.max(...stats.revenue.chart_data.map(val => Math.max(val.current || 0, val.previous || 0)), 1);
                                const x = (i / (stats.revenue.chart_data.length - 1 || 1)) * 800;
                                const y1 = 180 - ((d.current || 0) / maxVal) * 160;
                                const y2 = 180 - ((d.previous || 0) / maxVal) * 160;

                                return (
                                    <g key={i}>
                                        <circle cx={x} cy={y2} r="3" className={styles.dotWhite} />
                                        <circle cx={x} cy={y1} r="4" className={styles.dotOrange} />
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                </div>

                <div className={styles.chartLabels}>
                    {chartLabels.map((label, i) => (
                        <span key={i} className={styles.chartLabelText}>{label}</span>
                    ))}
                </div>
            </motion.div>

            {/* Bottom Grid - Bookings */}
            <div className={styles.bottomGrid}>
                {/* Pending Bookings Card */}
                <motion.div
                    className={styles.bookingCard}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <div className={styles.cardHeaderRow}>
                        <h3 className={styles.cardTitle}>
                            <Clock size={18} className={styles.pendingTitleIcon} />
                            Pending Bookings
                            <span className={styles.countBadge}>
                                {(stats?.bookings?.emergency?.pending_count || 0) + (stats?.bookings?.regular?.pending_count || 0)}
                            </span>
                        </h3>
                    </div>

                    <div className={styles.bookingListSection}>
                        {/* Emergency Pending */}
                        {stats?.bookings?.emergency?.pending?.length > 0 && (
                            <>
                                <div className={styles.sectionHeader}>
                                    <AlertTriangle size={14} className={styles.emergencyIcon} />
                                    Emergency ({stats.bookings.emergency.pending_count})
                                </div>
                                <div className={styles.bookingList}>
                                    {stats.bookings.emergency.pending.map((booking, index) => (
                                        <motion.div
                                            key={booking.booking_id}
                                            className={`${styles.bookingItem} ${styles.emergencyItem}`}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.5 + index * 0.05 }}
                                        >
                                            <div className={styles.bookingMain}>
                                                <span className={styles.bookingId}>#{booking.booking_id}</span>
                                                <span className={styles.customerName}>{booking.customer_name}</span>
                                                <span className={styles.vehicleName}>{booking.vehicle_name}</span>
                                            </div>
                                            <div className={styles.bookingMeta}>
                                                <span className={styles.bookingLocation}>{booking.place}, {booking.district}</span>
                                                <span className={styles.bookingDate}>{booking.created_at}</span>
                                            </div>
                                            <div className={styles.bookingStatus}>
                                                <span className={`${styles.statusBadgeSmall} ${styles[booking.status.toLowerCase()]}`}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Regular Pending */}
                        {stats?.bookings?.regular?.pending?.length > 0 && (
                            <>
                                <div className={styles.sectionHeader}>
                                    <Car size={14} className={styles.serviceIcon} />
                                    Service ({stats.bookings.regular.pending_count})
                                </div>
                                <div className={styles.bookingList}>
                                    {stats.bookings.regular.pending.map((booking, index) => (
                                        <motion.div
                                            key={booking.booking_id}
                                            className={styles.bookingItem}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.6 + index * 0.05 }}
                                        >
                                            <div className={styles.bookingMain}>
                                                <span className={styles.bookingId}>#{booking.booking_id}</span>
                                                <span className={styles.customerName}>{booking.customer_name}</span>
                                                <span className={styles.vehicleName}>{booking.vehicle_name}</span>
                                            </div>
                                            <div className={styles.bookingMeta}>
                                                <span className={styles.bookingLocation}>{booking.place}, {booking.district}</span>
                                                <span className={styles.bookingDate}>{booking.created_at}</span>
                                            </div>
                                            <div className={styles.bookingStatus}>
                                                <span className={`${styles.statusBadgeSmall} ${styles[booking.status.toLowerCase()]}`}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </>
                        )}

                        {(!stats?.bookings?.emergency?.pending?.length && !stats?.bookings?.regular?.pending?.length) && (
                            <div className={styles.emptyState}>
                                <CheckCircle size={24} />
                                <span>No pending bookings</span>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Completed Bookings Card */}
                <motion.div
                    className={styles.bookingCard}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    <div className={styles.cardHeaderRow}>
                        <h3 className={styles.cardTitle}>
                            <CheckCircle size={18} className={styles.completedTitleIcon} />
                            Completed Bookings
                            <span className={styles.countBadge}>
                                {(stats?.bookings?.emergency?.completed_count || 0) + (stats?.bookings?.regular?.completed_count || 0)}
                            </span>
                        </h3>
                    </div>

                    <div className={styles.bookingListSection}>
                        {/* Emergency Completed */}
                        {stats?.bookings?.emergency?.completed?.length > 0 && (
                            <>
                                <div className={styles.sectionHeader}>
                                    <AlertTriangle size={14} className={styles.emergencyIcon} />
                                    Emergency ({stats.bookings.emergency.completed_count})
                                </div>
                                <div className={styles.bookingList}>
                                    {stats.bookings.emergency.completed.map((booking, index) => (
                                        <motion.div
                                            key={booking.booking_id}
                                            className={`${styles.bookingItem} ${styles.completedItem}`}
                                            initial={{ x: 20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.6 + index * 0.05 }}
                                        >
                                            <div className={styles.bookingMain}>
                                                <span className={styles.bookingId}>#{booking.booking_id}</span>
                                                <span className={styles.customerName}>{booking.customer_name}</span>
                                                <span className={styles.vehicleName}>{booking.vehicle_name}</span>
                                            </div>
                                            <div className={styles.bookingMeta}>
                                                <span className={styles.mechanicName}>By: {booking.mechanic_name}</span>
                                                <span className={styles.bookingDate}>{booking.completed_at}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Regular Completed */}
                        {stats?.bookings?.regular?.completed?.length > 0 && (
                            <>
                                <div className={styles.sectionHeader}>
                                    <Car size={14} className={styles.serviceIcon} />
                                    Service ({stats.bookings.regular.completed_count})
                                </div>
                                <div className={styles.bookingList}>
                                    {stats.bookings.regular.completed.map((booking, index) => (
                                        <motion.div
                                            key={booking.booking_id}
                                            className={`${styles.bookingItem} ${styles.completedItem}`}
                                            initial={{ x: 20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.7 + index * 0.05 }}
                                        >
                                            <div className={styles.bookingMain}>
                                                <span className={styles.bookingId}>#{booking.booking_id}</span>
                                                <span className={styles.customerName}>{booking.customer_name}</span>
                                                <span className={styles.vehicleName}>{booking.vehicle_name}</span>
                                            </div>
                                            <div className={styles.bookingMeta}>
                                                <span className={styles.mechanicName}>By: {booking.mechanic_name}</span>
                                                <span className={styles.bookingDate}>{booking.completed_at}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </>
                        )}

                        {(!stats?.bookings?.emergency?.completed?.length && !stats?.bookings?.regular?.completed?.length) && (
                            <div className={styles.emptyState}>
                                <Clock size={24} />
                                <span>No completed bookings yet</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;

