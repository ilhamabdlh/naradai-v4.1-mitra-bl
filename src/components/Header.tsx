import { Sparkles, Bell, Settings, BadgeCheck, Megaphone, Store, Database, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getAuthUser, logout } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type NavPage = "brand-analysis" | "campaign-analysis" | "outlet-analysis" | "source-contents";

interface HeaderProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  /** Instance id; jika "mitra_bukalapak_dashboard" tab Outlet Analysis disembunyikan */
  instanceId?: string;
}

const MITRA_BUKALAPAK_INSTANCE_ID = "mitra_bukalapak_dashboard";

export function Header({ currentPage, onNavigate, instanceId }: HeaderProps) {
  const hideOutletAnalysis = instanceId === MITRA_BUKALAPAK_INSTANCE_ID;
  const navigate = useNavigate();
  const user = getAuthUser();

  const handleNav = (page: NavPage) => {
    onNavigate(page);
    navigate("/");
  };

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-slate-900">
                  Narad<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-cyan-600">ai</span>
                </h1>
                <p className="text-xs text-slate-600">AI-Powered Social Intelligence</p>
              </div>
            </div>

            
            {/* Navigation */}
            <nav className="flex items-center gap-2 ml-2">
              <button
                onClick={() => handleNav("brand-analysis")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === "brand-analysis"
                    ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <BadgeCheck className="w-4 h-4" />
                Brand Analysis
              </button>
              <button
                onClick={() => handleNav("campaign-analysis")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === "campaign-analysis"
                    ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Megaphone className="w-4 h-4" />
                Campaign Analysis
              </button>
              {!hideOutletAnalysis && (
                <button
                  onClick={() => handleNav("outlet-analysis")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === "outlet-analysis"
                      ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Store className="w-4 h-4" />
                  Outlet Analysis
                </button>
              )}
              <button
                onClick={() => handleNav("source-contents")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === "source-contents"
                    ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Database className="w-4 h-4" />
                Source Contents
              </button>

            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full" />
            </button>
            <Link
              to="/project-config"
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Settings className="w-5 h-5 text-slate-600" />
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg text-white text-sm font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2">
                  {(user?.displayName || user?.username || "U").slice(0, 2).toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-medium text-slate-900">{user?.displayName || user?.username}</p>
                  <p className="text-xs text-slate-500">{user?.username}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    logout();
                    navigate("/login", { replace: true });
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}