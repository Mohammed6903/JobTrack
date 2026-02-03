import React from 'react';
import { format } from 'date-fns';
import { Briefcase, Calendar, ExternalLink, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { type Application, STAGE_LABELS, STAGE_COLORS } from '../../types';
import { Card, CardContent } from '../ui/Card';
import './ApplicationCard.css';

interface ApplicationCardProps {
    application: Application;
    onEdit: (application: Application) => void;
    onDelete: (applicationId: string) => void;
    onStageChange: (applicationId: string, stage: Application['stage']) => void;
    onClick: () => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
    application,
    onEdit,
    onDelete,
    onStageChange,
    onClick,
}) => {
    const [menuOpen, setMenuOpen] = React.useState(false);

    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setMenuOpen(!menuOpen);
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setMenuOpen(false);
        onEdit(application);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setMenuOpen(false);
        onDelete(application.id);
    };

    const stages: Application['stage'][] = ['applied', 'interview', 'offer', 'rejected'];

    return (
        <Card className="application-card" hoverable onClick={onClick}>
            <CardContent>
                <div className="application-card-header">
                    <div className="application-info">
                        <h3 className="company-name">{application.companyName}</h3>
                        <p className="job-role">
                            <Briefcase size={14} />
                            {application.role}
                        </p>
                    </div>
                    <div className="application-actions">
                        <button className="menu-button" onClick={handleMenuClick}>
                            <MoreVertical size={18} />
                        </button>
                        {menuOpen && (
                            <div className="action-menu">
                                <button onClick={handleEdit}>
                                    <Edit2 size={14} />
                                    Edit
                                </button>
                                <button className="danger" onClick={handleDelete}>
                                    <Trash2 size={14} />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="application-card-body">
                    <div className="application-meta">
                        <span className="meta-item">
                            <Calendar size={14} />
                            {format(application.applicationDate, 'MMM d, yyyy')}
                        </span>
                        {application.jobLink && (
                            <a
                                href={application.jobLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="meta-item link"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <ExternalLink size={14} />
                                Job Link
                            </a>
                        )}
                    </div>

                    <div className="stage-selector">
                        {stages.map((stage) => (
                            <button
                                key={stage}
                                className={`stage-chip ${application.stage === stage ? 'active' : ''}`}
                                style={{
                                    '--stage-color': STAGE_COLORS[stage],
                                } as React.CSSProperties}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onStageChange(application.id, stage);
                                }}
                            >
                                {STAGE_LABELS[stage]}
                            </button>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
