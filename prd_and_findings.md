# Product Requirements Document: Ron AI Website

## 1. Introduction

*   **Purpose:** To define the product requirements for the Ron AI public-facing website.
*   **Overview:** Ron AI is a healthcare technology company specializing in AI-driven solutions to enhance clinical workflows and patient outcomes. The website serves as the primary platform for product showcasing, lead generation, and providing access to its AI tools.

## 2. Goals of the Website

*   Effectively communicate the value proposition of Ron AI's products and services.
*   Generate qualified leads for the sales team.
*   Showcase the capabilities of the AI-powered Care Plan Generator.
*   Establish Ron AI as a thought leader in AI healthcare.
*   Provide a user-friendly experience for accessing information and tools.

## 3. Target Audience

*   **Primary:**
    *   Hospital Administrators & Healthcare Executives (looking for efficiency, cost savings, improved outcomes).
    *   Clinical Department Heads (e.g., Directors of Nursing, Chief Medical Officers - interested in workflow improvements, staff satisfaction, quality of care).
    *   Nursing Informatics Specialists & Clinical Analysts (interested in technical capabilities, integration, data quality).
*   **Secondary:**
    *   Individual Clinicians (Nurses, Physicians - interested in tools that simplify their work).
    *   Healthcare IT Professionals (concerned with integration, security, compliance).
    *   Potential Investors & Partners.

## 4. Overall User Experience & Design Philosophy

*   **Professional & Trustworthy:** Design should inspire confidence in Ron AI's expertise and the reliability of its AI.
*   **Modern & Innovative:** Reflect the cutting-edge nature of AI in healthcare.
*   **Clear & Intuitive:** Easy navigation, understandable content, and straightforward tool interactions.
*   **Collaborative AI:** Emphasize AI as a supportive tool for clinicians, not a replacement.
*   **Accessible:** Design for users of varying technical abilities and consider accessibility standards.

## 5. Key Features & Functionalities

*   **5.1. Informational Pages:**
    *   **Homepage (`app/page.tsx`):** Overview of Ron AI, key offerings, navigation to other sections.
    *   **About Us (`app/about/page.tsx`):** Company mission, values, team (TeamProjector component), competitive advantages (CompetitionMatrix).
    *   **Solutions (`app/solutions/page.tsx`):** Detailed descriptions of solutions like Prior Authorization Automation, Clinical Documentation, Patient Communication, SDOH Integration, Interoperability Hub, Proactive Care Management. Call to action for demos.
    *   **Blog (`app/blog/page.tsx`):** Placeholder for articles, news, and insights. (Functionality to be fully defined).
    *   **Contact (`app/contact/page.tsx`):** Contact form, location, and other ways to get in touch.
*   **5.2. Care Plan as a Service (CPaaS) Section (`app/cpaas/page.tsx`):**
    *   Detailed explanation of CPaaS offering (`components/marketing/CPaaSExplainer.tsx`).
    *   Benefits: Time savings, evidence-based care, EHR integration, etc.
    *   How it works: Input patient data -> AI Analysis -> Care Plan Generation.
    *   Success stories/testimonials.
*   **5.3. Interactive Care Plan Generator (`app/care-plan-generator/page.tsx` & `backend/careplan/app.py`):**
    *   **Patient Data Input:** Form for users to input patient demographic and clinical information (`components/careplangenerator/PatientDataForm.tsx`). (Initially uses a static JSON `john-smith-careplan.json` which is then augmented by AI).
    *   **AI Reasoning Display:** Shows the AI's reasoning process. The frontend (`care-plan-generator/page.tsx`) calls `/api/grok-chat` for this.
    *   **Comprehensive Care Plan Generation:**
        *   The backend (`backend/careplan/app.py`) uses Perplexity AI (Sonar) to generate detailed ADPIE (Assessment, Diagnosis, Planning, Implementation, Evaluation) components for multiple nursing diagnoses.
        *   Identifies items requiring prior authorization.
        *   Includes citations/sources for evidence-based information.
    *   **Output Display:** Presents the care plan in a structured format, likely using `components/careplangenerator/CarePlanTemplate.tsx` which includes sections for assessment, diagnoses, goals, interventions, evaluations, and a chat interface.
    *   **FHIR Compliance:** The README mentions FHIR-compliant care plans. The PRD assumes this is a requirement for the output, though backend models don't explicitly state FHIR resources.
*   **5.4. AI Chatbot with Lead Generation (`components/chatbot/ChatbotWithLeadGen.tsx`):**
    *   **RAG-based Q&A:** Answers user questions about Ron AI using a knowledge base (`data/knowledge/`). (Uses a Gemini chat hook as per component comments).
    *   **Contextual Suggested Questions:** Offers relevant follow-up questions.
    *   **Sales Intent Detection:** Identifies keywords (demo, pricing) to trigger lead capture.
    *   **Lead Capture Form:** Collects user details (name, email, company, role, message).
    *   **Backend Integration:** Submits lead data to `/api/submit-lead` (README mentions HubSpot integration).

## 6. Success Metrics (Examples)

*   Number of qualified leads generated (via chatbot, contact forms, demo requests).
*   Conversion rate of website visitors to leads.
*   Number of care plans initiated and completed in the Care Plan Generator.
*   User engagement time on key pages (CPaaS, Care Plan Generator, Solutions).
*   Bounce rate on landing pages.
*   Chatbot engagement rate and lead submission rate from chatbot.

## 7. Assumptions & Open Questions

*   The specific AI models (Grok, Perplexity/Sonar, Gemini) used for each part of the care plan generation and chatbot need to be definitively mapped to the final implementation if there are variations between frontend calls, backend logic, and README descriptions. For the PRD, the *functionality* is primary.
*   The extent of FHIR compliance in the care plan output needs to be specified (e.g., which FHIR resources are used).
*   Details of HubSpot integration (e.g., what data is synced, deal creation logic) for lead generation.
*   Full functionality of the Blog page needs to be defined.

# Missing Features & Potential Enhancements

1.  **User Accounts & Dashboard:**
    *   Allow users (especially clinicians) to create accounts.
    *   Dashboard to save, manage, and revisit generated care plans.
    *   Profile settings and preferences.
2.  **Explicit FHIR Export Options:**
    *   Provide clear options to download/export care plans in standard FHIR JSON or XML formats.
    *   Option to select specific FHIR resources if applicable.
3.  **Expanded Knowledge Base & Management for RAG Chatbot:**
    *   Systematically expand the `/data/knowledge/` directory.
    *   Potentially an admin interface to upload and manage knowledge documents for the chatbot.
4.  **Admin Panel:**
    *   For managing website content (e.g., blog posts, solution page updates if not managed via CMS).
    *   Viewing website analytics and user activity.
    *   Managing user accounts (if implemented).
5.  **Pricing Page:**
    *   A clear, detailed pricing page for CPaaS and other services (currently a placeholder link in `app/cpaas/page.tsx`).
6.  **Full Blog Functionality:**
    *   Content creation tools or integration with a headless CMS.
    *   Categories, tags, search, author pages.
7.  **Interactive Demos/Sandbox:**
    *   Guided interactive demos of the Care Plan Generator or other tools.
    *   A sandbox environment where users can explore features with sample data without full commitment.
8.  **Enhanced Analytics for Care Plans:**
    *   If users have accounts, provide analytics on their generated care plans (e.g., common diagnoses, intervention types used). (Aggregated and anonymized if for platform improvement).
9.  **Team Collaboration Features:**
    *   Allow multiple users from the same organization to collaborate on care plans (requires user accounts and organization structures).
    *   Sharing features, versioning, and audit trails.
10. **Patient Data Input Methods:**
    *   Beyond manual form entry, consider options for structured data import (e.g., CCDA, FHIR bundle) for the Care Plan Generator to reduce manual input.
11. **Internationalization (i18n) & Localization (l10n):**
    *   Support for multiple languages if targeting a global audience.
12. **Enhanced Accessibility Features:**
    *   Rigorous adherence to WCAG guidelines beyond basic ARIA roles.
    *   User-selectable themes or font sizes.
13. **API Documentation Portal:**
    *   If CPaaS includes API access for customers, a dedicated developer portal with API documentation and testing tools. (The `cpaas` page footer mentions "API Reference").
14. **Security & Compliance Information:**
    *   A dedicated section or page detailing security measures, data privacy policies (HIPAA compliance if applicable in the US context).
