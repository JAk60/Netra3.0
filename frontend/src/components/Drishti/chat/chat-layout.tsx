"use client";

import { useEffect, useState } from "react";
import ChatMain from "./chat-main";
import Leftsidebar from "./left-sidebar";
import Rightsidebar from "./right-sidebar";

interface ChatLayoutProps {
    ships: any[]; // Replace with your ships type
}

export default function ChatLayout({ ships }: ChatLayoutProps) {
    const [showRightSidebar, setShowRightSidebar] = useState<boolean>(false);
    const [drishtiData, setDrishtiData] = useState<any>(null);
    const [isDrishtiMode, setIsDrishtiMode] = useState<boolean>(false);

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

    return (
        <div className="flex h-screen">
            <Leftsidebar />

            <ChatMain
                setDrishtiData={handleDrishtiDataUpdate}
                ships={ships}
                onDrishtiModeChange={handleDrishtiModeChange}
            />

            {showRightSidebar && isDrishtiMode && (
                <Rightsidebar drishtiData={drishtiData} />
            )}
        </div>
    );
}