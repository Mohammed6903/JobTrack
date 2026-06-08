import React, { useState, useEffect } from 'react';
import { TrendingUp, Briefcase, CheckCircle, Users } from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { type Application, STAGE_LABELS, STAGE_COLORS, type ApplicationStage } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { applicationService } from '../services/applicationService';
import './AnalyticsPage.css';

const CHART = {
    primary: '#6366f1',
    violet: '#8b5cf6',
    grid: 'rgba(255, 255, 255, 0.06)',
    axis: '#6b7280',
};

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => (
    <div className="stat-card" style={{ '--stat-color': color } as React.CSSProperties}>
        <div className="stat-icon">{icon}</div>
        <div className="stat-content">
            <span className="stat-value mono">{value}</span>
            <span className="stat-label">{label}</span>
        </div>
    </div>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="chart-tooltip">
            {label && <p className="chart-tooltip-label">{label}</p>}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {payload.map((p: any, i: number) => (
                <p key={i} className="chart-tooltip-row">
                    <span
                        className="chart-tooltip-dot"
                        style={{ background: p.payload?.color || p.color || CHART.primary }}
                    />
                    {p.name}: <strong className="mono">{p.value}</strong>
                </p>
            ))}
        </div>
    );
};

interface RadialStatProps {
    label: string;
    value: number;
    color: string;
}

const RadialStat: React.FC<RadialStatProps> = ({ label, value, color }) => {
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;
    return (
        <div className="radial-stat">
            <div className="radial-ring">
                <svg width="140" height="140" viewBox="0 0 140 140">
                    <circle
                        cx="70"
                        cy="70"
                        r={radius}
                        fill="none"
                        stroke="var(--color-bg-secondary)"
                        strokeWidth="12"
                    />
                    <circle
                        cx="70"
                        cy="70"
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        transform="rotate(-90 70 70)"
                        style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(0.34, 1.56, 0.64, 1)', filter: `drop-shadow(0 0 6px ${color}66)` }}
                    />
                </svg>
                <div className="radial-center">
                    <span className="radial-value mono">{value}%</span>
                </div>
            </div>
            <span className="radial-label">{label}</span>
        </div>
    );
};

interface FunnelStep {
    label: string;
    value: number;
    color: string;
}

const Funnel: React.FC<{ steps: FunnelStep[] }> = ({ steps }) => {
    const max = Math.max(steps[0]?.value || 0, 1);
    return (
        <div className="funnel">
            {steps.map((step, i) => {
                const widthPct = Math.max((step.value / max) * 100, 4);
                const prev = i > 0 ? steps[i - 1].value : null;
                const conv = prev && prev > 0 ? Math.round((step.value / prev) * 100) : null;
                return (
                    <div className="funnel-row" key={step.label}>
                        <div className="funnel-meta">
                            <span className="funnel-label">
                                <span className="funnel-dot" style={{ background: step.color }} />
                                {step.label}
                            </span>
                            <span className="funnel-count mono">{step.value}</span>
                        </div>
                        <div className="funnel-track">
                            <div
                                className="funnel-bar"
                                style={{
                                    width: `${widthPct}%`,
                                    background: `linear-gradient(90deg, ${step.color}, ${step.color}cc)`,
                                    boxShadow: `0 0 22px ${step.color}40`,
                                }}
                            />
                            {conv !== null && <span className="funnel-conv">{conv}% from prev</span>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export const AnalyticsView: React.FC<{ applications: Application[] }> = ({ applications }) => {
    const totalApplications = applications.length;
    const stageCounts = applications.reduce(
        (acc, app) => {
            acc[app.stage] = (acc[app.stage] || 0) + 1;
            return acc;
        },
        {} as Record<ApplicationStage, number>
    );

    const stageData = Object.entries(STAGE_LABELS).map(([stage, label]) => ({
        name: label,
        value: stageCounts[stage as ApplicationStage] || 0,
        color: STAGE_COLORS[stage as ApplicationStage],
    }));
    const activeStageData = stageData.filter((d) => d.value > 0);

    // Monthly buckets, last 6 months, ascending
    const monthlyData = applications.reduce(
        (acc, app) => {
            const date = app.applicationDate;
            const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
            acc[monthYear] = (acc[monthYear] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );
    const sortedMonthlyData = Object.entries(monthlyData)
        .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
        .slice(-6)
        .map(([month, count]) => ({ month, applications: count }));

    // Conversion funnel (proxy from current stages)
    const reachedInterview = (stageCounts.interview || 0) + (stageCounts.offer || 0);
    const funnelSteps: FunnelStep[] = [
        { label: 'Applied', value: totalApplications, color: STAGE_COLORS.applied },
        { label: 'Interview', value: reachedInterview, color: STAGE_COLORS.interview },
        { label: 'Offer', value: stageCounts.offer || 0, color: STAGE_COLORS.offer },
    ];

    const responded =
        (stageCounts.interview || 0) + (stageCounts.offer || 0) + (stageCounts.rejected || 0);
    const responseRate = totalApplications ? Math.round((responded / totalApplications) * 100) : 0;
    const interviewRate = totalApplications ? Math.round((reachedInterview / totalApplications) * 100) : 0;
    const successRate = totalApplications
        ? Math.round(((stageCounts.offer || 0) / totalApplications) * 100)
        : 0;

    return (
        <div className="analytics-page">
            <div className="analytics-header">
                <h1>Analytics</h1>
                <p>A clear read on your job search momentum</p>
            </div>

            <div className="stats-grid stagger-children">
                <StatCard
                    icon={<Briefcase size={22} />}
                    label="Total Applications"
                    value={totalApplications}
                    color="var(--color-primary)"
                />
                <StatCard
                    icon={<TrendingUp size={22} />}
                    label="Applied"
                    value={stageCounts.applied || 0}
                    color={STAGE_COLORS.applied}
                />
                <StatCard
                    icon={<Users size={22} />}
                    label="Interviews"
                    value={stageCounts.interview || 0}
                    color={STAGE_COLORS.interview}
                />
                <StatCard
                    icon={<CheckCircle size={22} />}
                    label="Offers"
                    value={stageCounts.offer || 0}
                    color={STAGE_COLORS.offer}
                />
            </div>

            {totalApplications === 0 ? (
                <div className="chart-card">
                    <div className="chart-empty">
                        <p>No data yet — add applications to see your analytics.</p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="chart-card funnel-card">
                        <div className="chart-card-head">
                            <h3>Conversion Funnel</h3>
                            <span className="chart-card-sub">How applications progress through your pipeline</span>
                        </div>
                        <Funnel steps={funnelSteps} />
                    </div>

                    <div className="charts-grid">
                        <div className="chart-card">
                            <div className="chart-card-head">
                                <h3>Applications by Stage</h3>
                                <span className="chart-card-sub">Current distribution</span>
                            </div>
                            <div className="donut-wrap">
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie
                                            data={activeStageData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={72}
                                            outerRadius={104}
                                            paddingAngle={3}
                                            dataKey="value"
                                            stroke="none"
                                            isAnimationActive={false}
                                        >
                                            {activeStageData.map((entry) => (
                                                <Cell key={entry.name} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<ChartTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="donut-center">
                                    <span className="donut-total mono">{totalApplications}</span>
                                    <span className="donut-total-label">total</span>
                                </div>
                            </div>
                            <div className="donut-legend">
                                {stageData.map((d) => (
                                    <div className="legend-item" key={d.name}>
                                        <span className="legend-dot" style={{ background: d.color }} />
                                        <span className="legend-name">{d.name}</span>
                                        <span className="legend-value mono">{d.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="chart-card">
                            <div className="chart-card-head">
                                <h3>Applications Over Time</h3>
                                <span className="chart-card-sub">Monthly activity</span>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={sortedMonthlyData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={CHART.violet} stopOpacity={0.45} />
                                            <stop offset="100%" stopColor={CHART.violet} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fill: CHART.axis, fontSize: 12 }}
                                        axisLine={{ stroke: CHART.grid }}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fill: CHART.axis, fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                        allowDecimals={false}
                                        width={40}
                                    />
                                    <Tooltip content={<ChartTooltip />} cursor={{ stroke: CHART.grid }} />
                                    <Area
                                        type="monotone"
                                        dataKey="applications"
                                        name="Applications"
                                        stroke={CHART.primary}
                                        strokeWidth={2.5}
                                        fill="url(#areaGrad)"
                                        isAnimationActive={false}
                                        dot={{ r: 4, fill: CHART.primary, strokeWidth: 0 }}
                                        activeDot={{ r: 6, fill: CHART.violet, stroke: '#fff', strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="chart-card">
                        <div className="chart-card-head">
                            <h3>Conversion Rates</h3>
                            <span className="chart-card-sub">Share of applications reaching each milestone</span>
                        </div>
                        <div className="radial-grid">
                            <RadialStat label="Response Rate" value={responseRate} color={STAGE_COLORS.applied} />
                            <RadialStat label="Interview Rate" value={interviewRate} color={STAGE_COLORS.interview} />
                            <RadialStat label="Success Rate" value={successRate} color={STAGE_COLORS.offer} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

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

    return <AnalyticsView applications={applications} />;
};
