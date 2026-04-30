// messages.tsx
import { Bot, User } from "lucide-react"
import { Avatar } from "@/registry/new-york-v4/ui/avatar"
import SQLResultsTable from "./sqlresulttable"
import ReliabilityChart from "./reliability-chart"
import { ReactFlowHierarchy } from "./flow-diagram"
import SensorChart from "./sensor-chart"
import RULResultsTable from "./rul"
import RCMResultsTable from "./RCMResultsTable "
import MissionConfigDashboard from './mission-config-dashboard'


// ── helpers ──────────────────────────────────────────────────────────────────

function hasTool(toolCalls: ToolCall[] | undefined, name: string): boolean {
    return !!toolCalls?.some(t => t.name === name)
}

function getToolResult(toolCalls: ToolCall[] | undefined, name: string): any | null {
    return toolCalls?.find(t => t.name === name)?.result ?? null
}

function hasSqlQueryRows(toolCalls: ToolCall[] | undefined): boolean {
    return !!toolCalls?.some(t => t.name === 'sql_query' && Array.isArray(t.result?.data?.rows))
}

function hasLegacySqlResponse(aiResponse: any): boolean {
    try {
        const p = typeof aiResponse === 'string' ? JSON.parse(aiResponse) : aiResponse
        return !!(p?.result?.length || p?.generated_sql)
    } catch {
        return false
    }
}

// ── component ─────────────────────────────────────────────────────────────────

export default function Message({ message, index }: MessageProps) {
    const tc = message.tool_calls
    console.log('[Message] tool_calls:', tc)
        console.log('[Message] signals:', message.signals) 
    console.log('[Message] hasSqlQueryRows:', hasSqlQueryRows(tc))

    // Extract ship names in the order they were mentioned in the query
    const shipOrder: string[] = message.signals?.matched_ships?.map(
        (s: { ship_id: string; ship_name: string }) => s.ship_name
    ) ?? []

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

                    {/* Mission Config */}
                    {message.role === 'assistant' && message.isMissionConfig && (
                        <MissionConfigDashboard />
                    )}

                    {/* Hierarchy */}
                    {message.role === 'assistant' && message.hierarchy_data && (
                        <ReactFlowHierarchy
                            hierarchyData={message.hierarchy_data}
                            duration={message.duration}
                        />
                    )}

                    {/* SQL table — from sql_query tool call (GENERAL intent) */}
                    {message.role === 'assistant' && hasSqlQueryRows(tc) && (
                        <SQLResultsTable aiResponse={getToolResult(tc, 'sql_query')} />
                    )}

                    {/* SQL table — legacy ai_response field */}
                    {message.role === 'assistant' && !hasSqlQueryRows(tc) && hasLegacySqlResponse(message.ai_response) && (
                        <SQLResultsTable aiResponse={message.ai_response} />
                    )}

                    {/* RUL */}
                    {message.role === 'assistant' && hasTool(tc, 'calculate_rul') && (
                        <RULResultsTable toolCalls={tc} />
                    )}

                    {/* RCM */}
                    {message.role === 'assistant' && hasTool(tc, 'get_rcm_records') && (
                        <RCMResultsTable toolCalls={tc} />
                    )}

                    {/* Reliability chart — ships ordered by mention in query */}
                    {message.role === 'assistant' && hasTool(tc, 'get_component_reliability') && (
                        <ReliabilityChart
                            toolCalls={tc}
                            shipOrder={shipOrder}
                        />
                    )}

                    {/* Sensor chart */}
                    {message.role === 'assistant' && hasTool(tc, 'get_sensor_readings') && (
                        <SensorChart toolCalls={tc} />
                    )}

                    {/* Raw tool call details (collapsible) */}
                    {tc && tc.length > 0 && (
                        <details className="w-full mt-4 pt-4 border-t border-border/20">
                            <summary className="cursor-pointer text-sm text-muted-foreground mb-2">details</summary>
                            {tc.map((tool, i) => (
                                <div key={i} className="bg-background/50 rounded p-3 mb-2 text-sm">
                                    <div className="font-medium text-foreground">{tool.name}</div>
                                    <div className="text-muted-foreground mt-1 text-xs">
                                        {JSON.stringify(tool.arguments, null, 2)}
                                    </div>
                                    {tool.result && (
                                        <details className="mt-2 cursor-pointer">
                                            <summary className="text-xs text-muted-foreground hover:text-foreground">View result</summary>
                                            <pre className="mt-1 text-xs overflow-x-auto bg-background/80 p-2 rounded">
                                                {JSON.stringify(tool.result, null, 2)}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            ))}
                        </details>
                    )}
                </div>

                <div className="text-xs text-muted-foreground mt-1 px-4">
                    {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : ''}
                </div>
            </div>

            {message.role === 'user' && (
                <Avatar className="w-8 h-8 mt-1">
                    <User className="w-4 h-4" />
                </Avatar>
            )}
        </div>
    )
}