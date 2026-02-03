import React from 'react';
import { TrendingUp, Briefcase, CheckCircle, Users } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';
import { type Application, STAGE_LABELS, STAGE_COLORS, type ApplicationStage } from '../types';
import './AnalyticsPage.css';

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: number;
    color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => (
    <div className="stat-card" style={{ '--stat-color': color } as React.CSSProperties}>
        <div className="stat-icon">{icon}</div>
        <div className="stat-content">
            <span className="stat-value">{value}</span>
            <span className="stat-label">{label}</span>
        </div>
    </div>
);

// Wrapper component to receive applications from context
import { useAuth } from '../contexts/AuthContext';
import { applicationService } from '../services/applicationService';
import { useState, useEffect } from 'react';

export const AnalyticsPage: React.FC = () => {
    const { currentUser } = useAuth();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadApplications = async () => {
            if (!currentUser) return;
            try {
                const data = await applicationService.getApplications(currentUser.uid);
                setApplications(data);
            } catch (error) {
                console.error('Error loading applications:', error);
            } finally {
                setLoading(false);
            }
        };
        loadApplications();
    }, [currentUser]);

    if (loading) {
        return (
            <div className="analytics-loading">
                <div className="loading-spinner"></div>
                <p>Loading analytics...</p>
            </div>
        );
    }

    // Calculate stats
    const totalApplications = applications.length;
    const stageCounts = applications.reduce(
        (acc, app) => {
            acc[app.stage] = (acc[app.stage] || 0) + 1;
            return acc;
        },
        {} as Record<ApplicationStage, number>
    );

    // Prepare stage chart data
    const stageData = Object.entries(STAGE_LABELS).map(([stage, label]) => ({
        name: label,
        value: stageCounts[stage as ApplicationStage] || 0,
        color: STAGE_COLORS[stage as ApplicationStage],
    }));

    // Prepare monthly data
    const monthlyData = applications.reduce(
        (acc, app) => {
            const date = app.applicationDate;
            const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
            acc[monthYear] = (acc[monthYear] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    // Sort by date and get last 6 months
    const sortedMonthlyData = Object.entries(monthlyData)
        .sort((a, b) => {
            const dateA = new Date(a[0]);
            const dateB = new Date(b[0]);
            return dateA.getTime() - dateB.getTime();
        })
        .slice(-6)
        .map(([month, count]) => ({ month, applications: count }));

    return (
        <div className="analytics-page">
            <div className="analytics-header">
                <h1>Analytics</h1>
                <p>Overview of your job search progress</p>
            </div>

            <div className="stats-grid">
                <StatCard
                    icon={<Briefcase size={24} />}
                    label="Total Applications"
                    value={totalApplications}
                    color="var(--color-primary)"
                />
                <StatCard
                    icon={<TrendingUp size={24} />}
                    label="Applied"
                    value={stageCounts.applied || 0}
                    color={STAGE_COLORS.applied}
                />
                <StatCard
                    icon={<Users size={24} />}
                    label="Interviews"
                    value={stageCounts.interview || 0}
                    color={STAGE_COLORS.interview}
                />
                <StatCard
                    icon={<CheckCircle size={24} />}
                    label="Offers"
                    value={stageCounts.offer || 0}
                    color={STAGE_COLORS.offer}
                />
            </div>

            <div className="charts-grid">
                <div className="chart-card">
                    <h3>Applications by Stage</h3>
                    {totalApplications > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={stageData.filter(d => d.value > 0)}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stageData.filter(d => d.value > 0).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--color-surface)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="chart-empty">
                            <p>No data to display</p>
                        </div>
                    )}
                </div>

                <div className="chart-card">
                    <h3>Applications Over Time</h3>
                    {sortedMonthlyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={sortedMonthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
                                    axisLine={{ stroke: 'var(--color-border)' }}
                                />
                                <YAxis
                                    tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
                                    axisLine={{ stroke: 'var(--color-border)' }}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--color-surface)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                />
                                <Bar
                                    dataKey="applications"
                                    fill="var(--color-primary)"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="chart-empty">
                            <p>No data to display</p>
                        </div>
                    )}
                </div>
            </div>

            {totalApplications > 0 && (
                <div className="analytics-summary">
                    <h3>Quick Stats</h3>
                    <div className="summary-items">
                        <div className="summary-item">
                            <span className="summary-label">Response Rate</span>
                            <span className="summary-value">
                                {totalApplications > 0
                                    ? Math.round(
                                        (((stageCounts.interview || 0) +
                                            (stageCounts.offer || 0) +
                                            (stageCounts.rejected || 0)) /
                                            totalApplications) *
                                        100
                                    )
                                    : 0}
                                %
                            </span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Interview Rate</span>
                            <span className="summary-value">
                                {totalApplications > 0
                                    ? Math.round(
                                        (((stageCounts.interview || 0) + (stageCounts.offer || 0)) /
                                            totalApplications) *
                                        100
                                    )
                                    : 0}
                                %
                            </span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Success Rate</span>
                            <span className="summary-value">
                                {totalApplications > 0
                                    ? Math.round(((stageCounts.offer || 0) / totalApplications) * 100)
                                    : 0}
                                %
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
