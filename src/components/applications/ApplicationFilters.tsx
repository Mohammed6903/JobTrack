import React from 'react';
import { Search, X } from 'lucide-react';
import { type ApplicationStage, STAGE_LABELS, STAGE_COLORS } from '../../types';
import './ApplicationFilters.css';

interface ApplicationFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    stageFilter: ApplicationStage | 'all';
    onStageFilterChange: (stage: ApplicationStage | 'all') => void;
    resultCount: number;
}

export const ApplicationFilters: React.FC<ApplicationFiltersProps> = ({
    searchQuery,
    onSearchChange,
    stageFilter,
    onStageFilterChange,
    resultCount,
}) => {
    const stages: (ApplicationStage | 'all')[] = ['all', 'applied', 'interview', 'offer', 'rejected'];

    const hasFilters = searchQuery || stageFilter !== 'all';

    const clearFilters = () => {
        onSearchChange('');
        onStageFilterChange('all');
    };

    return (
        <div className="application-filters">
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
                    <button className="search-clear" onClick={() => onSearchChange('')}>
                        <X size={16} />
                    </button>
                )}
            </div>

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

            <div className="filter-info">
                <span className="result-count">{resultCount} application{resultCount !== 1 ? 's' : ''}</span>
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
