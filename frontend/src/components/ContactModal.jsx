import React, { useState } from 'react';
import { X, Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

export default function ContactModal({ isOpen, onClose }) {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      onClose();
    }, 2000);
  }

  return (
    <div className="account-modal-overlay" onClick={onClose}>
      <div
        className="account-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Contact Fudcy Foods"
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        <div className="contact-modal-body">
          <div className="account-header text-center">
            <span className="section-eyebrow">CUSTOMER CARE</span>
            <h2 className="account-title font-serif">GET IN TOUCH</h2>
            <p className="account-sub">
              Have questions about our ready-to-eat Kerala meals, shipping, or catering? We'd love to hear from you.
            </p>
          </div>

          <div className="contact-details-grid">
            <div className="contact-info-pill">
              <Mail size={16} color="#0A0A0A" />
              <span>support@fudcyfoods.com</span>
            </div>
            <div className="contact-info-pill">
              <Phone size={16} color="#0A0A0A" />
              <span>Available Mon – Sat, 9am – 6pm</span>
            </div>
            <div className="contact-info-pill">
              <MapPin size={16} color="#0A0A0A" />
              <span>Kerala, India • Pan-India Delivery</span>
            </div>
          </div>

          {sent ? (
            <div className="account-alert success text-center" style={{ margin: '20px 0' }}>
              <CheckCircle size={20} />
              <span>Thank you! Your message has been received. Our team will get back to you shortly.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="account-form" style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Nair"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Your Email</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Your Message / Inquiry</label>
                <textarea
                  rows="3"
                  placeholder="How can we help you today?"
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CFCFCF' }}
                />
              </div>

              <button type="submit" className="account-submit-btn">
                <Send size={16} />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
