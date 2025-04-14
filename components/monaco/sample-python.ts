// Sample Python code for the Monaco editor
export const pythonSample = `# Ron AI - Prior Authorization Agent Workflow
# File: /c/Users/thunt/RonProject/scripts/app.py
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

# Main app UI and simulation code would follow...
`;
