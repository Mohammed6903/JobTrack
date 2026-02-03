import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { type Note } from '../types';

const getNotesCollection = (userId: string, applicationId: string) =>
    collection(db, 'users', userId, 'applications', applicationId, 'notes');

export const noteService = {
    async getNotes(userId: string, applicationId: string): Promise<Note[]> {
        const q = query(
            getNotesCollection(userId, applicationId),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                content: data.content,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            };
        });
    },

    async addNote(
        userId: string,
        applicationId: string,
        content: string
    ): Promise<string> {
        const docRef = await addDoc(getNotesCollection(userId, applicationId), {
            content,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });
        return docRef.id;
    },

    async updateNote(
        userId: string,
        applicationId: string,
        noteId: string,
        content: string
    ): Promise<void> {
        const docRef = doc(
            db,
            'users',
            userId,
            'applications',
            applicationId,
            'notes',
            noteId
        );
        await updateDoc(docRef, {
            content,
            updatedAt: Timestamp.now(),
        });
    },

    async deleteNote(
        userId: string,
        applicationId: string,
        noteId: string
    ): Promise<void> {
        const docRef = doc(
            db,
            'users',
            userId,
            'applications',
            applicationId,
            'notes',
            noteId
        );
        await deleteDoc(docRef);
    },

    async getSummary(
        userId: string,
        applicationId: string
    ): Promise<{ summary: string; takeaways: string[]; generatedAt: Date } | null> {
        const docRef = doc(
            db,
            'users',
            userId,
            'applications',
            applicationId,
            'summary',
            'latest'
        );
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                summary: data.summary,
                takeaways: data.takeaways || [],
                generatedAt: data.generatedAt?.toDate() || new Date(),
            };
        }
        return null;
    },

    async saveSummary(
        userId: string,
        applicationId: string,
        summary: string,
        takeaways: string[]
    ): Promise<void> {
        const docRef = doc(
            db,
            'users',
            userId,
            'applications',
            applicationId,
            'summary',
            'latest'
        );
        await setDoc(docRef, {
            summary,
            takeaways,
            generatedAt: Timestamp.now(),
        });
    },
};
