export default function ThemeToggle({ theme, onChange, icons }) {
  const isLight = theme === "light";
  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label="Toggle color theme"
      aria-pressed={isLight}
      onClick={() => onChange(isLight ? "dark" : "light")}
    >
      <span className="toggle-track">
        <span className="toggle-thumb">{isLight ? icons.light : icons.dark}</span>
      </span>
    </button>
  );
}
