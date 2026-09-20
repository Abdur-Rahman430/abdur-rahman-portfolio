import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchSkills } from '../../services/skillsApi.js';
import { resolveSkillIcon } from '../../utils/iconResolver.jsx';
import {
  Code2,
  Sparkles,
  Layers,
  AlertCircle,
} from 'lucide-react';

export default function Skills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSkills() {
      try {
        const res = await fetchSkills();
        if (isMounted) {
          if (res?.success && Array.isArray(res.data)) {
            setSkills(res.data);
          } else {
            setSkills([]);
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

    loadSkills();
    return () => {
      isMounted = false;
    };
  }, []);

  // Dynamically group skills by category preserving backend order
  const categories = skills.reduce((acc, skill) => {
    const categoryName = skill.category || 'General';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(skill);
    return acc;
  }, {});

  const categoryEntries = Object.entries(categories);

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

  // Loading skeleton state
  if (loading) {
    return (
      <section
        id="skills"
        className="scroll-mt-24 sm:scroll-mt-28 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-20"
      >
        <div className="space-y-8 animate-pulse">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <div className="h-6 w-32 bg-zinc-900 border border-zinc-800 rounded-full mx-auto" />
            <div className="h-10 w-52 bg-zinc-900 border border-zinc-800 rounded-2xl mx-auto" />
            <div className="h-4 w-72 bg-zinc-900 border border-zinc-800 rounded mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-48 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 p-6 space-y-4"
              >
                <div className="h-5 w-32 bg-zinc-800 rounded" />
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <div className="h-9 bg-zinc-800 rounded-xl" />
                  <div className="h-9 bg-zinc-800 rounded-xl" />
                  <div className="h-9 bg-zinc-800 rounded-xl" />
                  <div className="h-9 bg-zinc-800 rounded-xl" />
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
        id="skills"
        className="scroll-mt-24 sm:scroll-mt-28 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12"
      >
        <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-zinc-500 mx-auto" />
          <h3 className="text-sm font-semibold text-zinc-300">Skills &amp; Expertise</h3>
          <p className="text-xs text-zinc-500">Skills information is temporarily unavailable.</p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="skills"
      className="scroll-mt-24 sm:scroll-mt-28 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-20 relative"
    >
      {/* Subtle ambient background glow */}
      <div className="hidden sm:block absolute top-1/2 left-1/3 -translate-y-1/2 w-96 h-96 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.06)_0%,transparent_70%)] pointer-events-none -z-10" />

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
            <span>Technical Stack</span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-100">
            Skills &amp; Expertise
          </h2>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
            Proficiencies across programming languages, full-stack frameworks, databases, developer
            tooling, and cybersecurity concepts.
          </p>
        </motion.div>

        {/* Dynamic Category Cards Grid */}
        {categoryEntries.length === 0 ? (
          <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 text-center space-y-2 max-w-md mx-auto">
            <Code2 className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-xs text-zinc-400">No skills have been published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {categoryEntries.map(([categoryName, items]) => (
              <motion.div
                key={categoryName}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={cardVariants}
                className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700/80 transition-all shadow-xl flex flex-col justify-between group"
              >
                <div>
                  {/* Category Card Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                        <Layers className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-zinc-100">{categoryName}</h3>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded-full border border-zinc-800/80">
                      {items.length} {items.length === 1 ? 'skill' : 'skills'}
                    </span>
                  </div>

                  {/* Skill Items List / Chips Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {items.map((skill) => (
                      <div
                        key={skill._id || skill.name}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-emerald-500/30 hover:bg-zinc-950 transition-all group/item"
                      >
                        <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 group-hover/item:text-emerald-300 shrink-0 shadow-inner">
                          {resolveSkillIcon(skill.icon, { className: 'w-3.5 h-3.5' })}
                        </div>
                        <span className="text-xs font-medium text-zinc-200 group-hover/item:text-zinc-100 truncate">
                          {skill.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
