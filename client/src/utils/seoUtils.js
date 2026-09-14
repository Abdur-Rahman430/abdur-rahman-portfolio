/**
 * SEO & Document Metadata Utility
 * Safely updates document title, description, and OpenGraph / Twitter tags
 * without duplicating tags or introducing external dependencies.
 */

const DEFAULT_TITLE = 'Abdur Rahman | Software Engineer Portfolio';
const DEFAULT_DESCRIPTION =
  'Full-stack software engineer portfolio showcasing web applications, technical skills, projects, and career journey.';

function setMetaTag(attributeName, attributeValue, content) {
  if (typeof document === 'undefined' || !content) return;

  let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

/**
 * Update document metadata dynamically
 * @param {Object} metadata
 * @param {string} [metadata.title]
 * @param {string} [metadata.description]
 * @param {string} [metadata.url]
 * @param {string} [metadata.ogImage]
 */
export function updateDocumentMetadata(metadata = {}) {
  if (typeof document === 'undefined') return;

  const title = metadata.title?.trim() || DEFAULT_TITLE;
  const description = metadata.description?.trim() || DEFAULT_DESCRIPTION;
  const currentUrl = metadata.url || window.location.href;

  // Update document title
  document.title = title;

  // Standard metadata
  setMetaTag('name', 'description', description);

  // Open Graph metadata
  setMetaTag('property', 'og:title', title);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:url', currentUrl);
  setMetaTag('property', 'og:type', 'website');

  if (metadata.ogImage) {
    setMetaTag('property', 'og:image', metadata.ogImage);
  }

  // Twitter metadata
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', title);
  setMetaTag('name', 'twitter:description', description);

  if (metadata.ogImage) {
    setMetaTag('name', 'twitter:image', metadata.ogImage);
  }
}
