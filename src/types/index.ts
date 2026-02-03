export type ApplicationStage = 'applied' | 'interview' | 'offer' | 'rejected';

export interface Application {
    id: string;
    companyName: string;
    role: string;
    stage: ApplicationStage;
    applicationDate: Date;
    jobLink?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Note {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface User {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
}

export const STAGE_LABELS: Record<ApplicationStage, string> = {
    applied: 'Applied',
    interview: 'Interview',
    offer: 'Offer',
    rejected: 'Rejected',
};

export const STAGE_COLORS: Record<ApplicationStage, string> = {
    applied: '#3b82f6',
    interview: '#f59e0b',
    offer: '#10b981',
    rejected: '#ef4444',
};
