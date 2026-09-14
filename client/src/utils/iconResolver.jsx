import {
  Code2,
  Coffee,
  FileCode,
  Globe,
  Palette,
  Atom,
  Server,
  Cpu,
  Database,
  Boxes,
  GitBranch,
  FolderGit2,
  Terminal,
  Workflow,
  ShieldCheck,
  Lock,
  Shield,
  Layers,
  Wrench,
  FileJson,
  Binary,
  Sparkles,
  Laptop,
  Cloud,
  Key,
  Network,
} from 'lucide-react';

export const ICON_MAP = {
  Code2,
  Coffee,
  FileCode,
  Globe,
  Palette,
  Atom,
  Server,
  Cpu,
  Database,
  Boxes,
  GitBranch,
  FolderGit2,
  Terminal,
  Workflow,
  ShieldCheck,
  Lock,
  Shield,
  Layers,
  Wrench,
  FileJson,
  Binary,
  Sparkles,
  Laptop,
  Cloud,
  Key,
  Network,
};

export const AVAILABLE_ICON_NAMES = Object.keys(ICON_MAP);

export function resolveSkillIcon(iconName, props = {}) {
  const IconComponent = (iconName && ICON_MAP[iconName]) ? ICON_MAP[iconName] : Code2;
  return <IconComponent {...props} />;
}
