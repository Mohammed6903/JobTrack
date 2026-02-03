import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/Toast';
import { type Note } from '../../types';
import { summarizeNotes } from '../../services/aiService';
import { noteService } from '../../services/noteService';
import { Button } from '../ui/Button';
import './NoteSummary.css';

interface NoteSummaryProps {
    notes: Note[];
    companyName: string;
    role: string;
    applicationId: string;
}

export const NoteSummary: React.FC<NoteSummaryProps> = ({ notes, companyName, role, applicationId }) => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();

    const [summary, setSummary] = useState<string | null>(null);
    const [takeaways, setTakeaways] = useState<string[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState(true);

    useEffect(() => {
        loadSummary();
    }, [currentUser, applicationId]);

    const loadSummary = async () => {
        if (!currentUser) return;
        try {
            const data = await noteService.getSummary(currentUser.uid, applicationId);
            if (data) {
                setSummary(data.summary);
                setTakeaways(data.takeaways);
                setLastUpdated(data.generatedAt);
            }
        } catch (err) {
            console.error('Error loading summary:', err);
        }
    };

    const handleGenerateSummary = async () => {
        if (!currentUser) return;

        setLoading(true);
        setError(null);

        try {
            // Generate summary
            const result = await summarizeNotes(notes, companyName, role);

            // Save to persistence
            await noteService.saveSummary(
                currentUser.uid,
                applicationId,
                result.summary,
                result.takeaways
            );

            setSummary(result.summary);
            setTakeaways(result.takeaways);
            setLastUpdated(new Date());
            showToast('Summary generated and saved!', 'success');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to generate summary';
            setError(errorMessage);
            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Don't show if no notes
    if (notes.length === 0) {
        return null;
    }

    return (
        <div className="note-summary">
            <button
                className="note-summary-header"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="note-summary-title">
                    <Sparkles size={18} className="sparkle-icon" />
                    <h4>AI Summary</h4>
                    {lastUpdated && (
                        <span className="summary-date">
                            • {lastUpdated.toLocaleDateString()}
                        </span>
                    )}
                </div>
                {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {expanded && (
                <div className="note-summary-content">
                    {loading ? (
                        <div className="summary-loading">
                            <div className="summary-skeleton" />
                            <div className="summary-skeleton short" />
                        </div>
                    ) : error ? (
                        <div className="summary-error">
                            <AlertCircle size={18} />
                            <p>{error}</p>
                            <Button variant="outline" size="sm" onClick={handleGenerateSummary}>
                                Try Again
                            </Button>
                        </div>
                    ) : summary ? (
                        <>
                            <p className="summary-text">{summary}</p>
                            {takeaways.length > 0 && (
                                <div className="summary-takeaways">
                                    <h5>Key Takeaways:</h5>
                                    <ul>
                                        {takeaways.map((takeaway, index) => (
                                            <li key={index}>{takeaway}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleGenerateSummary}
                                className="regenerate-btn"
                            >
                                <RefreshCw size={14} />
                                Regenerate
                            </Button>
                        </>
                    ) : (
                        <div className="summary-empty">
                            <p>AI can summarize these {notes.length} notes for you.</p>
                            <Button variant="primary" size="sm" onClick={handleGenerateSummary} loading={loading}>
                                <Sparkles size={14} />
                                Generate Summary
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
