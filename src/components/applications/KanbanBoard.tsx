import React, { useMemo, useState } from 'react';
import { type Application, type ApplicationStage, STAGE_LABELS, STAGE_COLORS } from '../../types';
import { KanbanCard } from './KanbanCard';
import './KanbanBoard.css';

interface KanbanBoardProps {
    applications: Application[];
    onStageChange: (applicationId: string, stage: ApplicationStage) => void;
    onEdit: (application: Application) => void;
    onDelete: (applicationId: string) => void;
    onCardClick: (id: string) => void;
}

const STAGES: ApplicationStage[] = ['applied', 'interview', 'offer', 'rejected'];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
    applications,
    onStageChange,
    onEdit,
    onDelete,
    onCardClick,
}) => {
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragOverStage, setDragOverStage] = useState<ApplicationStage | null>(null);

    const grouped = useMemo(() => {
        const map: Record<ApplicationStage, Application[]> = {
            applied: [],
            interview: [],
            offer: [],
            rejected: [],
        };
        for (const app of applications) {
            map[app.stage].push(app);
        }
        return map;
    }, [applications]);

    const draggingApp = draggingId ? applications.find((a) => a.id === draggingId) : null;

    const handleDrop = (stage: ApplicationStage) => {
        if (draggingId && draggingApp && draggingApp.stage !== stage) {
            onStageChange(draggingId, stage);
        }
        setDraggingId(null);
        setDragOverStage(null);
    };

    return (
        <div className="kanban-board">
            {STAGES.map((stage) => {
                const items = grouped[stage];
                const isOver = dragOverStage === stage;
                const isValidTarget = draggingApp != null && draggingApp.stage !== stage;
                return (
                    <section
                        key={stage}
                        className={`kanban-column ${isOver ? 'is-over' : ''} ${isOver && isValidTarget ? 'is-valid' : ''}`}
                        style={{ '--stage-color': STAGE_COLORS[stage] } as React.CSSProperties}
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                            if (dragOverStage !== stage) setDragOverStage(stage);
                        }}
                        onDragLeave={(e) => {
                            // Only clear if the pointer actually left the column bounds
                            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                setDragOverStage((s) => (s === stage ? null : s));
                            }
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                            handleDrop(stage);
                        }}
                    >
                        <header className="kanban-column-header">
                            <span className="kanban-column-dot" />
                            <h3 className="kanban-column-title">{STAGE_LABELS[stage]}</h3>
                            <span className="kanban-column-count mono">{items.length}</span>
                        </header>

                        <div className="kanban-column-body">
                            {items.map((app) => (
                                <KanbanCard
                                    key={app.id}
                                    application={app}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onClick={() => onCardClick(app.id)}
                                    onDragStart={setDraggingId}
                                    onDragEnd={() => {
                                        setDraggingId(null);
                                        setDragOverStage(null);
                                    }}
                                    isDragging={draggingId === app.id}
                                />
                            ))}

                            {items.length === 0 && (
                                <div className="kanban-column-empty">
                                    {isValidTarget ? 'Drop here' : 'No applications'}
                                </div>
                            )}
                        </div>
                    </section>
                );
            })}
        </div>
    );
};
