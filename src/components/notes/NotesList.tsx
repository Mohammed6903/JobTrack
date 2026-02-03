import React, { useState, useEffect } from 'react';
import { Plus, FileText } from 'lucide-react';
import type { Note } from '../../types';
import { NoteCard } from './NoteCard';
import { NoteForm } from './NoteForm';
import { NoteSummary } from './NoteSummary';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/Toast';
import { noteService } from '../../services/noteService';
import './NotesList.css';

interface NotesListProps {
    applicationId: string;
    companyName?: string;
    role?: string;
}

export const NotesList: React.FC<NotesListProps> = ({ applicationId, companyName, role }) => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadNotes();
    }, [applicationId, currentUser]);

    const loadNotes = async () => {
        if (!currentUser) return;
        try {
            const data = await noteService.getNotes(currentUser.uid, applicationId);
            setNotes(data);
        } catch (error) {
            console.error('Error loading notes:', error);
            showToast('Failed to load notes', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (content: string) => {
        if (!currentUser) return;
        setSubmitting(true);
        try {
            if (editingNote) {
                await noteService.updateNote(
                    currentUser.uid,
                    applicationId,
                    editingNote.id,
                    content
                );
                showToast('Note updated successfully', 'success');
            } else {
                await noteService.addNote(currentUser.uid, applicationId, content);
                showToast('Note added successfully', 'success');
            }
            await loadNotes();
            setShowForm(false);
            setEditingNote(null);
        } catch (error) {
            console.error('Error saving note:', error);
            showToast('Failed to save note', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (note: Note) => {
        setEditingNote(note);
        setShowForm(true);
    };

    const handleDelete = async (noteId: string) => {
        if (!currentUser) return;
        if (!confirm('Are you sure you want to delete this note?')) return;

        try {
            await noteService.deleteNote(currentUser.uid, applicationId, noteId);
            showToast('Note deleted', 'success');
            await loadNotes();
        } catch (error) {
            console.error('Error deleting note:', error);
            showToast('Failed to delete note', 'error');
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingNote(null);
    };

    if (loading) {
        return <div className="notes-loading">Loading notes...</div>;
    }

    return (
        <div className="notes-list">
            <div className="notes-header">
                <h3>Notes</h3>
                {!showForm && (
                    <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
                        <Plus size={16} />
                        Add Note
                    </Button>
                )}
            </div>

            {companyName && role && notes.length > 0 && (
                <NoteSummary
                    notes={notes}
                    companyName={companyName}
                    role={role}
                    applicationId={applicationId}
                />
            )}

            {showForm && (
                <div className="note-form-container">
                    <NoteForm
                        note={editingNote}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        loading={submitting}
                    />
                </div>
            )}

            {notes.length === 0 && !showForm ? (
                <EmptyState
                    icon={<FileText size={32} />}
                    title="No notes yet"
                    description="Add notes to track interview feedback, follow-ups, or reminders."
                    action={{
                        label: 'Add Your First Note',
                        onClick: () => setShowForm(true),
                    }}
                />
            ) : (
                <div className="notes-grid">
                    {notes.map((note) => (
                        <NoteCard
                            key={note.id}
                            note={note}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
