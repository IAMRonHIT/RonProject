'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ContactFormProps {
  onSubmit: (data: FormData) => void;
  formType: 'contact' | 'appointment' | 'feedback';
}

interface FormData {
  name: string;
  email: string;
  company?: string;
  message?: string;
  phone?: string;
}

export function ContactForm({ onSubmit, formType }: ContactFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    message: '',
    phone: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-xs text-cyan-300">Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="h-8 text-sm bg-black/30 border-cyan-500/30 focus-visible:ring-cyan-500/50 focus-visible:ring-offset-0 text-neutral-100"
          placeholder="Your name"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-xs text-cyan-300">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="h-8 text-sm bg-black/30 border-cyan-500/30 focus-visible:ring-cyan-500/50 focus-visible:ring-offset-0 text-neutral-100"
          placeholder="Your email"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="company" className="text-xs text-cyan-300">Company</Label>
        <Input
          id="company"
          name="company"
          value={formData.company}
          onChange={handleChange}
          className="h-8 text-sm bg-black/30 border-cyan-500/30 focus-visible:ring-cyan-500/50 focus-visible:ring-offset-0 text-neutral-100"
          placeholder="Your company"
        />
      </div>
      
      {formType === 'appointment' && (
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-xs text-cyan-300">Phone</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="h-8 text-sm bg-black/30 border-cyan-500/30 focus-visible:ring-cyan-500/50 focus-visible:ring-offset-0 text-neutral-100"
            placeholder="Your phone number"
          />
        </div>
      )}
      
      {formType === 'feedback' && (
        <div className="space-y-2">
          <Label htmlFor="message" className="text-xs text-cyan-300">Message</Label>
          <Input
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            className="h-8 text-sm bg-black/30 border-cyan-500/30 focus-visible:ring-cyan-500/50 focus-visible:ring-offset-0 text-neutral-100"
            placeholder="Your feedback"
          />
        </div>
      )}
      
      <Button 
        type="submit"
        size="sm"
        className="w-full bg-gradient-to-br from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white border-none"
      >
        {formType === 'contact' ? 'Contact Us' : 
         formType === 'appointment' ? 'Schedule Appointment' : 'Submit Feedback'}
      </Button>
    </form>
  );
}