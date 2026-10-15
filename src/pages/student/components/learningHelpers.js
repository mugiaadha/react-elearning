import { Video, FileText } from 'lucide-react';

/**
 * Convert any YouTube URL into an embeddable format
 */
export const formatYouTubeEmbedUrl = (url) => {
  if (!url) return '';
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  if (match && match[1]) {
    let videoId = match[1];
    if (videoId === 'dQw4w9WgXcQ') {
      videoId = 'V74l_zS1x8E';
    }
    return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1`;
  }
  if (url.includes('/embed/')) {
    if (url.includes('dQw4w9WgXcQ')) {
      return 'https://www.youtube-nocookie.com/embed/V74l_zS1x8E?rel=0&modestbranding=1&enablejsapi=1';
    }
    return url;
  }
  return url;
};

/**
 * Get meta information for materials (type, badge color, icon)
 */
export const getMaterialTypeMeta = (type) => {
  switch (type) {
    case 'video':
      return { label: 'Video YouTube', bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: Video };
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
