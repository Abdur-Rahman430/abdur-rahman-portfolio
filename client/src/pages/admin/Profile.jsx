import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import {
  fetchProfile,
  saveProfile,
  uploadProfileImage,
  uploadResume,
} from '../../services/profileApi.js';
import {
  User,
  Briefcase,
  GraduationCap,
  FileText,
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Trash2,
  Save,
  Sparkles,
} from 'lucide-react';

const INITIAL_DEFAULTS = {
  fullName: 'Abdur Rahman',
  professionalTitle: 'Software Engineer | Web Developer | Cybersecurity Enthusiast',
  shortIntroduction:
    'I am a Software Engineering student and aspiring software engineer passionate about building modern, secure, and scalable digital solutions. I enjoy creating user-focused web applications, solving complex problems, and exploring cybersecurity to build technology that is both powerful and secure.',
  aboutMe: '',
  university: 'Daffodil International University',
  department: 'Software Engineering',
  currentStatus: 'Final Year Student',
  graduationYear: '2027',
  careerObjective: '',
  profileImage: '',
  resumeFile: '',
};

export default function AdminProfile() {
  const { token } = useAuth();
  const imageInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  const [formData, setFormData] = useState(INITIAL_DEFAULTS);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Load profile from API on mount
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const response = await fetchProfile();
        if (isMounted) {
          if (response.success && response.data) {
            setFormData({
              fullName: response.data.fullName || '',
              professionalTitle: response.data.professionalTitle || '',
              shortIntroduction: response.data.shortIntroduction || '',
              aboutMe: response.data.aboutMe || '',
              university: response.data.university || '',
              department: response.data.department || '',
              currentStatus: response.data.currentStatus || '',
              graduationYear: response.data.graduationYear || '',
              careerObjective: response.data.careerObjective || '',
              profileImage: response.data.profileImage || '',
              resumeFile: response.data.resumeFile || '',
            });
          } else {
            // Empty database: preserve safe portfolio default values
            setFormData(INITIAL_DEFAULTS);
          }
        }
      } catch {
        if (isMounted) {
          setErrorMessage('Could not load profile from server. Initialized with defaults.');
        }
      } finally {
        if (isMounted) {
          setInitialLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full Name is required';
    } else if (formData.fullName.trim().length < 2 || formData.fullName.trim().length > 100) {
      errors.fullName = 'Full Name must be between 2 and 100 characters';
    }

    if (formData.professionalTitle && formData.professionalTitle.length > 200) {
      errors.professionalTitle = 'Professional Title cannot exceed 200 characters';
    }

    if (formData.shortIntroduction && formData.shortIntroduction.length > 1000) {
      errors.shortIntroduction = 'Short Introduction cannot exceed 1000 characters';
    }

    if (formData.aboutMe && formData.aboutMe.length > 5000) {
      errors.aboutMe = 'About Me cannot exceed 5000 characters';
    }

    if (formData.university && formData.university.length > 200) {
      errors.university = 'University cannot exceed 200 characters';
    }

    if (formData.department && formData.department.length > 200) {
      errors.department = 'Department cannot exceed 200 characters';
    }

    if (formData.currentStatus && formData.currentStatus.length > 100) {
      errors.currentStatus = 'Current Status cannot exceed 100 characters';
    }

    if (formData.graduationYear && String(formData.graduationYear).trim()) {
      const yr = String(formData.graduationYear).trim();
      const yrNum = Number(yr);
      if (!/^\d{4}$/.test(yr) || isNaN(yrNum) || yrNum < 1950 || yrNum > 2100) {
        errors.graduationYear = 'Graduation Year must be a 4-digit year (1950–2100)';
      }
    }

    if (formData.careerObjective && formData.careerObjective.length > 2000) {
      errors.careerObjective = 'Career Objective cannot exceed 2000 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (isSaving) return;

    if (!validate()) {
      setErrorMessage('Please fix the highlighted validation errors before saving.');
      return;
    }

    setIsSaving(true);

    try {
      const response = await saveProfile(formData, token);
      if (response.success && response.data) {
        setSuccessMessage('Profile saved successfully! Data is synchronized with MongoDB.');
        setFormData((prev) => ({
          ...prev,
          ...response.data,
        }));
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Image Upload Handler
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSuccessMessage('');
    setErrorMessage('');

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setErrorMessage('Invalid image format. Please select a JPG, PNG, or WebP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 5MB limit.');
      return;
    }

    setImageUploading(true);

    try {
      const res = await uploadProfileImage(file, token);
      if (res.success && res.data?.profileImage) {
        setFormData((prev) => ({ ...prev, profileImage: res.data.profileImage }));
        setSuccessMessage('Profile image uploaded successfully!');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to upload profile image.');
    } finally {
      setImageUploading(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  // Resume Upload Handler
  const handleResumeFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSuccessMessage('');
    setErrorMessage('');

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Invalid resume format. Only PDF files are accepted.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Resume PDF size exceeds 10MB limit.');
      return;
    }

    setResumeUploading(true);

    try {
      const res = await uploadResume(file, token);
      if (res.success && res.data?.resumeFile) {
        setFormData((prev) => ({ ...prev, resumeFile: res.data.resumeFile }));
        setSuccessMessage('Resume PDF uploaded and saved successfully!');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to upload resume.');
    } finally {
      setResumeUploading(false);
      if (resumeInputRef.current) {
        resumeInputRef.current.value = '';
      }
    }
  };

  const removeProfileImage = () => {
    setFormData((prev) => ({ ...prev, profileImage: '' }));
  };

  const removeResumeFile = () => {
    setFormData((prev) => ({ ...prev, resumeFile: '' }));
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
        <p className="text-xs text-zinc-400">Loading profile data from database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Master Plan Step 5</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">Dynamic Profile Management</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Update personal information, academic credentials, profile picture, and downloadable resume.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving || imageUploading || resumeUploading}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20 cursor-pointer shrink-0"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Profile</span>
            </>
          )}
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8" noValidate>
        {/* Section 1: Basic Information */}
        <section className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-800">
            <User className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
              1. Basic Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="fullName" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Abdur Rahman"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all ${
                  fieldErrors.fullName
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                }`}
              />
              {fieldErrors.fullName && (
                <p className="mt-1.5 text-xs text-red-400">{fieldErrors.fullName}</p>
              )}
            </div>

            <div>
              <label htmlFor="professionalTitle" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Professional Title
              </label>
              <input
                id="professionalTitle"
                name="professionalTitle"
                type="text"
                value={formData.professionalTitle}
                onChange={handleChange}
                placeholder="e.g. Software Engineer | Web Developer | Cybersecurity Enthusiast"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all ${
                  fieldErrors.professionalTitle
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                }`}
              />
              {fieldErrors.professionalTitle && (
                <p className="mt-1.5 text-xs text-red-400">{fieldErrors.professionalTitle}</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="shortIntroduction" className="block text-xs font-medium text-zinc-300">
                Short Introduction (Hero Tagline)
              </label>
              <span className="text-[11px] text-zinc-500 font-mono">
                {formData.shortIntroduction.length}/1000
              </span>
            </div>
            <textarea
              id="shortIntroduction"
              name="shortIntroduction"
              rows={3}
              value={formData.shortIntroduction}
              onChange={handleChange}
              placeholder="Brief introduction summarizing your core engineering focus..."
              className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all ${
                fieldErrors.shortIntroduction
                  ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/20'
              }`}
            />
            {fieldErrors.shortIntroduction && (
              <p className="mt-1.5 text-xs text-red-400">{fieldErrors.shortIntroduction}</p>
            )}
          </div>
        </section>

        {/* Section 2: About & Career Objective */}
        <section className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-800">
            <Briefcase className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
              2. About & Career Objectives
            </h2>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="aboutMe" className="block text-xs font-medium text-zinc-300">
                About Me (Full Story & Background)
              </label>
              <span className="text-[11px] text-zinc-500 font-mono">
                {formData.aboutMe.length}/5000
              </span>
            </div>
            <textarea
              id="aboutMe"
              name="aboutMe"
              rows={5}
              value={formData.aboutMe}
              onChange={handleChange}
              placeholder="Comprehensive details about your background, projects, journey, and technical philosophy..."
              className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all ${
                fieldErrors.aboutMe
                  ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/20'
              }`}
            />
            {fieldErrors.aboutMe && (
              <p className="mt-1.5 text-xs text-red-400">{fieldErrors.aboutMe}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="careerObjective" className="block text-xs font-medium text-zinc-300">
                Career Objective
              </label>
              <span className="text-[11px] text-zinc-500 font-mono">
                {formData.careerObjective.length}/2000
              </span>
            </div>
            <textarea
              id="careerObjective"
              name="careerObjective"
              rows={3}
              value={formData.careerObjective}
              onChange={handleChange}
              placeholder="Your target roles, engineering aspirations, and technical vision..."
              className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all ${
                fieldErrors.careerObjective
                  ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/20'
              }`}
            />
            {fieldErrors.careerObjective && (
              <p className="mt-1.5 text-xs text-red-400">{fieldErrors.careerObjective}</p>
            )}
          </div>
        </section>

        {/* Section 3: Education & Academic Status */}
        <section className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-800">
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
              3. Education & Current Status
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="university" className="block text-xs font-medium text-zinc-300 mb-1.5">
                University
              </label>
              <input
                id="university"
                name="university"
                type="text"
                value={formData.university}
                onChange={handleChange}
                placeholder="e.g. Daffodil International University"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all ${
                  fieldErrors.university
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                }`}
              />
              {fieldErrors.university && (
                <p className="mt-1.5 text-xs text-red-400">{fieldErrors.university}</p>
              )}
            </div>

            <div>
              <label htmlFor="department" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Department
              </label>
              <input
                id="department"
                name="department"
                type="text"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. Software Engineering"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all ${
                  fieldErrors.department
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                }`}
              />
              {fieldErrors.department && (
                <p className="mt-1.5 text-xs text-red-400">{fieldErrors.department}</p>
              )}
            </div>

            <div>
              <label htmlFor="currentStatus" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Current Status
              </label>
              <input
                id="currentStatus"
                name="currentStatus"
                type="text"
                value={formData.currentStatus}
                onChange={handleChange}
                placeholder="e.g. Final Year Student"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all ${
                  fieldErrors.currentStatus
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                }`}
              />
              {fieldErrors.currentStatus && (
                <p className="mt-1.5 text-xs text-red-400">{fieldErrors.currentStatus}</p>
              )}
            </div>

            <div>
              <label htmlFor="graduationYear" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Graduation Year
              </label>
              <input
                id="graduationYear"
                name="graduationYear"
                type="text"
                value={formData.graduationYear}
                onChange={handleChange}
                placeholder="e.g. 2027"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all ${
                  fieldErrors.graduationYear
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                }`}
              />
              {fieldErrors.graduationYear && (
                <p className="mt-1.5 text-xs text-red-400">{fieldErrors.graduationYear}</p>
              )}
            </div>
          </div>
        </section>

        {/* Section 4: Profile Image Upload */}
        <section className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-800">
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
              4. Profile Picture
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Image Preview Container */}
            <div className="w-28 h-28 rounded-2xl bg-zinc-950 border-2 border-dashed border-zinc-800 flex items-center justify-center overflow-hidden shrink-0 relative group">
              {formData.profileImage ? (
                <img
                  src={formData.profileImage}
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-zinc-600" />
              )}
              {imageUploading && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                </div>
              )}
            </div>

            {/* Upload Controls */}
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-zinc-200">Upload new photo</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Accepted formats: JPG, JPEG, PNG, or WebP. Max file size: 5MB.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="file"
                  ref={imageInputRef}
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleImageFileChange}
                  className="hidden"
                  id="profile-image-upload"
                />
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={imageUploading || isSaving}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{formData.profileImage ? 'Change Image' : 'Select Image'}</span>
                </button>

                {formData.profileImage && (
                  <button
                    type="button"
                    onClick={removeProfileImage}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              {formData.profileImage && (
                <p className="text-[11px] font-mono text-zinc-500 truncate max-w-md">
                  Path: {formData.profileImage}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Section 5: Resume PDF Upload */}
        <section className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-800">
            <FileText className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
              5. Resume Document
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-200">Curriculum Vitae / Resume</p>
                <p className="text-[11px] text-zinc-500">
                  {formData.resumeFile ? 'PDF document attached' : 'No PDF resume uploaded yet'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                type="file"
                ref={resumeInputRef}
                accept=".pdf,application/pdf"
                onChange={handleResumeFileChange}
                className="hidden"
                id="resume-pdf-upload"
              />
              <button
                type="button"
                onClick={() => resumeInputRef.current?.click()}
                disabled={resumeUploading || isSaving}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {resumeUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>{formData.resumeFile ? 'Replace PDF' : 'Upload PDF'}</span>
                  </>
                )}
              </button>

              {formData.resumeFile && (
                <>
                  <a
                    href={formData.resumeFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Resume</span>
                  </a>

                  <button
                    type="button"
                    onClick={removeResumeFile}
                    className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Detach Resume"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
          <p className="text-[11px] text-zinc-500">
            Accepted format: PDF only. Maximum file size: 10MB. This file will be served directly to visitors downloading your resume from the public portfolio.
          </p>
        </section>

        {/* Bottom Save Button Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
          <button
            type="submit"
            disabled={isSaving || imageUploading || resumeUploading}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
