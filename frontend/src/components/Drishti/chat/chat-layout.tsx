"use client";

import { useEffect, useState } from "react";
import ChatMain from "./chat-main";
import Leftsidebar from "./left-sidebar";
import Rightsidebar from "./right-sidebar";

import { UserSelectionResponse } from "@/actions/user_selection";
import { useUserSelectionStore } from "@/store/UserSelectionStore";
import ModernCRUDUI from "../sensor/sensor_curd";
// import Mission_Configuration from "@/components/Drishti/mission_config/index";
import NavalMissionConfig from "@/components/Drishti/mission_config/NavalMissionConfig";
import { DocumentManager } from "../documents/folder-manager";
import { RCMmainView } from "../rcm/main";
import SystemView from "../system/system-main";


export type ViewType = 'chat' | 'mconfig' | 'documents' | 'history' | 'system' | 'settings' | 'help' | "sensor" | "rcm";

interface ChatLayoutProps {
    ships: any[]; // Replace with your ships type
    user_selectiondata?: UserSelectionResponse; // Replace with your user selection data type
}

export default function ChatLayout({ ships, user_selectiondata }: ChatLayoutProps) {
    const [currentView, setCurrentView] = useState<ViewType>('chat');
    const [showRightSidebar, setShowRightSidebar] = useState<boolean>(false);
    const [drishtiData, setDrishtiData] = useState<any>(null);
    const [isDrishtiMode, setIsDrishtiMode] = useState<boolean>(false);
    const [chatKey, setChatKey] = useState(0); // Key to force chat reset
    const setData = useUserSelectionStore(state => state.setData);

    useEffect(() => {
        if (user_selectiondata) {
            setData(user_selectiondata.data);
        }
    }, []);

    // Auto-manage right sidebar based on Drishti mode
    useEffect(() => {
        if (isDrishtiMode) {
            // Always show sidebar when in Drishti mode
            setShowRightSidebar(true);
        } else {
            // Hide sidebar when exiting Drishti mode
            setShowRightSidebar(false);
            // Clear data when exiting Drishti mode
            setDrishtiData(null);
        }
    }, [isDrishtiMode]);

    // Handle Drishti mode changes from ChatMain
    const handleDrishtiModeChange = (isActive: boolean) => {
        setIsDrishtiMode(isActive);
    };

    // Handle Drishti data updates
    const handleDrishtiDataUpdate = (data: any) => {
        setDrishtiData(data);
        // Ensure sidebar is visible when data is received
        if (data && isDrishtiMode) {
            setShowRightSidebar(true);
        }
    };

    // Handle view changes from sidebar
    const handleViewChange = (view: ViewType) => {
        // If clicking "New Chat" while already on chat view, reset the chat
        if (view === 'chat' && currentView === 'chat') {
            setChatKey(prev => prev + 1); // Force remount by changing key
            setIsDrishtiMode(false);
            setDrishtiData(null);
            setShowRightSidebar(false);
        }

        setCurrentView(view);

        // Exit Drishti mode when switching away from chat
        if (view !== 'chat' && isDrishtiMode) {
            setIsDrishtiMode(false);
        }
    };

    // Render the appropriate view based on currentView
    const renderMainContent = () => {
        switch (currentView) {
            case 'chat':
                return (
                    <ChatMain
                        key={chatKey} // This forces a complete reset when key changes
                        setDrishtiData={handleDrishtiDataUpdate}
                        ships={ships}
                        onDrishtiModeChange={handleDrishtiModeChange}
                    />
                );
            case 'documents':
                return <DocumentManager />;
            case 'history':
                return <HistoryView />;
            case 'system':
                return <SystemView />;
            case 'sensor':
                return <ModernCRUDUI />;
            case 'rcm':
                return <RCMmainView />;
            case 'help':
                return <NavalMissionConfig />;
            case 'mconfig':
                return <NavalMissionConfig />;
            default:
                return (
                    <ChatMain
                        key={chatKey}
                        setDrishtiData={handleDrishtiDataUpdate}
                        ships={ships}
                        onDrishtiModeChange={handleDrishtiModeChange}
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


function HistoryView() {
    return <div className="flex-1 flex items-center justify-center">History View</div>;
}