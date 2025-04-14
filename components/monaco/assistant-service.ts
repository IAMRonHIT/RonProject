// This service simulates AI assistant interactions
// In a real implementation, this would connect to an actual AI backend

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  codeSnippet?: {
    language: string;
    code: string;
  };
}

interface AssistantResponse {
  message: Message;
  suggestedActions?: {
    label: string;
    action: () => void;
  }[];
}

// Sample responses based on common healthcare queries
const HEALTHCARE_RESPONSES: Record<string, (query: string) => string> = {
  greeting: () => 
    "Hello! I'm Ron, your healthcare AI assistant. I can help you with clinical workflows, data analysis, and developing healthcare applications. What can I help you with today?",
  
  default: () => 
    "I understand you're looking for assistance. As a healthcare AI specialized in clinical workflows, I can help you build applications, analyze medical data, or automate healthcare processes. Could you provide more details about what you're trying to accomplish?",
  
  appointment: (query) => 
    `I see you're working on an appointment system. Here are some key considerations for healthcare scheduling:\n\n1. Ensure HIPAA compliance in all patient communications\n2. Consider integration with existing EHR systems\n3. Implement smart scheduling to optimize provider time\n4. Include reminder functionality to reduce no-shows\n\nWould you like me to help you implement any of these features?`,
  
  patientData: (query) => 
    `When working with patient data, security and compliance are critical. Here are best practices:\n\n1. Ensure all PHI is encrypted at rest and in transit\n2. Implement proper authentication and authorization\n3. Maintain detailed audit logs for all data access\n4. Design with HIPAA and relevant regulations in mind\n\nI can help you implement secure data handling patterns if you'd like.`,
  
  medicalRecords: (query) => 
    `Electronic Medical Records (EMR) systems require careful design. Consider:\n\n1. Structured data for analytical capabilities\n2. Support for various medical data types (lab results, imaging, notes)\n3. Interoperability with other systems via FHIR or HL7\n4. Versioning to track changes\n\nWould you like me to show you how to implement a specific aspect of an EMR system?`,
  
  clinicalDecision: (query) => 
    `Clinical Decision Support Systems (CDSS) can significantly improve patient outcomes. Key elements include:\n\n1. Evidence-based rule engines\n2. Integration with patient data sources\n3. Appropriate alert mechanisms to avoid fatigue\n4. Clear explanations for recommendations\n\nI can help you design a CDSS component that follows best practices.`,
  
  billing: (query) => 
    `Healthcare billing systems need to account for the complexity of insurance, government programs, and patient responsibility. Important aspects include:\n\n1. Integration with coding and documentation\n2. Support for different payer rules\n3. Patient estimation tools\n4. Claim tracking and denial management\n\nWould you like me to help you implement a specific billing feature?`,
};

// Code snippet templates for different topics
const CODE_SNIPPETS: Record<string, { language: string, code: string }> = {
  appointmentSystem: {
    language: 'javascript',
    code: `// Appointment scheduling system with conflict resolution
class AppointmentSystem {
  constructor(ehrApiClient) {
    this.ehrApiClient = ehrApiClient;
    this.scheduledAppointments = new Map();
  }
  
  async scheduleAppointment(patientId, providerId, dateTime, duration = 30) {
    // Validate inputs
    if (!this.isValidAppointmentRequest(patientId, providerId, dateTime, duration)) {
      throw new Error("Invalid appointment request parameters");
    }
    
    // Check for conflicts
    const patientConflict = await this.checkPatientConflicts(patientId, dateTime, duration);
    if (patientConflict) {
      return {
        success: false,
        message: \`Patient already has an appointment at \${patientConflict.formattedDateTime}\`
      };
    }
    
    const providerConflict = await this.checkProviderAvailability(providerId, dateTime, duration);
    if (providerConflict) {
      // Find alternative slots
      const alternatives = await this.findAlternativeSlots(providerId, dateTime, duration, 3);
      return {
        success: false,
        message: "Provider is not available at the requested time",
        alternatives
      };
    }
    
    // Create appointment
    const appointmentId = this.generateAppointmentId();
    const appointment = {
      id: appointmentId,
      patientId,
      providerId,
      dateTime,
      duration,
      status: "scheduled",
      createdAt: new Date()
    };
    
    // Save to database and local cache
    await this.ehrApiClient.createAppointment(appointment);
    this.scheduledAppointments.set(appointmentId, appointment);
    
    // Send notifications
    this.sendAppointmentNotifications(appointment);
    
    return {
      success: true,
      appointmentId,
      message: "Appointment scheduled successfully"
    };
  }
  
  // Additional methods would be implemented here
}`
  },
  
  patientPortal: {
    language: 'html',
    code: `<!-- Patient Portal Main Dashboard -->
<div class="patient-dashboard">
  <header class="dashboard-header">
    <div class="patient-info">
      <img src="/images/patient-avatar.jpg" alt="Patient" class="avatar" />
      <div class="info">
        <h1>Welcome back, Sarah</h1>
        <p class="last-login">Last login: Today, 10:32 AM</p>
      </div>
    </div>
    <div class="quick-actions">
      <button class="primary-button">
        <svg class="icon" viewBox="0 0 24 24"><!-- Calendar icon --></svg>
        Schedule Appointment
      </button>
      <button class="secondary-button">
        <svg class="icon" viewBox="0 0 24 24"><!-- Message icon --></svg>
        Message Provider
      </button>
    </div>
  </header>
  
  <div class="dashboard-grid">
    <section class="card upcoming-appointments">
      <h2>Upcoming Appointments</h2>
      <ul class="appointment-list">
        <li class="appointment-item">
          <div class="appointment-date">
            <span class="month">Apr</span>
            <span class="day">15</span>
          </div>
          <div class="appointment-details">
            <h3>Annual Physical</h3>
            <p>Dr. James Wilson • 2:30 PM</p>
            <p>Main Hospital - Building A, Room 302</p>
          </div>
          <div class="appointment-actions">
            <button class="icon-button reschedule">
              <svg viewBox="0 0 24 24"><!-- Reschedule icon --></svg>
            </button>
            <button class="icon-button cancel">
              <svg viewBox="0 0 24 24"><!-- Cancel icon --></svg>
            </button>
          </div>
        </li>
        <!-- More appointments would be listed here -->
      </ul>
    </section>
    
    <section class="card medications">
      <h2>Current Medications</h2>
      <ul class="medication-list">
        <!-- Medication items would be listed here -->
      </ul>
    </section>
    
    <section class="card recent-results">
      <h2>Recent Test Results</h2>
      <!-- Test results would be shown here -->
    </section>
    
    <section class="card health-metrics">
      <h2>Health Metrics</h2>
      <div class="metric-charts">
        <!-- Charts for blood pressure, weight, etc. -->
      </div>
    </section>
  </div>
</div>`
  },
  
  healthDataAnalysis: {
    language: 'python',
    code: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import confusion_matrix, classification_report, roc_curve, auc

class HealthcarePredictor:
    """A predictive model for healthcare outcomes"""
    
    def __init__(self, data_path=None, df=None):
        """Initialize with either a data path or a pandas DataFrame"""
        if df is not None:
            self.data = df
        elif data_path is not None:
            self.data = pd.read_csv(data_path)
        else:
            raise ValueError("Either data_path or df must be provided")
            
        self.model = None
        self.features = None
        self.target = None
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
    
    def preprocess_data(self, target_column, features=None, categorical_columns=None,
                      drop_columns=None, test_size=0.25, random_state=42):
        """Preprocess the data for machine learning"""
        df = self.data.copy()
        
        # Handle missing values
        for col in df.columns:
            if df[col].dtype in [np.float64, np.int64]:
                df[col].fillna(df[col].median(), inplace=True)
            else:
                df[col].fillna(df[col].mode()[0], inplace=True)
        
        # Drop specified columns
        if drop_columns:
            df = df.drop(columns=drop_columns)
        
        # One-hot encode categorical variables
        if categorical_columns:
            df = pd.get_dummies(df, columns=categorical_columns, drop_first=True)
        
        # Set target and features
        self.target = target_column
        y = df[target_column]
        
        if features:
            self.features = features
            X = df[features]
        else:
            self.features = [col for col in df.columns if col != target_column]
            X = df.drop(columns=[target_column])
        
        # Split the data
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state
        )
        
        return self
    
    def train_model(self, n_estimators=100, max_depth=None):
        """Train a Random Forest classifier"""
        if self.X_train is None:
            raise ValueError("Data must be preprocessed before training")
            
        self.model = RandomForestClassifier(
            n_estimators=n_estimators,
            max_depth=max_depth,
            random_state=42
        )
        
        self.model.fit(self.X_train, self.y_train)
        return self
    
    def evaluate_model(self):
        """Evaluate the trained model"""
        if self.model is None:
            raise ValueError("Model must be trained before evaluation")
            
        # Make predictions
        y_pred = self.model.predict(self.X_test)
        
        # Calculate metrics
        print("Classification Report:")
        print(classification_report(self.y_test, y_pred))
        
        # Confusion Matrix
        cm = confusion_matrix(self.y_test, y_pred)
        plt.figure(figsize=(8, 6))
        sns.heatmap(cm, annot=True, fmt="d", cmap="Blues")
        plt.xlabel("Predicted")
        plt.ylabel("Actual")
        plt.title("Confusion Matrix")
        plt.show()
        
        # Feature importance
        if len(self.features) <= 20:
            feature_importance = pd.DataFrame({
                'Feature': self.features,
                'Importance': self.model.feature_importances_
            }).sort_values('Importance', ascending=False)
            
            plt.figure(figsize=(10, 6))
            sns.barplot(x='Importance', y='Feature', data=feature_importance)
            plt.title('Feature Importance')
            plt.tight_layout()
            plt.show()
            
        return self
            
    def predict(self, new_data):
        """Make predictions on new data"""
        if self.model is None:
            raise ValueError("Model must be trained before prediction")
            
        # Ensure new_data has the same features as training data
        missing_cols = set(self.X_train.columns) - set(new_data.columns)
        for col in missing_cols:
            new_data[col] = 0
            
        new_data = new_data[self.X_train.columns]
        
        return self.model.predict(new_data)`
  }
};

// Predefined conversation prompts for onboarding
export const CONVERSATION_PROMPTS = [
  "Can you help me build a patient scheduling system?",
  "How should I handle sensitive patient data?",
  "What's the best way to implement a medical records system?",
  "Can you show me how to analyze clinical data?",
  "How do I design a secure healthcare billing system?"
];

class AssistantService {
  private messages: Message[] = [];
  private messageCounter: number = 0;
  
  constructor() {
    // Add initial greeting
    this.addAssistantMessage(HEALTHCARE_RESPONSES.greeting(""));
  }
  
  private addAssistantMessage(content: string, codeSnippet?: { language: string, code: string }): Message {
    const message: Message = {
      id: `msg-${++this.messageCounter}`,
      role: 'assistant',
      content,
      timestamp: new Date(),
      ...(codeSnippet && { codeSnippet })
    };
    
    this.messages.push(message);
    return message;
  }
  
  private addUserMessage(content: string): Message {
    const message: Message = {
      id: `msg-${++this.messageCounter}`,
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    this.messages.push(message);
    return message;
  }
  
  public getMessages(): Message[] {
    return [...this.messages];
  }
  
  public clearMessages(): void {
    this.messages = [];
    this.messageCounter = 0;
    this.addAssistantMessage(HEALTHCARE_RESPONSES.greeting(""));
  }
  
  private findMatchingResponse(query: string): (query: string) => string {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.match(/^hey\b/)) {
      return HEALTHCARE_RESPONSES.greeting;
    }
    
    if (lowerQuery.includes('appointment') || lowerQuery.includes('schedule') || lowerQuery.includes('booking')) {
      return HEALTHCARE_RESPONSES.appointment;
    }
    
    if (lowerQuery.includes('patient data') || lowerQuery.includes('personal information') || lowerQuery.includes('sensitive data')) {
      return HEALTHCARE_RESPONSES.patientData;
    }
    
    if (lowerQuery.includes('medical record') || lowerQuery.includes('emr') || lowerQuery.includes('ehr')) {
      return HEALTHCARE_RESPONSES.medicalRecords;
    }
    
    if (lowerQuery.includes('decision') || lowerQuery.includes('diagnosis') || lowerQuery.includes('treatment')) {
      return HEALTHCARE_RESPONSES.clinicalDecision;
    }
    
    if (lowerQuery.includes('billing') || lowerQuery.includes('invoice') || lowerQuery.includes('payment')) {
      return HEALTHCARE_RESPONSES.billing;
    }
    
    return HEALTHCARE_RESPONSES.default;
  }
  
  private findCodeSnippet(query: string): { language: string, code: string } | undefined {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('appointment') || lowerQuery.includes('schedule') || lowerQuery.includes('booking')) {
      return CODE_SNIPPETS.appointmentSystem;
    }
    
    if (lowerQuery.includes('patient portal') || lowerQuery.includes('dashboard') || lowerQuery.includes('interface')) {
      return CODE_SNIPPETS.patientPortal;
    }
    
    if (lowerQuery.includes('analysis') || lowerQuery.includes('data') || lowerQuery.includes('predict')) {
      return CODE_SNIPPETS.healthDataAnalysis;
    }
    
    return undefined;
  }
  
  // Simulate sending a message to the assistant and getting a response
  public async sendMessage(content: string): Promise<AssistantResponse> {
    this.addUserMessage(content);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const responseGenerator = this.findMatchingResponse(content);
    const codeSnippet = this.findCodeSnippet(content);
    
    const responseContent = responseGenerator(content);
    const message = this.addAssistantMessage(responseContent, codeSnippet);
    
    return { message };
  }
}

export default AssistantService;
