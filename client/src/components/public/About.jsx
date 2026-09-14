import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchProfile } from '../../services/profileApi.js';
import {
  User,
  GraduationCap,
  Target,
  Briefcase,
  Download,
  Mail,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export default function About() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadAboutData() {
      try {
        const res = await fetchProfile();
        if (isMounted) {
          if (res?.success && res?.data) {
            setProfile(res.data);
          } else {
            setProfile(null);
          }
        }
      } catch {
        if (isMounted) {
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAboutData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Animation variants
  const fadeInVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: 'easeOut' },
    },
  };

  // Loading skeleton
  if (loading) {
    return (
      <section
        id="about"
        className="scroll-mt-24 sm:scroll-mt-28 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-20"
      >
        <div className="space-y-8 animate-pulse">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <div className="h-6 w-32 bg-zinc-900 border border-zinc-800 rounded-full mx-auto" />
            <div className="h-10 w-48 bg-zinc-900 border border-zinc-800 rounded-2xl mx-auto" />
            <div className="h-4 w-72 bg-zinc-900 border border-zinc-800 rounded mx-auto" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 h-64 bg-zinc-900/60 border border-zinc-800/80 rounded-3xl" />
            <div className="lg:col-span-5 space-y-4">
              <div className="h-28 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl" />
              <div className="h-28 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error boundary state
  if (error) {
    return (
      <section
        id="about"
        className="scroll-mt-24 sm:scroll-mt-28 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12"
      >
        <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-zinc-500 mx-auto" />
          <h3 className="text-sm font-semibold text-zinc-300">About Section</h3>
          <p className="text-xs text-zinc-500">About information is temporarily unavailable.</p>
        </div>
      </section>
    );
  }

  // Data availability checks
  const hasAcademic = Boolean(
    profile?.university || profile?.department || profile?.graduationYear
  );
  const hasCareer = Boolean(profile?.careerObjective || profile?.professionalTitle);
  const hasStatus = Boolean(profile?.currentStatus);
  const hasImage = Boolean(profile?.profileImage && !imgError);
  const hasResume = Boolean(profile?.resumeFile);
  const aboutText = profile?.aboutMe?.trim() || '';

  return (
    <section
      id="about"
      className="scroll-mt-24 sm:scroll-mt-28 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-20 relative"
    >
      {/* Subtle ambient background glow */}
      <div className="absolute top-1/3 right-10 w-80 h-80 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none -z-10" />

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
            <span>Get To Know Me</span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-100">
            About Me
          </h2>

          {/* Subtitle / Intro */}
          {profile?.professionalTitle && (
            <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
              {profile.professionalTitle}
            </p>
          )}
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Biography Column */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeInVariants}
            className={`${
              hasAcademic || hasCareer || hasStatus || hasImage
                ? 'lg:col-span-7'
                : 'lg:col-span-12'
            } space-y-6`}
          >
            {/* Biography Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700/80 transition-all shadow-xl space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/80">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">
                    {profile?.fullName ? `Who is ${profile.fullName}?` : 'Professional Background'}
                  </h3>
                  <p className="text-[11px] font-mono text-zinc-500">Bio &amp; Personal Overview</p>
                </div>
              </div>

              {/* Bio text with preserved line breaks */}
              {aboutText ? (
                <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line space-y-3 font-normal">
                  {aboutText}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic">
                  About information is not available yet.
                </p>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-zinc-800/80 flex flex-wrap items-center gap-3">
                {/* Resume Download (only if resumeFile exists) */}
                {hasResume && (
                  <a
                    href={profile.resumeFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Resume</span>
                  </a>
                )}

                {/* Get in Touch CTA */}
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 text-xs font-medium transition-all cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Get in Touch</span>
                  <ArrowRight className="w-3 h-3 text-zinc-500" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Highlights & Information Cards Column */}
          {(hasAcademic || hasCareer || hasStatus || hasImage) && (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeInVariants}
              className="lg:col-span-5 space-y-4"
            >
              {/* Optional Secondary Profile Image Visual */}
              {hasImage && (
                <motion.div
                  variants={cardVariants}
                  className="p-3 rounded-3xl bg-zinc-900/50 border border-zinc-800/80 shadow-lg overflow-hidden flex items-center justify-center max-h-56"
                >
                  <img
                    src={profile.profileImage}
                    alt={profile.fullName || 'Profile image'}
                    onError={() => setImgError(true)}
                    className="w-full h-48 object-cover rounded-2xl"
                    loading="lazy"
                  />
                </motion.div>
              )}

              {/* Academic Highlight Card */}
              {hasAcademic && (
                <motion.div
                  variants={cardVariants}
                  className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700/80 transition-all space-y-2 shadow-md"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-200">Academic Education</h4>
                      <p className="text-[10px] font-mono text-zinc-500">University &amp; Degree</p>
                    </div>
                  </div>
                  <div className="pt-2 pl-10 space-y-1">
                    {profile.university && (
                      <p className="text-xs font-semibold text-zinc-100">{profile.university}</p>
                    )}
                    {profile.department && (
                      <p className="text-xs text-zinc-400">{profile.department}</p>
                    )}
                    {profile.graduationYear && (
                      <p className="text-[11px] font-mono text-zinc-500 pt-0.5">
                        Class of {profile.graduationYear}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Career & Focus Card */}
              {hasCareer && (
                <motion.div
                  variants={cardVariants}
                  className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700/80 transition-all space-y-2 shadow-md"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-200">Focus &amp; Objective</h4>
                      <p className="text-[10px] font-mono text-zinc-500">Engineering Direction</p>
                    </div>
                  </div>
                  <div className="pt-2 pl-10">
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {profile.careerObjective || profile.professionalTitle}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Current Status Card */}
              {hasStatus && (
                <motion.div
                  variants={cardVariants}
                  className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700/80 transition-all space-y-2 shadow-md"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-200">Current Status</h4>
                      <p className="text-[10px] font-mono text-zinc-500">Professional Availability</p>
                    </div>
                  </div>
                  <div className="pt-2 pl-10 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-medium text-zinc-200">
                      {profile.currentStatus}
                    </span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
