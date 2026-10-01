// Hardware & Android Intent controller for JARVIS

let videoTrackForTorch: MediaStreamTrack | null = null;
let wakeLockSentinel: any = null;

// Trigger Direct Phone Call on Android
export function executePhoneCall(phoneNumber: string): boolean {
  if (!phoneNumber) return false;
  const cleanNumber = phoneNumber.replace(/\s+/g, '');
  // Trigger tel: intent
  window.location.href = `tel:${cleanNumber}`;
  return true;
}

// Trigger WhatsApp Message
export function executeWhatsAppMessage(phoneNumber: string, message: string = ''): boolean {
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(message);
  
  if (cleanNumber) {
    window.open(`https://wa.me/${cleanNumber}?text=${encodedText}`, '_blank');
  } else {
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  }
  return true;
}

// Trigger SMS
export function executeSms(phoneNumber: string, message: string = ''): boolean {
  const cleanNumber = phoneNumber.replace(/\s+/g, '');
  const encodedBody = encodeURIComponent(message);
  window.location.href = `sms:${cleanNumber}?body=${encodedBody}`;
  return true;
}

// Launch Android Apps or Web Links
export function executeOpenApp(appKey: string): { success: boolean; name: string } {
  const key = appKey.toLowerCase().trim();

  const apps: Record<string, { name: string; url: string; fallbackUrl?: string }> = {
    whatsapp: {
      name: 'WhatsApp',
      url: 'whatsapp://send',
      fallbackUrl: 'https://web.whatsapp.com',
    },
    youtube: {
      name: 'YouTube',
      url: 'intent:#Intent;package=com.google.android.youtube;action=android.intent.action.MAIN;end',
      fallbackUrl: 'https://www.youtube.com',
    },
    youtube_upload: {
      name: 'YouTube Upload',
      url: 'intent:#Intent;package=com.google.android.youtube;action=com.google.android.youtube.intent.action.UPLOAD;end',
      fallbackUrl: 'https://studio.youtube.com',
    },
    camera: {
      name: 'Camera',
      url: 'intent:#Intent;action=android.media.action.IMAGE_CAPTURE;end',
      fallbackUrl: '',
    },
    maps: {
      name: 'Google Maps',
      url: 'https://maps.google.com',
      fallbackUrl: 'https://maps.google.com',
    },
    settings: {
      name: 'Android Settings',
      url: 'intent:#Intent;action=android.settings.SETTINGS;end',
      fallbackUrl: '',
    },
    chrome: {
      name: 'Google Chrome',
      url: 'googlechrome://navigate?url=https://www.google.com',
      fallbackUrl: 'https://www.google.com',
    },
    spotify: {
      name: 'Spotify Music',
      url: 'spotify://',
      fallbackUrl: 'https://open.spotify.com',
    },
    gmail: {
      name: 'Gmail',
      url: 'googlegmail://',
      fallbackUrl: 'https://mail.google.com',
    },
    playstore: {
      name: 'Google Play Store',
      url: 'market://details?id=com.google.android.googlequicksearchbox',
      fallbackUrl: 'https://play.google.com',
    },
    clock: {
      name: 'Clock / Alarm',
      url: 'intent:#Intent;action=android.intent.action.SHOW_ALARMS;end',
      fallbackUrl: '',
    },
    calculator: {
      name: 'Calculator',
      url: 'intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.APP_CALCULATOR;end',
      fallbackUrl: '',
    },
    gallery: {
      name: 'Gallery / Photos',
      url: 'intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.APP_GALLERY;end',
      fallbackUrl: '',
    },
    capcut: {
      name: 'CapCut Video Editor',
      url: 'intent:#Intent;package=com.lemon.lvoverseas;action=android.intent.action.MAIN;end',
      fallbackUrl: 'https://play.google.com/store/apps/details?id=com.lemon.lvoverseas',
    },
    inshot: {
      name: 'InShot Video Editor',
      url: 'intent:#Intent;package=com.camerasideas.instashot;action=android.intent.action.MAIN;end',
      fallbackUrl: 'https://play.google.com/store/apps/details?id=com.camerasideas.instashot',
    },
    kinemaster: {
      name: 'KineMaster',
      url: 'intent:#Intent;package=com.nexstreaming.app.kinemasterfree;action=android.intent.action.MAIN;end',
      fallbackUrl: 'https://play.google.com/store/apps/details?id=com.nexstreaming.app.kinemasterfree',
    },
    instagram: {
      name: 'Instagram',
      url: 'intent:#Intent;package=com.instagram.android;action=android.intent.action.MAIN;end',
      fallbackUrl: 'https://www.instagram.com',
    },
    instagram_signup: {
      name: 'Instagram Signup',
      url: 'https://www.instagram.com/accounts/emailsignup/',
      fallbackUrl: 'https://www.instagram.com/accounts/emailsignup/',
    },
  };

  const target = apps[key] || {
    name: appKey,
    url: `https://www.google.com/search?q=${encodeURIComponent(appKey)}`,
  };

  try {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

    if (isAndroid) {
      // Direct intent wakes up the app even if killed or closed in background
      // Using an anchor with intent URI triggers Android Package Manager
      const link = document.createElement('a');
      link.href = target.url;
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 500);
    } else if (isMobile) {
      window.location.href = target.url;
    } else {
      window.open(target.fallbackUrl || target.url, '_blank');
    }
    return { success: true, name: target.name };
  } catch (err) {
    console.warn('App open intent failed:', err);
    if (target.fallbackUrl) {
      window.open(target.fallbackUrl, '_blank');
    }
    return { success: false, name: target.name };
  }
}

// Flashlight / Torch Control using WebRTC MediaStream Track
export async function toggleTorch(turnOn: boolean): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
    return false;
  }

  try {
    if (!turnOn) {
      if (videoTrackForTorch) {
        videoTrackForTorch.stop();
        videoTrackForTorch = null;
      }
      return false;
    }

    // Turn on
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        advanced: [{ torch: true } as any],
      } as any,
    });

    const track = stream.getVideoTracks()[0];
    if (track) {
      videoTrackForTorch = track;
      // Try applying torch constraint if supported
      try {
        await (track as any).applyConstraints({
          advanced: [{ torch: true }],
        });
      } catch {}
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Flashlight access not available or denied:', err);
    return false;
  }
}

// Haptic Vibration feedback
export function triggerHaptic(pattern: number | number[] = 100): boolean {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
      return true;
    } catch {}
  }
  return false;
}

// Keep screen awake (WakeLock) for Iron Man HUD
export async function setScreenWakeLock(enable: boolean): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
    return false;
  }

  try {
    if (enable) {
      wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
      wakeLockSentinel.addEventListener('release', () => {
        wakeLockSentinel = null;
      });
      return true;
    } else {
      if (wakeLockSentinel) {
        await wakeLockSentinel.release();
        wakeLockSentinel = null;
      }
      return false;
    }
  } catch (err) {
    console.warn('Wake Lock request failed:', err);
    return false;
  }
}

// Query Battery Level & Charging Status
export async function getBatteryStatus(): Promise<{
  level: number;
  charging: boolean;
} | null> {
  if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
    try {
      const battery = await (navigator as any).getBattery();
      return {
        level: Math.round(battery.level * 100),
        charging: battery.charging,
      };
    } catch {}
  }
  return null;
}
