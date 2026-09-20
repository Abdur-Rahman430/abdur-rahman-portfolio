import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchProjects } from '../../services/projectsApi.js';
import { getMediaUrl } from '../../utils/mediaUtils.js';
import {
  FolderGit2,
  ExternalLink,
  Sparkles,
  Layers,
  Star,
  CheckCircle2,
  Clock,
  AlertCircle,
  Code2,
} from 'lucide-react';

function ProjectCardImage({ src, alt }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="w-full h-48 sm:h-52 bg-gradient-to-br from-zinc-900 to-zinc-950 border-b border-zinc-800/80 flex flex-col items-center justify-center text-center p-6 space-y-2 relative overflow-hidden group-hover:bg-zinc-900 transition-colors">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner group-hover:scale-110 transition-transform">
          <Code2 className="w-6 h-6" />
        </div>
        <p className="text-xs font-mono text-zinc-500">Project Showcase</p>
      </div>
    );
  }

  return (
    <div className="w-full h-48 sm:h-52 overflow-hidden relative border-b border-zinc-800/80 bg-zinc-950">
      <img
        src={src}
        alt={alt}
        width="640"
        height="360"
        onError={() => setHasError(true)}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProjects() {
      try {
        const res = await fetchProjects();
        if (isMounted) {
          if (res?.success && Array.isArray(res.data)) {
            setProjects(res.data);
          } else {
            setProjects([]);
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

    loadProjects();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter projects (all vs featured)
  const hasFeatured = projects.some((p) => p.featured);
  const filteredProjects =
    activeFilter === 'featured'
      ? projects.filter((p) => p.featured)
      : projects;

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
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  // Loading skeleton state
  if (loading) {
    return (
      <section
        id="projects"
        className="scroll-mt-24 sm:scroll-mt-28 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-20"
      >
        <div className="space-y-8 animate-pulse">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <div className="h-6 w-36 bg-zinc-900 border border-zinc-800 rounded-full mx-auto" />
            <div className="h-10 w-56 bg-zinc-900 border border-zinc-800 rounded-2xl mx-auto" />
            <div className="h-4 w-72 bg-zinc-900 border border-zinc-800 rounded mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-96 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden space-y-4"
              >
                <div className="h-48 bg-zinc-800" />
                <div className="p-6 space-y-3">
                  <div className="h-5 w-3/4 bg-zinc-800 rounded" />
                  <div className="h-4 w-full bg-zinc-800 rounded" />
                  <div className="h-4 w-2/3 bg-zinc-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error boundary state
  if (error) {
    return (
      <section
        id="projects"
        className="scroll-mt-24 sm:scroll-mt-28 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12"
      >
        <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-zinc-500 mx-auto" />
          <h3 className="text-sm font-semibold text-zinc-300">Projects Showcase</h3>
          <p className="text-xs text-zinc-500">Projects information is temporarily unavailable.</p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="projects"
      className="scroll-mt-24 sm:scroll-mt-28 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-20 relative"
    >
      {/* Subtle background ambient glow */}
      <div className="hidden sm:block absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.06)_0%,transparent_70%)] pointer-events-none -z-10" />

      <div className="space-y-10">
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
            <span>Portfolio Showcase</span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-100">
            Featured Projects
          </h2>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
            A curated selection of web applications, full-stack architectures, and cybersecurity
            solutions built with modern engineering standards.
          </p>

          {/* Filter Tabs (when featured projects exist) */}
          {hasFeatured && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold'
                    : 'bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All Projects ({projects.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('featured')}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeFilter === 'featured'
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold'
                    : 'bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Star className="w-3 h-3 text-amber-400 fill-amber-400/30" />
                <span>Featured ({projects.filter((p) => p.featured).length})</span>
              </button>
            </div>
          )}
        </motion.div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 text-center space-y-2 max-w-md mx-auto">
            <FolderGit2 className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-xs text-zinc-400">
              {activeFilter === 'featured'
                ? 'No featured projects found.'
                : 'No projects have been published yet.'}
            </p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
          >
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project) => {
                const hasGithub = Boolean(project.githubUrl && project.githubUrl.trim());
                const hasLive = Boolean(project.liveDemoUrl && project.liveDemoUrl.trim());
                const isCompleted = project.status?.toLowerCase() === 'completed';

                return (
                  <motion.div
                    key={project._id || project.name}
                    layout
                    initial="hidden"
                    whileInView="visible"
                    exit="exit"
                    viewport={{ once: true, margin: '-50px' }}
                    variants={cardVariants}
                    className="rounded-3xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700/80 transition-all shadow-xl overflow-hidden flex flex-col justify-between group"
                  >
                    <div>
                      {/* Project Cover Image */}
                      <ProjectCardImage
                        src={getMediaUrl(project.projectImage)}
                        alt={project.name || 'Project preview'}
                      />

                      {/* Content Container */}
                      <div className="p-5 sm:p-6 space-y-4">
                        {/* Status & Featured Badges */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          {/* Status Badge */}
                          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
                            {isCompleted ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            )}
                            <span className="capitalize">{project.status || 'Active'}</span>
                          </div>

                          {/* Featured Pill */}
                          {project.featured && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-300">
                              <Star className="w-3 h-3 fill-amber-400/40 text-amber-400" />
                              Featured
                            </span>
                          )}
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-1.5">
                          <h3 className="text-base font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                            {project.name}
                          </h3>
                          <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                            {project.shortDescription ||
                              project.fullDescription ||
                              'A full-stack software development and engineering project.'}
                          </p>
                        </div>

                        {/* Technology Badges */}
                        {Array.isArray(project.technologies) && project.technologies.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            <Layers className="w-3 h-3 text-zinc-500 shrink-0" />
                            {project.technologies.map((tech) => (
                              <span
                                key={tech}
                                className="px-2 py-0.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-[10px] font-mono text-zinc-300"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons Footer (Rendered only when URLs exist) */}
                    {(hasGithub || hasLive) && (
                      <div className="p-5 sm:p-6 pt-0 border-t border-zinc-800/80 mt-4 flex items-center gap-2.5">
                        {hasLive && (
                          <a
                            href={project.liveDemoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                          >
                            <span>Live Demo</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {hasGithub && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 text-xs font-medium transition-all cursor-pointer ${
                              !hasLive ? 'flex-1' : ''
                            }`}
                            title="View Source Code on GitHub"
                          >
                            <FolderGit2 className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Source Code</span>
                          </a>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
}
