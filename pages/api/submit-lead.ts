import type { NextApiRequest, NextApiResponse } from 'next';

type LeadData = {
  name: string;
  email: string;
  company?: string;
  role?: string;
  message?: string;
  source: string;
  leadType: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const leadData = req.body as LeadData;
    
    // Validate required fields
    if (!leadData.name || !leadData.email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }
    
    // Send to Zapier webhook or your CRM system
    const webhookUrl = process.env.ZAPIER_WEBHOOK_URL || process.env.HUBSPOT_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.error('Webhook URL environment variable is not set');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...leadData,
        timestamp: new Date().toISOString(),
      }),
    });
    
    if (!webhookResponse.ok) {
      throw new Error(`Webhook error: ${webhookResponse.statusText}`);
    }
    
    // Optional: Log lead to your database
    // await prisma.lead.create({ data: leadData });
    
    return res.status(200).json({ message: 'Lead submitted successfully' });
  } catch (error) {
    console.error('Error submitting lead:', error);
    return res.status(500).json({ message: 'Error submitting lead' });
  }
}