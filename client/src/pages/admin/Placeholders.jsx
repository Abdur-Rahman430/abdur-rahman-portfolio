import {
  User,
  Code2,
  FolderGit2,
  GraduationCap,
  Share2,
  Mail,
  Palette,
  Settings,
  Construction,
} from 'lucide-react';

function PlaceholderCard({ title, subtitle, icon: Icon, description }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">{title}</h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">{subtitle}</p>
      </div>

      <div className="p-8 sm:p-12 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 text-center flex flex-col items-center justify-center max-w-2xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-emerald-400 mb-4 shadow-xl">
          <Icon className="w-7 h-7" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 mb-3">
          <Construction className="w-3.5 h-3.5" />
          <span>Management Section</span>
        </div>
        <h3 className="text-base font-semibold text-zinc-200">{title} Module</h3>
        <p className="text-xs text-zinc-400 max-w-md mt-2 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

export function ProfilePlaceholder() {
  return (
    <PlaceholderCard
      title="Profile Information"
      subtitle="Manage your personal background, headline, and bio."
      icon={User}
      description="In this section, you will be able to update your full name, title, bio, career objectives, university status, and resume links."
    />
  );
}

export function SkillsPlaceholder() {
  return (
    <PlaceholderCard
      title="Skills & Technologies"
      subtitle="Manage tech stack categories and display order."
      icon={Code2}
      description="Create, reorder, categorize, and update technical proficiencies spanning Frontend, Backend, Tools, and Cybersecurity."
    />
  );
}

export function ProjectsPlaceholder() {
  return (
    <PlaceholderCard
      title="Projects Showcase"
      subtitle="Curate portfolio case studies and demo links."
      icon={FolderGit2}
      description="Add project descriptions, tags, GitHub repositories, live deployment links, and toggle featured highlights."
    />
  );
}

export function EducationExperiencePlaceholder() {
  return (
    <PlaceholderCard
      title="Education & Experience"
      subtitle="Maintain academic credentials and career timeline."
      icon={GraduationCap}
      description="Manage educational degrees, universities, engineering internships, and professional career milestones."
    />
  );
}

export function SocialLinksPlaceholder() {
  return (
    <PlaceholderCard
      title="Social Links"
      subtitle="Public profile handles and professional networks."
      icon={Share2}
      description="Configure your GitHub, LinkedIn, Twitter/X, and communication channels displayed across the portfolio."
    />
  );
}

export function MessagesPlaceholder() {
  return (
    <PlaceholderCard
      title="Contact Inquiries"
      subtitle="Review incoming messages submitted through the contact form."
      icon={Mail}
      description="View, read, and manage inquiries sent by visitors via the public contact endpoint with zero exposure to unauthenticated users."
    />
  );
}

export function AppearancePlaceholder() {
  return (
    <PlaceholderCard
      title="Appearance & Theme"
      subtitle="Color accents, theme styling, and visual elements."
      icon={Palette}
      description="Adjust brand colors, dark/light themes, typography scales, and visual accents across the portfolio layout."
    />
  );
}

export function SettingsPlaceholder() {
  return (
    <PlaceholderCard
      title="Website Settings"
      subtitle="SEO metadata, footer notice, and global configurations."
      icon={Settings}
      description="Configure website title, OpenGraph meta descriptions, footer copyrights, and general site behavior."
    />
  );
}
