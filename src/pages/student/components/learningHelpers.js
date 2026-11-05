import { Video, FileText } from 'lucide-react';

/**
 * Convert any YouTube or Google Drive video URL into a stable embeddable format
 */
export const formatYouTubeEmbedUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const cleanUrl = url.trim();

  // 1. Handle Google Drive video preview links
  const gdriveMatch = cleanUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (gdriveMatch && gdriveMatch[1]) {
    return `https://drive.google.com/file/d/${gdriveMatch[1]}/preview`;
  }

  // 2. Handle YouTube Channel / Handle links by mapping to their featured tax video
  if (cleanUrl.toLowerCase().includes('@ddtcindonesia')) {
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
    const originParam = origin ? `&origin=${encodeURIComponent(origin)}` : '';
    return `https://www.youtube.com/embed/M576WGiDBdQ?rel=0&modestbranding=1&enablejsapi=1${originParam}`;
  }
  if (cleanUrl.toLowerCase().includes('@ditjenpajakri')) {
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
    const originParam = origin ? `&origin=${encodeURIComponent(origin)}` : '';
    return `https://www.youtube.com/embed/9ZCWjc-urWQ?rel=0&modestbranding=1&enablejsapi=1${originParam}`;
  }

  // 3. Comprehensive YouTube URL regex supporting:
  // - youtube.com/watch?v=ID
  // - youtube.com/embed/ID
  // - youtube.com/v/ID
  // - youtu.be/ID (with or without ?si=...)
  // - youtube.com/shorts/ID
  // - youtube.com/live/ID
  // - m.youtube.com/...
  const ytMatch = cleanUrl.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/i
  );

  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
    const originParam = origin ? `&origin=${encodeURIComponent(origin)}` : '';
    // Use official www.youtube.com (not youtube-nocookie which triggers cross-origin cookie blocks)
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1${originParam}`;
  }

  // 3. Fallback for raw /embed/ URLs: normalize domain and ensure origin
  if (cleanUrl.includes('/embed/')) {
    const normalized = cleanUrl.replace('youtube-nocookie.com', 'youtube.com');
    if (!normalized.includes('origin=') && typeof window !== 'undefined' && window.location.origin) {
      const sep = normalized.includes('?') ? '&' : '?';
      return `${normalized}${sep}origin=${encodeURIComponent(window.location.origin)}`;
    }
    return normalized;
  }

  return cleanUrl;
};

/**
 * Extract clean, direct watch URL for opening directly in YouTube
 */
export const getDirectWatchUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const cleanUrl = url.trim();

  // If Google Drive
  if (cleanUrl.includes('drive.google.com')) {
    return cleanUrl.replace('/preview', '/view');
  }

  const ytMatch = cleanUrl.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/i
  );

  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/watch?v=${ytMatch[1]}`;
  }

  return cleanUrl;
};

/**
 * Get meta information for materials (type, badge color, icon)
 */
export const getMaterialTypeMeta = (type) => {
  switch (type) {
    case 'video':
      return { label: 'Video Kuliah', bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: Video };
    case 'excel':
      return { label: 'Spreadsheet Excel (GDrive)', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: FileText };
    case 'word':
      return { label: 'Dokumen Word (GDrive)', bg: 'bg-sky-50 text-sky-700 border-sky-200', icon: FileText };
    case 'ppt':
      return { label: 'Slide Presentasi PPT (GDrive)', bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: FileText };
    case 'pdf':
    default:
      return { label: 'Dokumen PDF (GDrive)', bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: FileText };
  }
};
