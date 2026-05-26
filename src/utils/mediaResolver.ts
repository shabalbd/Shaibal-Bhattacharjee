/**
 * Utility to identify, cleanse, and resolve media links from Google Drive, OneDrive, Dropbox, Box, YouTube, Vimeo, and SharePoint.
 * Returns an object indicating how to display, preview, or stream the cloud media flawlessly.
 */

export interface ResolvedMedia {
  originalUrl: string;
  source: 'gdrive' | 'onedrive' | 'sharepoint' | 'dropbox' | 'box' | 'youtube' | 'vimeo' | 'standard';
  isEmbeddable: boolean; // whether it requires an iframe for interactive streaming (e.g. Google Drive Viewer, YouTube embeds)
  displayUrl: string;    // url suitable for <img> src or visual grid thumbnail representation
  embedUrl: string;      // url suitable for <iframe> src element
  directUrl: string;     // url suitable for standard HTML5 <video src="..."> or direct file pipeline
}

export function resolveMediaLink(url: string, mediaType?: 'image' | 'video'): ResolvedMedia {
  if (!url || typeof url !== 'string') {
    return {
      originalUrl: '',
      source: 'standard',
      isEmbeddable: false,
      displayUrl: '',
      embedUrl: '',
      directUrl: ''
    };
  }

  let trimmed = url.trim();

  // Robust Sanitization: If user pasted a complete <iframe> embed code snippet, pull out the pure src url!
  if (trimmed.startsWith('<') && (trimmed.includes('iframe') || trimmed.includes('src='))) {
    const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      trimmed = srcMatch[1].trim();
    }
  }

  // 1. YOUTUBE
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
  const youtubeMatch = trimmed.match(youtubeRegex);
  if (youtubeMatch && youtubeMatch[1]) {
    const videoId = youtubeMatch[1];
    return {
      originalUrl: trimmed,
      source: 'youtube',
      isEmbeddable: true,
      displayUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`,
      directUrl: `https://www.youtube.com/embed/${videoId}`
    };
  }

  // 2. VIMEO
  const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/i;
  const vimeoMatch = trimmed.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    return {
      originalUrl: trimmed,
      source: 'vimeo',
      isEmbeddable: true,
      displayUrl: `https://vumbnail.com/${videoId}.jpg`,
      embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1`,
      directUrl: `https://player.vimeo.com/video/${videoId}`
    };
  }

  // 3. GOOGLE DRIVE
  const gdriveRegex = /(?:https?:\/\/)?(?:drive|docs)\.google\.com\/(?:file\/d\/|open\?id=|file\/d\/|uc\?id=)([a-zA-Z0-9_-]{25,50})/i;
  const gdriveMatch = trimmed.match(gdriveRegex);

  if (gdriveMatch && gdriveMatch[1]) {
    const fileId = gdriveMatch[1];
    
    return {
      originalUrl: trimmed,
      source: 'gdrive',
      isEmbeddable: false, // Force false so direct video download URL streams natively and autoplays smoothly without requiring a click
      displayUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`,
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      directUrl: `https://drive.google.com/uc?export=download&id=${fileId}&confirm=no_antivirus`
    };
  }

  // 4. DROPBOX
  const isDropbox = trimmed.includes('dropbox.com');
  if (isDropbox) {
    let directUrl = trimmed;
    // Replace dl=0 with raw=1 to get the direct file pointer that resolves without landing page wrappers
    if (directUrl.includes('dl=0')) {
      directUrl = directUrl.replace('dl=0', 'raw=1');
    } else if (!directUrl.includes('raw=1')) {
      directUrl += directUrl.includes('?') ? '&raw=1' : '?raw=1';
    }
    // Convert www.dropbox.com to user content CDN subdomain for direct tag linking
    directUrl = directUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com');

    return {
      originalUrl: trimmed,
      source: 'dropbox',
      isEmbeddable: false,
      displayUrl: directUrl,
      embedUrl: directUrl,
      directUrl: directUrl
    };
  }

  // 5. ONEDRIVE / 1DRV.MS
  const isOneDrive = trimmed.includes('onedrive.live.com') || trimmed.includes('1drv.ms') || trimmed.includes('onedrive.com');
  if (isOneDrive) {
    let directUrl = trimmed;
    let embedUrl = trimmed;
    let displayUrl = trimmed;
    let isEmbeddable = mediaType === 'video';

    // Handle standard OneDrive embed URLs with resid & authkey query parameters
    if (trimmed.includes('resid=') || trimmed.includes('resid%3D')) {
      directUrl = trimmed
        .replace('/embed', '/download')
        .replace('/redir', '/download')
        .replace('embed?', 'download?')
        .replace('redir?', 'download?')
        .replace('edit.aspx?', 'download?');
      embedUrl = trimmed
        .replace('/download', '/embed')
        .replace('/redir', '/embed')
        .replace('download?', 'embed?')
        .replace('redir?', 'embed?')
        .replace('edit.aspx?', 'embed?');
      displayUrl = directUrl;
      isEmbeddable = mediaType === 'video';
    } else {
      // 1drv.ms short URLs or general share URLs
      try {
        // Base64 encode the sharing URL to use the Microsoft v1.0 shares Direct API download
        const bytes = new TextEncoder().encode(trimmed);
        let binary = '';
        bytes.forEach((b) => binary += String.fromCharCode(b));
        let base64 = btoa(binary);
        // Clean to standard base64url format
        base64 = base64.replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
        
        directUrl = `https://api.onedrive.com/v1.0/shares/u!${base64}/root/content`;
        displayUrl = directUrl;
        embedUrl = directUrl;
        // Standard video controls <video src={directUrl}> are vastly superior to OneDrive web viewer iFrame
        isEmbeddable = false;
      } catch (e) {
        console.warn('Failed to resolve OneDrive sharing link, utilizing fallback:', e);
      }
    }

    return {
      originalUrl: trimmed,
      source: 'onedrive',
      isEmbeddable,
      displayUrl,
      embedUrl,
      directUrl
    };
  }

  // 6. BOX
  const isBox = trimmed.includes('box.com');
  if (isBox) {
    const boxMatch = trimmed.match(/box\.com\/s\/([a-zA-Z0-9_-]+)/i);
    if (boxMatch && boxMatch[1]) {
      const shareKey = boxMatch[1];
      const embedUrl = `https://app.box.com/embed/s/${shareKey}`;
      const directUrl = `https://app.box.com/shared/static/${shareKey}`;
      return {
        originalUrl: trimmed,
        source: 'box',
        isEmbeddable: mediaType === 'video',
        displayUrl: directUrl,
        embedUrl: embedUrl,
        directUrl: directUrl
      };
    }
  }

  // 7. SHAREPOINT
  const isSharepoint = trimmed.includes('sharepoint.com');
  if (isSharepoint) {
    return {
      originalUrl: trimmed,
      source: 'sharepoint',
      isEmbeddable: true,
      displayUrl: trimmed,
      embedUrl: trimmed,
      directUrl: trimmed
    };
  }

  // 8. STANDARD EXTERNAL URLs / LOCAL DISK FALLBACK FILES
  return {
    originalUrl: trimmed,
    source: 'standard',
    isEmbeddable: false,
    displayUrl: trimmed,
    embedUrl: trimmed,
    directUrl: trimmed
  };
}
