import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, AlertCircle, Lightbulb } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/Toast';
import { type Application } from '../../types';
import { getInsights, getCachedInsights, type UserInsights } from '../../services/insightsService';
import { Button } from '../ui/Button';
import './InsightsCard.css';

interface InsightsCardProps {
    applications: Application[];
}

export const InsightsCard: React.FC<InsightsCardProps> = ({ applications }) => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();

    const [insights, setInsights] = useState<UserInsights | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadInsights();
    }, [currentUser, applications]);

    const loadInsights = async () => {
        if (!currentUser) return;

        setLoading(true);
        setError(null);

        try {
            // First try to get cached insights
            const cached = await getCachedInsights(currentUser.uid);
            if (cached) {
                setInsights(cached);
            }
        } catch (err) {
            console.error('Error loading cached insights:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateInsights = async () => {
        if (!currentUser) return;

        setGenerating(true);
        setError(null);

        try {
            const newInsights = await getInsights(currentUser.uid, applications, true);
            setInsights(newInsights);
            showToast('Insights generated successfully!', 'success');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to generate insights';
            setError(errorMessage);
            showToast(errorMessage, 'error');
        } finally {
            setGenerating(false);
        }
    };

    const formatDate = (date: Date): string => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    // Don't show if user has fewer than 3 applications beyond applied
    const qualifyingApps = applications.filter((app) => app.stage !== 'applied');
    if (qualifyingApps.length < 3 && !insights) {
        return null;
    }

    return (
        <div className="insights-card">
            <div className="insights-header">
                <div className="insights-title">
                    <Sparkles size={20} className="sparkle-icon" />
                    <h3>AI Insights</h3>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerateInsights}
                    disabled={generating}
                    title="Generate new insights"
                >
                    <RefreshCw size={16} className={generating ? 'spin' : ''} />
                    {generating ? 'Generating...' : 'Refresh'}
                </Button>
            </div>

            {loading ? (
                <div className="insights-loading">
                    <div className="insight-skeleton" />
                    <div className="insight-skeleton" />
                    <div className="insight-skeleton short" />
                </div>
            ) : error ? (
                <div className="insights-error">
                    <AlertCircle size={20} />
                    <p>{error}</p>
                    <Button variant="outline" size="sm" onClick={handleGenerateInsights}>
                        Try Again
                    </Button>
                </div>
            ) : insights && insights.insights.length > 0 ? (
                <>
                    <ul className="insights-list">
                        {insights.insights.map((insight, index) => (
                            <li key={index} className="insight-item">
                                <Lightbulb size={16} className="insight-icon" />
                                <span>{insight}</span>
                            </li>
                        ))}
                    </ul>
                    {insights.generatedAt && (
                        <p className="insights-timestamp">
                            Last updated: {formatDate(insights.generatedAt)}
                        </p>
                    )}
                </>
            ) : (
                <div className="insights-empty">
                    <p>Click "Refresh" to generate AI insights based on your job applications.</p>
                    <Button variant="primary" size="sm" onClick={handleGenerateInsights} loading={generating}>
                        <Sparkles size={16} />
                        Generate Insights
                    </Button>
                </div>
            )}
        </div>
    );
};
