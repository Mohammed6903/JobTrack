import React from 'react';
import { format } from 'date-fns';
import { Edit2, Trash2 } from 'lucide-react';
import type { Note } from '../../types';
import './NoteCard.css';

interface NoteCardProps {
    note: Note;
    onEdit: (note: Note) => void;
    onDelete: (noteId: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete }) => {
    return (
        <div className="note-card">
            <div className="note-content">{note.content}</div>
            <div className="note-footer">
                <span className="note-timestamp">
                    {format(note.updatedAt, 'MMM d, yyyy h:mm a')}
                    {note.updatedAt.getTime() !== note.createdAt.getTime() && ' (edited)'}
                </span>
                <div className="note-actions">
                    <button className="note-action" onClick={() => onEdit(note)}>
                        <Edit2 size={14} />
                    </button>
                    <button className="note-action danger" onClick={() => onDelete(note.id)}>
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};
