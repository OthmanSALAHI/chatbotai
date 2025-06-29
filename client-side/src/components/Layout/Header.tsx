
import React from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun, LogOut, MessageSquare } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <div className="flex items-center justify-between flex-1">
      <div className="flex items-center space-x-2">
        <MessageSquare className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold text-foreground">AI ChatBot</h1>
      </div>
      
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground">
          Welcome, {user?.name}
        </span>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Header;
