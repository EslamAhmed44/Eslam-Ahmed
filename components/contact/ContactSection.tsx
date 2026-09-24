'use client';

import React, { useState, useRef } from 'react';
import { useLanguage } from '../navigation/LanguageContext';
import {
  Mail,
  ArrowUpRight,
  Send,
  CheckCircle2,
  UploadCloud,
  Plus,
  Trash2,
  FileText,
  AlertCircle,
  Loader2,
  Link as LinkIcon,
  Sparkles,
  Layers,
  DollarSign,
  HelpCircle,
} from 'lucide-react';
import { LinkedInIcon, WhatsAppIcon } from '../ui/Icons';
import { PreferredContactMethod } from '@/lib/types';

interface ContactSectionProps {
  email: string;
  whatsappUrl: string;
  linkedinUrl: string;
}

interface UploadedFileItem {
  name: string;
  url: string;
  sizeBytes: number;
}

const SERVICE_OPTIONS = [
  { id: 'motion-graphics', label: 'Motion Graphics', labelAr: 'موشن جرافيك' },
  { id: 'graphic-design', label: 'Graphic Design', labelAr: 'تصميم جرافيك' },
  { id: 'social-media', label: 'Social Media Design', labelAr: 'تصاميم سوشيال ميديا' },
  { id: 'branding-logo', label: 'Branding / Logo', labelAr: 'هوية بصرية وشعارات' },
  { id: 'medical-branding', label: 'Medical Branding', labelAr: 'هويات طبية ومراكز صحية' },
  { id: 'video-editing', label: 'Video Editing', labelAr: 'مونتاج فيديو' },
  { id: 'poster-campaign', label: 'Poster / Campaign Design', labelAr: 'بوسترات وحملات إعلانية' },
  { id: 'other', label: 'Other', labelAr: 'أخرى' },
];

const BUDGET_OPTIONS = [
  'Under $50',
  '$50 – $100',
  '$100 – $250',
  '$250+',
  'Not sure yet',
];

const BUDGET_OPTIONS_AR: Record<string, string> = {
  'Under $50': 'أقل من 50$',
  '$50 – $100': '50$ – 100$',
  '$100 – $250': '100$ – 250$',
  '$250+': '+250$',
  'Not sure yet': 'غير محدد بعد',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9\s\-()]{6,25}$/;

export const ContactSection: React.FC<ContactSectionProps> = ({
  email,
  whatsappUrl,
  linkedinUrl,
}) => {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  // Form State
  const [name, setName] = useState('');
  const [contactMethod, setContactMethod] = useState<PreferredContactMethod>('Email');
  const [clientEmail, setClientEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [referenceLinks, setReferenceLinks] = useState<string[]>(['']);
  const [googleDriveUrl, setGoogleDriveUrl] = useState('');

  // File Upload State
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Toggle Service selection
  const toggleService = (serviceName: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceName) ? prev.filter((s) => s !== serviceName) : [...prev, serviceName]
    );
  };

  // Add / Remove Reference Links
  const handleLinkChange = (index: number, val: string) => {
    const updated = [...referenceLinks];
    updated[index] = val;
    setReferenceLinks(updated);
  };

  const addReferenceLink = () => {
    if (referenceLinks.length < 5) {
      setReferenceLinks([...referenceLinks, '']);
    }
  };

  const removeReferenceLink = (index: number) => {
    if (referenceLinks.length > 1) {
      setReferenceLinks(referenceLinks.filter((_, i) => i !== index));
    } else {
      setReferenceLinks(['']);
    }
  };

  // File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);
    setIsUploadingFile(true);

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (file.size > maxSizeBytes) {
          throw new Error(
            isAr
              ? `الملف ${file.name} يتجاوز الحجم المسموح (10 ميجابايت).`
              : `File ${file.name} exceeds 10MB limit.`
          );
        }

        const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        const validExt = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'].includes(ext);

        if (!allowedTypes.includes(file.type) && !validExt) {
          throw new Error(
            isAr
              ? `صيغة الملف ${file.name} غير مدعومة. يسمح بـ JPG أو PNG أو WEBP أو PDF فقط.`
              : `Unsupported format for ${file.name}. Only JPG, PNG, WEBP, or PDF allowed.`
          );
        }

        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/inquiries/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Upload failed');
        }

        setUploadedFiles((prev) => [
          ...prev,
          {
            name: data.name || file.name,
            url: data.url,
            sizeBytes: data.sizeBytes || file.size,
          },
        ]);
      }
    } catch (err: any) {
      setUploadError(err.message || 'File upload failed');
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Client-Side Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = isAr ? 'يرجى إدخال اسمك الكريم.' : 'Please enter your name.';
    } else if (name.trim().length < 2) {
      newErrors.name = isAr ? 'الاسم يجب ألا يقل عن حرفين.' : 'Name must be at least 2 characters.';
    }

    const trimmedEmail = clientEmail.trim();
    const trimmedWhatsapp = whatsappNumber.trim();

    if (contactMethod === 'Email') {
      if (!trimmedEmail) {
        newErrors.email = isAr ? 'يرجى إدخال بريدك الإلكتروني.' : 'Please enter your email address.';
      } else if (!EMAIL_REGEX.test(trimmedEmail)) {
        newErrors.email = isAr
          ? 'يرجى إدخال بريد إلكتروني صالح (مثال: name@example.com).'
          : 'Please enter a valid email address.';
      }
    } else if (contactMethod === 'WhatsApp') {
      if (!trimmedWhatsapp) {
        newErrors.whatsapp = isAr
          ? 'يرجى إدخال رقم الواتساب الخاص بك.'
          : 'Please enter your WhatsApp number.';
      } else if (!PHONE_REGEX.test(trimmedWhatsapp)) {
        newErrors.whatsapp = isAr
          ? 'يرجى إدخال رقم هاتف صالح مع رمز الدولة (مثال: +201000000000).'
          : 'Please enter a valid WhatsApp number with country code.';
      }
    } else if (contactMethod === 'Both') {
      if (!trimmedEmail) {
        newErrors.email = isAr ? 'يرجى إدخال البريد الإلكتروني.' : 'Please enter your email address.';
      } else if (!EMAIL_REGEX.test(trimmedEmail)) {
        newErrors.email = isAr ? 'صيغة البريد الإلكتروني غير صحيحة.' : 'Please enter a valid email.';
      }

      if (!trimmedWhatsapp) {
        newErrors.whatsapp = isAr ? 'يرجى إدخال رقم الواتساب.' : 'Please enter your WhatsApp number.';
      } else if (!PHONE_REGEX.test(trimmedWhatsapp)) {
        newErrors.whatsapp = isAr
          ? 'يرجى إدخال رقم هاتف صالح مع رمز الدولة.'
          : 'Please enter a valid WhatsApp number.';
      }
    }

    if (!trimmedEmail && !trimmedWhatsapp) {
      newErrors.contactMethod = isAr
        ? 'يرجى تقديم بريد إلكتروني أو رقم واتساب على الأقل حتى أتمكن من الرد عليك.'
        : 'Please provide an email address or WhatsApp number so I can contact you.';
    }

    if (!description.trim()) {
      newErrors.description = isAr
        ? 'يرجى كتابة نبذة عن مشروعك أو أهدافك.'
        : 'Please describe what you are looking to create.';
    } else if (description.trim().length < 5) {
      newErrors.description = isAr
        ? 'الوصف قصير جداً. يرجى توضيح فكرة مشروعك بشكل أكبر.'
        : 'Description is too brief. Please provide a little more detail.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanLinks = referenceLinks.map((l) => l.trim()).filter((l) => l.length > 0);
      const cleanFiles = uploadedFiles.map((f) => f.url);

      const payload = {
        name: name.trim(),
        contactMethod,
        email: clientEmail.trim() || undefined,
        whatsapp: whatsappNumber.trim() || undefined,
        services: selectedServices,
        description: description.trim(),
        budget: budget || undefined,
        referenceLinks: cleanLinks,
        referenceFiles: cleanFiles,
        googleDriveUrl: googleDriveUrl.trim() || undefined,
      };

      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || t('contact.form.errorDefault'));
      }

      // Success
      setSubmitted(true);
      // Reset form fields
      setName('');
      setClientEmail('');
      setWhatsappNumber('');
      setSelectedServices([]);
      setDescription('');
      setBudget('');
      setReferenceLinks(['']);
      setUploadedFiles([]);
      setGoogleDriveUrl('');
      setErrors({});
    } catch (err: any) {
      console.error('Inquiry submission error:', err);
      setSubmitError(err.message || t('contact.form.errorDefault'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setSubmitError(null);
    setErrors({});
    const contactElem = document.getElementById('contact');
    if (contactElem) {
      contactElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="contact" className="relative py-24 md:py-36 bg-[#10141C] overflow-hidden">
      {/* Background Accent Halo */}
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[#F59E0B]/08 blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Bold Headline & Direct Channels */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#F59E0B]">
                {t('contact.eyebrow')}
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#F0F3F6] mb-6 leading-[1.1]">
              {t('contact.heading')}
            </h2>

            <p className="text-base sm:text-lg text-[#94A3B8] max-w-lg mb-10 font-light leading-relaxed">
              {t('contact.subheading')}
            </p>

            {/* Direct Channel Cards */}
            <div className="flex flex-col gap-3 w-full sm:w-auto">
              <div className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]/70 mb-1">
                {t('contact.directChannels')}
              </div>

              {/* WhatsApp Direct */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-6 p-4 px-6 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 hover:border-[#F59E0B]/50 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#07090D] flex items-center justify-center text-[#25D366]">
                    <WhatsAppIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-[#94A3B8]">WhatsApp Chat</div>
                    <div className="text-sm font-bold text-[#F0F3F6] group-hover:text-[#F59E0B] transition-colors">
                      +20 109 246 3750
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#F59E0B] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </a>

              {/* Email Direct */}
              <a
                href={`mailto:${email}`}
                className="group flex items-center justify-between gap-6 p-4 px-6 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 hover:border-[#F59E0B]/50 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#07090D] flex items-center justify-center text-[#F59E0B]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-[#94A3B8]">Direct Email</div>
                    <div className="text-sm font-bold text-[#F0F3F6] group-hover:text-[#F59E0B] transition-colors">
                      {email}
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#F59E0B] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </a>

              {/* LinkedIn Direct */}
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-6 p-4 px-6 rounded-2xl bg-[#151A23] border border-[#F0F3F6]/10 hover:border-[#F59E0B]/50 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#07090D] flex items-center justify-center text-[#0A66C2]">
                    <LinkedInIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-[#94A3B8]">LinkedIn Network</div>
                    <div className="text-sm font-bold text-[#F0F3F6] group-hover:text-[#F59E0B] transition-colors">
                      Islam Ahmed
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#F59E0B] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </a>
            </div>
          </div>

          {/* Right Column: Project Inquiry Form */}
          <div className="lg:col-span-7 w-full">
            <div className="p-7 sm:p-10 rounded-3xl bg-[#151A23]/80 border border-[#F0F3F6]/10 backdrop-blur-xl shadow-2xl transition-all">
              {submitted ? (
                /* Success State */
                <div className="py-14 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/40 flex items-center justify-center text-[#F59E0B] mb-5 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#F0F3F6] mb-3">
                    {t('contact.form.successTitle')}
                  </h3>
                  <p className="text-sm sm:text-base text-[#94A3B8] max-w-md mb-8 leading-relaxed">
                    {t('contact.form.successMessage')}
                  </p>
                  <button
                    onClick={handleReset}
                    type="button"
                    className="px-8 py-3.5 rounded-full bg-[#F0F3F6]/10 hover:bg-[#F59E0B] text-[#F0F3F6] hover:text-[#07090D] font-bold text-sm transition-all duration-300 border border-[#F0F3F6]/15 hover:border-[#F59E0B]"
                  >
                    {t('contact.form.backToPortfolio')}
                  </button>
                </div>
              ) : (
                /* Interactive Inquiry Form */
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
                  {/* General Submit Error Alert */}
                  {submitError && (
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-300 text-sm">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* 1. Client Name */}
                  <div>
                    <label className="block text-xs font-mono text-[#F0F3F6] uppercase tracking-wider mb-2">
                      {t('contact.form.name')} <span className="text-[#F59E0B]">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors({ ...errors, name: '' });
                      }}
                      placeholder={t('contact.form.namePlaceholder')}
                      className={`w-full px-5 py-3.5 rounded-2xl bg-[#10141C] border text-sm text-[#F0F3F6] placeholder-[#94A3B8]/40 focus:outline-none transition-colors ${
                        errors.name
                          ? 'border-red-500/60 focus:border-red-500'
                          : 'border-[#F0F3F6]/10 focus:border-[#F59E0B]'
                      }`}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
                      </p>
                    )}
                  </div>

                  {/* 2. Preferred Contact Method */}
                  <div>
                    <label className="block text-xs font-mono text-[#F0F3F6] uppercase tracking-wider mb-2">
                      {t('contact.form.contactMethod')} <span className="text-[#F59E0B]">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                      {(['Email', 'WhatsApp', 'Both'] as PreferredContactMethod[]).map((method) => {
                        const isSelected = contactMethod === method;
                        const labelText =
                          method === 'Email'
                            ? isAr ? 'البريد الإلكتروني' : 'Email'
                            : method === 'WhatsApp'
                            ? isAr ? 'واتساب' : 'WhatsApp'
                            : isAr ? 'كلاهما' : 'Both';

                        return (
                          <button
                            key={method}
                            type="button"
                            onClick={() => {
                              setContactMethod(method);
                              if (errors.contactMethod) {
                                setErrors({ ...errors, contactMethod: '' });
                              }
                            }}
                            className={`py-3 px-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 border ${
                              isSelected
                                ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B] shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                : 'bg-[#10141C] text-[#94A3B8] border-[#F0F3F6]/10 hover:border-[#F0F3F6]/25 hover:text-[#F0F3F6]'
                            }`}
                          >
                            {method === 'Email' && <Mail className="w-3.5 h-3.5" />}
                            {method === 'WhatsApp' && <WhatsAppIcon className="w-3.5 h-3.5" />}
                            {method === 'Both' && <Sparkles className="w-3.5 h-3.5" />}
                            <span>{labelText}</span>
                          </button>
                        );
                      })}
                    </div>
                    {errors.contactMethod && (
                      <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.contactMethod}
                      </p>
                    )}
                  </div>

                  {/* Conditional Contact Fields */}
                  {(contactMethod === 'Email' || contactMethod === 'Both') && (
                    <div>
                      <label className="block text-xs font-mono text-[#F0F3F6] uppercase tracking-wider mb-2">
                        {t('contact.form.email')} <span className="text-[#F59E0B]">*</span>
                      </label>
                      <input
                        type="email"
                        value={clientEmail}
                        onChange={(e) => {
                          setClientEmail(e.target.value);
                          if (errors.email) setErrors({ ...errors, email: '' });
                        }}
                        placeholder={t('contact.form.emailPlaceholder')}
                        className={`w-full px-5 py-3.5 rounded-2xl bg-[#10141C] border text-sm text-[#F0F3F6] placeholder-[#94A3B8]/40 focus:outline-none transition-colors ${
                          errors.email
                            ? 'border-red-500/60 focus:border-red-500'
                            : 'border-[#F0F3F6]/10 focus:border-[#F59E0B]'
                        }`}
                      />
                      {errors.email && (
                        <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {errors.email}
                        </p>
                      )}
                    </div>
                  )}

                  {(contactMethod === 'WhatsApp' || contactMethod === 'Both') && (
                    <div>
                      <label className="block text-xs font-mono text-[#F0F3F6] uppercase tracking-wider mb-2">
                        {t('contact.form.whatsapp')} <span className="text-[#F59E0B]">*</span>
                      </label>
                      <input
                        type="tel"
                        value={whatsappNumber}
                        onChange={(e) => {
                          setWhatsappNumber(e.target.value);
                          if (errors.whatsapp) setErrors({ ...errors, whatsapp: '' });
                        }}
                        placeholder={t('contact.form.whatsappPlaceholder')}
                        className={`w-full px-5 py-3.5 rounded-2xl bg-[#10141C] border text-sm text-[#F0F3F6] placeholder-[#94A3B8]/40 focus:outline-none transition-colors ${
                          errors.whatsapp
                            ? 'border-red-500/60 focus:border-red-500'
                            : 'border-[#F0F3F6]/10 focus:border-[#F59E0B]'
                        }`}
                      />
                      {errors.whatsapp && (
                        <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {errors.whatsapp}
                        </p>
                      )}
                    </div>
                  )}

                  {/* 3. Service / Project Type Multi-select */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-mono text-[#F0F3F6] uppercase tracking-wider">
                        {t('contact.form.services')}
                      </label>
                      <span className="text-[11px] text-[#94A3B8]/60 font-mono">
                        {isAr ? 'حدد خدمة أو أكثر' : 'Select one or more'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {SERVICE_OPTIONS.map((srv) => {
                        const isSelected = selectedServices.includes(srv.label);
                        return (
                          <button
                            key={srv.id}
                            type="button"
                            onClick={() => toggleService(srv.label)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 border flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B] shadow-[0_0_12px_rgba(245,158,11,0.18)]'
                                : 'bg-[#10141C] text-[#94A3B8] border-[#F0F3F6]/10 hover:border-[#F0F3F6]/25 hover:text-[#F0F3F6]'
                            }`}
                          >
                            {isSelected && <span className="text-xs text-[#F59E0B]">✓</span>}
                            <span>{isAr ? srv.labelAr : srv.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. Project Description */}
                  <div>
                    <label className="block text-xs font-mono text-[#F0F3F6] uppercase tracking-wider mb-2">
                      {t('contact.form.description')} <span className="text-[#F59E0B]">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        if (errors.description) setErrors({ ...errors, description: '' });
                      }}
                      placeholder={t('contact.form.descriptionPlaceholder')}
                      className={`w-full px-5 py-3.5 rounded-2xl bg-[#10141C] border text-sm text-[#F0F3F6] placeholder-[#94A3B8]/40 focus:outline-none transition-colors resize-none ${
                        errors.description
                          ? 'border-red-500/60 focus:border-red-500'
                          : 'border-[#F0F3F6]/10 focus:border-[#F59E0B]'
                      }`}
                    />
                    {errors.description && (
                      <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.description}
                      </p>
                    )}
                  </div>

                  {/* 5. Estimated Budget */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-mono text-[#F0F3F6] uppercase tracking-wider">
                        {t('contact.form.budget')}{' '}
                        <span className="text-[#94A3B8]/60 font-normal lowercase">
                          {t('contact.form.budgetOptional')}
                        </span>
                      </label>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {BUDGET_OPTIONS.map((opt) => {
                        const isSelected = budget === opt;
                        const labelText = isAr ? BUDGET_OPTIONS_AR[opt] || opt : opt;

                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setBudget(isSelected ? '' : opt)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 border ${
                              isSelected
                                ? 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B] shadow-[0_0_12px_rgba(245,158,11,0.18)]'
                                : 'bg-[#10141C] text-[#94A3B8] border-[#F0F3F6]/10 hover:border-[#F0F3F6]/25 hover:text-[#F0F3F6]'
                            }`}
                          >
                            {labelText}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 6. Project References Section */}
                  <div className="pt-4 border-t border-[#F0F3F6]/10">
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-[#F0F3F6] flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#F59E0B]" />
                        <span>{t('contact.form.references')}</span>
                      </h4>
                      <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                        {t('contact.form.referencesSubtitle')}
                      </p>
                    </div>

                    {/* Option A: Upload Files */}
                    <div className="mb-5">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="inquiry-file-upload"
                      />

                      <label
                        htmlFor="inquiry-file-upload"
                        className={`w-full p-4 rounded-2xl border-2 border-dashed border-[#F0F3F6]/15 hover:border-[#F59E0B]/50 bg-[#10141C]/60 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 group ${
                          isUploadingFile ? 'opacity-60 pointer-events-none' : ''
                        }`}
                      >
                        {isUploadingFile ? (
                          <div className="flex items-center gap-2 text-xs text-[#F59E0B]">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{isAr ? 'جارٍ رفع الملفات...' : 'Uploading reference files...'}</span>
                          </div>
                        ) : (
                          <>
                            <UploadCloud className="w-6 h-6 text-[#94A3B8] group-hover:text-[#F59E0B] group-hover:scale-110 transition-all duration-300" />
                            <div className="text-center">
                              <span className="text-xs font-semibold text-[#F0F3F6] group-hover:text-[#F59E0B] transition-colors">
                                {t('contact.form.uploadFiles')}
                              </span>
                              <span className="block text-[11px] text-[#94A3B8]/60 mt-0.5">
                                {t('contact.form.uploadFilesHint')}
                              </span>
                            </div>
                          </>
                        )}
                      </label>

                      {uploadError && (
                        <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{uploadError}</span>
                        </p>
                      )}

                      {/* Uploaded Files Preview List */}
                      {uploadedFiles.length > 0 && (
                        <div className="mt-3 flex flex-col gap-2">
                          {uploadedFiles.map((file, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2.5 px-3 rounded-xl bg-[#10141C] border border-[#F0F3F6]/10 text-xs"
                            >
                              <div className="flex items-center gap-2 overflow-hidden pr-2">
                                <FileText className="w-3.5 h-3.5 text-[#F59E0B] flex-shrink-0" />
                                <span className="truncate text-[#F0F3F6] max-w-[200px] sm:max-w-xs font-mono">
                                  {file.name}
                                </span>
                                <span className="text-[10px] text-[#94A3B8]/60 font-mono">
                                  ({(file.sizeBytes / (1024 * 1024)).toFixed(1)} MB)
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeUploadedFile(idx)}
                                className="text-[#94A3B8] hover:text-red-400 p-1 transition-colors"
                                title="Remove file"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Option B & C: Reference Links */}
                    <div className="mb-4">
                      <label className="block text-xs font-mono text-[#F0F3F6] uppercase tracking-wider mb-2">
                        {t('contact.form.referenceLink')}
                      </label>

                      <div className="flex flex-col gap-2">
                        {referenceLinks.map((link, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <LinkIcon className="w-3.5 h-3.5 text-[#94A3B8]/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                              <input
                                type="url"
                                value={link}
                                onChange={(e) => handleLinkChange(idx, e.target.value)}
                                placeholder="https://behance.net/gallery/... or pinterest.com/..."
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#10141C] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6] placeholder-[#94A3B8]/40 focus:outline-none focus:border-[#F59E0B] transition-colors"
                              />
                            </div>
                            {referenceLinks.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeReferenceLink(idx)}
                                className="w-8 h-8 rounded-xl bg-[#10141C] border border-[#F0F3F6]/10 flex items-center justify-center text-[#94A3B8] hover:text-red-400 transition-colors"
                                title="Remove link"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {referenceLinks.length < 5 && (
                        <button
                          type="button"
                          onClick={addReferenceLink}
                          className="mt-2 text-xs font-mono text-[#F59E0B] hover:text-[#FF7A18] flex items-center gap-1 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{t('contact.form.addReferenceLink')}</span>
                        </button>
                      )}
                    </div>

                    {/* Google Drive Option */}
                    <div className="p-4 rounded-2xl bg-[#10141C]/50 border border-[#F0F3F6]/08">
                      <label className="block text-xs font-mono text-[#94A3B8] mb-1.5 leading-relaxed">
                        {t('contact.form.googleDriveHint')}
                      </label>
                      <input
                        type="url"
                        value={googleDriveUrl}
                        onChange={(e) => setGoogleDriveUrl(e.target.value)}
                        placeholder={t('contact.form.googleDrivePlaceholder')}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#10141C] border border-[#F0F3F6]/10 text-xs text-[#F0F3F6] placeholder-[#94A3B8]/40 focus:outline-none focus:border-[#F59E0B] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploadingFile}
                    className="w-full mt-3 py-4 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FF7A18] text-[#07090D] font-bold text-sm flex items-center justify-center gap-2 hover:shadow-[0_0_28px_rgba(245,158,11,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{t('contact.form.sending')}</span>
                      </>
                    ) : (
                      <>
                        <span>{t('contact.form.send')}</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
