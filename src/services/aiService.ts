import { getAI, getGenerativeModel, type GenerativeModel } from '@firebase/ai';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import app, { db } from '../config/firebase';
import { type Application, type Note } from '../types';

// Model fallback chain - ordered by preference
const MODEL_CHAIN = [
    'gemini-3-pro-preview',
    'gemini-3-flash-preview',
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
];

// Get today's date string for rate limit logging
const getTodayDateString = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

// Log rate limit error to Firestore
const logRateLimitError = async (modelName: string): Promise<void> => {
    const dateString = getTodayDateString();
    const rateLimitRef = doc(db, 'ai_rate_limits', dateString);

    try {
        const docSnap = await getDoc(rateLimitRef);

        if (docSnap.exists()) {
            // Update existing document
            await updateDoc(rateLimitRef, {
                failedModels: arrayUnion(modelName),
                lastUpdated: Timestamp.now(),
            });
        } else {
            // Create new document for today
            await setDoc(rateLimitRef, {
                date: dateString,
                failedModels: [modelName],
                lastUpdated: Timestamp.now(),
            });
        }
    } catch (error) {
        console.error('Error logging rate limit:', error);
    }
};

// Check if error is a rate limit error
const isRateLimitError = (error: unknown): boolean => {
    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        return (
            message.includes('429') ||
            message.includes('503') ||
            message.includes('rate limit') ||
            message.includes('quota exceeded') ||
            message.includes('resource exhausted')
        );
    }
    return false;
};

// Generate content with model fallback
const generateWithFallback = async (prompt: string): Promise<string> => {
    const ai = getAI(app);
    let lastError: Error | null = null;

    for (const modelName of MODEL_CHAIN) {
        try {
            const model: GenerativeModel = getGenerativeModel(ai, { model: modelName });
            const result = await model.generateContent(prompt);
            const response = result.response;
            return response.text();
        } catch (error) {
            console.warn(`Model ${modelName} failed:`, error);
            lastError = error instanceof Error ? error : new Error(String(error));

            if (isRateLimitError(error)) {
                await logRateLimitError(modelName);
                // Continue to next model
                continue;
            }

            // For non-rate-limit errors, still try next model
            continue;
        }
    }

    // All models failed - use lastError message if available
    const errorMessage = lastError?.message || 'All AI models are currently unavailable.';
    throw new Error(
        `${errorMessage} Free request rate limits may have been exceeded. Please try again later.`
    );
};

// Generate application insights
export const generateInsights = async (
    applications: Application[]
): Promise<string[]> => {
    // Filter to beyond-applied stage applications and take most recent 50
    const filteredApps = applications
        .filter((app) => app.stage !== 'applied')
        .sort((a, b) => b.applicationDate.getTime() - a.applicationDate.getTime())
        .slice(0, 50);

    if (filteredApps.length === 0) {
        return [
            'Add more applications and move them beyond the "Applied" stage to get personalized insights.',
        ];
    }

    const appData = filteredApps.map((app) => ({
        company: app.companyName,
        role: app.role,
        stage: app.stage,
        applicationDate: app.applicationDate.toISOString().split('T')[0],
    }));

    const prompt = `You are a job search analytics assistant. Analyze the following job applications and provide 2-4 concise, actionable insights.

Focus on patterns like:
- Which roles or industries are getting more interviews
- Response rates and timing patterns
- Follow-up recommendations for applications that haven't progressed
- Any trends in rejection vs success rates

Applications data:
${JSON.stringify(appData, null, 2)}

Provide exactly 2-4 insights. Each insight should be a single sentence starting with an observation or recommendation. Do not use bullet points or numbering in your response, just provide plain text insights separated by newlines.`;

    const response = await generateWithFallback(prompt);

    // Parse response into array of insights
    const insights = response
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith('-') && !line.match(/^\d+\./));

    return insights.slice(0, 4);
};

// Generate note summary
export const summarizeNotes = async (
    notes: Note[],
    companyName: string,
    role: string
): Promise<{ summary: string; takeaways: string[] }> => {
    if (notes.length === 0) {
        return {
            summary: 'No notes to summarize yet. Add notes about your interviews and interactions.',
            takeaways: [],
        };
    }

    const notesText = notes
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((note) => `[${note.createdAt.toLocaleDateString()}]: ${note.content}`)
        .join('\n\n');

    const prompt = `Summarize the following interview notes for a job application at ${companyName} for the ${role} position.

Notes:
${notesText}

Provide your response in the following exact format:
SUMMARY: [1-2 sentence summary of the overall situation]
TAKEAWAY: [First key takeaway]
TAKEAWAY: [Second key takeaway]
TAKEAWAY: [Third key takeaway - optional]

Be concise and focus on the most important information from the notes.`;

    const response = await generateWithFallback(prompt);

    // Parse response
    const lines = response.split('\n').map((line) => line.trim());
    let summary = '';
    const takeaways: string[] = [];

    for (const line of lines) {
        if (line.startsWith('SUMMARY:')) {
            summary = line.replace('SUMMARY:', '').trim();
        } else if (line.startsWith('TAKEAWAY:')) {
            takeaways.push(line.replace('TAKEAWAY:', '').trim());
        }
    }

    // Fallback if parsing fails
    if (!summary) {
        summary = response.split('\n')[0] || 'Unable to generate summary.';
    }

    return { summary, takeaways };
};
