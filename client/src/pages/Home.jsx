import Hero from '../components/public/Hero.jsx';
import About from '../components/public/About.jsx';
import Skills from '../components/public/Skills.jsx';
import Projects from '../components/public/Projects.jsx';
import Timeline from '../components/public/Timeline.jsx';
import Contact from '../components/public/Contact.jsx';

export default function Home() {
  return (
    <main className="w-full flex flex-col space-y-16 sm:space-y-24 py-6 sm:py-12">
      {/* STEP 13: Dynamic Public Hero Section */}
      <Hero />

      {/* STEP 14: Dynamic Public About Section */}
      <About />

      {/* STEP 15: Dynamic Public Skills Section */}
      <Skills />

      {/* STEP 16: Dynamic Public Projects Section */}
      <Projects />

      {/* STEP 17: Dynamic Public Timeline (Education & Experience) */}
      <Timeline />

      {/* STEP 18: Dynamic Public Contact Section */}
      <Contact />
    </main>
  );
}

