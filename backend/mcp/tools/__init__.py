from .rcm_tool import RCMTool
from .reliability_tool import ReliabilityTool
from .sensor_tool import SensorReadingTool
from .rul_tool import RULCalculationTool

# Register all available tools
AVAILABLE_TOOLS = [
    ReliabilityTool(),
    SensorReadingTool(),
    RULCalculationTool(),
    RCMTool(),
    # Add more tools here as you create them
]