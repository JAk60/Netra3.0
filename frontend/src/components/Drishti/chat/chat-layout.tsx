"use client";

import { useEffect, useState } from "react";
import ChatMain from "./chat-main";
import Leftsidebar from "./left-sidebar";
import Rightsidebar from "./right-sidebar";
import SystemView from "@/app/(pages)/data-entry/page";
import ModernCRUDUI from "../sensor/sensor_curd";
import RCMAnalysis from "../rcm/rcm";
import { UserSelectionResponse } from "@/actions/user_selection";
import { useUserSelectionStore } from "@/store/UserSelectionStore";
import Mission_Configuration from "@/components/Drishti/mission_config/ConfigWizard";

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
                        setDrishtiData={handleDrishtiDataUpdate}
                        ships={ships}
                        onDrishtiModeChange={handleDrishtiModeChange}
                    />
                );
            case 'documents':
                return <DocumentsView />;
            case 'history':
                return <HistoryView />;
            case 'system':
                return <SystemView />;
            case 'sensor':
                return <ModernCRUDUI />;
            case 'rcm':
                return <RCMAnalysis />;
            case 'help':
                return <HelpView />;
            case 'mconfig':
                return <Mission_Configuration />;
            default:
                return (
                    <ChatMain
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
