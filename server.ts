import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { processJarvisCommand } from './server/jarvisService.ts';
import { generateYouTubeMetadata } from './server/youtubeMetadataService.ts';
import { generateDailyVideoScript } from './server/videoAutomationService.ts';
import {
  createPaymentOrder,
  verifyPaymentStatus,
  getCurrentSubscription,
  getAdminPaymentHistory,
} from './server/paymentService.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API: Process voice/text command for JARVIS
app.post('/api/jarvis/command', async (req: Request, res: Response) => {
  try {
    const { prompt, context } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Command prompt is required.' });
    }

    const result = await processJarvisCommand(prompt, context);
    return res.json(result);
  } catch (error: any) {
    console.error('API Error in /api/jarvis/command:', error);
    return res.status(500).json({
      error: 'Failed to process command',
      details: error?.message || 'Unknown error',
    });
  }
});

// API: Generate AI YouTube Title, Description & Tags
app.post('/api/youtube/generate-metadata', async (req: Request, res: Response) => {
  try {
    const { fileName, fileSizeMb, userPrompt, language } = req.body;
    if (!fileName) {
      return res.status(400).json({ error: 'fileName is required.' });
    }

    const metadata = await generateYouTubeMetadata({
      fileName,
      fileSizeMb,
      userPrompt,
      language,
    });
    return res.json(metadata);
  } catch (error: any) {
    console.error('API Error in /api/youtube/generate-metadata:', error);
    return res.status(500).json({
      error: 'Failed to generate YouTube metadata',
      details: error?.message || 'Unknown error',
    });
  }
});

// API: Daily AI Video Automation Script Generator
app.post('/api/video-automation/generate-script', async (req: Request, res: Response) => {
  try {
    const { category, customTopic, aspectRatio } = req.body;
    const script = await generateDailyVideoScript({
      category,
      customTopic,
      aspectRatio,
    });
    return res.json(script);
  } catch (error: any) {
    console.error('API Error in /api/video-automation/generate-script:', error);
    return res.status(500).json({
      error: 'Failed to generate daily video script',
      details: error?.message || 'Unknown error',
    });
  }
});

// ==========================================
// 💳 SECURE PAYMENT & SUBSCRIPTION APIs
// ==========================================

// 1. Create PhonePe / UPI Checkout Order
app.post('/api/payment/create-order', async (req: Request, res: Response) => {
  try {
    const { planId, planName, amount, userEmail, userName, phone } = req.body;
    if (!planId || !amount) {
      return res.status(400).json({ error: 'planId and amount are required.' });
    }

    const orderData = await createPaymentOrder({
      planId,
      planName: planName || (planId === 'creator' ? 'CREATOR' : 'PRO'),
      amount: Number(amount),
      userEmail,
      userName,
      phone,
    });

    return res.json({
      success: true,
      order: orderData,
    });
  } catch (error: any) {
    console.error('Error in /api/payment/create-order:', error);
    return res.status(500).json({
      error: 'Failed to create payment checkout order',
      details: error?.message || 'Unknown error',
    });
  }
});

// 2. Verify Payment with Bank/UPI Gateway (Server-Side Verification)
app.post('/api/payment/verify-payment', async (req: Request, res: Response) => {
  try {
    const { orderId, transactionRef, paymentMode } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required for verification.' });
    }

    const result = await verifyPaymentStatus({
      orderId,
      transactionRef,
      paymentMode,
    });

    return res.json(result);
  } catch (error: any) {
    console.error('Error in /api/payment/verify-payment:', error);
    return res.status(500).json({
      error: 'Failed to verify payment',
      details: error?.message || 'Unknown error',
    });
  }
});

// 3. Get Active User Subscription & Validity
app.get('/api/payment/current-subscription', (_req: Request, res: Response) => {
  try {
    const sub = getCurrentSubscription();
    return res.json({
      success: true,
      subscription: sub,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
});

// 4. Admin Audit: Payment History & All Subscriptions
app.get('/api/payment/admin-history', (_req: Request, res: Response) => {
  try {
    const history = getAdminPaymentHistory();
    return res.json({
      success: true,
      ...history,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch admin payment history' });
  }
});

// API: Health / System Diagnostic
app.get('/api/jarvis/status', (_req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    version: 'JARVIS-OS v4.2-Android',
    aiModel: 'gemini-3.8-flash',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// In production, serve the built frontend
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`JARVIS Server running on port ${PORT}`);
});
