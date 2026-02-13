import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            <nav className="landing-nav">
                <div className="logo">JobTrack</div>
                <div className="nav-links">
                    <button className="btn-text" onClick={() => navigate('/login')}>Login</button>
                    <button className="btn-primary" onClick={() => navigate('/signup')}>Get Started</button>
                </div>
            </nav>

            <header className="hero-section">
                <div className="hero-content">
                    <h1>Track Your Job Search with <span className="gradient-text">AI Superpowers</span></h1>
                    <p className="hero-subtitle">
                        Organize applications, get AI-powered insights, and land your dream job faster.
                        The smartest way to manage your career journey.
                    </p>
                    <div className="hero-buttons">
                        <button className="btn-lg btn-primary" onClick={() => navigate('/signup')}>Start Tracking Free</button>
                        <button className="btn-lg btn-secondary" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Learn More</button>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="glass-card card-1">
                        <div className="card-icon">🚀</div>
                        <h3>Smart Tracking</h3>
                        <p>Kanban board for all your applications</p>
                    </div>
                    <div className="glass-card card-2">
                        <div className="card-icon">✨</div>
                        <h3>AI Insights</h3>
                        <p>Analyze job descriptions instantly</p>
                    </div>
                    <div className="glass-card card-3">
                        <div className="card-icon">📝</div>
                        <h3>Auto Summaries</h3>
                        <p>Never miss a key detail</p>
                    </div>
                </div>
            </header>

            <section id="features" className="features-section">
                <h2>Why JobTrack?</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3>Kanban Workflow</h3>
                        <p>Visualize your progress from "Applied" to "Offer" with our intuitive drag-and-drop board.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🤖</div>
                        <h3>AI Analysis</h3>
                        <p>Get instant feedback on how well your resume matches the job description using Gemini AI.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">⚡</div>
                        <h3>Quick Summaries</h3>
                        <p>Paste notes and let AI summarize the key points, action items, and next steps.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🔒</div>
                        <h3>Secure & Private</h3>
                        <p>Your data is your own. Securely stored and accessible only to you.</p>
                    </div>
                </div>
            </section>

            <footer className="landing-footer">
                <p>© {new Date().getFullYear()} JobTrack. All rights reserved.</p>
            </footer>
        </div>
    );
};
