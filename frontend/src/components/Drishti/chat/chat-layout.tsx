"use client";

import { useEffect, useState } from "react";
import ChatMain from "./chat-main";
import Leftsidebar from "./left-sidebar";
import Rightsidebar from "./right-sidebar";

import { UserSelectionResponse } from "@/actions/user_selection";
import { useUserSelectionStore } from "@/store/UserSelectionStore";
import ModernCRUDUI from "../sensor/sensor_curd";
import NavalMissionConfig from "@/components/Drishti/mission_config/NavalMissionConfig";
import { RCMmainView } from "../rcm/main";
import SystemView from "../system/system-main";
import ETLPage from "@/components/etl/main";
import HistoryView from "./HistoryView";
import { ChatSession } from "@/store/chat_history_store";
import DocumentManager from "../documents/folder-manager";



export type ViewType = 'logout' | 'etl' | 'chat' | 'mconfig' | 'documents' | 'history' | 'system' | 'settings' | 'help' | "sensor" | "rcm";

interface ChatLayoutProps {
  ships: any[];
  user_selectiondata?: UserSelectionResponse;
}

export default function ChatLayout({ ships, user_selectiondata }: ChatLayoutProps) {
  const [currentView, setCurrentView] = useState<ViewType>('chat');
  const [showRightSidebar, setShowRightSidebar] = useState<boolean>(false);
  const [drishtiData, setDrishtiData] = useState<any>(null);
  const [isDrishtiMode, setIsDrishtiMode] = useState<boolean>(false);
  const [chatKey, setChatKey] = useState(0);
  const [resumeMessages, setResumeMessages] = useState<any[] | undefined>(undefined);
  const setData = useUserSelectionStore(state => state.setData);

  useEffect(() => {
    if (user_selectiondata) {
      setData(user_selectiondata.data);
    }
  }, []);

  useEffect(() => {
    if (isDrishtiMode) {
      setShowRightSidebar(true);
    } else {
      setShowRightSidebar(false);
      setDrishtiData(null);
    }
  }, [isDrishtiMode]);

  const handleDrishtiModeChange = (isActive: boolean) => {
    setIsDrishtiMode(isActive);
  };

  const handleDrishtiDataUpdate = (data: any) => {
    setDrishtiData(data);
    if (data && isDrishtiMode) {
      setShowRightSidebar(true);
    }
  };

  const handleViewChange = (view: ViewType) => {
    if (view === 'chat' && currentView === 'chat') {
      setChatKey(prev => prev + 1);
      setIsDrishtiMode(false);
      setDrishtiData(null);
      setShowRightSidebar(false);
      setResumeMessages(undefined);
    }

    setCurrentView(view);

    if (view !== 'chat' && isDrishtiMode) {
      setIsDrishtiMode(false);
    }
  };

  // Called when user clicks "Resume" on a history session
  const handleResumeChat = (session: ChatSession) => {
    setResumeMessages(session.messages);
    setChatKey(prev => prev + 1); // remount ChatMain with new initial messages
    setIsDrishtiMode(false);
    setDrishtiData(null);
    setShowRightSidebar(false);
    setCurrentView('chat');
  };

  const renderMainContent = () => {
    switch (currentView) {
      case 'chat':
        return (
          <ChatMain
            key={chatKey}
            setDrishtiData={handleDrishtiDataUpdate}
            ships={ships}
            onDrishtiModeChange={handleDrishtiModeChange}
            initialMessages={resumeMessages}
          />
        );
      case 'documents':
        return <DocumentManager />;
      case 'history':
        return <HistoryView onResumeChat={handleResumeChat} />;
      case 'system':
        return <SystemView />;
      case 'settings':
        return <SettingView />;
      case 'sensor':
        return <ModernCRUDUI />;
      case 'rcm':
        return <RCMmainView />;
      case 'etl':
        return <ETLPage />;
      case 'help':
        return <HelpView />;
      case 'mconfig':
        return <NavalMissionConfig />;
      default:
        return (
          <ChatMain
            key={chatKey}
            setDrishtiData={handleDrishtiDataUpdate}
            ships={ships}
            onDrishtiModeChange={handleDrishtiModeChange}
            initialMessages={resumeMessages}
          />
        );
    }
  };

  return (
    <div className="flex h-screen">
      <Leftsidebar
        currentView={currentView}
        onViewChange={handleViewChange}
      />

      {renderMainContent()}

      {showRightSidebar && isDrishtiMode && currentView === 'chat' && (
        <Rightsidebar drishtiData={drishtiData} />
      )}
    </div>
  );
}

function HistoryViewPlaceholder() {
  return <div className="flex-1 flex items-center justify-center">History View</div>;
}
function HelpView() {
  return <div className="flex-1 flex items-center justify-center">Help View</div>;
}
function SettingView() {
  return <div className="flex-1 flex items-center justify-center">Settings View</div>;
}
// function DocumentManager() {
//   return <div className="flex-1 flex items-center justify-center">Document Manager</div>;
// }