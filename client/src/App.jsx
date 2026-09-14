import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import RootLayout from './layouts/RootLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import AdminLogin from './pages/admin/Login.jsx';
import DashboardOverview from './pages/admin/DashboardOverview.jsx';
import AdminProfile from './pages/admin/Profile.jsx';
import AdminSkills from './pages/admin/Skills.jsx';
import AdminProjects from './pages/admin/Projects.jsx';
import AdminEducationExperience from './pages/admin/EducationExperience.jsx';
import AdminSocialLinks from './pages/admin/SocialLinks.jsx';
import AdminAppearance from './pages/admin/Appearance.jsx';
import AdminWebsiteSettings from './pages/admin/WebsiteSettings.jsx';
import AdminMessages from './pages/admin/Messages.jsx';
import { fetchWebsiteSettings } from './services/websiteSettingsApi.js';
import { applyTheme } from './utils/themeUtils.js';
import { updateDocumentMetadata } from './utils/seoUtils.js';

function App() {
  // Load and apply saved portfolio theme and SEO metadata on mount
  useEffect(() => {
    let isMounted = true;
    async function initSettings() {
      try {
        const res = await fetchWebsiteSettings();
        if (isMounted && res.success && res.data) {
          applyTheme(res.data);
          updateDocumentMetadata({
            title: res.data.websiteTitle,
            description: res.data.metaDescription,
          });
        }
      } catch {
        // Fallback to default theme and metadata on error
        if (isMounted) {
          applyTheme();
          updateDocumentMetadata();
        }
      }
    }
    initSettings();
    return () => {
      isMounted = false;
    };
  }, []);
  return (
    <AuthProvider>
      <Routes>
        {/* Public Portfolio */}
        <Route element={<RootLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        {/* Public Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="skills" element={<AdminSkills />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="timeline" element={<AdminEducationExperience />} />
            <Route path="education-experience" element={<AdminEducationExperience />} />
            <Route path="social-links" element={<AdminSocialLinks />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="appearance" element={<AdminAppearance />} />
            <Route path="settings" element={<AdminWebsiteSettings />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
