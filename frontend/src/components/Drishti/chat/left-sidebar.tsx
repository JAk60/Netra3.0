"use client"

import { Button } from "@/registry/new-york-v4/ui/button"
import {
  Cog,
  Eye,
  FileText,
  HelpCircle,
  History,
  LogOut,
  MessageSquare,
  Plus,
  Settings,
  Telescope,
  Zap
} from "lucide-react"
import { ViewType } from "./chat-layout"
import { useAuthStore } from "@/store/auth-store";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

interface LeftsidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export default function Leftsidebar({ currentView, onViewChange }: LeftsidebarProps) {
  const isActive = (view: ViewType) => currentView === view;
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      router.push('/login')
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  return (
    <div className="w-64 rounded-md border-r flex flex-col">
      {/* Logo and Header with Animation */}
      <div className="ml-4 p-4 border-b">
        <div className="flex justify-start items-center">
          <Telescope className="w-12 h-12 animate-[jumpThenMirror_20s_ease-in-out_infinite]" />
          <span className="font-[amita] text-4xl flex mt-1 ml-3">
            {/* दृष्टि */}नेत्रा
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        {/* Search functionality commented out */}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        <Button
          variant={isActive('chat') ? "default" : "ghost"}
          className={`w-full justify-start gap-3 ${isActive('chat')
            ? "bg-[#25547e] hover:bg-[#25547e]/60 text-sidebar-primary-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          onClick={() => onViewChange('chat')}
        >
          <MessageSquare className="w-4 h-4" />
          New Chat
        </Button>

        <Button
          variant={isActive('documents') ? "default" : "ghost"}
          className={`w-full justify-start gap-3 ${isActive('documents')
            ? "bg-[#25547e] hover:bg-[#25547e]/60 text-sidebar-primary-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          onClick={() => onViewChange('documents')}
        >
          <FileText className="w-4 h-4" />
          Documents
          <Plus className="w-4 h-4 ml-auto" />
        </Button>

        <Button
          variant={isActive('history') ? "default" : "ghost"}
          className={`w-full justify-start gap-3 ${isActive('history')
            ? "bg-[#25547e] hover:bg-[#25547e]/60 text-sidebar-primary-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          onClick={() => onViewChange('history')}
        >
          <History className="w-4 h-4" />
          History
        </Button>
      </nav>

      {/* Manual Data Entry */}
      <div className="p-4 space-y-1 border-t border-sidebar-border">
        <div className="text-sm font-medium text-muted-foreground mb-2">Manual Modules</div>

        <Button
          variant={isActive('system') ? "default" : "ghost"}
          className={`w-full justify-start gap-3 ${isActive('system')
            ? "bg-[#25547e] hover:bg-[#25547e]/60 text-sidebar-primary-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          onClick={() => onViewChange('system')}
        >
          <Settings className="w-4 h-4" />
          System Management
        </Button>
        <Button
          variant={isActive('sensor') ? "default" : "ghost"}
          className={`w-full justify-start gap-3 ${isActive('sensor')
            ? "bg-[#25547e] hover:bg-[#25547e]/60 text-sidebar-primary-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          onClick={() => onViewChange('sensor')}
        >
          <Eye className="text-white w-4 h-4" />
          sensor
        </Button>
        <Button
          variant={isActive('rcm') ? "default" : "ghost"}
          className={`w-full justify-start gap-3 ${isActive('rcm')
            ? "bg-[#25547e] hover:bg-[#25547e]/60 text-sidebar-primary-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          onClick={() => onViewChange('rcm')}
        >
          <Eye className="text-white w-4 h-4" />
          rcm
        </Button>
        <Button
          variant={isActive('etl') ? "default" : "ghost"}
          className={`w-full justify-start gap-3 ${isActive('etl')
            ? "bg-[#25547e] hover:bg-[#25547e]/60 text-sidebar-primary-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          onClick={() => onViewChange('etl')}
        >
          <Zap className="text-white w-4 h-4" />
          CMMS2NETRA
        </Button>
        <Button
          variant={isActive('mconfig') ? "default" : "ghost"}
          className={`w-full justify-start gap-3 ${isActive('mconfig')
            ? "bg-[#25547e] hover:bg-[#25547e]/60 text-sidebar-primary-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          onClick={() => onViewChange('mconfig')}
        >
          <Cog className="w-4 h-4" />
          Mission Configuration
        </Button>
      </div>

      {/* Settings & Help */}
      <div className="p-4 space-y-1 border-t border-sidebar-border">
        <div className="text-sm font-medium text-muted-foreground mb-2">Settings & Help</div>

        <Button
          variant={isActive('settings') ? "default" : "ghost"}
          className={`w-full justify-start gap-3 ${isActive('settings')
            ? "bg-[#25547e] hover:bg-[#25547e]/60 text-sidebar-primary-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          onClick={() => onViewChange('settings')}
        >
          <Settings className="w-4 h-4" />
          Settings
        </Button>

        <Button
          variant={isActive('help') ? "default" : "ghost"}
          className={`w-full justify-start gap-3 ${isActive('help')
            ? "bg-[#25547e] hover:bg-[#25547e]/60 text-sidebar-primary-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          onClick={() => onViewChange('help')}
        >
          <HelpCircle className="w-4 h-4" />
          Help
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-300 hover:bg-red-950 hover:text-red-200 hover:border-red-800"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  )
}
