import React from 'react';
import { Search, X, LayoutGrid, Rows3 } from 'lucide-react';
import { type ApplicationStage, STAGE_LABELS, STAGE_COLORS } from '../../types';
import './ApplicationFilters.css';

export type BoardView = 'board' | 'list';

interface ApplicationFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    stageFilter: ApplicationStage | 'all';
    onStageFilterChange: (stage: ApplicationStage | 'all') => void;
    resultCount: number;
    view: BoardView;
    onViewChange: (view: BoardView) => void;
}

export const ApplicationFilters: React.FC<ApplicationFiltersProps> = ({
    searchQuery,
    onSearchChange,
    stageFilter,
    onStageFilterChange,
    resultCount,
    view,
    onViewChange,
}) => {
    const stages: (ApplicationStage | 'all')[] = ['all', 'applied', 'interview', 'offer', 'rejected'];

    const hasFilters = searchQuery || stageFilter !== 'all';

    const clearFilters = () => {
        onSearchChange('');
        onStageFilterChange('all');
    };

    return (
        <div className="application-filters">
            <div className="filters-top">
                <div className="search-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by company or role..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="search-clear" onClick={() => onSearchChange('')} aria-label="Clear search">
                            <X size={16} />
                        </button>
                    )}
                </div>

                <div className="view-toggle" role="group" aria-label="View mode">
                    <button
                        className={`view-toggle-btn ${view === 'board' ? 'active' : ''}`}
                        onClick={() => onViewChange('board')}
                        aria-pressed={view === 'board'}
                    >
                        <LayoutGrid size={16} />
                        Board
                    </button>
                    <button
                        className={`view-toggle-btn ${view === 'list' ? 'active' : ''}`}
                        onClick={() => onViewChange('list')}
                        aria-pressed={view === 'list'}
                    >
                        <Rows3 size={16} />
                        List
                    </button>
                </div>
            </div>

            {view === 'list' && (
                <div className="stage-filters">
                    {stages.map((stage) => (
                        <button
                            key={stage}
                            className={`stage-filter-chip ${stageFilter === stage ? 'active' : ''}`}
                            style={
                                stage !== 'all'
                                    ? ({ '--stage-color': STAGE_COLORS[stage as ApplicationStage] } as React.CSSProperties)
                                    : undefined
                            }
                            onClick={() => onStageFilterChange(stage)}
                        >
                            {stage === 'all' ? 'All' : STAGE_LABELS[stage as ApplicationStage]}
                        </button>
                    ))}
                </div>
            )}

            <div className="filter-info">
                <span className="result-count">
                    <strong className="mono">{resultCount}</strong> application{resultCount !== 1 ? 's' : ''}
                </span>
                {hasFilters && (
                    <button className="clear-filters" onClick={clearFilters}>
                        <X size={14} />
                        Clear filters
                    </button>
                )}
            </div>
        </div>
    );
};
