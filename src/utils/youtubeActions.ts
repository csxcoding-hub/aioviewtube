/**
 * YouTube Data API v3 & Google Account Interactions
 * Enables Like, Subscribe, Comment, and Analytics compliance directly with Google Auth.
 */

export interface ActionResponse {
  success: boolean;
  message: string;
  isApi: boolean;
  error?: string;
}

export function getStoredGoogleToken(): string | null {
  try {
    return localStorage.getItem('looptube_google_token');
  } catch {
    return null;
  }
}

export function setStoredGoogleToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem('looptube_google_token', token);
    } else {
      localStorage.removeItem('looptube_google_token');
    }
  } catch {
    // ignore
  }
}

/**
 * Rates (Likes) a YouTube video using YouTube Data API v3.
 * Official Endpoint: POST https://www.googleapis.com/youtube/v3/videos/rate
 */
export async function likeYouTubeVideo(
  videoId: string,
  token?: string | null
): Promise<ActionResponse> {
  const activeToken = token || getStoredGoogleToken();

  if (activeToken) {
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos/rate?id=${encodeURIComponent(
          videoId
        )}&rating=like`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${activeToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (res.ok || res.status === 204) {
        return {
          success: true,
          message:
            'Video berhasil di-like langsung dengan akun Google Anda! Resmi tercatat di YouTube Studio Analytics.',
          isApi: true,
        };
      }
    } catch (err) {
      console.debug('YouTube Like API fallback:', err);
    }
  }

  // Fallback to opening the video in YouTube
  try {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  } catch {
    // ignore
  }

  return {
    success: true,
    message: 'Halaman YouTube dibuka dengan akun Anda untuk mencatat Like resmi.',
    isApi: false,
  };
}

/**
 * Subscribes to a YouTube Channel using YouTube Data API v3.
 * Official Endpoint: POST https://www.googleapis.com/youtube/v3/subscriptions
 */
export async function subscribeToChannel(
  channelId: string,
  token?: string | null
): Promise<ActionResponse> {
  const activeToken = token || getStoredGoogleToken();

  if (activeToken) {
    try {
      const res = await fetch(
        'https://www.googleapis.com/youtube/v3/subscriptions?part=snippet',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${activeToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            snippet: {
              resourceId: {
                kind: 'youtube#channel',
                channelId: channelId,
              },
            },
          }),
        }
      );

      if (res.ok || res.status === 200 || res.status === 204) {
        return {
          success: true,
          message:
            'Berhasil subscribe ke channel dengan akun Google Anda! Resmi tercatat di YouTube Studio Analytics.',
          isApi: true,
        };
      }
    } catch (err) {
      console.debug('YouTube Subscribe API fallback:', err);
    }
  }

  try {
    window.open(
      `https://www.youtube.com/channel/${channelId}?sub_confirmation=1`,
      '_blank'
    );
  } catch {
    // ignore
  }

  return {
    success: true,
    message: 'Jendela konfirmasi Subscribe YouTube dibuka untuk akun Anda.',
    isApi: false,
  };
}

/**
 * Posts a comment on a YouTube video using YouTube Data API v3.
 * Official Endpoint: POST https://www.googleapis.com/youtube/v3/commentThreads
 */
export async function postYouTubeComment(
  videoId: string,
  text: string,
  token?: string | null
): Promise<ActionResponse> {
  const activeToken = token || getStoredGoogleToken();

  if (!text.trim()) {
    return {
      success: false,
      message: 'Komentar tidak boleh kosong.',
      isApi: false,
    };
  }

  if (activeToken) {
    try {
      const res = await fetch(
        'https://www.googleapis.com/youtube/v3/commentThreads?part=snippet',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${activeToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            snippet: {
              videoId,
              topLevelComment: {
                snippet: {
                  textOriginal: text.trim(),
                },
              },
            },
          }),
        }
      );

      if (res.ok || res.status === 200 || res.status === 201) {
        return {
          success: true,
          message:
            'Komentar berhasil dipublikasikan di video YouTube! Tercatat resmi di diskusi & YouTube Analytics.',
          isApi: true,
        };
      }
    } catch (err) {
      console.debug('YouTube Comment API fallback:', err);
    }
  }

  // Fallback: Copy to clipboard and open YouTube comments section
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text.trim());
    }
    window.open(`https://www.youtube.com/watch?v=${videoId}#comments`, '_blank');
  } catch {
    // ignore
  }

  return {
    success: true,
    message:
      'Teks komentar telah disalin! Jendela komentar YouTube dibuka untuk akun Google Anda, silakan Paste & Kirim.',
    isApi: false,
  };
}
