from .reliability_tool import ReliabilityTool
from .sensor_tool import SensorReadingTool
from .rul_tool import RULCalculationTool

# Register all available tools
AVAILABLE_TOOLS = [
    ReliabilityTool(),
    SensorReadingTool(),
    RULCalculationTool()
    # Add more tools here as you create them
]