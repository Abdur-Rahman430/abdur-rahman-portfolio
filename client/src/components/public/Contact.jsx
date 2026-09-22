import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sendMessage } from '../../services/contactApi.js';
import { fetchProfile } from '../../services/profileApi.js';
import { fetchSocialLinks } from '../../services/socialLinksApi.js';
import { resolveSocialIcon } from '../../utils/socialIconResolver.jsx';
import {
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MessageSquare,
  Clock,
  User,
} from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Contact() {
  // Form input state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  // Supporting contact details state
  const [profile, setProfile] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);

  // Form submission state
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: string }
  const [clientErrors, setClientErrors] = useState({});

  // Fetch optional profile / social links for the sidebar panel
  useEffect(() => {
    let isMounted = true;

    async function loadContactSideData() {
      try {
        const [profileRes, socialRes] = await Promise.allSettled([
          fetchProfile(),
          fetchSocialLinks(),
        ]);

        if (isMounted) {
          if (profileRes.status === 'fulfilled' && profileRes.value?.success && profileRes.value?.data) {
            setProfile(profileRes.value.data);
          }
          if (socialRes.status === 'fulfilled' && socialRes.value?.success && Array.isArray(socialRes.value?.data)) {
            setSocialLinks(socialRes.value.data);
          }
        }
      } catch {
        // Graceful silent fallback
      }
    }

    loadContactSideData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific field validation error when user types
    if (clientErrors[name]) {
      setClientErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedSubject = formData.subject.trim();
    const trimmedMessage = formData.message.trim();

    if (!trimmedName) {
      errors.name = 'Name is required.';
    } else if (trimmedName.length > 100) {
      errors.name = 'Name cannot exceed 100 characters.';
    }

    if (!trimmedEmail) {
      errors.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = 'Please provide a valid email address.';
    } else if (trimmedEmail.length > 255) {
      errors.email = 'Email cannot exceed 255 characters.';
    }

    if (trimmedSubject.length > 200) {
      errors.subject = 'Subject cannot exceed 200 characters.';
    }

    if (!trimmedMessage) {
      errors.message = 'Message is required.';
    } else if (trimmedMessage.length > 5000) {
      errors.message = 'Message cannot exceed 5000 characters.';
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const res = await sendMessage({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });

      if (res?.success) {
        setStatusMessage({
          type: 'success',
          text: res.message || 'Thank you! Your message has been sent successfully.',
        });
        // Reset form on success
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
        });
        setClientErrors({});
      } else {
        setStatusMessage({
          type: 'error',
          text: res?.message || 'Failed to send message. Please try again.',
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Something went wrong while sending your message. Please try again later.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Animation variants
  const fadeInVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <section
      id="contact"
      className="scroll-mt-24 sm:scroll-mt-28 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-20 relative"
    >
      {/* Subtle ambient background glow */}
      <div className="hidden sm:block absolute top-1/2 left-1/3 -translate-y-1/2 w-96 h-96 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.06)_0%,transparent_70%)] pointer-events-none -z-10" />

      <div className="space-y-12">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeInVariants}
          className="text-center space-y-3 max-w-2xl mx-auto"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Let&apos;s Connect</span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-100">
            Get In Touch
          </h2>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
            Have a project idea, collaboration opportunity, or simply want to say hello? Leave a message below.
          </p>
        </motion.div>

        {/* Main Grid: Left Panel Info & Right Panel Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Info & Social Channels */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeInVariants}
            className="lg:col-span-5 space-y-6"
          >
            {/* Quick Contact Information Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800/80 shadow-xl space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/80">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">
                    Contact Channels
                  </h3>
                  <p className="text-xs font-mono text-zinc-500">
                    Reach Out Directly
                  </p>
                </div>
              </div>

              {/* Status & Response details */}
              <div className="space-y-4">
                {profile?.currentStatus && (
                  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <div>
                      <p className="text-[11px] font-mono text-zinc-500">Current Availability</p>
                      <p className="text-xs font-semibold text-zinc-200">{profile.currentStatus}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
                  <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-[11px] font-mono text-zinc-500">Response Window</p>
                    <p className="text-xs font-semibold text-zinc-200">Usually responds within 24–48 hours</p>
                  </div>
                </div>

                {profile?.fullName && (
                  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
                    <User className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-[11px] font-mono text-zinc-500">Direct Recipient</p>
                      <p className="text-xs font-semibold text-zinc-200">{profile.fullName}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Channels if active */}
              {socialLinks.length > 0 && (
                <div className="pt-4 border-t border-zinc-800/80 space-y-3">
                  <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                    Connect Online
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {socialLinks.map((item) => (
                      <a
                        key={item._id || item.platform}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-zinc-900 transition-all cursor-pointer shadow-sm"
                        title={item.platform}
                      >
                        {resolveSocialIcon(item.icon, item.platform)}
                        <span>{item.platform}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Column: Contact Message Form */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeInVariants}
            className="lg:col-span-7"
          >
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800/80 shadow-xl relative">
              {/* Form header */}
              <div className="flex items-center gap-3 pb-5 border-b border-zinc-800/80 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">Send a Message</h3>
                  <p className="text-xs font-mono text-zinc-500">Fill out the fields below</p>
                </div>
              </div>

              {/* Notification Banner */}
              {statusMessage && (
                <div
                  className={`mb-6 p-4 rounded-2xl flex items-start gap-3 border ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                  role="alert"
                >
                  {statusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs sm:text-sm leading-relaxed">
                    {statusMessage.text}
                  </div>
                </div>
              )}

              {/* Submission Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Row: Name and Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name Input */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-medium text-zinc-300"
                    >
                      Your Name <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={submitting}
                      maxLength={100}
                      placeholder="e.g. Jane Doe"
                      className={`w-full px-4 py-2.5 rounded-xl bg-zinc-950/80 border text-xs sm:text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors ${
                        clientErrors.name
                          ? 'border-rose-500/70 focus:border-rose-500'
                          : 'border-zinc-800/80 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    />
                    {clientErrors.name && (
                      <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {clientErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-medium text-zinc-300"
                    >
                      Email Address <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={submitting}
                      maxLength={255}
                      placeholder="jane@example.com"
                      className={`w-full px-4 py-2.5 rounded-xl bg-zinc-950/80 border text-xs sm:text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors ${
                        clientErrors.email
                          ? 'border-rose-500/70 focus:border-rose-500'
                          : 'border-zinc-800/80 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    />
                    {clientErrors.email && (
                      <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {clientErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Subject Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="contact-subject"
                      className="block text-xs font-medium text-zinc-300"
                    >
                      Subject <span className="text-zinc-500 text-[11px]">(Optional)</span>
                    </label>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {formData.subject.length}/200
                    </span>
                  </div>
                  <input
                    id="contact-subject"
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    disabled={submitting}
                    maxLength={200}
                    placeholder="Project Inquiry, Consultation, or Hello"
                    className={`w-full px-4 py-2.5 rounded-xl bg-zinc-950/80 border text-xs sm:text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors ${
                      clientErrors.subject
                        ? 'border-rose-500/70 focus:border-rose-500'
                        : 'border-zinc-800/80 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
                  {clientErrors.subject && (
                    <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {clientErrors.subject}
                    </p>
                  )}
                </div>

                {/* Message Textarea */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="contact-message"
                      className="block text-xs font-medium text-zinc-300"
                    >
                      Your Message <span className="text-emerald-400">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {formData.message.length}/5000
                    </span>
                  </div>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    disabled={submitting}
                    maxLength={5000}
                    placeholder="How can I help you today? Please include any relevant project details or inquiries..."
                    className={`w-full px-4 py-3 rounded-xl bg-zinc-950/80 border text-xs sm:text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors resize-y ${
                      clientErrors.message
                        ? 'border-rose-500/70 focus:border-rose-500'
                        : 'border-zinc-800/80 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
                  {clientErrors.message && (
                    <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {clientErrors.message}
                    </p>
                  )}
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs sm:text-sm hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-500 transition-all cursor-pointer shadow-md"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
