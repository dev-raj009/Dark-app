'use client';

import React, { useState, useEffect } from 'react';

export default function Home() {
  const [isDark, setIsDark] = useState(false);

  // Sync with localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      setTimeout(() => {
        setIsDark(true);
      }, 0);
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const newVal = !prev;
      localStorage.setItem('theme', newVal ? 'dark' : 'light');
      return newVal;
    });
  };

  return (
    <div className={`theme-container ${isDark ? 'dark-theme' : ''}`}>
      {/* Load external Google Font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Embedded CSS styles with 100% theme support and absolute fidelity */}
      <style dangerouslySetInnerHTML={{ __html: `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html {
            scroll-behavior: smooth;
        }

        .theme-container {
            min-height: 100vh;
            width: 100%;
            overflow-x: hidden;
            font-family: "Inter", sans-serif;
            background: var(--bg-color);
            color: var(--text-color);
            transition: background 0.3s ease, color 0.3s ease;

            /* Light theme variables by default */
            --bg-color: radial-gradient(circle at 10% 10%, rgba(99, 102, 241, 0.12), transparent 30%),
                        radial-gradient(circle at 90% 90%, rgba(168, 85, 247, 0.10), transparent 30%),
                        #f8fafc;
            --text-color: #111827;
            --card-bg: rgba(255, 255, 255, 0.85);
            --card-border: rgba(226, 232, 240, 0.9);
            --card-shadow: 0 10px 30px rgba(15, 23, 42, 0.06), 0 2px 8px rgba(15, 23, 42, 0.03);
            --card-title-color: #111827;
            --logo-bg: #ffffff;
            --logo-border: #f1f5f9;
            --logo-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
            --visit-btn-bg: #111827;
            --visit-btn-text: #ffffff;
            --badge-bg: #ecfdf5;
            --badge-text: #059669;
            --hero-badge-bg: rgba(255, 255, 255, 0.8);
            --hero-badge-border: rgba(0, 0, 0, 0.06);
            --hero-badge-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
            --hero-badge-text: #4f46e5;
            --hero-title-color-start: #111827;
            --hero-desc-color: #64748b;
            --footer-color: #94a3b8;
            --nav-bg: rgba(255, 255, 255, 0.8);
            --nav-border: rgba(226, 232, 240, 0.8);
        }

        .theme-container.dark-theme {
            --bg-color: radial-gradient(circle at 10% 10%, rgba(99, 102, 241, 0.2), transparent 40%),
                        radial-gradient(circle at 90% 90%, rgba(168, 85, 247, 0.15), transparent 40%),
                        #0b0f19;
            --text-color: #f1f5f9;
            --card-bg: rgba(17, 24, 39, 0.7);
            --card-border: rgba(51, 65, 85, 0.5);
            --card-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2);
            --card-title-color: #ffffff;
            --logo-bg: #1e293b;
            --logo-border: #334155;
            --logo-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
            --visit-btn-bg: #ffffff;
            --visit-btn-text: #0f172a;
            --badge-bg: rgba(16, 185, 129, 0.15);
            --badge-text: #34d399;
            --hero-badge-bg: rgba(30, 41, 59, 0.8);
            --hero-badge-border: rgba(255, 255, 255, 0.08);
            --hero-badge-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
            --hero-badge-text: #818cf8;
            --hero-title-color-start: #ffffff;
            --hero-desc-color: #94a3b8;
            --footer-color: #64748b;
            --nav-bg: rgba(15, 23, 42, 0.8);
            --nav-border: rgba(51, 65, 85, 0.5);
        }

        /* Top Navigation Bar */
        .navbar {
            width: 100%;
            border-bottom: 1px solid var(--nav-border);
            background: var(--nav-bg);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            position: sticky;
            top: 0;
            z-index: 100;
            transition: background 0.3s ease, border-color 0.3s ease;
        }

        .nav-inner {
            max-width: 1200px;
            margin: 0 auto;
            padding: 16px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .nav-logo {
            font-size: 18px;
            font-weight: 800;
            letter-spacing: -0.5px;
            background: linear-gradient(135deg, var(--hero-title-color-start), #4f46e5);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-transform: uppercase;
        }

        .theme-toggle-btn {
            background: transparent;
            border: 1px solid var(--nav-border);
            width: 40px;
            height: 40px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: var(--text-color);
            transition: all 0.25s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
        }

        .theme-toggle-btn:hover {
            background: rgba(99, 102, 241, 0.08);
            transform: scale(1.05);
        }

        .theme-toggle-btn:active {
            transform: scale(0.95);
        }

        .theme-toggle-btn svg {
            width: 20px;
            height: 20px;
            transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Container */
        .container {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 60px 24px;
        }

        /* Hero */
        .hero {
            text-align: center;
            margin-bottom: 50px;
            animation: fadeUp 0.7s ease forwards;
        }

        .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 8px 14px;
            margin-bottom: 18px;
            border-radius: 50px;
            background: var(--hero-badge-bg);
            border: 1px solid var(--hero-badge-border);
            box-shadow: var(--hero-badge-shadow);
            font-size: 13px;
            font-weight: 600;
            color: var(--hero-badge-text);
            transition: all 0.3s ease;
        }

        .hero-badge::before {
            content: "";
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #22c55e;
            box-shadow: 0 0 0 5px rgba(34, 197, 94, 0.12);
        }

        .hero h1 {
            font-size: clamp(32px, 5vw, 58px);
            line-height: 1.1;
            font-weight: 800;
            letter-spacing: -2px;
            margin-bottom: 18px;
            background: linear-gradient(135deg, var(--hero-title-color-start), #4f46e5, #9333ea);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .hero p {
            max-width: 620px;
            margin: 0 auto;
            color: var(--hero-desc-color);
            font-size: 16px;
            line-height: 1.7;
            transition: color 0.3s ease;
        }

        /* Cards Grid */
        .cards-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 22px;
        }

        /* Card */
        .card {
            position: relative;
            min-width: 0;
            padding: 24px;
            border-radius: 24px;
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            box-shadow: var(--card-shadow);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            text-decoration: none;
            color: inherit;
            overflow: hidden;
            transition:
                transform 0.35s ease,
                box-shadow 0.35s ease,
                border-color 0.35s ease,
                background 0.3s ease;
            animation: fadeUp 0.7s ease forwards;
            opacity: 0;
        }

        .card:nth-child(1) {
            animation-delay: 0.1s;
        }

        .card:nth-child(2) {
            animation-delay: 0.2s;
        }

        .card:nth-child(3) {
            animation-delay: 0.3s;
        }

        .card:nth-child(4) {
            animation-delay: 0.4s;
        }

        .card::before {
            content: "";
            position: absolute;
            top: -80px;
            right: -80px;
            width: 160px;
            height: 160px;
            border-radius: 50%;
            background: linear-gradient(
                135deg,
                rgba(99, 102, 241, 0.08),
                rgba(168, 85, 247, 0.08)
            );
            pointer-events: none;
        }

        .card:hover {
            transform: translateY(-8px);
            border-color: rgba(99, 102, 241, 0.25);
            box-shadow:
                0 20px 45px rgba(15, 23, 42, 0.10),
                0 5px 15px rgba(99, 102, 241, 0.08);
        }

        /* Logo */
        .logo-wrapper {
            position: relative;
            z-index: 1;
            width: 100%;
            aspect-ratio: 1 / 1;
            max-width: 150px;
            margin: 0 auto 22px;
            padding: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 20px;
            background: var(--logo-bg);
            border: 1px solid var(--logo-border);
            box-shadow: var(--logo-shadow);
            transition: all 0.3s ease;
        }

        .logo-wrapper img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
            border-radius: 12px;
        }

        /* Card Content */
        .card-content {
            position: relative;
            z-index: 1;
            text-align: center;
        }

        .card-title {
            font-size: 18px;
            font-weight: 700;
            color: var(--card-title-color);
            margin-bottom: 12px;
            transition: color 0.3s ease;
        }

        .free-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 6px 11px;
            border-radius: 50px;
            background: var(--badge-bg);
            color: var(--badge-text);
            font-size: 11px;
            font-weight: 700;
            margin-bottom: 18px;
            transition: all 0.3s ease;
        }

        .visit-btn {
            width: 100%;
            border: 0;
            padding: 12px 16px;
            border-radius: 12px;
            background: var(--visit-btn-bg);
            color: var(--visit-btn-text);
            font-family: inherit;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition:
                background 0.25s ease,
                transform 0.25s ease,
                color 0.25s ease;
        }

        .card:hover .visit-btn {
            background: #4f46e5;
        }

        .visit-btn:active {
            transform: scale(0.97);
        }

        /* Footer */
        footer {
            text-align: center;
            margin-top: 55px;
            color: var(--footer-color);
            font-size: 12px;
            transition: color 0.3s ease;
        }

        /* Animation */
        @keyframes fadeUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Tablet */
        @media (max-width: 900px) {
            .container {
                padding: 45px 20px;
            }

            .cards-grid {
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 18px;
            }

            .logo-wrapper {
                max-width: 130px;
            }
        }

        /* Mobile */
        @media (max-width: 600px) {
            .container {
                padding: 35px 14px;
            }

            .hero {
                margin-bottom: 32px;
            }

            .hero h1 {
                font-size: 32px;
                letter-spacing: -1.2px;
            }

            .hero p {
                font-size: 14px;
                line-height: 1.6;
            }

            .hero-badge {
                font-size: 11px;
                padding: 7px 12px;
            }

            .cards-grid {
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 12px;
            }

            .card {
                padding: 14px;
                border-radius: 18px;
            }

            .logo-wrapper {
                max-width: none;
                padding: 12px;
                margin-bottom: 14px;
                border-radius: 14px;
            }

            .card-title {
                font-size: 13px;
                margin-bottom: 8px;
            }

            .free-badge {
                font-size: 9px;
                padding: 5px 8px;
                margin-bottom: 11px;
            }

            .visit-btn {
                padding: 10px 8px;
                font-size: 11px;
                border-radius: 9px;
            }

            footer {
                margin-top: 35px;
            }

            /* Disable hover lift on touch devices */
            .card:hover {
                transform: none;
            }
        }

        /* Very Small Devices */
        @media (max-width: 350px) {
            .container {
                padding-left: 10px;
                padding-right: 10px;
            }

            .cards-grid {
                gap: 9px;
            }

            .card {
                padding: 11px;
            }

            .card-title {
                font-size: 12px;
            }

            .visit-btn {
                font-size: 10px;
            }
        }

        .nav-links {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-left: auto;
            margin-right: 12px;
        }

        .nav-links a {
            color: var(--text-color);
            text-decoration: none;
            font-size: 12px;
            font-weight: 700;
            padding: 9px 12px;
            border-radius: 10px;
            border: 1px solid transparent;
            transition: all 0.25s ease;
        }

        .nav-links a:hover {
            border-color: var(--nav-border);
            background: rgba(99, 102, 241, 0.08);
            transform: translateY(-1px);
        }

        @media (max-width: 520px) {
            .nav-inner { padding: 12px 14px; }
            .nav-logo { font-size: 15px; }
            .nav-links { gap: 2px; margin-right: 6px; }
            .nav-links a { font-size: 11px; padding: 8px 8px; }
            .theme-toggle-btn { width: 36px; height: 36px; border-radius: 10px; }
        }

        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
        }
        .pw-pi-logo {
            background: #111827;
        }
      ` }} />

      {/* Top sticky navigation bar */}
      <nav className="navbar" id="top_navbar">
        <div className="nav-inner">
          <div className="nav-logo">
            Dark Universe
          </div>
          
          <div className="nav-links">
            <a href="#top_navbar">Home</a>
            <a href="/unacademy">Unacademy</a>
          </div>

          <button 
            type="button" 
            className="theme-toggle-btn" 
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              // Sun icon for switching back to light mode
              <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M4.95 4.95l1.591 1.591m10.91 10.91l1.591 1.591M3 12h2.25m13.5 0H21M4.95 19.05l1.591-1.591m10.91-10.91l1.591-1.591M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
              </svg>
            ) : (
              // Moon icon for switching to dark mode
              <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Main Container matching requested interface completely */}
      <main className="container">
        
        <section className="hero">
          <div className="hero-badge">
            Free Learning Access
          </div>

          <h1>One Destination.<br />Endless Learning.</h1>

          <p>
            Access your favourite educational platforms from one simple place.
            Explore quality learning resources, completely free.
          </p>
        </section>

        <section className="cards-grid">
          
          {/* Physics Wallah */}
          <a
            className="card"
            href="https://studyrays.cc"
            target="_blank"
            rel="noopener noreferrer"
            style={{ opacity: 1 }}
          >
            <div className="logo-wrapper">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/76/Physics_wallah_logo.jpg"
                alt="Physics Wallah Logo"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="card-content">
              <h2 className="card-title">Physics Wallah</h2>
              <span className="free-badge">100% Free</span>

              <button className="visit-btn" type="button">
                Visit Now
              </button>
            </div>
          </a>

          {/* Physics PI */}
          <a
            className="card"
            href="https://semfy-gros.github.io/studyrayspi/PW_Pi_Pro.apk"
            target="_blank"
            rel="noopener noreferrer"
            style={{ opacity: 1 }}
          >
            <div className="logo-wrapper pw-pi-logo">
              <img
                src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzQiIGhlaWdodD0iMzQiIHZpZXdCb3g9IjAgMCAzNCAzNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIzLjY3OTcgMjMuMTYyMlY4LjQ4NTM1SDI4LjE4OTNWMjMuMTYyMkgyMy42Nzk3WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTkuOTMwMjUgMzAuNTk5M0g1LjQzODQ4VjguNDg1NjhIOS45ODM3M1YxMC44NjMzQzEwLjEyNjMgMTAuNTE3NyAxMC40MzUzIDEwLjE2NDQgMTAuOTEwNiA5LjY4MzQzQzExLjM4NTkgOS4yNDI0NyAxMi4wMDM4IDguODYxMSAxMi43NjQ0IDguNTM5MzFDMTMuNTM2NyA4LjIxNzUzIDE0LjQxNjEgOC4wNTY2NCAxNS40MDI0IDguMDU2NjRDMTYuNzkyNyA4LjA1NjY0IDE4LjAwNDggOC4zOTYzIDE5LjAzODYgOS4wNzU2MkMyMC4wNzI0IDkuNzU0OTQgMjAuODY4NiAxMC42ODQ1IDIxLjQyNzEgMTEuODY0NEMyMS45OTc0IDEzLjAzMjQgMjIuMjgyNiAxNC4zNTUyIDIyLjI4MjYgMTUuODMzMUMyMi4yODI2IDE3LjMxMDkgMjE5ODU2IDE4LjYzOTcgMjEuMzkxNCAxOS44MTk2QzIwLjc5NzMgMjAuOTg3NSAxOS45NzE0IDIxLjkxMTIgMTguOTEzOCAyMi41OTA1QzE3Ljg1NjIgMjMuMjU3OSAxNi42MjYzIDIzLjU5MTYgMTUuMjI0MSAyMy41OTE2QzE0LjE2NjUgMjMuNTkxNiAxMy4yNTc1IDIzLjQwMDkgMTIuNDk3IDIzLjAxOTVDMTEuNzM2NSAyMi42MzgyIDExLjE0MjMgMjIuMjA5MSAxMC43MTQ1IDIxLjczMjRDMTAuMjg2NyAyMS4yNTU3IDEwLjAyNTMgMjAuODgwMyA5LjkzMDI1IDIwLjYwNjJWMzAuNTk5M1pNMTcuODQ0MyAxNS44MzMxQzE3Ljg0NDMgMTUuMDEwNyAxNy42NjYxIDE0LjI4OTcgMTcuMzA5NiAxMy42N0MxNi45NjUgMTMuMDM4MyAxNi41MDE2IDEyLjU0OTcgMTUuOTE5MyAxMi4yMDQxQzE1LjMzNyAxMS44NDY1IDE0LjY4OTQgMTEuNjY3OCAxMy45NzY0IDExLjY2NzhDMTMuMjI3OCAxMS42Njc4IDEyLjU1MDUgMTEuODQ2NSAxMS45NDQ0IDEyLjIwNDFDMTEuMzM4NCAxMi41NjE2IDEwLjg1NzEgMTMuMDU2MiAxMC41MDA2IDEzLjY4NzhDMTAuMTU2IDE0LjMwNzYgOS45ODM3MyAxNS4wMjI2IDkuOTgzNzMgMTUuODMzMUM5Ljk4MzczIDE2LjY0MzUgMTAuMTU2IDE3LjM2NDUgMTAuNTAwNiAxNy45OTYxQzEwLjg1NzEgMTguNjE1OSAxMS4zMzg0IDE5LjEwNDUgMTEuOTQ0NCAxOS40NjJDMTIuNTUwNSAxOS44MDc3IDEzLjIyNzggMTkuOTgwNSAxMy45NzY0IDE5Ljk4MDVDMTQuNjg5NCAxOS45ODA1IDE1LjMzNyAxOS44MDc3IDE1LjkxOTMgMTkuNDYyQzYvNTAxNiAxOS4xMTY0IDE2Ljk2NSAyOC42MzM3IDE3LjMwOTYgMTguMDE0QzE3LjY2NjEgMTcuMzgyNCAxNy44NDQzIDE2LjY1NTQgMTcuODQ0MyAxNS44MzMzWigiIGZpbGw9IndoaXRlIi8+CjxlbGxpcHNlIGN4PSIyNS45MzQ2IiBjeT0iNC40NjQ3MiIgcng9IjIuNjI2OTgiIHJ5PSIyLjc2Njk3IiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMzY3Nl82OTExKSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDBfbGluZWFyXzM2NzZfNjkxMSIgeDE9Ij2NS45MzQ2IiB5MT0iMS42OTc3NSIgeDI9IjI1LjkzNDYiIHkyPSI3LjIzMTY5IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNGREY0NDAiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRkRCRDM4Ii8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz48L3N2Zz4K"
                alt="PW PI Logo"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="card-content">
              <h2 className="card-title">PW PI</h2>
              <span className="free-badge">100% Free</span>

              <button className="visit-btn" type="button">
                Visit Now
              </button>
            </div>
          </a>

          {/* Mission Jeet */}
          <a
            className="card"
            href="https://mj.streamfiles.eu.org"
            target="_blank"
            rel="noopener noreferrer"
            style={{ opacity: 1 }}
          >
            <div className="logo-wrapper">
              <img
                src="https://play-lh.googleusercontent.com/aFux_izD7qhcU2AskjHpzjGvCOQr2Vrn42OEQHF774zJZUycwvfPLanRtck0AQ-sdMpplPFLDmorOm7WOLSW=w240-h480-rw"
                alt="Mission Jeet Logo"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="card-content">
              <h2 className="card-title">Mission Jeet</h2>
              <span className="free-badge">100% Free</span>

              <button className="visit-btn" type="button">
                Visit Now
              </button>
            </div>
          </a>

          {/* Next Toppers */}
          <a
            className="card"
            href="https://nt.streamfiles.eu.org"
            target="_blank"
            rel="noopener noreferrer"
            style={{ opacity: 1 }}
          >
            <div className="logo-wrapper">
              <img
                src="https://i.pinimg.com/736x/8c/18/fd/8c18fdf05a69fcafe789f6d2db1d4d33.jpg"
                alt="Next Toppers Logo"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="card-content">
              <h2 className="card-title">Next Toppers</h2>
              <span className="free-badge">100% Free</span>

              <button className="visit-btn" type="button">
                Visit Now
              </button>
            </div>
          </a>

          {/* Vidyakool */}
          <a
            className="card"
            href="https://vidyakool.streamfiles.eu.org"
            target="_blank"
            rel="noopener noreferrer"
            style={{ opacity: 1 }}
          >
            <div className="logo-wrapper">
              <img
                src="https://cdnv2.cutshort.io/company-static/5fbb8f291a3650724c7c4610/user_uploaded_data/logos/Vidyakul_logo_6BnjudXS.png"
                alt="Vidyakool Logo"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="card-content">
              <h2 className="card-title">Vidyakool</h2>
              <span className="free-badge">100% Free</span>

              <button className="visit-btn" type="button">
                Visit Now
              </button>
            </div>
          </a>

          {/* RWA */}
          <a
            className="card"
            href="https://rwa.streamfiles.eu.org"
            target="_blank"
            rel="noopener noreferrer"
            style={{ opacity: 1 }}
          >
            <div className="logo-wrapper">
              <img
                src="https://nocache-appxdb-v2.classx.co.in/subject/2025-02-10-0.12268714003029602.jpeg"
                alt="RWA Logo"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="card-content">
              <h2 className="card-title">RWA</h2>
              <span className="free-badge">100% Free</span>

              <button className="visit-btn" type="button">
                Visit Now
              </button>
            </div>
          </a>

          {/* Unacademy */}
          <a
            className="card"
            href="/unacademy"
            style={{ opacity: 1 }}
            aria-label="Open Unacademy"
          >
            <div className="logo-wrapper">
              <img
                src="https://archive.siasat.com/wp-content/uploads/2022/09/vxvagvw.jpg"
                alt="Unacademy Logo"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="card-content">
              <h2 className="card-title">Unacademy</h2>
              <span className="free-badge">Free Learning Platform</span>
              <button className="visit-btn" type="button">Open App</button>
            </div>
          </a>

          {/* RAYSBOOK */}
          <a
            className="card"
            href="https://raysbook.live"
            target="_blank"
            rel="noopener noreferrer"
            style={{ opacity: 1 }}
          >
            <div className="logo-wrapper">
              <img
                src="https://tawk.link/60517dc1f7ce18270930dc5b/vc/6a809c001d8d3737f7b0b12a/v/58073fff287329ad9594d8152f6634c343969bb4/image.png"
                alt="Rays Book Logo"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="card-content">
              <h2 className="card-title">Rays Book</h2>
              <span className="free-badge">100% Free</span>

              <button className="visit-btn" type="button">
                Visit Now
              </button>
            </div>
          </a>

        </section>

        <footer>
          © 2026 • Free Learning Platform
        </footer>
      </main>
    </div>
  );
}
