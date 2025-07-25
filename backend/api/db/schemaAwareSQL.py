import sys
sys.path.append('..')
sys.path.append('../../')
import os
import pandas as pd
import re
import time
from backend.config import settings
import sqlparse
from sqlparse.sql import IdentifierList, Identifier, Function, Token
from sqlparse.tokens import Keyword, DML
from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect
from langchain_openai import ChatOpenAI
from drishti.llm_client import LLMClient
from utils.utils import load_config
from utils.logging_config import logger

# Keep your existing initialization and database connection functions unchanged
def initialize():
    """Loads config, connects to DB, and retrieves schema/relationships."""
    global config, RBAC_RULES, RLS_RULES, SENSITIVE_COLUMNS, SQL_INJECTION_PATTERNS
    global engine, full_schema, relationships, llm_client

    try:
        logger.info("📌 Initializing maritime sensor monitoring system...")
        load_dotenv(".env", override=True)
        config = load_config()
        RBAC_RULES = config["RBAC_RULES"]
        RLS_RULES = config["RLS_RULES"]
        SQL_INJECTION_PATTERNS = config["SQL_INJECTION_PATTERNS"]
        SENSITIVE_COLUMNS = config["SENSITIVE_COLUMNS"]
        logger.debug(f"👉 Configuration Loaded: {config}")

        llm_client = LLMClient(config)
        logger.info("✅ LLM Client initialized successfully")

        engine = connect_to_database()
        logger.info("✅ Database connection established")

        full_schema, relationships = get_schema_information(engine)
        logger.info(f"✅ Schema loaded successfully. Tables: {list(full_schema.keys())}")
        logger.info(f"✅ Relationships loaded: {len(relationships)} relationships found")

        logger.info("📌 Maritime system initialization complete.")

        if full_schema is None:
            raise ValueError("full_schema is None after initialization")
        if relationships is None:
            raise ValueError("relationships is None after initialization")
        if llm_client is None:
            raise ValueError("llm_client is None after initialization")

        logger.info("✅ All global variables verified successfully")

    except Exception as e:
        logger.error(f"❌ Initialization failed: {str(e)}")
        logger.error(f"❌ Error type: {type(e).__name__}")
        import traceback
        logger.error(f"❌ Full traceback: {traceback.format_exc()}")
        raise

# Keep your existing database connection functions
def _build_connection_string() -> str:
    """Build connection string from settings"""
    return (
        f"mssql+pyodbc://{settings.db_username}:{settings.db_password}"
        f"@{settings.db_host}:{settings.db_port}/{settings.db_name}"
        f"?driver={settings.db_driver}"
        f"&TrustServerCertificate=yes"
        f"&timeout=300"
    )

def connect_to_database():
    database_url = settings.DATABASE_URL or _build_connection_string()
    if not database_url:
        logger.error("❌ DATABASE_URL is missing! Check .env file.")
        sys.exit(1)
    try:
        engine = create_engine(database_url)
        logger.info(f"✅ Database engine created with URL: {database_url}")
        return engine
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        sys.exit(1)

def get_schema_information(engine):
    """Get schema information with proper foreign key relationships"""
    inspector = inspect(engine)
    schema_info = {}
    relationships = {}
    
    for table_name in inspector.get_table_names():
        columns = inspector.get_columns(table_name)
        schema_info[table_name] = [column["name"] for column in columns]

        foreign_keys = inspector.get_foreign_keys(table_name)
        for fk in foreign_keys:
            parent_table = fk["referred_table"]
            child_table = table_name
            parent_column = fk["referred_columns"][0]
            child_column = fk["constrained_columns"][0]

            relationships[(child_table, parent_table)] = (
                f"{child_table}.{child_column}", f"{parent_table}.{parent_column}")

    return schema_info, relationships

# SIMPLIFIED AND CLEAR MARITIME DOMAIN EXAMPLES
def get_simple_maritime_examples():
    """Simplified, clear examples that the LLM can easily understand"""
    return [
        {
            "question": "List all sensors on ship INS ONE",
            "sql": """SELECT sm.sensor_id, sm.sensor_name, sm.unit, sm.min_value, sm.max_value, 
                             sc.component_name, d.department_name, s.ship_name
                      FROM ships s
                      JOIN departments d ON s.ship_id = d.ship_id
                      JOIN system_configuration sc ON d.department_id = sc.department_id
                      JOIN sensor_metadata sm ON sc.component_id = sm.component_id
                      WHERE s.ship_name = 'INS ONE'""",
            "key_points": "Join tables using ID fields, filter by ship_name (not ship_id)"
        },
        
        {
            "question": "Show all sensors on nomenclature GT 1",
            "sql": """SELECT sm.sensor_id, sm.sensor_name, sm.unit, 
                             sc.component_name, d.department_name, s.ship_name
                      FROM ships s
                      JOIN departments d ON s.ship_id = d.ship_id
                      JOIN system_configuration sc ON d.department_id = sc.department_id
                      JOIN sensor_metadata sm ON sc.component_id = sm.component_id
                      WHERE sc.nomenclature = 'GT 1'""",
            "key_points": "Filter by nomenclature (not component_id)"
        },
        
        {
            "question": "What failure modes exist for nomenclature GT 1?",
            "sql": """SELECT fm.failure_mode_id, fm.name, fm.severity, 
                             sc.nomenclature, d.department_name, s.ship_name
                      FROM ships s
                      JOIN departments d ON s.ship_id = d.ship_id
                      JOIN system_configuration sc ON d.department_id = sc.department_id
                      JOIN failure_modes fm ON sc.component_id = fm.component_id
                      WHERE sc.nomenclature = 'GT 1'""",
            "key_points": "Join failure_modes via component_id, filter by nomenclature"
        },
        {
   "question": "list eta beta on ship ins one",
   "sql": """SELECT eb.eta, eb.beta, eb.priority, sc.nomenclature
             FROM ships s
             JOIN departments d ON s.ship_id = d.ship_id
             JOIN system_configuration sc ON d.department_id = sc.department_id
             JOIN etabeta eb ON sc.component_id = eb.component_id
             WHERE s.ship_name = 'ins one'""",
   "key_points": "Join through ships->departments->system_configuration to etabeta, filter by ship name"
 },
 {
   "question": "list alpha beta on ship ins one",
   "sql": """SELECT ab.alpha, ab.beta, sc.nomenclature
             FROM ships s
             JOIN departments d ON s.ship_id = d.ship_id
             JOIN system_configuration sc ON d.department_id = sc.department_id
             JOIN alphabeta ab ON sc.component_id = ab.component_id
             WHERE s.ship_name = 'ins one'""",
   "key_points": "Join through ships->departments->system_configuration to alphabeta, filter by ship name"
 },
 {
   "question": "what is the eta value of GT 1",
   "sql": """SELECT eb.eta, sc.nomenclature
             FROM system_configuration sc
             JOIN etabeta eb ON sc.component_id = eb.component_id
             WHERE sc.nomenclature = 'GT 1'""",
   "key_points": "Join system_configuration to etabeta, filter by nomenclature to get eta value"
 },
 {
   "question": "what is the alpha value of GT 1",
   "sql": """SELECT ab.alpha, sc.nomenclature
             FROM system_configuration sc
             JOIN alphabeta ab ON sc.component_id = ab.component_id
             WHERE sc.nomenclature = 'GT 1'""",
   "key_points": "Join system_configuration to alphabeta, filter by nomenclature to get alpha value"
 }
    ]

# SIMPLIFIED SCHEMA DESCRIPTION
def build_simple_schema_description(schema_info):
    """Build a clear, simple schema description"""
    description = "DATABASE SCHEMA:\n\n"
    
    # Main tables with their purpose
    table_descriptions = {
        "ships": "Contains ship information (ship_id, ship_name)",
        "departments": "Ship departments (department_id, department_name, ship_id)",
        "system_configuration": "Components/systems (component_id, component_name, department_id)",
        "sensor_metadata": "Sensor definitions (sensor_id, sensor_name, component_id)",
        "sensor_readings": "Sensor data (sensor_id, value, date)",
        "failure_modes": "Failure definitions (failure_mode_id, name, component_id)"
    }
    
    for table, columns in schema_info.items():
        if table in table_descriptions:
            description += f"{table}: {table_descriptions[table]}\n"
            description += f"  Columns: {', '.join(columns)}\n\n"
    
    return description

# SIMPLIFIED RELATIONSHIP RULES
def get_simple_relationship_rules():
    """Simple, clear relationship rules"""
    return """
RELATIONSHIP RULES:
1. ships.ship_id → departments.ship_id
2. departments.department_id → system_configuration.department_id  
3. system_configuration.component_id → sensor_metadata.component_id
4. sensor_metadata.sensor_id → sensor_readings.sensor_id
5. system_configuration.component_id → failure_modes.component_id

CRITICAL RULES:
- Always JOIN tables using ID fields (ship_id, department_id, component_id, sensor_id)
- Always FILTER using name fields (ship_name, department_name, nomenclature, sensor_name)
- Never use name values in JOIN conditions
- Never use name values where ID values are expected
"""

# SIMPLIFIED SQL GENERATION PROMPT
def generate_simple_sql_prompt(question, schema_info, user_identity):
    """Generate a clear, simple prompt for the LLM"""
    
    schema_description = build_simple_schema_description(schema_info)
    relationship_rules = get_simple_relationship_rules()
    examples = get_simple_maritime_examples()
    
    examples_text = "\nEXAMPLES:\n"
    for i, example in enumerate(examples, 1):
        examples_text += f"\nExample {i}:\n"
        examples_text += f"Question: {example['question']}\n"
        examples_text += f"SQL: {example['sql']}\n"
        examples_text += f"Key: {example['key_points']}\n"
    
    prompt = f"""
You are a SQL query generator for a maritime sensor monitoring system.

{schema_description}

{relationship_rules}

{examples_text}

IMPORTANT RULES:
1. Only generate SELECT queries
2. Join tables using ID fields (ship_id, department_id, component_id, sensor_id)
3. Filter using name fields (ship_name, department_name, component_name, sensor_name)
4. Never use string values with ID fields in WHERE clauses
5. Always specify column names in SELECT (never use SELECT *)

EXAMPLES OF CORRECT FILTERING:
✅ WHERE ships.ship_name = 'INS ONE'
✅ WHERE system_configuration.component_name = 'GT 1'
✅ WHERE sensor_metadata.sensor_name = 'Temperature'

EXAMPLES OF INCORRECT FILTERING:
❌ WHERE ships.ship_id = 'INS ONE'
❌ WHERE system_configuration.component_id = 'GT 1'
❌ WHERE sensor_metadata.sensor_id = 'Temperature'

Question: {question}

Generate only the SQL query, no additional text:
"""
    
    return prompt

# SIMPLIFIED SQL QUERY GENERATION
def generate_sql_query(question, schema_info, relationships, user_identity, llm_client):
    """Simplified SQL query generation with clear prompts"""
    
    logger.info(f"📌 Generating SQL for: {question}")
    
    # Create simple, clear prompt
    prompt = generate_simple_sql_prompt(question, schema_info, user_identity)
    
    logger.debug(f"📌 Simple Prompt:\n{prompt}")
    
    try:
        response = llm_client.llm_client_generate_sql_query(prompt)
        logger.debug(f"📌 LLM Response: {response}")
        
        if isinstance(response, dict) and "error" in response:
            logger.error(f"📌 Error response from LLM: {response}")
            return response
        
        if isinstance(response, str):
            response = response.strip()
            if not response:
                logger.error("❌ LLM returned empty string response")
                return {"error": "Empty Response", "message": "LLM returned empty response. Please try again."}
            
            # Clean up the response - remove any markdown or extra text
            sql_query = clean_sql_response(response)
            logger.info(f"📌 Generated SQL Query: {sql_query}")
            return sql_query
        
        logger.error(f"❌ Unexpected response type from LLM: {type(response)}")
        return {"error": "Unexpected Response Type", "message": f"LLM returned unexpected response type: {type(response)}"}

    except Exception as e:
        logger.error(f"❌ Exception in generate_sql_query: {e}")
        return {"error": "SQL Generation Error", "message": f"Failed to generate SQL query: {str(e)}"}

def clean_sql_response(response):
    """Clean up SQL response from LLM"""
    # Remove markdown code blocks
    response = re.sub(r'```sql\s*', '', response)
    response = re.sub(r'```\s*', '', response)
    
    # Remove any extra explanatory text - keep only the SQL
    lines = response.split('\n')
    sql_lines = []
    
    for line in lines:
        line = line.strip()
        if line and not line.startswith('--') and not line.startswith('/*'):
            sql_lines.append(line)
    
    return ' '.join(sql_lines)

# SIMPLIFIED QUERY VALIDATION
def validate_sql_query_simple(sql_query, schema_info):
    """Simple validation to check if query looks correct"""
    
    # Check if it's a SELECT query
    if not sql_query.upper().strip().startswith('SELECT'):
        return {"error": "Invalid Query", "message": "Only SELECT queries are allowed"}
    
    # Check for common mistakes
    common_mistakes = [
        (r"ship_id\s*=\s*['\"][^'\"]*['\"]", "Don't use ship_id with string values, use ship_name"),
        (r"component_id\s*=\s*['\"][^'\"]*['\"]", "Don't use component_id with string values, use component_name"),
        (r"sensor_id\s*=\s*['\"][^'\"]*['\"]", "Don't use sensor_id with string values, use sensor_name"),
        (r"department_id\s*=\s*['\"][^'\"]*['\"]", "Don't use department_id with string values, use department_name")
    ]
    
    for pattern, message in common_mistakes:
        if re.search(pattern, sql_query, re.IGNORECASE):
            return {"error": "Query Error", "message": message}
    
    return {"status": "Valid"}

# Keep your existing security and execution functions
def query_safe_and_authorized(sql_query, user_identity):
    """Validates query security using real database schema."""
    
    # Ensure query is SELECT-only
    if not sql_query.strip().upper().startswith("SELECT"):
        return {"error": "Security Violation", "message": "🚨 Forbidden query type. Only SELECT queries are allowed."}

    # Simple validation
    validation_result = validate_sql_query_simple(sql_query, full_schema)
    if "error" in validation_result:
        return validation_result

    logger.info("✅ Query is safe and authorized!")
    return {"status": "SAFE"}

def execute_sql_query(engine, sql_query, user_identity):
    """Executes SQL query after validation"""
    
    validation_result = query_safe_and_authorized(sql_query, user_identity)
    if "error" in validation_result:
        logger.error(f"❌ SQL query failed validation: {validation_result['message']}")
        return validation_result

    try:
        logger.info("📌 Executing SQL query...")
        start_time = time.time()
        with engine.connect() as connection:
            result = pd.read_sql_query(sql_query, connection)
        execution_time = round(time.time() - start_time, 3)
        
        if result.empty:
            logger.info(f"📌 Query executed successfully in {execution_time} seconds, but no records were found.")
            return {"result": []}
        else:
            logger.info(f"📌 Query executed successfully in {execution_time} seconds. Retrieved {len(result)} records.")

        return result

    except Exception as e:
        logger.error(f"❌ SQL Execution Error: {e}")
        return {"error": "Execution Error", "message": f"Query execution failed: {str(e)}"}

def get_filtered_schema(user_role, full_schema):
    """Get filtered schema based on user role"""
    # For now, return full schema - implement RBAC as needed
    return full_schema

def get_user_identity():
    """Get user identity from environment"""
    return {
        "role": os.getenv("USER_ROLE", "Handheld"),
        "user_id": os.getenv("USER_ID"),
        "username": os.getenv("USERNAME"),
    }

# SIMPLIFIED MAIN PROCESSING FUNCTION
def process_query(question, user_identity):
    """Simplified main function to process user queries"""
    
    logger.info(f"📌 Processing query: {question}")
    
    # Check initialization
    if 'full_schema' not in globals() or full_schema is None:
        return {"error": "System Not Initialized", "message": "Database schema not loaded"}
    
    if 'llm_client' not in globals() or llm_client is None:
        return {"error": "System Not Initialized", "message": "LLM client not initialized"}

    # Get filtered schema
    try:
        schema_info = get_filtered_schema(user_identity["role"], full_schema)
        logger.debug(f"✅ Schema available for role {user_identity['role']}: {list(schema_info.keys())}")
    except Exception as e:
        logger.error(f"❌ Error filtering schema: {str(e)}")
        return {"error": "Schema Error", "message": "Failed to filter database schema"}

    # Generate SQL query
    try:
        sql_query = generate_sql_query(question, schema_info, relationships, user_identity, llm_client)
        if isinstance(sql_query, dict) and "error" in sql_query:
            return sql_query
    except Exception as e:
        logger.error(f"❌ Error generating SQL: {str(e)}")
        return {"error": "SQL Generation Error", "message": "Failed to generate SQL query"}

    # Execute query
    try:
        result = execute_sql_query(engine, sql_query, user_identity)
        
        if isinstance(result, dict) and "error" in result:
            return result

        return {
            "user": user_identity,
            "question": question,
            "generated_sql": sql_query,
            "records_retrieved": len(result) if isinstance(result, pd.DataFrame) else 0,
            "result": result.to_dict(orient="records") if isinstance(result, pd.DataFrame) and not result.empty else [],
        }
    except Exception as e:
        logger.error(f"❌ Query execution failed: {e}")
        return {"error": "Execution Error", "message": str(e)}

# TESTING FUNCTION
def test_simple_query():
    """Test function to verify the simplified approach works"""
    
    # Sample user identity
    user_identity = {
        "role": "Handheld",
        "user_id": "123",
        "username": "test_user"
    }
    
    # Test query
    test_question = "List all sensors on ship INS ONE"
    
    logger.info(f"🧪 Testing query: {test_question}")
    
    try:
        result = process_query(test_question, user_identity)
        logger.info(f"✅ Test result: {result}")
        return result
    except Exception as e:
        logger.error(f"❌ Test failed: {e}")
        return {"error": "Test Failed", "message": str(e)}

if __name__ == "__main__":
    # Initialize and test
    try:
        initialize()
        test_result = test_simple_query()
        print("Test Result:", test_result)
    except Exception as e:
        print(f"Failed to initialize or test: {e}")