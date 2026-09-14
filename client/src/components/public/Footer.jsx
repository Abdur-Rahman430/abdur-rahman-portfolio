import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { fetchWebsiteSettings } from '../../services/websiteSettingsApi.js';
import { fetchProfile } from '../../services/profileApi.js';
import { fetchSocialLinks } from '../../services/socialLinksApi.js';
import {
  Code2,
  Lock,
  ArrowUp,
  FolderGit2,
  Globe,
  Mail,
  Link as LinkIcon,
  ExternalLink,
} from 'lucide-react';

// Safe icon dictionary for social platforms matching Hero and Contact
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

const QUICK_LINKS = [
  { name: 'Home', href: '#hero' },
  { name: 'About', href: '#about' },
  { name: 'Skills', href: '#skills' },
  { name: 'Projects', href: '#projects' },
  { name: 'Experience', href: '#experience' },
  { name: 'Contact', href: '#contact' },
];

export default function Footer() {
  const [settings, setSettings] = useState(null);
  const [profile, setProfile] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    async function loadFooterData() {
      try {
        const [settingsRes, profileRes, socialRes] = await Promise.allSettled([
          fetchWebsiteSettings(),
          fetchProfile(),
          fetchSocialLinks(),
        ]);

        if (isMounted) {
          if (settingsRes.status === 'fulfilled' && settingsRes.value?.success && settingsRes.value?.data) {
            setSettings(settingsRes.value.data);
          }

          if (profileRes.status === 'fulfilled' && profileRes.value?.success && profileRes.value?.data) {
            setProfile(profileRes.value.data);
          }

          if (socialRes.status === 'fulfilled' && socialRes.value?.success && Array.isArray(socialRes.value?.data)) {
            // Only keep active links
            setSocialLinks(socialRes.value.data.filter((item) => item.active !== false));
          }
        }
      } catch {
        // Fallbacks remain in effect if requests fail
      }
    }

    loadFooterData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleNavClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();

      if (location.pathname !== '/') {
        window.location.href = `/${href}`;
        return;
      }

      const targetId = href.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();
  const brandName = profile?.fullName || settings?.websiteTitle || 'Abdur Rahman';
  const customFooterText = settings?.footerText?.trim();

  return (
    <footer
      className="border-t border-zinc-900 bg-zinc-950 text-zinc-400 relative overflow-hidden"
      role="contentinfo"
    >
      {/* Subtle top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-zinc-900">
          {/* Brand & Summary Column */}
          <div className="md:col-span-6 lg:col-span-5 space-y-4">
            <a
              href="#hero"
              onClick={(e) => handleNavClick(e, '#hero')}
              className="inline-flex items-center gap-2.5 group cursor-pointer"
              aria-label={`${brandName} - Back to top`}
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 group-hover:scale-105 group-hover:border-emerald-500/40 transition-all shadow-inner">
                <Code2 className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-zinc-100 group-hover:text-emerald-400 transition-colors">
                  {brandName}
                </span>
                {profile?.professionalTitle && (
                  <span className="text-[10px] font-mono text-zinc-500 leading-none">
                    {profile.professionalTitle}
                  </span>
                )}
              </div>
            </a>

            {profile?.shortIntroduction ? (
              <p className="text-xs sm:text-sm text-zinc-400 max-w-sm leading-relaxed">
                {profile.shortIntroduction}
              </p>
            ) : (
              <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
                Modern full-stack portfolio showcasing web applications, technical skills, and software engineering journey.
              </p>
            )}
          </div>

          {/* Quick Navigation Links */}
          <div className="md:col-span-3 lg:col-span-4 space-y-3">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-200">
              Navigation
            </h3>
            <ul className="space-y-2" aria-label="Footer Navigation">
              {QUICK_LINKS.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="text-xs text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect / Social Links */}
          <div className="md:col-span-3 lg:col-span-3 space-y-3">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-200">
              Connect
            </h3>
            {socialLinks.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1" aria-label="Social links">
                {socialLinks.map((item) => (
                  <a
                    key={item._id || item.platform}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-zinc-900 transition-all shadow-sm"
                    title={item.platform}
                    aria-label={`Visit ${item.platform}`}
                  >
                    {resolveSocialIcon(item.icon, item.platform)}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500">
                Direct connections and portfolio links.
              </p>
            )}

            {/* Quick Email link if profile provides one or contact anchor */}
            <div className="pt-2">
              <a
                href="#contact"
                onClick={(e) => handleNavClick(e, '#contact')}
                className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send a message</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Sub-bar: Copyright, Admin Login, Back to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          {/* Copyright Statement */}
          <div className="text-center sm:text-left">
            {customFooterText ? (
              <p>{customFooterText}</p>
            ) : (
              <p>
                © {currentYear} {brandName}. All rights reserved.
              </p>
            )}
          </div>

          {/* Actions: Admin Console & Back to Top */}
          <div className="flex items-center gap-4">
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
              title="Admin Console"
              aria-label="Admin Console Login"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-500/80" />
              <span>Admin Console</span>
            </Link>

            <span className="text-zinc-800" aria-hidden="true">•</span>

            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-zinc-900 transition-all cursor-pointer"
              title="Scroll to top of page"
              aria-label="Back to top"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
