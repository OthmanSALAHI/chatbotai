
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Layout/Header';
import ChatInterface from '@/components/Chat/ChatInterface';
import AdminPanel from '@/components/Admin/AdminPanel';
import { MessageSquare, Settings } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'chat' | 'admin'>('chat');

  const menuItems = [
    {
      title: 'Chat',
      icon: MessageSquare,
      view: 'chat' as const,
    },
    ...(user?.role === 'admin' ? [{
      title: 'Admin Panel',
      icon: Settings,
      view: 'admin' as const,
    }] : []),
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r border-border">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        onClick={() => setActiveView(item.view)}
                        isActive={activeView === item.view}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <div className="mt-auto p-4 border-t border-border">
              <div className="text-sm text-muted-foreground">
                <p>Logged in as:</p>
                <p className="font-medium text-foreground">{user?.name}</p>
                <p className="text-xs">{user?.email}</p>
              </div>
            </div>
          </SidebarContent>
        </Sidebar>

        <SidebarInset>
          <div className="flex flex-col h-screen">
            <header className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
              <SidebarTrigger />
              <Header />
            </header>
            
            <main className="flex-1 overflow-hidden">
              {activeView === 'chat' ? (
                <ChatInterface />
              ) : (
                <div className="h-full overflow-auto">
                  <AdminPanel />
                </div>
              )}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
