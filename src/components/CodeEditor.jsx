import { Code2 } from "lucide-react";
import { useMemo, useState } from "react";

const starter = `function expireShare(share) {
  if (share.burnAfterView && share.views > 0) {
    return "expired";
  }

  return Date.now() > share.expiresAt ? "expired" : "active";
}`;

const languages = [
  { id: "javascript", label: "JavaScript", ext: "js" },
  { id: "python", label: "Python", ext: "py" },
  { id: "html", label: "HTML", ext: "html" },
  { id: "css", label: "CSS", ext: "css" },
  { id: "json", label: "JSON", ext: "json" }
];

const keywordsMap = {
  javascript: new Set(["const", "let", "var", "return", "if", "else", "function", "async", "await", "import", "export", "class", "new", "true", "false"]),
  python: new Set(["def", "class", "return", "if", "elif", "else", "import", "from", "as", "for", "in", "while", "try", "except", "print", "True", "False", "None"]),
  html: new Set(["doctype", "html", "head", "body", "div", "span", "p", "a", "button", "input", "label", "section", "style", "script"]),
  css: new Set(["margin", "padding", "background", "color", "border", "display", "flex", "position", "width", "height", "font", "grid"]),
  json: new Set(["true", "false", "null"])
};

function highlight(code, langId) {
  const safeCode = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const keywords = keywordsMap[langId] || keywordsMap.javascript;

  // Single-pass highlighting to prevent html tag corruption
  return safeCode.replace(
    /(".*?"|'.*?'|`.*?`|\b\d+\b|\b[a-zA-Z_]\w*\b)/g,
    (match) => {
      if (match.startsWith('"') || match.startsWith("'") || match.startsWith('`')) {
        return `<span class="token-string">${match}</span>`;
      }
      if (/^\d+$/.test(match)) {
        return `<span class="token-number">${match}</span>`;
      }
      if (keywords.has(match)) {
        return `<span class="token-keyword">${match}</span>`;
      }
      return match;
    }
  );
}

export default function CodeEditor({ value, onChange }) {
  const [langId, setLangId] = useState("javascript");
  const code = value !== undefined && value !== null ? value : starter;
  const highlighted = useMemo(() => highlight(code, langId), [code, langId]);
  
  const currentLang = useMemo(() => languages.find(l => l.id === langId), [langId]);

  return (
    <div className="code-editor">
      <div className="editor-toolbar">
        <span>
          <Code2 size={16} />
          snippet.{currentLang.ext}
        </span>
        <select 
          className="lang-select"
          value={langId} 
          onChange={(e) => setLangId(e.target.value)}
          aria-label="Select programming language"
        >
          {languages.map(l => (
            <option key={l.id} value={l.id}>{l.label}</option>
          ))}
        </select>
      </div>
      <div className="editor-body">
        <pre aria-hidden="true" dangerouslySetInnerHTML={{ __html: highlighted }} />
        <textarea
          aria-label="Code snippet"
          spellCheck="false"
          value={code}
          onChange={(event) => onChange?.(event.target.value)}
        />
      </div>
    </div>
  );
}
