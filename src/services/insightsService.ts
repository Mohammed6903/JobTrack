import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { type Application } from '../types';
import { generateInsights } from './aiService';

const INSIGHTS_REFRESH_DAYS = 7;

export interface UserInsights {
    insights: string[];
    generatedAt: Date;
    modelUsed?: string;
}

// Check if insights need refresh (older than 7 days)
const needsRefresh = (generatedAt: Date): boolean => {
    const now = new Date();
    const diffMs = now.getTime() - generatedAt.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays >= INSIGHTS_REFRESH_DAYS;
};

// Get cached insights for user
export const getCachedInsights = async (userId: string): Promise<UserInsights | null> => {
    try {
        const insightsRef = doc(db, 'users', userId, 'insights', 'latest');
        const docSnap = await getDoc(insightsRef);

        if (!docSnap.exists()) {
            return null;
        }

        const data = docSnap.data();
        return {
            insights: data.insights || [],
            generatedAt: data.generatedAt?.toDate() || new Date(0),
            modelUsed: data.modelUsed,
        };
    } catch (error) {
        console.error('Error fetching cached insights:', error);
        return null;
    }
};

// Save insights to Firestore
const saveInsights = async (userId: string, insights: string[]): Promise<void> => {
    try {
        const insightsRef = doc(db, 'users', userId, 'insights', 'latest');
        await setDoc(insightsRef, {
            insights,
            generatedAt: Timestamp.now(),
        });
    } catch (error) {
        console.error('Error saving insights:', error);
    }
};

// Get insights - uses cache if valid, otherwise generates new
export const getInsights = async (
    userId: string,
    applications: Application[],
    forceRefresh = false
): Promise<UserInsights> => {
    // Check cache first
    if (!forceRefresh) {
        const cached = await getCachedInsights(userId);
        if (cached && !needsRefresh(cached.generatedAt)) {
            return cached;
        }
    }

    // Generate new insights
    const newInsights = await generateInsights(applications);

    // Save to cache
    await saveInsights(userId, newInsights);

    return {
        insights: newInsights,
        generatedAt: new Date(),
    };
};
