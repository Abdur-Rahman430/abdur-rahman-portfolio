import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import RootLayout from './layouts/RootLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import { fetchWebsiteSettings } from './services/websiteSettingsApi.js';
import { applyTheme } from './utils/themeUtils.js';
import { updateDocumentMetadata } from './utils/seoUtils.js';

// Lazy-loaded Admin Route Components (isolated from initial public bundle)
const AdminLogin = lazy(() => import('./pages/admin/Login.jsx'));
const DashboardOverview = lazy(() => import('./pages/admin/DashboardOverview.jsx'));
const AdminProfile = lazy(() => import('./pages/admin/Profile.jsx'));
const AdminSkills = lazy(() => import('./pages/admin/Skills.jsx'));
const AdminProjects = lazy(() => import('./pages/admin/Projects.jsx'));
const AdminEducationExperience = lazy(() => import('./pages/admin/EducationExperience.jsx'));
const AdminSocialLinks = lazy(() => import('./pages/admin/SocialLinks.jsx'));
const AdminAppearance = lazy(() => import('./pages/admin/Appearance.jsx'));
const AdminWebsiteSettings = lazy(() => import('./pages/admin/WebsiteSettings.jsx'));
const AdminMessages = lazy(() => import('./pages/admin/Messages.jsx'));

// Lightweight Admin Suspense Fallback (zero heavy dependencies)
function AdminLoadingFallback() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-zinc-400">
      <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin mb-3" />
      <p className="text-xs font-mono">Loading console module...</p>
    </div>
  );
}

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
        {/* Public Portfolio (Synchronously loaded for instant LCP) */}
        <Route element={<RootLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        {/* Public Admin Login */}
        <Route
          path="/admin/login"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <AdminLogin />
            </Suspense>
          }
        />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route
              index
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <DashboardOverview />
                </Suspense>
              }
            />
            <Route
              path="profile"
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminProfile />
                </Suspense>
              }
            />
            <Route
              path="skills"
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminSkills />
                </Suspense>
              }
            />
            <Route
              path="projects"
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminProjects />
                </Suspense>
              }
            />
            <Route
              path="timeline"
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminEducationExperience />
                </Suspense>
              }
            />
            <Route
              path="education-experience"
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminEducationExperience />
                </Suspense>
              }
            />
            <Route
              path="social-links"
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminSocialLinks />
                </Suspense>
              }
            />
            <Route
              path="messages"
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminMessages />
                </Suspense>
              }
            />
            <Route
              path="appearance"
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminAppearance />
                </Suspense>
              }
            />
            <Route
              path="settings"
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminWebsiteSettings />
                </Suspense>
              }
            />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
