// YouTube Data API v3 Real Resumable Video Uploader

export interface YouTubeUploadParams {
  accessToken: string;
  file: File;
  title: string;
  description: string;
  tags?: string[];
  privacy: 'public' | 'unlisted' | 'private';
  onProgress: (percent: number, loadedBytes: number, totalBytes: number) => void;
  signal?: AbortSignal;
}

export interface YouTubeUploadResult {
  videoId: string;
  videoUrl: string;
  title: string;
}

export async function uploadVideoToYouTube({
  accessToken,
  file,
  title,
  description,
  tags = [],
  privacy = 'public',
  onProgress,
  signal,
}: YouTubeUploadParams): Promise<YouTubeUploadResult> {
  if (!accessToken) {
    throw new Error('Access token is missing. Please connect your YouTube account.');
  }

  if (!file) {
    throw new Error('Please select a video file to upload.');
  }

  // Step 1: Initiate Resumable Upload Session with YouTube Metadata
  const metadata = {
    snippet: {
      title: title.trim() || file.name.replace(/\.[^/.]+$/, ''),
      description: description.trim(),
      tags: tags.filter((t) => t.trim().length > 0),
      categoryId: '22', // People & Blogs default
    },
    status: {
      privacyStatus: privacy, // "public" | "unlisted" | "private"
      selfDeclaredMadeForKids: false,
    },
  };

  const initResponse = await fetch(
    'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Length': file.size.toString(),
        'X-Upload-Content-Type': file.type || 'video/mp4',
      },
      body: JSON.stringify(metadata),
      signal,
    }
  );

  if (!initResponse.ok) {
    const errBody = await initResponse.text().catch(() => '');
    let parsedMsg = `YouTube API Error (${initResponse.status})`;
    try {
      const json = JSON.parse(errBody);
      if (json.error?.message) {
        parsedMsg = json.error.message;
      }
    } catch {}
    throw new Error(parsedMsg);
  }

  const uploadLocationUrl = initResponse.headers.get('Location');
  if (!uploadLocationUrl) {
    throw new Error('YouTube did not return a valid upload location URL.');
  }

  // Step 2: Upload Video File Binary to Resumable Session URL with Progress Tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadLocationUrl);
    xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');

    if (signal) {
      signal.addEventListener('abort', () => {
        xhr.abort();
        reject(new Error('Upload was cancelled.'));
      });
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
        onProgress(percent, event.loaded, event.total);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        try {
          const response = JSON.parse(xhr.responseText);
          const videoId = response.id;
          if (!videoId) {
            throw new Error('Video ID missing from YouTube response.');
          }
          resolve({
            videoId,
            videoUrl: `https://youtu.be/${videoId}`,
            title: response.snippet?.title || title,
          });
        } catch (e: any) {
          reject(new Error('Failed to parse YouTube upload response: ' + e.message));
        }
      } else {
        let errDesc = `Upload failed with status ${xhr.status}`;
        try {
          const json = JSON.parse(xhr.responseText);
          if (json.error?.message) {
            errDesc = json.error.message;
          }
        } catch {}
        reject(new Error(errDesc));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error occurred during YouTube video upload. Please check connection.'));
    };

    xhr.send(file);
  });
}
