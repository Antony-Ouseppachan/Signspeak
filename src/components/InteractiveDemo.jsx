import { useState, useEffect, useRef, useCallback } from 'react';
import { gesturePresets } from '../data/content.js';
import { aslAlphabet } from '../data/aslDataset.js';
import HandStage from './HandStage.jsx';
import {
  SpeakerIcon,
  LatencyIcon,
  InfoIcon,
  CheckIcon,
  CopyIcon,
  TerminalIcon,
  AlertTriangleIcon,
  ExternalLinkIcon,
  CameraIcon,
  VideoIcon,
  SparklesIcon,
  TrashIcon,
  VolumeIcon,
  MessageSquareIcon,
  SendIcon,
  SpaceIcon,
  BackspaceIcon,
  ActivityIcon,
  ExtensionIcon,
  LandmarkIcon,
  ShieldIcon,
  RefreshIcon
} from './Icons.jsx';

export default function InteractiveDemo() {
  // Perspective Mode: 'sender' | 'recipient' | 'split'
  const [viewPerspective, setViewPerspective] = useState('split');
  const [selectedLetter, setSelectedLetter] = useState('H');
  const [confidence, setConfidence] = useState(98.4);
  const [filterGroup, setFilterGroup] = useState('ALL'); // 'ALL' | 'A-G' | 'H-N' | 'O-T' | 'U-Z'
  const [buffer, setBuffer] = useState('HELLO WORLD');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [spokenText, setSpokenText] = useState('HELLO WORLD');
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [signCount, setSignCount] = useState(14);
  const [sessionSeconds, setSessionSeconds] = useState(48);

  // Live Webcam States
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [liveDetectedLetter, setLiveDetectedLetter] = useState('—');
  const [liveConfidence, setLiveConfidence] = useState(0);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const mpHandsRef = useRef(null);
  const mpCameraRef = useRef(null);
  const animRef = useRef(null);

  // Detection & Hold Accumulator Refs (Matching popup.js)
  const predBufRef = useRef([]);
  const lastDetectedRef = useRef(null);
  const stableCountRef = useRef(0);
  const committedThisHoldRef = useRef(false);
  const bufferRef = useRef(buffer);

  useEffect(() => {
    bufferRef.current = buffer;
  }, [buffer]);

  // In-Call Google Meet Chat Stream
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'Antony Ouseppachan (Meeting Host)',
      avatarColor: '#1E88E5',
      time: '10:02 AM',
      text: 'Welcome team! Let’s begin today’s accessibility sync. Can everyone hear clearly?'
    },
    {
      id: 2,
      sender: 'Signa (SignSpeak)',
      avatarColor: '#7B1FA2',
      time: '10:03 AM',
      text: 'Good morning! My video & audio are ready. Excited to test the live SignSpeak ASL feed.'
    }
  ]);

  // Quick preset phrases
  const presetPhrases = [
    'HELLO WORLD',
    'THANK YOU',
    'SIGN SPEAK',
    'GOOD MORNING',
    'NICE TO MEET YOU',
    'EQUAL ACCESS'
  ];

  // Session timer increment
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentGesture = gesturePresets.find((g) => g.letter === selectedLetter) || gesturePresets[0];

  const filteredPresets = gesturePresets.filter((g) => {
    if (filterGroup === 'A-G') return g.letter >= 'A' && g.letter <= 'G';
    if (filterGroup === 'H-N') return g.letter >= 'H' && g.letter <= 'N';
    if (filterGroup === 'O-T') return g.letter >= 'O' && g.letter <= 'T';
    if (filterGroup === 'U-Z') return g.letter >= 'U' && g.letter <= 'Z';
    return true;
  });

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }

  // Pure geometric ASL classifier (Matching popup.js + p3.py algorithm)
  const classifyLandmarks = useCallback((rawLm) => {
    if (!rawLm || rawLm.length !== 21) return { letter: '—', confidence: 0 };

    // Flip X to match mirrored webcam
    const coords = rawLm.map((p) => ({ x: Number(1 - p.x), y: Number(p.y), z: Number(p.z || 0) }));
    const wrist = coords[0];
    const rel = coords.map((c) => ({ x: c.x - wrist.x, y: c.y - wrist.y, z: c.z - wrist.z }));
    const maxVal = Math.max(...rel.flatMap((c) => [Math.abs(c.x), Math.abs(c.y), Math.abs(c.z)])) || 1;
    const detectedNorm = rel.map((c) => ({ x: c.x / maxVal, y: c.y / maxVal, z: c.z / maxVal }));

    // Finger extensions
    const isThumbExtended = detectedNorm[4].y < detectedNorm[3].y && Math.abs(detectedNorm[4].x - detectedNorm[2].x) > 0.15;
    const isIndexExtended = detectedNorm[8].y < detectedNorm[6].y;
    const isMiddleExtended = detectedNorm[12].y < detectedNorm[10].y;
    const isRingExtended = detectedNorm[16].y < detectedNorm[14].y;
    const isPinkyExtended = detectedNorm[20].y < detectedNorm[18].y;

    // Direct Posture Rules
    let matchedLetter = null;
    let postureConf = 0.95;

    if (isIndexExtended && isThumbExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
      matchedLetter = 'L';
    } else if (isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended) {
      matchedLetter = 'V';
    } else if (isIndexExtended && isMiddleExtended && isRingExtended && !isPinkyExtended) {
      matchedLetter = 'W';
    } else if (isPinkyExtended && isThumbExtended && !isIndexExtended && !isMiddleExtended && !isRingExtended) {
      matchedLetter = 'Y';
    } else if (isPinkyExtended && !isIndexExtended && !isMiddleExtended && !isRingExtended) {
      matchedLetter = 'I';
    } else if (isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
      matchedLetter = 'D';
    } else if (!isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended && isThumbExtended) {
      matchedLetter = 'A';
    } else if (isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended && !isThumbExtended) {
      matchedLetter = 'B';
    }

    // Dataset Euclidean distance fallback
    let bestDist = Infinity;
    let bestLetter = 'A';

    aslAlphabet.forEach((alpha) => {
      if (!alpha.landmarks || alpha.landmarks.length !== 21) return;
      const tWrist = alpha.landmarks[0];
      const tRel = alpha.landmarks.map((c) => ({ x: c.x - tWrist.x, y: c.y - tWrist.y }));
      const tMax = Math.max(...tRel.flatMap((c) => [Math.abs(c.x), Math.abs(c.y)])) || 1;
      const tNorm = tRel.map((c) => ({ x: c.x / tMax, y: c.y / tMax }));

      let dist = 0;
      for (let i = 0; i < 21; i++) {
        const dx = detectedNorm[i].x - tNorm[i].x;
        const dy = detectedNorm[i].y - tNorm[i].y;
        const weight = (i === 4 || i === 8 || i === 12 || i === 16 || i === 20) ? 1.8 : 1.0;
        dist += Math.sqrt(dx * dx + dy * dy) * weight;
      }
      dist /= 24;

      if (dist < bestDist) {
        bestDist = dist;
        bestLetter = alpha.letter;
      }
    });

    const finalLetter = matchedLetter || bestLetter;
    const finalConf = matchedLetter ? postureConf : Math.max(0.85, Math.min(0.99, +(1 - bestDist * 0.7).toFixed(2)));

    return {
      letter: finalLetter,
      confidence: Math.round(finalConf * 100)
    };
  }, []);

  // Camera Management & Live Stream Loop
  const stopCamera = useCallback(() => {
    if (mpCameraRef.current) {
      try { mpCameraRef.current.stop(); } catch (_) {}
      mpCameraRef.current = null;
    }
    if (mpHandsRef.current) {
      try { mpHandsRef.current.close(); } catch (_) {}
      mpHandsRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    setCameraActive(false);
    setCameraLoading(false);
    setLiveDetectedLetter('—');
    setLiveConfidence(0);
  }, []);

  // Ensure video element plays stream whenever cameraActive is true
  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      videoRef.current.play().catch((err) => {
        console.warn('Video auto-play error:', err);
      });
    }
  }, [cameraActive]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setCameraLoading(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera API is not supported in this browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (e) {
          console.warn('Video initial play:', e);
        }
      }

      setCameraActive(true);
      setCameraLoading(false);
      showToast('Live webcam active! Hold ASL signs in frame.');

      // Load MediaPipe hands
      if (window.Hands && videoRef.current) {
        const hands = new window.Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });
        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 0,
          minDetectionConfidence: 0.45,
          minTrackingConfidence: 0.45
        });

        hands.onResults((results) => {
          const canvas = canvasRef.current;
          const video = videoRef.current;
          if (!canvas || !video) return;

          const ctx = canvas.getContext('2d');
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;

          // Clear transparent canvas for overlay drawing
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (results.multiHandLandmarks?.length > 0) {
            const rawLm = results.multiHandLandmarks[0];

            // 1. Draw 3D skeletal wireframe on transparent overlay
            ctx.strokeStyle = '#3ddc84';
            ctx.lineWidth = 3;
            ctx.fillStyle = '#ff7043';

            const bones = [
              [0, 1], [1, 2], [2, 3], [3, 4],
              [0, 5], [5, 6], [6, 7], [7, 8],
              [5, 9], [9, 10], [10, 11], [11, 12],
              [9, 13], [13, 14], [14, 15], [15, 16],
              [13, 17], [17, 18], [18, 19], [19, 20],
              [0, 17]
            ];

            bones.forEach(([s, e]) => {
              const p1 = rawLm[s];
              const p2 = rawLm[e];
              if (!p1 || !p2) return;
              ctx.beginPath();
              // Note: video is already CSS mirrored, so canvas matches video coordinate space
              ctx.moveTo((1 - p1.x) * canvas.width, p1.y * canvas.height);
              ctx.lineTo((1 - p2.x) * canvas.width, p2.y * canvas.height);
              ctx.stroke();
            });

            rawLm.forEach((pt, idx) => {
              const isTip = idx === 0 || idx % 4 === 0;
              ctx.beginPath();
              ctx.arc((1 - pt.x) * canvas.width, pt.y * canvas.height, isTip ? 5 : 3.5, 0, 2 * Math.PI);
              ctx.fillStyle = isTip ? '#FFD700' : '#FFFFFF';
              ctx.fill();
              ctx.strokeStyle = '#3ddc84';
              ctx.lineWidth = 1.5;
              ctx.stroke();
            });

            // 2. Classify gesture
            const { letter, confidence: conf } = classifyLandmarks(rawLm);
            setLiveDetectedLetter(letter);
            setLiveConfidence(conf);
            setSelectedLetter(letter);
            setConfidence(conf);

            // 3. Smoothing Buffer (Matching popup.js BUFFER_SIZE = 4)
            predBufRef.current.push(letter);
            if (predBufRef.current.length > 4) predBufRef.current.shift();

            const freq = {};
            predBufRef.current.forEach((x) => (freq[x] = (freq[x] || 0) + 1));
            const smoothed = Object.keys(freq).reduce((a, b) => (freq[a] > freq[b] ? a : b));

            // 4. Stable Hold Commitment (Matching popup.js 3-frame threshold)
            if (smoothed !== lastDetectedRef.current) {
              lastDetectedRef.current = smoothed;
              stableCountRef.current = 1;
              committedThisHoldRef.current = false;
            } else {
              stableCountRef.current += 1;
              if (!committedThisHoldRef.current && stableCountRef.current >= 3) {
                // Commit letter into word buffer
                setBuffer((prev) => {
                  if (prev.length < 40) {
                    return prev + smoothed;
                  }
                  return prev;
                });
                setSignCount((prev) => prev + 1);
                committedThisHoldRef.current = true;
              }
            }
          } else {
            setLiveDetectedLetter('—');
            setLiveConfidence(0);
            predBufRef.current = [];
            stableCountRef.current = 0;
            lastDetectedRef.current = null;
          }
        });

        mpHandsRef.current = hands;

        if (window.Camera && videoRef.current) {
          const cam = new window.Camera(videoRef.current, {
            onFrame: async () => {
              if (mpHandsRef.current && videoRef.current) {
                try {
                  await mpHandsRef.current.send({ image: videoRef.current });
                } catch (_) {}
              }
            },
            width: 640,
            height: 480
          });
          cam.start();
          mpCameraRef.current = cam;
        }
      }
    } catch (err) {
      console.warn('Webcam start error:', err);
      setCameraError(err.message || 'Could not access webcam. Using 3D landmark mesh mode.');
      setCameraLoading(false);
      setCameraActive(false);
    }
  }, [classifyLandmarks]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  function handleSelectLetter(char) {
    setSelectedLetter(char);
    const gest = gesturePresets.find((g) => g.letter === char);
    if (gest) {
      setConfidence(gest.confidence);
    } else {
      setConfidence(Number((94 + Math.random() * 5).toFixed(1)));
    }
    setSignCount((prev) => prev + 1);
    if (buffer.length < 40) {
      setBuffer((prev) => prev + char);
    }
  }

  function handleBackspace() {
    setBuffer((prev) => prev.slice(0, -1));
  }

  function handleSpace() {
    if (buffer.length > 0 && !buffer.endsWith(' ') && buffer.length < 40) {
      setBuffer((prev) => prev + ' ');
    }
  }

  function handleClear() {
    setBuffer('');
  }

  function handleCopy() {
    if (!buffer.trim()) return;
    navigator.clipboard.writeText(buffer);
    setCopied(true);
    showToast('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  }

  // 1. Send Recognized ASL Directly to Google Meet Chat
  function handleSendToMeetChat() {
    if (!buffer.trim()) return;
    const msgText = `[ASL]: ${buffer.trim()}`;
    const newMsg = {
      id: Date.now(),
      sender: 'SignSpeak Assistant (You)',
      avatarColor: '#2E7D32',
      time: 'Just now',
      text: msgText,
      isAsl: true
    };
    setChatMessages((prev) => [...prev, newMsg]);
    showToast(`Sent "${msgText}" to Google Meet in-call chat!`);
    
    // Automatically speak into call if mic is on
    if (micActive) {
      handleSpeak();
    }
  }

  // 2. Transmit Spoken Audio to Call (Web Speech API)
  function handleSpeak() {
    if (!buffer.trim()) return;
    setSpokenText(buffer.trim());
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(buffer);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 2500);
    }
  }

  // 3. AI Autocorrect & Sentence Refinement
  function handleAiFix() {
    if (!buffer.trim()) return;
    const clean = buffer.trim().toUpperCase();
    const dictionaryFixes = {
      'HLW': 'HELLO',
      'HLW WLD': 'HELLO WORLD',
      'HELO WORLD': 'HELLO WORLD',
      'THX': 'THANK YOU',
      'THK U': 'THANK YOU',
      'THNK U': 'THANK YOU',
      'SGN SPK': 'SIGNSPEAK',
      'SIGN SPK': 'SIGNSPEAK',
      'GD MRNG': 'GOOD MORNING',
      'GUD MRNG': 'GOOD MORNING',
      'NC 2 MT U': 'NICE TO MEET YOU',
      'EQL ACCS': 'EQUAL ACCESS'
    };

    let fixed = dictionaryFixes[clean];
    if (!fixed) {
      fixed = clean.charAt(0) + clean.slice(1).toLowerCase() + '.';
    }
    setBuffer(fixed);
    showToast(`AI Refined: "${fixed}"`);
  }

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="demo-sandbox-card">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="sim-toast-banner">
          <CheckIcon size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Simulator Header */}
      <div className="sandbox-header">
        <div className="sandbox-title-area">
          <div className="sandbox-top-pills">
            <span className="sandbox-badge">GOOGLE MEET DUAL-PERSPECTIVE SIMULATOR</span>
            <span className="sandbox-live-pill">
              <span className="pulse-dot" /> EXTENSION BROADCAST ACTIVE
            </span>
          </div>
          <h3>Sign-to-Meet Live Extension &amp; Recipient Simulator</h3>
          <p className="sandbox-desc">
            Experience how the extension works from both sides of a Google Meet call: sign gestures on your camera, watch the extension transcribe in real time, and switch tabs to see what the meeting recipient sees and hears.
          </p>
        </div>

        {/* Perspective Mode Switcher */}
        <div className="sandbox-tab-group">
          <button
            type="button"
            className={`tab-btn ${viewPerspective === 'split' ? 'active' : ''}`}
            onClick={() => setViewPerspective('split')}
          >
            <VideoIcon size={14} />
            <span>Dual Split Screen</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${viewPerspective === 'sender' ? 'active' : ''}`}
            onClick={() => setViewPerspective('sender')}
          >
            <CameraIcon size={14} />
            <span>Your Camera View</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${viewPerspective === 'recipient' ? 'active' : ''}`}
            onClick={() => setViewPerspective('recipient')}
          >
            <LandmarkIcon size={14} />
            <span>Recipient View (Signa)</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage Grid */}
      <div className={`meet-sim-stage-layout ${viewPerspective === 'split' ? 'is-split-layout' : ''}`}>
        
        {/* =========================================================================
            PANEL 1: YOUR MEETING VIEW (SENDER / SIGNER)
            ========================================================================= */}
        {(viewPerspective === 'split' || viewPerspective === 'sender') && (
          <div className="meet-perspective-col sender-perspective">
            <div className="perspective-header-badge">
              <span className="sender-indicator-dot" />
              <strong>YOUR MEETING SCREEN (Signer)</strong>
              <span className="role-pill">Extension Active</span>
            </div>

            <div className="meet-video-tile-card">
              <div className="meet-tile-topbar">
                <div className="meet-user-badge">
                  <span className="meet-cam-dot" />
                  <span>You (Signing ASL) · 1080p 30 FPS</span>
                </div>
                <div className="meet-tile-stats">
                  <span className="meet-codec-pill">WebRTC Opus/VP9</span>
                  <span className="meet-latency-pill">12.4 ms</span>
                </div>
              </div>

              {/* Video Frame: Webcam OR 3D Landmark Mesh */}
              <div className="meet-video-stage">
                <div className="webcam-live-wrapper" style={{ display: cameraActive ? 'flex' : 'none' }}>
                  <video ref={videoRef} className="webcam-raw-video" playsInline muted autoPlay />
                  <canvas ref={canvasRef} className="webcam-landmark-canvas" />
                  <div className="webcam-live-indicator">
                    <span className="pulse-dot" /> LIVE CAMERA FEED
                  </div>
                </div>

                {!cameraActive && (
                  <HandStage activeLetter={selectedLetter} onSelectLetter={handleSelectLetter} />
                )}

                {/* Burning Subtitles Overlay on Sender Video */}
                {subtitlesEnabled && (buffer || selectedLetter) && (
                  <div className="meet-burning-subtitles" id="asl-meet-live-subtitles">
                    <span className="asl-sub-dot" />
                    <span className="asl-sub-tag">ASL</span>
                    <span className="asl-sub-text">
                      {buffer ? buffer : ''}
                      <span className="asl-live-char-highlight"> {selectedLetter}</span>
                    </span>
                  </div>
                )}

                {/* Audio Transmit HUD Banner */}
                {isSpeaking && (
                  <div className="meet-audio-transmitting-banner">
                    <SpeakerIcon size={14} />
                    <span>BROADCASTING AUDIO TO MEETING CALL...</span>
                  </div>
                )}
              </div>

              {/* Meeting Call Controls */}
              <div className="meet-tile-footer">
                <div className="meet-call-controls">
                  {cameraActive ? (
                    <button
                      type="button"
                      className="meet-ctrl-btn active"
                      onClick={stopCamera}
                      title="Switch to 3D Landmark Mesh"
                    >
                      <CameraIcon size={15} />
                      <span>Camera ON</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="meet-ctrl-btn"
                      onClick={startCamera}
                      disabled={cameraLoading}
                      title="Enable Real Webcam Stream"
                    >
                      <CameraIcon size={15} />
                      <span>{cameraLoading ? 'Starting...' : 'Enable Webcam'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    className={`meet-ctrl-btn ${micActive ? 'active' : 'muted'}`}
                    onClick={() => {
                      setMicActive(!micActive);
                      showToast(micActive ? 'Virtual mic muted' : 'Virtual mic active');
                    }}
                    title={micActive ? 'Virtual Microphone Active' : 'Virtual Microphone Muted'}
                  >
                    <VolumeIcon size={15} />
                    <span>{micActive ? 'Mic ON' : 'Mic OFF'}</span>
                  </button>

                  <button
                    type="button"
                    className={`meet-ctrl-btn ${subtitlesEnabled ? 'active' : ''}`}
                    onClick={() => {
                      setSubtitlesEnabled(!subtitlesEnabled);
                      showToast(subtitlesEnabled ? 'Subtitles hidden' : 'Live subtitles enabled');
                    }}
                    title="Toggle Video Subtitles"
                  >
                    <VideoIcon size={15} />
                    <span>{subtitlesEnabled ? 'Subtitles ON' : 'Subtitles OFF'}</span>
                  </button>
                </div>

                <div className="meet-privacy-badge">
                  <ShieldIcon size={13} />
                  <span>100% Local On-Device AI</span>
                </div>
              </div>
            </div>

            {/* In-Call Extension Dock Controls */}
            <div className="extension-dock-card">
              <div className="ext-dock-header">
                <div className="ext-title-row">
                  <ExtensionIcon size={18} />
                  <strong>ASL Meet Assistant</strong>
                  <span className="ext-version-tag">v1.0.4</span>
                </div>
                <div className="ext-status-pill">
                  <span className="live-dot" />
                  <span>Connected to Meet</span>
                </div>
              </div>

              {/* Detected Letter Banner */}
              <div className="ext-detection-box">
                <div className="ext-detected-char">{selectedLetter}</div>
                <div className="ext-detection-meta">
                  <div className="ext-conf-row">
                    <span>Confidence:</span>
                    <strong>{confidence}%</strong>
                  </div>
                  <div className="ext-mode-badge">SIGN MODE · ACTIVE</div>
                </div>
              </div>

              {/* Quick Presets Bar */}
              <div className="preset-phrases-bar">
                <span className="preset-lbl">Quick Presets:</span>
                <div className="preset-chips">
                  {presetPhrases.map((phrase) => (
                    <button
                      key={phrase}
                      type="button"
                      className="preset-chip"
                      onClick={() => {
                        setBuffer(phrase);
                        showToast(`Set buffer to "${phrase}"`);
                      }}
                    >
                      {phrase}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accumulated Text Buffer */}
              <div className="ext-text-bar-container">
                <div className="ext-text-label-row">
                  <span className="ext-text-lbl">Spelled Text Buffer</span>
                  <span className="ext-char-count">{buffer.length}/40 chars</span>
                </div>
                <div className="ext-accumulated-box">
                  {buffer ? (
                    <span className="ext-text-content">{buffer}</span>
                  ) : (
                    <span className="ext-placeholder">Sign in camera or click alphabet letters below...</span>
                  )}
                  <span className="cursor-blink" />
                </div>
              </div>

              {/* Extension Actions Grid */}
              <div className="ext-action-buttons-grid">
                <button
                  type="button"
                  className="btn btn-primary ext-send-meet-btn"
                  onClick={handleSendToMeetChat}
                  disabled={!buffer.trim()}
                  title="Inject [ASL]: <message> into the meeting chat"
                >
                  <MessageSquareIcon size={16} />
                  <span>Send to Meet Chat</span>
                </button>

                <button
                  type="button"
                  className="btn btn-outline ext-action-btn"
                  onClick={handleSpeak}
                  disabled={!buffer.trim() || isSpeaking}
                  title="Speak into Google Meet Audio stream"
                >
                  <SpeakerIcon size={14} />
                  <span>{isSpeaking ? 'Transmitting...' : 'Speak'}</span>
                </button>

                <button
                  type="button"
                  className="btn btn-outline ext-action-btn ext-ai-btn"
                  onClick={handleAiFix}
                  disabled={!buffer.trim()}
                  title="AI Grammar & Autocorrect"
                >
                  <SparklesIcon size={14} />
                  <span>AI Fix</span>
                </button>

                <button
                  type="button"
                  className="btn btn-outline ext-action-btn"
                  onClick={handleSpace}
                  title="Insert space"
                >
                  <SpaceIcon size={14} />
                  <span>Space</span>
                </button>

                <button
                  type="button"
                  className="btn btn-outline ext-action-btn"
                  onClick={handleBackspace}
                  title="Delete previous letter"
                >
                  <BackspaceIcon size={14} />
                  <span>Delete</span>
                </button>

                <button
                  type="button"
                  className="btn btn-outline ext-action-btn"
                  onClick={handleCopy}
                  disabled={!buffer.trim()}
                  title="Copy text"
                >
                  <CopyIcon size={13} />
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  type="button"
                  className="btn btn-outline ext-action-btn"
                  onClick={handleClear}
                  disabled={!buffer}
                  title="Clear text buffer"
                >
                  <TrashIcon size={13} />
                  <span>Clear</span>
                </button>
              </div>

              {/* ASL Alphabet Selector Matrix */}
              <div className="ext-alphabet-selector-mini">
                <div className="mini-matrix-head">
                  <span className="box-title">ASL Alphabet Triggers (A–Z)</span>
                  <div className="alphabet-filter-tabs">
                    {['ALL', 'A-G', 'H-N', 'O-T', 'U-Z'].map((grp) => (
                      <button
                        key={grp}
                        type="button"
                        className={`alpha-filter-btn ${filterGroup === grp ? 'active' : ''}`}
                        onClick={() => setFilterGroup(grp)}
                      >
                        {grp}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="gesture-grid mini-gesture-grid">
                  {filteredPresets.map((gesture) => (
                    <button
                      key={gesture.letter}
                      type="button"
                      className={`gesture-btn ${selectedLetter === gesture.letter ? 'selected' : ''}`}
                      onClick={() => handleSelectLetter(gesture.letter)}
                      title={`${gesture.letter}: ${gesture.name}`}
                    >
                      <span className="gesture-char">{gesture.letter}</span>
                      <div className="gesture-meta">
                        <strong>{gesture.name}</strong>
                      </div>
                      <span className="add-hint">+</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            PANEL 2: RECIPIENT'S MEETING VIEW (WHAT THE OTHER PERSON SEES & HEARS)
            ========================================================================= */}
        {(viewPerspective === 'split' || viewPerspective === 'recipient') && (
          <div className="meet-perspective-col recipient-perspective">
            <div className="perspective-header-badge recipient-badge">
              <span className="recipient-indicator-dot" />
              <strong>RECIPIENT'S SCREEN (Signa SignSpeak)</strong>
              <span className="role-pill-recipient">Remote Participant</span>
            </div>

            <div className="meet-video-tile-card recipient-tile-card">
              <div className="meet-tile-topbar">
                <div className="meet-user-badge">
                  <span className="recipient-active-dot" />
                  <span>Signa (SignSpeak Listening) · 1080p WebRTC</span>
                </div>
                <div className="meet-tile-stats">
                  <span className="meet-codec-pill">Live Audio Rx</span>
                  <span className="meet-latency-pill">9.8 ms</span>
                </div>
              </div>

              {/* Recipient Video Feed with Human Avatar */}
              <div className="meet-video-stage recipient-stage-bg">
                <div className="human-avatar-container">
                  <div className="human-avatar-wrapper">
                    {/* Stylized Human Avatar Graphic */}
                    <div className="human-avatar-circle">
                      <svg viewBox="0 0 100 100" className="avatar-svg" fill="none">
                        <circle cx="50" cy="50" r="48" fill="#2A221E" stroke="#5D4037" strokeWidth="3" />
                        {/* Shoulders & Body */}
                        <path d="M22 88 C 22 68, 36 62, 50 62 C 64 62, 78 68, 78 88" fill="#4E342E" />
                        {/* Neck */}
                        <rect x="44" y="50" width="12" height="15" rx="3" fill="#D7CCC8" />
                        {/* Head & Face */}
                        <ellipse cx="50" cy="40" rx="16" ry="20" fill="#D7CCC8" />
                        {/* Hair */}
                        <path d="M32 38 C 32 20, 68 20, 68 38 C 68 25, 60 18, 50 18 C 40 18, 32 25, 32 38" fill="#3E2723" />
                        {/* Eyes */}
                        <circle cx="44" cy="38" r="2" fill="#3E2723" />
                        <circle cx="56" cy="38" r="2" fill="#3E2723" />
                        {/* Smile */}
                        <path d="M46 48 Q 50 52 54 48" stroke="#3E2723" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                      </svg>

                      {/* Active Listening Soundwave Halo */}
                      {isSpeaking && <div className="avatar-audio-ripple" />}
                    </div>

                    <div className="recipient-name-tag">
                      <strong>Signa</strong>
                      <span>SignSpeak AI Participant · Google Meet Call</span>
                    </div>
                  </div>
                </div>

                {/* Real-Time Live Subtitles Displayed on Recipient's Screen */}
                <div className="recipient-subtitles-banner">
                  <div className="subtitles-live-head">
                    <span className="live-sub-dot" />
                    <span className="live-sub-tag">TRANSLATED ASL SUBTITLES</span>
                  </div>
                  <div className="subtitles-text-display">
                    {buffer ? (
                      <span>
                        [ASL]: <strong className="sub-highlight-text">{buffer}</strong>
                        {selectedLetter && <span className="sub-live-char"> ({selectedLetter})</span>}
                      </span>
                    ) : (
                      <span className="sub-waiting-text">Waiting for participant to sign or speak...</span>
                    )}
                  </div>
                </div>

                {/* Live Audio Heard by Recipient */}
                {isSpeaking && (
                  <div className="recipient-incoming-audio-box">
                    <div className="audio-rx-head">
                      <VolumeIcon size={14} />
                      <span>INCOMING VOICE TRANSMISSION</span>
                    </div>
                    <div className="audio-rx-content">
                      <div className="rx-waveform-bars">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                          <span key={n} className="rx-wave" style={{ animationDelay: `${n * 0.08}s` }} />
                        ))}
                      </div>
                      <span className="rx-voice-text">Signa hears: &ldquo;{spokenText}&rdquo;</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Recipient Status Footer */}
              <div className="meet-tile-footer">
                <div className="recipient-live-status">
                  <span className="status-label">Live Reception:</span>
                  <span className="status-badge-ok">● Connected &amp; Subtitles Syncing (0.01s latency)</span>
                </div>
                <div className="meet-privacy-badge">
                  <span>Opus 48kHz Audio Stream</span>
                </div>
              </div>
            </div>

            {/* Recipient's Google Meet In-Call Live Chat Stream */}
            <div className="meet-chat-panel recipient-chat-panel">
              <div className="meet-chat-header">
                <div className="chat-head-left">
                  <div className="chat-title-row">
                    <MessageSquareIcon size={16} />
                    <strong>In-Call Messages</strong>
                    <span className="meet-live-sync-pill">
                      <span className="live-sub-dot" /> Live WebRTC
                    </span>
                  </div>
                  <span className="chat-head-sub">Signa&apos;s Screen · Real-time meeting stream</span>
                </div>
                <span className="chat-count-pill">{chatMessages.length} Messages</span>
              </div>

              {/* Message Feed */}
              <div className="meet-chat-messages-list">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`meet-chat-msg ${msg.isAsl ? 'asl-highlight-msg' : ''}`}>
                    <div className="chat-avatar" style={{ background: msg.avatarColor || 'var(--maroon)' }}>
                      {msg.sender.charAt(0)}
                    </div>
                    <div className="chat-msg-body">
                      <div className="chat-meta">
                        <div className="chat-sender-info">
                          <strong>{msg.sender}</strong>
                          {msg.isAsl && (
                            <span className="asl-verified-badge">
                              <ExtensionIcon size={11} /> ASL SIGN-TO-SPEECH
                            </span>
                          )}
                        </div>
                        <span className="chat-time">{msg.time}</span>
                      </div>
                      <p className="chat-text">{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Reactions for Signa */}
              <div className="recipient-quick-reactions">
                <span className="rx-quick-lbl">Signa&apos;s Quick Replies:</span>
                <div className="rx-quick-chips">
                  {[
                    'Signs are coming through clearly!',
                    'Speech audio is loud and clear.',
                    'Zero latency on my screen.'
                  ].map((replyText) => (
                    <button
                      key={replyText}
                      type="button"
                      className="rx-reply-chip"
                      onClick={() => {
                        const newMsg = {
                          id: Date.now(),
                          sender: 'Signa (SignSpeak)',
                          avatarColor: '#7B1FA2',
                          time: 'Just now',
                          text: replyText
                        };
                        setChatMessages((prev) => [...prev, newMsg]);
                        showToast(`Signa replied: "${replyText}"`);
                      }}
                    >
                      {replyText}
                    </button>
                  ))}
                </div>
              </div>

              <div className="recipient-chat-note">
                <InfoIcon size={14} />
                <span>Transcribed ASL messages sent from the signer panel arrive instantly into Signa&apos;s in-call chat feed.</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
