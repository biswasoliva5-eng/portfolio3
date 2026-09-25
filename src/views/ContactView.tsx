import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { api } from '../api/client';
import { Mail, MapPin, Send, Check } from 'lucide-react';

export const ContactView: React.FC = () => {
  const { data, showToast } = usePortfolio();
  const settings = data?.settings;
  const socialLinks = data?.socialLinks || [];

  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await api.sendContactMessage(form);
      setSubmitted(true);
      showToast('Your message has been sent. Thank you!', 'success');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      showToast(err.message || 'Failed to send message. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="contact-view" className="w-full max-w-3xl pb-24">
      <div className="border-b border-neutral-100 pb-6 mb-10">
        <h1 className="text-xl sm:text-2xl font-normal text-neutral-950 tracking-tight">
          Contact & Inquiries
        </h1>
        <p className="text-xs text-neutral-400 font-light mt-1">
          For exhibition proposals, acquisitions, studio visits, or general questions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Direct contact info */}
        <div className="md:col-span-5 space-y-8 text-xs font-sans">
          {settings?.contactEmail && (
            <div>
              <span className="text-neutral-400 block mb-1 uppercase tracking-wider">
                Direct Email
              </span>
              <a
                href={`mailto:${settings.contactEmail}`}
                className="text-neutral-900 font-medium hover:text-neutral-600 transition-colors underline underline-offset-4"
              >
                {settings.contactEmail}
              </a>
            </div>
          )}

          {settings?.studioLocation && (
            <div>
              <span className="text-neutral-400 block mb-1 uppercase tracking-wider">
                Studio
              </span>
              <p className="text-neutral-900">{settings.studioLocation}</p>
            </div>
          )}

          {socialLinks.length > 0 && (
            <div>
              <span className="text-neutral-400 block mb-2 uppercase tracking-wider">
                Connect
              </span>
              <div className="space-y-1.5">
                {socialLinks.map(link => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-neutral-600 hover:text-neutral-950 transition-colors"
                  >
                    {link.label || link.platform} →
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Inquiry Form */}
        <div className="md:col-span-7">
          {submitted ? (
            <div className="bg-neutral-50 p-8 border border-neutral-100 text-center space-y-3">
              <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center mx-auto">
                <Check className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-medium text-neutral-950">Message Sent</h3>
              <p className="text-xs text-neutral-500 font-light max-w-xs mx-auto">
                Thank you for your message. The studio will get back to you shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-xs text-neutral-900 underline underline-offset-4 pt-2"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-neutral-500 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-neutral-200 px-3 py-2 text-xs focus:outline-hidden focus:border-neutral-900 transition-colors"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-neutral-500 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-neutral-200 px-3 py-2 text-xs focus:outline-hidden focus:border-neutral-900 transition-colors"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-neutral-500 mb-1">Subject</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full border border-neutral-200 px-3 py-2 text-xs focus:outline-hidden focus:border-neutral-900 transition-colors"
                  placeholder="Acquisition inquiry, exhibition, etc."
                />
              </div>

              <div>
                <label className="block text-neutral-500 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full border border-neutral-200 px-3 py-2 text-xs focus:outline-hidden focus:border-neutral-900 transition-colors resize-y"
                  placeholder="Write your inquiry or question here..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-neutral-950 text-white py-3 text-xs uppercase tracking-widest hover:bg-neutral-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <span>Submit Inquiry</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
