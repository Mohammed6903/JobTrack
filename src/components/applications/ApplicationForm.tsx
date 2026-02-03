import React, { useState, useEffect } from 'react';
import { type Application, STAGE_LABELS, type ApplicationStage } from '../../types';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import './ApplicationForm.css';

interface ApplicationFormProps {
    application?: Application | null;
    onSubmit: (data: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onCancel: () => void;
    loading?: boolean;
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({
    application,
    onSubmit,
    onCancel,
    loading = false,
}) => {
    const [companyName, setCompanyName] = useState('');
    const [role, setRole] = useState('');
    const [stage, setStage] = useState<ApplicationStage>('applied');
    const [applicationDate, setApplicationDate] = useState('');
    const [jobLink, setJobLink] = useState('');

    useEffect(() => {
        if (application) {
            setCompanyName(application.companyName);
            setRole(application.role);
            setStage(application.stage);
            setApplicationDate(
                application.applicationDate.toISOString().split('T')[0]
            );
            setJobLink(application.jobLink || '');
        } else {
            // Default to today's date for new applications
            setApplicationDate(new Date().toISOString().split('T')[0]);
        }
    }, [application]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            companyName,
            role,
            stage,
            applicationDate: new Date(applicationDate),
            jobLink: jobLink || '',
        });
    };

    const stageOptions = Object.entries(STAGE_LABELS).map(([value, label]) => ({
        value,
        label,
    }));

    return (
        <form onSubmit={handleSubmit} className="application-form">
            <Input
                label="Company Name"
                placeholder="e.g. Google, Microsoft, Startup Inc."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
            />

            <Input
                label="Job Role / Position"
                placeholder="e.g. Frontend Developer, Software Engineer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
            />

            <div className="form-row">
                <Select
                    label="Application Stage"
                    value={stage}
                    onChange={(e) => setStage(e.target.value as ApplicationStage)}
                    options={stageOptions}
                />

                <Input
                    type="date"
                    label="Application Date"
                    value={applicationDate}
                    onChange={(e) => setApplicationDate(e.target.value)}
                    required
                />
            </div>

            <Input
                label="Job Posting Link (Optional)"
                type="url"
                placeholder="https://..."
                value={jobLink}
                onChange={(e) => setJobLink(e.target.value)}
            />

            <div className="form-actions">
                <Button type="button" variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" variant="primary" loading={loading}>
                    {application ? 'Save Changes' : 'Add Application'}
                </Button>
            </div>
        </form>
    );
};
