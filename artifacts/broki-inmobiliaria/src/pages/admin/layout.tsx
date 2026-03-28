import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { LayoutDashboard, Home, FileImage, Settings, LogOut, Tags, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AudioPlayer } from '../../components/AudioPlayer';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('broki_auth');
    if (!auth) {
      setLocation('/admin/login');
    } else {
      setIsAuth(true);
    }
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem('broki_auth');
    setLocation('/admin/login');
  };

  if (!isAuth) return <div className="min-h-screen bg-background" />;

  const menu = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { label: 'Apartamentos', icon: Home, path: '/admin/properties' },
    { label: 'Archivos', icon: FileImage, path: '/admin/files' },
    { label: 'Galería', icon: ImageIcon, path: '/admin/gallery' },
    { label: 'Precios', icon: Tags, path: '/admin/pricing' },
    { label: 'Contenido', icon: Settings, path: '/admin/content' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row pb-16 md:pb-0">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r border-border flex flex-col shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-border">
          <span className="font-display font-bold text-xl tracking-widest text-primary">BROKI ADMIN</span>
        </div>
        <nav className="flex-1 py-6 flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-2 px-4">
          {menu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div className={cn(
                  "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border shrink-0 md:shrink",
                  isActive 
                    ? "bg-primary/10 text-primary border-primary" 
                    : "border-transparent text-muted-foreground hover:bg-secondary hover:text-white"
                )}>
                  <item.icon size={18} />
                  <span className="font-bold uppercase text-xs tracking-wider">{item.label}</span>
                </div>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-border hidden md:block">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors border border-transparent hover:border-destructive"
          >
            <LogOut size={18} />
            <span className="font-bold uppercase text-xs tracking-wider">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-10 max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      <AudioPlayer />
    </div>
  );
}
