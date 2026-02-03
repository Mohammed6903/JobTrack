import React, { useState, useEffect } from 'react';
import type { Note } from '../../types';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Input';
import './NoteForm.css';

interface NoteFormProps {
    note?: Note | null;
    onSubmit: (content: string) => void;
    onCancel: () => void;
    loading?: boolean;
}

export const NoteForm: React.FC<NoteFormProps> = ({
    note,
    onSubmit,
    onCancel,
    loading = false,
}) => {
    const [content, setContent] = useState('');

    useEffect(() => {
        if (note) {
            setContent(note.content);
        }
    }, [note]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (content.trim()) {
            onSubmit(content.trim());
        }
    };

    return (
        <form onSubmit={handleSubmit} className="note-form">
            <Textarea
                placeholder="Add your note here... (interview feedback, reminders, follow-ups)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                required
            />
            <div className="note-form-actions">
                <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" loading={loading}>
                    {note ? 'Update Note' : 'Add Note'}
                </Button>
            </div>
        </form>
    );
};
