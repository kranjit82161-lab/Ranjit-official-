import { GoogleGenAI } from '@google/genai';

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

export interface VideoScene {
  id: number;
  heading: string;
  narration: string; // Hindi/Hinglish speech script
  caption: string;   // High-impact on-screen text
  durationSeconds: number; // 4 to 6 seconds per scene
  graphicStyle: 'quantum_matrix' | 'ai_neural_net' | 'deep_space' | 'cyber_hologram' | 'future_robotics';
  primaryColor: string;
  secondaryColor: string;
}

export interface GeneratedVideoScript {
  topic: string;
  youtubeTitle: string;
  youtubeDescription: string;
  tags: string[];
  scenes: VideoScene[];
  totalEstimatedSeconds: number;
  bgmMood: 'cyber_epic' | 'ambient_tech' | 'energetic_pulse';
}

export async function generateDailyVideoScript(params: {
  category?: string;
  customTopic?: string;
  aspectRatio?: '9:16' | '16:9';
}): Promise<GeneratedVideoScript> {
  const client = getGeminiClient();

  const category = params.category || 'Tech & AI Breakthroughs';
  const customTopic = params.customTopic ? `Focus specifically on: "${params.customTopic}"` : '';

  const systemInstruction = `You are J.A.R.V.I.S., Tony Stark's AI director creating a viral, high-energy YouTube Shorts video (9:16 vertical format).
Your mission is to produce a complete daily automated video package that will be rendered into a real video and uploaded to YouTube.

Category: ${category}
${customTopic}

Requirements:
1. Target Audience: Indian & Global youth interested in cutting-edge tech, AI, Stark science, future robotics, space mysteries, and motivation.
2. Language: Conversational Hindi / Hinglish (e.g. "Kya aapko pata hai ki agle 5 saalo me AI...", "Imagine karo ek aisi duniya jahan...").
3. Video Length: Punchy 20-30 seconds total across 4 distinct visual scenes.
4. Each scene must include:
   - heading: 2-4 word punchy title.
   - narration: 1-2 spoken sentences in Hindi/Hinglish for voiceover.
   - caption: 3-6 words in ALL-CAPS for large on-screen kinetic subtitle.
   - durationSeconds: 5 to 6 seconds.
   - graphicStyle: One of ["quantum_matrix", "ai_neural_net", "deep_space", "cyber_hologram", "future_robotics"].
   - primaryColor: Hex color (e.g. #06b6d4, #ef4444, #8b5cf6, #f59e0b).
   - secondaryColor: Hex color.
5. YouTube Metadata:
   - youtubeTitle: Viral, high CTR title ending with #Shorts #JARVIS (max 80 chars).
   - youtubeDescription: Engaging 2-3 paragraph summary + 6 hashtags + subscribe call to action.
   - tags: 10-15 keyword tags.

Respond strictly in valid JSON format matching this schema:
{
  "topic": "Clean topic name",
  "youtubeTitle": "Viral YouTube Shorts Title #Shorts",
  "youtubeDescription": "Description text with #hashtags",
  "tags": ["AI", "Tech", "Shorts"],
  "bgmMood": "cyber_epic",
  "totalEstimatedSeconds": 24,
  "scenes": [
    {
      "id": 1,
      "heading": "THE AI REVOLUTION",
      "narration": "Kya aap taiyaar hain agle 5 saal ke sabse bade AI badlaav ke liye?",
      "caption": "AI WILL CHANGE EVERYTHING",
      "durationSeconds": 5,
      "graphicStyle": "ai_neural_net",
      "primaryColor": "#06b6d4",
      "secondaryColor": "#38bdf8"
    }
  ]
}`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Generate today's complete daily automated YouTube Shorts script for category: ${category}. Date: ${new Date().toISOString().split('T')[0]}.`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text.trim()) as GeneratedVideoScript;
    return parsed;
  } catch (err: any) {
    console.error('Failed to generate daily video script with Gemini:', err);
    // Reliable fallback script
    return {
      topic: 'Future of Humanoid AI & Tony Stark Tech',
      youtubeTitle: 'Inside The Future of Superintelligent AI! 🤖🔥 #Shorts #JARVIS',
      youtubeDescription: `Welcome to the daily JARVIS AI broadcast!\n\nToday we explore the breathtaking evolution of Artificial Intelligence and humanoid robots that are reshaping human civilization.\n\nAutomated by J.A.R.V.I.S. Daily Video Automation Engine.\n\n#Jarvis #AI #FutureTech #Shorts #Robotics #Innovation`,
      tags: ['JARVIS', 'ArtificialIntelligence', 'FutureTech', 'Shorts', 'Robotics', 'Technology', 'HindiTech'],
      bgmMood: 'cyber_epic',
      totalEstimatedSeconds: 22,
      scenes: [
        {
          id: 1,
          heading: 'NEXT-GEN AI AWAKENING',
          narration: 'Doston, agle 3 saalon me AI aapke sochte hi poora kaam finish kar dega.',
          caption: 'SUPERINTELLIGENCE IS COMING',
          durationSeconds: 5,
          graphicStyle: 'ai_neural_net',
          primaryColor: '#06b6d4',
          secondaryColor: '#38bdf8',
        },
        {
          id: 2,
          heading: 'QUANTUM SPEED',
          narration: 'Quantum computing aur neural networks ab milkar trillions of calculations per second solve kar rahe hain.',
          caption: 'QUANTUM SUPREMACY UNLOCKED',
          durationSeconds: 6,
          graphicStyle: 'quantum_matrix',
          primaryColor: '#8b5cf6',
          secondaryColor: '#a855f7',
        },
        {
          id: 3,
          heading: 'STARK LEVEL AUTOMATION',
          narration: 'JARVIS ki tarah har smartphone ek powerful autonomous assistant banne ja raha hai.',
          caption: 'JARVIS IN EVERY POCKET',
          durationSeconds: 5,
          graphicStyle: 'cyber_hologram',
          primaryColor: '#ef4444',
          secondaryColor: '#f97316',
        },
        {
          id: 4,
          heading: 'ARE YOU READY?',
          narration: 'Kripya channel ko subscribe karein aur daily future updates ke liye jude rahein!',
          caption: 'SUBSCRIBE FOR DAILY TECH',
          durationSeconds: 6,
          graphicStyle: 'deep_space',
          primaryColor: '#10b981',
          secondaryColor: '#34d399',
        },
      ],
    };
  }
}
