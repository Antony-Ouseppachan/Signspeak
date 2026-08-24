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
  SpinnerIcon
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
  const [activeTab, setActiveTab] = useState('dictionary'); // 'dictionary' | 'quiz' | 'words' | 'sandbox'
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

  // Word Spelling State
  const [selectedWord, setSelectedWord] = useState(wordChallenges[0]);
  const [spellingIndex, setSpellingIndex] = useState(0);
  const [spelledLetters, setSpelledLetters] = useState([]);
  const [wordSuccess, setWordSuccess] = useState(false);

  // Sandbox Live Recognition Simulator
  const [sandboxLetter, setSandboxLetter] = useState('A');
  const [sandboxConfidence, setSandboxConfidence] = useState(98.4);
  const [sandboxJitter, setSandboxJitter] = useState(0);

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

  // Word Spelling Advance
  function handleSelectWord(w) {
    setSelectedWord(w);
    setSpellingIndex(0);
    setSpelledLetters([]);
    setWordSuccess(false);
  }

  function handleAdvanceWordSpell() {
    if (!selectedWord) return;
    const currentTargetLetter = selectedWord.letters[spellingIndex];
    speakPhonetic(currentTargetLetter);
    playTone('success');

    const nextSpelled = [...spelledLetters, currentTargetLetter];
    setSpelledLetters(nextSpelled);

    if (spellingIndex + 1 >= selectedWord.letters.length) {
      setWordSuccess(true);
      const nextWordsCompleted = wordsCompleted + 1;
      setWordsCompleted(nextWordsCompleted);
      speakPhonetic(`Excellent! You spelled ${selectedWord.word}`);
      awardXp(selectedWord.xpReward, `Completed Word: ${selectedWord.word}`, {
        words_completed: nextWordsCompleted
      });
    } else {
      setSpellingIndex((prev) => prev + 1);
    }
  }

  // Live Sandbox Simulation Effect
  useEffect(() => {
    if (activeTab === 'sandbox') {
      const interval = setInterval(() => {
        setSandboxConfidence(+(97.2 + Math.random() * 2.5).toFixed(1));
        setSandboxJitter((prev) => (prev + 1) % 100);
      }, 800);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

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
            className={`playground-tab ${activeTab === 'words' ? 'active' : ''}`}
            onClick={() => setActiveTab('words')}
          >
            <SparklesIcon size={16} />
            <span>Word Studio</span>
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
              : activeTab === 'words'
              ? 'Spell real-world vocabulary sign-by-sign.'
              : 'Interactive Euclidean distance landmark matcher with audio speech output.'}
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

      {/* 5. TAB 3: Word Studio */}
      {activeTab === 'words' && (
        <div className="pg-words-container">
          {/* Word Selector Chips */}
          <div className="word-selector-ribbon">
            <span className="word-ribbon-label">Select Challenge:</span>
            <div className="word-chips-list">
              {wordChallenges.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  className={`word-challenge-chip ${selectedWord.id === w.id ? 'active' : ''}`}
                  onClick={() => handleSelectWord(w)}
                >
                  <strong>{w.word}</strong>
                  <span className="word-reward-tag">+{w.xpReward} XP</span>
                </button>
              ))}
            </div>
          </div>

          <div className="word-stage-card">
            <div className="word-spelling-header">
              <div>
                <h3>Spell "{selectedWord.word}" in ASL</h3>
                <p>{selectedWord.meaning}</p>
              </div>
              <span className="word-difficulty-badge">{selectedWord.level}</span>
            </div>

            {/* Letter Spelling Blocks */}
            <div className="spelling-blocks-row">
              {selectedWord.letters.map((char, idx) => {
                const isCurrent = idx === spellingIndex && !wordSuccess;
                const isPassed = idx < spellingIndex || wordSuccess;

                return (
                  <div
                    key={idx}
                    className={`spell-block ${isCurrent ? 'current' : ''} ${isPassed ? 'passed' : ''}`}
                  >
                    <span className="spell-char">{char}</span>
                    <span className="spell-num">#{idx + 1}</span>
                  </div>
                );
              })}
            </div>

            {/* Current Target Letter Preview */}
            {!wordSuccess ? (
              <div className="current-spell-focus">
                <p className="spell-instruction">
                  Form the letter <strong>{selectedWord.letters[spellingIndex]}</strong> with your hand:
                </p>

                <button
                  type="button"
                  className="btn btn-primary spell-next-btn"
                  onClick={handleAdvanceWordSpell}
                >
                  <CheckIcon size={16} />
                  <span>
                    Confirm Sign "{selectedWord.letters[spellingIndex]}" (Step {spellingIndex + 1}/{selectedWord.letters.length})
                  </span>
                </button>
              </div>
            ) : (
              <div className="word-success-banner">
                <SparklesIcon size={32} />
                <h4>Word Mastered: {selectedWord.word}!</h4>
                <p>Awarded <strong>+{selectedWord.xpReward} XP</strong> to your profile.</p>
                <button
                  type="button"
                  className="btn btn-outline mini-btn"
                  onClick={() => handleSelectWord(selectedWord)}
                >
                  <RotateCwIcon size={14} />
                  <span>Practice Again</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. TAB 4: Live Accuracy Sandbox */}
      {activeTab === 'sandbox' && (
        <div className="pg-sandbox-layout">
          <div className="sandbox-stream-card">
            <div className="sandbox-stream-header">
              <div>
                <h4>Live MediaPipe Vector Matcher</h4>
                <p>On-device mathematical Euclidean distance classifier simulation.</p>
              </div>
              <div className="sandbox-confidence-badge">
                <span>CONFIDENCE: {sandboxConfidence}%</span>
              </div>
            </div>

            <div className="sandbox-stream-canvas">
              {/* Synthetic Camera Landmark Overlay */}
              <div className="sandbox-camera-grid" />
              <svg viewBox="0 0 100 100" className="pg-hand-svg sandbox-svg">
                {handBones.map(([from, to], idx) => {
                  const targetObj = aslAlphabet.find((a) => a.letter === sandboxLetter) || aslAlphabet[0];
                  return (
                    <line
                      key={`sb-${idx}`}
                      x1={targetObj.landmarks[from]?.x || 50}
                      y1={targetObj.landmarks[from]?.y || 50}
                      x2={targetObj.landmarks[to]?.x || 50}
                      y2={targetObj.landmarks[to]?.y || 50}
                      className="pg-bone-line"
                    />
                  );
                })}
                {(aslAlphabet.find((a) => a.letter === sandboxLetter) || aslAlphabet[0]).landmarks.map((pt, idx) => (
                  <circle
                    key={`sp-${idx}`}
                    cx={pt.x + (Math.sin(sandboxJitter + idx) * 0.6)}
                    cy={pt.y + (Math.cos(sandboxJitter + idx) * 0.6)}
                    r={idx === 0 || idx % 4 === 0 ? 3.4 : 2.0}
                    className={`pg-node-point ${idx % 4 === 0 ? 'node-tip' : ''}`}
                  />
                ))}
              </svg>

              <div className="sandbox-hud-overlay">
                <div className="hud-metric-pill">
                  <span className="live-dot" />
                  <span>PREDICTED LETTER: {sandboxLetter}</span>
                </div>
                <div className="hud-metric-pill">
                  <span>LATENCY: 14.2ms</span>
                </div>
              </div>
            </div>

            <div className="sandbox-controls-row">
              <span className="controls-label">Test Different Handshape Coordinates:</span>
              <div className="sandbox-letter-pills">
                {['A', 'B', 'C', 'D', 'E', 'F', 'L', 'V', 'W', 'Y'].map((l) => (
                  <button
                    key={l}
                    type="button"
                    className={`sandbox-letter-btn ${sandboxLetter === l ? 'active' : ''}`}
                    onClick={() => {
                      setSandboxLetter(l);
                      speakPhonetic(l);
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
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
              ✕
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
