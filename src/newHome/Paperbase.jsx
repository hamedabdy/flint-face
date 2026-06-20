import React, { useState, useEffect } from 'react';
import TopNav from './TopNav';
import SidePanel from './SidePanel';
import Content from './Content';
import './Layout.css';
import './tokens.css';

/**
 * Main Layout Component (formerly Paperbase)
 * 
 * Integrates:
 * - TopNav (sticky header with menu and user options)
 * - SidePanel (responsive sidebar with searchable navigation)
 * - Content (main content area with Outlet)
 * 
 * Features:
 * - Responsive design (mobile/desktop)
 * - Light/dark mode toggle with localStorage persistence
 * - Focus management for accessibility
 * - Proper z-index stacking
 */

export default function Paperbase() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 640;
  });
  const [isPanelOpen, setIsPanelOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth > 640;
  });
  const [isPanelPinned, setIsPanelPinned] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first, then system preference
    const stored = localStorage.getItem('theme-preference');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [pageTitle, setPageTitle] = useState('Dashboard');

  // Handle responsive design changes
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 640;
      setIsMobile(mobile);

      // Automatically show panel on desktop
      if (!mobile && !isPanelOpen) {
        setIsPanelOpen(true);
      }
      // Automatically close panel on mobile (unless pinned)
      if (mobile && isPanelOpen && !isPanelPinned) {
        setIsPanelOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isPanelOpen, isPanelPinned]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.style.colorScheme = 'dark';
    } else {
      root.style.colorScheme = 'light';
    }

    // Persist theme preference
    localStorage.setItem('theme-preference', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Handle drawer/panel toggle
  const handleDrawerToggle = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  // Handle panel close (when clicking outside on mobile)
  const handlePanelClose = () => {
    if (isMobile && !isPanelPinned) {
      setIsPanelOpen(false);
    }
  };

  // Handle pin toggle
  const handlePinToggle = () => {
    setIsPanelPinned(!isPanelPinned);
  };

  // Handle theme toggle
  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Handle panel "All" menu click
  const handleMenuClick = (menuName) => {
    if (menuName === 'All') {
      setIsPanelOpen(!isPanelOpen);
    }
    setPageTitle(menuName);
  };

  return (
    <div className={`layout ${isDarkMode ? 'layout--dark' : 'layout--light'}`}>
      {/* Top Navigation */}
      <TopNav
        onDrawerToggle={handleDrawerToggle}
        pageTitle={pageTitle}
        isMobile={isMobile}
        isDarkMode={isDarkMode}
        onThemeToggle={handleThemeToggle}
      />

      {/* Main Container */}
      <div className="layout__container">
        {/* Side Panel */}
        <SidePanel
          isOpen={isPanelOpen}
          isPinned={isPanelPinned}
          onClose={handlePanelClose}
          onPinToggle={handlePinToggle}
          isMobile={isMobile}
        />

        {/* Main Content Area */}
        <main className="layout__main" id="main-content">
          <Content onMenuClick={handleMenuClick} />
        </main>
      </div>

      {/* Skip to main content link (for accessibility) */}
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
    </div>
  );
}
