import { GoogleGenAI } from '@google/genai';

// Initialize Gemini on server-side only
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

export interface JarvisAction {
  type:
    | 'CALL'
    | 'WHATSAPP'
    | 'SMS'
    | 'OPEN_APP'
    | 'ADD_REMINDER'
    | 'DEVICE_CONTROL'
    | 'ADD_SCHEDULE_ITEM'
    | 'YOUTUBE_UPLOAD'
    | 'DAILY_AUTOMATION'
    | 'VIDEO_EDIT'
    | 'INSTAGRAM_SETUP'
    | 'VIEW_PLANS'
    | 'GOOGLE_GUIDE'
    | 'GENERAL_QUERY';
  payload?: Record<string, any>;
}

export interface JarvisResponse {
  replyText: string;
  actions: JarvisAction[];
  detectedLanguage?: 'hindi' | 'english' | 'hinglish';
  intentCategory?: string;
}

export async function processJarvisCommand(
  prompt: string,
  context?: {
    knownContacts?: Array<{ name: string; phone: string }>;
    currentReminders?: Array<{ id: string; title: string; time: string }>;
    currentTime?: string;
  }
): Promise<JarvisResponse> {
  const client = getGeminiClient();

  const contactsList = context?.knownContacts && context.knownContacts.length > 0
    ? context.knownContacts.map(c => `- ${c.name}: ${c.phone}`).join('\n')
    : `- Papa: +919876543210\n- Mummy: +919876543211\n- Rahul: +919876543212\n- Boss: +919876543213\n- Doctor: +919876543214`;

  const systemInstruction = `You are J.A.R.V.I.S., the ultimate futuristic personal AI assistant inspired by Iron Man, running directly on the user's Android smartphone.
You address the user respectfully ("Sir", "Boss", or "मालिक/सरकार" when speaking Bhojpuri).

CRITICAL NATURAL VOICE LANGUAGE MATCHING RULE:
You MUST automatically detect the user's exact language / dialect and reply in the EXACT SAME language and conversational style:
1. If the user speaks in Bhojpuri (e.g., "का हाल बा", "रउआ", "कइसन बानी", "फोन मिलाव", "टॉर्च बार", "वीडियो बनाव"):
   -> YOU MUST REPLY IN NATURAL, RESPECTFUL BHOJPURI (e.g., "प्रणाम सरकार! जार्विस रउरा सेवा में हाजिर बा।", "जी मालिक, पापा जी के फोन मिलावत बानी।")
2. If the user speaks in Hindi (Devanagari or spoken Hindi):
   -> YOU MUST REPLY IN NATURAL, RESPECTFUL PURE HINDI (e.g., "नमस्ते सर, आपके सभी सिस्टम सक्रिय हैं।", "जी सर, यूट्यूब खोला जा रहा है।")
3. If the user speaks in Hinglish (Hindi words in English script):
   -> YOU MUST REPLY IN NATURAL HINGLISH (e.g., "Bilkul Sir, Papa ko call mila raha hu.", "Ji Sir, CapCut video editor open kar raha hu.")
4. If the user speaks in English:
   -> YOU MUST REPLY IN SOPHISTICATED ENGLISH (e.g., "Right away, Sir. Initiating video editing workflow.")

If the user changes language mid-conversation, IMMEDIATELY switch to the new language seamlessly!
Keep spoken replies natural, concise (1-2 sentences), conversational, and pleasant for speech synthesis.

Available Contact Directory on the user's phone:
${contactsList}

Recognized Apps to open:
- whatsapp (WhatsApp)
- youtube (YouTube)
- camera (Phone Camera)
- maps (Google Maps)
- chrome (Chrome Browser)
- settings (Phone Settings)
- phone (Phone Dialer)
- messages (SMS App)
- gallery (Photos / Gallery)
- spotify (Music / Spotify)
- clock (Clock / Alarm)
- calculator (Calculator)
- playstore (Google Play Store)
- gmail (Gmail / Mail)

Recognized Device Controls:
- flashlight_on, flashlight_off
- vibrate
- wake_lock_on, wake_lock_off
- battery_check
- volume_mute, volume_up

Recognized Actions structure:
1. CALL: { "type": "CALL", "payload": { "contactName": "Name", "phoneNumber": "number" } }
2. WHATSAPP: { "type": "WHATSAPP", "payload": { "contactName": "Name", "phoneNumber": "number", "message": "text" } }
3. SMS: { "type": "SMS", "payload": { "contactName": "Name", "phoneNumber": "number", "message": "text" } }
4. OPEN_APP: { "type": "OPEN_APP", "payload": { "appKey": "youtube", "appName": "YouTube" } }
5. ADD_REMINDER: { "type": "ADD_REMINDER", "payload": { "title": "Reminder title", "time": "HH:MM", "date": "YYYY-MM-DD" } }
6. DEVICE_CONTROL: { "type": "DEVICE_CONTROL", "payload": { "command": "flashlight_on" | "vibrate" | ... } }
7. ADD_SCHEDULE_ITEM: { "type": "ADD_SCHEDULE_ITEM", "payload": { "title": "Meeting with...", "time": "HH:MM", "category": "work" | "personal" | "health" } }
8. YOUTUBE_UPLOAD: { "type": "YOUTUBE_UPLOAD", "payload": { "trigger": "voice" } } (Triggered when user says "यह वीडियो YouTube पर पोस्ट करो", "YouTube पर वीडियो upload करो", "video upload karo", "post this video on youtube")
9. DAILY_AUTOMATION: { "type": "DAILY_AUTOMATION", "payload": { "trigger": "immediate_post" } } (Triggered when user says "Daily video automation chalao", "aaj ka video banao aur post karo", "Jarvis automated video ready karo", "run daily video automation")
10. VIDEO_EDIT: { "type": "VIDEO_EDIT", "payload": { "app": "capcut" | "inshot" | "kinemaster" | "internal", "aspectRatio": "9:16" | "16:9", "trimStart": true, "addCaption": true, "addMusic": true, "voiceOver": true, "targetPlatform": "youtube" | "instagram" } } (Triggered when user says "इस वीडियो को edit करो", "CapCut में edit करके YouTube के लिए तैयार करो", "edit this video", "CapCut me 9:16 karo caption lagao")
11. INSTAGRAM_SETUP: { "type": "INSTAGRAM_SETUP", "payload": { "targetName": "Khushi" } } (Triggered when user says "मेरे लिए Khushi नाम से Instagram ID बनाओ", "Instagram account banao", "Instagram profile setup karo", "Instagram ID create karo")
12. VIEW_PLANS: { "type": "VIEW_PLANS", "payload": { "preferredPlan": "creator" | "pro" | "free" } } (Triggered when user asks "Jarvis plans dikhao", "Jarvis kitne ka hai", "subscription pricing", "upgrade to Pro", "Creator plan kya hai", "plans")
13. GOOGLE_GUIDE: { "type": "GOOGLE_GUIDE", "payload": { "task": "create_account" | "manage_security" | "recover_account" | "privacy_checkup" } } (Triggered when user says "Google पर नया ID बनाना है", "Google account kaise banaye", "Google guide", "Google password change", "2-step verification", "Google par account create karo")
14. GENERAL_QUERY: For Q&A, greetings, general knowledge, time, status.

You MUST respond strictly in valid JSON format:
{
  "replyText": "Spoken response for JARVIS in Hindi/Hinglish/English",
  "actions": [
    { "type": "CALL", "payload": { "contactName": "Papa", "phoneNumber": "+919876543210" } }
  ],
  "detectedLanguage": "hinglish",
  "intentCategory": "calling"
}`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const text = response.text || '';
    const cleaned = text.trim();
    const parsed = JSON.parse(cleaned) as JarvisResponse;
    return parsed;
  } catch (err: any) {
    console.error('Error generating Jarvis response with Gemini:', err);
    // Graceful fallback parser for instant local execution
    return fallbackLocalParser(prompt);
  }
}

function fallbackLocalParser(rawPrompt: string): JarvisResponse {
  const p = rawPrompt.toLowerCase().trim();

  // Google Assistant + Screen Guide command detection
  if (
    p.includes('google') ||
    p.includes('gmail') ||
    rawPrompt.includes('आईडी') ||
    rawPrompt.includes('आई डी') ||
    p.includes('naya id') ||
    p.includes('new id') ||
    p.includes('google id') ||
    p.includes('google account') ||
    p.includes('screen guide') ||
    p.includes('अगला कदम') ||
    p.includes('agla kadam')
  ) {
    const isSecurity = p.includes('security') || p.includes('2-step') || p.includes('suraksha');
    const isRecovery = p.includes('recover') || p.includes('bhool') || p.includes('password change');
    const isPrivacy = p.includes('privacy') || p.includes('history');

    const task = isSecurity
      ? 'manage_security'
      : isRecovery
      ? 'recover_account'
      : isPrivacy
      ? 'privacy_checkup'
      : 'create_account';

    return {
      replyText:
        'जी मालिक! Google Assistant + स्क्रीन गाइड खोल दिया गया है। मैं आपको हर कदम पर रास्ता दिखाऊंगा और बटन बताऊंगा। पासवर्ड और ओटीपी आप स्वयं सुरक्षित रूप से दर्ज करें।',
      actions: [
        {
          type: 'GOOGLE_GUIDE',
          payload: { task },
        },
      ],
      detectedLanguage: 'hindi',
      intentCategory: 'google_guide',
    };
  }

  // Plans & Pricing command detection
  if (
    p.includes('plan') ||
    p.includes('price') ||
    p.includes('pricing') ||
    p.includes('subscription') ||
    p.includes('kitne ka') ||
    p.includes('pro') ||
    p.includes('creator') ||
    rawPrompt.includes('प्लान') ||
    rawPrompt.includes('रेट') ||
    rawPrompt.includes('कीमत')
  ) {
    const isCreator = p.includes('creator') || p.includes('500');
    const isPro = p.includes('pro') || p.includes('360');
    return {
      replyText: `Sir, JARVIS Plans screen par open kar diye hain. FREE (₹0), PRO (₹360/महीना), aur sabse popular CREATOR (₹500/महीना) uplabdh hain.`,
      actions: [
        {
          type: 'VIEW_PLANS',
          payload: { preferredPlan: isCreator ? 'creator' : isPro ? 'pro' : 'creator' },
        },
      ],
      detectedLanguage: 'hinglish',
      intentCategory: 'plans_pricing',
    };
  }

  // Instagram Account Setup Assistant command detection
  if (
    (p.includes('instagram') && (p.includes('id') || p.includes('account') || p.includes('banao') || p.includes('create') || p.includes('setup'))) ||
    p.includes('khushi') ||
    rawPrompt.includes('इंस्टाग्राम') ||
    rawPrompt.includes('खुशी')
  ) {
    let name = 'Khushi';
    if (p.includes('khushi')) name = 'Khushi';
    return {
      replyText: `Ji Sir! ${name} naam se Instagram ID setup assistant shuru kar raha hu. Instagram official page aur username suggestions taiyaar hain.`,
      actions: [
        {
          type: 'INSTAGRAM_SETUP',
          payload: { targetName: name },
        },
      ],
      detectedLanguage: 'hinglish',
      intentCategory: 'instagram_setup',
    };
  }

  // Video Editing & CapCut Workflow command detection
  if (
    p.includes('edit') ||
    p.includes('capcut') ||
    p.includes('inshot') ||
    p.includes('kinemaster') ||
    rawPrompt.includes('एडिट') ||
    p.includes('trim') ||
    p.includes('काटो')
  ) {
    const isCapcut = p.includes('capcut');
    const is916 = p.includes('9:16') || p.includes('shorts') || p.includes('vertical');
    return {
      replyText: `Ji Sir! Video editing assistant activate kar diya hai. ${isCapcut ? 'CapCut video editor' : 'Video editor'} ke anusaar 9:16 format, captions aur trimming tools ready hain.`,
      actions: [
        {
          type: 'VIDEO_EDIT',
          payload: {
            app: isCapcut ? 'capcut' : 'inshot',
            aspectRatio: is916 ? '9:16' : '16:9',
            trimStart: p.includes('काटो') || p.includes('trim') || p.includes('cut'),
            addCaption: p.includes('caption') || p.includes('subtitle'),
            addMusic: p.includes('music') || p.includes('song') || p.includes('audio'),
            voiceOver: p.includes('voice') || p.includes('aawaz'),
            targetPlatform: p.includes('instagram') ? 'instagram' : 'youtube',
          },
        },
      ],
      detectedLanguage: 'hinglish',
      intentCategory: 'video_editing',
    };
  }

  // Daily AI Video Automation
  if (
    p.includes('daily video') ||
    p.includes('automation') ||
    p.includes('aaj ka video') ||
    p.includes('video banao aur post') ||
    p.includes('6 baje') ||
    rawPrompt.includes('ऑटोमेशन')
  ) {
    return {
      replyText: 'Ji Sir! Daily AI Video Automation sequence trigger kar raha hu. Script aur video rendering shuru ho chuki hai.',
      actions: [
        {
          type: 'DAILY_AUTOMATION',
          payload: { trigger: 'immediate_post' },
        },
      ],
      detectedLanguage: 'hinglish',
      intentCategory: 'daily_automation',
    };
  }

  // YouTube Upload command detection
  if (
    (p.includes('youtube') && (p.includes('upload') || p.includes('post') || p.includes('daalo') || p.includes('bhejo'))) ||
    p.includes('video upload') ||
    p.includes('video post') ||
    rawPrompt.includes('वीडियो') ||
    rawPrompt.includes('अपलोड')
  ) {
    return {
      replyText: 'Ji Sir! YouTube video upload assistant initialize kar raha hu. Kripya video file select karein.',
      actions: [
        {
          type: 'YOUTUBE_UPLOAD',
          payload: { trigger: 'voice' },
        },
      ],
      detectedLanguage: 'hinglish',
      intentCategory: 'youtube_upload',
    };
  }

  // Call detection
  if (p.includes('call') || p.includes('phone') || p.includes('milao')) {
    let name = 'Papa';
    if (p.includes('mummy') || p.includes('maa')) name = 'Mummy';
    else if (p.includes('rahul')) name = 'Rahul';
    else if (p.includes('boss')) name = 'Boss';
    else if (p.includes('doctor')) name = 'Doctor';

    return {
      replyText: `Bilkul Sir, ${name} ko call mila raha hu. Initializing cellular link.`,
      actions: [
        {
          type: 'CALL',
          payload: { contactName: name, phoneNumber: '+919876543210' },
        },
      ],
      detectedLanguage: 'hinglish',
      intentCategory: 'calling',
    };
  }

  // App opening
  if (p.includes('open') || p.includes('kholo') || p.includes('chalao')) {
    let appKey = 'youtube';
    let appName = 'YouTube';
    if (p.includes('capcut')) {
      appKey = 'capcut';
      appName = 'CapCut Video Editor';
    } else if (p.includes('inshot')) {
      appKey = 'inshot';
      appName = 'InShot Video Editor';
    } else if (p.includes('whatsapp')) {
      appKey = 'whatsapp';
      appName = 'WhatsApp';
    } else if (p.includes('camera')) {
      appKey = 'camera';
      appName = 'Camera';
    } else if (p.includes('setting')) {
      appKey = 'settings';
      appName = 'Settings';
    } else if (p.includes('map')) {
      appKey = 'maps';
      appName = 'Google Maps';
    } else if (p.includes('chrome')) {
      appKey = 'chrome';
      appName = 'Google Chrome';
    } else if (p.includes('spotify') || p.includes('music')) {
      appKey = 'spotify';
      appName = 'Spotify';
    } else if (p.includes('gallery') || p.includes('photo')) {
      appKey = 'gallery';
      appName = 'Gallery';
    }

    return {
      replyText: `Yes Sir. Launching ${appName} now.`,
      actions: [{ type: 'OPEN_APP', payload: { appKey, appName } }],
      detectedLanguage: 'hinglish',
      intentCategory: 'app_launch',
    };
  }

  // Reminder
  if (p.includes('reminder') || p.includes('yaad') || p.includes('alarm')) {
    return {
      replyText: `Sir, aapka reminder set kar diya gaya hai. JARVIS will alert you on time.`,
      actions: [
        {
          type: 'ADD_REMINDER',
          payload: {
            title: rawPrompt,
            time: '18:00',
            date: new Date().toISOString().split('T')[0],
          },
        },
      ],
      detectedLanguage: 'hinglish',
      intentCategory: 'reminder',
    };
  }

  // Flashlight / Device
  if (p.includes('torch') || p.includes('flashlight') || p.includes('light')) {
    const isOff = p.includes('off') || p.includes('band');
    return {
      replyText: isOff ? 'Torch turned off, Sir.' : 'Torch activated, Sir.',
      actions: [
        {
          type: 'DEVICE_CONTROL',
          payload: { command: isOff ? 'flashlight_off' : 'flashlight_on' },
        },
      ],
      detectedLanguage: 'hinglish',
      intentCategory: 'device_control',
    };
  }

  return {
    replyText: `At your service, Sir. All Jarvis systems online. How can I assist with your phone today?`,
    actions: [{ type: 'GENERAL_QUERY', payload: { query: rawPrompt } }],
    detectedLanguage: 'hinglish',
    intentCategory: 'conversation',
  };
}
