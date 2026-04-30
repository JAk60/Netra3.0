from utils.nlpLayer.general.sql_generator import SQLGenerator
from utils.nlpLayer.sql_pattern_memory import SQLPatternMemory

from .rcm_tool import RCMTool
from .reliability_tool import ReliabilityTool
from .sensor_tool import SensorReadingTool
from .rul_tool import RULCalculationTool
from .sql_tool import SQLTool

# Module-level — None until build_available_tools() is called at startup
SQL_MEMORY: SQLPatternMemory | None = None
_sql_tool: SQLTool | None = None


def get_sql_memory() -> SQLPatternMemory:
    if SQL_MEMORY is None:
        raise RuntimeError(
            "SQL_MEMORY is None — build_available_tools() was not called during lifespan startup."
        )
    return SQL_MEMORY


def get_sql_tool() -> SQLTool:
    if _sql_tool is None:
        raise RuntimeError(
            "_sql_tool is None — build_available_tools() was not called during lifespan startup."
        )
    return _sql_tool


def build_available_tools(llm_service, embedding_model) -> list:
    global SQL_MEMORY, _sql_tool
    SQL_MEMORY = SQLPatternMemory(embedding_model=embedding_model)
    generator  = SQLGenerator(llm_service)
    _sql_tool  = SQLTool(SQL_MEMORY, generator)

    return [
        ReliabilityTool(),
        SensorReadingTool(),
        RULCalculationTool(),
        RCMTool(),
        _sql_tool,
    ]