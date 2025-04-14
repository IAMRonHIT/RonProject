import streamlit as st
import pandas as pd
import numpy as np
import time
import json
import random
from datetime import datetime, timedelta
import altair as alt
import plotly.graph_objects as go
import plotly.express as px
from streamlit_plotly_events import plotly_events

# Set page configuration
st.set_page_config(
    page_title="Ron AI - Prior Authorization Agent Workflow",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for dark mode and simpler visuals
st.markdown("""
<style>
    /* Dark mode colors */
    .main {
        background-color: #0e1117;
        color: #fafafa;
    }
    .stButton>button {
        border-radius: 10px;
        font-weight: 600;
    }
    .agent-card {
        background-color: #1e1e1e;
        border-radius: 10px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    }
    .agent-header {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
    }
    .agent-icon {
        margin-right: 15px;
        font-size: 24px;
        background: linear-gradient(45deg, #3b82f6, #10b981);
        color: white;
        padding: 10px;
        border-radius: 12px;
    }
    .agent-status {
        margin-left: auto;
        padding: 5px 10px;
        border-radius: 20px;
        font-size: 12px;
    }
    .metric-card {
        background-color: #1e1e1e;
        padding: 15px;
        border-radius: 10px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }
    .metric-value {
        font-size: 24px;
        font-weight: 700;
        margin: 10px 0;
        color: #fafafa;
    }
    .metric-label {
        font-size: 14px;
        color: #a0aec0;
    }
    .status-badge {
        display: inline-block;
        padding: 5px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        background-color: #2d3748;
        color: #fafafa;
    }
    .criteria-item {
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        background-color: #2d3748;
    }
    .criteria-icon {
        margin-right: 10px;
        font-size: 16px;
    }
    .insight-item {
        padding: 10px;
        border-radius: 8px;
        margin-bottom: 8px;
        background-color: #2d3748;
        font-size: 14px;
    }
    .progress-bar-container {
        width: 100%;
        height: 6px;
        background-color: #4a5568;
        border-radius: 3px;
        margin: 15px 0;
    }
    .progress-bar {
        height: 100%;
        border-radius: 3px;
        background: linear-gradient(90deg, #3b82f6, #10b981);
    }
    .tab-content {
        padding: 20px;
        background-color: #1e1e1e;
        border-radius: 10px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }
    div[data-testid="stSidebarNav"] {
        background-image: linear-gradient(#3b82f6, #10b981);
        padding-top: 20px;
        border-radius: 0 15px 15px 0;
    }
    .custom-progress-label {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 5px;
        color: #fafafa;
    }
    /* Timeline CSS */
    .timeline-item {
        position: relative;
        padding-left: 30px;
        margin-bottom: 15px;
    }
    .timeline-item:before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 2px;
        background: #4a5568;
    }
    .timeline-item:after {
        content: '';
        position: absolute;
        left: -4px;
        top: 0;
        height: 10px;
        width: 10px;
        border-radius: 50%;
        background: #3b82f6;
    }
    .timeline-content {
        padding: 10px 15px;
        background-color: #2d3748;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }
    .timeline-time {
        font-size: 12px;
        color: #a0aec0;
        margin-bottom: 5px;
    }
    /* Dark mode adjustments for tables and other elements */
    div.stDataFrame {
        color: #fafafa;
    }
    button {
        background-color: #2d3748 !important;
        color: #fafafa !important;
    }
    .stSlider div[data-baseweb="slider"] {
        background-color: #4a5568 !important;
    }
    .stSlider div[data-baseweb="thumb"] {
        background-color: #3b82f6 !important;
    }
    /* Bold tab styling */
    button[data-baseweb="tab"] {
        font-weight: bold !important;
    }
    /* Message box styling */
    .stAlert {
        background-color: #2d3748;
        color: #fafafa;
    }
</style>
""", unsafe_allow_html=True)

# Demo data
class AgentSystem:
    def __init__(self):
        # Simple agent definitions with clear roles
        self.agents = {
            "Doctor Helper": {
                "icon": "📋",
                "specialty": "Checks insurance and patient info",
                "color": "#3b82f6",
                "criteria": [
                    {"name": "Insurance Check", "status": "pending", "confidence": 0.0, "details": ""},
                    {"name": "Patient Info Check", "status": "pending", "confidence": 0.0, "details": ""},
                    {"name": "Procedure Code Check", "status": "pending", "confidence": 0.0, "details": ""}
                ],
                "insights": [],
                "recommendations": []
            },
            "Medical Expert": {
                "icon": "🩺",
                "specialty": "Checks if treatment is needed medically",
                "color": "#8b5cf6",
                "criteria": [
                    {"name": "Guidelines Check", "status": "pending", "confidence": 0.0, "details": ""},
                    {"name": "Medical Need Check", "status": "pending", "confidence": 0.0, "details": ""},
                    {"name": "X-Ray Review", "status": "pending", "confidence": 0.0, "details": ""}
                ],
                "insights": [],
                "recommendations": []
            },
            "Insurance Expert": {
                "icon": "📝",
                "specialty": "Checks insurance rules",
                "color": "#ec4899",
                "criteria": [
                    {"name": "Insurance Rules Check", "status": "pending", "confidence": 0.0, "details": ""},
                    {"name": "Previous Treatment Check", "status": "pending", "confidence": 0.0, "details": ""},
                    {"name": "In-Network Check", "status": "pending", "confidence": 0.0, "details": ""}
                ],
                "insights": [],
                "recommendations": []
            },
            "Care Coordinator": {
                "icon": "🔄",
                "specialty": "Coordinates everything and makes decisions",
                "color": "#10b981",
                "criteria": [
                    {"name": "Doctor Communication", "status": "pending", "confidence": 0.0, "details": ""},
                    {"name": "Patient Communication", "status": "pending", "confidence": 0.0, "details": ""},
                    {"name": "Document Check", "status": "pending", "confidence": 0.0, "details": ""}
                ],
                "insights": [],
                "recommendations": []
            }
        }
        
        # Basic system state
        self.process_status = "Not Started"
        self.progress = 0
        self.status_history = []
        self.approval_status = "Pending"
        self.medical_necessity_score = 0
        self.processing_stage = ""
        self.completion_time = None
        
        # Simple patient data
        self.patient_data = {
            "name": "Michael Anderson",
            "age": 57,
            "gender": "Male",
            "insurance": "Blue Cross Blue Shield",
            "policy_number": "BCBS-3825719",
            "procedure": "Knee Replacement Surgery",
            "diagnosis": "Severe Knee Arthritis",
            "cpt_code": "27447",
            "icd_10": "M17.11",
            "provider": "Dr. Sarah Johnson",
            "facility": "Metro Medical Center"
        }
        
    def reset(self):
        # Reset all agent states
        for agent_name in self.agents:
            for criteria in self.agents[agent_name]["criteria"]:
                criteria["status"] = "pending"
                criteria["confidence"] = 0.0
                criteria["details"] = ""
            self.agents[agent_name]["insights"] = []
            self.agents[agent_name]["recommendations"] = []
        
        # Reset system state
        self.process_status = "Not Started"
        self.progress = 0
        self.status_history = []
        self.approval_status = "Pending"
        self.medical_necessity_score = 0
        self.processing_stage = ""
        self.completion_time = None
    
    def update_progress(self, increment):
        # Simple progress update
        self.progress += increment
        if self.progress > 100:
            self.progress = 100
            
    def add_status_history(self, status, details):
        # Add an event to the timeline
        self.status_history.append({
            "timestamp": datetime.now().strftime("%H:%M:%S"),
            "status": status,
            "details": details
        })

# Initialize session state for simulation control
if 'agent_system' not in st.session_state:
    st.session_state.agent_system = AgentSystem()
    
if 'simulation_running' not in st.session_state:
    st.session_state.simulation_running = False
    
if 'simulation_completed' not in st.session_state:
    st.session_state.simulation_completed = False
    
if 'simulation_speed' not in st.session_state:
    st.session_state.simulation_speed = 2.0  # Default speed multiplier


# Header
st.markdown("""
<div style="display: flex; align-items: center; margin-bottom: 20px;">
    <div style="background: linear-gradient(45deg, #3b82f6, #10b981); padding: 15px; border-radius: 15px; margin-right: 20px;">
        <h1 style="color: white; margin: 0; font-size: 32px;">🤖</h1>
    </div>
    <div>
        <h1 style="margin: 0; color: #fafafa;">Ron AI</h1>
        <p style="margin: 0; color: #a0aec0;">AI Helpers for Getting Medical Procedures Approved</p>
    </div>
</div>
""", unsafe_allow_html=True)

# Create columns for patient info and simulation controls
col1, col2 = st.columns([2, 1])

with col1:
    st.markdown("### Patient Information")
    
    patient_data = st.session_state.agent_system.patient_data
    
    patient_cols = st.columns(2)
    
    with patient_cols[0]:
        st.markdown(f"""
        <div class="metric-card">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <div style="background: linear-gradient(45deg, #3b82f6, #10b981); color: white; padding: 8px; border-radius: 8px; margin-right: 10px;">👤</div>
                <div>
                    <div style="font-weight: 600; font-size: 18px; color: #fafafa;">{patient_data['name']}</div>
                    <div style="color: #a0aec0; font-size: 14px;">{patient_data['age']} year old {patient_data['gender']}</div>
                </div>
            </div>
            <div style="display: flex; margin-bottom: 8px;">
                <div style="width: 40%; font-weight: 500; color: #a0aec0;">Problem:</div>
                <div style="width: 60%; color: #fafafa;">{patient_data['diagnosis']}</div>
            </div>
            <div style="display: flex; margin-bottom: 8px;">
                <div style="width: 40%; font-weight: 500; color: #a0aec0;">Code:</div>
                <div style="width: 60%; color: #fafafa;">{patient_data['icd_10']}</div>
            </div>
            <div style="display: flex; margin-bottom: 8px;">
                <div style="width: 40%; font-weight: 500; color: #a0aec0;">Surgery:</div>
                <div style="width: 60%; color: #fafafa;">{patient_data['procedure']}</div>
            </div>
            <div style="display: flex; margin-bottom: 8px;">
                <div style="width: 40%; font-weight: 500; color: #a0aec0;">Surgery Code:</div>
                <div style="width: 60%; color: #fafafa;">{patient_data['cpt_code']}</div>
            </div>
        </div>
        """, unsafe_allow_html=True)
    
    with patient_cols[1]:
        st.markdown(f"""
        <div class="metric-card">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <div style="background: linear-gradient(45deg, #3b82f6, #10b981); color: white; padding: 8px; border-radius: 8px; margin-right: 10px;">🏥</div>
                <div>
                    <div style="font-weight: 600; font-size: 18px; color: #fafafa;">{patient_data['provider']}</div>
                    <div style="color: #a0aec0; font-size: 14px;">{patient_data['facility']}</div>
                </div>
            </div>
            <div style="display: flex; margin-bottom: 8px;">
                <div style="width: 40%; font-weight: 500; color: #a0aec0;">Insurance:</div>
                <div style="width: 60%; color: #fafafa;">{patient_data['insurance']}</div>
            </div>
            <div style="display: flex; margin-bottom: 8px;">
                <div style="width: 40%; font-weight: 500; color: #a0aec0;">Policy #:</div>
                <div style="width: 60%; color: #fafafa;">{patient_data['policy_number']}</div>
            </div>
            <div style="display: flex; margin-bottom: 8px;">
                <div style="width: 40%; font-weight: 500; color: #a0aec0;">Request Date:</div>
                <div style="width: 60%; color: #fafafa;">{datetime.now().strftime("%m/%d/%Y")}</div>
            </div>
            <div style="display: flex; margin-bottom: 8px;">
                <div style="width: 40%; font-weight: 500; color: #a0aec0;">Status:</div>
                <div style="width: 60%; color: #fafafa;">
                    <span class="status-badge" style="background-color: #2d3748; color: #fef3c7;">
                        {st.session_state.agent_system.approval_status}
                    </span>
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)

with col2:
    st.markdown("### How to Run the Simulation")
    
    # Create a card with gradient background for simulation controls
    st.markdown("""
    <div style="background: #2d3748; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);">
        <h4 style="margin-top: 0; color: #fafafa;">AI Agent Simulation</h4>
        <p style="color: #a0aec0; font-size: 14px;">
            Press the button below to see how Ron AI's robot helpers work together to approve a knee surgery request.
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    # Simulation controls
    col_speed, col_button = st.columns([1, 1])
    
    with col_speed:
        st.session_state.simulation_speed = st.slider(
            "Speed", 
            min_value=0.5, 
            max_value=5.0, 
            value=st.session_state.simulation_speed,
            step=0.5,
            format="%.1fx",
            disabled=st.session_state.simulation_running
        )
    
    with col_button:
        if not st.session_state.simulation_running and not st.session_state.simulation_completed:
            if st.button("Start Simulation", key="start_simulation", use_container_width=True):
                st.session_state.simulation_running = True
                st.session_state.agent_system.reset()
                st.session_state.agent_system.process_status = "Running"
                st.session_state.agent_system.add_status_history("Simulation Started", "Starting up AI helpers...")
        elif st.session_state.simulation_running:
            if st.button("Stop Simulation", key="stop_simulation", use_container_width=True):
                st.session_state.simulation_running = False
                st.session_state.agent_system.process_status = "Stopped"
                st.session_state.agent_system.add_status_history("Simulation Stopped", "You stopped the simulation.")
        else:
            if st.button("Reset Simulation", key="reset_simulation", use_container_width=True):
                st.session_state.simulation_running = False
                st.session_state.simulation_completed = False
                st.session_state.agent_system.reset()
                st.session_state.agent_system.add_status_history("Simulation Reset", "Ready to start again.")

    # Show current status
    st.markdown(f"""
    <div style="margin-top: 15px;">
        <div class="custom-progress-label">Current Status: {st.session_state.agent_system.process_status}</div>
        <div class="progress-bar-container">
            <div class="progress-bar" style="width: {st.session_state.agent_system.progress}%;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #a0aec0;">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
        </div>
    </div>
    """, unsafe_allow_html=True)

    if st.session_state.agent_system.processing_stage:
        st.markdown(f"""
        <div style="margin-top: 10px; padding: 10px; background-color: #2d3748; border-radius: 5px; font-size: 14px; color: #fafafa;">
            <div style="font-weight: 600; margin-bottom: 5px;">Current Task:</div>
            <div>{st.session_state.agent_system.processing_stage}</div>
        </div>
        """, unsafe_allow_html=True)

# Main content with tabs
tab1, tab2, tab3 = st.tabs(["AI Helper Analysis", "Timeline", "Final Results"])

# Tab 1: AI Agent Analysis
with tab1:
    # Status cards at the top
    if st.session_state.simulation_completed:
        metric_cols = st.columns(3)
        
        with metric_cols[0]:
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-label">Medical Need Score</div>
                <div class="metric-value" style="color: {'#10b981' if st.session_state.agent_system.medical_necessity_score >= 85 else '#f59e0b' if st.session_state.agent_system.medical_necessity_score >= 70 else '#ef4444'};">
                    {st.session_state.agent_system.medical_necessity_score}%
                </div>
                <div style="height: 4px; background-color: #4a5568; border-radius: 2px; margin-top: 10px;">
                    <div style="height: 100%; width: {st.session_state.agent_system.medical_necessity_score}%; background: linear-gradient(90deg, #3b82f6, #10b981); border-radius: 2px;"></div>
                </div>
            </div>
            """, unsafe_allow_html=True)
            
        with metric_cols[1]:
            # Calculate average confidence across all criteria
            all_confidences = []
            for agent_name, agent_data in st.session_state.agent_system.agents.items():
                for criteria in agent_data["criteria"]:
                    if criteria["status"] == "complete":
                        all_confidences.append(criteria["confidence"])
            
            avg_confidence = sum(all_confidences) / len(all_confidences) if all_confidences else 0
            
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-label">AI Confidence</div>
                <div class="metric-value" style="color: #3b82f6;">
                    {avg_confidence:.2f}
                </div>
                <div style="height: 4px; background-color: #4a5568; border-radius: 2px; margin-top: 10px;">
                    <div style="height: 100%; width: {avg_confidence * 100}%; background: linear-gradient(90deg, #3b82f6, #10b981); border-radius: 2px;"></div>
                </div>
            </div>
            """, unsafe_allow_html=True)
            
        with metric_cols[2]:
            approval_color = "#10b981" if st.session_state.agent_system.approval_status == "Approved" else "#ef4444" if st.session_state.agent_system.approval_status == "Denied" else "#f59e0b"
            approval_text = st.session_state.agent_system.approval_status
            
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-label">Final Decision</div>
                <div class="metric-value" style="color: {approval_color};">
                    {approval_text}
                </div>
                <div style="font-size: 12px; color: #a0aec0; margin-top: 10px;">
                    {'Based on all AI helpers working together' if st.session_state.simulation_completed else 'Still deciding...'}
                </div>
            </div>
            """, unsafe_allow_html=True)

    # Agent cards
    st.markdown("### AI Helpers Working Together")
    agent_cols = st.columns(2)
    
    for i, (agent_name, agent_data) in enumerate(st.session_state.agent_system.agents.items()):
        with agent_cols[i % 2]:
            # Calculate agent progress
            total_criteria = len(agent_data["criteria"])
            completed_criteria = sum(1 for c in agent_data["criteria"] if c["status"] == "complete")
            agent_progress = (completed_criteria / total_criteria) * 100 if total_criteria > 0 else 0
            
            # Determine agent status
            agent_status = "Working" if st.session_state.simulation_running and agent_progress < 100 else "Done" if agent_progress == 100 else "Waiting"
            status_color = "#10b981" if agent_status == "Done" else "#3b82f6" if agent_status == "Working" else "#a0aec0"
            
            st.markdown(f"""
            <div class="agent-card" style="border-top: 4px solid {agent_data['color']};">
                <div class="agent-header">
                    <div class="agent-icon" style="background: linear-gradient(45deg, {agent_data['color']}, {agent_data['color']}dd);">
                        {agent_data['icon']}
                    </div>
                    <div>
                        <h3 style="margin: 0; font-size: 18px; color: #fafafa;">{agent_name}</h3>
                        <p style="margin: 0; color: #a0aec0; font-size: 14px;">{agent_data['specialty']}</p>
                    </div>
                    <div class="agent-status" style="background-color: {status_color}33; color: {status_color};">
                        {agent_status}
                    </div>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span style="font-size: 14px; font-weight: 500; color: #fafafa;">Progress</span>
                        <span style="font-size: 14px; color: #a0aec0;">{completed_criteria}/{total_criteria} checks</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: {agent_progress}%; background: linear-gradient(90deg, {agent_data['color']}bb, {agent_data['color']});"></div>
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h4 style="font-size: 15px; margin-bottom: 10px; color: #fafafa;">Checks Being Done</h4>
                    <div>
            """, unsafe_allow_html=True)
            
            for criteria in agent_data["criteria"]:
                criteria_status_color = "#10b981" if criteria["status"] == "complete" else "#3b82f6" if criteria["status"] == "processing" else "#a0aec0"
                criteria_bg_color = f"{criteria_status_color}10"
                
                criteria_icon = "✅" if criteria["status"] == "complete" else "⚙️" if criteria["status"] == "processing" else "⏳"
                
                confidence_display = f"{criteria['confidence']:.2f}" if criteria["status"] == "complete" else "N/A"
                
                st.markdown(f"""
                <div class="criteria-item" style="border-left: 3px solid {criteria_status_color};">
                    <div class="criteria-icon">
                        {criteria_icon}
                    </div>
                    <div style="flex-grow: 1;">
                        <div style="font-weight: 500; margin-bottom: 2px; color: #fafafa;">{criteria["name"]}</div>
                        <div style="font-size: 12px; color: #a0aec0;">
                            {criteria["details"] if criteria["details"] else "Waiting to check..."}
                        </div>
                    </div>
                    <div style="text-align: right; padding-left: 10px;">
                        <div style="font-size: 12px; color: #a0aec0; margin-bottom: 2px;">Confidence</div>
                        <div style="font-weight: 600; color: {criteria_status_color};">
                            {confidence_display}
                        </div>
                    </div>
                </div>
                """, unsafe_allow_html=True)
            
            st.markdown("</div></div>", unsafe_allow_html=True)
            
            # Display insights if there are any
            if agent_data["insights"]:
                st.markdown(f"""
                <div style="margin-bottom: 15px;">
                    <h4 style="font-size: 15px; margin-bottom: 10px; color: #fafafa;">AI Findings</h4>
                    <div>
                """, unsafe_allow_html=True)
                
                for insight in agent_data["insights"]:
                    st.markdown(f"""
                    <div class="insight-item">
                        <div style="display: flex; align-items: flex-start;">
                            <div style="color: {agent_data['color']}; margin-right: 8px;">💡</div>
                            <div style="color: #fafafa;">{insight}</div>
                        </div>
                    </div>
                    """, unsafe_allow_html=True)
                
                st.markdown("</div></div>", unsafe_allow_html=True)
            
            # Display recommendations if there are any
            if agent_data["recommendations"]:
                st.markdown(f"""
                <div>
                    <h4 style="font-size: 15px; margin-bottom: 10px; color: #fafafa;">Suggestions</h4>
                    <div>
                """, unsafe_allow_html=True)
                
                for recommendation in agent_data["recommendations"]:
                    st.markdown(f"""
                    <div class="insight-item" style="border-left: 3px solid {agent_data['color']};">
                        <div style="display: flex; align-items: flex-start;">
                            <div style="color: {agent_data['color']}; margin-right: 8px;">→</div>
                            <div style="color: #fafafa;">{recommendation}</div>
                        </div>
                    </div>
                    """, unsafe_allow_html=True)
                
                st.markdown("</div></div>", unsafe_allow_html=True)
            
            st.markdown("</div>", unsafe_allow_html=True)

# Tab 2: Timeline
with tab2:
    st.markdown("### What's Happening (Timeline)")
    
    if not st.session_state.agent_system.status_history:
        st.info("The timeline will show up after you start the simulation.")
    else:
        st.markdown("""
        <div style="padding: 20px; background-color: #1e1e1e; border-radius: 10px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);">
        """, unsafe_allow_html=True)
        
        for i, event in enumerate(st.session_state.agent_system.status_history):
            status_icon = "✅" if "Complete" in event["status"] else "⚠️" if "Error" in event["status"] else "⏳" if "Pending" in event["status"] else "⚙️"
            
            st.markdown(f"""
            <div class="timeline-item">
                <div class="timeline-content">
                    <div class="timeline-time">{event["timestamp"]}</div>
                    <div style="font-weight: 500; margin-bottom: 3px; color: #fafafa;">
                        {status_icon} {event["status"]}
                    </div>
                    <div style="font-size: 14px; color: #a0aec0;">
                        {event["details"]}
                    </div>
                </div>
            </div>
            """, unsafe_allow_html=True)
        
        st.markdown("</div>", unsafe_allow_html=True)

# Tab 3: Final Results
with tab3:
    if st.session_state.simulation_completed:
        # Create columns for the summary
        col1, col2 = st.columns([2, 1])
        
        with col1:
            st.markdown("### Final Decision")
            
            approval_status = st.session_state.agent_system.approval_status
            status_color = "#10b981" if approval_status == "Approved" else "#ef4444" if approval_status == "Denied" else "#f59e0b"
            
            summary_insights = [
                "Patient meets medical need criteria for knee replacement surgery",
                "Patient has tried physical therapy and other treatments first",
                "All required paperwork is complete",
                "Surgery is covered by the patient's insurance"
            ] if st.session_state.agent_system.medical_necessity_score >= 85 else [
                "More medical records might be needed",
                "Need to check if insurance covers this procedure",
                "Consider trying other treatments first",
                "Recommend asking doctor for more information"
            ]
            
            recommendations = [
                "Schedule the surgery",
                "Make a post-surgery care plan",
                "Schedule a follow-up appointment for 2 weeks after surgery"
            ] if st.session_state.agent_system.medical_necessity_score >= 85 else [
                "Ask doctor for more information",
                "Set up meeting with medical director",
                "Look into other treatment options"
            ]
            
            st.markdown(f"""
            <div style="background-color: #1e1e1e; border-radius: 10px; padding: 20px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);">
                <div style="display: flex; align-items: center; margin-bottom: 20px;">
                    <div style="background-color: {status_color}; color: white; font-weight: 600; padding: 8px 16px; border-radius: 20px; margin-right: 15px;">
                        {approval_status}
                    </div>
                    <div>
                        <div style="font-weight: 600; font-size: 18px; color: #fafafa;">{st.session_state.agent_system.patient_data['procedure']}</div>
                        <div style="color: #a0aec0;">{st.session_state.agent_system.patient_data['diagnosis']}</div>
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h4 style="font-size: 16px; margin-bottom: 12px; color: #fafafa;">What We Found</h4>
                    <div>
            """, unsafe_allow_html=True)
            
            for insight in summary_insights:
                st.markdown(f"""
                <div style="display: flex; align-items: flex-start; margin-bottom: 10px;">
                    <div style="color: #3b82f6; margin-right: 10px;">•</div>
                    <div style="color: #fafafa;">{insight}</div>
                </div>
                """, unsafe_allow_html=True)
            
            st.markdown(f"""
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h4 style="font-size: 16px; margin-bottom: 12px; color: #fafafa;">What To Do Next</h4>
                    <div>
            """, unsafe_allow_html=True)
            
            for recommendation in recommendations:
                st.markdown(f"""
                <div style="display: flex; align-items: flex-start; margin-bottom: 10px;">
                    <div style="color: #10b981; margin-right: 10px;">→</div>
                    <div style="color: #fafafa;">{recommendation}</div>
                </div>
                """, unsafe_allow_html=True)
            
            st.markdown(f"""
                    </div>
                </div>
                
                <div>
                    <h4 style="font-size: 16px; margin-bottom: 12px; color: #fafafa;">Approval Details</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div style="padding: 12px; background-color: #2d3748; border-radius: 8px;">
                            <div style="font-size: 12px; color: #a0aec0;">Surgery Code</div>
                            <div style="font-weight: 500; color: #fafafa;">{st.session_state.agent_system.patient_data['cpt_code']}</div>
                        </div>
                        <div style="padding: 12px; background-color: #2d3748; border-radius: 8px;">
                            <div style="font-size: 12px; color: #a0aec0;">Diagnosis Code</div>
                            <div style="font-weight: 500; color: #fafafa;">{st.session_state.agent_system.patient_data['icd_10']}</div>
                        </div>
                        <div style="padding: 12px; background-color: #2d3748; border-radius: 8px;">
                            <div style="font-size: 12px; color: #a0aec0;">Approval ID</div>
                            <div style="font-weight: 500; color: #fafafa;">AUTH-{random.randint(100000, 999999)}</div>
                        </div>
                        <div style="padding: 12px; background-color: #2d3748; border-radius: 8px;">
                            <div style="font-size: 12px; color: #a0aec0;">Start Date</div>
                            <div style="font-weight: 500; color: #fafafa;">{(datetime.now() + timedelta(days=2)).strftime("%m/%d/%Y")}</div>
                        </div>
                        <div style="padding: 12px; background-color: #2d3748; border-radius: 8px;">
                            <div style="font-size: 12px; color: #a0aec0;">End Date</div>
                            <div style="font-weight: 500; color: #fafafa;">{(datetime.now() + timedelta(days=90)).strftime("%m/%d/%Y")}</div>
                        </div>
                        <div style="padding: 12px; background-color: #2d3748; border-radius: 8px;">
                            <div style="font-size: 12px; color: #a0aec0;">Approval Time</div>
                            <div style="font-weight: 500; color: #fafafa;">
                                {
                                    f"{int((datetime.strptime(st.session_state.agent_system.status_history[-1]['timestamp'], '%H:%M:%S') - datetime.strptime(st.session_state.agent_system.status_history[0]['timestamp'], '%H:%M:%S')).total_seconds())} seconds" 
                                    if len(st.session_state.agent_system.status_history) > 1 
                                    else "N/A"
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            """, unsafe_allow_html=True)
        
        with col2:
            st.markdown("### Cool Stats")
            
            # Create gauge charts for key metrics
            fig = go.Figure()
            
            # Medical Necessity Score Gauge
            fig.add_trace(go.Indicator(
                mode="gauge+number",
                value=st.session_state.agent_system.medical_necessity_score,
                title={"text": "Medical Need", "font": {"color": "#fafafa"}},
                gauge={
                    "axis": {"range": [0, 100], "tickwidth": 1, "tickcolor": "#a0aec0", "tickfont": {"color": "#a0aec0"}},
                    "bar": {"color": "#3b82f6"},
                    "steps": [
                        {"range": [0, 60], "color": "#4a063a"},
                        {"range": [60, 80], "color": "#543906"},
                        {"range": [80, 100], "color": "#064a2e"}
                    ],
                    "threshold": {
                        "line": {"color": "white", "width": 2},
                        "thickness": 0.75,
                        "value": 85
                    }
                },
                domain={"row": 0, "column": 0}
            ))
            
            # Calculate average confidence
            all_confidences = []
            for agent_name, agent_data in st.session_state.agent_system.agents.items():
                for criteria in agent_data["criteria"]:
                    if criteria["status"] == "complete":
                        all_confidences.append(criteria["confidence"])
            
            avg_confidence = sum(all_confidences) / len(all_confidences) if all_confidences else 0
            
            # AI Confidence Gauge
            fig.add_trace(go.Indicator(
                mode="gauge+number",
                value=avg_confidence * 100,
                title={"text": "AI Confidence", "font": {"color": "#fafafa"}},
                gauge={
                    "axis": {"range": [0, 100], "tickwidth": 1, "tickcolor": "#a0aec0", "tickfont": {"color": "#a0aec0"}},
                    "bar": {"color": "#8b5cf6"},
                    "steps": [
                        {"range": [0, 60], "color": "#4a063a"},
                        {"range": [60, 80], "color": "#543906"},
                        {"range": [80, 100], "color": "#064a2e"}
                    ],
                    "threshold": {
                        "line": {"color": "white", "width": 2},
                        "thickness": 0.75,
                        "value": 90
                    }
                },
                domain={"row": 1, "column": 0}
            ))
            
            # Update layout with dark theme
            fig.update_layout(
                grid={"rows": 2, "columns": 1, "pattern": "independent"},
                height=400,
                margin=dict(l=30, r=30, t=30, b=30),
                paper_bgcolor="#1e1e1e",
                font={"color": "#fafafa"},
                plot_bgcolor="#1e1e1e"
            )
            
            st.plotly_chart(fig, use_container_width=True)
            
            # Add comparison to manual processing
            st.markdown("""
            <div style="padding: 15px; background-color: #2d3748; border-radius: 8px; margin-top: 10px; color: #fafafa;">
                <h4 style="margin-top: 0; font-size: 16px;">AI vs. Humans</h4>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <div style="font-weight: 500;">Ron AI Processing Time:</div>
                    <div style="font-weight: 600; color: #3b82f6;">~15 seconds</div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <div style="font-weight: 500;">Human Processing:</div>
                    <div style="font-weight: 600; color: #a0aec0;">30+ minutes</div>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <div style="font-weight: 500;">Time Saved:</div>
                    <div style="font-weight: 600; color: #10b981;">99%</div>
                </div>
            </div>
            """, unsafe_allow_html=True)
    else:
        st.info("Final results will show up after the simulation is finished.")

# Run the simulation
def run_simulation_step():
    if not st.session_state.simulation_running:
        return
    
    agent_system = st.session_state.agent_system
    
    # Update progress
    if agent_system.progress < 100:
        speed_factor = st.session_state.simulation_speed
        progress_increment = random.uniform(1.0, 3.0) * speed_factor
        agent_system.update_progress(progress_increment)
        
        # Process stages
        if agent_system.progress < 20:
            agent_system.processing_stage = "Starting up and getting patient information"
            
            # Start IntakeAgent's first criteria
            if agent_system.agents["Doctor Helper"]["criteria"][0]["status"] == "pending":
                agent_system.agents["Doctor Helper"]["criteria"][0]["status"] = "processing"
                agent_system.add_status_history("Processing", "Checking insurance information")
                
        elif agent_system.progress < 30:
            # Complete IntakeAgent's first criteria
            if agent_system.agents["Doctor Helper"]["criteria"][0]["status"] == "processing":
                agent_system.agents["Doctor Helper"]["criteria"][0]["status"] = "complete"
                agent_system.agents["Doctor Helper"]["criteria"][0]["confidence"] = random.uniform(0.85, 0.95)
                agent_system.agents["Doctor Helper"]["criteria"][0]["details"] = "Insurance coverage confirmed with Blue Cross Blue Shield."
                agent_system.add_status_history("Check Complete", "Insurance is active and verified")
                
            # Start IntakeAgent's second criteria
            if agent_system.agents["Doctor Helper"]["criteria"][1]["status"] == "pending":
                agent_system.agents["Doctor Helper"]["criteria"][1]["status"] = "processing"
                agent_system.add_status_history("Processing", "Checking patient information")
                
        elif agent_system.progress < 40:
            # Complete IntakeAgent's second criteria
            if agent_system.agents["Doctor Helper"]["criteria"][1]["status"] == "processing":
                agent_system.agents["Doctor Helper"]["criteria"][1]["status"] = "complete"
                agent_system.agents["Doctor Helper"]["criteria"][1]["confidence"] = random.uniform(0.90, 0.98)
                agent_system.agents["Doctor Helper"]["criteria"][1]["details"] = "Patient info verified and matches insurance records."
                agent_system.add_status_history("Check Complete", "Patient information confirmed")
                
            # Start IntakeAgent's third criteria
            if agent_system.agents["Doctor Helper"]["criteria"][2]["status"] == "pending":
                agent_system.agents["Doctor Helper"]["criteria"][2]["status"] = "processing"
                agent_system.add_status_history("Processing", "Checking surgery and diagnosis codes")
                
            # Add insights and recommendations to IntakeAgent
            if not agent_system.agents["Doctor Helper"]["insights"]:
                agent_system.agents["Doctor Helper"]["insights"] = [
                    "Patient has had insurance for over 3 years",
                    "No problems found with patient's insurance history",
                    "All patient information verified and accurate"
                ]
                
            if not agent_system.agents["Doctor Helper"]["recommendations"]:
                agent_system.agents["Doctor Helper"]["recommendations"] = [
                    "Continue with authorization request",
                    "No additional info needed from patient"
                ]
                
        elif agent_system.progress < 45:
            # Complete IntakeAgent's third criteria
            if agent_system.agents["Doctor Helper"]["criteria"][2]["status"] == "processing":
                agent_system.agents["Doctor Helper"]["criteria"][2]["status"] = "complete"
                agent_system.agents["Doctor Helper"]["criteria"][2]["confidence"] = random.uniform(0.88, 0.96)
                agent_system.agents["Doctor Helper"]["criteria"][2]["details"] = "CPT 27447 and ICD-10 M17.11 codes are correct for knee replacement."
                agent_system.add_status_history("Check Complete", "Surgery and diagnosis codes verified")
                
            # Update processing stage
            agent_system.processing_stage = "Checking if surgery is medically needed"
                
            # Start ClinicalAgent's first criteria
            if agent_system.agents["Medical Expert"]["criteria"][0]["status"] == "pending":
                agent_system.agents["Medical Expert"]["criteria"][0]["status"] = "processing"
                agent_system.add_status_history("Processing", "Checking clinical guidelines")
                
        elif agent_system.progress < 55:
            # Complete ClinicalAgent's first criteria
            if agent_system.agents["Medical Expert"]["criteria"][0]["status"] == "processing":
                agent_system.agents["Medical Expert"]["criteria"][0]["status"] = "complete"
                agent_system.agents["Medical Expert"]["criteria"][0]["confidence"] = random.uniform(0.85, 0.95)
                agent_system.agents["Medical Expert"]["criteria"][0]["details"] = "Surgery aligns with medical guidelines for severe knee arthritis after trying other treatments."
                agent_system.add_status_history("Check Complete", "Medical guidelines verified")
                
            # Start ClinicalAgent's second criteria
            if agent_system.agents["Medical Expert"]["criteria"][1]["status"] == "pending":
                agent_system.agents["Medical Expert"]["criteria"][1]["status"] = "processing"
                agent_system.add_status_history("Processing", "Checking if surgery is medically needed")
                
        elif agent_system.progress < 65:
            # Complete ClinicalAgent's second criteria
            if agent_system.agents["Medical Expert"]["criteria"][1]["status"] == "processing":
                agent_system.agents["Medical Expert"]["criteria"][1]["status"] = "complete"
                agent_system.agents["Medical Expert"]["criteria"][1]["confidence"] = random.uniform(0.87, 0.97)
                agent_system.agents["Medical Expert"]["criteria"][1]["details"] = "Surgery is needed based on pain level, limited mobility, and impact on daily activities."
                agent_system.add_status_history("Check Complete", "Medical need confirmed")
                
            # Start ClinicalAgent's third criteria
            if agent_system.agents["Medical Expert"]["criteria"][2]["status"] == "pending":
                agent_system.agents["Medical Expert"]["criteria"][2]["status"] = "processing"
                agent_system.add_status_history("Processing", "Reviewing X-rays")
                
            # Add insights to ClinicalAgent
            if not agent_system.agents["Medical Expert"]["insights"]:
                agent_system.agents["Medical Expert"]["insights"] = [
                    "X-rays show severe arthritis in the knee",
                    "Patient has tried 6+ months of other treatments without success",
                    "Physical therapy notes show decreasing function despite treatment"
                ]
                
        elif agent_system.progress < 70:
            # Complete ClinicalAgent's third criteria
            if agent_system.agents["Medical Expert"]["criteria"][2]["status"] == "processing":
                agent_system.agents["Medical Expert"]["criteria"][2]["status"] = "complete"
                agent_system.agents["Medical Expert"]["criteria"][2]["confidence"] = random.uniform(0.90, 0.98)
                agent_system.agents["Medical Expert"]["criteria"][2]["details"] = "X-rays show severe arthritis with bone-on-bone contact in the knee."
                agent_system.add_status_history("Check Complete", "X-ray review completed")
                
            # Add recommendations to ClinicalAgent
            if not agent_system.agents["Medical Expert"]["recommendations"]:
                agent_system.agents["Medical Expert"]["recommendations"] = [
                    "Recommend approval based on medical findings",
                    "Include X-ray reports with submission",
                    "Document all previous treatments in detail"
                ]
                
            # Update processing stage
            agent_system.processing_stage = "Checking insurance rules and requirements"
                
            # Start PolicyAgent's first criteria
            if agent_system.agents["Insurance Expert"]["criteria"][0]["status"] == "pending":
                agent_system.agents["Insurance Expert"]["criteria"][0]["status"] = "processing"
                agent_system.add_status_history("Processing", "Checking insurance rules")
                
        elif agent_system.progress < 75:
            # Complete PolicyAgent's first criteria
            if agent_system.agents["Insurance Expert"]["criteria"][0]["status"] == "processing":
                agent_system.agents["Insurance Expert"]["criteria"][0]["status"] = "complete"
                agent_system.agents["Insurance Expert"]["criteria"][0]["confidence"] = random.uniform(0.82, 0.94)
                agent_system.agents["Insurance Expert"]["criteria"][0]["details"] = "BCBS policy requirements for knee replacement are satisfied."
                agent_system.add_status_history("Check Complete", "Insurance policy requirements verified")
                
            # Start PolicyAgent's second criteria
            if agent_system.agents["Insurance Expert"]["criteria"][1]["status"] == "pending":
                agent_system.agents["Insurance Expert"]["criteria"][1]["status"] = "processing"
                agent_system.add_status_history("Processing", "Checking if patient tried other treatments first")
                
        elif agent_system.progress < 80:
            # Complete PolicyAgent's second criteria
            if agent_system.agents["Insurance Expert"]["criteria"][1]["status"] == "processing":
                agent_system.agents["Insurance Expert"]["criteria"][1]["status"] = "complete"
                agent_system.agents["Insurance Expert"]["criteria"][1]["confidence"] = random.uniform(0.85, 0.95)
                agent_system.agents["Insurance Expert"]["criteria"][1]["details"] = "Records confirm patient tried physical therapy, medications, and injections first."
                agent_system.add_status_history("Check Complete", "Previous treatments verified")
                
            # Start PolicyAgent's third criteria
            if agent_system.agents["Insurance Expert"]["criteria"][2]["status"] == "pending":
                agent_system.agents["Insurance Expert"]["criteria"][2]["status"] = "processing"
                agent_system.add_status_history("Processing", "Checking if doctor is in-network")
                
            # Add insights to PolicyAgent
            if not agent_system.agents["Insurance Expert"]["insights"]:
                agent_system.agents["Insurance Expert"]["insights"] = [
                    "Patient's plan requires 3+ months of other treatments first (requirement met)",
                    "Similar cases have 94% approval rate with this insurance",
                    "No denials found for this patient in the past"
                ]
                
        elif agent_system.progress < 85:
            # Complete PolicyAgent's third criteria
            if agent_system.agents["Insurance Expert"]["criteria"][2]["status"] == "processing":
                agent_system.agents["Insurance Expert"]["criteria"][2]["status"] = "complete"
                agent_system.agents["Insurance Expert"]["criteria"][2]["confidence"] = random.uniform(0.88, 0.96)
                agent_system.agents["Insurance Expert"]["criteria"][2]["details"] = "Metro Medical Center is in-network with BCBS."
                agent_system.add_status_history("Check Complete", "In-network status verified")
                
            # Add recommendations to PolicyAgent
            if not agent_system.agents["Insurance Expert"]["recommendations"]:
                agent_system.agents["Insurance Expert"]["recommendations"] = [
                    "Submit with all required documents for quick approval",
                    "Include physical therapy and treatment records",
                    "Double-check with BCBS that all requirements are met"
                ]
                
            # Update processing stage
            agent_system.processing_stage = "Making final recommendation"
                
            # Start CoordinationAgent's first criteria
            if agent_system.agents["Care Coordinator"]["criteria"][0]["status"] == "pending":
                agent_system.agents["Care Coordinator"]["criteria"][0]["status"] = "processing"
                agent_system.add_status_history("Processing", "Communicating with doctor")
                
        elif agent_system.progress < 90:
            # Complete CoordinationAgent's first criteria
            if agent_system.agents["Care Coordinator"]["criteria"][0]["status"] == "processing":
                agent_system.agents["Care Coordinator"]["criteria"][0]["status"] = "complete"
                agent_system.agents["Care Coordinator"]["criteria"][0]["confidence"] = random.uniform(0.87, 0.95)
                agent_system.agents["Care Coordinator"]["criteria"][0]["details"] = "Doctor notified about authorization progress. Any additional info will be requested if needed."
                agent_system.add_status_history("Check Complete", "Doctor communication completed")
                
            # Start CoordinationAgent's second criteria
            if agent_system.agents["Care Coordinator"]["criteria"][1]["status"] == "pending":
                agent_system.agents["Care Coordinator"]["criteria"][1]["status"] = "processing"
                agent_system.add_status_history("Processing", "Preparing patient notification")
                
        elif agent_system.progress < 95:
            # Complete CoordinationAgent's second criteria
            if agent_system.agents["Care Coordinator"]["criteria"][1]["status"] == "processing":
                agent_system.agents["Care Coordinator"]["criteria"][1]["status"] = "complete"
                agent_system.agents["Care Coordinator"]["criteria"][1]["confidence"] = random.uniform(0.90, 0.98)
                agent_system.agents["Care Coordinator"]["criteria"][1]["details"] = "Patient notification prepared and ready to send."
                agent_system.add_status_history("Check Complete", "Patient notification prepared")
                
            # Start CoordinationAgent's third criteria
            if agent_system.agents["Care Coordinator"]["criteria"][2]["status"] == "pending":
                agent_system.agents["Care Coordinator"]["criteria"][2]["status"] = "processing"
                agent_system.add_status_history("Processing", "Checking all paperwork is complete")
                
            # Add insights to CoordinationAgent
            if not agent_system.agents["Care Coordinator"]["insights"]:
                agent_system.agents["Care Coordinator"]["insights"] = [
                    "All required documentation is complete and verified",
                    "Similar cases have 94% approval rate with this insurance",
                    "Normal processing time is 2-3 days"
                ]
                
        else:
            # Complete CoordinationAgent's third criteria
            if agent_system.agents["Care Coordinator"]["criteria"][2]["status"] == "processing":
                agent_system.agents["Care Coordinator"]["criteria"][2]["status"] = "complete"
                agent_system.agents["Care Coordinator"]["criteria"][2]["confidence"] = random.uniform(0.92, 0.99)
                agent_system.agents["Care Coordinator"]["criteria"][2]["details"] = "All required paperwork verified. Case is ready for submission."
                agent_system.add_status_history("Check Complete", "All paperwork verified")
                
            # Add recommendations to CoordinationAgent
            if not agent_system.agents["Care Coordinator"]["recommendations"]:
                agent_system.agents["Care Coordinator"]["recommendations"] = [
                    "Approve surgery request based on all findings",
                    "Schedule surgery within 30 days",
                    "Schedule physical therapy for after surgery"
                ]
                
            # Complete the simulation
            if agent_system.progress >= 100 and not st.session_state.simulation_completed:
                agent_system.process_status = "Complete"
                agent_system.add_status_history("Simulation Completed", "All AI helpers have finished their work.")
                
                # Set medical necessity score (85-95 for approval scenario)
                agent_system.medical_necessity_score = random.randint(85, 95)
                
                # Set final approval status
                if agent_system.medical_necessity_score >= 85:
                    agent_system.approval_status = "Approved"
                else:
                    agent_system.approval_status = "Denied"
                
                st.session_state.simulation_completed = True
                st.session_state.simulation_running = False

# Run the simulation step if it's active
if st.session_state.simulation_running:
    run_simulation_step()
    time.sleep(0.2 / st.session_state.simulation_speed)
    st.rerun()

    margin-right: 10px;
    font-size: 16px;
    }
    .insight-item {
        padding: 10px;
        border-radius: 8px;
        margin-bottom: 8px;
        background-color: #f1f5f9;
        font-size: 14px;
    }
    .progress-bar-container {
        width: 100%;
        height: 6px;
        background-color: #e2e8f0;
        border-radius: 3px;
        margin: 15px 0;
    }
    .progress-bar {
        height: 100%;
        border-radius: 3px;
        background: linear-gradient(90deg, #3b82f6, #10b981);
        transition: width 0.5s ease;
    }
    .tab-content {
        padding: 20px;
        background-color: white;
        border-radius: 0 10px 10px 10px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    }
    .animated-card {
        animation: fadeIn 0.5s ease-in-out;
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    div[data-testid="stSidebarNav"] {
        background-image: linear-gradient(#3b82f6, #10b981);
        padding-top: 20px;
        border-radius: 0 15px 15px 0;
    }
    .custom-progress-label {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 5px;
    }
    /* Timeline CSS */
    .timeline-item {
        position: relative;
        padding-left: 30px;
        margin-bottom: 15px;
    }
    .timeline-item:before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 2px;
        background: #e2e8f0;
    }
    .timeline-item:after {
        content: '';
        position: absolute;
        left: -4px;
        top: 0;
        height: 10px;
        width: 10px;
        border-radius: 50%;
        background: #3b82f6;
    }
    .timeline-content {
        padding: 10px 15px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    }
    .timeline-time {
        font-size: 12px;
        color: #64748b;
        margin-bottom: 5px;
    }
    /* Custom tooltips */
    .tooltip {
        position: relative;
        display: inline-block;
        cursor: pointer;
    }
    .tooltip .tooltiptext {
        visibility: hidden;
        width: 200px;
        background-color: #0f172a;
        color: #fff;
        text-align: center;
        border-radius: 6px;
        padding: 10px;
        position: absolute;
        z-index: 1;
        bottom: 125%;
        left: 50%;
        margin-left: -100px;
        opacity: 0;
        transition: opacity 0.3s;
    }
    .tooltip:hover .tooltiptext {
        visibility: visible;
        opacity: 1;
    }
    /* Gauges */
    .gauge-container {
        position: relative;
        width: 100%;
        text-align: center;
    }
    .gauge-value {
        position: absolute;
        top: 60%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 22px;
        font-weight: 700;
    }
    .gauge-label {
        position: absolute;
        top: 80%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 14px;
        color: #64748b;
    }
</style>
""", unsafe_allow_html=True)

# Demo data
class AgentSystem:
    def __init__(self):
        self.agents = {
            "IntakeAgent": {
                "icon": "📋",
                "specialty": "Patient Intake & Insurance Verification",
                "color": "#3b82f6",
                "criteria": [
                    {"name": "Insurance Verification", "status": "pending", "confidence": 0.0, "details": ""},
                    {"name": "Patient Demographics Validation", "status": "pending", "confidence": 0.0, "details": ""},
                    {"name": "Procedure Code Validation", "status": "pending", "confidence": 0.0, "details": ""}
                ],
                "insights": [],
                "recommendations": []
            },
            "ClinicalAgent": {
                "icon": "🩺",
                "specialty": "Clinical Criteria Analysis",
                "color": "#8b5cf6",
                "criteria": [
                    {"name": "Clinical Guidelines Alignment", "status": "pending", "confidence": 0.0, "details": ""},
                    {"name": "Medical Necessity Verification", "status": "pending", "confidence": 0.0, "details": ""},
                    {"name": "MRI/Imaging Review", "status": "pending", "confidence": 0.0, "details": ""}
                ],
                "insights": [],
                "recommendations": []
            },
            "PolicyAgent": {
                "icon": "📝",
                "specialty": "Payer Policy Analysis",
                "color": "#ec4899",
                "criteria": [
                    {"name": "Payer-Specific Requirements", "status": "pending", "confidence": 0.0, "details": ""},
                    {"name": "Prior Treatment Verification", "status": "pending", "confidence": 0.0, "details": ""},
                    {"name": "Network Provider Validation", "status": "pending", "confidence": 0.0, "details": ""}
                ],
                "insights": [],
                "recommendations": []
            },
            "CoordinationAgent": {
                "icon": "🔄",
                "specialty": "Care Coordination",
                "color": "#10b981",
                "criteria": [
                    {"name": "Provider Communication", "status": "pending", "confidence": 0.0, "details": ""},
                    {"name": "Patient Notification", "status": "pending", "confidence": 0.0, "details": ""},
                    {"name": "Documentation Completeness", "status": "pending", "confidence": 0.0, "details": ""}
                ],
                "insights": [],
                "recommendations": []
            }
        }
        
        self.process_status = "Not Started"
        self.progress = 0
        self.status_history = []
        self.approval_status = "Pending"
        self.medical_necessity_score = 0
        self.processing_stage = ""
        self.completion_time = None
        self.patient_data = {
            "name": "Michael Anderson",
            "age": 57,
            "gender": "Male",
            "insurance": "Blue Cross Blue Shield",
            "policy_number": "BCBS-3825719",
            "procedure": "Total Knee Arthroplasty",
            "diagnosis": "Severe Osteoarthritis, Right Knee",
            "cpt_code": "27447",
            "icd_10": "M17.11",
            "provider": "Dr. Sarah Johnson",
            "facility": "Metropolitan Orthopedic Center"
        }
        
    def reset(self):
        for agent_name in self.agents:
            for criteria in self.agents[agent_name]["criteria"]:
                criteria["status"] = "pending"
                criteria["confidence"] = 0.0
                criteria["details"] = ""
            self.agents[agent_name]["insights"] = []
            self.agents[agent_name]["recommendations"] = []
        
        self.process_status = "Not Started"
        self.progress = 0
        self.status_history = []
        self.approval_status = "Pending"
        self.medical_necessity_score = 0
        self.processing_stage = ""
        self.completion_time = None
    
    def update_progress(self, increment):
        self.progress += increment
        if self.progress > 100:
            self.progress = 100
            
    def add_status_history(self, status, details):
        self.status_history.append({
            "timestamp": datetime.now().strftime("%H:%M:%S"),
            "status": status,
            "details": details
        })

# Initialize session state for simulation control
if 'agent_system' not in st.session_state:
    st.session_state.agent_system = AgentSystem()
    
if 'simulation_running' not in st.session_state:
    st.session_state.simulation_running = False
    
if 'simulation_completed' not in st.session_state:
    st.session_state.simulation_completed = False
    
if 'simulation_speed' not in st.session_state:
    st.session_state.simulation_speed = 2.0  # Default speed multiplier


# Header
st.markdown("""
<div style="display: flex; align-items: center; margin-bottom: 20px;">
    <div style="background: linear-gradient(45deg, #3b82f6, #10b981); padding: 15px; border-radius: 15px; margin-right: 20px;">
        <h1 style="color: white; margin: 0; font-size: 32px;">🤖</h1>
    </div>
    <div>
        <h1 style="margin: 0; color: #0f172a;">Ron AI</h1>
        <p style="margin: 0; color: #64748b;">AI-Powered Prior Authorization Agent Workflow</p>
    </div>
</div>
""", unsafe_allow_html=True)

# Create columns for patient info and simulation controls
col1, col2 = st.columns([2, 1])

with col1:
    st.markdown("### Patient Case Details")
    
    patient_data = st.session_state.agent_system.patient_data
    
    patient_cols = st.columns(2)
    
    with patient_cols[0]:
        st.markdown(f"""
        <div class="metric-card">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <div style="background: linear-gradient(45deg, #3b82f6, #10b981); color: white; padding: 8px; border-radius: 8px; margin-right: 10px;">👤</div>
                <div>
                    <div style="font-weight: 600; font-size: 18px;">{patient_data['name']}</div>
                    <div style="color: #64748b; font-size: 14px;">{patient_data['age']} y/o {patient_data['gender']}</div>
                </div>
            </div>
            <div style="display: flex; margin-bottom: 8px;">
                <div style="width: 40%; font-weight: 500; color: #64748b;">Diagnosis:</div>
                <div style="width: 60%;">{patient_data['diagnosis']}</div>
            </div>
            <div style="display: flex; margin-bottom: 8px;">
                <div style="width: 40%; font-weight: 500; color: #64748b;">ICD-10:</div>
                <div style="width: 60%;">{patient_data['icd_10']}</div>
            </div>
            <div style="display: flex; margin-bottom: 8px;">
                <div style="width: 40%; font-weight: 500; color: #64748b;">Procedure:</div>
                <div style="width: 60%;">{patient_data['procedure']}</div>
            </div>
            <div style="display: flex; margin-bottom: 8px;">
                <div style="width: 40%; font-weight: 500; color: #64748b;">CPT Code:</div>
                <div style="width: 60%;">{patient_data['cpt_code']}</div>
            </div>
        </div>
        """, unsafe_allow_html=True)
    
    with patient_cols[1]:
        st.markdown(f"""
        <div class="metric-card">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <div style="background: linear-gradient(45deg, #3b82f6, #10b981); color: white; padding: 8px; border-radius: 8px; margin-right: 10px;">🏥</div>
                <div>
                    <div style="font-weight: 600; font-size: 18px;">{patient_data['provider']}</div>
                    <div style="color: #64748b; font-size: 14px;">{patient_data['facility']}</div>
                </div>
            </div>
            <div style="display: flex; margin-bottom: 8px;">
                <div style="width: 40%; font-weight: 500; color: #64748b;">Insurance:</div>
                <div style="width: 60%;">{patient_data['insurance']}</div>
            </div>
            <div style="display: flex; margin-bottom: 8px;">
                <div style="width: 40%; font-weight: 500; color: #64748b;">Policy #:</div>
                <div style="width: 60%;">{patient_data['policy_number']}</div>
            </div>
            <div style="display: flex; margin-bottom: 8px;">
                <div style="width: 40%; font-weight: 500; color: #64748b;">Request Date:</div>
                <div style="width: 60%;">{datetime.now().strftime("%m/%d/%Y")}</div>
            </div>
            <div style="display: flex; margin-bottom: 8px;">
                <div style="width: 40%; font-weight: 500; color: #64748b;">Status:</div>
                <div style="width: 60%;">
                    <span class="status-badge" style="background-color: #fef3c7; color: #92400e;">
                        {st.session_state.agent_system.approval_status}
                    </span>
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)

with col2:
    st.markdown("### Simulation Controls")
    
    # Create a card with gradient background for simulation controls
    st.markdown("""
    <div style="background: linear-gradient(120deg, #f0f9ff, #e0f2fe); padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        <h4 style="margin-top: 0; color: #0f172a;">AI Agent Simulation</h4>
        <p style="color: #64748b; font-size: 14px;">
            Run the simulation to see how Ron AI's agents work together to process a prior authorization request.
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    # Simulation controls
    col_speed, col_button = st.columns([1, 1])
    
    with col_speed:
        st.session_state.simulation_speed = st.slider(
            "Simulation Speed", 
            min_value=0.5, 
            max_value=5.0, 
            value=st.session_state.simulation_speed,
            step=0.5,
            format="%.1fx",
            disabled=st.session_state.simulation_running
        )
    
    with col_button:
        if not st.session_state.simulation_running and not st.session_state.simulation_completed:
            if st.button("Start Simulation", key="start_simulation", use_container_width=True):
                st.session_state.simulation_running = True
                st.session_state.agent_system.reset()
                st.session_state.agent_system.process_status = "Running"
                st.session_state.agent_system.add_status_history("Simulation Started", "Initializing AI agents for prior authorization analysis.")
        elif st.session_state.simulation_running:
            if st.button("Stop Simulation", key="stop_simulation", use_container_width=True):
                st.session_state.simulation_running = False
                st.session_state.agent_system.process_status = "Stopped"
                st.session_state.agent_system.add_status_history("Simulation Stopped", "User manually stopped the simulation.")
        else:
            if st.button("Reset Simulation", key="reset_simulation", use_container_width=True):
                st.session_state.simulation_running = False
                st.session_state.simulation_completed = False
                st.session_state.agent_system.reset()
                st.session_state.agent_system.add_status_history("Simulation Reset", "Preparing for new analysis.")

    # Show current status
    st.markdown(f"""
    <div style="margin-top: 15px;">
        <div class="custom-progress-label">Current Status: {st.session_state.agent_system.process_status}</div>
        <div class="progress-bar-container">
            <div class="progress-bar" style="width: {st.session_state.agent_system.progress}%;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #64748b;">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
        </div>
    </div>
    """, unsafe_allow_html=True)

    if st.session_state.agent_system.processing_stage:
        st.markdown(f"""
        <div style="margin-top: 10px; padding: 10px; background-color: #f1f5f9; border-radius: 5px; font-size: 14px;">
            <div style="font-weight: 600; margin-bottom: 5px;">Current Stage:</div>
            <div>{st.session_state.agent_system.processing_stage}</div>
        </div>
        """, unsafe_allow_html=True)

# Main content with tabs
tab1, tab2, tab3 = st.tabs(["AI Agent Analysis", "Timeline & Process Flow", "Case Summary"])

# Tab 1: AI Agent Analysis
with tab1:
    # Status cards at the top
    if st.session_state.simulation_completed:
        metric_cols = st.columns(4)
        
        with metric_cols[0]:
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-label">Medical Necessity Score</div>
                <div class="metric-value" style="color: {'#10b981' if st.session_state.agent_system.medical_necessity_score >= 85 else '#f59e0b' if st.session_state.agent_system.medical_necessity_score >= 70 else '#ef4444'};">
                    {st.session_state.agent_system.medical_necessity_score}%
                </div>
                <div style="height: 4px; background-color: #e2e8f0; border-radius: 2px; margin-top: 10px;">
                    <div style="height: 100%; width: {st.session_state.agent_system.medical_necessity_score}%; background: linear-gradient(90deg, #3b82f6, #10b981); border-radius: 2px;"></div>
                </div>
            </div>
            """, unsafe_allow_html=True)
            
        with metric_cols[1]:
            # Calculate average confidence across all criteria
            all_confidences = []
            for agent_name, agent_data in st.session_state.agent_system.agents.items():
                for criteria in agent_data["criteria"]:
                    if criteria["status"] == "complete":
                        all_confidences.append(criteria["confidence"])
            
            avg_confidence = sum(all_confidences) / len(all_confidences) if all_confidences else 0
            
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-label">Average AI Confidence</div>
                <div class="metric-value" style="color: #3b82f6;">
                    {avg_confidence:.2f}
                </div>
                <div style="height: 4px; background-color: #e2e8f0; border-radius: 2px; margin-top: 10px;">
                    <div style="height: 100%; width: {avg_confidence * 100}%; background: linear-gradient(90deg, #3b82f6, #10b981); border-radius: 2px;"></div>
                </div>
            </div>
            """, unsafe_allow_html=True)
            
        with metric_cols[2]:
            approval_color = "#10b981" if st.session_state.agent_system.approval_status == "Approved" else "#ef4444" if st.session_state.agent_system.approval_status == "Denied" else "#f59e0b"
            approval_text = st.session_state.agent_system.approval_status
            
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-label">Authorization Status</div>
                <div class="metric-value" style="color: {approval_color};">
                    {approval_text}
                </div>
                <div style="font-size: 12px; color: #64748b; margin-top: 10px;">
                    {'Based on comprehensive AI agent analysis' if st.session_state.simulation_completed else 'Awaiting final determination'}
                </div>
            </div>
            """, unsafe_allow_html=True)
            
        with metric_cols[3]:
            # Calculate time to completion
            start_time = None
            end_time = None
            
            for event in st.session_state.agent_system.status_history:
                if "Started" in event["status"]:
                    start_time = datetime.strptime(event["timestamp"], "%H:%M:%S")
                if "Completed" in event["status"]:
                    end_time = datetime.strptime(event["timestamp"], "%H:%M:%S")
            
            if start_time and end_time:
                completion_time = (end_time - start_time).total_seconds()
                formatted_time = f"{int(completion_time)} seconds"
            else:
                formatted_time = "N/A"
            
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-label">Processing Time</div>
                <div class="metric-value" style="color: #8b5cf6;">
                    {formatted_time}
                </div>
                <div style="font-size: 12px; color: #64748b; margin-top: 10px;">
                    Compared to 30+ minutes with manual processing
                </div>
            </div>
            """, unsafe_allow_html=True)

    # Agent cards
    st.markdown("### AI Agent Analysis")
    agent_cols = st.columns(2)
    
    for i, (agent_name, agent_data) in enumerate(st.session_state.agent_system.agents.items()):
        with agent_cols[i % 2]:
            # Calculate agent progress
            total_criteria = len(agent_data["criteria"])
            completed_criteria = sum(1 for c in agent_data["criteria"] if c["status"] == "complete")
            agent_progress = (completed_criteria / total_criteria) * 100 if total_criteria > 0 else 0
            
            # Determine agent status
            agent_status = "Active" if st.session_state.simulation_running and agent_progress < 100 else "Complete" if agent_progress == 100 else "Pending"
            status_color = "#10b981" if agent_status == "Complete" else "#3b82f6" if agent_status == "Active" else "#94a3b8"
            
            st.markdown(f"""
            <div class="agent-card" style="border-top: 4px solid {agent_data['color']}; background-color: white;">
                <div class="agent-header">
                    <div class="agent-icon" style="background: linear-gradient(45deg, {agent_data['color']}, {agent_data['color']}dd);">
                        {agent_data['icon']}
                    </div>
                    <div>
                        <h3 style="margin: 0; font-size: 18px;">{agent_name}</h3>
                        <p style="margin: 0; color: #64748b; font-size: 14px;">{agent_data['specialty']}</p>
                    </div>
                    <div class="agent-status" style="background-color: {status_color}33; color: {status_color};">
                        {agent_status}
                    </div>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span style="font-size: 14px; font-weight: 500;">Analysis Progress</span>
                        <span style="font-size: 14px; color: #64748b;">{completed_criteria}/{total_criteria} criteria</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: {agent_progress}%; background: linear-gradient(90deg, {agent_data['color']}bb, {agent_data['color']});"></div>
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h4 style="font-size: 15px; margin-bottom: 10px;">Verification Criteria</h4>
                    <div>
            """, unsafe_allow_html=True)
            
            for criteria in agent_data["criteria"]:
                criteria_status_color = "#10b981" if criteria["status"] == "complete" else "#3b82f6" if criteria["status"] == "processing" else "#94a3b8"
                criteria_bg_color = f"{criteria_status_color}10"
                
                criteria_icon = "✅" if criteria["status"] == "complete" else "⏳" if criteria["status"] == "processing" else "⏱️"
                
                confidence_display = f"{criteria['confidence']:.2f}" if criteria["status"] == "complete" else "N/A"
                
                st.markdown(f"""
                <div class="criteria-item" style="background-color: {criteria_bg_color}; border-left: 3px solid {criteria_status_color};">
                    <div class="criteria-icon">
                        {criteria_icon}
                    </div>
                    <div style="flex-grow: 1;">
                        <div style="font-weight: 500; margin-bottom: 2px;">{criteria["name"]}</div>
                        <div style="font-size: 12px; color: #64748b;">
                            {criteria["details"] if criteria["details"] else "Pending analysis..."}
                        </div>
                    </div>
                    <div style="text-align: right; padding-left: 10px;">
                        <div style="font-size: 12px; color: #64748b; margin-bottom: 2px;">Confidence</div>
                        <div style="font-weight: 600; color: {criteria_status_color};">
                            {confidence_display}
                        </div>
                    </div>
                </div>
                """, unsafe_allow_html=True)
            
            st.markdown("</div></div>", unsafe_allow_html=True)
            
            # Display insights if there are any
            if agent_data["insights"]:
                st.markdown(f"""
                <div style="margin-bottom: 15px;">
                    <h4 style="font-size: 15px; margin-bottom: 10px;">AI Insights</h4>
                    <div>
                """, unsafe_allow_html=True)
                
                for insight in agent_data["insights"]:
                    st.markdown(f"""
                    <div class="insight-item">
                        <div style="display: flex; align-items: flex-start;">
                            <div style="color: {agent_data['color']}; margin-right: 8px;">💡</div>
                            <div>{insight}</div>
                        </div>
                    </div>
                    """, unsafe_allow_html=True)
                
                st.markdown("</div></div>", unsafe_allow_html=True)
            
            # Display recommendations if there are any
            if agent_data["recommendations"]:
                st.markdown(f"""
                <div>
                    <h4 style="font-size: 15px; margin-bottom: 10px;">Recommendations</h4>
                    <div>
                """, unsafe_allow_html=True)
                
                for recommendation in agent_data["recommendations"]:
                    st.markdown(f"""
                    <div class="insight-item" style="background-color: {agent_data['color']}10; border-left: 3px solid {agent_data['color']};">
                        <div style="display: flex; align-items: flex-start;">
                            <div style="color: {agent_data['color']}; margin-right: 8px;">→</div>
                            <div>{recommendation}</div>
                        </div>
                    </div>
                    """, unsafe_allow_html=True)
                
                st.markdown("</div></div>", unsafe_allow_html=True)
            
            st.markdown("</div>", unsafe_allow_html=True)

# Tab 2: Timeline & Process Flow
with tab2:
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.markdown("### Process Timeline")
        
        if not st.session_state.agent_system.status_history:
            st.info("Timeline will appear once the simulation is running.")
        else:
            st.markdown("""
            <div style="padding: 20px; background-color: white; border-radius: 10px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);">
            """, unsafe_allow_html=True)
            
            for i, event in enumerate(st.session_state.agent_system.status_history):
                status_icon = "✅" if "Complete" in event["status"] else "⚠️" if "Error" in event["status"] else "⏱️" if "Pending" in event["status"] else "🔄"
                
                st.markdown(f"""
                <div class="timeline-item" style="animation-delay: {i * 0.1}s;">
                    <div class="timeline-content">
                        <div class="timeline-time">{event["timestamp"]}</div>
                        <div style="font-weight: 500; margin-bottom: 3px;">
                            {status_icon} {event["status"]}
                        </div>
                        <div style="font-size: 14px; color: #64748b;">
                            {event["details"]}
                        </div>
                    </div>
                </div>
                """, unsafe_allow_html=True)
            
            st.markdown("</div>", unsafe_allow_html=True)

    with col2:
        st.markdown("### AI Agent Process Flow")
        
        # Create a network diagram showing agent interactions
        if st.session_state.simulation_completed:
            # Create nodes for the process flow diagram
            nodes = [
                {"id": "Patient", "label": "Patient Case", "color": "#3b82f6", "shape": "dot", "size": 15},
                {"id": "IntakeAgent", "label": "Intake Agent", "color": st.session_state.agent_system.agents["IntakeAgent"]["color"], "shape": "dot", "size": 20},
                {"id": "ClinicalAgent", "label": "Clinical Agent", "color": st.session_state.agent_system.agents["ClinicalAgent"]["color"], "shape": "dot", "size": 20},
                {"id": "PolicyAgent", "label": "Policy Agent", "color": st.session_state.agent_system.agents["PolicyAgent"]["color"], "shape": "dot", "size": 20},
                {"id": "CoordinationAgent", "label": "Coordination Agent", "color": st.session_state.agent_system.agents["CoordinationAgent"]["color"], "shape": "dot", "size": 20},
                {"id": "Decision", "label": "Final Decision", "color": "#10b981", "shape": "dot", "size": 15}
            ]
            
            # Create edges for the process flow diagram
            edges = [
                {"from": "Patient", "to": "IntakeAgent", "width": 2, "label": "Patient Data"},
                {"from": "IntakeAgent", "to": "ClinicalAgent", "width": 2, "label": "Verified Data"},
                {"from": "IntakeAgent", "to": "PolicyAgent", "width": 2, "label": "Insurance Info"},
                {"from": "ClinicalAgent", "to": "PolicyAgent", "width": 2, "label": "Clinical Criteria"},
                {"from": "PolicyAgent", "to": "CoordinationAgent", "width": 2, "label": "Policy Review"},
                {"from": "ClinicalAgent", "to": "CoordinationAgent", "width": 2, "label": "Clinical Review"},
                {"from": "CoordinationAgent", "to": "Decision", "width": 2, "label": "Recommendation"}
            ]
            
            # Create a network diagram with Plotly
            fig = go.Figure()
            
            # Add nodes
            for node in nodes:
                fig.add_trace(go.Scatter(
                    x=[0],
                    y=[0],
                    mode='markers',
                    marker=dict(
                        size=node["size"] * 2,
                        color=node["color"],
                        line=dict(width=1, color='white')
                    ),
                    name=node["label"],
                    hoverinfo='text',
                    text=node["label"]
                ))
            
            # Set layout
            fig.update_layout(
                title="AI Agent Interaction Flow",
                showlegend=True,
                hovermode='closest',
                margin=dict(b=20, l=5, r=5, t=40),
                xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
                yaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
                height=500,
                template="plotly_white"
            )
            
            # Show the diagram
            st.plotly_chart(fig, use_container_width=True)
        else:
            st.info("Process flow visualization will appear once the simulation is completed.")
            
        # Add explanation
        st.markdown("""
        <div style="padding: 15px; background-color: #f8fafc; border-radius: 8px; margin-top: 20px; font-size: 14px;">
            <p style="margin-top: 0;"><strong>How Ron AI Agents Collaborate:</strong></p>
            <ol style="margin-bottom: 0; padding-left: 20px;">
                <li><strong>Intake Agent</strong> verifies patient demographics and insurance information</li>
                <li><strong>Clinical Agent</strong> analyzes medical necessity based on clinical guidelines</li>
                <li><strong>Policy Agent</strong> evaluates payer-specific requirements and policies</li>
                <li><strong>Coordination Agent</strong> synthesizes all analyses for final determination</li>
            </ol>
        </div>
        """, unsafe_allow_html=True)

# Tab 3: Case Summary
with tab3:
    if st.session_state.simulation_completed:
        # Create columns for the summary
        col1, col2 = st.columns([2, 1])
        
        with col1:
            st.markdown("### Authorization Summary")
            
            approval_status = st.session_state.agent_system.approval_status
            status_color = "#10b981" if approval_status == "Approved" else "#ef4444" if approval_status == "Denied" else "#f59e0b"
            
            summary_insights = [
                "Patient meets medical necessity criteria for Total Knee Arthroplasty",
                "Proper conservative treatment documented, including physical therapy",
                "All required prior authorization documentation is complete",
                "Procedure is covered under patient's insurance policy"
            ] if st.session_state.agent_system.medical_necessity_score >= 85 else [
                "Additional clinical documentation may be required",
                "Insurance policy coverage verification needed",
                "Consider alternative treatment options",
                "Recommend appeal process with additional evidence"
            ]
            
            recommendations = [
                "Proceed with scheduling the procedure",
                "Document post-operative care plan in patient record",
                "Schedule follow-up appointment for 2 weeks post-surgery"
            ] if st.session_state.agent_system.medical_necessity_score >= 85 else [
                "Request additional documentation from provider",
                "Schedule peer-to-peer review with medical director",
                "Consider alternative treatment options"
            ]
            
            st.markdown(f"""
            <div style="background-color: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);">
                <div style="display: flex; align-items: center; margin-bottom: 20px;">
                    <div style="background-color: {status_color}; color: white; font-weight: 600; padding: 8px 16px; border-radius: 20px; margin-right: 15px;">
                        {approval_status}
                    </div>
                    <div>
                        <div style="font-weight: 600; font-size: 18px;">{st.session_state.agent_system.patient_data['procedure']}</div>
                        <div style="color: #64748b;">{st.session_state.agent_system.patient_data['diagnosis']}</div>
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h4 style="font-size: 16px; margin-bottom: 12px;">Key Insights</h4>
                    <div>
            """, unsafe_allow_html=True)
            
            for insight in summary_insights:
                st.markdown(f"""
                <div style="display: flex; align-items: flex-start; margin-bottom: 10px;">
                    <div style="color: #3b82f6; margin-right: 10px;">•</div>
                    <div>{insight}</div>
                </div>
                """, unsafe_allow_html=True)
            
            st.markdown(f"""
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h4 style="font-size: 16px; margin-bottom: 12px;">Recommendations</h4>
                    <div>
            """, unsafe_allow_html=True)
            
            for recommendation in recommendations:
                st.markdown(f"""
                <div style="display: flex; align-items: flex-start; margin-bottom: 10px;">
                    <div style="color: #10b981; margin-right: 10px;">→</div>
                    <div>{recommendation}</div>
                </div>
                """, unsafe_allow_html=True)
            
            st.markdown(f"""
                    </div>
                </div>
                
                <div>
                    <h4 style="font-size: 16px; margin-bottom: 12px;">Authorization Details</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div style="padding: 12px; background-color: #f8fafc; border-radius: 8px;">
                            <div style="font-size: 12px; color: #64748b;">Procedure Code</div>
                            <div style="font-weight: 500;">{st.session_state.agent_system.patient_data['cpt_code']}</div>
                        </div>
                        <div style="padding: 12px; background-color: #f8fafc; border-radius: 8px;">
                            <div style="font-size: 12px; color: #64748b;">Diagnosis Code</div>
                            <div style="font-weight: 500;">{st.session_state.agent_system.patient_data['icd_10']}</div>
                        </div>
                        <div style="padding: 12px; background-color: #f8fafc; border-radius: 8px;">
                            <div style="font-size: 12px; color: #64748b;">Authorization ID</div>
                            <div style="font-weight: 500;">AUTH-{random.randint(100000, 999999)}</div>
                        </div>
                        <div style="padding: 12px; background-color: #f8fafc; border-radius: 8px;">
                            <div style="font-size: 12px; color: #64748b;">Effective Date</div>
                            <div style="font-weight: 500;">{(datetime.now() + timedelta(days=2)).strftime("%m/%d/%Y")}</div>
                        </div>
                        <div style="padding: 12px; background-color: #f8fafc; border-radius: 8px;">
                            <div style="font-size: 12px; color: #64748b;">Expiration Date</div>
                            <div style="font-weight: 500;">{(datetime.now() + timedelta(days=90)).strftime("%m/%d/%Y")}</div>
                        </div>
                        <div style="padding: 12px; background-color: #f8fafc; border-radius: 8px;">
                            <div style="font-size: 12px; color: #64748b;">Decision Time</div>
                            <div style="font-weight: 500;">
                                {
                                    f"{int((datetime.strptime(st.session_state.agent_system.status_history[-1]['timestamp'], '%H:%M:%S') - datetime.strptime(st.session_state.agent_system.status_history[0]['timestamp'], '%H:%M:%S')).total_seconds())} seconds" 
                                    if len(st.session_state.agent_system.status_history) > 1 
                                    else "N/A"
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            """, unsafe_allow_html=True)
        
        with col2:
            st.markdown("### Performance Metrics")
            
            # Create gauge charts for key metrics
            fig = go.Figure()
            
            # Medical Necessity Score Gauge
            fig.add_trace(go.Indicator(
                mode="gauge+number",
                value=st.session_state.agent_system.medical_necessity_score,
                title={"text": "Medical Necessity"},
                gauge={
                    "axis": {"range": [0, 100], "tickwidth": 1, "tickcolor": "darkblue"},
                    "bar": {"color": "#3b82f6"},
                    "steps": [
                        {"range": [0, 60], "color": "#fee2e2"},
                        {"range": [60, 80], "color": "#fef3c7"},
                        {"range": [80, 100], "color": "#dcfce7"}
                    ],
                    "threshold": {
                        "line": {"color": "black", "width": 2},
                        "thickness": 0.75,
                        "value": 85
                    }
                },
                domain={"row": 0, "column": 0}
            ))
            
            # Calculate average confidence
            all_confidences = []
            for agent_name, agent_data in st.session_state.agent_system.agents.items():
                for criteria in agent_data["criteria"]:
                    if criteria["status"] == "complete":
                        all_confidences.append(criteria["confidence"])
            
            avg_confidence = sum(all_confidences) / len(all_confidences) if all_confidences else 0
            
            # AI Confidence Gauge
            fig.add_trace(go.Indicator(
                mode="gauge+number",
                value=avg_confidence * 100,
                title={"text": "AI Confidence"},
                gauge={
                    "axis": {"range": [0, 100], "tickwidth": 1, "tickcolor": "darkblue"},
                    "bar": {"color": "#8b5cf6"},
                    "steps": [
                        {"range": [0, 60], "color": "#fee2e2"},
                        {"range": [60, 80], "color": "#fef3c7"},
                        {"range": [80, 100], "color": "#dcfce7"}
                    ],
                    "threshold": {
                        "line": {"color": "black", "width": 2},
                        "thickness": 0.75,
                        "value": 90
                    }
                },
                domain={"row": 1, "column": 0}
            ))
            
            # Approval Likelihood Gauge (based on medical necessity score)
            approval_likelihood = 0
            if st.session_state.agent_system.medical_necessity_score >= 90:
                approval_likelihood = 95
            elif st.session_state.agent_system.medical_necessity_score >= 85:
                approval_likelihood = 85
            elif st.session_state.agent_system.medical_necessity_score >= 80:
                approval_likelihood = 70
            elif st.session_state.agent_system.medical_necessity_score >= 70:
                approval_likelihood = 50
            else:
                approval_likelihood = 30
            
            fig.add_trace(go.Indicator(
                mode="gauge+number",
                value=approval_likelihood,
                title={"text": "Approval Likelihood"},
                gauge={
                    "axis": {"range": [0, 100], "tickwidth": 1, "tickcolor": "darkblue"},
                    "bar": {"color": "#10b981"},
                    "steps": [
                        {"range": [0, 60], "color": "#fee2e2"},
                        {"range": [60, 80], "color": "#fef3c7"},
                        {"range": [80, 100], "color": "#dcfce7"}
                    ],
                    "threshold": {
                        "line": {"color": "black", "width": 2},
                        "thickness": 0.75,
                        "value": 80
                    }
                },
                domain={"row": 2, "column": 0}
            ))
            
            # Update layout
            fig.update_layout(
                grid={"rows": 3, "columns": 1, "pattern": "independent"},
                height=600,
                margin=dict(l=30, r=30, t=30, b=30),
            )
            
            st.plotly_chart(fig, use_container_width=True)
            
            # Add comparison to manual processing
            st.markdown("""
            <div style="padding: 15px; background-color: #f1f9ff; border-radius: 8px; margin-top: 10px;">
                <h4 style="margin-top: 0; font-size: 16px;">AI vs. Manual Processing</h4>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <div style="font-weight: 500;">Ron AI Processing Time:</div>
                    <div style="font-weight: 600; color: #3b82f6;">~15 seconds</div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <div style="font-weight: 500;">Traditional Processing:</div>
                    <div style="font-weight: 600; color: #64748b;">30+ minutes</div>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <div style="font-weight: 500;">Time Savings:</div>
                    <div style="font-weight: 600; color: #10b981;">99%</div>
                </div>
            </div>
            """, unsafe_allow_html=True)
    else:
        st.info("Case summary will be generated once the simulation is completed.")

# Run the simulation
def run_simulation_step():
    if not st.session_state.simulation_running:
        return
    
    agent_system = st.session_state.agent_system
    
    # Update progress
    if agent_system.progress < 100:
        speed_factor = st.session_state.simulation_speed
        progress_increment = random.uniform(1.0, 3.0) * speed_factor
        agent_system.update_progress(progress_increment)
        
        # Process stages
        if agent_system.progress < 20:
            agent_system.processing_stage = "Initializing agents and retrieving patient data"
            
            # Start IntakeAgent's first criteria
            if agent_system.agents["IntakeAgent"]["criteria"][0]["status"] == "pending":
                agent_system.agents["IntakeAgent"]["criteria"][0]["status"] = "processing"
                agent_system.add_status_history("Processing", "Verifying insurance information")
                
        elif agent_system.progress < 30:
            # Complete IntakeAgent's first criteria
            if agent_system.agents["IntakeAgent"]["criteria"][0]["status"] == "processing":
                agent_system.agents["IntakeAgent"]["criteria"][0]["status"] = "complete"
                agent_system.agents["IntakeAgent"]["criteria"][0]["confidence"] = random.uniform(0.85, 0.95)
                agent_system.agents["IntakeAgent"]["criteria"][0]["details"] = "Coverage confirmed with Blue Cross Blue Shield. Policy #BCBS-3825719 active."
                agent_system.add_status_history("Verification Complete", "Insurance coverage verified and confirmed active")
                
            # Start IntakeAgent's second criteria
            if agent_system.agents["IntakeAgent"]["criteria"][1]["status"] == "pending":
                agent_system.agents["IntakeAgent"]["criteria"][1]["status"] = "processing"
                agent_system.add_status_history("Processing", "Validating patient demographics")
                
        elif agent_system.progress < 40:
            # Complete IntakeAgent's second criteria
            if agent_system.agents["IntakeAgent"]["criteria"][1]["status"] == "processing":
                agent_system.agents["IntakeAgent"]["criteria"][1]["status"] = "complete"
                agent_system.agents["IntakeAgent"]["criteria"][1]["confidence"] = random.uniform(0.90, 0.98)
                agent_system.agents["IntakeAgent"]["criteria"][1]["details"] = "Patient demographics verified in system and match insurance records."
                agent_system.add_status_history("Verification Complete", "Patient demographics validated successfully")
                
            # Start IntakeAgent's third criteria
            if agent_system.agents["IntakeAgent"]["criteria"][2]["status"] == "pending":
                agent_system.agents["IntakeAgent"]["criteria"][2]["status"] = "processing"
                agent_system.add_status_history("Processing", "Validating procedure and diagnosis codes")
                
            # Add insights and recommendations to IntakeAgent
            if not agent_system.agents["IntakeAgent"]["insights"]:
                agent_system.agents["IntakeAgent"]["insights"] = [
                    "Patient has been with BCBS for 3+ years with consistent coverage",
                    "No prior authorization flags found in patient's insurance history",
                    "Patient demographics verified across all systems"
                ]
                
            if not agent_system.agents["IntakeAgent"]["recommendations"]:
                agent_system.agents["IntakeAgent"]["recommendations"] = [
                    "Proceed with authorization request",
                    "No additional demographics verification needed"
                ]
                
        elif agent_system.progress < 45:
            # Complete IntakeAgent's third criteria
            if agent_system.agents["IntakeAgent"]["criteria"][2]["status"] == "processing":
                agent_system.agents["IntakeAgent"]["criteria"][2]["status"] = "complete"
                agent_system.agents["IntakeAgent"]["criteria"][2]["confidence"] = random.uniform(0.88, 0.96)
                agent_system.agents["IntakeAgent"]["criteria"][2]["details"] = "CPT 27447 and ICD-10 M17.11 validated for Total Knee Arthroplasty."
                agent_system.add_status_history("Verification Complete", "Procedure and diagnosis codes verified")
                
            # Update processing stage
            agent_system.processing_stage = "Analyzing clinical criteria and medical necessity"
                
            # Start ClinicalAgent's first criteria
            if agent_system.agents["ClinicalAgent"]["criteria"][0]["status"] == "pending":
                agent_system.agents["ClinicalAgent"]["criteria"][0]["status"] = "processing"
                agent_system.add_status_history("Processing", "Evaluating alignment with clinical guidelines")
                
        elif agent_system.progress < 55:
            # Complete ClinicalAgent's first criteria
            if agent_system.agents["ClinicalAgent"]["criteria"][0]["status"] == "processing":
                agent_system.agents["ClinicalAgent"]["criteria"][0]["status"] = "complete"
                agent_system.agents["ClinicalAgent"]["criteria"][0]["confidence"] = random.uniform(0.85, 0.95)
                agent_system.agents["ClinicalAgent"]["criteria"][0]["details"] = "Procedure aligns with AAOS guidelines for severe osteoarthritis with documented failure of conservative treatment."
                agent_system.add_status_history("Verification Complete", "Clinical guidelines alignment verified")
                
            # Start ClinicalAgent's second criteria
            if agent_system.agents["ClinicalAgent"]["criteria"][1]["status"] == "pending":
                agent_system.agents["ClinicalAgent"]["criteria"][1]["status"] = "processing"
                agent_system.add_status_history("Processing", "Validating medical necessity")
                
        elif agent_system.progress < 65:
            # Complete ClinicalAgent's second criteria
            if agent_system.agents["ClinicalAgent"]["criteria"][1]["status"] == "processing":
                agent_system.agents["ClinicalAgent"]["criteria"][1]["status"] = "complete"
                agent_system.agents["ClinicalAgent"]["criteria"][1]["confidence"] = random.uniform(0.87, 0.97)
                agent_system.agents["ClinicalAgent"]["criteria"][1]["details"] = "Medical necessity confirmed based on pain scale, limited mobility, and impact on ADLs."
                agent_system.add_status_history("Verification Complete", "Medical necessity validated")
                
            # Start ClinicalAgent's third criteria
            if agent_system.agents["ClinicalAgent"]["criteria"][2]["status"] == "pending":
                agent_system.agents["ClinicalAgent"]["criteria"][2]["status"] = "processing"
                agent_system.add_status_history("Processing", "Reviewing imaging results")
                
            # Add insights to ClinicalAgent
            if not agent_system.agents["ClinicalAgent"]["insights"]:
                agent_system.agents["ClinicalAgent"]["insights"] = [
                    "X-ray results show joint space narrowing and osteophyte formation consistent with severe OA",
                    "Patient has documented 6+ months of conservative treatment with inadequate relief",
                    "Physical therapy notes indicate declining functional status despite interventions"
                ]
                
        elif agent_system.progress < 70:
            # Complete ClinicalAgent's third criteria
            if agent_system.agents["ClinicalAgent"]["criteria"][2]["status"] == "processing":
                agent_system.agents["ClinicalAgent"]["criteria"][2]["status"] = "complete"
                agent_system.agents["ClinicalAgent"]["criteria"][2]["confidence"] = random.uniform(0.90, 0.98)
                agent_system.agents["ClinicalAgent"]["criteria"][2]["details"] = "Imaging shows severe degenerative changes with bone-on-bone contact in the right knee joint."
                agent_system.add_status_history("Verification Complete", "Imaging review completed")
                
            # Add recommendations to ClinicalAgent
            if not agent_system.agents["ClinicalAgent"]["recommendations"]:
                agent_system.agents["ClinicalAgent"]["recommendations"] = [
                    "Recommend approval based on clinical findings",
                    "Include imaging reports in authorization submission",
                    "Document conservative treatment failure in detail"
                ]
                
            # Update processing stage
            agent_system.processing_stage = "Analyzing payer policies and requirements"
                
            # Start PolicyAgent's first criteria
            if agent_system.agents["PolicyAgent"]["criteria"][0]["status"] == "pending":
                agent_system.agents["PolicyAgent"]["criteria"][0]["status"] = "processing"
                agent_system.add_status_history("Processing", "Checking payer-specific requirements")
                
        elif agent_system.progress < 75:
            # Complete PolicyAgent's first criteria
            if agent_system.agents["PolicyAgent"]["criteria"][0]["status"] == "processing":
                agent_system.agents["PolicyAgent"]["criteria"][0]["status"] = "complete"
                agent_system.agents["PolicyAgent"]["criteria"][0]["confidence"] = random.uniform(0.82, 0.94)
                agent_system.agents["PolicyAgent"]["criteria"][0]["details"] = "BCBS policy #SURG27447 requirements for TKA verified and satisfied."
                agent_system.add_status_history("Verification Complete", "Payer policy requirements verified")
                
            # Start PolicyAgent's second criteria
            if agent_system.agents["PolicyAgent"]["criteria"][1]["status"] == "pending":
                agent_system.agents["PolicyAgent"]["criteria"][1]["status"] = "processing"
                agent_system.add_status_history("Processing", "Verifying prior conservative treatment")
                
        elif agent_system.progress < 80:
            # Complete PolicyAgent's second criteria
            if agent_system.agents["PolicyAgent"]["criteria"][1]["status"] == "processing":
                agent_system.agents["PolicyAgent"]["criteria"][1]["status"] = "complete"
                agent_system.agents["PolicyAgent"]["criteria"][1]["confidence"] = random.uniform(0.85, 0.95)
                agent_system.agents["PolicyAgent"]["criteria"][1]["details"] = "Documentation confirms 6+ months of physical therapy, NSAIDs, and intra-articular injections."
                agent_system.add_status_history("Verification Complete", "Prior treatment verification completed")
                
            # Start PolicyAgent's third criteria
            if agent_system.agents["PolicyAgent"]["criteria"][2]["status"] == "pending":
                agent_system.agents["PolicyAgent"]["criteria"][2]["status"] = "processing"
                agent_system.add_status_history("Processing", "Checking network provider status")
                
            # Add insights to PolicyAgent
            if not agent_system.agents["PolicyAgent"]["insights"]:
                agent_system.agents["PolicyAgent"]["insights"] = [
                    "Patient's plan requires 3+ months of conservative treatment, which is met",
                    "Historical approval rate for similar cases is 94% with this payer",
                    "No prior denials found for this patient with similar procedures"
                ]
                
        elif agent_system.progress < 85:
            # Complete PolicyAgent's third criteria
            if agent_system.agents["PolicyAgent"]["criteria"][2]["status"] == "processing":
                agent_system.agents["PolicyAgent"]["criteria"][2]["status"] = "complete"
                agent_system.agents["PolicyAgent"]["criteria"][2]["confidence"] = random.uniform(0.88, 0.96)
                agent_system.agents["PolicyAgent"]["criteria"][2]["details"] = "Metropolitan Orthopedic Center confirmed as in-network provider for BCBS."
                agent_system.add_status_history("Verification Complete", "Network provider status verified")
                
            # Add recommendations to PolicyAgent
            if not agent_system.agents["PolicyAgent"]["recommendations"]:
                agent_system.agents["PolicyAgent"]["recommendations"] = [
                    "Submit with all required documentation for prompt approval",
                    "Include physical therapy and injection treatment records",
                    "Verify with BCBS that all pre-authorization requirements are met"
                ]
                
            # Update processing stage
            agent_system.processing_stage = "Finalizing authorization recommendation"
                
            # Start CoordinationAgent's first criteria
            if agent_system.agents["CoordinationAgent"]["criteria"][0]["status"] == "pending":
                agent_system.agents["CoordinationAgent"]["criteria"][0]["status"] = "processing"
                agent_system.add_status_history("Processing", "Coordinating provider communication")
                
        elif agent_system.progress < 90:
            # Complete CoordinationAgent's first criteria
            if agent_system.agents["CoordinationAgent"]["criteria"][0]["status"] == "processing":
                agent_system.agents["CoordinationAgent"]["criteria"][0]["status"] = "complete"
                agent_system.agents["CoordinationAgent"]["criteria"][0]["confidence"] = random.uniform(0.87, 0.95)
                agent_system.agents["CoordinationAgent"]["criteria"][0]["details"] = "Provider notified of pending authorization assessment. Additional documentation requested if needed."
                agent_system.add_status_history("Verification Complete", "Provider communication completed")
                
            # Start CoordinationAgent's second criteria
            if agent_system.agents["CoordinationAgent"]["criteria"][1]["status"] == "pending":
                agent_system.agents["CoordinationAgent"]["criteria"][1]["status"] = "processing"
                agent_system.add_status_history("Processing", "Preparing patient notification")
                
        elif agent_system.progress < 95:
            # Complete CoordinationAgent's second criteria
            if agent_system.agents["CoordinationAgent"]["criteria"][1]["status"] == "processing":
                agent_system.agents["CoordinationAgent"]["criteria"][1]["status"] = "complete"
                agent_system.agents["CoordinationAgent"]["criteria"][1]["confidence"] = random.uniform(0.90, 0.98)
                agent_system.agents["CoordinationAgent"]["criteria"][1]["details"] = "Patient notification staged for delivery upon final determination."
                agent_system.add_status_history("Verification Complete", "Patient notification prepared")
                
            # Start CoordinationAgent's third criteria
            if agent_system.agents["CoordinationAgent"]["criteria"][2]["status"] == "pending":
                agent_system.agents["CoordinationAgent"]["criteria"][2]["status"] = "processing"
                agent_system.add_status_history("Processing", "Verifying documentation completeness")
                
            # Add insights to CoordinationAgent
            if not agent_system.agents["CoordinationAgent"]["insights"]:
                agent_system.agents["CoordinationAgent"]["insights"] = [
                    "All required documentation is present and verified",
                    "Similar cases have 94% approval rate with the current payer",
                    "Standard processing time for this procedure with this payer is 2-3 days"
                ]
                
        else:
            # Complete CoordinationAgent's third criteria
            if agent_system.agents["CoordinationAgent"]["criteria"][2]["status"] == "processing":
                agent_system.agents["CoordinationAgent"]["criteria"][2]["status"] = "complete"
                agent_system.agents["CoordinationAgent"]["criteria"][2]["confidence"] = random.uniform(0.92, 0.99)
                agent_system.agents["CoordinationAgent"]["criteria"][2]["details"] = "All required documentation verified. Case is ready for submission."
                agent_system.add_status_history("Verification Complete", "Documentation completeness verified")
                
            # Add recommendations to CoordinationAgent
            if not agent_system.agents["CoordinationAgent"]["recommendations"]:
                agent_system.agents["CoordinationAgent"]["recommendations"] = [
                    "Approve authorization based on comprehensive analysis",
                    "Schedule procedure within 30 days of approval",
                    "Ensure post-operative physical therapy is scheduled"
                ]
                
            # Complete the simulation
            if agent_system.progress >= 100 and not st.session_state.simulation_completed:
                agent_system.process_status = "Complete"
                agent_system.add_status_history("Simulation Completed", "All agents have completed their analysis.")
                
                # Set medical necessity score (85-95 for approval scenario)
                agent_system.medical_necessity_score = random.randint(85, 95)
                
                # Set final approval status
                if agent_system.medical_necessity_score >= 85:
                    agent_system.approval_status = "Approved"
                else:
                    agent_system.approval_status = "Denied"
                
                st.session_state.simulation_completed = True
                st.session_state.simulation_running = False

# Run the simulation step if it's active
if st.session_state.simulation_running:
    run_simulation_step()
    time.sleep(0.2 / st.session_state.simulation_speed)
    st.rerun()