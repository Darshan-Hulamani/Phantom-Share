import { LayoutDashboard, Link2, Menu, Moon, Plus, Sun } from "lucide-react";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Navbar({ theme, onThemeChange, isAppPage }) {
  return (
    <header className="navbar">
      <a className="brand" href="#/" aria-label="PhantomShare home">
        <span className="brand-mark">P</span>
        <span>PhantomShare</span>
      </a>
      <nav className="nav-links" aria-label="Primary navigation">
        <a href="#/create">
          <Plus size={17} />
          Create
        </a>
        <a href="#/dashboard">
          <LayoutDashboard size={17} />
          Dashboard
        </a>
        <a href="#/view">
          <Link2 size={17} />
          Demo View
        </a>
      </nav>
      <div className="nav-actions">
        <ThemeToggle
          theme={theme}
          onChange={onThemeChange}
          icons={{ dark: <Moon size={16} />, light: <Sun size={16} /> }}
        />
        <a className="primary-button compact" href="#/create">
          <Plus size={17} />
          <span>Create Share</span>
        </a>
        {isAppPage && (
          <button className="icon-button mobile-only" type="button" aria-label="Open navigation">
            <Menu size={19} />
          </button>
        )}
      </div>
    </header>
  );
}
