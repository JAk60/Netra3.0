from typing import Dict, Any, List
from .tools import AVAILABLE_TOOLS
from .tools.base_tool import BaseTool

class ToolExecutor:
    """Handles tool registration and execution"""
    
    def __init__(self):
        self.tools: Dict[str, BaseTool] = {}
        self._register_tools()
    
    def _register_tools(self):
        """Register all available tools"""
        for tool in AVAILABLE_TOOLS:
            self.tools[tool.name] = tool
    
    def get_tool_definitions(self) -> List[Dict[str, Any]]:
        """Get all tool definitions for LLM"""
        return [tool.to_dict() for tool in self.tools.values()]
    
    async def execute_tool(self, tool_name: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a specific tool"""
        if tool_name not in self.tools:
            return {
                "success": False,
                "error": f"Unknown tool: {tool_name}. Available tools: {list(self.tools.keys())}"
            }
        
        tool = self.tools[tool_name]
        return await tool.execute(parameters)