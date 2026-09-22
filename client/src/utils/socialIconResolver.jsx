import React from 'react';
import {
  FaGithub,
  FaLinkedinIn,
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaXTwitter,
  FaTelegram,
  FaWhatsapp,
  FaDiscord,
  FaTiktok,
  FaReddit,
  FaGitlab,
} from 'react-icons/fa6';
import {
  Mail as LucideMail,
  Globe as LucideGlobe,
  Link as LucideLink,
  ExternalLink as LucideExternalLink,
  Share2 as LucideShare2,
} from 'lucide-react';

/**
 * Standard supported social platforms with official brand icons and URL hints.
 */
export const PLATFORM_PRESETS = [
  {
    platform: 'GitHub',
    icon: 'GitHub',
    iconComponent: FaGithub,
    urlHint: 'https://github.com/username',
  },
  {
    platform: 'LinkedIn',
    icon: 'LinkedIn',
    iconComponent: FaLinkedinIn,
    urlHint: 'https://linkedin.com/in/username',
  },
  {
    platform: 'X',
    icon: 'X',
    iconComponent: FaXTwitter,
    urlHint: 'https://x.com/username',
  },
  {
    platform: 'Facebook',
    icon: 'Facebook',
    iconComponent: FaFacebookF,
    urlHint: 'https://facebook.com/username',
  },
  {
    platform: 'Instagram',
    icon: 'Instagram',
    iconComponent: FaInstagram,
    urlHint: 'https://instagram.com/username',
  },
  {
    platform: 'YouTube',
    icon: 'YouTube',
    iconComponent: FaYoutube,
    urlHint: 'https://youtube.com/@channel',
  },
  {
    platform: 'Telegram',
    icon: 'Telegram',
    iconComponent: FaTelegram,
    urlHint: 'https://t.me/username',
  },
  {
    platform: 'WhatsApp',
    icon: 'WhatsApp',
    iconComponent: FaWhatsapp,
    urlHint: 'https://wa.me/phonenumber',
  },
  {
    platform: 'Discord',
    icon: 'Discord',
    iconComponent: FaDiscord,
    urlHint: 'https://discord.gg/invite',
  },
  {
    platform: 'TikTok',
    icon: 'TikTok',
    iconComponent: FaTiktok,
    urlHint: 'https://tiktok.com/@username',
  },
  {
    platform: 'Reddit',
    icon: 'Reddit',
    iconComponent: FaReddit,
    urlHint: 'https://reddit.com/user/username',
  },
  {
    platform: 'GitLab',
    icon: 'GitLab',
    iconComponent: FaGitlab,
    urlHint: 'https://gitlab.com/username',
  },
  {
    platform: 'Email',
    icon: 'Email',
    iconComponent: LucideMail,
    urlHint: 'mailto:you@example.com',
  },
  {
    platform: 'Other',
    icon: 'Other',
    iconComponent: LucideGlobe,
    urlHint: 'https://example.com',
  },
];

/**
 * Normalized dictionary mapping brand and platform identifiers to official icon components.
 */
export const BRAND_ICON_MAP = {
  github: FaGithub,
  linkedin: FaLinkedinIn,
  'linkedin-in': FaLinkedinIn,
  facebook: FaFacebookF,
  instagram: FaInstagram,
  youtube: FaYoutube,
  x: FaXTwitter,
  twitter: FaXTwitter,
  telegram: FaTelegram,
  whatsapp: FaWhatsapp,
  discord: FaDiscord,
  tiktok: FaTiktok,
  reddit: FaReddit,
  gitlab: FaGitlab,
  email: LucideMail,
  mail: LucideMail,
  globe: LucideGlobe,
  link: LucideLink,
  externallink: LucideExternalLink,
  share: LucideShare2,
  share2: LucideShare2,
  other: LucideGlobe,
};

/**
 * Resolves the React component for a given icon and/or platform name.
 * Prioritizes the platform name to guarantee official brand icons for known platforms.
 *
 * @param {string} iconName - The stored icon string (e.g. "GitHub", "Globe", "ExternalLink")
 * @param {string} platformName - The platform name (e.g. "GitHub", "LinkedIn", "Facebook")
 * @returns {React.ComponentType} The resolved icon component
 */
export function resolveSocialIconComponent(iconName, platformName) {
  const normPlatform = (platformName || '').toLowerCase().trim();
  const normIcon = (iconName || '').toLowerCase().trim();

  // 1. Check if platform matches a known brand
  if (normPlatform && BRAND_ICON_MAP[normPlatform]) {
    return BRAND_ICON_MAP[normPlatform];
  }

  // 2. Check if icon matches a known brand or icon identifier
  if (normIcon && BRAND_ICON_MAP[normIcon]) {
    return BRAND_ICON_MAP[normIcon];
  }

  // 3. Fallback
  return LucideGlobe;
}

/**
 * Renders an official social brand icon with fallback and default styling.
 *
 * @param {string} iconName - Icon identifier
 * @param {string} platformName - Platform name
 * @param {object} props - Additional props (className, etc.)
 * @returns {JSX.Element}
 */
export function resolveSocialIcon(iconName, platformName, props = {}) {
  const IconComponent = resolveSocialIconComponent(iconName, platformName);
  const className = props.className || 'w-4 h-4';
  return React.createElement(IconComponent, {
    ...props,
    className,
    'aria-hidden': 'true',
  });
}

