import React from 'react';
import { format } from 'date-fns';
import { Briefcase, Calendar, ExternalLink, MoreVertical, Trash2, Edit2, GripVertical } from 'lucide-react';
import { type Application, STAGE_COLORS } from '../../types';

interface KanbanCardProps {
    application: Application;
    onEdit: (application: Application) => void;
    onDelete: (applicationId: string) => void;
    onClick: () => void;
    onDragStart: (id: string) => void;
    onDragEnd: () => void;
    isDragging: boolean;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
    application,
    onEdit,
    onDelete,
    onClick,
    onDragStart,
    onDragEnd,
    isDragging,
}) => {
    const [menuOpen, setMenuOpen] = React.useState(false);

    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setMenuOpen((v) => !v);
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

    return (
        <article
            className={`kanban-card ${isDragging ? 'is-dragging' : ''}`}
            style={{ '--stage-color': STAGE_COLORS[application.stage] } as React.CSSProperties}
            draggable
            onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', application.id);
                onDragStart(application.id);
            }}
            onDragEnd={onDragEnd}
            onClick={onClick}
        >
            <span className="kanban-card-grip" aria-hidden="true">
                <GripVertical size={14} />
            </span>

            <div className="kanban-card-header">
                <h4 className="kanban-card-company">{application.companyName}</h4>
                <div className="kanban-card-menu">
                    <button className="kanban-menu-btn" onClick={handleMenuClick} aria-label="Card actions">
                        <MoreVertical size={16} />
                    </button>
                    {menuOpen && (
                        <div className="kanban-action-menu" onClick={(e) => e.stopPropagation()}>
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

            <p className="kanban-card-role">
                <Briefcase size={13} />
                {application.role}
            </p>

            <div className="kanban-card-footer">
                <span className="kanban-card-date">
                    <Calendar size={13} />
                    {format(application.applicationDate, 'MMM d, yyyy')}
                </span>
                {application.jobLink && (
                    <a
                        href={application.jobLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="kanban-card-link"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Open job posting"
                    >
                        <ExternalLink size={13} />
                    </a>
                )}
            </div>
        </article>
    );
};
