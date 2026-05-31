import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/45 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-30 flex h-14 items-center border-b border-border bg-background/95 px-4 backdrop-blur lg:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu size={18} />
          </Button>
        </div>

        <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          {children}
        </div>
      </main>
    </div>
  );
}
