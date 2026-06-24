/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import Pusher from 'pusher-js';
import CryptoJS from 'crypto-js';
import { 
  Maximize2, Minimize2, Sun, Moon, Settings, 
  Play, Pause, SkipForward, SkipBack, Plus, 
  Trash2, Radio, Sliders, ExternalLink, MessageSquare, 
  Music, Tv, Volume2, Sparkles, AlertCircle, RefreshCw,
  Eye, EyeOff, LogIn, LogOut, Loader2, ShieldCheck
} from 'lucide-react';
import { BgmVideo, User } from './types';
// Removed Firebase imports

// Constants for Client-Side Pusher Sync
const BGM_PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY || '';
const BGM_PUSHER_SECRET = import.meta.env.VITE_PUSHER_SECRET || '';
const BGM_PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER || '';

export default function App() {
  // Skip Firebase Auth for now
  const [user, setUser] = useState<User | null>({
    uid: "demo-user",
    email: "demo@example.com",
    emailVerified: true,
    isAnonymous: false,
    displayName: "Demo User",
    providerData: [],
    tenantId: null,
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleLogin = async () => {
    // No-op for now, login is disabled
  };

  const handleLogout = async () => {
    // No-op for now, logout is disabled
  };

  // Master Credentials/Credentials Configuration States
  const [discordUserId, setDiscordUserId] = useState(() => {
    return localStorage.getItem('master_discord_user_id') || '606142918885113886';
  });
  const [deckId, setDeckId] = useState(() => {
    return localStorage.getItem('master_deck_id') || '68acaf5a-926f-41e8-83a5-521635081220';
  });
  const [tiptapPrivateKey, setTiptapPrivateKey] = useState(() => {
    return localStorage.getItem('master_tiptap_private_key') || '68fc12f1437daa65cd789bf7eab919cb3f34c9bed8a9359352f1ad5196306c3c';
  });
  const [tiptapAlertWidgetId, setTiptapAlertWidgetId] = useState(() => {
    return localStorage.getItem('master_tiptap_alert_widget_id') || 'MtjyPYCm4BiVcAlDrEizV';
  });

  const [showCredentialsModal, setShowCredentialsModal] = useState(false);

  // Buffer fields for holding changes before save in Config Modal
  const [tempDiscordUserId, setTempDiscordUserId] = useState(discordUserId);
  const [tempDeckId, setTempDeckId] = useState(deckId);
  const [tempTiptapPrivateKey, setTempTiptapPrivateKey] = useState(tiptapPrivateKey);
  const [tempTiptapAlertWidgetId, setTempTiptapAlertWidgetId] = useState(tiptapAlertWidgetId);

  // Firestore save/load status
  const [credentialsLoaded, setCredentialsLoaded] = useState(false);
  const [credentialsLoading, setCredentialsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    // Load credentials from localStorage only
    if (!user) {
      setCredentialsLoaded(false);
      return;
    }

    const loadUserCredentials = () => {
      setCredentialsLoading(true);
      try {
        const savedDiscordUserId = localStorage.getItem('master_discord_user_id');
        const savedDeckId = localStorage.getItem('master_deck_id');
        const savedTiptapPrivateKey = localStorage.getItem('master_tiptap_private_key');
        const savedTiptapAlertWidgetId = localStorage.getItem('master_tiptap_alert_widget_id');

        if (savedDiscordUserId) {
          setDiscordUserId(savedDiscordUserId);
          setTempDiscordUserId(savedDiscordUserId);
        }
        if (savedDeckId) {
          setDeckId(savedDeckId);
          setTempDeckId(savedDeckId);
        }
        if (savedTiptapPrivateKey) {
          setTiptapPrivateKey(savedTiptapPrivateKey);
          setTempTiptapPrivateKey(savedTiptapPrivateKey);
        }
        if (savedTiptapAlertWidgetId) {
          setTiptapAlertWidgetId(savedTiptapAlertWidgetId);
          setTempTiptapAlertWidgetId(savedTiptapAlertWidgetId);
        }
      } catch (err) {
        console.error("Gagal memuat kredensial dari localStorage:", err);
      } finally {
        setCredentialsLoading(false);
        setCredentialsLoaded(true);
      }
    };

    loadUserCredentials();
  }, [user]);

  // Visibility toggle states (true = hidden/masked, false = visible)
  const [maskDiscordUserId, setMaskDiscordUserId] = useState(true);
  const [maskDeckId, setMaskDeckId] = useState(true);
  const [maskTiptapPrivateKey, setMaskTiptapPrivateKey] = useState(true);
  const [maskTiptapAlertWidgetId, setMaskTiptapAlertWidgetId] = useState(true);

  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Split view percentages (desktop)
  const [leftWidth, setLeftWidth] = useState(25);
  const [midWidth, setMidWidth] = useState(45);
  const [midTopHeight, setMidTopHeight] = useState(55);
  const [isDragging, setIsDragging] = useState<'v1' | 'v2' | 'h1' | null>(null);

  // Tabs / Navigation
  const [activeMobileTab, setActiveMobileTab] = useState<'deck' | 'control' | 'chat'>('deck');
  const [deckPage, setDeckPage] = useState<'1' | '2' | '3'>('1');
  const [controlTab, setControlTab] = useState<'alert' | 'monitor'>('alert');
  const [chatTab, setChatTab] = useState<'chat' | 'bgm'>('chat');

  // Lanyard / Live YouTube Stream status
  const [streamInfo, setStreamInfo] = useState({
    url: '',
    videoId: 'jfKfPfyJRdk', // Default fallback
    title: 'Memuat status stream...',
    thumbnail: '',
    isLive: false,
  });

  // Manual YouTube override settings
  const [manualVideoId, setManualVideoId] = useState(() => {
    return localStorage.getItem('manual_video_id') || '';
  });
  const [showChatSettings, setShowChatSettings] = useState(false);
  const [manualInput, setManualInput] = useState('');

  // BGM Syncing state
  const [bgmRoomId, setBgmRoomId] = useState(() => {
    return localStorage.getItem('bgm_room_id') || 'streamobsadilonapsh123';
  });
  const [bgmIsConnected, setBgmIsConnected] = useState(false);
  const [bgmVideos, setBgmVideos] = useState<BgmVideo[]>(() => {
    const saved = localStorage.getItem('bgm_videos');
    return saved ? JSON.parse(saved) : [{ id: 'jfKfPfyJRdk', title: 'Lofi Chill' }];
  });
  const [bgmCurrentIdx, setBgmCurrentIdx] = useState(0);
  const [bgmIsPlaying, setBgmIsPlaying] = useState(false);
  const [bgmLocalCurrentTime, setBgmLocalCurrentTime] = useState(0);
  const [bgmLocalDuration, setBgmLocalDuration] = useState(1); // avoid division by 0
  const [showBgmSettings, setShowBgmSettings] = useState(false);
  const [newBgmId, setNewBgmId] = useState('');
  const [newBgmTitle, setNewBgmTitle] = useState('');

  // Mobile viewport checker
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Refs for tracking Pusher objects and coordinates
  const containerRef = useRef<HTMLDivElement>(null);
  const pusherRef = useRef<Pusher | null>(null);
  const channelRef = useRef<any | null>(null);

  // 1. Sync theme class on HTML/Body
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // 2. Fetch stream information via Lanyard (from Discord status)
  useEffect(() => {
    const fetchLanyardStatus = async () => {
      try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${discordUserId}`);
        const result = await response.json();

        let streamingActivity = null;
        if (result.success && result.data) {
          streamingActivity = result.data.activities.find((act: any) => act.type === 1);
        }

        if (streamingActivity && streamingActivity.url) {
          const urlStr = streamingActivity.url;
          const videoId = urlStr.split('v=')[1]?.split('&')[0] || '';
          const title = streamingActivity.details || 'Live Broadcasting';

          let thumb = `https://i3.ytimg.com/vi/${videoId}/mqdefault.jpg`;
          const assetId = streamingActivity.assets?.large_image?.split(":")[1];
          if (assetId) {
            thumb = `https://i3.ytimg.com/vi/${assetId}/mqdefault.jpg`;
          }

          setStreamInfo({
            url: urlStr,
            videoId,
            title,
            thumbnail: thumb,
            isLive: true,
          });
        } else {
          // Stream is offline, fallback to manual video ID or default fallback
          const targetId = manualVideoId || 'jfKfPfyJRdk';
          setStreamInfo({
            url: `https://www.youtube.com/watch?v=${targetId}`,
            videoId: targetId,
            title: 'Stream Offline (Manual Mode)',
            thumbnail: `https://i3.ytimg.com/vi/${targetId}/mqdefault.jpg`,
            isLive: false,
          });
        }
      } catch (err) {
        console.error('Lanyard API error:', err);
        const targetId = manualVideoId || 'jfKfPfyJRdk';
        setStreamInfo({
          url: `https://www.youtube.com/watch?v=${targetId}`,
          videoId: targetId,
          title: 'Offline / Gagal Hubungi API Lanyard',
          thumbnail: `https://i3.ytimg.com/vi/${targetId}/mqdefault.jpg`,
          isLive: false,
        });
      }
    };

    fetchLanyardStatus();
    const interval = setInterval(fetchLanyardStatus, 30000);
    return () => clearInterval(interval);
  }, [manualVideoId, discordUserId]);

  // Initial manual input update
  useEffect(() => {
    setManualInput(manualVideoId);
  }, [manualVideoId]);

  // 3. Pusher Connection Management
  useEffect(() => {
    if (!bgmIsConnected) return;

    const currentActiveRoom = bgmRoomId.trim().toLowerCase();
    if (!currentActiveRoom) return;

    // Establish Pusher connection using developer-signed private channel
    const pusher = new Pusher(BGM_PUSHER_KEY, {
      cluster: BGM_PUSHER_CLUSTER,
      forceTLS: true,
      channelAuthorization: {
        endpoint: '/unused',
        customHandler: ({ socketId, channelName }, callback) => {
          const stringToSign = `${socketId}:${channelName}`;
          const hash = CryptoJS.HmacSHA256(stringToSign, BGM_PUSHER_SECRET);
          const signature = CryptoJS.enc.Hex.stringify(hash);
          callback(null, { auth: `${BGM_PUSHER_KEY}:${signature}` });
        },
      },
    });

    pusherRef.current = pusher;

    const channel = pusher.subscribe(`private-room-${currentActiveRoom}`);
    channelRef.current = channel;

    channel.bind('pusher:subscription_succeeded', () => {
      // Sync on connect
      try {
        channel.trigger('client-sync-event', {
          action: 'REQUEST_SYNC',
          sender: pusher.connection.socket_id,
          videos: bgmVideos,
          idx: bgmCurrentIdx,
        });
      } catch (e) {
        console.error('Initial pusher sync err:', e);
      }
    });

    channel.bind('client-sync-event', (data: any) => {
      if (data.sender === pusher.connection.socket_id) return;

      if (data.videos) {
        setBgmVideos(data.videos);
        localStorage.setItem('bgm_videos', JSON.stringify(data.videos));
      }
      if (data.idx !== undefined) {
        setBgmCurrentIdx(data.idx);
      }
      if (data.isPlaying !== undefined) {
        setBgmIsPlaying(data.isPlaying);
      }
      if (data.currentTime !== undefined) {
        setBgmLocalCurrentTime(data.currentTime);
      }
      if (data.duration !== undefined) {
        setBgmLocalDuration(data.duration);
      }
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`private-room-${currentActiveRoom}`);
      pusher.disconnect();
    };
  }, [bgmIsConnected, bgmRoomId]);

  // Keep tracks stored
  useEffect(() => {
    localStorage.setItem('bgm_videos', JSON.stringify(bgmVideos));
  }, [bgmVideos]);

  // Local clock emulator for play timeline status
  useEffect(() => {
    let clock: any = null;
    if (bgmIsPlaying && bgmLocalDuration > 0) {
      clock = setInterval(() => {
        setBgmLocalCurrentTime((prev) => {
          if (prev >= bgmLocalDuration) return bgmLocalDuration;
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(clock);
  }, [bgmIsPlaying, bgmLocalDuration]);

  // 4. Handle State Broadcast helper
  const broadcastBgmState = (action: string, extra = {}) => {
    if (!channelRef.current || !pusherRef.current) return;
    try {
      channelRef.current.trigger('client-sync-event', {
        idx: bgmCurrentIdx,
        isPlaying: bgmIsPlaying,
        videos: bgmVideos,
        action: action,
        sender: pusherRef.current.connection.socket_id,
        ...extra,
      });
    } catch (e) {
      console.error('Broadcasting failed:', e);
    }
  };

  // Music controllers
  const togglePlayBgm = () => {
    const nextPlay = !bgmIsPlaying;
    setBgmIsPlaying(nextPlay);
    broadcastBgmState('TOGGLE_PLAY', { isPlaying: nextPlay });
  };

  const playNextBgm = () => {
    if (bgmVideos.length === 0) return;
    const nextIdx = (bgmCurrentIdx + 1) % bgmVideos.length;
    setBgmCurrentIdx(nextIdx);
    setBgmIsPlaying(true);
    setBgmLocalCurrentTime(0);
    broadcastBgmState('CHANGE_VIDEO', { idx: nextIdx, isPlaying: true });
  };

  const playPrevBgm = () => {
    if (bgmVideos.length === 0) return;
    const prevIdx = (bgmCurrentIdx - 1 + bgmVideos.length) % bgmVideos.length;
    setBgmCurrentIdx(prevIdx);
    setBgmIsPlaying(true);
    setBgmLocalCurrentTime(0);
    broadcastBgmState('CHANGE_VIDEO', { idx: prevIdx, isPlaying: true });
  };

  const seekBgm = (val: number) => {
    setBgmLocalCurrentTime(val);
    broadcastBgmState('SEEK_VIDEO', { seekTo: val });
  };

  const addNewBgmTrack = () => {
    if (!newBgmId || !newBgmTitle) return;
    let computedId = newBgmId.trim();
    if (computedId.includes('v=')) {
      computedId = computedId.split('v=')[1]?.split('&')[0] || computedId;
    }
    if (computedId.length > 11) {
      computedId = computedId.substring(0, 11);
    }
    const updated = [...bgmVideos, { id: computedId, title: newBgmTitle.trim() }];
    setBgmVideos(updated);
    setNewBgmId('');
    setNewBgmTitle('');
    broadcastBgmState('PLAYLIST_UPDATE', { videos: updated });
  };

  const removeBgmTrack = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = bgmVideos.filter((_, i) => i !== idx);
    setBgmVideos(updated);
    if (bgmCurrentIdx >= updated.length) {
      setBgmCurrentIdx(Math.max(0, updated.length - 1));
    }
    broadcastBgmState('PLAYLIST_UPDATE', { videos: updated });
  };

  const saveManualVideoId = () => {
    const normalized = manualInput.trim();
    localStorage.setItem('manual_video_id', normalized);
    setManualVideoId(normalized);
    setShowChatSettings(false);
  };

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
          .then(() => setIsFullscreen(true))
          .catch(() => alert('Fullscreen is blockaged or not allowed.'));
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Monitor fullscreen listener for escape keys
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Format second timer
  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Drag and Resize Handlers using modern Pointer capture APIs
  useEffect(() => {
    const handleWindowPointerMove = (e: PointerEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();

      if (isDragging === 'v1') {
        const x = e.clientX - containerRect.left;
        const percentage = (x / containerRect.width) * 100;
        if (percentage > 10 && percentage < 80) {
          setLeftWidth(percentage);
        }
      } else if (isDragging === 'v2') {
        const x = e.clientX - containerRect.left;
        const relativeX = x - (containerRect.width * leftWidth / 100);
        const percentage = (relativeX / containerRect.width) * 100;
        if (percentage > 10 && (leftWidth + percentage) < 90) {
          setMidWidth(percentage);
        }
      } else if (isDragging === 'h1') {
        const midControl = document.getElementById('panel-control');
        if (midControl) {
          const midRect = midControl.getBoundingClientRect();
          const relativeY = e.clientY - midRect.top;
          const percentage = (relativeY / midRect.height) * 100;
          if (percentage > 10 && percentage < 90) {
            setMidTopHeight(percentage);
          }
        }
      }
    };

    const handleWindowPointerUp = () => {
      if (isDragging) {
        setIsDragging(null);
      }
    };

    if (isDragging) {
      window.addEventListener('pointermove', handleWindowPointerMove);
      window.addEventListener('pointerup', handleWindowPointerUp);
      window.addEventListener('pointercancel', handleWindowPointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
      window.removeEventListener('pointercancel', handleWindowPointerUp);
    };
  }, [isDragging, leftWidth, containerRef]);

  const handlePointerDown = (e: React.PointerEvent, type: 'v1' | 'v2' | 'h1') => {
    e.preventDefault();
    setIsDragging(type);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      setIsDragging(null);
    }
  };

  // Auth Guards for Admin/Streamer access
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-color)] text-[var(--bg-color)] font-sans">
        <Loader2 className="w-8 h-8 text-[var(--text-main)] animate-spin" />
        <p className="mt-4 text-[10px] font-bold tracking-widest uppercase text-[var(--text-main)]">Memuat Sistem...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4 font-sans text-black relative select-none">
        <div className="max-w-md w-full max-w-[400px] border border-gray-100 p-10 flex flex-col items-center animate-fade-in rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex flex-col items-center text-center space-y-2 w-full mb-8">
            <div className="w-[60px] h-[60px] bg-white rounded-full mb-6 flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.08)] border border-gray-100">
              <ShieldCheck className="w-7 h-7 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
              Yooo, welcome back!
            </h2>
            <p className="text-[14px] text-gray-500 font-medium">
              First time here? <span className="text-black font-bold">Sign up for free</span>
            </p>
          </div>

          {authError && (
            <div className="w-full p-3 mb-6 bg-red-50 border border-red-100 text-red-500 text-[13px] font-medium text-center flex gap-2 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="text-left leading-relaxed">{authError}</span>
            </div>
          )}

          <div className="w-full space-y-4">
            <input 
              type="email"
              placeholder="Your email"
              className="w-full py-3.5 px-4 bg-white border border-gray-200 rounded-xl text-[15px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder:text-gray-400"
            />

            <button
              onClick={handleLogin}
              className="w-full py-3.5 px-4 bg-black hover:bg-gray-900 text-white font-medium text-[15px] transition-all flex items-center justify-center gap-2 cursor-pointer rounded-xl"
            >
              <LogIn className="w-[18px] h-[18px]" />
              Sign in with Google
            </button>

            <button
              className="w-full py-2 hover:opacity-80 text-gray-900 font-semibold text-[14px] transition-opacity flex items-center justify-center cursor-pointer"
            >
              Sign in using password
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">or</span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>

            <button
              onClick={handleLogin}
              className="w-full py-3.5 px-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold text-[15px] transition-all flex items-center justify-center gap-2 cursor-pointer rounded-xl border border-gray-200 shadow-sm"
            >
              Single sign-on (SSO)
            </button>
          </div>

          <div className="w-full text-center mt-10">
            <p className="text-[11px] text-gray-400 font-medium leading-relaxed max-w-[280px] mx-auto">
              You acknowledge that you read, and agree, to our <br/>
              <span className="underline cursor-pointer hover:text-gray-600">Terms of Service</span> and our <span className="underline cursor-pointer hover:text-gray-600">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Compute host domain securely for YouTube Chat embedding
  const embedDomain = window.location.hostname || 'localhost';

  return (
    <div id="body" className="min-h-screen text-[var(--text-main)] overflow-hidden flex flex-col bg-[var(--bg-color)]">
      
      {/* SIMPLIFIED HEADER */}
      <header className="fixed top-0 left-0 right-0 h-12 border-b border-[var(--border-color)] bg-[var(--panel-bg)] flex justify-between items-center px-4 z-50">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-[var(--accent)] text-white rounded-md">
            <Radio className="w-3 h-3 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-1">
              Streamer Dashboard
              <span className={`text-[8px] px-1 py-0.5 rounded ${streamInfo.isLive ? 'bg-red-500 text-white animate-pulse' : 'bg-[var(--bg-color)] text-[var(--text-main)]'}`}>
                {streamInfo.isLive ? 'LIVE' : 'OFFLINE'}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => {
              setTempDiscordUserId(discordUserId);
              setTempDeckId(deckId);
              setTempTiptapPrivateKey(tiptapPrivateKey);
              setTempTiptapAlertWidgetId(tiptapAlertWidgetId);
              setShowCredentialsModal(true);
            }} 
            className="p-1.5 text-[var(--text-main)] hover:bg-[var(--bg-color)] transition-colors cursor-pointer"
            title="Set Credentials"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button 
            id="fullscreen-toggle"
            onClick={toggleFullscreen} 
            className="p-1.5 text-[var(--text-main)] hover:bg-[var(--bg-color)] transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button 
            id="theme-toggle"
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')} 
            className="p-1.5 text-[var(--text-main)] hover:bg-[var(--bg-color)] transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user?.photoURL && (
            <img 
              src={user.photoURL} 
              alt={user.displayName || 'User'} 
              className="w-6 h-6 rounded-md select-none ml-1"
              referrerPolicy="no-referrer"
            />
          )}

          <button
            onClick={handleLogout}
            className="p-1.5 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* CORE SPLIT-PANE CONTAINER */}
      <div 
        ref={containerRef}
        className="panel-container flex-grow pt-12 pb-16 md:pb-0 flex h-screen select-none relative gap-0.5"
      >
        
        {/* PANEL LEFT: STREAM BOT DECKS */}
        <div 
          id="panel-deck" 
          style={{ width: isMobile ? '100%' : `${leftWidth}%` }}
          className={`${activeMobileTab === 'deck' ? 'flex' : 'hidden'} md:flex flex-col flex-shrink-0 bg-[var(--panel-bg)] border border-[var(--border-color)] relative overflow-hidden`}
        >
          {/* Deck iframe content */}
          <div className="flex-grow bg-[var(--bg-color)] relative">
            <iframe
              id="deck-frame"
              src={deckId.startsWith('http') ? deckId : `https://streamer.bot/decks/${deckId}`}
              className={`w-full h-full border-none pointer-events-auto transition-all ${isDragging ? 'pointer-events-none' : ''}`}
              style={{ filter: theme === 'light' ? 'invert(1) hue-rotate(180deg)' : 'none' }}
              title="Streamer Bot Deck"
            />
          </div>
        </div>

        {/* RESIZER 1 (Vertical) */}
        <div 
          onPointerDown={(e) => handlePointerDown(e, 'v1')}
          className={`hidden md:flex w-3 hover:w-3 cursor-col-resize self-stretch items-center justify-center group shrink-0 transition-colors duration-150 ${isDragging === 'v1' ? 'bg-[var(--panel-bg)] text-[var(--accent)]' : 'hover:bg-[var(--panel-bg)] text-[var(--accent)]'}`}
          style={{ touchAction: 'none' }}
        >
          <div className={`w-[2px] h-8 transition-colors duration-150 ${isDragging === 'v1' ? 'bg-[var(--accent)]' : 'bg-[var(--handle-color)] group-hover:bg-[var(--accent)]'}`} />
        </div>

        {/* PANEL MIDDLE: GRAPH CONTROL SPLIT */}
        <div 
          id="panel-control" 
          style={{ width: isMobile ? '100%' : `${midWidth}%` }}
          className={`${activeMobileTab === 'control' ? 'flex' : 'hidden'} md:flex flex-col flex-shrink-0 self-stretch`}
        >
          {/* Split Top: Alert Control Module */}
          <div 
            id="wrapper-mid-top"
            style={{ height: `${midTopHeight}%` }}
            className="bg-[var(--panel-bg)] border border-[var(--border-color)] overflow-hidden flex flex-col relative shrink-0"
          >
            <div className="p-2 border-b border-[var(--border-color)] bg-[var(--bg-color)] flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-[var(--text-label)]" />
              <span className="text-xs font-medium text-[var(--text-label)] select-none">
                Controls
              </span>
            </div>
            <div className="flex-grow bg-[var(--panel-bg)]">
              <iframe
                id="control-frame"
                src={`https://tiptap.gg/control?privateKey=${tiptapPrivateKey}&type=alert%2Cleaderboard`}
                className={`w-full h-full border-none ${isDragging ? 'pointer-events-none' : ''}`}
                title="TipTap Control Console"
              />
            </div>
          </div>

          {/* RESIZER H (Horizontal Splitter) */}
          <div 
            onPointerDown={(e) => handlePointerDown(e, 'h1')}
            className={`hidden md:flex h-3 hover:h-3 cursor-row-resize items-center justify-center shrink-0 group transition-colors duration-150 ${isDragging === 'h1' ? 'bg-[var(--panel-bg)] text-[var(--accent)]' : 'hover:bg-[var(--panel-bg)] text-[var(--accent)]'}`}
            style={{ touchAction: 'none' }}
          >
            <div className={`h-[2px] w-10 transition-colors duration-150 ${isDragging === 'h1' ? 'bg-[var(--accent)]' : 'bg-[var(--handle-color)] group-hover:bg-[var(--accent)]'}`} />
          </div>

          {/* Split Bottom: Widgets (Alert vs YouTube Monitor Video) */}
          <div 
            id="wrapper-mid-bottom"
            className="flex-grow bg-[var(--panel-bg)] border border-[var(--border-color)] overflow-hidden flex flex-col relative"
          >
            {/* Widget Tabs */}
            <div className="flex gap-1 p-1.5 bg-[var(--bg-color)] border-b border-[var(--border-color)] select-none">
              <button
                onClick={() => setControlTab('alert')}
                className={`flex-1 py-1.5 px-3 text-xs font-medium transition-all cursor-pointer rounded-md ${controlTab === 'alert' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-label)] hover:text-[var(--text-main)]'}`}
              >
                Alert
              </button>
              <button
                onClick={() => setControlTab('monitor')}
                className={`flex-1 py-1.5 px-3 text-xs font-medium transition-all cursor-pointer rounded-md ${controlTab === 'monitor' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-label)] hover:text-[var(--text-main)]'}`}
              >
                Monitor
              </button>
            </div>

            {/* Widget content wrapper */}
            <div className="flex-grow bg-[var(--panel-bg)] relative">
              {controlTab === 'alert' ? (
                <iframe
                  id="frame-alert"
                  src={`https://tiptap.gg/widget/alert/${tiptapAlertWidgetId}?privateKey=${tiptapPrivateKey}&layer-width=800&layer-height=600&layer-name=TipTap%20Alert%20%7C%20Moon`}
                  className={`w-full h-full border-none ${isDragging ? 'pointer-events-none' : ''}`}
                  title="TipTap Alert Display"
                />
              ) : (
                !streamInfo.isLive ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4 text-center">
                    <div className="p-4 bg-[var(--bg-color)] rounded-full">
                      <Tv className="w-10 h-10 text-[var(--text-label)]" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-medium text-[var(--text-main)]">Stream Offline</h3>
                      <p className="text-xs text-[var(--text-label)]">{streamInfo.title}</p>
                    </div>
                  </div>
                ) : (
                  <iframe
                    id="frame-monitor"
                    src={`https://www.youtube.com/embed/${streamInfo.videoId}?autoplay=1&mute=1`}
                    className={`w-full h-full border-none ${isDragging ? 'pointer-events-none' : ''}`}
                    title="YouTube Stream Monitor Window"
                    allow="autoplay; encrypted-media"
                  />
                )
              )}
            </div>
          </div>
        </div>

        {/* RESIZER 2 (Vertical) */}
        <div 
          onPointerDown={(e) => handlePointerDown(e, 'v2')}
          className={`hidden md:flex w-3 hover:w-3 cursor-col-resize self-stretch items-center justify-center group shrink-0 transition-colors duration-150 ${isDragging === 'v2' ? 'bg-[var(--panel-bg)] text-[var(--accent)]' : 'hover:bg-[var(--panel-bg)] text-[var(--accent)]'}`}
          style={{ touchAction: 'none' }}
        >
          <div className={`w-[2px] h-8 transition-colors duration-150 ${isDragging === 'v2' ? 'bg-[var(--accent)]' : 'bg-[var(--handle-color)] group-hover:bg-[var(--accent)]'}`} />
        </div>

        {/* PANEL RIGHT: CHAT & BGM MEDIA PANELS */}
        <div 
          id="panel-chat" 
          className={`${activeMobileTab === 'chat' ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-[var(--panel-bg)] border border-[var(--border-color)] relative overflow-hidden`}
        >
          
          {/* Chat Tab buttons */}
          <div className="flex gap-1 p-1.5 bg-[var(--bg-color)] border-b border-[var(--border-color)] select-none">
            <button
              onClick={() => setChatTab('chat')}
              className={`flex-1 py-1.5 px-3 text-xs font-medium transition-all cursor-pointer rounded-md ${chatTab === 'chat' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-label)] hover:text-[var(--text-main)]'}`}
            >
              Chat
            </button>
            <button
              onClick={() => setChatTab('bgm')}
              className={`flex-1 py-1.5 px-3 text-xs font-medium transition-all cursor-pointer rounded-md ${chatTab === 'bgm' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-label)] hover:text-[var(--text-main)]'}`}
            >
              BGM
            </button>
          </div>

          {/* TAB CONTENT: ACTIVE LIVE CHAT */}
          {chatTab === 'chat' && (
            <div id="tab-content-chat" className="flex-grow flex flex-col overflow-hidden h-full">
              
              {/* YouTube Info Header with Thumbnail */}
              <div id="chat-header" className="p-3 bg-[var(--bg-color)] border-b border-[var(--border-color)] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden min-w-0">
                  <img 
                    id="yt-thumb" 
                    src={streamInfo.thumbnail || `https://i3.ytimg.com/vi/${streamInfo.videoId}/mqdefault.jpg`} 
                    alt="Preview Thumbnail" 
                    className="w-12 h-8 rounded object-cover bg-[var(--bg-color)] grow-0 shrink-0 select-none"
                  />
                  <div id="yt-info" className="flex flex-col overflow-hidden leading-tight">
                    <p id="yt-title" className="text-xs font-medium text-[var(--text-main)] truncate select-none">
                      {streamInfo.title}
                    </p>
                    <a 
                      href={streamInfo.url} 
                      id="yt-link" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1 select-text"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Watch
                    </a>
                  </div>
                </div>

                <button 
                  onClick={() => setShowChatSettings(p => !p)}
                  className={`p-2 text-[var(--text-label)] hover:text-[var(--text-main)] transition-colors cursor-pointer rounded-md ${showChatSettings ? 'bg-[var(--panel-bg)] text-[var(--accent)]' : ''}`}
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>

              {/* Chat settings overlay panel */}
              {showChatSettings && (
                <div id="chat-settings" className="p-3 bg-[var(--bg-color)] border-b border-[var(--border-color)] flex flex-col gap-2">
                  <label className="text-xs font-medium text-[var(--text-label)]">
                    Default Video ID
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      placeholder="Video ID" 
                      className="flex-1 text-xs px-3 py-2 border border-[var(--border-color)] bg-[var(--panel-bg)] text-[var(--text-main)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                    />
                    <button 
                      onClick={saveManualVideoId}
                      className="px-4 py-2 text-xs font-medium text-white bg-[var(--accent)] rounded-md cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}

              {/* Embedded video Livechat */}
              <div className="flex-grow bg-[var(--bg-color)] border-none relative">
                <iframe
                  id="chat-frame"
                  src={`https://www.youtube.com/live_chat?v=${streamInfo.videoId}&embed_domain=${embedDomain}`}
                  className={`w-full h-full border-none ${isDragging ? 'pointer-events-none' : ''}`}
                  title="YouTube Stream Live Chat"
                />
              </div>

              <span className="absolute bottom-2 right-3 text-[8px] tracking-widest font-bold uppercase text-[var(--text-label)] opacity-40 select-none pointer-events-none z-10">
                LIVE CHAT
              </span>
            </div>
          )}

          {/* TAB CONTENT: BGM REMOTE */}
          {chatTab === 'bgm' && (
            <div id="tab-content-bgm" className="flex-grow flex flex-col overflow-y-auto p-3 select-none h-full gap-4">
              
              {/* Simplified Connection */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${bgmIsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  <span className="text-xs text-[var(--text-label)]">
                    {bgmIsConnected ? `Connected: ${bgmRoomId}` : 'Not Connected'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowBgmSettings(p => !p)}
                    className="p-1.5 text-[var(--text-label)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                    title="Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {showBgmSettings && (
                <div id="bgm-settings" className="p-3 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-md space-y-3">
                  <input 
                    type="text" 
                    value={bgmRoomId}
                    onChange={(e) => setBgmRoomId(e.target.value)}
                    placeholder="Room ID"
                    className="w-full text-xs px-3 py-2 border border-[var(--border-color)] bg-[var(--panel-bg)] text-[var(--text-main)] rounded-md"
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setBgmIsConnected(true);
                        setShowBgmSettings(false);
                      }}
                      className="flex-1 py-2 text-xs font-medium text-[var(--bg-color)] bg-[var(--accent)] rounded-md cursor-pointer"
                    >
                      Connect
                    </button>
                    {bgmIsConnected && (
                      <button 
                        onClick={() => {
                          setBgmIsConnected(false);
                          setShowBgmSettings(false);
                        }}
                        className="flex-1 py-2 text-xs font-medium text-red-500 bg-red-500/10 rounded-md cursor-pointer"
                      >
                        Disconnect
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Now Playing */}
              <div className="text-center">
                <p id="bgm-remote-current-title" className="font-medium text-sm truncate text-[var(--text-main)]">
                  {bgmVideos[bgmCurrentIdx]?.title || 'No Track'}
                </p>
              </div>

              {/* Controls */}
              <div className="flex justify-center items-center gap-4">
                <button 
                  onClick={playPrevBgm} 
                  className="p-2 text-[var(--text-label)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                >
                  <SkipBack className="w-6 h-6" />
                </button>
                <button 
                  onClick={togglePlayBgm} 
                  className="w-12 h-12 bg-[var(--accent)] text-white rounded-full flex items-center justify-center cursor-pointer"
                >
                  {bgmIsPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </button>
                <button 
                  onClick={playNextBgm} 
                  className="p-2 text-[var(--text-label)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                >
                  <SkipForward className="w-6 h-6" />
                </button>
              </div>

              {/* Progress */}
              <div className="space-y-1">
                <input 
                  type="range" 
                  value={bgmLocalCurrentTime}
                  min={0}
                  max={bgmLocalDuration}
                  onChange={(e) => seekBgm(parseFloat(e.target.value))}
                  className="w-full h-1 bg-[var(--border-color)] appearance-none cursor-pointer accent-[var(--accent)]"
                />
                <div className="flex justify-between text-[10px] text-[var(--text-label)]">
                  <span>{formatTime(bgmLocalCurrentTime)}</span>
                  <span>{formatTime(bgmLocalDuration)}</span>
                </div>
              </div>

              {/* Playlist */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[var(--text-label)]">Playlist ({bgmVideos.length})</span>
                </div>
                <div id="bgm-remote-list" className="flex-1 overflow-y-auto space-y-1">
                  {bgmVideos.map((v, i) => (
                    <div 
                      key={v.id + i}
                      onClick={() => {
                        setBgmCurrentIdx(i);
                        setBgmIsPlaying(true);
                        setBgmLocalCurrentTime(0);
                        broadcastBgmState('CHANGE_VIDEO', { idx: i, isPlaying: true });
                      }}
                      className={`p-2.5 cursor-pointer flex justify-between items-center rounded-md transition-colors ${i === bgmCurrentIdx ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'hover:bg-[var(--panel-bg)] text-[var(--text-main)]'}`}
                    >
                      <p className="text-xs truncate pr-2 flex-1">{v.title}</p>
                      <button 
                        onClick={(e) => removeBgmTrack(i, e)}
                        className="p-1 text-[var(--text-label)] hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {bgmVideos.length === 0 && (
                    <div className="p-4 text-center text-[var(--text-label)] text-xs">
                      <p>Playlist is empty</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Add Track */}
              <div className="space-y-2">
                <input 
                  type="text" 
                  value={newBgmId}
                  onChange={(e) => setNewBgmId(e.target.value)}
                  placeholder="YouTube Link/ID"
                  className="w-full text-xs px-3 py-2 border border-[var(--border-color)] bg-[var(--panel-bg)] text-[var(--text-main)] rounded-md"
                />
                <input 
                  type="text" 
                  value={newBgmTitle}
                  onChange={(e) => setNewBgmTitle(e.target.value)}
                  placeholder="Track Title"
                  className="w-full text-xs px-3 py-2 border border-[var(--border-color)] bg-[var(--panel-bg)] text-[var(--text-main)] rounded-md"
                />
                <button 
                  onClick={addNewBgmTrack}
                  className="w-full py-2 text-xs font-medium text-[var(--bg-color)] bg-[var(--accent)] rounded-md cursor-pointer"
                >
                  <div className="flex items-center justify-center gap-1">
                    <Plus className="w-4 h-4" /> Add Track
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* MOBILE APP DOCK PERSISTENT BOTTOM CONTROL */}
      <div className="mobile-dock md:hidden fixed bottom-0 left-0 right-0 h-16 border-t-2 border-[var(--border-color)] bg-[var(--dock-bg)] backdrop-blur-md flex items-center justify-around px-2 z-50">
        <button
          onClick={() => setActiveMobileTab('deck')}
          className={`flex flex-col items-center gap-1 select-none cursor-pointer transition-colors ${activeMobileTab === 'deck' ? 'text-[var(--text-main)]' : 'text-[var(--text-label)]'}`}
        >
          <Tv className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wide">Deck</span>
        </button>
        <button
          onClick={() => setActiveMobileTab('control')}
          className={`flex flex-col items-center gap-1 select-none cursor-pointer transition-colors ${activeMobileTab === 'control' ? 'text-[var(--text-main)]' : 'text-[var(--text-label)]'}`}
        >
          <Sliders className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wide">Control</span>
        </button>
        <button
          onClick={() => setActiveMobileTab('chat')}
          className={`flex flex-col items-center gap-1 select-none cursor-pointer transition-colors ${activeMobileTab === 'chat' ? 'text-[var(--text-main)]' : 'text-[var(--text-label)]'}`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wide">chat</span>
        </button>
      </div>

      {/* MASTER CREDENTIALS/SETTINGS CONFIGURATION MODAL */}
      {showCredentialsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-[var(--panel-bg)]  border-2 border-[var(--border-color)] max-w-md w-full  p-5 space-y-4 animate-fade-in text-[var(--text-main)]">
            <div className="flex justify-between items-center pb-2 border-b-2 border-[var(--border-color)]">
              <h3 className="text-sm font-bold tracking-wider uppercase text-[var(--text-main)] flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-[var(--text-main)]" />
                Streamer Credentials
              </h3>
              <button 
                onClick={() => setShowCredentialsModal(false)}
                className="text-[var(--text-label)] hover:text-[var(--text-main)] text-sm font-bold cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Discord User ID input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-label)] uppercase tracking-wider block">
                  Discord User ID (Lanyard API)
                </label>
                <div className="relative flex items-center">
                  <input 
                    type={maskDiscordUserId ? "password" : "text"} 
                    value={tempDiscordUserId}
                    onChange={(e) => setTempDiscordUserId(e.target.value)}
                    placeholder="Contoh: 606142918885113886"
                    className="w-full text-xs font-mono pl-3 pr-10 py-2  border-2 border-[var(--border-color)] bg-[var(--bg-color)] text-[var(--text-main)] focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <button 
                    type="button"
                    onClick={() => setMaskDiscordUserId(!maskDiscordUserId)}
                    className="absolute right-2.5 p-1 text-[var(--text-label)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                    title={maskDiscordUserId ? "Tunjukkan ID" : "Sembunyikan ID"}
                  >
                    {maskDiscordUserId ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[9px] text-[var(--text-label)] opacity-85 leading-normal">
                  Digunakan untuk mendeteksi status streaming YouTube lewat aktivitas Discord piringan.
                </p>
              </div>

              {/* Streamer.bot Deck ID input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-label)] uppercase tracking-wider block">
                  Streamer.bot Deck ID / Custom URL
                </label>
                <div className="relative flex items-center">
                  <input 
                    type={maskDeckId ? "password" : "text"} 
                    value={tempDeckId}
                    onChange={(e) => setTempDeckId(e.target.value)}
                    placeholder="Contoh: 68acaf5a-926f-41e8-83a5-521635081220"
                    className="w-full text-xs font-mono pl-3 pr-10 py-2  border-2 border-[var(--border-color)] bg-[var(--bg-color)] text-[var(--text-main)] focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <button 
                    type="button"
                    onClick={() => setMaskDeckId(!maskDeckId)}
                    className="absolute right-2.5 p-1 text-[var(--text-label)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                    title={maskDeckId ? "Tunjukkan ID" : "Sembunyikan ID"}
                  >
                    {maskDeckId ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[9px] text-[var(--text-label)] opacity-85 leading-normal">
                  ID Deck atau paste URL lengkap eksternal lain yang mau di-embed ke panel DECK.
                </p>
              </div>

              {/* TipTap Private Key input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-label)] uppercase tracking-wider block">
                  TipTap Private Key
                </label>
                <div className="relative flex items-center">
                  <input 
                    type={maskTiptapPrivateKey ? "password" : "text"} 
                    value={tempTiptapPrivateKey}
                    onChange={(e) => setTempTiptapPrivateKey(e.target.value)}
                    placeholder="Masukkan private token tiptap"
                    className="w-full text-xs font-mono pl-3 pr-10 py-2  border-2 border-[var(--border-color)] bg-[var(--bg-color)] text-[var(--text-main)] focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <button 
                    type="button"
                    onClick={() => setMaskTiptapPrivateKey(!maskTiptapPrivateKey)}
                    className="absolute right-2.5 p-1 text-[var(--text-label)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                    title={maskTiptapPrivateKey ? "Tunjukkan kunci rahasia" : "Sembunyikan kunci rahasia"}
                  >
                    {maskTiptapPrivateKey ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[9px] text-[var(--text-label)] opacity-85 leading-normal">
                  Kunci akses rahasia konsol tiptap Anda untuk memproses triggers/alerting.
                </p>
              </div>

              {/* TipTap Widget ID input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-label)] uppercase tracking-wider block">
                  TipTap Alert Widget ID
                </label>
                <div className="relative flex items-center">
                  <input 
                    type={maskTiptapAlertWidgetId ? "password" : "text"} 
                    value={tempTiptapAlertWidgetId}
                    onChange={(e) => setTempTiptapAlertWidgetId(e.target.value)}
                    placeholder="Contoh: MtjyPYCm4BiVcAlDrEizV"
                    className="w-full text-xs font-mono pl-3 pr-10 py-2  border-2 border-[var(--border-color)] bg-[var(--bg-color)] text-[var(--text-main)] focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <button 
                    type="button"
                    onClick={() => setMaskTiptapAlertWidgetId(!maskTiptapAlertWidgetId)}
                    className="absolute right-2.5 p-1 text-[var(--text-label)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                    title={maskTiptapAlertWidgetId ? "Tunjukkan ID Widget" : "Sembunyikan ID Widget"}
                  >
                    {maskTiptapAlertWidgetId ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[9px] text-[var(--text-label)] opacity-85 leading-normal">
                  ID layer widget peringatan (alert) milik akun TipTap Anda.
                </p>
              </div>
            </div>

            {saveError && (
              <div className="p-2.5 my-2.5  bg-red-500/10 border- border--red-500/20 text-red-500 text-[10px] font-semibold flex items-center gap-1.5 transition-all">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{saveError}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t-2 border-[var(--border-color)] justify-end">
              <button 
                onClick={() => setShowCredentialsModal(false)}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-label)]  hover:bg-[var(--bg-color)] dark:hover:bg-[var(--bg-color)] transition-colors cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button 
                disabled={isSaving}
                onClick={async () => {
                  if (!user) return;
                  setIsSaving(true);
                  setSaveError(null);
                  try {
                    // Save only to localStorage
                    setDiscordUserId(tempDiscordUserId);
                    localStorage.setItem('master_discord_user_id', tempDiscordUserId);

                    setDeckId(tempDeckId);
                    localStorage.setItem('master_deck_id', tempDeckId);

                    setTiptapPrivateKey(tempTiptapPrivateKey);
                    localStorage.setItem('master_tiptap_private_key', tempTiptapPrivateKey);

                    setTiptapAlertWidgetId(tempTiptapAlertWidgetId);
                    localStorage.setItem('master_tiptap_alert_widget_id', tempTiptapAlertWidgetId);

                    setShowCredentialsModal(false);
                  } catch (err: any) {
                    console.error("Gagal menyimpan kredensial:", err);
                    setSaveError(err?.message || "Gagal menyimpan kredensial.");
                  } finally {
                    setIsSaving(false);
                  }
                }}
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-[var(--bg-color)] bg-[var(--text-main)] hover:bg-[var(--bg-color)] text-[var(--bg-color)] hover:text-[var(--text-main)] border-2 border-[var(--border-color)]   transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isSaving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
