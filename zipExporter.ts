import JSZip from 'jszip';
import { SIMPLE_REPO_FILES } from '../data/simpleRepoFiles';

export async function exportSimpleZip(): Promise<Blob> {
  try {
    const res = await fetch('/api/export-full-zip');
    if (res.ok) {
      return await res.blob();
    }
  } catch (e) {
    console.warn('Falling back to client-side packaging:', e);
  }

  const zip = new JSZip();

  SIMPLE_REPO_FILES.forEach((file) => {
    zip.file(file.path, file.content);
  });

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 9,
    },
  });

  return blob;
}

export function triggerDownload(blob: Blob, filename = 'calist-simple-meeting-agent.zip') {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
