import React from 'react';
import { useNavigate } from 'react-router-dom';
import dashboardImg from '../assets/dashboard.png';
import analyticsImg from '../assets/analytics.png';
import aiInsightsImg from '../assets/AI_Insights.png';
import applicationDetailsImg from '../assets/application_details.png';
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
                <div className="hero-image-container">
                    <img src={dashboardImg} alt="JobTrack Dashboard" className="hero-dashboard-img" />
                    <div className="hero-glow"></div>
                </div>
            </header>

            <section id="features" className="features-showcase">
                <div className="showcase-container">
                    <div className="showcase-item">
                        <div className="showcase-content">
                            {/* <div className="feature-icon">✨</div> */}
                            <h2>AI-Powered Insights</h2>
                            <p>
                                Stop guessing. Get instant, AI-generated feedback on how well your resume matches the job description.
                                JobTrack analyzes key requirements and gives you actionable tips to improve your chances.
                            </p>
                        </div>
                        <div className="showcase-image">
                            <img src={aiInsightsImg} alt="AI Insights" />
                        </div>
                    </div>

                    <div className="showcase-item reverse">
                        <div className="showcase-content">
                            {/* <div className="feature-icon">📊</div> */}
                            <h2>Visual Analytics</h2>
                            <p>
                                Visualize your progress. Track application velocity, stage distribution, and success rates over time.
                                Stay motivated by seeing your journey in beautiful, interactive charts.
                            </p>
                        </div>
                        <div className="showcase-image">
                            <img src={analyticsImg} alt="Analytics Dashboard" />
                        </div>
                    </div>

                    <div className="showcase-item">
                        <div className="showcase-content">
                            {/* <div className="feature-icon">📝</div> */}
                            <h2>Comprehensive Tracking</h2>
                            <p>
                                Keep everything in one place. Manage notes, interview dates, salary details, and more.
                                Never lose track of a follow-up or forget a detail again.
                            </p>
                        </div>
                        <div className="showcase-image">
                            <img src={applicationDetailsImg} alt="Application Details" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="cta-section">
                <div className="cta-content">
                    <h2>Ready to land your dream job?</h2>
                    <p>Join thousands of job seekers who are organizing their search with JobTrack.</p>
                    <button className="btn-lg btn-primary" onClick={() => navigate('/signup')}>Get Started for Free</button>
                </div>
            </section>

            <footer className="landing-footer">
                <p>© {new Date().getFullYear()} JobTrack. All rights reserved.</p>
            </footer>
        </div>
    );
};
