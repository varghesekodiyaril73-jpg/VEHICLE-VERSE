import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart2, PieChart, TrendingUp, Map, Users, Wrench,
    AlertTriangle, RefreshCw, Calendar
} from 'lucide-react';
import styles from '../../styles/AdminAnalytics.module.css';
import AdminLayout from '../../components/layout/AdminLayout';
import { getAdminAnalytics } from '../../services/bookingService';

const AdminAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const data = await getAdminAnalytics();
            setAnalytics(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError('Failed to load analytics data');
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

    // Colors for charts
    const chartColors = {
        primary: '#2dd4bf',
        secondary: '#f97316',
        tertiary: '#6366f1',
        quaternary: '#22c55e',
        pending: '#fbbf24',
        completed: '#22c55e',
        cancelled: '#ef4444',
        assigned: '#3b82f6',
        in_progress: '#8b5cf6'
    };

    // Calculate max values for scaling
    const getMaxValue = (data, key) => {
        if (!data || data.length === 0) return 1;
        return Math.max(...data.map(d => d[key] || 0), 1);
    };

    if (loading && !analytics) {
        return (
            <AdminLayout>
                <div className={styles.loadingState}>
                    <RefreshCw className={styles.spinner} size={24} />
                    Loading analytics...
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            {/* Page Header */}
            <motion.div
                className={styles.pageHeader}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className={styles.headerContent}>
                    <div>
                        <p className={styles.breadcrumb}>Pages / Analytics</p>
                        <h1 className={styles.pageTitle}>Analytics & Reports</h1>
                    </div>
                    <motion.button
                        className={styles.refreshBtn}
                        onClick={fetchAnalytics}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={loading}
                    >
                        <RefreshCw size={18} className={loading ? styles.spinning : ''} />
                        Refresh
                    </motion.button>
                </div>
            </motion.div>

            {error && (
                <div className={styles.errorBanner}>
                    <AlertTriangle size={18} />
                    {error}
                </div>
            )}

            {/* Analytics Grid */}
            <div className={styles.analyticsGrid}>
                {/* 1. District-wise Bookings - Bar Chart */}
                <motion.div
                    className={`${styles.chartCard} ${styles.largeCard}`}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className={styles.chartHeader}>
                        <div className={styles.chartTitleWrapper}>
                            <Map size={20} className={styles.chartIcon} />
                            <h3 className={styles.chartTitle}>District-wise Bookings</h3>
                        </div>
                        <span className={styles.chartBadge}>Top 10</span>
                    </div>
                    <div className={styles.barChartContainer}>
                        {analytics?.district_bookings?.map((item, index) => {
                            const maxCount = getMaxValue(analytics.district_bookings, 'count');
                            const percentage = (item.count / maxCount) * 100;
                            return (
                                <motion.div
                                    key={item.district}
                                    className={styles.barItem}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 + index * 0.05 }}
                                >
                                    <span className={styles.barLabel}>{item.district}</span>
                                    <div className={styles.barTrack}>
                                        <motion.div
                                            className={styles.barFill}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ duration: 0.8, delay: 0.3 + index * 0.05 }}
                                            style={{ background: `linear-gradient(90deg, ${chartColors.primary}, ${chartColors.tertiary})` }}
                                        />
                                    </div>
                                    <span className={styles.barValue}>{item.count}</span>
                                </motion.div>
                            );
                        })}
                        {(!analytics?.district_bookings || analytics.district_bookings.length === 0) && (
                            <div className={styles.emptyState}>No data available</div>
                        )}
                    </div>
                </motion.div>

                {/* 2. Service Type Distribution - Pie Chart */}
                <motion.div
                    className={styles.chartCard}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className={styles.chartHeader}>
                        <div className={styles.chartTitleWrapper}>
                            <PieChart size={20} className={styles.chartIcon} />
                            <h3 className={styles.chartTitle}>Service Type</h3>
                        </div>
                    </div>
                    <div className={styles.pieChartContainer}>
                        <div className={styles.pieChart}>
                            {analytics?.service_distribution && analytics.service_distribution.length > 0 && (
                                <svg viewBox="0 0 100 100" className={styles.pieSvg}>
                                    {(() => {
                                        const total = analytics.service_distribution.reduce((sum, d) => sum + d.count, 0);
                                        let currentAngle = 0;
                                        const colors = [chartColors.secondary, chartColors.tertiary];

                                        return analytics.service_distribution.map((item, index) => {
                                            const percentage = (item.count / total) * 100;
                                            const angle = (percentage / 100) * 360;
                                            const startAngle = currentAngle;
                                            const endAngle = currentAngle + angle;
                                            currentAngle = endAngle;

                                            const largeArcFlag = angle > 180 ? 1 : 0;
                                            const startRad = (startAngle - 90) * (Math.PI / 180);
                                            const endRad = (endAngle - 90) * (Math.PI / 180);

                                            const x1 = 50 + 40 * Math.cos(startRad);
                                            const y1 = 50 + 40 * Math.sin(startRad);
                                            const x2 = 50 + 40 * Math.cos(endRad);
                                            const y2 = 50 + 40 * Math.sin(endRad);

                                            return (
                                                <path
                                                    key={item.type}
                                                    d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                                                    fill={colors[index % colors.length]}
                                                    stroke="rgba(0,0,0,0.2)"
                                                    strokeWidth="0.5"
                                                />
                                            );
                                        });
                                    })()}
                                    <circle cx="50" cy="50" r="20" fill="rgba(17, 24, 39, 0.8)" />
                                </svg>
                            )}
                        </div>
                        <div className={styles.pieLegend}>
                            {analytics?.service_distribution?.map((item, index) => {
                                const colors = [chartColors.secondary, chartColors.tertiary];
                                const total = analytics.service_distribution.reduce((sum, d) => sum + d.count, 0);
                                const percentage = ((item.count / total) * 100).toFixed(1);
                                return (
                                    <div key={item.type} className={styles.legendItem}>
                                        <span
                                            className={styles.legendDot}
                                            style={{ background: colors[index % colors.length] }}
                                        />
                                        <span className={styles.legendLabel}>{item.type}</span>
                                        <span className={styles.legendValue}>{item.count} ({percentage}%)</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>

                {/* 3. Booking Status Distribution - Pie Chart */}
                <motion.div
                    className={styles.chartCard}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <div className={styles.chartHeader}>
                        <div className={styles.chartTitleWrapper}>
                            <PieChart size={20} className={styles.chartIcon} />
                            <h3 className={styles.chartTitle}>Booking Status</h3>
                        </div>
                    </div>
                    <div className={styles.statusGrid}>
                        {analytics?.status_distribution?.map((item) => {
                            const statusColors = {
                                'PENDING': chartColors.pending,
                                'ASSIGNED': chartColors.assigned,
                                'IN_PROGRESS': chartColors.in_progress,
                                'COMPLETED': chartColors.completed,
                                'CANCELLED': chartColors.cancelled,
                                'NO_MECHANIC': '#6b7280',
                                'REFUNDED': '#f472b6'
                            };
                            return (
                                <div key={item.status} className={styles.statusItem}>
                                    <div
                                        className={styles.statusDot}
                                        style={{ background: statusColors[item.status] || '#6b7280' }}
                                    />
                                    <span className={styles.statusLabel}>{item.status.replace('_', ' ')}</span>
                                    <span className={styles.statusCount}>{item.count}</span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* 4. Monthly Revenue Trend - Line Chart */}
                <motion.div
                    className={`${styles.chartCard} ${styles.wideCard}`}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <div className={styles.chartHeader}>
                        <div className={styles.chartTitleWrapper}>
                            <TrendingUp size={20} className={styles.chartIcon} />
                            <h3 className={styles.chartTitle}>Monthly Revenue Trend</h3>
                        </div>
                        <span className={styles.chartBadge}>Last 6 Months</span>
                    </div>
                    <div className={styles.lineChartContainer}>
                        <svg viewBox="0 0 600 200" className={styles.lineSvg} preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor={chartColors.quaternary} stopOpacity="0.4" />
                                    <stop offset="100%" stopColor={chartColors.quaternary} stopOpacity="0" />
                                </linearGradient>
                                <filter id="glowGreen">
                                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>

                            {/* Grid lines */}
                            {[0, 1, 2, 3, 4].map(i => (
                                <line
                                    key={i}
                                    x1="0" y1={40 + i * 35}
                                    x2="600" y2={40 + i * 35}
                                    stroke="rgba(255,255,255,0.05)"
                                    strokeWidth="1"
                                    strokeDasharray="4 4"
                                />
                            ))}

                            {analytics?.monthly_revenue && analytics.monthly_revenue.length > 1 && (() => {
                                const maxRevenue = getMaxValue(analytics.monthly_revenue, 'revenue');
                                const points = analytics.monthly_revenue.map((d, i) => {
                                    const x = (i / (analytics.monthly_revenue.length - 1)) * 580 + 10;
                                    const y = 180 - ((d.revenue / maxRevenue) * 140);
                                    return { x, y };
                                });

                                // Create smooth cubic bezier curve
                                let linePath = `M ${points[0].x} ${points[0].y}`;
                                for (let i = 0; i < points.length - 1; i++) {
                                    const current = points[i];
                                    const next = points[i + 1];
                                    const tension = 0.4;
                                    const cp1x = current.x + (next.x - current.x) * tension;
                                    const cp1y = current.y;
                                    const cp2x = next.x - (next.x - current.x) * tension;
                                    const cp2y = next.y;
                                    linePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
                                }

                                const areaPath = `${linePath} L 590,180 L 10,180 Z`;

                                return (
                                    <>
                                        <path d={areaPath} fill="url(#revenueGradient)" />
                                        <motion.path
                                            d={linePath}
                                            fill="none"
                                            stroke={chartColors.quaternary}
                                            strokeWidth="3.5"
                                            strokeLinecap="round"
                                            filter="url(#glowGreen)"
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            transition={{ duration: 1.5 }}
                                        />
                                        {points.map((p, i) => (
                                            <g key={i}>
                                                <motion.circle
                                                    cx={p.x}
                                                    cy={p.y}
                                                    r="4"
                                                    fill={chartColors.quaternary}
                                                    stroke="rgba(17, 24, 39, 0.8)"
                                                    strokeWidth="2"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.5 + i * 0.1 }}
                                                />
                                            </g>
                                        ))}
                                    </>
                                );
                            })()}
                        </svg>
                        <div className={styles.lineLabels}>
                            {analytics?.monthly_revenue?.map((d, i) => (
                                <div key={i} className={styles.lineLabelItem}>
                                    <span className={styles.lineMonth}>{d.month}</span>
                                    <span className={styles.lineValue}>{formatCurrency(d.revenue)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* 5. Mechanic Performance - Horizontal Bar */}
                <motion.div
                    className={styles.chartCard}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    <div className={styles.chartHeader}>
                        <div className={styles.chartTitleWrapper}>
                            <Wrench size={20} className={styles.chartIcon} />
                            <h3 className={styles.chartTitle}>Top Mechanics</h3>
                        </div>
                        <span className={styles.chartBadge}>By Jobs</span>
                    </div>
                    <div className={styles.mechanicList}>
                        {analytics?.mechanic_performance?.map((mechanic, index) => {
                            const maxJobs = getMaxValue(analytics.mechanic_performance, 'completed_jobs');
                            const percentage = (mechanic.completed_jobs / maxJobs) * 100;
                            return (
                                <motion.div
                                    key={mechanic.name}
                                    className={styles.mechanicItem}
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.6 + index * 0.1 }}
                                >
                                    <div className={styles.mechanicRank}>#{index + 1}</div>
                                    <div className={styles.mechanicInfo}>
                                        <span className={styles.mechanicName}>{mechanic.name}</span>
                                        <div className={styles.mechanicProgress}>
                                            <motion.div
                                                className={styles.mechanicBar}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 0.8, delay: 0.7 + index * 0.1 }}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.mechanicStats}>
                                        <span className={styles.mechanicJobs}>{mechanic.completed_jobs} jobs</span>
                                        <span className={styles.mechanicRating}>⭐ {mechanic.rating.toFixed(1)}</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                        {(!analytics?.mechanic_performance || analytics.mechanic_performance.length === 0) && (
                            <div className={styles.emptyState}>No mechanic data available</div>
                        )}
                    </div>
                </motion.div>

                {/* 6. Customer Growth - Line Chart */}
                <motion.div
                    className={styles.chartCard}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                    <div className={styles.chartHeader}>
                        <div className={styles.chartTitleWrapper}>
                            <Users size={20} className={styles.chartIcon} />
                            <h3 className={styles.chartTitle}>Customer Growth</h3>
                        </div>
                        <span className={styles.chartBadge}>6 Months</span>
                    </div>
                    <div className={styles.growthContainer}>
                        <div className={styles.growthStats}>
                            {analytics?.customer_growth && analytics.customer_growth.length > 0 && (
                                <>
                                    <div className={styles.growthCurrent}>
                                        <span className={styles.growthNumber}>
                                            {analytics.customer_growth[analytics.customer_growth.length - 1]?.customers || 0}
                                        </span>
                                        <span className={styles.growthLabel}>Total Customers</span>
                                    </div>
                                    {analytics.customer_growth.length > 1 && (
                                        <div className={styles.growthChange}>
                                            {(() => {
                                                const first = analytics.customer_growth[0]?.customers || 0;
                                                const last = analytics.customer_growth[analytics.customer_growth.length - 1]?.customers || 0;
                                                const growth = first > 0 ? ((last - first) / first * 100).toFixed(1) : 0;
                                                return (
                                                    <span className={growth >= 0 ? styles.positive : styles.negative}>
                                                        {growth >= 0 ? '+' : ''}{growth}%
                                                    </span>
                                                );
                                            })()}
                                            <span className={styles.growthPeriod}>vs 6 months ago</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        <div className={styles.growthBars}>
                            {analytics?.customer_growth?.map((item, index) => {
                                const max = getMaxValue(analytics.customer_growth, 'customers');
                                const height = (item.customers / max) * 100;
                                return (
                                    <motion.div
                                        key={item.month}
                                        className={styles.growthBar}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${height}%` }}
                                        transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                                    >
                                        <span className={styles.growthBarLabel}>{item.month.split(' ')[0]}</span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AdminLayout>
    );
};

export default AdminAnalytics;
