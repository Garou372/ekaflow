import { Outlet } from "react-router-dom";
import ErrorBoundary from "../components/common/ErrorBoundary";

export default function PortalLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="h-16 bg-white border-b flex items-center justify-center px-4">
        <span className="text-xl font-bold text-indigo-700">
          Client Portal
        </span>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      
      <footer className="py-6 text-center text-sm text-gray-400">
        Powered by EkaFlow
      </footer>
    </div>
  );
}
