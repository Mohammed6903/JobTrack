import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import './Layout.css';

export const Layout: React.FC = () => {
    return (
        <div className="layout">
            <Header />
            <main className="main-content">
                <div className="main-container">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
