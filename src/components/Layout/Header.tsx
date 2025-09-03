import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Shield, 
  Bell, 
  Globe, 
  ChevronDown,
  Settings,
  LogOut
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface User {
  name: string;
  role: string;
  sites: string[];
}

interface HeaderProps {
  user: User;
  onLanguageToggle: () => void;
  isArabic: boolean;
}

export const Header = ({ user, onLanguageToggle, isArabic }: HeaderProps) => {
  const [notifications] = useState(3);

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shadow-sm">
      {/* Logo & Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-command rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              {isArabic ? "منصة قيادة الطوارئ" : "Emergency Command Platform"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isArabic ? "قسم عمليات الأمن - ينبع" : "Yanbu Security Operations Division"}
            </p>
          </div>
        </div>
      </div>

      {/* Center Status */}
      <div className="flex items-center gap-4">
        <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
          <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse" />
          {isArabic ? "النظام متاح" : "System Operational"}
        </Badge>
        <Badge variant="outline" className="text-muted-foreground">
          {isArabic ? "المنطقة: ينبع" : "Region: YSOD"}
        </Badge>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Language Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onLanguageToggle}
          className="text-muted-foreground hover:text-foreground"
        >
          <Globe className="w-4 h-4 mr-2" />
          {isArabic ? "EN" : "العربية"}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-4 h-4" />
          {notifications > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs bg-destructive">
              {notifications}
            </Badge>
          )}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 hover:bg-accent">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.role}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.role}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Sites: {user.sites.join(', ')}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};