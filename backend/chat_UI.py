import streamlit as st
import requests
import pandas as pd
from utils.logging_config import logger
import json
from pyvis.network import Network
import tempfile
import os
import re
import asyncio
import aiohttp
from typing import Dict, List, Optional

API_URL_ASK = "http://127.0.0.1:8000/ask"   # endpoint for direct SQL execution
API_URL_CHAT = "http://127.0.0.1:8000/chat"  # endpoint for AI-driven SQL chat
API_URL_DRISHTI = "http://127.0.0.1:8000/components/hierarchy"  # endpoint for visualization data
API_URL_RELIABILITY = "http://127.0.0.1:8000/reliability"  # endpoint for reliability data

# Set Page Title and Description
st.set_page_config(page_title="Schema-Aware AI SQL Agent", page_icon="💬", layout="wide")

# Title and Description
st.title("💬 Schema-Aware AI SQL Agent")
st.subheader("Ask natural language questions and get AI-powered answers")
st.markdown("---")

# Initialize session state variables - FIXED: Only initialize once
if "query_mode" not in st.session_state:
    st.session_state.query_mode = "API"
if "visualization_mode" not in st.session_state:
    st.session_state.visualization_mode = False
if "processed_request" not in st.session_state:
    st.session_state.processed_request = False

# User selects query mode
query_mode = st.radio(
    "## Choose Mode:", 
    ["Use API Point", "Use AI Agent", "Drishti (Visualization)"],
    index=0 if st.session_state.query_mode == "API" else (1 if st.session_state.query_mode == "Chat" else 2),
    horizontal=True,
    key="mode_selector"  # FIXED: Added unique key
)

# Update session state based on mode selection - FIXED: Avoid unnecessary updates
if query_mode == "Drishti (Visualization)":
    if not st.session_state.visualization_mode:
        st.session_state.visualization_mode = True
        st.session_state.processed_request = False
else:
    if st.session_state.visualization_mode:
        st.session_state.visualization_mode = False
        st.session_state.processed_request = False
    
    new_mode = "API" if query_mode == "Use API Point" else "Chat"
    if st.session_state.query_mode != new_mode:
        st.session_state.query_mode = new_mode
        st.session_state.processed_request = False

st.markdown(f"***✅ Selected Mode: `{query_mode}`***")

def parse_drishti_variables(user_input):
    """
    Parse @VARIABLE=VALUE format from user input
    Returns a dictionary with extracted variables
    """
    variables = {}
    
    # Pattern to match @VARIABLE=VALUE (allowing spaces around equals and in values)
    pattern = r'@(\w+)\s*=\s*([^@]+?)(?=\s*@|\s*$)'
    matches = re.findall(pattern, user_input, re.IGNORECASE)
    
    for var_name, var_value in matches:
        variables[var_name.upper()] = var_value.strip()
    
    return variables

def get_reliability_color(reliability: float) -> str:
    """Get color based on reliability percentage"""
    if reliability >= 90:
        return "#4CAF50"  # Green
    elif reliability >= 70:
        return "#FFC107"  # Yellow
    elif reliability >= 50:
        return "#FF9800"  # Orange
    else:
        return "#F44336"  # Red

def get_reliability_border_color(reliability: float) -> str:
    """Get border color based on reliability percentage"""
    if reliability >= 90:
        return "#2E7D32"  # Dark Green
    elif reliability >= 70:
        return "#F57C00"  # Dark Yellow
    elif reliability >= 50:
        return "#E65100"  # Dark Orange
    else:
        return "#C62828"  # Dark Red

@st.cache_data  # FIXED: Added caching to prevent repeated API calls
def fetch_reliability_data_cached(component_ids: List[str], duration_hours: float = 8760) -> Dict[str, float]:
    """
    Fetch reliability data for multiple components with caching
    """
    return asyncio.run(fetch_reliability_data(component_ids, duration_hours))

async def fetch_reliability_data(component_ids: List[str], duration_hours: float = 8760) -> Dict[str, float]:
    """
    Fetch reliability data for multiple components asynchronously
    """
    reliability_data = {}
    
    try:
        async with aiohttp.ClientSession() as session:
            tasks = []
            for component_id in component_ids:
                task = fetch_single_reliability(session, component_id, duration_hours)
                tasks.append(task)
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for component_id, result in zip(component_ids, results):
                if isinstance(result, Exception):
                    logger.warning(f"Failed to fetch reliability for {component_id}: {result}")
                    reliability_data[component_id] = None
                else:
                    reliability_data[component_id] = result
    except Exception as e:
        logger.error(f"Error in fetch_reliability_data: {e}")
        # Return empty dict to prevent crashes
        reliability_data = {cid: None for cid in component_ids}
    
    return reliability_data

async def fetch_single_reliability(session: aiohttp.ClientSession, component_id: str, duration_hours: float) -> Optional[float]:
    """
    Fetch reliability data for a single component
    """
    try:
        url = f"{API_URL_RELIABILITY}/{component_id}"
        params = {"duration": duration_hours}
        
        async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=10)) as response:
            if response.status == 200:
                reliability = await response.json()
                return reliability * 100  # Convert to percentage
            else:
                logger.debug(f"Reliability not found for component {component_id}: {response.status}")
                return None
    except Exception as e:
        logger.warning(f"Error fetching reliability for {component_id}: {e}")
        return None

def collect_component_ids(node_data: dict) -> List[str]:
    """
    Recursively collect all component IDs from the hierarchy
    """
    if not isinstance(node_data, dict):
        return []
    
    component_ids = []
    if "component_id" in node_data:
        component_ids.append(node_data["component_id"])
    
    for child in node_data.get("children", []):
        component_ids.extend(collect_component_ids(child))
    
    return component_ids

def add_nodes_edges_with_reliability(net, node_data, reliability_data: Dict[str, float], parent_id=None, duration_hours=8760):
    """
    Recursively add nodes and edges to the network with reliability information
    """
    if not isinstance(node_data, dict):
        return
    
    node_id = node_data.get("component_id", "unknown")
    component_name = node_data.get("component_name", "Unknown")
    nomenclature = node_data.get("nomenclature", "N/A")
    
    # Get reliability data for this component
    reliability = reliability_data.get(node_id)
    
    # Convert hours to readable format for tooltip
    if duration_hours >= 8760:
        duration_display = f"{duration_hours/8760:.1f} years"
    elif duration_hours >= 720:
        duration_display = f"{duration_hours/720:.1f} months"
    elif duration_hours >= 24:
        duration_display = f"{duration_hours/24:.1f} days"
    else:
        duration_display = f"{int(duration_hours)} hours"
    
    # Create enhanced tooltip with reliability information
    if reliability is not None:
        tooltip = f"""
        <div style="font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4;">
            <strong>{component_name}</strong><br>
            <strong>Nomenclature:</strong> {nomenclature}<br>
            <strong>Component ID:</strong> {node_id}<br>
            <hr style="margin: 5px 0;">
            <strong>🎯 Reliability ({duration_display}):</strong> <span style="color: {get_reliability_color(reliability)}; font-weight: bold;">{reliability:.1f}%</span><br>
            <strong>Status:</strong> {'✅ Excellent' if reliability >= 90 else '⚠️ Good' if reliability >= 70 else '🔶 Fair' if reliability >= 50 else '🔴 Poor'}
        </div>
        """
        
        # Set node color based on reliability
        node_color = get_reliability_color(reliability)
        border_color = get_reliability_border_color(reliability)
        label = f"{component_name}\n📊 {reliability:.1f}%"
        
    else:
        tooltip = f"""
        <div style="font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4;">
            <strong>{component_name}</strong><br>
            <strong>Nomenclature:</strong> {nomenclature}<br>
            <strong>Component ID:</strong> {node_id}<br>
            <hr style="margin: 5px 0;">
            <strong>🎯 Reliability:</strong> <span style="color: #9E9E9E;">No data available</span>
        </div>
        """
        
        # Default colors for nodes without reliability data
        node_color = "#E8F4FD"
        border_color = "#4A90E2"
        label = f"{component_name}\n📊 N/A"
    
    # Add node with enhanced styling
    net.add_node(
        node_id, 
        label=label,
        title=tooltip,
        color={
            "background": node_color,
            "border": border_color,
            "highlight": {"background": node_color, "border": border_color}
        },
        font={"size": 12, "color": "#333333"},
        shape="box",
        margin=10,
        borderWidth=2
    )
    
    # Add edge to parent if exists
    if parent_id:
        net.add_edge(parent_id, node_id, color={"color": "#848484"})
    
    # Recursively add children
    for child in node_data.get("children", []):
        add_nodes_edges_with_reliability(net, child, reliability_data, node_id, duration_hours)

def create_network_visualization_with_reliability(data, reliability_data: Dict[str, float], duration_hours: float = 8760):
    """
    Create and display the network visualization with reliability information
    """
    try:
        # Create a Pyvis network
        net = Network(height="750px", directed=True, bgcolor="#ffffff")
        
        # Enhanced network options
        net.set_options("""
        var options = {
          "physics": {
            "enabled": true,
            "stabilization": {"iterations": 100},
            "barnesHut": {
              "gravitationalConstant": -8000,
              "centralGravity": 0.3,
              "springLength": 95,
              "springConstant": 0.04,
              "damping": 0.09
            }
          },
          "nodes": {
            "font": {"size": 14, "face": "Arial"},
            "shape": "box",
            "margin": 10,
            "borderWidth": 2,
            "shadow": true
          },
          "edges": {
            "color": {"color": "#848484"},
            "arrows": {"to": {"enabled": true, "scaleFactor": 1.2}},
            "smooth": {"type": "cubicBezier", "forceDirection": "vertical"}
          },
          "interaction": {
            "hover": true,
            "tooltipDelay": 200
          }
        }
        """)
        
        # Add nodes and edges with reliability data
        add_nodes_edges_with_reliability(net, data, reliability_data, duration_hours=duration_hours)
        
        # Save to a temporary file and display it
        with tempfile.NamedTemporaryFile(delete=False, suffix=".html", mode='w') as temp_file:
            net.save_graph(temp_file.name)
            temp_file_path = temp_file.name
        
        # Display the HTML file in Streamlit
        try:
            with open(temp_file_path, 'r', encoding='utf-8') as f:
                html_content = f.read()
            
            # Add custom CSS to enhance the tooltip styling
            enhanced_html = html_content.replace(
                '<head>',
                '''<head>
                <style>
                .vis-tooltip {
                    max-width: 300px !important;
                    font-family: Arial, sans-serif !important;
                    background: white !important;
                    border: 1px solid #ccc !important;
                    border-radius: 5px !important;
                    padding: 10px !important;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
                }
                </style>'''
            )
            
            st.components.v1.html(enhanced_html, height=750)
            
        finally:
            # Clean up temporary file
            try:
                os.unlink(temp_file_path)
            except:
                pass
                
    except Exception as e:
        st.error(f"Error creating visualization: {str(e)}")
        logger.error(f"Visualization error: {str(e)}")

# MAIN APPLICATION LOGIC
if st.session_state.visualization_mode:
    st.markdown("## 🎯 Drishti Visualization Mode")
    st.markdown("Enter your command using the format: `@SHIP_NAME=your_ship_name @NOMENCLATURE=your_nomenclature`")
    
    # Show usage examples prominently
    with st.expander("💡 Usage Examples & Instructions", expanded=True):
        st.markdown("**Input Format:**")
        st.code("@SHIP_NAME=Enterprise @NOMENCLATURE=NCC-1701 @DURATION=8760", language="text")
        st.code("@SHIP_NAME=Millennium Falcon @NOMENCLATURE=YT-1300 @DURATION=4380", language="text")
        st.code("@SHIP_NAME=Gas Turbine @NOMENCLATURE=GT-1 @DURATION=1000", language="text")
        st.markdown("**Required Variables:**")
        st.markdown("- `@SHIP_NAME`: The name of the ship/component")
        st.markdown("- `@NOMENCLATURE`: The nomenclature identifier")
        st.markdown("**Optional Variables:**")
        st.markdown("- `@DURATION`: Duration for reliability calculation in hours (default: 8760 = 1 year)")
        st.info("💡 Common durations: 720 hours (1 month), 4380 hours (6 months), 8760 hours (1 year)")
        st.warning("⚠️ SHIP_NAME and NOMENCLATURE are required for the visualization to work!")
    
    # Add reliability settings
    st.markdown("### ⏱️ Reliability Settings")
    show_reliability = st.checkbox("Show reliability data", value=True, help="Toggle reliability information on/off")
    
    # Create input form for Drishti mode
    with st.form(key="drishti_form"):
        st.markdown("### 💬 Enter Your Command Below:")
        
        drishti_input = st.text_area(
            "Type your @ variables here:",
            placeholder="@SHIP_NAME=Gas Turbine @NOMENCLATURE=GT-1 @DURATION=8760",
            height=120,
            help="Enter SHIP_NAME and NOMENCLATURE (required), plus optional DURATION in hours"
        )
        
        submit_drishti = st.form_submit_button("🚀 Generate Visualization", use_container_width=True)
        
        if submit_drishti:
            if not drishti_input.strip():
                st.warning("⚠️ Please enter a command with the required variables.")
            else:
                # Parse variables from input
                variables = parse_drishti_variables(drishti_input)
                
                # Validate required variables
                required_vars = ["SHIP_NAME", "NOMENCLATURE"]
                missing_vars = [var for var in required_vars if var not in variables]
                
                # Get duration from variables or use default (8760 hours = 1 year)
                try:
                    reliability_duration = float(variables.get("DURATION", 8760))
                except ValueError:
                    st.error("❌ Duration must be a valid number")
                    st.stop()
                
                # Validate duration (must be positive and reasonable)
                if reliability_duration <= 0 or reliability_duration > 87600:  # Max 10 years
                    st.error("❌ Duration must be between 1 and 87,600 hours (10 years)")
                    st.stop()
                
                if missing_vars:
                    st.error(f"❌ Missing required variables: {', '.join(missing_vars)}")
                    st.info("Please include both @SHIP_NAME and @NOMENCLATURE in your command.")
                else:
                    # Show parsed variables
                    st.success("✅ Variables parsed successfully!")
                    col1, col2, col3 = st.columns(3)
                    with col1:
                        st.metric("Ship Name", variables["SHIP_NAME"])
                    with col2:
                        st.metric("Nomenclature", variables["NOMENCLATURE"])
                    with col3:
                        # Convert hours to more readable format for display
                        hours = reliability_duration
                        if hours >= 8760:
                            display_duration = f"{hours/8760:.1f} years ({int(hours)} hrs)"
                        elif hours >= 720:
                            display_duration = f"{hours/720:.1f} months ({int(hours)} hrs)"
                        elif hours >= 24:
                            display_duration = f"{hours/24:.1f} days ({int(hours)} hrs)"
                        else:
                            display_duration = f"{int(hours)} hours"
                        
                        st.metric("Duration", display_duration, help="Duration for reliability calculation")
                    
                    # Process the request
                    with st.spinner("⏳ Fetching visualization data..."):
                        try:
                            # Prepare API parameters for GET request
                            params = {
                                "nomenclature": variables["NOMENCLATURE"],
                                "ship_name": variables["SHIP_NAME"]
                            }
                            
                            logger.debug(f"📌 Sending GET request to {API_URL_DRISHTI} with params: {params}")
                            
                            # Make API call using GET method with query parameters
                            response = requests.get(API_URL_DRISHTI, params=params, timeout=30)
                            
                            if response.status_code == 200:
                                data = response.json()
                                
                                # Check for API errors
                                if "error" in data:
                                    error_message = data.get("message", "An unexpected error occurred.")
                                    st.error(f"❌ API Error: {error_message}")
                                else:
                                    # Validate JSON structure
                                    if "component_id" in data and "component_name" in data:
                                        # Fetch reliability data if enabled
                                        reliability_data = {}
                                        if show_reliability:
                                            try:
                                                # Collect all component IDs from the hierarchy
                                                component_ids = collect_component_ids(data)
                                                
                                                if component_ids:
                                                    # Fetch reliability data with caching
                                                    reliability_data = fetch_reliability_data_cached(component_ids, reliability_duration)
                                                    
                                                    # Display reliability statistics
                                                    if reliability_data:
                                                        reliable_components = [r for r in reliability_data.values() if r is not None]
                                                        if reliable_components:
                                                            avg_reliability = sum(reliable_components) / len(reliable_components)
                                                            min_reliability = min(reliable_components)
                                                            max_reliability = max(reliable_components)
                                                            
                                                            st.markdown("### 📊 Reliability Summary")
                                                            col1, col2, col3, col4 = st.columns(4)
                                                            with col1:
                                                                st.metric("Average Reliability", f"{avg_reliability:.1f}%")
                                                            with col2:
                                                                st.metric("Min Reliability", f"{min_reliability:.1f}%")
                                                            with col3:
                                                                st.metric("Max Reliability", f"{max_reliability:.1f}%")
                                                            with col4:
                                                                st.metric("Components with Data", f"{len(reliable_components)}/{len(component_ids)}")
                                            
                                            except Exception as e:
                                                st.warning(f"⚠️ Could not fetch reliability data: {str(e)}")
                                                logger.error(f"Error fetching reliability data: {str(e)}")
                                        
                                        # Display query information
                                        with st.expander("🔍 Query Information"):
                                            st.json({
                                                "Endpoint": API_URL_DRISHTI,
                                                "Ship Name": variables["SHIP_NAME"],
                                                "Nomenclature": variables["NOMENCLATURE"],
                                                "Root Component": data.get("component_name", "Unknown"),
                                                "Component ID": data.get("component_id", "Unknown"),
                                                "Reliability Duration": f"{reliability_duration} hours",
                                                "Duration Source": "From @DURATION variable" if "DURATION" in variables else "Default (8760 hours)",
                                                "Total Components": len(collect_component_ids(data))
                                            })
                                        
                                        # Create and display visualization
                                        st.markdown("### 📊 Component Hierarchy Visualization")
                                        
                                        if show_reliability:
                                            # Display legend
                                            st.markdown("#### 🎨 Reliability Legend")
                                            legend_cols = st.columns(4)
                                            with legend_cols[0]:
                                                st.markdown("🟢 **Excellent** (≥90%)")
                                            with legend_cols[1]:
                                                st.markdown("🟡 **Good** (70-89%)")
                                            with legend_cols[2]:
                                                st.markdown("🟠 **Fair** (50-69%)")
                                            with legend_cols[3]:
                                                st.markdown("🔴 **Poor** (<50%)")
                                        
                                        create_network_visualization_with_reliability(data, reliability_data, reliability_duration)
                                        
                                        st.success("✅ Visualization created successfully!")
                                    else:
                                        st.error("❌ Invalid data format received from API")
                            
                            else:
                                # Handle HTTP errors
                                try:
                                    error_info = response.json() if response.content else {"detail": "Unknown error"}
                                    error_message = error_info.get("detail", error_info.get("message", "Request failed"))
                                except:
                                    error_message = f"HTTP {response.status_code} error"
                                
                                st.error(f"❌ HTTP {response.status_code}: {error_message}")
                        
                        except requests.exceptions.Timeout:
                            st.error("⏱️ Request timed out. Please try again.")
                        except requests.exceptions.ConnectionError:
                            st.error("🔌 Connection error. Please check if the API server is running.")
                        except json.JSONDecodeError:
                            st.error("❌ Invalid JSON response from API")
                        except Exception as e:
                            st.error(f"❌ Unexpected error: {str(e)}")
                            logger.error(f"Unexpected error in Drishti mode: {str(e)}")

else:
    # Existing code for API and Chat modes
    with st.form(key="question_form"):
        user_question = st.text_input(
            "Ask a question:", 
            placeholder="e.g., who are our top customers by revenue?",
            key="user_question_input"
        )
        submit_button = st.form_submit_button("Submit")
        
        if submit_button and user_question.strip() == "":
            st.warning("⚠️ Please enter a question.")
        elif submit_button:
            with st.spinner("⏳ Processing your request, please wait..."):
                try:
                    # Choose API based on selected mode
                    API_URL = API_URL_CHAT if st.session_state.query_mode == "Chat" else API_URL_ASK
                    payload = {"query": user_question} if st.session_state.query_mode == "Chat" else {
                        "question": user_question}
                    
                    logger.debug(f"📌 Sending request to {API_URL} with payload: {payload}")
                    
                    response = requests.post(API_URL, json=payload, timeout=30)
                    
                    if response.status_code == 200:
                        data = response.json()
                        
                        if "message" in data and data["message"].startswith("CLARIFY:"):
                            clarification = data["message"].replace("CLARIFY:", "").strip()
                            st.warning(f"🤔 I need more details: {clarification}")
                        elif "error" in data:
                            error_message = data.get("message", "An unexpected error occurred.")
                            logger.debug(f"📌 Debug: Received API error -> {data['error']} | Message -> {error_message}")
                            
                            if data["error"] == "Unsupported Question":
                                st.warning(f"🤔 {error_message}")
                            elif data["error"] == "Clarification Needed":
                                st.error(f"🤔 {error_message}")
                            elif data["error"] == "Access Denied":
                                st.error(f"🚫 {error_message}")
                            elif data["error"] == "Security Violation":
                                st.error(f"🛑 {error_message}")
                            else:
                                st.error(f"❌ {error_message}")
                        else:
                            with st.expander("🗨️ User Query"):
                                st.write(data.get("question", data.get("query", "No question available")))
                            
                            if "generated_sql" in data:
                                with st.expander("🔍 View Generated SQL Query"):
                                    st.code(data["generated_sql"], language="sql")
                            
                            if "result" in data:
                                if isinstance(data["result"], list) and data["result"]:
                                    df = pd.DataFrame(data["result"])
                                    st.subheader("📊 Query Results")
                                    st.dataframe(df)
                                else:
                                    st.warning("⚠️ Query executed successfully, but no records were found.")
                            else:
                                st.error("❌ Unexpected API response format. No valid data returned.")
                    else:
                        try:
                            error_msg = response.json().get('message', 'Unknown error')
                        except:
                            error_msg = f"HTTP {response.status_code} error"
                        st.error(f"❌ API Error: {error_msg}")
                
                except requests.exceptions.Timeout:
                    st.error("⏱️ Request timed out. Please try again.")
                except requests.exceptions.ConnectionError:
                    st.error("🔌 Connection error. Please check if the API server is running.")
                except Exception as e:
                    st.error(f"❌ Unexpected error: {str(e)}")
                    logger.error(f"Unexpected error: {str(e)}")