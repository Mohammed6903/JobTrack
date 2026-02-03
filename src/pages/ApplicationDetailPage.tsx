import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
    ArrowLeft,
    Briefcase,
    Calendar,
    ExternalLink,
    Edit2,
    Trash2,
} from 'lucide-react';
import { type Application, STAGE_LABELS, STAGE_COLORS } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { applicationService } from '../services/applicationService';
import { ApplicationForm } from '../components/applications/ApplicationForm';
import { NotesList } from '../components/notes/NotesList';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import './ApplicationDetailPage.css';

export const ApplicationDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadApplication();
    }, [id, currentUser]);

    const loadApplication = async () => {
        if (!currentUser || !id) return;

        try {
            const apps = await applicationService.getApplications(currentUser.uid);
            const app = apps.find((a) => a.id === id);
            if (app) {
                setApplication(app);
            } else {
                showToast('Application not found', 'error');
                navigate('/');
            }
        } catch (error) {
            console.error('Error loading application:', error);
            showToast('Failed to load application', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (
        data: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>
    ) => {
        if (!currentUser || !id) return;
        setSubmitting(true);

        try {
            await applicationService.updateApplication(currentUser.uid, id, data);
            showToast('Application updated successfully', 'success');
            await loadApplication();
            setShowEditModal(false);
        } catch (error) {
            console.error('Error updating application:', error);
            showToast('Failed to update application', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!currentUser || !id) return;
        if (!confirm('Are you sure you want to delete this application?')) return;

        try {
            await applicationService.deleteApplication(currentUser.uid, id);
            showToast('Application deleted', 'success');
            navigate('/');
        } catch (error) {
            console.error('Error deleting application:', error);
            showToast('Failed to delete application', 'error');
        }
    };

    const handleStageChange = async (stage: Application['stage']) => {
        if (!currentUser || !id) return;
        try {
            await applicationService.updateApplicationStage(currentUser.uid, id, stage);
            showToast('Stage updated', 'success');
            await loadApplication();
        } catch (error) {
            console.error('Error updating stage:', error);
            showToast('Failed to update stage', 'error');
        }
    };

    if (loading) {
        return (
            <div className="detail-loading">
                <div className="loading-spinner"></div>
                <p>Loading application details...</p>
            </div>
        );
    }

    if (!application) {
        return null;
    }

    const stages: Application['stage'][] = ['applied', 'interview', 'offer', 'rejected'];

    return (
        <div className="application-detail">
            <button className="back-button" onClick={() => navigate('/')}>
                <ArrowLeft size={18} />
                Back to Dashboard
            </button>

            <div className="detail-card">
                <div className="detail-header">
                    <div className="detail-info">
                        <h1>{application.companyName}</h1>
                        <p className="detail-role">
                            <Briefcase size={18} />
                            {application.role}
                        </p>
                    </div>
                    <div className="detail-actions">
                        <Button variant="outline" size="sm" onClick={() => setShowEditModal(true)}>
                            <Edit2 size={16} />
                            Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={handleDelete}>
                            <Trash2 size={16} />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="detail-meta">
                    <div className="meta-item">
                        <Calendar size={16} />
                        <span>Applied on {format(application.applicationDate, 'MMMM d, yyyy')}</span>
                    </div>
                    {application.jobLink && (
                        <a
                            href={application.jobLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="meta-item link"
                        >
                            <ExternalLink size={16} />
                            View Job Posting
                        </a>
                    )}
                </div>

                <div className="stage-section">
                    <h3>Application Stage</h3>
                    <div className="stage-buttons">
                        {stages.map((stage) => (
                            <button
                                key={stage}
                                className={`stage-button ${application.stage === stage ? 'active' : ''}`}
                                style={{ '--stage-color': STAGE_COLORS[stage] } as React.CSSProperties}
                                onClick={() => handleStageChange(stage)}
                            >
                                {STAGE_LABELS[stage]}
                            </button>
                        ))}
                    </div>
                </div>

                <NotesList
                    applicationId={application.id}
                    companyName={application.companyName}
                    role={application.role}
                />
            </div>

            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Application"
                size="md"
            >
                <ApplicationForm
                    application={application}
                    onSubmit={handleUpdate}
                    onCancel={() => setShowEditModal(false)}
                    loading={submitting}
                />
            </Modal>
        </div>
    );
};
