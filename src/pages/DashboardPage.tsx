import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Briefcase } from 'lucide-react';
import type { Application, ApplicationStage } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { applicationService } from '../services/applicationService';
import { ApplicationCard } from '../components/applications/ApplicationCard';
import { ApplicationForm } from '../components/applications/ApplicationForm';
import { ApplicationFilters } from '../components/applications/ApplicationFilters';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { InsightsCard } from '../components/insights/InsightsCard';
import './DashboardPage.css';

export const DashboardPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingApplication, setEditingApplication] = useState<Application | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [stageFilter, setStageFilter] = useState<ApplicationStage | 'all'>('all');

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

    const filteredApplications = useMemo(() => {
        return applications.filter((app) => {
            const matchesSearch =
                app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.role.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStage = stageFilter === 'all' || app.stage === stageFilter;
            return matchesSearch && matchesStage;
        });
    }, [applications, searchQuery, stageFilter]);

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
        try {
            await applicationService.updateApplicationStage(
                currentUser.uid,
                applicationId,
                stage
            );
            showToast('Stage updated', 'success');
            await loadApplications();
        } catch (error) {
            console.error('Error updating stage:', error);
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
                <InsightsCard applications={applications} />
            )}

            {applications.length > 0 && (
                <ApplicationFilters
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    stageFilter={stageFilter}
                    onStageFilterChange={setStageFilter}
                    resultCount={filteredApplications.length}
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
            ) : filteredApplications.length === 0 ? (
                <EmptyState
                    icon={<Briefcase size={32} />}
                    title="No results found"
                    description="Try adjusting your search or filters."
                />
            ) : (
                <div className="applications-grid">
                    {filteredApplications.map((application) => (
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
