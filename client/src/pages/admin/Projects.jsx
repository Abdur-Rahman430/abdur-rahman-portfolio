import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
  uploadProjectImage,
} from '../../services/projectsApi.js';
import { getMediaUrl } from '../../utils/mediaUtils.js';
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FolderGit2,
  ExternalLink,
  Star,
  X,
  Save,
  Upload,
  Image as ImageIcon,
  Tag,
} from 'lucide-react';

const STATUS_OPTIONS = ['Completed', 'In Progress', 'Planned'];

const INITIAL_FORM = {
  name: '',
  shortDescription: '',
  fullDescription: '',
  technologies: [],
  projectImage: '',
  githubUrl: '',
  liveDemoUrl: '',
  status: 'Completed',
  featured: false,
  order: 1,
};

export default function AdminProjects() {
  const { token } = useAuth();
  const fileInputRef = useRef(null);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null); // null when adding
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // Form states
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [techInput, setTechInput] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Filter state
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Load projects on mount
  useEffect(() => {
    let isMounted = true;

    async function loadInitial() {
      try {
        const res = await fetchProjects();
        if (isMounted && res.success && Array.isArray(res.data)) {
          setProjects(res.data);
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to load projects from server.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadInitial();

    return () => {
      isMounted = false;
    };
  }, []);

  // Open modal for Adding
  const handleOpenAdd = () => {
    setEditingProject(null);
    setFormData({
      ...INITIAL_FORM,
      order: projects.length + 1,
    });
    setTechInput('');
    setFieldErrors({});
    setModalOpen(true);
  };

  // Open modal for Editing
  const handleOpenEdit = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name || '',
      shortDescription: project.shortDescription || '',
      fullDescription: project.fullDescription || '',
      technologies: Array.isArray(project.technologies) ? [...project.technologies] : [],
      projectImage: project.projectImage || '',
      githubUrl: project.githubUrl || '',
      liveDemoUrl: project.liveDemoUrl || '',
      status: project.status || 'Completed',
      featured: Boolean(project.featured),
      order: project.order ?? 0,
    });
    setTechInput('');
    setFieldErrors({});
    setModalOpen(true);
  };

  // Open modal for Deleting
  const handleOpenDelete = (project) => {
    setProjectToDelete(project);
    setDeleteModalOpen(true);
  };

  // Form field change handler
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox'
        ? checked
        : name === 'order'
        ? (value === '' ? '' : Number(value))
        : value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Technology chips management
  const handleAddTech = (e) => {
    e.preventDefault();
    const trimmed = techInput.trim();
    if (!trimmed) return;

    if (formData.technologies.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setTechInput('');
      return;
    }

    if (trimmed.length > 50) {
      setFieldErrors((prev) => ({ ...prev, technologies: 'Technology name cannot exceed 50 characters' }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      technologies: [...prev.technologies, trimmed],
    }));
    setTechInput('');
    if (fieldErrors.technologies) {
      setFieldErrors((prev) => ({ ...prev, technologies: null }));
    }
  };

  const handleRemoveTech = (techToRemove) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((t) => t !== techToRemove),
    }));
  };

  // Image Upload handler
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setErrorMessage('Invalid image format. Allowed formats: JPG, JPEG, PNG, or WebP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image file size cannot exceed 5MB.');
      return;
    }

    setUploadingImage(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const res = await uploadProjectImage(file, token, editingProject?._id);
      if (res.success && res.data?.projectImage) {
        setFormData((prev) => ({ ...prev, projectImage: res.data.projectImage }));
        setSuccessMessage('Project image uploaded successfully!');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to upload project image.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Project name is required';
    } else if (formData.name.trim().length > 100) {
      errors.name = 'Project name cannot exceed 100 characters';
    }

    if (!formData.shortDescription.trim()) {
      errors.shortDescription = 'Short description is required';
    } else if (formData.shortDescription.trim().length > 500) {
      errors.shortDescription = 'Short description cannot exceed 500 characters';
    }

    if (!formData.fullDescription.trim()) {
      errors.fullDescription = 'Full description is required';
    } else if (formData.fullDescription.trim().length > 5000) {
      errors.fullDescription = 'Full description cannot exceed 5000 characters';
    }

    if (formData.order === '' || isNaN(formData.order) || formData.order < 0) {
      errors.order = 'Display order must be a non-negative number';
    }

    if (formData.githubUrl && !/^https?:\/\/.+/i.test(formData.githubUrl.trim())) {
      errors.githubUrl = 'GitHub URL must be a valid HTTP or HTTPS URL';
    }

    if (formData.liveDemoUrl && !/^https?:\/\/.+/i.test(formData.liveDemoUrl.trim())) {
      errors.liveDemoUrl = 'Live demo URL must be a valid HTTP or HTTPS URL';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Project (Create or Update)
  const handleSaveProject = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (actionLoading || uploadingImage) return;
    if (!validateForm()) return;

    setActionLoading(true);

    try {
      if (editingProject) {
        // Update existing project
        const res = await updateProject(editingProject._id, formData, token);
        if (res.success && res.data) {
          setProjects((prev) =>
            prev.map((p) => (p._id === editingProject._id ? res.data : p))
          );
          setSuccessMessage(`Project "${formData.name}" updated successfully.`);
          setModalOpen(false);
        }
      } else {
        // Create new project
        const res = await createProject(formData, token);
        if (res.success && res.data) {
          setProjects((prev) => [...prev, res.data]);
          setSuccessMessage(`Project "${formData.name}" created successfully.`);
          setModalOpen(false);
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save project. Please check fields.');
    } finally {
      setActionLoading(false);
    }
  };

  // Confirm delete project
  const handleConfirmDelete = async () => {
    if (!projectToDelete || actionLoading) return;

    setActionLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const res = await deleteProject(projectToDelete._id, token);
      if (res.success) {
        setProjects((prev) => prev.filter((p) => p._id !== projectToDelete._id));
        setSuccessMessage(`Project "${projectToDelete.name}" deleted successfully.`);
        setDeleteModalOpen(false);
        setProjectToDelete(null);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete project.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
        <p className="text-xs text-zinc-400">Loading projects from database...</p>
      </div>
    );
  }

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'FEATURED') return p.featured;
    return p.status === statusFilter;
  });

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Master Plan Step 7</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">Project Management System</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage software projects, technology stacks, preview images, live demos, and repository links.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Project</span>
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
            statusFilter === 'ALL'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
          }`}
        >
          All Projects ({projects.length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('FEATURED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            statusFilter === 'FEATURED'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
          }`}
        >
          <Star className="w-3.5 h-3.5 fill-amber-400/30 text-amber-400" />
          <span>Featured ({projects.filter((p) => p.featured).length})</span>
        </button>
        {STATUS_OPTIONS.map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === st
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
            }`}
          >
            {st} ({projects.filter((p) => p.status === st).length})
          </button>
        ))}
      </div>

      {/* Projects Grid or Empty State */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center flex flex-col items-center justify-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-zinc-200">No projects yet</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm">
            {projects.length === 0
              ? 'Add your first engineering project showcase to display your technical work.'
              : 'No projects match the selected status filter.'}
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const statusColor =
              project.status === 'Completed'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : project.status === 'In Progress'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-purple-500/10 text-purple-400 border-purple-500/20';

            return (
              <div
                key={project._id}
                className="group rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Image Preview / Banner */}
                <div className="relative h-44 w-full bg-zinc-950 border-b border-zinc-800/80 flex items-center justify-center overflow-hidden">
                  {project.projectImage ? (
                    <img
                      src={getMediaUrl(project.projectImage)}
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-zinc-600 gap-2">
                      <ImageIcon className="w-8 h-8" />
                      <span className="text-[11px] font-mono">No image uploaded</span>
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border ${statusColor}`}>
                      {project.status || 'Completed'}
                    </span>
                    {project.featured && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>Featured</span>
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-zinc-900/90 text-zinc-400 border border-zinc-700/60">
                      Order: {project.order ?? 0}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {project.shortDescription}
                    </p>
                  </div>

                  {/* Technologies Tags */}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-zinc-950 text-zinc-300 border border-zinc-800"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer Action Links & Buttons */}
                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                          title="GitHub Repository"
                        >
                          <FolderGit2 className="w-4 h-4" />
                        </a>
                      )}
                      {project.liveDemoUrl && (
                        <a
                          href={project.liveDemoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 transition-colors"
                          title="Live Demo"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(project)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Edit Project"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenDelete(project)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Project Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-semibold text-zinc-100">
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4" noValidate>
              {/* Project Name & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="projectName" className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Project Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="projectName"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="e.g. Distributed Task Queue"
                    className={`w-full px-3 py-2 rounded-xl bg-zinc-950 border text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.name
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                    }`}
                  />
                  {fieldErrors.name && (
                    <p className="mt-1 text-xs text-red-400">{fieldErrors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="projectOrder" className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Display Order
                  </label>
                  <input
                    id="projectOrder"
                    name="order"
                    type="number"
                    min="0"
                    value={formData.order}
                    onChange={handleFormChange}
                    placeholder="1"
                    className={`w-full px-3 py-2 rounded-xl bg-zinc-950 border text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.order
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                    }`}
                  />
                  {fieldErrors.order && (
                    <p className="mt-1 text-xs text-red-400">{fieldErrors.order}</p>
                  )}
                </div>
              </div>

              {/* Status & Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label htmlFor="projectStatus" className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Project Status
                  </label>
                  <select
                    id="projectStatus"
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2.5 pt-4">
                  <input
                    id="projectFeatured"
                    name="featured"
                    type="checkbox"
                    checked={formData.featured}
                    onChange={handleFormChange}
                    className="w-4 h-4 rounded bg-zinc-950 border-zinc-800 text-emerald-500 focus:ring-emerald-500/20 focus:ring-offset-0 cursor-pointer"
                  />
                  <label htmlFor="projectFeatured" className="text-xs font-medium text-zinc-200 cursor-pointer flex items-center gap-1.5">
                    <Star className={`w-3.5 h-3.5 ${formData.featured ? 'fill-amber-400 text-amber-400' : 'text-zinc-500'}`} />
                    <span>Feature on homepage / top showcase</span>
                  </label>
                </div>
              </div>

              {/* Short Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="projectShortDesc" className="block text-xs font-medium text-zinc-300">
                    Short Description <span className="text-red-400">*</span>
                  </label>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {formData.shortDescription.length}/500
                  </span>
                </div>
                <textarea
                  id="projectShortDesc"
                  name="shortDescription"
                  rows={2}
                  required
                  value={formData.shortDescription}
                  onChange={handleFormChange}
                  placeholder="Concise summary for project cards..."
                  className={`w-full px-3 py-2 rounded-xl bg-zinc-950 border text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.shortDescription
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                  }`}
                />
                {fieldErrors.shortDescription && (
                  <p className="mt-1 text-xs text-red-400">{fieldErrors.shortDescription}</p>
                )}
              </div>

              {/* Full Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="projectFullDesc" className="block text-xs font-medium text-zinc-300">
                    Full Description <span className="text-red-400">*</span>
                  </label>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {formData.fullDescription.length}/5000
                  </span>
                </div>
                <textarea
                  id="projectFullDesc"
                  name="fullDescription"
                  rows={4}
                  required
                  value={formData.fullDescription}
                  onChange={handleFormChange}
                  placeholder="Detailed breakdown of architecture, engineering decisions, and security aspects..."
                  className={`w-full px-3 py-2 rounded-xl bg-zinc-950 border text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.fullDescription
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                  }`}
                />
                {fieldErrors.fullDescription && (
                  <p className="mt-1 text-xs text-red-400">{fieldErrors.fullDescription}</p>
                )}
              </div>

              {/* Technologies Chips Input */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Technologies
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
                    <input
                      type="text"
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTech(e);
                        }
                      }}
                      placeholder="Type a technology (e.g. React, Node.js, Redis) and press Enter"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTech}
                    className="px-3.5 py-2 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {formData.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                    {formData.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono bg-zinc-900 text-emerald-300 border border-emerald-500/30"
                      >
                        <span>{tech}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTech(tech)}
                          className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {fieldErrors.technologies && (
                  <p className="mt-1 text-xs text-red-400">{fieldErrors.technologies}</p>
                )}
              </div>

              {/* Project Image Upload */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Project Image (Thumbnail)
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-16 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center shrink-0 relative group">
                    {formData.projectImage ? (
                      <img
                        src={getMediaUrl(formData.projectImage)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-zinc-600" />
                    )}
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="project-image-file"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage || actionLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 cursor-pointer disabled:opacity-50"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{formData.projectImage ? 'Change Image' : 'Upload Image'}</span>
                      </button>
                      {formData.projectImage && (
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, projectImage: '' }))}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                          title="Remove Image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500">
                      JPG, PNG, or WebP up to 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Repository & Demo URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="projectGithub" className="block text-xs font-medium text-zinc-300 mb-1.5">
                    GitHub URL (Optional)
                  </label>
                  <input
                    id="projectGithub"
                    name="githubUrl"
                    type="url"
                    value={formData.githubUrl}
                    onChange={handleFormChange}
                    placeholder="https://github.com/..."
                    className={`w-full px-3 py-2 rounded-xl bg-zinc-950 border text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.githubUrl
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                    }`}
                  />
                  {fieldErrors.githubUrl && (
                    <p className="mt-1 text-xs text-red-400">{fieldErrors.githubUrl}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="projectDemo" className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Live Demo URL (Optional)
                  </label>
                  <input
                    id="projectDemo"
                    name="liveDemoUrl"
                    type="url"
                    value={formData.liveDemoUrl}
                    onChange={handleFormChange}
                    placeholder="https://example.com"
                    className={`w-full px-3 py-2 rounded-xl bg-zinc-950 border text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.liveDemoUrl
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                    }`}
                  />
                  {fieldErrors.liveDemoUrl && (
                    <p className="mt-1 text-xs text-red-400">{fieldErrors.liveDemoUrl}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || uploadingImage}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingProject ? 'Save Changes' : 'Create Project'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <Trash2 className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Delete Project</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Are you sure you want to delete <span className="text-zinc-100 font-semibold">{projectToDelete.name}</span>? This permanently removes the project and its media from your portfolio.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setProjectToDelete(null);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-red-200 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 disabled:opacity-50 transition-all cursor-pointer"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Delete Project</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
