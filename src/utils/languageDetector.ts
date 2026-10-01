// Smart Natural Language & Dialect Detector for JARVIS
// Supports Hindi (हिंदी), Bhojpuri (भोजपुरी), Hinglish, and English with auto voice-profile mapping

export type DetectedDialect = 'bhojpuri' | 'hindi' | 'hinglish' | 'english';

export interface LanguageDetectionResult {
  dialect: DetectedDialect;
  speechLang: 'hi-IN' | 'en-IN' | 'en-US';
  displayName: string;
  tone: string;
  pitch: number;
  rate: number;
}

// Characteristic Bhojpuri keywords, verbal markers, and grammatical particles
const BHOJPURI_KEYWORDS = [
  'का हाल बा', 'का हाल', 'का समाचार', 'कइसन बा', 'कइसन बानी', 'रउआ', 'तोहार', 'हमार',
  'बा', 'बानी', 'बाटे', 'बाड़ी', 'होइ', 'होई', 'नाहीं', 'ना', 'काहे', 'कहाँ जा तानी',
  'का कर तानी', 'का करत बाड़', 'का करत बा', 'बताव', 'बताईं', 'सुनाईं', 'देखीं', 'रउरा',
  'भोजपुरी', 'बबुआ', 'भैया', 'काहे ला', 'कवन', 'एगो', 'सभे', 'गइल', 'आयल', 'खइलो',
  'ka haal ba', 'kaisen ba', 'kaise ba', 'raua', 'hamar', 'tohar', 'bani', 'bate', 'baade',
  'hoi', 'naahi', 'kahe', 'kaha jaat bani', 'ka karat ba', 'batawa', 'batai', 'sunai',
  'bhojpuri', 'babu', 'bhaiya', 'kahe la', 'kawan', 'aego', 'gail', 'aayal', 'kail jaav'
];

// Pure Devanagari Hindi keywords & markers
const HINDI_DEVANAGARI_MARKERS = [
  'नमस्ते', 'कैसा', 'कैसी', 'कैसे', 'क्या', 'कहाँ', 'करो', 'कीजिए', 'बताइए', 'सुनिए',
  'धन्यवाद', 'शुक्रिया', 'हाल', 'समय', 'फोन', 'कॉल', 'मैसेज', 'याद', 'अलार्म', 'खोलो',
  'चलाओ', 'बनाओ', 'दिखाओ', 'है', 'हूँ', 'हैं', 'था', 'थी', 'थे', 'होगा', 'होगी'
];

// Hinglish Roman markers
const HINGLISH_KEYWORDS = [
  'kya', 'kaise', 'kaha', 'kab', 'karo', 'khol', 'kholo', 'bhejo', 'lagao', 'dikhao',
  'banao', 'chalao', 'batao', 'sunao', 'shuru', 'karna', 'hai', 'hoon', 'hain', 'tha',
  'thi', 'the', 'hoga', 'mera', 'meri', 'mere', 'tumhara', 'aapka', 'aapki', 'sir',
  'bhai', 'yaar', 'bolo', 'sun', 'dekho', 'lekin', 'kyunki', 'theek', 'achha', 'accha'
];

export function detectLanguageAndDialect(text: string): LanguageDetectionResult {
  const raw = text.trim();
  const lower = raw.toLowerCase();

  if (!raw) {
    return {
      dialect: 'hinglish',
      speechLang: 'hi-IN',
      displayName: 'Hinglish (Default)',
      tone: 'Crisp & Loyal',
      pitch: 0.95,
      rate: 1.02,
    };
  }

  // 1. Check for Bhojpuri
  const isBhojpuri = BHOJPURI_KEYWORDS.some(kw => lower.includes(kw));
  if (isBhojpuri) {
    return {
      dialect: 'bhojpuri',
      speechLang: 'hi-IN', // Uses warm Indian acoustic profile
      displayName: 'भोजपुरी (Bhojpuri)',
      tone: 'आदरपूर्वक, अपनत्व भरी और ठेठ देसी भोजपुरी आवाज़',
      pitch: 0.98,
      rate: 1.0,
    };
  }

  // 2. Check for Hindi in Devanagari script (Unicode range \u0900-\u097F)
  const devanagariCount = (raw.match(/[\u0900-\u097F]/g) || []).length;
  const totalLetters = (raw.match(/[a-zA-Z\u0900-\u097F]/g) || []).length || 1;
  const isDevanagariDominant = (devanagariCount / totalLetters) > 0.35;

  if (isDevanagariDominant || HINDI_DEVANAGARI_MARKERS.some(m => raw.includes(m))) {
    return {
      dialect: 'hindi',
      speechLang: 'hi-IN',
      displayName: 'शुद्ध हिंदी (Hindi)',
      tone: 'स्पष्ट, गंभीर, उच्च कोटि की स्वाभाविक हिंदी आवाज़',
      pitch: 0.95,
      rate: 1.0,
    };
  }

  // 3. Check for Hinglish (Roman English script containing Hindi words)
  const words = lower.replace(/[^a-z0-9\s]/g, '').split(/\s+/);
  const hinglishMatchCount = words.filter(w => HINGLISH_KEYWORDS.includes(w)).length;
  const isHinglish = hinglishMatchCount >= 1 || (hinglishMatchCount / Math.max(1, words.length)) > 0.15;

  if (isHinglish) {
    return {
      dialect: 'hinglish',
      speechLang: 'hi-IN', // Indian English / Hindi accent sounds most natural for Hinglish
      displayName: 'Hinglish (हिंग्लिश)',
      tone: 'Smart, sharp Tony Stark style Hinglish',
      pitch: 0.96,
      rate: 1.03,
    };
  }

  // 4. Default to English
  return {
    dialect: 'english',
    speechLang: 'en-IN', // Indian English/Global English
    displayName: 'English',
    tone: 'Sophisticated & refined British-Indian AI cadence',
    pitch: 0.95,
    rate: 1.02,
  };
}

// Generate natural dialect-aligned responses for fallback / instant actions
export function getDialectAlignedReply(
  dialect: DetectedDialect,
  intent: 'greeting' | 'call' | 'whatsapp' | 'torch_on' | 'torch_off' | 'youtube_open' | 'capcut_edit' | 'daily_automation' | 'plans' | 'general_status' | 'unknown',
  params?: Record<string, any>
): string {
  const name = params?.name || params?.contactName || 'Papa';
  const app = params?.app || 'CapCut';

  switch (dialect) {
    case 'bhojpuri':
      switch (intent) {
        case 'greeting':
          return 'प्रणाम सरकार! का हाल-चाल बा? जार्विस रउरा सेवा में हाजिर बा, आज्ञा दीं का काम करे के बा!';
        case 'call':
          return `जी मालिक! ${name} जी के फोन मिलावत बानी, लाइन जोड़ल जा रहल बा।`;
        case 'whatsapp':
          return `जी हुजूर! ${name} के WhatsApp पर संदेशा भेजल जा रहल बा।`;
        case 'torch_on':
          return 'मालिक, फोन के टॉर्च बार दिहलीं ह।';
        case 'torch_off':
          return 'जी, टॉर्च बुझा दिहलीं ह।';
        case 'youtube_open':
          return 'जी मालिक! YouTube खोलत बानी, देखल जाव।';
        case 'capcut_edit':
          return `हुजूर! ${app} खोल के वीडियो 9:16 में एडिट करे खातिर एकदम तैयार कर दिहलीं ह।`;
        case 'daily_automation':
          return 'मालिक! आजु के डेली वीडियो बना के YouTube पर डाले के काम शुरू कर दिहलीं ह।';
        case 'plans':
          return 'मालिक! जार्विस के सभे प्लान देखाई दे रहल बा: मुफ़्त (₹0), PRO (₹360/महीना) आ सबसे बढ़िया CREATOR प्लान (₹500/महीना)।';
        case 'general_status':
          return 'जार्विस के सभे सिस्टम एकदम चकाचक बा सरकार! रउरा आदेश करीं।';
        default:
          return 'जी मालिक, रउरा बात समझ गइनी। काम शुरू कइल जा रहल बा!';
      }

    case 'hindi':
      switch (intent) {
        case 'greeting':
          return 'नमस्ते सर! मैं जार्विस हूँ। आपके सभी सिस्टम सुचारू रूप से कार्य कर रहे हैं। आज्ञा दीजिए, क्या सहायता करूँ?';
        case 'call':
          return `जी सर, ${name} को कॉल मिला रहा हूँ। सेल्यूलर संपर्क स्थापित किया जा रहा है।`;
        case 'whatsapp':
          return `जी सर, ${name} को WhatsApp पर संदेश भेजा जा रहा है।`;
        case 'torch_on':
          return 'फ्लैशलाइट चालू कर दी गई है, सर।';
        case 'torch_off':
          return 'फ्लैशलाइट बंद कर दी गई है, सर।';
        case 'youtube_open':
          return 'जी सर, YouTube शुरू किया जा रहा है।';
        case 'capcut_edit':
          return `जी सर! ${app} वीडियो एडिटर 9:16 अनुपात, सबटाइटल्स और ट्रिमिंग टूल्स के साथ तैयार है।`;
        case 'daily_automation':
          return 'जी सर! आज का दैनिक AI वीडियो निर्माण और YouTube पोस्टिंग क्रम शुरू कर दिया गया है।';
        case 'plans':
          return 'सर, जार्विस के प्लान्स स्क्रीन पर हैं: FREE (₹0), PRO (₹360/महीना) और सबसे लोकप्रिय CREATOR (₹500/महीना)।';
        case 'general_status':
          return 'सभी प्रणालियाँ सामान्य हैं, सर। मैं आपके अगले निर्देश की प्रतीक्षा कर रहा हूँ।';
        default:
          return 'जी सर, आपका निर्देश स्वीकार कर लिया गया है। कार्य प्रगति पर है।';
      }

    case 'english':
      switch (intent) {
        case 'greeting':
          return 'Greetings, Sir. JARVIS online and all systems nominal. How may I be of assistance today?';
        case 'call':
          return `Connecting cellular link to ${name} immediately, Sir.`;
        case 'whatsapp':
          return `Dispatching WhatsApp dispatch to ${name}, Sir.`;
        case 'torch_on':
          return 'Flashlight illuminated, Sir.';
        case 'torch_off':
          return 'Flashlight deactivated, Sir.';
        case 'youtube_open':
          return 'Opening YouTube application now, Sir.';
        case 'capcut_edit':
          return `Configuring ${app} editor for 9:16 vertical shorts with captions and export parameters.`;
        case 'daily_automation':
          return 'Triggering automated daily video generation pipeline for YouTube, Sir.';
        case 'plans':
          return 'Displaying JARVIS subscription plans: FREE (₹0), PRO (₹360/mo), and CREATOR (₹500/mo).';
        case 'general_status':
          return 'All diagnostic systems running at maximum efficiency, Sir.';
        default:
          return 'Right away, Sir. Processing your command now.';
      }

    case 'hinglish':
    default:
      switch (intent) {
        case 'greeting':
          return 'Hello Sir! Main JARVIS hu. Saare systems active hain, bataiye aaj kya karna hai?';
        case 'call':
          return `Bilkul Sir, ${name} ko call mila raha hu. Cellular link connect ho raha hai.`;
        case 'whatsapp':
          return `Ji Sir, ${name} ko WhatsApp par message dispatch kar raha hu.`;
        case 'torch_on':
          return 'Torch turn on kar di hai, Sir.';
        case 'torch_off':
          return 'Torch turn off kar di hai, Sir.';
        case 'youtube_open':
          return 'Ji Sir, YouTube application launch kar raha hu.';
        case 'capcut_edit':
          return `Ji Sir! ${app} video editor 9:16 format, captions aur trimming ke sath ready hai.`;
        case 'daily_automation':
          return 'Ji Sir! Aaj ka daily AI video generate aur YouTube upload sequence start ho chuka hai.';
        case 'plans':
          return 'Sir, JARVIS Plans screen par open kar diye hain: FREE (₹0), PRO (₹360/महीना) aur CREATOR (₹500/महीना)।';
        case 'general_status':
          return 'JARVIS systems operational hain, Sir. Aadesh dijiye!';
        default:
          return 'Ji Sir, aapka command execute ho raha hai.';
      }
  }
}
