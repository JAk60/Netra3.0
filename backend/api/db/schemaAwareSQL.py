import sys
sys.path.append('..')
sys.path.append('../../')
import os
import pandas as pd
import re
import time
from backend.config import settings
from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect
from drishti.llm_client import LLMClient
from utils.utils import load_config
from utils.logging_config import logger

# Keep your existing initialization and database connection functions unchanged
def initialize():
    """Loads config, connects to DB, and retrieves schema/relationships."""
    global config, RBAC_RULES, RLS_RULES, SENSITIVE_COLUMNS, SQL_INJECTION_PATTERNS
    global engine, full_schema, relationships, llm_client

    try:
        # logger.info("📌 Initializing maritime sensor monitoring system...")
        load_dotenv(".env", override=True)
        config = load_config()
        RBAC_RULES = config["RBAC_RULES"]
        RLS_RULES = config["RLS_RULES"]
        SQL_INJECTION_PATTERNS = config["SQL_INJECTION_PATTERNS"]
        SENSITIVE_COLUMNS = config["SENSITIVE_COLUMNS"]
        # logger.debug(f"👉 Configuration Loaded: {config}")

        llm_client = LLMClient(config)
        # logger.info("✅ LLM Client initialized successfully")

        engine = connect_to_database()
        # logger.info("✅ Database connection established")

        full_schema, relationships = get_schema_information(engine)
        # logger.info(f"✅ Schema loaded successfully. Tables: {list(full_schema.keys())}")
        # logger.info(f"✅ Relationships loaded: {len(relationships)} relationships found")

        # DEBUG: Print relationships to verify they're correct
        logger.debug("🔍 Relationship Details:")
        for key, value in relationships.items():
            logger.debug(f"  {key} -> {value}")

        # logger.info("📌 Maritime system initialization complete.")

        if full_schema is None:
            raise ValueError("full_schema is None after initialization")
        if relationships is None:
            raise ValueError("relationships is None after initialization")
        if llm_client is None:
            raise ValueError("llm_client is None after initialization")

        # logger.info("✅ All global variables verified successfully")

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
    """Get schema information with proper foreign key relationships - FIXED VERSION"""
    inspector = inspect(engine)
    schema_info = {}
    relationships = {}
    
    # Get all table names first
    table_names = inspector.get_table_names()
    logger.info(f"🔍 Found tables: {table_names}")
    
    # Get columns for each table
    for table_name in table_names:
        try:
            columns = inspector.get_columns(table_name)
            schema_info[table_name] = [column["name"] for column in columns]
            logger.debug(f"📊 Table {table_name} columns: {schema_info[table_name]}")
        except Exception as e:
            logger.error(f"❌ Error getting columns for table {table_name}: {e}")
            continue

    # Get foreign key relationships
    for table_name in table_names:
        try:
            foreign_keys = inspector.get_foreign_keys(table_name)
            logger.debug(f"🔗 Foreign keys for {table_name}: {foreign_keys}")
            
            for fk in foreign_keys:
                parent_table = fk["referred_table"]
                child_table = table_name
                
                # Handle multiple columns in foreign key
                if fk["referred_columns"] and fk["constrained_columns"]:
                    parent_column = fk["referred_columns"][0]
                    child_column = fk["constrained_columns"][0]

                    # Store relationship in both directions for flexibility
                    relationships[(child_table, parent_table)] = (
                        f"{child_table}.{child_column}", f"{parent_table}.{parent_column}")
                    
                    logger.debug(f"🔗 Added relationship: {child_table}.{child_column} -> {parent_table}.{parent_column}")
                    
        except Exception as e:
            logger.error(f"❌ Error getting foreign keys for table {table_name}: {e}")
            continue

    logger.info(f"✅ Schema loading complete. Found {len(schema_info)} tables and {len(relationships)} relationships")
    return schema_info, relationships

# IMPROVED MARITIME DOMAIN EXAMPLES WITH BETTER ERROR HANDLING
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
                      WHERE UPPER(s.ship_name) = UPPER('INS ONE')""",
            "key_points": "Join tables using ID fields, filter by ship_name with case-insensitive comparison"
        },
        
        {
            "question": "Show all sensors on nomenclature GT 1",
            "sql": """SELECT sm.sensor_id, sm.sensor_name, sm.unit, 
                             sc.component_name, sc.nomenclature, d.department_name, s.ship_name
                      FROM ships s
                      JOIN departments d ON s.ship_id = d.ship_id
                      JOIN system_configuration sc ON d.department_id = sc.department_id
                      JOIN sensor_metadata sm ON sc.component_id = sm.component_id
                      WHERE UPPER(sc.nomenclature) = UPPER('GT 1')""",
            "key_points": "Filter by nomenclature with case-insensitive comparison"
        },
        
        {
            "question": "What failure modes exist for nomenclature GT 1?",
            "sql": """SELECT fm.failure_mode_id, fm.name, fm.severity, 
                             sc.nomenclature, sc.component_name, d.department_name, s.ship_name
                      FROM ships s
                      JOIN departments d ON s.ship_id = d.ship_id
                      JOIN system_configuration sc ON d.department_id = sc.department_id
                      JOIN failure_modes fm ON sc.component_id = fm.component_id
                      WHERE UPPER(sc.nomenclature) = UPPER('GT 1')""",
            "key_points": "Join failure_modes via component_id, filter by nomenclature"
        },
        {
            "question": "list eta beta on ship ins one",
            "sql": """SELECT eb.eta, eb.beta, eb.priority, sc.nomenclature, sc.component_name
                      FROM ships s
                      JOIN departments d ON s.ship_id = d.ship_id
                      JOIN system_configuration sc ON d.department_id = sc.department_id
                      JOIN etabeta eb ON sc.component_id = eb.component_id
                      WHERE UPPER(s.ship_name) = UPPER('ins one')""",
            "key_points": "Join through ships->departments->system_configuration to etabeta, case-insensitive filter"
        },
        {
            "question": "list alpha beta on ship ins one",
            "sql": """SELECT ab.alpha, ab.beta, sc.nomenclature, sc.component_name
                      FROM ships s
                      JOIN departments d ON s.ship_id = d.ship_id
                      JOIN system_configuration sc ON d.department_id = sc.department_id
                      JOIN alphabeta ab ON sc.component_id = ab.component_id
                      WHERE UPPER(s.ship_name) = UPPER('ins one')""",
            "key_points": "Join through ships->departments->system_configuration to alphabeta, case-insensitive filter"
        },
        {
            "question": "what is the eta value of GT 1",
            "sql": """SELECT eb.eta, sc.nomenclature, sc.component_name
                      FROM system_configuration sc
                      JOIN etabeta eb ON sc.component_id = eb.component_id
                      WHERE UPPER(sc.nomenclature) = UPPER('GT 1')""",
            "key_points": "Join system_configuration to etabeta, filter by nomenclature case-insensitive"
        },
        {
            "question": "what is the alpha value of GT 1",
            "sql": """SELECT ab.alpha, sc.nomenclature, sc.component_name
                      FROM system_configuration sc
                      JOIN alphabeta ab ON sc.component_id = ab.component_id
                      WHERE UPPER(sc.nomenclature) = UPPER('GT 1')""",
            "key_points": "Join system_configuration to alphabeta, filter by nomenclature case-insensitive. DO NOT reference ship tables if not needed."
        },
        {
            "question": "what is the alpha value of GT 1 on INS ONE",
            "sql": """SELECT ab.alpha, sc.nomenclature, sc.component_name, s.ship_name
                      FROM ships s
                      JOIN departments d ON s.ship_id = d.ship_id
                      JOIN system_configuration sc ON d.department_id = sc.department_id
                      JOIN alphabeta ab ON sc.component_id = ab.component_id
                      WHERE UPPER(sc.nomenclature) = UPPER('GT 1') AND UPPER(s.ship_name) = UPPER('INS ONE')""",
            "key_points": "When BOTH ship and component mentioned, include full join chain. Every table alias in WHERE must exist in FROM/JOIN."
        }
    ]

# IMPROVED SCHEMA DESCRIPTION WITH ACTUAL TABLE VERIFICATION
def build_simple_schema_description(schema_info):
    """Build a clear, simple schema description with actual table verification"""
    description = "DATABASE SCHEMA:\n\n"
    
    # Define expected table descriptions, but only include tables that actually exist
    table_descriptions = {
        "ships": "Contains ship information (ship_id, ship_name)",
        "departments": "Ship departments (department_id, department_name, ship_id)",
        "system_configuration": "Components/systems (component_id, component_name, nomenclature, department_id)",
        "sensor_metadata": "Sensor definitions (sensor_id, sensor_name, component_id)",
        "sensor_readings": "Sensor data (sensor_id, value, date)",
        "failure_modes": "Failure definitions (failure_mode_id, name, component_id)",
        "alphabeta": "Alpha beta values (alpha, beta, component_id)",
        "etabeta": "Eta beta values (eta, beta, priority, component_id)"
    }
    
    # Only include tables that actually exist in the schema
    for table, columns in schema_info.items():
        description += f"{table}: "
        if table in table_descriptions:
            description += table_descriptions[table]
        else:
            description += "Custom table"
        description += f"\n  Columns: {', '.join(columns)}\n\n"
    
    return description

# IMPROVED RELATIONSHIP RULES WITH VERIFICATION
def get_simple_relationship_rules():
    """Simple, clear relationship rules with better explanation"""
    return """
RELATIONSHIP RULES (CRITICAL - FOLLOW EXACTLY):
1. ships.ship_id = departments.ship_id
2. departments.department_id = system_configuration.department_id  
3. system_configuration.component_id = sensor_metadata.component_id
4. sensor_metadata.sensor_id = sensor_readings.sensor_id
5. system_configuration.component_id = failure_modes.component_id
6. system_configuration.component_id = alphabeta.component_id
7. system_configuration.component_id = etabeta.component_id

JOINING RULES:
- Use = for JOIN conditions (never LIKE)
- Use exact column names from schema
- Always use table aliases (s, d, sc, sm, etc.)

FILTERING RULES:
- Use UPPER() for case-insensitive string comparisons
- Filter by name fields: ship_name, department_name, nomenclature, sensor_name
- Never filter by ID fields with string values

CORRECT JOIN SYNTAX:
JOIN departments d ON s.ship_id = d.ship_id
JOIN system_configuration sc ON d.department_id = sc.department_id

CORRECT FILTERING:
WHERE UPPER(s.ship_name) = UPPER('INS ONE')
WHERE UPPER(sc.nomenclature) = UPPER('GT 1')
"""

# IMPROVED SQL GENERATION PROMPT WITH BETTER VALIDATION
def generate_simple_sql_prompt(question, schema_info, user_identity):
    """Generate a clear, simple prompt for the LLM with validation"""
    
    # Verify schema has necessary tables
    required_tables = ['ships', 'departments', 'system_configuration']
    missing_tables = [table for table in required_tables if table not in schema_info]
    
    if missing_tables:
        logger.warning(f"⚠️ Missing required tables: {missing_tables}")
    
    schema_description = build_simple_schema_description(schema_info)
    relationship_rules = get_simple_relationship_rules()
    examples = get_simple_maritime_examples()
    
    examples_text = "\nEXAMPLES (FOLLOW THESE PATTERNS EXACTLY):\n"
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

CRITICAL REQUIREMENTS:
1. Only generate SELECT queries
2. Use proper JOIN syntax with = operator (never LIKE in JOINs)
3. Always use table aliases (s for ships, d for departments, sc for system_configuration, etc.)
4. Use UPPER() function for case-insensitive string comparisons in WHERE clauses
5. Never use string values with ID fields
6. Always include relevant columns in SELECT statement

MOST IMPORTANT RULE - TABLE CONSISTENCY:
⚠️ EVERY table referenced in WHERE clause MUST be included in FROM/JOIN clauses
⚠️ If you filter by s.ship_name, you MUST include "FROM ships s" or "JOIN ships s"
⚠️ If you filter by d.department_name, you MUST include "JOIN departments d"
⚠️ Never reference a table alias that doesn't exist in your FROM/JOIN clauses

COMMON MISTAKES TO AVOID:
❌ WHERE s.ship_name = 'INS ONE' without including ships table in FROM/JOIN
❌ WHERE d.department_name = 'Engine' without including departments table in FROM/JOIN
❌ JOIN departments d ON s.ship_name LIKE d.ship_name (WRONG - use IDs for JOINs)
❌ WHERE s.ship_id = 'INS ONE' (WRONG - use ship_name for filtering)
❌ WHERE sc.component_id = 'GT 1' (WRONG - use nomenclature for filtering)

CORRECT PATTERNS:
✅ FROM ships s JOIN departments d ON s.ship_id = d.ship_id
✅ WHERE UPPER(s.ship_name) = UPPER('INS ONE')
✅ WHERE UPPER(sc.nomenclature) = UPPER('GT 1')

QUERY ANALYSIS CHECKLIST:
1. Does the question mention a ship name? → Include ships table and full join chain
2. Does the question mention only component/nomenclature? → Start from system_configuration
3. Does the question mention department? → Include departments table
4. Check: Every table alias in WHERE clause exists in FROM/JOIN clauses

Question: {question}

Generate ONLY the SQL query (no explanations, no markdown, no extra text):
"""
    
    return prompt

# IMPROVED SQL QUERY GENERATION WITH BETTER ERROR HANDLING
def generate_sql_query(question, schema_info, relationships, user_identity, llm_client):
    """Improved SQL query generation with better validation"""
    
    logger.info(f"📌 Generating SQL for: {question}")
    
    # Validate inputs
    if not schema_info:
        return {"error": "Schema Error", "message": "Schema information is empty"}
    
    if not llm_client:
        return {"error": "LLM Error", "message": "LLM client is not available"}
    
    # Create simple, clear prompt
    prompt = generate_simple_sql_prompt(question, schema_info, user_identity)
    
    logger.debug(f"📌 Generated Prompt Length: {len(prompt)} characters")
    
    try:
        response = llm_client.llm_client_generate_sql_query(prompt)
        logger.debug(f"📌 LLM Raw Response: {response}")
        
        if isinstance(response, dict) and "error" in response:
            logger.error(f"📌 Error response from LLM: {response}")
            return response
        
        if isinstance(response, str):
            response = response.strip()
            if not response:
                logger.error("❌ LLM returned empty string response")
                return {"error": "Empty Response", "message": "LLM returned empty response. Please try again."}
            
            # Clean up the response
            sql_query = clean_sql_response(response)
            
            # Validate the generated query
            validation_result = validate_sql_query_advanced(sql_query, schema_info)
            if "error" in validation_result:
                logger.error(f"❌ Generated query failed validation: {validation_result['message']}")
                return validation_result
            
            logger.info(f"📌 Generated Valid SQL Query: {sql_query}")
            return sql_query
        
        logger.error(f"❌ Unexpected response type from LLM: {type(response)}")
        return {"error": "Unexpected Response Type", "message": f"LLM returned unexpected response type: {type(response)}"}

    except Exception as e:
        logger.error(f"❌ Exception in generate_sql_query: {e}")
        import traceback
        logger.error(f"❌ Full traceback: {traceback.format_exc()}")
        return {"error": "SQL Generation Error", "message": f"Failed to generate SQL query: {str(e)}"}

def clean_sql_response(response):
    """Improved SQL response cleaning"""
    # Remove markdown code blocks
    response = re.sub(r'```sql\s*', '', response, flags=re.IGNORECASE)
    response = re.sub(r'```\s*', '', response)
    
    # Remove common LLM response prefixes
    response = re.sub(r'^(Here\'s the SQL query:|SQL Query:|Query:)\s*', '', response, flags=re.IGNORECASE)
    
    # Split into lines and clean
    lines = response.split('\n')
    sql_lines = []
    
    for line in lines:
        line = line.strip()
        # Skip comments and empty lines
        if line and not line.startswith('--') and not line.startswith('/*') and not line.startswith('*'):
            sql_lines.append(line)
    
    # Join lines and clean up extra spaces
    cleaned_sql = ' '.join(sql_lines)
    cleaned_sql = re.sub(r'\s+', ' ', cleaned_sql)
    
    return cleaned_sql.strip()

# ADVANCED QUERY VALIDATION WITH TABLE REFERENCE CHECKING
def validate_sql_query_advanced(sql_query, schema_info):
    """Advanced validation to catch common JOIN problems and table reference issues"""
    
    # Check if it's a SELECT query
    if not sql_query.upper().strip().startswith('SELECT'):
        return {"error": "Invalid Query", "message": "Only SELECT queries are allowed"}
    
    # Check for missing FROM clause
    if 'FROM' not in sql_query.upper():
        return {"error": "Query Error", "message": "Query missing FROM clause"}
    
    # Extract table aliases from FROM and JOIN clauses
    from_join_aliases = set()
    
    # Find all FROM and JOIN patterns
    from_pattern = r'FROM\s+(\w+)\s+(\w+)'
    join_pattern = r'JOIN\s+(\w+)\s+(\w+)'
    
    from_matches = re.findall(from_pattern, sql_query, re.IGNORECASE)
    join_matches = re.findall(join_pattern, sql_query, re.IGNORECASE)
    
    # Collect all table aliases
    for table, alias in from_matches + join_matches:
        from_join_aliases.add(alias)
    
    logger.debug(f"🔍 Table aliases in FROM/JOIN: {from_join_aliases}")
    
    # Find all table references in WHERE clause
    where_pattern = r'WHERE.*'
    where_match = re.search(where_pattern, sql_query, re.IGNORECASE | re.DOTALL)
    
    if where_match:
        where_clause = where_match.group(0)
        # Find all table.column references
        table_refs = re.findall(r'(\w+)\.\w+', where_clause)
        where_aliases = set(table_refs)
        
        logger.debug(f"🔍 Table aliases in WHERE: {where_aliases}")
        
        # Check if all WHERE table references exist in FROM/JOIN
        missing_aliases = where_aliases - from_join_aliases
        if missing_aliases:
            return {
                "error": "Table Reference Error", 
                "message": f"Tables referenced in WHERE clause but not in FROM/JOIN: {', '.join(missing_aliases)}. You must include these tables in your FROM or JOIN clauses."
            }
    
    # Check for common JOIN mistakes
    join_mistakes = [
        (r"JOIN\s+\w+\s+\w+\s+ON\s+\w+\.\w+\s+LIKE\s+\w+\.\w+", "Don't use LIKE in JOIN conditions, use = operator"),
        (r"ship_id\s*=\s*['\"][^'\"]*['\"]", "Don't use ship_id with string values, use ship_name"),
        (r"component_id\s*=\s*['\"][^'\"]*['\"]", "Don't use component_id with string values, use nomenclature or component_name"),
        (r"sensor_id\s*=\s*['\"][^'\"]*['\"]", "Don't use sensor_id with string values, use sensor_name"),
        (r"department_id\s*=\s*['\"][^'\"]*['\"]", "Don't use department_id with string values, use department_name")
    ]
    
    for pattern, message in join_mistakes:
        if re.search(pattern, sql_query, re.IGNORECASE):
            return {"error": "Query Error", "message": message}
    
    logger.info("✅ Query passed advanced validation")
    return {"status": "Valid"}

# Keep your existing security and execution functions with improvements
def query_safe_and_authorized(sql_query, user_identity):
    """Validates query security using real database schema."""
    
    # Ensure query is SELECT-only
    if not sql_query.strip().upper().startswith("SELECT"):
        return {"error": "Security Violation", "message": "🚨 Forbidden query type. Only SELECT queries are allowed."}

    # Advanced validation
    validation_result = validate_sql_query_advanced(sql_query, full_schema)
    if "error" in validation_result:
        return validation_result

    logger.info("✅ Query is safe and authorized!")
    return {"status": "SAFE"}

def execute_sql_query(engine, sql_query, user_identity):
    """Executes SQL query after validation with better error handling"""
    
    validation_result = query_safe_and_authorized(sql_query, user_identity)
    if "error" in validation_result:
        logger.error(f"❌ SQL query failed validation: {validation_result['message']}")
        return validation_result

    try:
        logger.info(f"📌 Executing SQL query: {sql_query}")
        start_time = time.time()
        
        with engine.connect() as connection:
            result = pd.read_sql_query(sql_query, connection)
            
        execution_time = round(time.time() - start_time, 3)
        
        if result.empty:
            logger.info(f"📌 Query executed successfully in {execution_time} seconds, but no records were found.")
            return {"result": [], "message": "Query executed successfully but returned no results"}
        else:
            logger.info(f"📌 Query executed successfully in {execution_time} seconds. Retrieved {len(result)} records.")

        return result

    except Exception as e:
        logger.error(f"❌ SQL Execution Error: {e}")
        error_message = str(e)
        
        # Provide more specific error messages for common issues
        if "could not be bound" in error_message:
            return {"error": "Column Reference Error", "message": f"Column reference error - check table aliases and column names: {error_message}"}
        elif "Invalid object name" in error_message:
            return {"error": "Table Not Found", "message": f"Table not found in database: {error_message}"}
        elif "Invalid column name" in error_message:
            return {"error": "Column Not Found", "message": f"Column not found in table: {error_message}"}
        else:
            return {"error": "Execution Error", "message": f"Query execution failed: {error_message}"}

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

# IMPROVED MAIN PROCESSING FUNCTION
def process_query(question, user_identity):
    """Improved main function to process user queries with better error handling"""
    
    logger.info(f"📌 Processing query: {question}")
    
    # Check initialization
    if 'full_schema' not in globals() or full_schema is None:
        return {"error": "System Not Initialized", "message": "Database schema not loaded. Please reinitialize the system."}
    
    if 'llm_client' not in globals() or llm_client is None:
        return {"error": "System Not Initialized", "message": "LLM client not initialized. Please reinitialize the system."}

    if 'relationships' not in globals() or relationships is None:
        return {"error": "System Not Initialized", "message": "Database relationships not loaded. Please reinitialize the system."}

    # Get filtered schema
    try:
        schema_info = get_filtered_schema(user_identity["role"], full_schema)
        logger.debug(f"✅ Schema available for role {user_identity['role']}: {list(schema_info.keys())}")
        
        if not schema_info:
            return {"error": "Schema Error", "message": "No schema information available for your role"}
            
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
        import traceback
        logger.error(f"❌ Full traceback: {traceback.format_exc()}")
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
            "execution_status": "success"
        }
    except Exception as e:
        logger.error(f"❌ Query execution failed: {e}")
        import traceback
        logger.error(f"❌ Full traceback: {traceback.format_exc()}")
        return {"error": "Execution Error", "message": str(e)}

