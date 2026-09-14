import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchEducation, fetchExperience } from '../../services/timelineApi.js';
import {
  GraduationCap,
  Briefcase,
  Calendar,
  Sparkles,
  Building,
  AlertCircle,
} from 'lucide-react';

function formatTimelineDate(startDate, endDate, current) {
  if (current) {
    return startDate ? `${startDate} — Present` : 'Present';
  }
  if (startDate && endDate) {
    return `${startDate} — ${endDate}`;
  }
  return startDate || endDate || '';
}

export default function Timeline() {
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadTimelineData() {
      try {
        const [eduRes, expRes] = await Promise.allSettled([
          fetchEducation(),
          fetchExperience(),
        ]);

        if (isMounted) {
          if (eduRes.status === 'fulfilled' && eduRes.value?.success && Array.isArray(eduRes.value?.data)) {
            setEducation(eduRes.value.data);
          }

          if (expRes.status === 'fulfilled' && expRes.value?.success && Array.isArray(expRes.value?.data)) {
            setExperience(expRes.value.data);
          }

          if (eduRes.status === 'rejected' && expRes.status === 'rejected') {
            setError(true);
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

    loadTimelineData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Tag items with timeline type and merge for combined "All" view
  const taggedEducation = education.map((item) => ({ ...item, timelineType: 'education' }));
  const taggedExperience = experience.map((item) => ({ ...item, timelineType: 'experience' }));

  // Preserve ordering: Experience entries generally prioritized or ordered by sort index
  const allItems = [...taggedExperience, ...taggedEducation].sort((a, b) => {
    if (a.current && !b.current) return -1;
    if (!a.current && b.current) return 1;
    return (a.order ?? 0) - (b.order ?? 0);
  });

  const filteredItems =
    activeFilter === 'experience'
      ? taggedExperience
      : activeFilter === 'education'
        ? taggedEducation
        : allItems;

  const hasBoth = taggedEducation.length > 0 && taggedExperience.length > 0;

  // Animation variants
  const fadeInVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  const itemVariants = {
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
        id="experience"
        className="scroll-mt-24 sm:scroll-mt-28 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-20"
      >
        <div className="space-y-8 animate-pulse">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <div className="h-6 w-44 bg-zinc-900 border border-zinc-800 rounded-full mx-auto" />
            <div className="h-10 w-64 bg-zinc-900 border border-zinc-800 rounded-2xl mx-auto" />
            <div className="h-4 w-72 bg-zinc-900 border border-zinc-800 rounded mx-auto" />
          </div>
          <div className="space-y-6 max-w-3xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-36 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 p-6 space-y-3"
              >
                <div className="h-4 w-32 bg-zinc-800 rounded" />
                <div className="h-5 w-48 bg-zinc-800 rounded" />
                <div className="h-4 w-full bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error boundary state
  if (error && allItems.length === 0) {
    return (
      <section
        id="experience"
        className="scroll-mt-24 sm:scroll-mt-28 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12"
      >
        <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-zinc-500 mx-auto" />
          <h3 className="text-sm font-semibold text-zinc-300">Timeline &amp; Career</h3>
          <p className="text-xs text-zinc-500">Timeline information is temporarily unavailable.</p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="experience"
      className="scroll-mt-24 sm:scroll-mt-28 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-20 relative"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none -z-10" />

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
            <span>Career &amp; Academic Journey</span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-100">
            Education &amp; Experience
          </h2>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
            A chronological timeline of academic achievements, technical training, and professional
            software engineering milestones.
          </p>

          {/* Filter Tabs */}
          {hasBoth && (
            <div
              role="tablist"
              aria-label="Timeline Categories"
              className="flex items-center justify-center gap-2 pt-3 flex-wrap"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeFilter === 'all'}
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold shadow-inner'
                    : 'bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All Journey ({allItems.length})
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeFilter === 'experience'}
                onClick={() => setActiveFilter('experience')}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeFilter === 'experience'
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold shadow-inner'
                    : 'bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Briefcase className="w-3 h-3" />
                <span>Experience ({taggedExperience.length})</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeFilter === 'education'}
                onClick={() => setActiveFilter('education')}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeFilter === 'education'
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold shadow-inner'
                    : 'bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <GraduationCap className="w-3 h-3" />
                <span>Education ({taggedEducation.length})</span>
              </button>
            </div>
          )}
        </motion.div>

        {/* Timeline Items List */}
        {filteredItems.length === 0 ? (
          <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 text-center space-y-2 max-w-md mx-auto">
            <Calendar className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-xs text-zinc-400">
              {activeFilter === 'experience'
                ? 'No experience entries found.'
                : activeFilter === 'education'
                  ? 'No education entries found.'
                  : 'No education or experience records have been published yet.'}
            </p>
          </div>
        ) : (
          <div className="relative max-w-3xl mx-auto pl-6 sm:pl-10 space-y-8">
            {/* Vertical Glowing Connector Rail */}
            <div className="absolute left-2.5 sm:left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b from-emerald-500/40 via-zinc-800 to-transparent pointer-events-none" />

            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => {
                const isEdu = item.timelineType === 'education';
                const dateStr = formatTimelineDate(item.startDate, item.endDate, item.current);
                const title = isEdu ? item.degree : item.title;
                const org = isEdu ? item.institution : item.organization;
                const badgeText = isEdu ? item.department : item.type;

                return (
                  <motion.div
                    key={item._id || `${item.timelineType}-${item.title || item.degree}`}
                    layout
                    initial="hidden"
                    whileInView="visible"
                    exit="exit"
                    viewport={{ once: true, margin: '-50px' }}
                    variants={itemVariants}
                    className="relative group"
                  >
                    {/* Node Icon on Connector Line */}
                    <div className="absolute -left-6 sm:-left-10 top-5 -translate-x-1/2 w-8 h-8 rounded-xl bg-zinc-950 border border-zinc-700/80 group-hover:border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-xl transition-colors z-10">
                      {isEdu ? (
                        <GraduationCap className="w-4 h-4 text-sky-400" />
                      ) : (
                        <Briefcase className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>

                    {/* Timeline Content Card */}
                    <div className="p-5 sm:p-7 rounded-3xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700/80 transition-all shadow-xl space-y-3">
                      {/* Top Header Row: Date & Status */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        {/* Date badge */}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-300">
                          <Calendar className="w-3 h-3 text-zinc-500" />
                          <span>{dateStr || 'Timeline Milestone'}</span>
                          {item.current && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
                          )}
                        </div>

                        {/* Department / Job Type Pill */}
                        {badgeText && (
                          <span className="px-2.5 py-0.5 rounded-full bg-zinc-950/80 border border-zinc-800 text-[10px] font-mono text-zinc-400">
                            {badgeText}
                          </span>
                        )}
                      </div>

                      {/* Main Title & Organization */}
                      <div className="space-y-1">
                        <h3 className="text-base sm:text-lg font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                          {title}
                        </h3>

                        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-400">
                          <Building className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          <span>{org}</span>
                        </div>
                      </div>

                      {/* Description */}
                      {item.description && (
                        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed whitespace-pre-line pt-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
