import { useCallback, useEffect, useMemo, useState } from "react";
import { CATEGORIES, DEFAULT_API_NAME, ENDPOINTS } from "@shared/catalog";
import type { Category, Endpoint, EndpointStatus, RuntimeEndpointInfo } from "@shared/types";
import { TopBar } from "./components/TopBar";
import { Sidebar } from "./components/Sidebar";
import { Overview } from "./components/Overview";
import { EndpointList } from "./components/EndpointList";
import { fetchApiStatus, fetchRuntimeInfo, type ApiStatus, type RuntimeMap } from "./lib/runtime";

type Theme = "light" | "dark";

function initialTheme(): Theme {
  try {
    const saved = localStorage.getItem("siputzx-theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* almacenamiento no disponible */
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [runtime, setRuntime] = useState<RuntimeMap>({});

  // Tema claro/oscuro
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("siputzx-theme", theme);
    } catch {
      /* ignorar */
    }
  }, [theme]);

  // Estado del servicio y disponibilidad real de endpoints
  useEffect(() => {
    let alive = true;
    async function refresh() {
      const [status, info] = await Promise.all([fetchApiStatus(), fetchRuntimeInfo()]);
      if (!alive) return;
      setApiStatus(status);
      if (Object.keys(info).length) setRuntime(info);
    }
    void refresh();
    const interval = setInterval(refresh, 30000);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, []);

  const apiName = apiStatus?.name ?? DEFAULT_API_NAME;

  const statusOf = useCallback(
    (ep: Endpoint): EndpointStatus => runtime[ep.id]?.status ?? ep.status,
    [runtime]
  );
  const runtimeOf = useCallback((ep: Endpoint): RuntimeEndpointInfo | undefined => runtime[ep.id], [runtime]);

  const selectEndpoint = useCallback((ep: Endpoint) => {
    setCategoryId(ep.category);
    setExpandedId(ep.id);
    setSidebarOpen(false);
    requestAnimationFrame(() => {
      setTimeout(() => document.getElementById(`ep-${ep.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
    });
  }, []);

  const selectCategory = useCallback((cat: Category) => {
    setCategoryId(cat.id);
    setExpandedId(null);
    setSidebarOpen(false);
  }, []);

  const category = useMemo(() => CATEGORIES.find((c) => c.id === categoryId) ?? null, [categoryId]);
  const categoryEndpoints = useMemo(
    () => (category ? ENDPOINTS.filter((e) => e.category === category.id) : []),
    [category]
  );

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-bg text-ink">
      <TopBar
        apiName={apiName}
        apiStatus={apiStatus}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
        endpoints={ENDPOINTS}
        statusOf={statusOf}
        onSelectEndpoint={selectEndpoint}
      />
      <div className="flex min-h-0 flex-1">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeCategory={categoryId}
          activeEndpoint={expandedId}
          statusOf={statusOf}
          onSelectEndpoint={selectEndpoint}
        />
        <main className="min-w-0 flex-1 overflow-y-auto">
          {category ? (
            <EndpointList
              category={category}
              endpoints={categoryEndpoints}
              expandedId={expandedId}
              onToggle={(id) => setExpandedId((cur) => (cur === id ? null : id))}
              statusOf={statusOf}
              runtimeOf={runtimeOf}
              apiName={apiName}
            />
          ) : (
            <Overview apiName={apiName} statusOf={statusOf} onSelectCategory={selectCategory} />
          )}
        </main>
      </div>
    </div>
  );
}
