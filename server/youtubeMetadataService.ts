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

export interface GeneratedYouTubeMetadata {
  title: string;
  description: string;
  tags: string[];
}

export async function generateYouTubeMetadata(params: {
  fileName: string;
  fileSizeMb?: number;
  userPrompt?: string;
  language?: string;
}): Promise<GeneratedYouTubeMetadata> {
  const client = getGeminiClient();

  const prompt = `You are J.A.R.V.I.S., the ultimate YouTube Optimization AI for Tony Stark / user.
A user on an Android mobile phone is uploading a video to YouTube.
Generate a high-CTR, viral yet professional YouTube Video Title, comprehensive SEO Description with hashtags, and relevant Tags.

Video Information:
- File Name: ${params.fileName}
${params.fileSizeMb ? `- Approximate Size: ${params.fileSizeMb.toFixed(1)} MB` : ''}
${params.userPrompt ? `- User's Topic or Notes: "${params.userPrompt}"` : ''}
- Target Language: ${params.language || 'Hindi / Hinglish & English'}

Requirements:
1. Title: Engaging, catchy, relevant, under 90 characters. Can be Hindi/Hinglish or English based on context.
2. Description: 3-5 well-structured paragraphs including a brief overview, key moments/takeaways, disclaimer, and 4-6 hashtags (e.g. #Jarvis #Tech #Shorts).
3. Tags: An array of 10-15 high-ranking YouTube keyword tags.

Respond strictly in valid JSON format:
{
  "title": "Clean YouTube Video Title",
  "description": "Full detailed description with hashtags",
  "tags": ["tag1", "tag2", "tag3"]
}`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return {
      title: parsed.title || params.fileName.replace(/\.[^/.]+$/, ''),
      description: parsed.description || 'Uploaded via JARVIS Mobile Assistant.',
      tags: Array.isArray(parsed.tags) ? parsed.tags : ['JARVIS', 'MobileUpload', 'Tech'],
    };
  } catch (err) {
    console.error('Failed to generate YouTube metadata with Gemini:', err);
    // Graceful fallback
    const cleanName = params.fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    return {
      title: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
      description: `Uploaded with JARVIS AI Mobile Assistant.\n\nEnjoy the video and subscribe for more updates!\n\n#Jarvis #YouTube #Video`,
      tags: ['JARVIS', 'Video', 'AndroidUpload', 'YouTubeCreator'],
    };
  }
}
