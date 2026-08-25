import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { AuthRequiredGate } from './Forms.jsx';
import {
  PlaygroundIcon,
  TrophyIcon,
  ZapIcon,
  TargetIcon,
  FlameIcon,
  VolumeIcon,
  RotateCwIcon,
  CheckIcon,
  SparklesIcon,
  ShieldIcon,
  PlatformIcon,
  CloseIcon,
  SpinnerIcon,
  CameraIcon,
  VideoIcon,
  AwardIcon,
  InfoIcon
} from './Icons.jsx';
import { aslAlphabet, handBones, wordChallenges, achievementsList } from '../data/aslDataset.js';

// Landmark Anatomical Joint Labels for 21-point MediaPipe keypoints
const LANDMARK_NAMES = [
  '0: Wrist Base',
  '1: Thumb CMC', '2: Thumb MCP', '3: Thumb IP', '4: Thumb Tip',
  '5: Index MCP', '6: Index PIP', '7: Index DIP', '8: Index Tip',
  '9: Middle MCP', '10: Middle PIP', '11: Middle DIP', '12: Middle Tip',
  '13: Ring MCP', '14: Ring PIP', '15: Ring DIP', '16: Ring Tip',
  '17: Pinky MCP', '18: Pinky PIP', '19: Pinky DIP', '20: Pinky Tip'
];

// Web Audio API Synthesizer helper for tonal feedback (100% offline, zero external audio files)
function playTone(type = 'success') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'levelup') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      osc.frequency.setValueAtTime(783.99, now + 0.2);
      osc.frequency.setValueAtTime(1046.50, now + 0.3);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(160, now + 0.15);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch {}
}

// Speak word or letter aloud with Web Speech API
function speakPhonetic(text) {
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  } catch {}
}

export default function PlaygroundView({ navigate, onOpenAuth }) {
  const { user, profile } = useAuth();

  // Gamification Profile State (Synchronized with Neon PostgreSQL)
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(1);
  const [expertiseTier, setExpertiseTier] = useState('Novice Signer');
  const [practicedLetters, setPracticedLetters] = useState([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState(['first_sign']);
  const [quizHighScore, setQuizHighScore] = useState(0);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [totalDrills, setTotalDrills] = useState(0);
  const [accuracyRate, setAccuracyRate] = useState(100.0);

  // Sync Status
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(true);

  // Active Playground Tab
  const [activeTab, setActiveTab] = useState('dictionary'); // 'dictionary' | 'quiz' | 'sandbox'
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [achievementsModalOpen, setAchievementsModalOpen] = useState(false);
  const [recentXpGain, setRecentXpGain] = useState(null);

  // Selected Letter in Lab
  const [selectedLetter, setSelectedLetter] = useState(aslAlphabet[0]);
  const [hoveredNodeIndex, setHoveredNodeIndex] = useState(null);

  // Quiz Game State
  const [quizState, setQuizState] = useState('idle'); // 'idle' | 'running' | 'completed'
  const [quizQuestion, setQuizQuestion] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizTimer, setQuizTimer] = useState(30);
  const [quizCombo, setQuizCombo] = useState(0);
  const [quizCorrectCount, setQuizCorrectCount] = useState(0);
  const [quizTotalAnswers, setQuizTotalAnswers] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerFeedback, setAnswerFeedback] = useState(null);

  // Live Accuracy Sandbox & Camera State
  const [sandboxWord, setSandboxWord] = useState(wordChallenges[0]);
  const [sandboxStep, setSandboxStep] = useState(0);
  const [letterScores, setLetterScores] = useState([]);
  const [sandboxCameraActive, setSandboxCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [sandboxSimMode, setSandboxSimMode] = useState(false);
  const [simulatedSign, setSimulatedSign] = useState(null);
  const [liveAccuracy, setLiveAccuracy] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [detectedLetter, setDetectedLetter] = useState('—');
  const [handDetected, setHandDetected] = useState(false);
  const [modelServerOnline, setModelServerOnline] = useState(false);
  const [wordCompletedModal, setWordCompletedModal] = useState(false);
  const [completedWordAccuracy, setCompletedWordAccuracy] = useState(98.0);
  const [completedWordXp, setCompletedWordXp] = useState(60);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animRef = useRef(null);
  const holdIntervalRef = useRef(null);

  // 1. Initial Load: Fetch User Study Progress from Neon PostgreSQL
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    async function loadProgress() {
      setSyncing(true);
      try {
        const data = await api.getPlaygroundProgress();
        if (data && isMounted) {
          setXp(data.xp || 0);
          setLevel(data.level || 1);
          setStreak(data.streak || 1);
          setExpertiseTier(data.expertise_tier || 'Novice Signer');
          setPracticedLetters(Array.isArray(data.practiced_letters) ? data.practiced_letters : []);
          setUnlockedAchievements(Array.isArray(data.unlocked_achievements) ? data.unlocked_achievements : ['first_sign']);
          setQuizHighScore(data.quiz_high_score || 0);
          setWordsCompleted(data.words_completed || 0);
          setTotalDrills(data.total_drills || 0);
          setAccuracyRate(typeof data.accuracy_rate === 'number' ? data.accuracy_rate : 100.0);
          setSyncSuccess(true);
        }
      } catch (err) {
        console.warn('[PlaygroundView] Loaded local study cache fallback:', err);
        // Fallback to local storage
        try {
          const cached = JSON.parse(localStorage.getItem(`signspeak_study_${user.uid}`) || '{}');
          if (cached.xp !== undefined && isMounted) {
            setXp(cached.xp);
            setLevel(cached.level || 1);
            setStreak(cached.streak || 1);
            setExpertiseTier(cached.expertise_tier || 'Novice Signer');
            setPracticedLetters(cached.practiced_letters || []);
            setUnlockedAchievements(cached.unlocked_achievements || ['first_sign']);
            setQuizHighScore(cached.quiz_high_score || 0);
          }
        } catch {}
      } finally {
        if (isMounted) setSyncing(false);
      }
    }

    loadProgress();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Debounced Sync Helper to Neon Database
  const syncTimerRef = useRef(null);
  const triggerNeonSync = useCallback((stateUpdate) => {
    if (!user) return;

    // Cache immediately in localStorage
    try {
      localStorage.setItem(`signspeak_study_${user.uid}`, JSON.stringify(stateUpdate));
    } catch {}

    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(async () => {
      setSyncing(true);
      try {
        await api.updatePlaygroundProgress(stateUpdate);
        setSyncSuccess(true);
      } catch (err) {
        console.warn('[PlaygroundView] Database sync deferred:', err.message);
        setSyncSuccess(false);
      } finally {
        setSyncing(false);
      }
    }, 600);
  }, [user]);

  // Level Progression Math (100 XP per Level)
  const currentLevelXp = xp % 100;
  const xpToNextLevel = 100 - currentLevelXp;

  // Award XP, update state & sync to Neon
  function awardXp(amount, reason = 'Practice', extraData = {}) {
    const nextXp = xp + amount;
    const oldLevel = Math.floor(xp / 100) + 1;
    const nextLevel = Math.floor(nextXp / 100) + 1;

    setXp(nextXp);
    setLevel(nextLevel);

    setRecentXpGain({ amount, reason });
    setTimeout(() => setRecentXpGain(null), 2500);

    if (nextLevel > oldLevel) {
      playTone('levelup');
    } else {
      playTone('success');
    }

    // Check achievement unlock
    let nextAchievements = [...unlockedAchievements];
    achievementsList.forEach((ach) => {
      if (nextXp >= ach.xpRequired && !nextAchievements.includes(ach.id)) {
        nextAchievements.push(ach.id);
      }
    });
    setUnlockedAchievements(nextAchievements);

    // Calculate next expertise tier
    const practicedCount = (extraData.practiced_letters || practicedLetters).length;
    let nextTier = 'Novice Signer';
    if (nextXp >= 1000 || practicedCount >= 26) nextTier = 'ASL Master';
    else if (nextXp >= 500 || practicedCount >= 18) nextTier = 'Fluent Communicator';
    else if (nextXp >= 250 || practicedCount >= 10) nextTier = 'Advanced Signer';
    else if (nextXp >= 100 || practicedCount >= 4) nextTier = 'Intermediate Fingerspeller';
    setExpertiseTier(nextTier);

    const payload = {
      xp: nextXp,
      level: nextLevel,
      streak,
      expertise_tier: nextTier,
      practiced_letters: extraData.practiced_letters || practicedLetters,
      unlocked_achievements: nextAchievements,
      quiz_high_score: extraData.quiz_high_score !== undefined ? extraData.quiz_high_score : quizHighScore,
      words_completed: extraData.words_completed !== undefined ? extraData.words_completed : wordsCompleted,
      total_drills: extraData.total_drills !== undefined ? extraData.total_drills : totalDrills,
      accuracy_rate: extraData.accuracy_rate !== undefined ? extraData.accuracy_rate : accuracyRate
    };

    triggerNeonSync(payload);
  }

  // Handle Letter Selection & Practice
  function handleSelectLetter(item) {
    setSelectedLetter(item);
    speakPhonetic(`Letter ${item.letter}`);

    if (!practicedLetters.includes(item.letter)) {
      const nextList = [...practicedLetters, item.letter];
      setPracticedLetters(nextList);
      awardXp(item.xp, `Mastered Letter ${item.letter}`, { practiced_letters: nextList });
    }
  }

  // Filtered letters for A-Z lab
  const filteredLetters = useMemo(() => {
    if (categoryFilter === 'ALL') return aslAlphabet;
    return aslAlphabet.filter((item) => item.category.toLowerCase().includes(categoryFilter.toLowerCase()));
  }, [categoryFilter]);

  // Generate Quiz Question
  function nextQuizQuestion() {
    setSelectedAnswer(null);
    setAnswerFeedback(null);

    const randomTarget = aslAlphabet[Math.floor(Math.random() * aslAlphabet.length)];
    const otherLetters = aslAlphabet.filter((item) => item.letter !== randomTarget.letter);
    const shuffledOthers = otherLetters.sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [randomTarget, ...shuffledOthers].sort(() => 0.5 - Math.random());

    setQuizQuestion({
      target: randomTarget,
      options
    });
  }

  // Start Quiz Sprint
  function startQuiz() {
    setQuizScore(0);
    setQuizCombo(0);
    setQuizCorrectCount(0);
    setQuizTotalAnswers(0);
    setQuizTimer(30);
    setQuizState('running');
    nextQuizQuestion();
  }

  // Quiz Timer Countdown
  useEffect(() => {
    let interval = null;
    if (quizState === 'running' && quizTimer > 0) {
      interval = setInterval(() => {
        setQuizTimer((prev) => {
          if (prev <= 1) {
            setQuizState('completed');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizState, quizTimer]);

  // Handle Quiz Completion & High Score Sync
  useEffect(() => {
    if (quizState === 'completed') {
      const isNewHigh = quizScore > quizHighScore;
      const nextHighScore = Math.max(quizScore, quizHighScore);
      if (isNewHigh) setQuizHighScore(nextHighScore);

      const nextDrills = totalDrills + 1;
      setTotalDrills(nextDrills);

      const sessionAccuracy = quizTotalAnswers > 0 ? (quizCorrectCount / quizTotalAnswers) * 100 : 100;
      const weightedAccuracy = Math.round((accuracyRate * 0.7) + (sessionAccuracy * 0.3));
      setAccuracyRate(weightedAccuracy);

      if (quizScore > 0) {
        awardXp(quizScore, `Quiz Sprint Bonus (+${quizScore} XP)`, {
          quiz_high_score: nextHighScore,
          total_drills: nextDrills,
          accuracy_rate: weightedAccuracy
        });
      }
    }
  }, [quizState]);

  // Handle Quiz Answer Choice
  function handleAnswerSelect(choice) {
    if (selectedAnswer !== null || !quizQuestion) return;

    setSelectedAnswer(choice);
    setQuizTotalAnswers((prev) => prev + 1);

    if (choice.letter === quizQuestion.target.letter) {
      playTone('success');
      setAnswerFeedback('correct');
      const comboBonus = quizCombo * 5;
      const points = 20 + comboBonus;
      setQuizScore((prev) => prev + points);
      setQuizCombo((prev) => prev + 1);
      setQuizCorrectCount((prev) => prev + 1);

      setTimeout(() => {
        if (quizTimer > 0) nextQuizQuestion();
      }, 550);
    } else {
      playTone('error');
      setAnswerFeedback('incorrect');
      setQuizCombo(0);

      setTimeout(() => {
        if (quizTimer > 0) nextQuizQuestion();
      }, 850);
    }
  }


  // Check local SignSpeak Python model server connectivity
  useEffect(() => {
    async function checkServer() {
      try {
        const res = await fetch('http://127.0.0.1:8765/health', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.ok) setModelServerOnline(true);
        }
      } catch {
        setModelServerOnline(false);
      }
    }
    checkServer();
  }, []);

  // Sandbox Camera Lifecycle Functions
  // Normalize 21 3D landmarks (wrist-centered & max coordinate scaled)
  const normalizeLandmarks = useCallback((rawLandmarks) => {
    if (!rawLandmarks || rawLandmarks.length !== 21) return null;
    const coords = rawLandmarks.map((p) => ({ x: 1 - p.x, y: p.y, z: p.z || 0 }));
    const wrist = coords[0];
    const rel = coords.map((c) => ({ x: c.x - wrist.x, y: c.y - wrist.y, z: c.z - wrist.z }));
    const maxVal = Math.max(...rel.flatMap((c) => [Math.abs(c.x), Math.abs(c.y), Math.abs(c.z)])) || 1e-6;
    return rel.map((c) => ({ x: c.x / maxVal, y: c.y / maxVal, z: c.z / maxVal }));
  }, []);



  // Target letter for current challenge step
  const currentTargetLetter = sandboxWord?.letters?.[sandboxStep] || 'A';
  const targetLetterData = useMemo(() => {
    return aslAlphabet.find((a) => a.letter === currentTargetLetter) || aslAlphabet[0];
  }, [currentTargetLetter]);

  // Synchronized state refs to prevent any closure lag in high-frequency video frames
  const currentTargetLetterRef = useRef(currentTargetLetter);
  currentTargetLetterRef.current = currentTargetLetter;
  const sandboxStepRef = useRef(sandboxStep);
  sandboxStepRef.current = sandboxStep;
  const sandboxWordRef = useRef(sandboxWord);
  sandboxWordRef.current = sandboxWord;
  const letterScoresRef = useRef(letterScores);
  letterScoresRef.current = letterScores;
  const wordsCompletedRef = useRef(wordsCompleted);
  wordsCompletedRef.current = wordsCompleted;
  const accuracyRateRef = useRef(accuracyRate);
  accuracyRateRef.current = accuracyRate;
  const totalDrillsRef = useRef(totalDrills);
  totalDrillsRef.current = totalDrills;
  const consecutiveMatchesRef = useRef(0);
  const isAdvancingRef = useRef(false);

  // Evaluate gesture for human readability & conversational intelligibility
  const evaluateLandmarks = useCallback((detectedNorm, targetLetterChar) => {
    if (!detectedNorm || detectedNorm.length !== 21) return { accuracy: 0, predictedLetter: '—', understood: false };

    // 1. Calculate finger extension states from 21 MediaPipe coordinates
    // In normalized coords, y is negative going up (tip y < PIP y means finger is extended)
    const isIndexExtended = detectedNorm[8].y < detectedNorm[6].y - 0.05;
    const isMiddleExtended = detectedNorm[12].y < detectedNorm[10].y - 0.05;
    const isRingExtended = detectedNorm[16].y < detectedNorm[14].y - 0.05;
    const isPinkyExtended = detectedNorm[20].y < detectedNorm[18].y - 0.05;
    
    // Thumb extension: distance from wrist / index MCP
    const thumbDistFromPalm = Math.hypot(detectedNorm[4].x - detectedNorm[2].x, detectedNorm[4].y - detectedNorm[2].y);
    const isThumbExtended = thumbDistFromPalm > 0.32;

    // 2. Strict, distinct ASL posture verification for individual letters
    let matchesTargetPosture = false;

    if (targetLetterChar === 'E') {
      // E: ALL 4 fingers curled down tightly into the palm, thumb tucked across/below fingertips
      matchesTargetPosture = !isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended && !isThumbExtended;
    } else if (targetLetterChar === 'A') {
      // A: fist closed, thumb resting upright against the index knuckle
      matchesTargetPosture = !isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended && isThumbExtended;
    } else if (targetLetterChar === 'S') {
      // S: closed fist with thumb wrapped across the front of the 4 curled fingers
      matchesTargetPosture = !isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended;
    } else if (targetLetterChar === 'B') {
      // B: all 4 fingers extended straight up, thumb folded across palm
      matchesTargetPosture = isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended && !isThumbExtended;
    } else if (targetLetterChar === 'H') {
      // H: index and middle extended together horizontally/forward, ring and pinky curled
      matchesTargetPosture = isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended;
    } else if (targetLetterChar === 'L') {
      // L: index extended straight up, thumb extended sideways forming an L angle, other 3 fingers curled
      const thumbSeparation = Math.hypot(detectedNorm[4].x - detectedNorm[5].x, detectedNorm[4].y - detectedNorm[5].y);
      const thumbSpreadX = Math.abs(detectedNorm[4].x - detectedNorm[8].x);
      const isThumbExtendedL = thumbSeparation > 0.20 || thumbSpreadX > 0.18 || isThumbExtended;
      matchesTargetPosture = isIndexExtended && isThumbExtendedL && !isMiddleExtended && !isRingExtended && !isPinkyExtended;
    } else if (targetLetterChar === 'O') {
      // O: all 4 fingertips curled in an O shape touching thumb tip
      const indexThumbGap = Math.hypot(detectedNorm[8].x - detectedNorm[4].x, detectedNorm[8].y - detectedNorm[4].y);
      matchesTargetPosture = !isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended && indexThumbGap < 0.28;
    } else if (targetLetterChar === 'C') {
      // C: curved hand (thumb and index separated in a C arch)
      const indexThumbGap = Math.hypot(detectedNorm[8].x - detectedNorm[4].x, detectedNorm[8].y - detectedNorm[4].y);
      matchesTargetPosture = !isMiddleExtended && !isRingExtended && !isPinkyExtended && indexThumbGap > 0.32;
    } else if (targetLetterChar === 'D') {
      // D: index pointing up, thumb touching middle, ring, pinky in loop
      matchesTargetPosture = isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended && !isThumbExtended;
    } else if (targetLetterChar === 'I') {
      // I: pinky extended straight up, all other fingers curled
      matchesTargetPosture = isPinkyExtended && !isIndexExtended && !isMiddleExtended && !isRingExtended;
    } else if (targetLetterChar === 'V') {
      // V: index and middle extended in a spread V, ring and pinky curled
      matchesTargetPosture = isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended;
    } else if (targetLetterChar === 'W') {
      // W: index, middle, ring extended spread out, pinky curled
      matchesTargetPosture = isIndexExtended && isMiddleExtended && isRingExtended && !isPinkyExtended;
    } else if (targetLetterChar === 'Y') {
      // Y: thumb and pinky extended, middle 3 curled
      matchesTargetPosture = isThumbExtended && isPinkyExtended && !isIndexExtended && !isMiddleExtended && !isRingExtended;
    } else if (targetLetterChar === 'U') {
      // U: index and middle extended together straight up
      matchesTargetPosture = isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended;
    } else if (targetLetterChar === 'P') {
      // P: index extended down/forward, middle bent down
      matchesTargetPosture = isIndexExtended && !isRingExtended && !isPinkyExtended;
    } else if (targetLetterChar === 'N') {
      // N: Index and middle folded over thumb, thumb tip resting between middle and ring
      const thumbTipX = detectedNorm[4].x;
      const indexMcpX = detectedNorm[5].x;
      const pinkyMcpX = detectedNorm[17].x;
      const thumbIsBetweenKnuckles = Math.min(indexMcpX, pinkyMcpX) <= thumbTipX && thumbTipX <= Math.max(indexMcpX, pinkyMcpX);
      matchesTargetPosture = !isRingExtended && !isPinkyExtended && !isIndexExtended && !isMiddleExtended && thumbIsBetweenKnuckles;
    } else if (targetLetterChar === 'M') {
      // M: Three fingers folded over thumb
      matchesTargetPosture = !isPinkyExtended && !isIndexExtended && !isMiddleExtended && !isRingExtended;
    } else if (targetLetterChar === 'G') {
      // G: Index and thumb pointing horizontally
      matchesTargetPosture = isIndexExtended && isThumbExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended;
    }

    // 3. Euclidean alignment with dataset templates
    let bestLetter = '—';
    let bestDist = Infinity;
    let targetDist = Infinity;

    aslAlphabet.forEach((alpha) => {
      if (!alpha.landmarks || alpha.landmarks.length !== 21) return;
      const tWrist = alpha.landmarks[0];
      const tRel = alpha.landmarks.map((c) => ({ x: c.x - tWrist.x, y: c.y - tWrist.y, z: 0 }));
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
      if (alpha.letter === targetLetterChar) {
        targetDist = dist;
      }
    });

    // Valid match criteria: Posture check MUST pass AND template alignment confirms it
    const isUnderstood = matchesTargetPosture && (bestLetter === targetLetterChar || targetDist < 0.44);
    const humanAccuracy = isUnderstood
      ? Math.max(85, Math.min(98.5, Math.round((1 - Math.min(0.40, targetDist) * 0.75) * 100)))
      : Math.max(15, Math.min(65, Math.round((1 - Math.min(1.0, targetDist)) * 100)));

    return {
      accuracy: humanAccuracy,
      predictedLetter: isUnderstood ? targetLetterChar : bestLetter,
      understood: isUnderstood
    };
  }, []);

  // Switch challenge word
  function handleSelectSandboxWord(wordObj) {
    setSandboxWord(wordObj);
    sandboxWordRef.current = wordObj;
    setSandboxStep(0);
    sandboxStepRef.current = 0;
    setLetterScores([]);
    letterScoresRef.current = [];
    setHoldProgress(0);
    setLiveAccuracy(0);
    setDetectedLetter('—');
    setHandDetected(false);
    setWordCompletedModal(false);
    consecutiveMatchesRef.current = 0;
    isAdvancingRef.current = false;
  }

  // Fast capture & seamless progression to next letter
  const handleConfirmSandboxLetter = useCallback((explicitScore) => {
    if (isAdvancingRef.current) return;
    isAdvancingRef.current = true;

    const targetChar = currentTargetLetterRef.current;
    const currentStep = sandboxStepRef.current;
    const currentWord = sandboxWordRef.current;
    const currentScores = letterScoresRef.current;
    const currentWordsCompleted = wordsCompletedRef.current;
    const currentAccuracyRate = accuracyRateRef.current;
    const currentTotalDrills = totalDrillsRef.current;

    const letterAccuracy = explicitScore !== undefined ? explicitScore : +(90.0 + Math.random() * 8.0).toFixed(1);
    playTone('success');
    speakPhonetic(targetChar);

    const nextScores = [...currentScores, letterAccuracy];
    setLetterScores(nextScores);
    letterScoresRef.current = nextScores;
    setHoldProgress(100);

    if (currentStep + 1 < currentWord.letters.length) {
      // Advance to next letter and apply transition cooldown to require forming the new letter
      const nextStep = currentStep + 1;
      setSandboxStep(nextStep);
      sandboxStepRef.current = nextStep;
      setLiveAccuracy(0);
      setDetectedLetter('—');
      setHoldProgress(0);
      consecutiveMatchesRef.current = 0;

      // 800ms guard to ensure the user actually transitions to the new letter
      setTimeout(() => {
        isAdvancingRef.current = false;
      }, 800);
    } else {
      // Completed entire word!
      const avgAccuracy = Math.round(nextScores.reduce((a, b) => a + b, 0) / nextScores.length);
      const bonusXp = Math.round((avgAccuracy / 100) * 20);
      const totalWordXp = currentWord.xpReward + bonusXp;

      playTone('levelup');
      speakPhonetic(`Word completed: ${currentWord.word}!`);

      const nextWordsCompleted = currentWordsCompleted + 1;
      const nextTotalDrills = currentTotalDrills + 1;
      const updatedAccuracy = Math.round((currentAccuracyRate * 0.7) + (avgAccuracy * 0.3));

      setAccuracyRate(updatedAccuracy);
      setWordsCompleted(nextWordsCompleted);
      setTotalDrills(nextTotalDrills);
      setCompletedWordAccuracy(avgAccuracy);
      setCompletedWordXp(totalWordXp);
      setWordCompletedModal(true);

      awardXp(totalWordXp, `Mastered Word: ${currentWord.word}`, {
        words_completed: nextWordsCompleted,
        accuracy_rate: updatedAccuracy,
        total_drills: nextTotalDrills
      });

      setTimeout(() => {
        isAdvancingRef.current = false;
      }, 1000);
    }
  }, [awardXp]);

  const mpHandsRef = useRef(null);
  const mpCameraRef = useRef(null);

  // Sandbox Camera Lifecycle Functions
  const stopSandboxCamera = useCallback(() => {
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
    setSandboxCameraActive(false);
    setCameraLoading(false);
    setHandDetected(false);
    setDetectedLetter('—');
    setLiveAccuracy(0);
    setHoldProgress(0);
    consecutiveMatchesRef.current = 0;
  }, []);

  const startSandboxCamera = useCallback(async () => {
    setCameraError(null);
    setCameraLoading(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera API not supported in this browser.');
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
        await videoRef.current.play();
      }
      setSandboxCameraActive(true);
      setSandboxSimMode(false);
      setCameraLoading(false);

      // Initialize MediaPipe Hands if available
      if (window.Hands) {
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

          // Draw mirrored camera feed
          ctx.save();
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          ctx.restore();

          if (results.multiHandLandmarks?.length > 0) {
            const rawLm = results.multiHandLandmarks[0];
            setHandDetected(true);

            // Draw user's actual detected landmarks and skeleton
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = '#3ddc84';
            handBones.forEach(([i1, i2]) => {
              const p1 = rawLm[i1];
              const p2 = rawLm[i2];
              if (p1 && p2) {
                ctx.beginPath();
                ctx.moveTo((1 - p1.x) * canvas.width, p1.y * canvas.height);
                ctx.lineTo((1 - p2.x) * canvas.width, p2.y * canvas.height);
                ctx.stroke();
              }
            });

            rawLm.forEach((pt, idx) => {
              const isTip = idx === 0 || idx % 4 === 0;
              ctx.beginPath();
              ctx.arc((1 - pt.x) * canvas.width, pt.y * canvas.height, isTip ? 5 : 3, 0, 2 * Math.PI);
              ctx.fillStyle = isTip ? '#FFD700' : '#FFFFFF';
              ctx.fill();
              ctx.strokeStyle = '#703F37';
              ctx.lineWidth = 1;
              ctx.stroke();
            });

            // Normalize and evaluate against target letter for human intelligibility
            const norm = normalizeLandmarks(rawLm);
            const targetChar = currentTargetLetterRef.current;
            const { accuracy, predictedLetter, understood } = evaluateLandmarks(norm, targetChar);

            setLiveAccuracy(accuracy);
            setDetectedLetter(predictedLetter);

            // Hold detection: Only triggers when the CURRENT target letter is genuinely matched and held for ~0.35s (5 frames)
            if (understood && !isAdvancingRef.current) {
              consecutiveMatchesRef.current += 1;
              setHoldProgress(Math.min(100, consecutiveMatchesRef.current * 20));

              if (consecutiveMatchesRef.current >= 5) {
                consecutiveMatchesRef.current = 0;
                handleConfirmSandboxLetter(accuracy);
              }
            } else {
              consecutiveMatchesRef.current = 0;
              setHoldProgress(0);
            }
          } else {
            // No hand currently visible
            setHandDetected(false);
            setDetectedLetter('—');
            setLiveAccuracy(0);
            setHoldProgress(0);
            consecutiveMatchesRef.current = 0;

            // Draw guide reticle when hand is not yet detected
            const boxW = Math.min(canvas.width * 0.46, 280);
            const boxH = Math.min(canvas.height * 0.65, 340);
            const boxX = (canvas.width - boxW) / 2;
            const boxY = (canvas.height - boxH) / 2;

            ctx.strokeStyle = 'rgba(230, 14, 126, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([8, 8]);
            ctx.strokeRect(boxX, boxY, boxW, boxH);
            ctx.setLineDash([]);
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
      console.warn('[Sandbox] Camera access failed:', err.message);
      setCameraLoading(false);
      setCameraError(err.message || 'Camera permission denied or camera is in use by another app.');
      setSandboxSimMode(true);
    }
  }, [normalizeLandmarks, evaluateLandmarks, currentTargetLetter, handleConfirmSandboxLetter]);


  // Stop camera when leaving sandbox tab
  useEffect(() => {
    if (activeTab !== 'sandbox') {
      stopSandboxCamera();
    }
    return () => {
      stopSandboxCamera();
    };
  }, [activeTab, stopSandboxCamera]);

  // Auth Protection Gate: Require sign in to access Playground
  if (!user) {
    return (
      <section className="view active profile-view-section">
        <AuthRequiredGate
          onOpenAuth={onOpenAuth}
          title="Sign In Required to Enter ASL Playground"
          desc="Sign in to save your study progress, earn XP, track mastery streaks, and build your personalized sign language expertise tier."
        />
      </section>
    );
  }

  return (
    <section className="playground-page-wrapper">
      {/* 1. Gamified XP & Mastery HUD Header */}
      <div className="playground-hud-card">
        <div className="hud-left-meta">
          <div className="hud-level-badge">
            <TrophyIcon size={18} />
            <span>LVL {level} · {expertiseTier.toUpperCase()}</span>
          </div>

          <div className="hud-xp-details">
            <div className="hud-xp-row">
              <strong>{xp} Total XP</strong>
              <span className="hud-xp-sub">{xpToNextLevel} XP to Level {level + 1}</span>
            </div>
            <div className="hud-xp-track">
              <div
                className="hud-xp-fill"
                style={{ width: `${currentLevelXp}%` }}
              />
            </div>
          </div>
        </div>

        <div className="hud-right-stats">
          {/* Dynamic XP Gain Pill Popup */}
          {recentXpGain && (
            <div className="xp-gain-bubble">
              <ZapIcon size={13} />
              <span>+{recentXpGain.amount} XP · {recentXpGain.reason}</span>
            </div>
          )}

          <div className="hud-stat-pill streak-pill" title="Daily study streak">
            <FlameIcon size={16} />
            <span>{streak} Day Streak</span>
          </div>

          <div className="hud-stat-pill accuracy-pill" title="Synchronized ASL precision accuracy">
            <AwardIcon size={15} />
            <span>{typeof accuracyRate === 'number' ? `${accuracyRate.toFixed(1)}%` : '100.0%'} Accuracy</span>
          </div>

          <button
            type="button"
            className="hud-stat-pill ach-pill"
            onClick={() => setAchievementsModalOpen(true)}
            title="View unlocked badges"
          >
            <SparklesIcon size={15} />
            <span>Badges ({unlockedAchievements.length}/{achievementsList.length})</span>
          </button>
        </div>
      </div>

      {/* 2. Main Tabbed Navigation */}
      <div className="playground-nav-bar">
        <div className="playground-tabs-group">
          <button
            type="button"
            className={`playground-tab ${activeTab === 'dictionary' ? 'active' : ''}`}
            onClick={() => setActiveTab('dictionary')}
          >
            <PlatformIcon size={16} />
            <span>A–Z Landmark Lab</span>
          </button>

          <button
            type="button"
            className={`playground-tab ${activeTab === 'quiz' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('quiz');
              if (quizState === 'idle') startQuiz();
            }}
          >
            <TargetIcon size={16} />
            <span>Speed Drill Quiz</span>
          </button>

          <button
            type="button"
            className={`playground-tab ${activeTab === 'sandbox' ? 'active' : ''}`}
            onClick={() => setActiveTab('sandbox')}
          >
            <ZapIcon size={16} />
            <span>Live Accuracy Sandbox</span>
          </button>
        </div>

        <div className="playground-mode-desc">
          <span>
            {activeTab === 'dictionary'
              ? 'Study 21-point hand anatomy and finger configurations for each letter.'
              : activeTab === 'quiz'
              ? 'Test reflex recognition with rapid-fire 30s challenges.'
              : 'Interactive camera-powered word spelling practice with real-time accuracy scoring.'}
          </span>
        </div>
      </div>

      {/* 3. TAB 1: A-Z Landmark Lab */}
      {activeTab === 'dictionary' && (
        <div className="pg-lab-layout">
          {/* Left Column: Interactive Letter Selector Grid with Category Filter */}
          <div className="pg-alphabet-grid-pane">
            <div className="pane-head-row">
              <h3>Select a Letter to Inspect</h3>
              <span className="pane-counter">
                {practicedLetters.length}/{aslAlphabet.length} Mastered
              </span>
            </div>

            {/* Category Filter Pills */}
            <div className="pg-category-filters">
              {['ALL', 'Vowels', 'Flat', 'Horizontal', 'Advanced'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`pg-cat-btn ${categoryFilter === cat ? 'active' : ''}`}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat === 'ALL' ? 'All Letters' : cat}
                </button>
              ))}
            </div>

            <div className="asl-letter-cards-grid">
              {filteredLetters.map((item) => {
                const isSelected = selectedLetter.letter === item.letter;
                const isPracticed = practicedLetters.includes(item.letter);

                return (
                  <button
                    key={item.letter}
                    type="button"
                    className={`asl-letter-btn ${isSelected ? 'selected' : ''} ${isPracticed ? 'practiced' : ''}`}
                    onClick={() => handleSelectLetter(item)}
                  >
                    <span className="btn-letter-glyph">{item.letter}</span>
                    <span className="btn-letter-xp">+{item.xp} XP</span>
                    {isPracticed && (
                      <span className="practiced-check">
                        <CheckIcon size={11} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: 21-Point Landmark Hologram Stage & Anatomy Details */}
          <div className="pg-inspector-pane">
            <div className="inspector-head">
              <div className="inspector-title-row">
                <div className="letter-large-pill">{selectedLetter.letter}</div>
                <div>
                  <h4>Letter {selectedLetter.letter} Handshape</h4>
                  <span className="category-pill-tag">{selectedLetter.category}</span>
                </div>
              </div>

              <div className="inspector-actions">
                <button
                  type="button"
                  className="btn btn-outline mini-btn"
                  onClick={() => speakPhonetic(`Letter ${selectedLetter.letter}. ${selectedLetter.hint}`)}
                  title="Pronounce letter"
                >
                  <VolumeIcon size={14} />
                  <span>Pronounce</span>
                </button>
              </div>
            </div>

            {/* 21-Point SVG Hand Landmark Anatomy Mesh */}
            <div className="inspector-mesh-viewport">
              <svg viewBox="0 0 100 100" className="pg-hand-svg">
                {/* Bone Lines */}
                {handBones.map(([from, to], idx) => (
                  <line
                    key={`b-${idx}`}
                    x1={selectedLetter.landmarks[from]?.x || 50}
                    y1={selectedLetter.landmarks[from]?.y || 50}
                    x2={selectedLetter.landmarks[to]?.x || 50}
                    y2={selectedLetter.landmarks[to]?.y || 50}
                    className="pg-bone-line"
                  />
                ))}

                {/* Landmark Keypoint Nodes with Hover Inspection */}
                {selectedLetter.landmarks.map((pt, idx) => (
                  <circle
                    key={`p-${idx}`}
                    cx={pt.x}
                    cy={pt.y}
                    r={idx === 0 || idx % 4 === 0 ? 3.4 : 2.0}
                    className={`pg-node-point ${idx % 4 === 0 ? 'node-tip' : ''} ${hoveredNodeIndex === idx ? 'node-hovered' : ''}`}
                    onMouseEnter={() => setHoveredNodeIndex(idx)}
                    onMouseLeave={() => setHoveredNodeIndex(null)}
                  />
                ))}
              </svg>

              <div className="mesh-overlay-badge">
                <span className="mesh-dot" />
                <span>
                  {hoveredNodeIndex !== null
                    ? LANDMARK_NAMES[hoveredNodeIndex]
                    : '21-POINT MEDIAPIPE TOPOLOGY'}
                </span>
              </div>
            </div>

            {/* Finger Configuration Guide */}
            <div className="inspector-details-card">
              <div className="detail-row">
                <strong>Anatomy Guidance:</strong>
                <p>{selectedLetter.hint}</p>
              </div>

              <div className="detail-row">
                <strong>Linguistic Context:</strong>
                <p>{selectedLetter.funFact}</p>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary pg-practice-cta"
              onClick={() => handleSelectLetter(selectedLetter)}
            >
              <CheckIcon size={16} />
              <span>Mark Letter {selectedLetter.letter} as Mastered (+{selectedLetter.xp} XP)</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. TAB 2: Speed Drill Quiz */}
      {activeTab === 'quiz' && (
        <div className="pg-quiz-container">
          <div className="quiz-status-ribbon">
            <div className="quiz-status-item">
              <span className="status-label">Time Remaining:</span>
              <strong className={`status-val timer-val ${quizTimer <= 5 ? 'timer-urgency' : ''}`}>
                {quizTimer}s
              </strong>
            </div>

            <div className="quiz-status-item">
              <span className="status-label">Score:</span>
              <strong className="status-val">{quizScore} PTS</strong>
            </div>

            <div className="quiz-status-item">
              <span className="status-label">Best Record:</span>
              <strong className="status-val">{quizHighScore} PTS</strong>
            </div>

            <div className="quiz-status-item">
              <span className="status-label">Combo:</span>
              <strong className="status-val highlight">x{Math.max(1, quizCombo)}</strong>
            </div>
          </div>

          {quizState === 'running' && quizQuestion && (
            <div className="quiz-stage-card">
              <span className="quiz-prompt-kicker">IDENTIFY THE SIGN</span>
              <h3>Which letter corresponds to this 21-point handshape?</h3>

              {/* Wireframe Hand Mesh to Recognize */}
              <div className="quiz-mesh-box">
                <svg viewBox="0 0 100 100" className="pg-hand-svg quiz-svg">
                  {handBones.map(([from, to], idx) => (
                    <line
                      key={`qb-${idx}`}
                      x1={quizQuestion.target.landmarks[from]?.x || 50}
                      y1={quizQuestion.target.landmarks[from]?.y || 50}
                      x2={quizQuestion.target.landmarks[to]?.x || 50}
                      y2={quizQuestion.target.landmarks[to]?.y || 50}
                      className="pg-bone-line"
                    />
                  ))}
                  {quizQuestion.target.landmarks.map((pt, idx) => (
                    <circle
                      key={`qp-${idx}`}
                      cx={pt.x}
                      cy={pt.y}
                      r={idx === 0 || idx % 4 === 0 ? 3.4 : 2.0}
                      className={`pg-node-point ${idx % 4 === 0 ? 'node-tip' : ''}`}
                    />
                  ))}
                </svg>
              </div>

              {/* Choice Options Grid */}
              <div className="quiz-options-grid">
                {quizQuestion.options.map((opt) => {
                  const isChosen = selectedAnswer?.letter === opt.letter;
                  const isCorrect = opt.letter === quizQuestion.target.letter;

                  let optClass = 'quiz-option-btn';
                  if (selectedAnswer) {
                    if (isCorrect) optClass += ' option-correct';
                    else if (isChosen) optClass += ' option-incorrect';
                  }

                  return (
                    <button
                      key={opt.letter}
                      type="button"
                      className={optClass}
                      onClick={() => handleAnswerSelect(opt)}
                      disabled={selectedAnswer !== null}
                    >
                      <span className="opt-letter">{opt.letter}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {quizState === 'completed' && (
            <div className="quiz-summary-card">
              <TrophyIcon size={48} className="summary-trophy-icon" />
              <h3>Drill Complete!</h3>
              <p>You scored <strong>{quizScore} points</strong> with <strong>{quizCorrectCount}/{quizTotalAnswers}</strong> accuracy.</p>
              <div className="summary-actions-row">
                <button type="button" className="btn btn-primary" onClick={startQuiz}>
                  <RotateCwIcon size={15} />
                  <span>Play Again</span>
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setActiveTab('dictionary')}>
                  <span>Back to Lab</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}


      {/* 6. TAB 4: Live Accuracy Sandbox */}
      {activeTab === 'sandbox' && (
        <div className="pg-sandbox-container">
          {/* Word Challenge Selector Ribbon */}
          <div className="sandbox-challenge-ribbon">
            <div className="ribbon-label-wrap">
              <SparklesIcon size={16} />
              <span className="ribbon-label">Select Practice Word Challenge:</span>
            </div>
            <div className="sandbox-word-chips">
              {wordChallenges.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  className={`sandbox-word-chip ${sandboxWord.id === w.id ? 'active' : ''}`}
                  onClick={() => handleSelectSandboxWord(w)}
                >
                  <strong className="chip-word">{w.word}</strong>
                  <span className="chip-xp">+{w.xpReward} XP</span>
                  <span className="chip-diff">{w.level}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main 2-Column Practice Arena */}
          <div className="pg-sandbox-arena">
            {/* Left Column: Live Camera Video Stream & Canvas HUD */}
            <div className="sandbox-camera-card">
              <div className="sandbox-card-header">
                <div className="camera-header-left">
                  <div className="camera-live-badge">
                    <span className={`live-pulse-dot ${sandboxCameraActive ? 'active' : ''}`} />
                    <strong>{sandboxCameraActive ? 'Live Camera Feed' : 'Camera Standby'}</strong>
                  </div>
                  <span className="model-status-tag">
                    {modelServerOnline ? 'Local ML Engine ✓' : 'In-Browser Geometry Matcher ✓'}
                  </span>
                </div>

                <div className="camera-header-actions">
                  {!sandboxCameraActive ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={startSandboxCamera}
                      disabled={cameraLoading}
                    >
                      {cameraLoading ? <SpinnerIcon size={14} /> : <CameraIcon size={14} />}
                      <span>{cameraLoading ? 'Starting...' : 'Start Camera'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={stopSandboxCamera}
                    >
                      <CloseIcon size={14} />
                      <span>Stop Camera</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Viewport Area */}
              <div className="sandbox-viewport-frame">
                {/* Hidden video element for WebRTC frame capture */}
                <video
                  ref={videoRef}
                  className="sandbox-native-video"
                  playsInline
                  muted
                  autoPlay
                />

                {/* Overlay Canvas with Hand Landmarks and Scanning Reticle */}
                {sandboxCameraActive ? (
                  <canvas ref={canvasRef} className="sandbox-render-canvas" />
                ) : (
                  <div className="sandbox-empty-cam-hero">
                    <div className="empty-cam-icon-wrap">
                      <CameraIcon size={40} />
                    </div>
                    <h4>Webcam Standby</h4>
                    <p>
                      Enable your camera to practice signing <strong>"{sandboxWord.word}"</strong> in real-time.
                      SignSpeak evaluates 21 hand keypoints on-device with zero video recording.
                    </p>
                    {cameraError && (
                      <div className="camera-error-banner">
                        <AlertTriangleIcon size={15} />
                        <span>{cameraError}</span>
                      </div>
                    )}
                    <div className="empty-cam-btn-row">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={startSandboxCamera}
                        disabled={cameraLoading}
                      >
                        {cameraLoading ? <SpinnerIcon size={16} /> : <CameraIcon size={16} />}
                        <span>{cameraLoading ? 'Requesting Camera...' : 'Enable Live Camera'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Real-time HUD Telemetry Overlays */}
                {sandboxCameraActive && (
                  <div className="sandbox-viewport-hud">
                    <div className="hud-metric-pill target-pill">
                      <TargetIcon size={13} />
                      <span>TARGET: <strong>{currentTargetLetter}</strong></span>
                    </div>

                    <div className="hud-metric-pill accuracy-hud-pill">
                      <ZapIcon size={13} />
                      <span>MATCH: <strong>{liveAccuracy}%</strong></span>
                    </div>

                    <div className="hud-metric-pill detected-pill">
                      <span className="live-dot" />
                      <span>DETECTED: <strong>{detectedLetter}</strong></span>
                    </div>
                  </div>
                )}

                {/* Live Hold Stability Progress Overlay */}
                {holdProgress > 0 && (
                  <div className="sandbox-hold-indicator">
                    <div className="hold-indicator-card">
                      <div className="hold-text-row">
                        <span>Holding Sign "{currentTargetLetter}"...</span>
                        <strong>{holdProgress}%</strong>
                      </div>
                      <div className="hold-track">
                        <div className="hold-fill" style={{ width: `${holdProgress}%` }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera Card Footer Controls */}
              <div className="sandbox-footer-controls">
                <div className="footer-tips-text">
                  <InfoIcon size={14} />
                  <span>Tip: Place your hand inside the camera frame in good lighting. Sign each letter clearly to advance.</span>
                </div>
              </div>
            </div>

            {/* Right Column: Word Challenge Progress & Target Anatomy Guide */}
            <div className="sandbox-guide-col">
              {/* Word Spelling Track Card */}
              <div className="sandbox-word-progress-card">
                <div className="word-progress-head">
                  <div>
                    <span className="card-kicker">CHALLENGE WORD</span>
                    <h3>Spell "{sandboxWord.word}" in ASL</h3>
                    <p className="word-meaning-sub">{sandboxWord.meaning}</p>
                  </div>
                  <span className="word-diff-tag">{sandboxWord.level}</span>
                </div>

                {/* Letter Step Blocks */}
                <div className="word-spelling-blocks">
                  {sandboxWord.letters.map((char, idx) => {
                    const isPassed = idx < sandboxStep;
                    const isCurrent = idx === sandboxStep;
                    return (
                      <div
                        key={idx}
                        className={`spell-block-item ${isCurrent ? 'current' : ''} ${isPassed ? 'passed' : ''}`}
                      >
                        <span className="block-letter">{char}</span>
                        <span className="block-step">
                          {isPassed ? '✓' : `#${idx + 1}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* If Word is Completed, show Inline Celebration Card */}
              {wordCompletedModal ? (
                <div className="sandbox-target-blueprint-card word-mastered-inline-card">
                  <div className="celebrate-badge-icon">
                    <TrophyIcon size={36} />
                  </div>

                  <h3>Word Mastered: {sandboxWord.word}!</h3>
                  <p className="celebrate-sub">
                    You signed all {sandboxWord.letters.length} letters of <strong>"{sandboxWord.word}"</strong>.
                  </p>

                  <div className="celebrate-stats-grid">
                    <div className="cel-stat-box">
                      <span className="cel-stat-label">Accuracy</span>
                      <strong className="cel-stat-val highlight-green">{completedWordAccuracy}%</strong>
                      <span className="cel-stat-sub">Intelligible</span>
                    </div>

                    <div className="cel-stat-box">
                      <span className="cel-stat-label">XP Earned</span>
                      <strong className="cel-stat-val">+{completedWordXp} XP</strong>
                      <span className="cel-stat-sub">Saved to Profile</span>
                    </div>

                    <div className="cel-stat-box">
                      <span className="cel-stat-label">Profile Score</span>
                      <strong className="cel-stat-val">{accuracyRate.toFixed(1)}%</strong>
                      <span className="cel-stat-sub">Overall Rating</span>
                    </div>
                  </div>

                  <div className="celebrate-actions-row">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        const currIdx = wordChallenges.findIndex((w) => w.id === sandboxWord.id);
                        const nextWord = wordChallenges[(currIdx + 1) % wordChallenges.length];
                        handleSelectSandboxWord(nextWord);
                      }}
                    >
                      <SparklesIcon size={16} />
                      <span>Next Word Challenge →</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => handleSelectSandboxWord(sandboxWord)}
                    >
                      <RotateCwIcon size={15} />
                      <span>Repeat "{sandboxWord.word}"</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Active Target Letter Blueprint Card */
                <div className="sandbox-target-blueprint-card">
                  <div className="blueprint-head">
                    <div className="blueprint-letter-badge">
                      <span className="blueprint-char">{currentTargetLetter}</span>
                    </div>
                    <div className="blueprint-meta">
                      <div className="blueprint-title-row">
                        <h4>Sign Letter "{currentTargetLetter}"</h4>
                        <button
                          type="button"
                          className="blueprint-audio-btn"
                          onClick={() => speakPhonetic(currentTargetLetter)}
                          title="Pronounce letter"
                        >
                          <VolumeIcon size={15} />
                        </button>
                      </div>
                      <span className="blueprint-cat">{targetLetterData.category}</span>
                    </div>
                  </div>

                  <div className="blueprint-instruction-box">
                    <strong>Hand Posture Instruction:</strong>
                    <p>{targetLetterData.hint}</p>
                  </div>

                  {/* Mini 21-point Landmark Guide SVG */}
                  <div className="blueprint-landmark-view">
                    <span className="landmark-view-label">21-Point Joint Geometry Reference:</span>
                    <div className="mini-landmark-svg-wrap">
                      <svg viewBox="0 0 100 100" className="mini-landmark-svg">
                        {handBones.map(([from, to], idx) => {
                          const p1 = targetLetterData.landmarks[from];
                          const p2 = targetLetterData.landmarks[to];
                          if (!p1 || !p2) return null;
                          return (
                            <line
                              key={`bp-bone-${idx}`}
                              x1={p1.x}
                              y1={p1.y}
                              x2={p2.x}
                              y2={p2.y}
                              className="bp-bone-line"
                            />
                          );
                        })}
                        {targetLetterData.landmarks.map((pt, idx) => {
                          const isTip = idx === 0 || idx % 4 === 0;
                          return (
                            <circle
                              key={`bp-pt-${idx}`}
                              cx={pt.x}
                              cy={pt.y}
                              r={isTip ? 3.5 : 2.0}
                              className={`bp-pt-node ${isTip ? 'tip' : ''}`}
                            />
                          );
                        })}
                      </svg>
                    </div>
                  </div>

                  {/* Precision Score & Telemetry Box */}
                  <div className="blueprint-score-box">
                    <div className="score-box-row">
                      <span className="score-label">Readability Match:</span>
                      <strong className="score-val highlight-green">
                        {liveAccuracy > 0 ? `${liveAccuracy}%` : 'Waiting for hand...'}
                      </strong>
                    </div>
                    <div className="score-meter-track">
                      <div
                        className="score-meter-fill"
                        style={{
                          width: `${liveAccuracy}%`,
                          backgroundColor: liveAccuracy >= 80 ? 'var(--sdg-pink)' : liveAccuracy >= 60 ? 'var(--rose)' : 'var(--sand)'
                        }}
                      />
                    </div>
                    <span className="score-sync-sub">
                      Profile Accuracy Score: <strong>{accuracyRate.toFixed(1)}%</strong>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. Achievements Modal */}
      {achievementsModalOpen && (
        <div className="auth-overlay" onClick={() => setAchievementsModalOpen(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="close-auth"
              onClick={() => setAchievementsModalOpen(false)}
            >
              <CloseIcon size={16} />
            </button>

            <div className="auth-head">
              <div className="prompt-icon-wrap">
                <TrophyIcon size={24} />
              </div>
              <h3>Mastery Badges</h3>
              <p>Earn XP across the Playground to unlock recognized ASL credentials stored in your profile.</p>
            </div>

            <div className="achievements-list-grid">
              {achievementsList.map((ach) => {
                const isUnlocked = unlockedAchievements.includes(ach.id);
                return (
                  <div
                    key={ach.id}
                    className={`achievement-card-item ${isUnlocked ? 'unlocked' : 'locked'}`}
                  >
                    <div className="ach-badge-icon">
                      {isUnlocked ? <TrophyIcon size={18} /> : <ShieldIcon size={18} />}
                    </div>
                    <div className="ach-text">
                      <div className="ach-title-row">
                        <strong>{ach.title}</strong>
                        <span className="ach-xp-tag">{ach.xpRequired} XP</span>
                      </div>
                      <p>{ach.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
