import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp, TrendingDown,
    CreditCard, Wallet, Banknote, Building2,
    BarChart3, PieChart as PieChartIcon, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RevenueTrend {
    month: string;
    year: number;
    revenue: number;
    transactions: number;
}

interface PaymentMode {
    mode: string;
    count: number;
    amount: number;
    percentage: number;
}

interface RevenueData {
    trends: RevenueTrend[];
    currentMonth: number;
    lastMonth: number;
    growth: number;
    growthPositive: boolean;
}

interface PaymentModeData {
    total: number;
    modes: PaymentMode[];
}

const modeIcons: Record<string, any> = {
    'Cash': Banknote,
    'UPI': Wallet,
    'Card': CreditCard,
    'Bank Transfer': Building2,
    'Online': CreditCard,
    'Cheque': Building2,
    'Unknown': Wallet
};

const modeColors: Record<string, string> = {
    'Cash': '#22c55e',
    'UPI': '#8b5cf6',
    'Card': '#3b82f6',
    'Bank Transfer': '#f59e0b',
    'Online': '#ec4899',
    'Cheque': '#06b6d4',
    'Unknown': '#6b7280'
};

export function AnalyticsDashboard() {
    const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
    const [paymentModes, setPaymentModes] = useState<PaymentModeData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAnalytics = async () => {
        setIsLoading(true);
        try {
            const [revenueRes, modesRes] = await Promise.all([
                fetch('http://localhost:5000/api/analytics/revenue-trends'),
                fetch('http://localhost:5000/api/analytics/payment-modes')
            ]);

            if (revenueRes.ok) {
                setRevenueData(await revenueRes.json());
            }
            if (modesRes.ok) {
                setPaymentModes(await modesRes.json());
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const maxRevenue = revenueData ? Math.max(...revenueData.trends.map(t => t.revenue)) : 0;

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2].map(i => (
                    <div key={i} className="bg-card rounded-2xl p-6 border border-border/30 animate-pulse">
                        <div className="h-6 bg-muted rounded w-1/3 mb-4" />
                        <div className="h-48 bg-muted rounded" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trends Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl p-6 border border-border/30"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold">Revenue Trends</h3>
                    </div>
                    <Button variant="ghost" size="icon" onClick={fetchAnalytics}>
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                </div>

                {/* Growth Indicator */}
                {revenueData && (
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`
                            flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
                            ${revenueData.growthPositive
                                ? 'bg-success/10 text-success'
                                : 'bg-destructive/10 text-destructive'}
                        `}>
                            {revenueData.growthPositive ? (
                                <TrendingUp className="w-4 h-4" />
                            ) : (
                                <TrendingDown className="w-4 h-4" />
                            )}
                            {revenueData.growth > 0 ? '+' : ''}{revenueData.growth}%
                        </div>
                        <span className="text-sm text-muted-foreground">vs last month</span>
                    </div>
                )}

                {/* Bar Chart */}
                <div className="h-48 flex items-end justify-between gap-2">
                    {revenueData?.trends.map((trend, index) => {
                        const height = maxRevenue > 0
                            ? (trend.revenue / maxRevenue) * 100
                            : 0;
                        const isCurrentMonth = index === revenueData.trends.length - 1;

                        return (
                            <motion.div
                                key={`${trend.month}-${trend.year}`}
                                className="flex-1 flex flex-col items-center gap-2"
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{ delay: index * 0.1, duration: 0.3 }}
                                style={{ originY: 1 }}
                            >
                                <div className="w-full relative group">
                                    <motion.div
                                        className={`
                                            w-full rounded-t-lg cursor-pointer transition-all
                                            ${isCurrentMonth
                                                ? 'bg-gradient-to-t from-primary to-primary/70'
                                                : 'bg-gradient-to-t from-muted to-muted/50 hover:from-primary/50 hover:to-primary/30'}
                                        `}
                                        style={{ height: `${Math.max(height, 5)}%` }}
                                        whileHover={{ scale: 1.05 }}
                                    />
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        ₹{trend.revenue.toLocaleString('en-IN')}
                                        <br />
                                        {trend.transactions} transactions
                                    </div>
                                </div>
                                <span className="text-xs text-muted-foreground">{trend.month}</span>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Summary */}
                <div className="mt-6 pt-4 border-t border-border grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">This Month</p>
                        <p className="text-xl font-bold">
                            ₹{revenueData?.currentMonth.toLocaleString('en-IN') || 0}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Last Month</p>
                        <p className="text-xl font-bold text-muted-foreground">
                            ₹{revenueData?.lastMonth.toLocaleString('en-IN') || 0}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Payment Modes Pie Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border/30"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <PieChartIcon className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold">Payment Modes</h3>
                    </div>
                </div>

                {/* Donut Chart */}
                <div className="flex items-center justify-center mb-6">
                    <div className="relative w-48 h-48">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            {/* Background circle */}
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="15"
                                className="text-muted/30"
                            />

                            {/* Data segments */}
                            {paymentModes?.modes.reduce((acc, mode, index) => {
                                const circumference = 2 * Math.PI * 40;
                                const strokeDasharray = (mode.percentage / 100) * circumference;
                                const previousPercentage = paymentModes.modes
                                    .slice(0, index)
                                    .reduce((sum, m) => sum + m.percentage, 0);
                                const strokeDashoffset = -((previousPercentage / 100) * circumference);

                                acc.push(
                                    <motion.circle
                                        key={mode.mode}
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="none"
                                        stroke={modeColors[mode.mode] || modeColors['Unknown']}
                                        strokeWidth="15"
                                        strokeDasharray={`${strokeDasharray} ${circumference}`}
                                        strokeDashoffset={strokeDashoffset}
                                        initial={{ strokeDasharray: `0 ${circumference}` }}
                                        animate={{ strokeDasharray: `${strokeDasharray} ${circumference}` }}
                                        transition={{ delay: index * 0.1, duration: 0.5 }}
                                    />
                                );
                                return acc;
                            }, [] as JSX.Element[])}
                        </svg>

                        {/* Center text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <p className="text-2xl font-bold">
                                ₹{((paymentModes?.total || 0) / 1000).toFixed(0)}K
                            </p>
                            <p className="text-xs text-muted-foreground">Total</p>
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="space-y-2">
                    {paymentModes?.modes.map((mode, index) => {
                        const Icon = modeIcons[mode.mode] || modeIcons['Unknown'];

                        return (
                            <motion.div
                                key={mode.mode}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: modeColors[mode.mode] || modeColors['Unknown'] }}
                                    />
                                    <Icon className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">{mode.mode}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-muted-foreground">
                                        {mode.count} txns
                                    </span>
                                    <span className="text-sm font-semibold w-12 text-right">
                                        {mode.percentage}%
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}
