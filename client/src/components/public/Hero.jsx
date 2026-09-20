import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchProfile } from '../../services/profileApi.js';
import { fetchSocialLinks } from '../../services/socialLinksApi.js';
import { getMediaUrl } from '../../utils/mediaUtils.js';
import {
  ArrowRight,
  Download,
  Mail,
  Globe,
  Link as LinkIcon,
  Code2,
  FolderGit2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

// Safe icon dictionary for social platforms
const SOCIAL_ICONS = {
  GitHub: FolderGit2,
  LinkedIn: Globe,
  Facebook: Globe,
  Instagram: Globe,
  YouTube: Globe,
  X: Globe,
  Email: Mail,
  Telegram: Globe,
  Discord: Globe,
  WhatsApp: Globe,
  Other: LinkIcon,
  Globe,
  Link: LinkIcon,
  Mail,
  ExternalLink,
};

function resolveSocialIcon(iconName, platform) {
  const Icon =
    (iconName && SOCIAL_ICONS[iconName]) ||
    (platform && SOCIAL_ICONS[platform]) ||
    Globe;
  return <Icon className="w-4 h-4" />;
}

// Fallback defaults for safety when profile is null or API is initializing
const DEFAULT_HERO = {
  fullName: 'Abdur Rahman',
  professionalTitle: 'Software Engineer & Developer',
  shortIntroduction:
    'Passionate full-stack software engineer specializing in scalable modern web applications, distributed systems, and cybersecurity research.',
  currentStatus: 'Open to Opportunities',
  profileImage: '',
  resumeFile: '',
};

// Extract initials for fallback avatar (e.g. "Abdur Rahman" -> "AR")
function getInitials(name) {
  if (!name || typeof name !== 'string') return 'AR';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return 'AR';
}

export default function Hero() {
  const [profile, setProfile] = useState(DEFAULT_HERO);
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadHeroData() {
      try {
        const [profileRes, socialRes] = await Promise.allSettled([
          fetchProfile(),
          fetchSocialLinks(),
        ]);

        if (isMounted) {
          if (profileRes.status === 'fulfilled' && profileRes.value?.success && profileRes.value?.data) {
            const data = profileRes.value.data;
            setProfile({
              fullName: data.fullName || DEFAULT_HERO.fullName,
              professionalTitle: data.professionalTitle || DEFAULT_HERO.professionalTitle,
              shortIntroduction: data.shortIntroduction || DEFAULT_HERO.shortIntroduction,
              currentStatus: data.currentStatus || '',
              profileImage: data.profileImage || '',
              resumeFile: data.resumeFile || '',
            });
          }

          if (socialRes.status === 'fulfilled' && socialRes.value?.success && Array.isArray(socialRes.value?.data)) {
            setSocialLinks(socialRes.value.data);
          }
        }
      } catch {
        // Safe fallbacks remain active on any network or execution failure
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadHeroData();
    return () => {
      isMounted = false;
    };
  }, []);

  const hasImage = Boolean(profile.profileImage && !imgError);
  const initials = getInitials(profile.fullName);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  const avatarVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  if (loading) {
    return (
      <section
        id="hero"
        className="scroll-mt-24 sm:scroll-mt-28 min-h-[75vh] flex items-center justify-center max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-20"
      >
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center animate-pulse">
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="h-6 w-36 bg-zinc-900 border border-zinc-800 rounded-full" />
            <div className="h-12 w-3/4 bg-zinc-900 border border-zinc-800 rounded-2xl" />
            <div className="h-6 w-1/2 bg-zinc-900 border border-zinc-800 rounded-xl" />
            <div className="space-y-2 pt-2">
              <div className="h-4 w-full bg-zinc-900 border border-zinc-800 rounded" />
              <div className="h-4 w-5/6 bg-zinc-900 border border-zinc-800 rounded" />
            </div>
            <div className="flex gap-4 pt-4">
              <div className="h-11 w-36 bg-zinc-900 border border-zinc-800 rounded-xl" />
              <div className="h-11 w-32 bg-zinc-900 border border-zinc-800 rounded-xl" />
            </div>
          </div>
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-3xl bg-zinc-900 border border-zinc-800" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="hero"
      className="scroll-mt-24 sm:scroll-mt-28 min-h-[75vh] flex items-center justify-center max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-20 relative overflow-hidden"
    >
      {/* Background radial glow */}
      <div className="hidden sm:block absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.08)_0%,transparent_70%)] pointer-events-none -z-10" />
      <div className="hidden sm:block absolute bottom-10 right-1/4 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.05)_0%,transparent_70%)] pointer-events-none -z-10" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center"
      >
        {/* Left Column: Text & CTAs */}
        <div className="lg:col-span-7 space-y-6 text-left order-2 lg:order-1">
          {/* Status Badge */}
          {profile.currentStatus && (
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {profile.currentStatus}
              </span>
            </motion.div>
          )}

          {/* Main Headline */}
          <div className="space-y-2">
            <motion.p
              variants={itemVariants}
              className="text-xs sm:text-sm uppercase tracking-widest font-mono text-emerald-400/90 font-semibold"
            >
              Hello, I am
            </motion.p>
            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-100 leading-tight"
            >
              {profile.fullName}
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-xl font-semibold text-zinc-300 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{profile.professionalTitle}</span>
            </motion.p>
          </div>

          {/* Short Bio Paragraph */}
          <motion.p
            variants={itemVariants}
            className="text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed"
          >
            {profile.shortIntroduction}
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center gap-3 pt-2"
          >
            {/* Primary CTA: View Projects */}
            <a
              href="#projects"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs sm:text-sm hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <span>View My Work</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            {/* Secondary CTA: Contact */}
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 font-medium text-xs sm:text-sm hover:bg-zinc-800 hover:border-zinc-700 hover:text-white transition-all cursor-pointer"
            >
              <Mail className="w-4 h-4 text-zinc-400" />
              <span>Contact Me</span>
            </a>

            {/* Resume CTA (only when resumeFile exists) */}
            {profile.resumeFile && (
              <a
                href={getMediaUrl(profile.resumeFile)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-300 font-medium text-xs sm:text-sm hover:border-emerald-500/40 hover:text-emerald-400 hover:bg-zinc-900 transition-all"
                title="Download CV / Resume PDF"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Download Resume</span>
              </a>
            )}
          </motion.div>

          {/* Public Social Links Bar */}
          {socialLinks.length > 0 && (
            <motion.div
              variants={itemVariants}
              className="pt-4 border-t border-zinc-900 flex items-center gap-3 flex-wrap"
            >
              <span className="text-xs font-mono text-zinc-500">Connect:</span>
              <div className="flex items-center gap-2">
                {socialLinks.map((item) => (
                  <a
                    key={item._id || item.platform}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-zinc-900 transition-all"
                    title={item.platform}
                    aria-label={item.platform}
                  >
                    {resolveSocialIcon(item.icon, item.platform)}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column: Profile Image / Avatar */}
        <motion.div
          variants={avatarVariants}
          className="lg:col-span-5 flex justify-center lg:justify-end order-1 lg:order-2"
        >
          <div className="relative group">
            {/* Ambient glow behind avatar */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-sky-500/20 to-emerald-500/10 blur-xl opacity-75 group-hover:opacity-100 transition-opacity pointer-events-none" />

            {/* Avatar Frame */}
            <div className="relative w-60 h-60 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-3xl p-2 bg-zinc-900/90 border border-zinc-800/90 shadow-2xl overflow-hidden flex items-center justify-center">
              {hasImage ? (
                <img
                  src={getMediaUrl(profile.profileImage)}
                  alt={profile.fullName}
                  width="320"
                  height="320"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              ) : (
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-2xl sm:text-3xl font-bold tracking-tight shadow-inner">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-200">{profile.fullName}</p>
                    <p className="text-[11px] font-mono text-zinc-500 mt-0.5">Software Engineer</p>
                  </div>
                </div>
              )}

              {/* Decorative mini badge on avatar corner */}
              <div className="absolute bottom-4 right-4 p-2 rounded-xl bg-zinc-950/95 border border-zinc-800 text-emerald-400 shadow-lg">
                <Code2 className="w-4 h-4" />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
