import type { NextApiRequest, NextApiResponse } from 'next';

// Define the expected structure of the FormState from the frontend
// This should mirror the FormState interface in PatientDataForm.tsx
// For simplicity here, we'll use `any`, but in a real app, you'd import/define the detailed type.
type FormState = any; 

// Define the expected structure of the response from the Python backend
// This should mirror CarePlanApiResponse in backend/careplan/app.py
interface PythonBackendResponse {
  full_care_plan: any; // Mirrors FullCarePlanDataResponse
  reasoning_text: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:8008/api/v1/generate-care-plan';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PythonBackendResponse | ErrorResponse>
) {
  if (req.method === 'POST') {
    const formState: FormState = req.body;

    if (!formState) {
      return res.status(400).json({ error: 'Missing formState in request body' });
    }

    try {
      console.log(`Forwarding request to Python backend: ${PYTHON_BACKEND_URL}`);
      const pythonResponse = await fetch(PYTHON_BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formState),
      });

      if (!pythonResponse.ok) {
        const errorBody = await pythonResponse.text();
        console.error(`Python backend error: ${pythonResponse.status} ${pythonResponse.statusText}`, errorBody);
        return res.status(pythonResponse.status).json({ 
          error: `Error from Python backend: ${pythonResponse.statusText}`,
          details: errorBody 
        });
      }

      const data: PythonBackendResponse = await pythonResponse.json();
      console.log("Received response from Python backend successfully.");
      return res.status(200).json(data);

    } catch (error: unknown) {
      console.error('Error calling Python backend:', error);
      let errorMessage = 'Failed to call Python backend.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return res.status(500).json({ error: errorMessage });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
