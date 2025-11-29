'use client'

import {
    Bot,
    User
} from "lucide-react"

import { Avatar } from "@/registry/new-york-v4/ui/avatar"
import SQLResultsTable from "./sqlresulttable"
import ReliabilityChart from "./reliability-chart"
import { ReactFlowHierarchy } from "./flow-diagram"
import SensorChart from "./sensor-chart"
import RULResultsTable from "./rul"
import MissionConfigDashboard from './mission-config-dashboard'

export default function Message({ message, index }: MessageProps) {
    const hasReliabilityToolCall = (toolCalls?: ToolCall[]): boolean => {
        if (!toolCalls || !Array.isArray(toolCalls)) return false
        return toolCalls.some(tool => tool.name === 'get_component_reliability')
    }

    const hasSensorToolCall = (toolCalls?: ToolCall[]): boolean => {
        if (!toolCalls || !Array.isArray(toolCalls)) return false
        return toolCalls.some(tool => tool.name === 'get_sensor_readings')
    }
    
    const hasRulToolCall = (toolCalls?: ToolCall[]): boolean => {
        if (!toolCalls || !Array.isArray(toolCalls)) return false
        return toolCalls.some(tool => tool.name === 'calculate_rul')
    }

    const hasSQLResponse = (aiResponse?: AIResponse | string): boolean => {
        if (!aiResponse) return false;

        try {
            let parsed;
            if (typeof aiResponse === 'string') {
                parsed = JSON.parse(aiResponse);
            } else {
                parsed = aiResponse;
            }

            return !!(parsed && (
                (parsed.result && Array.isArray(parsed.result) && parsed.result.length > 0) ||
                (parsed.generated_sql)
            ));
        } catch (error) {
            return false;
        }
    };

    return (
        <div className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.role === 'assistant' && (
                <Avatar className="w-8 h-8 mt-1">
                    <Bot className="w-4 h-4" />
                </Avatar>
            )}

            <div className={`max-w-3xl ${message.role === 'user' ? 'order-first' : ''}`}>
                <div className={`rounded-lg p-4 ${message.role === 'user'
                    ? 'bg-primary text-primary-foreground ml-auto'
                    : message.isError
                        ? 'bg-destructive/10 text-destructive border border-destructive/20'
                        : 'bg-muted'
                    }`}>
                    <div className="whitespace-pre-wrap">{message.content}</div>

                    {/* Mission Config Dashboard */}
                    {message.role === 'assistant' && message.isMissionConfig && (
                        <MissionConfigDashboard />
                    )}

                    {/* Component Hierarchy Display with React Flow */}
                    {message.role === 'assistant' && message.hierarchy_data && (
                        <ReactFlowHierarchy
                            hierarchyData={message.hierarchy_data}
                            duration={message.duration}
                        />
                    )}

                    {/* SQL Results Table */}
                    {message.role === 'assistant' && hasSQLResponse(message.ai_response) && message.ai_response && (
                        <SQLResultsTable aiResponse={message.ai_response} />
                    )}

                    {/* RUL Results Table */}
                    {message.role === 'assistant' && hasRulToolCall(message.tool_calls) && (
                        <RULResultsTable toolCalls={message.tool_calls} />
                    )}

                    {/* Reliability Chart */}
                    {message.role === 'assistant' && hasReliabilityToolCall(message.tool_calls) && message.tool_calls && (
                        <ReliabilityChart toolCalls={message.tool_calls} />
                    )}

                    {/* Sensor Chart */}
                    {message.role === 'assistant' && hasSensorToolCall(message.tool_calls) && message.tool_calls && (
                        <SensorChart toolCalls={message.tool_calls} />
                    )}
                    
                    {/* Tool Calls Display */}
                    {message.tool_calls && message.tool_calls.length > 0 && (
                        <details className="w-full mt-4 pt-4 border-t border-border/20 cursor-pointer">
                            <summary className="text-sm text-muted-foreground mb-2">details:</summary>
                            {message.tool_calls.map((tool, toolIndex) => (
                                <div key={toolIndex} className="bg-background/50 rounded p-3 mb-2 text-sm">
                                    <div className="font-medium text-foreground">{tool.name}</div>
                                    <div className="text-muted-foreground mt-1">
                                        Arguments: {JSON.stringify(tool.arguments, null, 2)}
                                    </div>
                                    {tool.result && (
                                        <div className="text-muted-foreground mt-2">
                                            <details className="cursor-pointer">
                                                <summary className="hover:text-foreground">View result</summary>
                                                <pre className="mt-2 text-xs overflow-x-auto bg-background/80 p-2 rounded">
                                                    {JSON.stringify(tool.result, null, 2)}
                                                </pre>
                                            </details>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </details>
                    )}
                </div>

                <div className="text-xs text-muted-foreground mt-1 px-4">
                    {new Date(message.timestamp).toLocaleTimeString()}
                </div>
            </div>

            {message.role === 'user' && (
                <Avatar className="w-8 h-8 mt-1">
                    <User className="w-4 w-4" />
                </Avatar>
            )}
        </div>
    )
}