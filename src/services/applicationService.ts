import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Application, ApplicationStage } from '../types';

const getApplicationsCollection = (userId: string) =>
    collection(db, 'users', userId, 'applications');

export const applicationService = {
    async getApplications(userId: string): Promise<Application[]> {
        const q = query(
            getApplicationsCollection(userId),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                companyName: data.companyName,
                role: data.role,
                stage: data.stage as ApplicationStage,
                applicationDate: data.applicationDate?.toDate() || new Date(),
                jobLink: data.jobLink || '',
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            };
        });
    },

    async addApplication(
        userId: string,
        data: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<string> {
        const docRef = await addDoc(getApplicationsCollection(userId), {
            ...data,
            applicationDate: Timestamp.fromDate(data.applicationDate),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });
        return docRef.id;
    },

    async updateApplication(
        userId: string,
        applicationId: string,
        data: Partial<Omit<Application, 'id' | 'createdAt' | 'updatedAt'>>
    ): Promise<void> {
        const docRef = doc(db, 'users', userId, 'applications', applicationId);
        const updateData: Record<string, any> = {
            ...data,
            updatedAt: Timestamp.now(),
        };

        if (data.applicationDate) {
            updateData.applicationDate = Timestamp.fromDate(data.applicationDate);
        }

        await updateDoc(docRef, updateData);
    },

    async updateApplicationStage(
        userId: string,
        applicationId: string,
        stage: ApplicationStage
    ): Promise<void> {
        const docRef = doc(db, 'users', userId, 'applications', applicationId);
        await updateDoc(docRef, {
            stage,
            updatedAt: Timestamp.now(),
        });
    },

    async deleteApplication(userId: string, applicationId: string): Promise<void> {
        const docRef = doc(db, 'users', userId, 'applications', applicationId);
        await deleteDoc(docRef);
    },
};
