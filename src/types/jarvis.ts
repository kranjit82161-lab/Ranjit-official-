export type JarvisStatus =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'executing'
  | 'alarm';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  avatarColor?: string;
  starred?: boolean;
}

export interface Reminder {
  id: string;
  title: string;
  time: string; // HH:MM (24-hour)
  date: string; // YYYY-MM-DD
  completed: boolean;
  priority?: 'high' | 'medium' | 'low';
  createdAt: number;
}

export interface ScheduleItem {
  id: string;
  time: string; // e.g. "09:00 AM"
  title: string;
  duration?: string;
  category: 'work' | 'personal' | 'health' | 'security' | 'stark';
  completed: boolean;
}

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

export type SubscriptionPlanId = 'free' | 'pro' | 'creator';

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  badge?: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  highlightColor: string;
  glowClass: string;
  buttonText: string;
}

export interface YouTubeUploadState {
  file: File | null;
  previewUrl: string | null;
  title: string;
  description: string;
  tags: string[];
  privacy: 'public' | 'unlisted' | 'private';
  isGeneratingMetadata: boolean;
  isUploading: boolean;
  progress: number; // 0 to 100
  uploadedVideoId: string | null;
  error: string | null;
}

export interface JarvisMessage {
  id: string;
  sender: 'user' | 'jarvis' | 'system';
  text: string;
  timestamp: string;
  actions?: JarvisAction[];
  status?: 'pending' | 'executed' | 'cancelled';
}

export interface DeviceState {
  flashlightOn: boolean;
  batteryLevel: number | null; // 0 to 100
  isCharging: boolean | null;
  wakeLockActive: boolean;
  isOnline: boolean;
  soundEffects: boolean;
  speechVoiceLanguage: 'hi-IN' | 'en-IN' | 'en-US';
  continuousListening: boolean;
}

export interface PaymentOrder {
  orderId: string;
  planId: SubscriptionPlanId;
  planName: string;
  amount: number; // in INR
  currency: 'INR';
  userEmail?: string;
  userName?: string;
  phone?: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  createdAt: number;
  completedAt?: number;
  transactionId?: string;
  phonePeTransactionId?: string;
  upiPaymentLink?: string;
  paymentMode?: string;
  checksum?: string;
}

export interface UserSubscription {
  planId: SubscriptionPlanId;
  planName: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  activatedAt: number;
  expiresAt: number;
  daysRemaining: number;
  orderId: string;
  transactionId: string;
  amountPaid: number;
  autoRenew: boolean;
}

export interface AppShortcut {
  id: string;
  name: string;
  category: 'social' | 'tools' | 'media' | 'system';
  icon: string;
  webUrl: string;
  intentUrl: string;
  description: string;
}
