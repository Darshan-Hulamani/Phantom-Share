import { useEffect, useMemo, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import ToastHost from "./components/Toast.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import CreateSharePage from "./pages/CreateSharePage.jsx";
import ShareSuccessPage from "./pages/ShareSuccessPage.jsx";
import ViewContentPage from "./pages/ViewContentPage.jsx";
import PasswordPage from "./pages/PasswordPage.jsx";
import ExpiredPage from "./pages/ExpiredPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import { sampleShares } from "./data/shares.js";

const routes = {
  "/": LandingPage,
  "/create": CreateSharePage,
  "/success": ShareSuccessPage,
  "/view": ViewContentPage,
  "/password": PasswordPage,
  "/expired": ExpiredPage,
  "/dashboard": DashboardPage
};

function useHashRoute() {
  const getPath = () => {
    const raw = window.location.hash.replace("#", "") || "/";
    return raw.split("?")[0];
  };
  const [path, setPath] = useState(getPath);

  useEffect(() => {
    const onChange = () => setPath(getPath());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return path;
}

export default function App() {
  const path = useHashRoute();
  const [theme, setTheme] = useState(() => localStorage.getItem("phantom-theme") || "dark");
  const [toasts, setToasts] = useState([]);
  const [activeShare, setActiveShare] = useState(null);
  const Page = routes[path] || LandingPage;
  const appState = useMemo(() => ({ shares: sampleShares }), []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("phantom-theme", theme);
  }, [theme]);

  const notify = (message, tone = "success") => {
    const id = crypto.randomUUID();
    setToasts((items) => [...items, { id, message, tone }]);
    window.setTimeout(() => setToasts((items) => items.filter((toast) => toast.id !== id)), 2800);
  };

  const isAppPage = path !== "/";

  return (
    <div className="app-shell">
      <Navbar theme={theme} onThemeChange={setTheme} isAppPage={isAppPage} />
      {isAppPage && <Sidebar />}
      <main className={isAppPage ? "page-shell app-page" : "page-shell"}>
        <Page 
          appState={appState} 
          notify={notify} 
          activeShare={activeShare} 
          setActiveShare={setActiveShare} 
        />
      </main>
      <ToastHost toasts={toasts} />
    </div>
  );
}
