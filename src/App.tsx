/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Calendar,
  Bell,
  Phone,
  Smartphone,
  MessageSquare,
  History,
  CheckCircle,
  HelpCircle,
  Film,
  Video,
  Scissors,
  Instagram,
  Crown,
  Globe,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { initAuthListener } from './utils/firebaseAuth.ts';

import {
  JarvisStatus,
  JarvisMessage,
  JarvisAction,
  ScheduleItem,
  Reminder,
  Contact,
  DeviceState,
  SubscriptionPlanId,
} from './types/jarvis.ts';

import { soundEffects } from './utils/audioEffects.ts';
import { speakJarvis, stopSpeaking, speechRecognizer } from './utils/speech.ts';
import {
  executePhoneCall,
  executeWhatsAppMessage,
  executeSms,
  executeOpenApp,
  toggleTorch,
  triggerHaptic,
  setScreenWakeLock,
  getBatteryStatus,
} from './utils/deviceControls.ts';

import { ArcReactor } from './components/ArcReactor.tsx';
import { VoiceHUD } from './components/VoiceHUD.tsx';
import { ActionCard } from './components/ActionCard.tsx';
import { SchedulePanel } from './components/SchedulePanel.tsx';
import { RemindersPanel } from './components/RemindersPanel.tsx';
import { ContactsPanel } from './components/ContactsPanel.tsx';
import { DevicePanel } from './components/DevicePanel.tsx';
import { AndroidBridgeModal } from './components/AndroidBridgeModal.tsx';
import { HeaderHUD } from './components/HeaderHUD.tsx';
import { YouTubeUploadPanel } from './components/YouTubeUploadPanel.tsx';
import { DailyAutomationPanel } from './components/DailyAutomationPanel.tsx';
import { VideoEditingPanel } from './components/VideoEditingPanel.tsx';
import { InstagramSetupPanel } from './components/InstagramSetupPanel.tsx';
import { PlansPricingPanel } from './components/PlansPricingPanel.tsx';
import { AdminSubscriptionPanel } from './components/AdminSubscriptionPanel.tsx';
import { ActiveModeFloatingWidget } from './components/ActiveModeFloatingWidget.tsx';
import { GoogleGuidePanel } from './components/GoogleGuidePanel.tsx';
import { MessageSupportPanel } from './components/MessageSupportPanel.tsx';
import {
  loadAutomationConfig,
  saveAutomationConfig,
  runFullVideoAutomation,
  AutomationConfig,
} from './utils/dailyScheduler.ts';

export default function App() {
  // Navigation: Clean, modernized tabs
  const [activeTab, setActiveTab] = useState<'hud' | 'plans' | 'admin_subscriptions' | 'automation' | 'editor' | 'messages' | 'google_guide' | 'instagram' | 'youtube' | 'schedule' | 'reminders' | 'contacts' | 'device'>('hud');

  // Subscription Plan
  const [currentPlanId, setCurrentPlanId] = useState<SubscriptionPlanId>('creator');

  // Google Guide initial task
  const [googleGuideTask, setGoogleGuideTask] = useState<string>('create_account');

  // Active Mode (Persistent Background Listening & Status Indicator)
  const [isActiveMode, setIsActiveMode] = useState<boolean>(false);

  // Instagram Setup initial target name
  const [instagramTargetName, setInstagramTargetName] = useState('Khushi');

  // Automation Config state for background monitor
  const [automationConfig, setAutomationConfig] = useState<AutomationConfig>(loadAutomationConfig);

  // YouTube Account Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [autoOpenYouTubeFilePicker, setAutoOpenYouTubeFilePicker] = useState(false);
  const [autoOpenEditorFilePicker, setAutoOpenEditorFilePicker] = useState(false);
  const [editedVideoFileForUpload, setEditedVideoFileForUpload] = useState<File | null>(null);
  const [editorActionPayload, setEditorActionPayload] = useState<Record<string, any> | null>(null);

  // Jarvis Status & Voice
  const [status, setStatus] = useState<JarvisStatus>('idle');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [currentResponseText, setCurrentResponseText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [pendingAction, setPendingAction] = useState<JarvisAction | null>(null);

  // Modals & PWA
  const [showBridgeModal, setShowBridgeModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Device & Diagnostics State
  const [deviceState, setDeviceState] = useState<DeviceState>({
    flashlightOn: false,
    batteryLevel: null,
    isCharging: null,
    wakeLockActive: false,
    isOnline: true,
    soundEffects: true,
    speechVoiceLanguage: 'hi-IN',
    continuousListening: false,
  });

  // Contacts Directory
  const [contacts, setContacts] = useState<Contact[]>([
    { id: '1', name: 'Papa', phone: '+919876543210', relation: 'Family', starred: true, avatarColor: 'bg-blue-600' },
    { id: '2', name: 'Mummy', phone: '+919876543211', relation: 'Family', starred: true, avatarColor: 'bg-pink-600' },
    { id: '3', name: 'Rahul', phone: '+919876543212', relation: 'Friend', avatarColor: 'bg-emerald-600' },
    { id: '4', name: 'Boss', phone: '+919876543213', relation: 'Work', avatarColor: 'bg-purple-600' },
    { id: '5', name: 'Doctor', phone: '+919876543214', relation: 'Emergency', avatarColor: 'bg-red-600' },
  ]);

  // Daily Schedule
  const [schedule, setSchedule] = useState<ScheduleItem[]>([
    { id: 's1', time: '08:30 AM', title: 'Morning Diagnostic & Health Scan', duration: '30m', category: 'health', completed: true },
    { id: 's2', time: '11:00 AM', title: 'Android App Code Architecture Sync', duration: '1h', category: 'work', completed: false },
    { id: 's3', time: '01:30 PM', title: 'Lunch & Nutrition Protocol', duration: '45m', category: 'health', completed: false },
    { id: 's4', time: '04:00 PM', title: 'Tony Stark Lab Review & AI Training', duration: '1h 30m', category: 'stark', completed: false },
    { id: 's5', time: '07:30 PM', title: 'Evening Workout & Cardio', duration: '1h', category: 'personal', completed: false },
  ]);

  // Reminders & Alarms
  const [reminders, setReminders] = useState<Reminder[]>([
    { id: 'r1', title: 'Papa ko medicine lena yaad dilana', time: '14:00', date: new Date().toISOString().split('T')[0], completed: false, priority: 'high', createdAt: Date.now() },
    { id: 'r2', title: 'Evening Team Sync & Project Demo', time: '17:30', date: new Date().toISOString().split('T')[0], completed: false, priority: 'medium', createdAt: Date.now() },
  ]);

  const [activeAlarmReminder, setActiveAlarmReminder] = useState<Reminder | null>(null);

  // Command History
  const [messages, setMessages] = useState<JarvisMessage[]>([
    {
      id: 'm1',
      sender: 'jarvis',
      text: 'Namaste Sir! Main aapka personal AI assistant J.A.R.V.I.S. hu. Main aapke phone ke calls, messages, apps, settings aur daily schedule ko control kar sakta hu. Aagya dijiye!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Setup Battery & PWA listeners
  useEffect(() => {
    // Auth state listener for YouTube Google account
    const unsubscribeAuth = initAuthListener(
      (user) => setCurrentUser(user),
      () => setCurrentUser(null)
    );

    // Battery check
    getBatteryStatus().then((bat) => {
      if (bat) {
        setDeviceState((prev) => ({
          ...prev,
          batteryLevel: bat.level,
          isCharging: bat.charging,
        }));
      }
    });

    // PWA Install prompt listener
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Online status
    const updateOnline = () => {
      setDeviceState((prev) => ({ ...prev, isOnline: navigator.onLine }));
    };
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);

    return () => {
      unsubscribeAuth();
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
    };
  }, []);

  // Background Reminder Alarm Monitor
  useEffect(() => {
    const alarmInterval = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const currentDateStr = now.toISOString().split('T')[0];

      reminders.forEach((r) => {
        if (!r.completed && r.time === currentTimeStr && r.date === currentDateStr) {
          if (!activeAlarmReminder || activeAlarmReminder.id !== r.id) {
            setActiveAlarmReminder(r);
            setStatus('alarm');
            soundEffects.playJarvisAlarm();
            speakJarvis(`Sir, alert! Reminder: ${r.title}`, {
              lang: deviceState.speechVoiceLanguage,
            });
            triggerHaptic([200, 100, 200, 100, 400]);
          }
        }
      });

      // Daily AI Video Automation Check (Default 18:00 / 6:00 PM)
      const freshConfig = loadAutomationConfig();
      if (
        freshConfig.enabled &&
        freshConfig.scheduledTime === currentTimeStr &&
        freshConfig.lastRunDate !== currentDateStr
      ) {
        freshConfig.lastRunDate = currentDateStr;
        saveAutomationConfig(freshConfig);
        setAutomationConfig(freshConfig);
        setActiveTab('automation');
        speakJarvis('Sir, shaam ke 6 baj gaye hain. Daily AI video automation sequence shuru ho raha hai.', {
          lang: deviceState.speechVoiceLanguage,
        });
        runFullVideoAutomation(freshConfig).catch((err) => {
          console.error('Scheduled video automation error:', err);
        });
      }
    }, 10000);

    return () => clearInterval(alarmInterval);
  }, [reminders, activeAlarmReminder, deviceState.speechVoiceLanguage]);

  // Execute Action on Phone
  const executeAction = useCallback(
    (action: JarvisAction) => {
      setStatus('executing');
      soundEffects.playAppLaunch();
      triggerHaptic(80);

      switch (action.type) {
        case 'CALL': {
          const number = action.payload?.phoneNumber || '+919876543210';
          executePhoneCall(number);
          break;
        }
        case 'WHATSAPP': {
          const number = action.payload?.phoneNumber || '';
          const msg = action.payload?.message || '';
          executeWhatsAppMessage(number, msg);
          break;
        }
        case 'SMS': {
          const number = action.payload?.phoneNumber || '';
          const msg = action.payload?.message || '';
          executeSms(number, msg);
          break;
        }
        case 'OPEN_APP': {
          const appKey = action.payload?.appKey || 'youtube';
          executeOpenApp(appKey);
          break;
        }
        case 'ADD_REMINDER': {
          if (action.payload?.title) {
            const newR: Reminder = {
              id: 'r_' + Date.now(),
              title: action.payload.title,
              time: action.payload.time || '18:00',
              date: action.payload.date || new Date().toISOString().split('T')[0],
              completed: false,
              priority: 'high',
              createdAt: Date.now(),
            };
            setReminders((prev) => [newR, ...prev]);
          }
          break;
        }
        case 'ADD_SCHEDULE_ITEM': {
          if (action.payload?.title) {
            const newS: ScheduleItem = {
              id: 's_' + Date.now(),
              title: action.payload.title,
              time: action.payload.time || '03:00 PM',
              category: action.payload.category || 'work',
              completed: false,
              duration: '30m',
            };
            setSchedule((prev) => [...prev, newS]);
          }
          break;
        }
        case 'YOUTUBE_UPLOAD': {
          setActiveTab('youtube');
          setAutoOpenYouTubeFilePicker(true);
          setTimeout(() => setAutoOpenYouTubeFilePicker(false), 500);
          break;
        }
        case 'DAILY_AUTOMATION': {
          setActiveTab('automation');
          break;
        }
        case 'VIDEO_EDIT': {
          setActiveTab('editor');
          setAutoOpenEditorFilePicker(true);
          setTimeout(() => setAutoOpenEditorFilePicker(false), 500);
          break;
        }
        case 'INSTAGRAM_SETUP': {
          if (action.payload?.targetName) {
            setInstagramTargetName(action.payload.targetName);
          }
          setActiveTab('instagram');
          break;
        }
        case 'VIEW_PLANS': {
          if (action.payload?.preferredPlan) {
            setCurrentPlanId(action.payload.preferredPlan);
          }
          setActiveTab('plans');
          break;
        }
        case 'DEVICE_CONTROL': {
          const cmd = action.payload?.command;
          if (cmd === 'flashlight_on') {
            toggleTorch(true).then((on) =>
              setDeviceState((prev) => ({ ...prev, flashlightOn: on }))
            );
          } else if (cmd === 'flashlight_off') {
            toggleTorch(false).then(() =>
              setDeviceState((prev) => ({ ...prev, flashlightOn: false }))
            );
          } else if (cmd === 'vibrate') {
            triggerHaptic([100, 50, 100]);
          }
          break;
        }
      }

      setPendingAction(null);
      setTimeout(() => setStatus('idle'), 1500);
    },
    []
  );

  // Submit Command to Jarvis Server API (Powered by Gemini)
  const handleCommand = useCallback(
    async (commandText: string) => {
      if (!commandText.trim()) return;

      const lower = commandText.toLowerCase().trim();

      // Check for Active Mode Start Commands
      if (
        lower === 'start' ||
        lower.includes('चालू करो') ||
        lower.includes('active mode') ||
        lower.includes('start jarvis') ||
        lower.includes('jarvis start')
      ) {
        setIsActiveMode(true);
        soundEffects.playJarvisWake();
        const activeMsg = 'Jarvis Active Mode चालू कर दिया गया है, Sir! मैं background में आपकी commands सुनने के लिए ready हूँ।';
        setCurrentResponseText(activeMsg);
        setStatus('speaking');
        setIsSpeaking(true);
        speakJarvis(activeMsg, {
          lang: deviceState.speechVoiceLanguage,
          onEnd: () => {
            setIsSpeaking(false);
            setStatus('listening');
            setIsListening(true);
            speechRecognizer.start({
              onResult: (text, isFinal) => {
                setTranscript(text);
                if (isFinal) {
                  speechRecognizer.stop();
                  setIsListening(false);
                  handleCommand(text);
                }
              },
            });
          },
        });
        return;
      }

      // Check for Active Mode Stop Commands
      if (
        lower === 'stop' ||
        lower.includes('बंद करो') ||
        lower.includes('stop jarvis') ||
        lower.includes('jarvis stop') ||
        lower.includes('deactivate')
      ) {
        setIsActiveMode(false);
        setIsListening(false);
        speechRecognizer.stop();
        soundEffects.playJarvisSleep();
        const stopMsg = 'Jarvis Active Mode बंद कर दिया गया है। जब भी जरूरत हो, "Start" कहें!';
        setCurrentResponseText(stopMsg);
        setStatus('speaking');
        setIsSpeaking(true);
        speakJarvis(stopMsg, {
          lang: deviceState.speechVoiceLanguage,
          onEnd: () => {
            setIsSpeaking(false);
            setStatus('idle');
          },
        });
        return;
      }

      stopSpeaking();
      setStatus('thinking');
      soundEffects.playJarvisConfirm();

      // Add user message
      const userMsg: JarvisMessage = {
        id: 'msg_' + Date.now(),
        sender: 'user',
        text: commandText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [userMsg, ...prev]);

      try {
        const response = await fetch('/api/jarvis/command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: commandText,
            context: {
              knownContacts: contacts.map((c) => ({ name: c.name, phone: c.phone })),
              currentReminders: reminders.map((r) => ({ id: r.id, title: r.title, time: r.time })),
              currentTime: new Date().toLocaleTimeString(),
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();
        const reply = data.replyText || 'Directive understood, Sir.';
        setCurrentResponseText(reply);

        // Add jarvis response message
        const jarvisMsg: JarvisMessage = {
          id: 'msg_jarvis_' + Date.now(),
          sender: 'jarvis',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: data.actions || [],
        };
        setMessages((prev) => [jarvisMsg, ...prev]);

        // Speak reply using Voice Synthesis
        setStatus('speaking');
        setIsSpeaking(true);
        speakJarvis(reply, {
          lang: deviceState.speechVoiceLanguage,
          onStart: () => setIsSpeaking(true),
          onEnd: () => {
            setIsSpeaking(false);
            if (isActiveMode) {
              // Automatically re-arm voice listening for continuous hands-free commands
              setStatus('listening');
              setIsListening(true);
              speechRecognizer.start({
                onResult: (nextText, isFinal) => {
                  setTranscript(nextText);
                  if (isFinal) {
                    speechRecognizer.stop();
                    setIsListening(false);
                    handleCommand(nextText);
                  }
                },
              });
            } else {
              setStatus('idle');
            }
          },
        });

        // If there is an actionable directive, show action card
        if (data.actions && data.actions.length > 0) {
          const firstAction = data.actions[0];
          if (firstAction.type === 'VIEW_PLANS') {
            if (firstAction.payload?.preferredPlan) {
              setCurrentPlanId(firstAction.payload.preferredPlan);
            }
            setActiveTab('plans');
            setPendingAction(firstAction);
          } else if (firstAction.type === 'GOOGLE_GUIDE') {
            if (firstAction.payload?.task) {
              setGoogleGuideTask(firstAction.payload.task);
            }
            setActiveTab('google_guide');
            setPendingAction(firstAction);
          } else if (firstAction.type === 'INSTAGRAM_SETUP') {
            if (firstAction.payload?.targetName) {
              setInstagramTargetName(firstAction.payload.targetName);
            }
            setActiveTab('instagram');
            setPendingAction(firstAction);
          } else if (firstAction.type === 'VIDEO_EDIT') {
            setEditorActionPayload(firstAction.payload || {});
            setActiveTab('editor');
            setAutoOpenEditorFilePicker(true);
            setTimeout(() => setAutoOpenEditorFilePicker(false), 500);
            setPendingAction(firstAction);
          } else if (firstAction.type === 'DAILY_AUTOMATION') {
            setActiveTab('automation');
            if (!currentUser) {
              const warningText = 'पहले अपना YouTube account connect करें, Sir.';
              setCurrentResponseText(warningText);
              speakJarvis(warningText, { lang: deviceState.speechVoiceLanguage });
            } else {
              setPendingAction(firstAction);
            }
          } else if (firstAction.type === 'YOUTUBE_UPLOAD') {
            setActiveTab('youtube');
            if (!currentUser) {
              const warningText = 'पहले अपना YouTube account connect करें';
              setCurrentResponseText(warningText);
              speakJarvis(warningText, { lang: deviceState.speechVoiceLanguage });
            } else {
              setAutoOpenYouTubeFilePicker(true);
              setTimeout(() => setAutoOpenYouTubeFilePicker(false), 500);
            }
          } else if (firstAction.type !== 'GENERAL_QUERY') {
            setPendingAction(firstAction);
          }
        }
      } catch (err) {
        console.error('Failed to query Jarvis API:', err);
        const fallbackText = 'Sir, network connection interrupted. Executing local diagnostic mode.';
        setCurrentResponseText(fallbackText);
        speakJarvis(fallbackText, { lang: deviceState.speechVoiceLanguage });
        setStatus('idle');
      }
    },
    [contacts, reminders, deviceState.speechVoiceLanguage, currentUser]
  );

  // Toggle Speech Recognition
  const toggleListening = useCallback(() => {
    if (isListening) {
      speechRecognizer.stop();
      setIsListening(false);
      setStatus('idle');
    } else {
      stopSpeaking();
      setIsSpeaking(false);
      setTranscript('');
      soundEffects.playJarvisWake();
      triggerHaptic(50);
      setStatus('listening');
      setIsListening(true);

      speechRecognizer.setLanguage(deviceState.speechVoiceLanguage);
      speechRecognizer.start({
        onStart: () => {
          setIsListening(true);
          setStatus('listening');
        },
        onResult: (text: string, isFinal: boolean) => {
          setTranscript(text);
          if (isFinal) {
            speechRecognizer.stop();
            setIsListening(false);
            handleCommand(text);
          }
        },
        onError: (err) => {
          console.warn('Speech recognizer error:', err);
          setIsListening(false);
          setStatus('idle');
        },
        onEnd: () => {
          setIsListening(false);
          if (status === 'listening') {
            setStatus('idle');
          }
        },
      });
    }
  }, [isListening, deviceState.speechVoiceLanguage, handleCommand, status]);

  // Stop speaking
  const handleStopSpeaking = () => {
    stopSpeaking();
    setIsSpeaking(false);
    setStatus('idle');
  };

  // Hardware Toggles
  const handleToggleTorch = async () => {
    const newState = !deviceState.flashlightOn;
    const res = await toggleTorch(newState);
    setDeviceState((prev) => ({ ...prev, flashlightOn: res }));
    soundEffects.playClick();
  };

  const handleTestVibration = () => {
    triggerHaptic([100, 50, 100]);
    soundEffects.playClick();
  };

  const handleToggleWakeLock = async () => {
    const newState = !deviceState.wakeLockActive;
    const res = await setScreenWakeLock(newState);
    setDeviceState((prev) => ({ ...prev, wakeLockActive: res }));
    soundEffects.playClick();
  };

  const handleToggleSoundEffects = () => {
    soundEffects.enabled = !deviceState.soundEffects;
    setDeviceState((prev) => ({ ...prev, soundEffects: !prev.soundEffects }));
  };

  const handleChangeLanguage = (lang: 'hi-IN' | 'en-IN' | 'en-US') => {
    setDeviceState((prev) => ({ ...prev, speechVoiceLanguage: lang }));
    speechRecognizer.setLanguage(lang);
  };

  // PWA Install prompt trigger
  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Direct Phone Call from Contact
  const handleDirectCall = (phone: string, name: string) => {
    setPendingAction({
      type: 'CALL',
      payload: { contactName: name, phoneNumber: phone },
    });
    handleCommand(`Call ${name}`);
  };

  const handleDirectWhatsApp = (phone: string, name: string) => {
    setPendingAction({
      type: 'WHATSAPP',
      payload: { contactName: name, phoneNumber: phone, message: 'Hello! Sent via JARVIS.' },
    });
    executeWhatsAppMessage(phone, 'Hello! Sent via JARVIS.');
  };

  const handleDirectSms = (phone: string, name: string) => {
    setPendingAction({
      type: 'SMS',
      payload: { contactName: name, phoneNumber: phone, message: 'Sent via JARVIS' },
    });
    executeSms(phone, 'Sent via JARVIS');
  };

  // Schedule Voice readout
  const handleReadSchedule = () => {
    const uncompleted = schedule.filter((s) => !s.completed);
    let speech = '';
    if (uncompleted.length === 0) {
      speech = 'Sir, aapka aaj ka saara schedule complete ho chuka hai. All tasks cleared!';
    } else {
      const itemsList = uncompleted.map((s) => `${s.time} par ${s.title}`).join(', ');
      speech = `Sir, aaj ke baaki events hain: ${itemsList}.`;
    }
    setCurrentResponseText(speech);
    speakJarvis(speech, { lang: deviceState.speechVoiceLanguage });
  };

  return (
    <div className="min-h-screen bg-[#030712] text-cyan-100 flex flex-col font-sans relative selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Cyber Grid & Vignette */}
      <div className="fixed inset-0 pointer-events-none bg-grid-cyber opacity-60 z-0" />
      <div className="fixed inset-0 pointer-events-none scanlines opacity-30 z-0" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/20 via-transparent to-transparent z-0" />

      {/* Header HUD */}
      <HeaderHUD
        deviceState={deviceState}
        onToggleSound={handleToggleSoundEffects}
        onOpenBridgeGuide={() => setShowBridgeModal(true)}
        onInstallPwa={handleInstallPwa}
        canInstallPwa={!!deferredPrompt}
        youtubeConnected={!!currentUser}
        onOpenYouTube={() => {
          setActiveTab('youtube');
          soundEffects.playClick();
        }}
        dailyActive={automationConfig.enabled}
        onOpenAutomation={() => {
          setActiveTab('automation');
          soundEffects.playClick();
        }}
        onOpenVideoEditor={() => {
          setActiveTab('editor');
          soundEffects.playClick();
        }}
        onOpenInstagram={() => {
          setActiveTab('instagram');
          soundEffects.playClick();
        }}
        onOpenPlans={() => {
          setActiveTab('plans');
          soundEffects.playClick();
        }}
        onOpenGoogleGuide={() => {
          setActiveTab('google_guide');
          soundEffects.playClick();
        }}
        onOpenMessages={() => {
          setActiveTab('messages');
          soundEffects.playClick();
        }}
      />

      {/* Top Floating Active Mode Status Widget (Android Recording Pill Style) */}
      <ActiveModeFloatingWidget
        isActiveMode={isActiveMode}
        status={status}
        isListening={isListening}
        isSpeaking={isSpeaking}
        transcript={transcript}
        onStopActiveMode={() => {
          setIsActiveMode(false);
          setIsListening(false);
          speechRecognizer.stop();
          soundEffects.playJarvisSleep();
          speakJarvis('Jarvis active mode band kar diya gaya hai, Sir.', {
            lang: deviceState.speechVoiceLanguage,
          });
        }}
        onToggleListening={toggleListening}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 flex flex-col gap-4 relative z-10 pb-24">
        {/* Pending Action Countdown Card (e.g. Calling Papa in 3s) */}
        {pendingAction && (
          <ActionCard
            action={pendingAction}
            onExecuteNow={executeAction}
            onCancel={() => setPendingAction(null)}
          />
        )}

        {/* Tab 1: Core Voice HUD & Arc Reactor */}
        {activeTab === 'hud' && (
          <div className="flex flex-col items-center gap-4">
            {/* Center Holographic Arc Reactor */}
            <ArcReactor
              status={status}
              onClick={toggleListening}
              isListening={isListening}
            />

            {/* Voice Input & Speech Box */}
            <VoiceHUD
              status={status}
              transcript={transcript}
              isListening={isListening}
              onToggleListening={toggleListening}
              onSubmitCommand={handleCommand}
              currentResponseText={currentResponseText}
              isSpeaking={isSpeaking}
              onStopSpeaking={handleStopSpeaking}
            />

            {/* Live Command Log */}
            <div className="w-full mt-2">
              <div className="flex items-center justify-between text-xs font-mono-tech text-cyan-400 mb-2">
                <span className="flex items-center gap-1.5 uppercase tracking-wider">
                  <History className="w-3.5 h-3.5" />
                  Directive History & Actions
                </span>
                <span className="text-[10px] text-slate-500">
                  {messages.length} log entries
                </span>
              </div>

              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3 rounded-xl border text-xs sm:text-sm flex flex-col gap-1 transition-all ${
                      m.sender === 'user'
                        ? 'bg-slate-900/90 border-cyan-500/40 self-end text-cyan-100 max-w-[90%]'
                        : 'bg-cyan-950/40 border-cyan-500/20 self-start text-white max-w-[95%]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-[10px] font-mono-tech text-cyan-400/80">
                      <span className="font-bold">
                        {m.sender === 'user' ? 'YOU (VOICE / TEXT)' : 'J.A.R.V.I.S.'}
                      </span>
                      <span>{m.timestamp}</span>
                    </div>
                    <p className="leading-relaxed">{m.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Plans & Pricing */}
        {activeTab === 'plans' && (
          <PlansPricingPanel
            currentPlanId={currentPlanId}
            onSelectPlan={(id) => setCurrentPlanId(id)}
            speechVoiceLanguage={deviceState.speechVoiceLanguage}
            onOpenAdminAudit={() => setActiveTab('admin_subscriptions')}
            userEmail={currentUser?.email || 'kranjit82161@gmail.com'}
            userName={currentUser?.displayName || 'Ranjit Kumar (Boss)'}
          />
        )}

        {/* Tab: Admin Payment History & Subscriptions */}
        {activeTab === 'admin_subscriptions' && (
          <AdminSubscriptionPanel />
        )}

        {/* Tab 3: Daily AI Video Automation */}
        {activeTab === 'automation' && (
          <DailyAutomationPanel
            currentUser={currentUser}
            onUserChange={(user) => setCurrentUser(user)}
            speechVoiceLanguage={deviceState.speechVoiceLanguage}
          />
        )}

        {/* Tab 3: CapCut & Video Editing Assistant */}
        {activeTab === 'editor' && (
          <VideoEditingPanel
            onSendToYouTubeUpload={(file) => {
              setEditedVideoFileForUpload(file);
              setActiveTab('youtube');
              soundEffects.playJarvisConfirm();
            }}
            speechVoiceLanguage={deviceState.speechVoiceLanguage}
            autoOpenFilePicker={autoOpenEditorFilePicker}
            initialActionPayload={editorActionPayload}
          />
        )}

        {/* Tab 4: Instagram Account Setup Assistant */}
        {activeTab === 'instagram' && (
          <InstagramSetupPanel
            initialDisplayName={instagramTargetName}
            speechVoiceLanguage={deviceState.speechVoiceLanguage}
          />
        )}

        {/* Tab: Google Assistant + Screen Guide */}
        {activeTab === 'google_guide' && (
          <GoogleGuidePanel
            speechVoiceLanguage={deviceState.speechVoiceLanguage}
            initialTask={googleGuideTask}
            onClose={() => setActiveTab('hud')}
          />
        )}

        {/* Tab: AI Message & Dispatch Support */}
        {activeTab === 'messages' && (
          <MessageSupportPanel
            speechVoiceLanguage={deviceState.speechVoiceLanguage}
            onTriggerVoiceQuery={(query) => handleCommand(query)}
          />
        )}

        {/* Tab 5: YouTube Manual Upload Assistant */}
        {activeTab === 'youtube' && (
          <YouTubeUploadPanel
            currentUser={currentUser}
            onUserChange={(user) => setCurrentUser(user)}
            speechVoiceLanguage={deviceState.speechVoiceLanguage}
            autoOpenFilePickerTrigger={autoOpenYouTubeFilePicker}
            initialVideoFile={editedVideoFileForUpload}
          />
        )}

        {/* Tab 2: Schedule Timeline */}
        {activeTab === 'schedule' && (
          <SchedulePanel
            schedule={schedule}
            onToggleComplete={(id) => {
              setSchedule((prev) =>
                prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
              );
              soundEffects.playClick();
            }}
            onAddItem={(item) => {
              const newItem: ScheduleItem = {
                ...item,
                id: 's_' + Date.now(),
                completed: false,
              };
              setSchedule((prev) => [...prev, newItem]);
              soundEffects.playJarvisConfirm();
            }}
            onDeleteItem={(id) => {
              setSchedule((prev) => prev.filter((s) => s.id !== id));
              soundEffects.playClick();
            }}
            onReadSchedule={handleReadSchedule}
          />
        )}

        {/* Tab 3: Reminders & Alarms */}
        {activeTab === 'reminders' && (
          <RemindersPanel
            reminders={reminders}
            onAddReminder={(rem) => {
              const newRem: Reminder = {
                ...rem,
                id: 'r_' + Date.now(),
                createdAt: Date.now(),
              };
              setReminders((prev) => [newRem, ...prev]);
              soundEffects.playJarvisConfirm();
            }}
            onToggleComplete={(id) => {
              setReminders((prev) =>
                prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
              );
              soundEffects.playClick();
            }}
            onDeleteReminder={(id) => {
              setReminders((prev) => prev.filter((r) => r.id !== id));
              soundEffects.playClick();
            }}
            activeAlarmReminder={activeAlarmReminder}
            onDismissAlarm={() => {
              setActiveAlarmReminder(null);
              setStatus('idle');
              soundEffects.playClick();
            }}
          />
        )}

        {/* Tab 4: Phone Contacts & Calling */}
        {activeTab === 'contacts' && (
          <ContactsPanel
            contacts={contacts}
            onCall={handleDirectCall}
            onWhatsApp={handleDirectWhatsApp}
            onSms={handleDirectSms}
            onAddContact={(c) => {
              const newC: Contact = { ...c, id: 'c_' + Date.now() };
              setContacts((prev) => [newC, ...prev]);
              soundEffects.playJarvisConfirm();
            }}
            onDeleteContact={(id) => {
              setContacts((prev) => prev.filter((c) => c.id !== id));
              soundEffects.playClick();
            }}
          />
        )}

        {/* Tab 5: Device Controls & App Launcher */}
        {activeTab === 'device' && (
          <DevicePanel
            deviceState={deviceState}
            onToggleTorch={handleToggleTorch}
            onTestVibration={handleTestVibration}
            onToggleWakeLock={handleToggleWakeLock}
            onToggleAudioEffects={handleToggleSoundEffects}
            onChangeLanguage={handleChangeLanguage}
            onOpenApp={(key) => {
              executeOpenApp(key);
              soundEffects.playAppLaunch();
            }}
            onOpenAndroidBridge={() => setShowBridgeModal(true)}
          />
        )}
      </main>

      {/* Bottom Sticky Mobile Navigation HUD (Streamlined for modern voice features) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-cyan-500/30 backdrop-blur-lg px-2 py-2">
        <div className="max-w-lg mx-auto grid grid-cols-6 gap-1 text-center font-mono-tech">
          {/* HUD / Voice */}
          <button
            onClick={() => {
              setActiveTab('hud');
              soundEffects.playClick();
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              activeTab === 'hud'
                ? 'bg-cyan-950 border border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 mb-0.5" />
            <span className="text-[9px] font-bold tracking-wider">JARVIS</span>
          </button>

          {/* Video Editor / AI Talking Video Editor */}
          <button
            onClick={() => {
              setActiveTab('editor');
              soundEffects.playClick();
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              activeTab === 'editor'
                ? 'bg-purple-950 border border-purple-400 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                : 'text-slate-400 hover:text-purple-300'
            }`}
          >
            <Scissors className="w-4 h-4 mb-0.5 text-purple-400" />
            <span className="text-[9px] font-bold">AI EDITOR</span>
          </button>

          {/* Messages & Dispatch Support */}
          <button
            onClick={() => {
              setActiveTab('messages');
              soundEffects.playClick();
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              activeTab === 'messages'
                ? 'bg-emerald-950 border border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                : 'text-slate-400 hover:text-emerald-300'
            }`}
          >
            <MessageSquare className="w-4 h-4 mb-0.5 text-emerald-400" />
            <span className="text-[9px] font-bold">MESSAGES</span>
          </button>

          {/* Google Guide - Cybersecurity / SEC-OPS */}
          <button
            onClick={() => {
              setActiveTab('google_guide');
              soundEffects.playClick();
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              activeTab === 'google_guide'
                ? 'bg-black border border-green-400 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.5)]'
                : 'text-slate-400 hover:text-green-300'
            }`}
          >
            <Globe className="w-4 h-4 mb-0.5 text-green-400" />
            <span className="text-[9px] font-bold">SEC-OPS</span>
          </button>

          {/* Daily AI Automation */}
          <button
            onClick={() => {
              setActiveTab('automation');
              soundEffects.playClick();
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all relative ${
              activeTab === 'automation'
                ? 'bg-amber-950 border border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            {automationConfig.enabled && (
              <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            )}
            <Film className="w-4 h-4 mb-0.5 text-amber-400" />
            <span className="text-[9px] font-bold">DAILY AI</span>
          </button>

          {/* Plans / Pricing / About */}
          <button
            onClick={() => {
              setActiveTab('plans');
              soundEffects.playClick();
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all relative ${
              activeTab === 'plans'
                ? 'bg-amber-950 border border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            <Crown className="w-4 h-4 mb-0.5 text-amber-400" />
            <span className="text-[9px] font-bold">PLANS</span>
          </button>
        </div>
      </nav>

      {/* Android Master Bridge Setup Guide Modal */}
      <AndroidBridgeModal
        isOpen={showBridgeModal}
        onClose={() => setShowBridgeModal(false)}
      />
    </div>
  );
}
