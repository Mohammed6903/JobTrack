import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Briefcase, Layers, Trophy, Activity } from 'lucide-react';
import type { Application, ApplicationStage } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { applicationService } from '../services/applicationService';
import { ApplicationCard } from '../components/applications/ApplicationCard';
import { ApplicationForm } from '../components/applications/ApplicationForm';
import { ApplicationFilters, type BoardView } from '../components/applications/ApplicationFilters';
import { KanbanBoard } from '../components/applications/KanbanBoard';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { InsightsCard } from '../components/insights/InsightsCard';
import './DashboardPage.css';

interface PipelineStat {
    key: string;
    label: string;
    value: string;
    icon: React.ReactNode;
    color: string;
}

export const DashboardPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingApplication, setEditingApplication] = useState<Application | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Filters & view
    const [searchQuery, setSearchQuery] = useState('');
    const [stageFilter, setStageFilter] = useState<ApplicationStage | 'all'>('all');
    const [view, setView] = useState<BoardView>('board');

    useEffect(() => {
        loadApplications();
    }, [currentUser]);

    const loadApplications = async () => {
        if (!currentUser) return;
        try {
            const data = await applicationService.getApplications(currentUser.uid);
            setApplications(data);
        } catch (error) {
            console.error('Error loading applications:', error);
            showToast('Failed to load applications', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Search applies in both views; stage filter applies only in list view.
    const searchFiltered = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return applications.filter(
            (app) =>
                app.companyName.toLowerCase().includes(q) || app.role.toLowerCase().includes(q)
        );
    }, [applications, searchQuery]);

    const listFiltered = useMemo(
        () => searchFiltered.filter((app) => stageFilter === 'all' || app.stage === stageFilter),
        [searchFiltered, stageFilter]
    );

    const visibleApplications = view === 'board' ? searchFiltered : listFiltered;

    const stats: PipelineStat[] = useMemo(() => {
        const counts = applications.reduce(
            (acc, app) => {
                acc[app.stage] = (acc[app.stage] || 0) + 1;
                return acc;
            },
            {} as Record<ApplicationStage, number>
        );
        const total = applications.length;
        const active = (counts.applied || 0) + (counts.interview || 0);
        const offers = counts.offer || 0;
        const responded = (counts.interview || 0) + (counts.offer || 0) + (counts.rejected || 0);
        const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;
        return [
            { key: 'total', label: 'Total', value: String(total), icon: <Briefcase size={18} />, color: 'var(--color-primary)' },
            { key: 'active', label: 'Active', value: String(active), icon: <Layers size={18} />, color: 'var(--stage-applied)' },
            { key: 'offers', label: 'Offers', value: String(offers), icon: <Trophy size={18} />, color: 'var(--stage-offer)' },
            { key: 'response', label: 'Response Rate', value: `${responseRate}%`, icon: <Activity size={18} />, color: 'var(--stage-interview)' },
        ];
    }, [applications]);

    const handleSubmit = async (
        data: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>
    ) => {
        if (!currentUser) return;
        setSubmitting(true);

        try {
            if (editingApplication) {
                await applicationService.updateApplication(
                    currentUser.uid,
                    editingApplication.id,
                    data
                );
                showToast('Application updated successfully', 'success');
            } else {
                await applicationService.addApplication(currentUser.uid, data);
                showToast('Application added successfully', 'success');
            }
            await loadApplications();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving application:', error);
            showToast('Failed to save application', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (application: Application) => {
        setEditingApplication(application);
        setShowModal(true);
    };

    const handleDelete = async (applicationId: string) => {
        if (!currentUser) return;
        if (!confirm('Are you sure you want to delete this application?')) return;

        try {
            await applicationService.deleteApplication(currentUser.uid, applicationId);
            showToast('Application deleted', 'success');
            await loadApplications();
        } catch (error) {
            console.error('Error deleting application:', error);
            showToast('Failed to delete application', 'error');
        }
    };

    const handleStageChange = async (
        applicationId: string,
        stage: ApplicationStage
    ) => {
        if (!currentUser) return;

        // Optimistic update so the drag feels instant
        const previous = applications;
        setApplications((apps) =>
            apps.map((app) => (app.id === applicationId ? { ...app, stage } : app))
        );

        try {
            await applicationService.updateApplicationStage(
                currentUser.uid,
                applicationId,
                stage
            );
        } catch (error) {
            console.error('Error updating stage:', error);
            setApplications(previous);
            showToast('Failed to update stage', 'error');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingApplication(null);
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Loading your applications...</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>My Applications</h1>
                    <p>Track and manage your job search journey</p>
                </div>
                <Button variant="primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} />
                    Add Application
                </Button>
            </div>

            {applications.length > 0 && (
                <div className="pipeline-strip stagger-children">
                    {stats.map((stat) => (
                        <div
                            key={stat.key}
                            className="pipeline-stat animate-fade-in-up"
                            style={{ '--stat-color': stat.color } as React.CSSProperties}
                        >
                            <span className="pipeline-stat-icon">{stat.icon}</span>
                            <div className="pipeline-stat-text">
                                <span className="pipeline-stat-value mono">{stat.value}</span>
                                <span className="pipeline-stat-label">{stat.label}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {applications.length > 0 && (
                <InsightsCard applications={applications} />
            )}

            {applications.length > 0 && (
                <ApplicationFilters
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    stageFilter={stageFilter}
                    onStageFilterChange={setStageFilter}
                    resultCount={visibleApplications.length}
                    view={view}
                    onViewChange={setView}
                />
            )}

            {applications.length === 0 ? (
                <EmptyState
                    icon={<Briefcase size={32} />}
                    title="No applications yet"
                    description="Start tracking your job search by adding your first application."
                    action={{
                        label: 'Add Your First Application',
                        onClick: () => setShowModal(true),
                    }}
                />
            ) : visibleApplications.length === 0 ? (
                <EmptyState
                    icon={<Briefcase size={32} />}
                    title="No results found"
                    description="Try adjusting your search or filters."
                />
            ) : view === 'board' ? (
                <KanbanBoard
                    applications={visibleApplications}
                    onStageChange={handleStageChange}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onCardClick={(id) => navigate(`/application/${id}`)}
                />
            ) : (
                <div className="applications-grid">
                    {visibleApplications.map((application) => (
                        <ApplicationCard
                            key={application.id}
                            application={application}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onStageChange={handleStageChange}
                            onClick={() => navigate(`/application/${application.id}`)}
                        />
                    ))}
                </div>
            )}

            <Modal
                isOpen={showModal}
                onClose={handleCloseModal}
                title={editingApplication ? 'Edit Application' : 'Add New Application'}
                size="md"
            >
                <ApplicationForm
                    application={editingApplication}
                    onSubmit={handleSubmit}
                    onCancel={handleCloseModal}
                    loading={submitting}
                />
            </Modal>
        </div>
    );
};
