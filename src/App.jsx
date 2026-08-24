import { useEffect, useState } from 'react';
import Logo from './components/Logo.jsx';
import HandStage from './components/HandStage.jsx';
import InteractiveDemo from './components/InteractiveDemo.jsx';
import ArchitectureFlow from './components/ArchitectureFlow.jsx';
import QuickstartTerminal from './components/QuickstartTerminal.jsx';
import FaqSection from './components/FaqSection.jsx';
import ChatAssistant from './components/ChatAssistant.jsx';
import { ContactForm, FeedbackForm } from './components/Forms.jsx';
import Sdg10Icon from './components/Sdg10Icon.jsx';
import ProfileView from './components/ProfileView.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import { useAuth } from './context/AuthContext.jsx';
import {
  LatencyIcon,
  LandmarkIcon,
  AlphabetIcon,
  ShieldIcon,
  PrivacyIcon,
  PlatformIcon,
  ContactIcon,
  FeedbackIcon,
  HudIcon,
  BrainIcon,
  SparklesIcon,
  CheckIcon,
  GoogleIcon,
  UserIcon,
  LogOutIcon,
  SpinnerIcon,
  CloseIcon,
  EyeIcon,
  EyeOffIcon,
  ExtensionIcon,
  PlaygroundIcon
} from './components/Icons.jsx';
import PlaygroundView from './components/PlaygroundView.jsx';
import { metrics, featureModules, comparisonPoints, sdgGoals, limitations } from './data/content.js';

function MetricIcon({ name }) {
  switch (name) {
    case 'latency':
      return <LatencyIcon size={20} />;
    case 'landmarks':
      return <LandmarkIcon size={20} />;
    case 'alphabet':
      return <AlphabetIcon size={20} />;
    case 'shield':
      return <ShieldIcon size={20} />;
    case 'privacy':
      return <PrivacyIcon size={20} />;
    default:
      return <ShieldIcon size={20} />;
  }
}

function FeatureIcon({ name }) {
  switch (name) {
    case 'hud':
      return <HudIcon size={22} />;
    case 'brain':
      return <BrainIcon size={22} />;
    case 'shield':
      return <ShieldIcon size={22} />;
    case 'sparkles':
      return <SparklesIcon size={22} />;
    default:
      return <SparklesIcon size={22} />;
  }
}

function Splash({ onDismiss }) {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2500; // 2.5s progress + 500ms fade = 3.0s total

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setFading(true);
      }
    }, 20);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (fading) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [fading, onDismiss]);

  // Guaranteed fallback dismiss so page never hangs
  useEffect(() => {
    const fallback = setTimeout(() => {
      onDismiss();
    }, 3200);
    return () => clearTimeout(fallback);
  }, [onDismiss]);

  // 21 Precision MediaPipe Hand Landmark coordinates (ASL Gesture)
  const handLandmarks = [
    { x: 50, y: 92 }, // 0: Wrist
    { x: 34, y: 78 }, { x: 22, y: 64 }, { x: 14, y: 50 }, { x: 8, y: 38 },   // 1-4: Thumb
    { x: 38, y: 46 }, { x: 34, y: 30 }, { x: 32, y: 18 }, { x: 30, y: 6 },   // 5-8: Index
    { x: 50, y: 44 }, { x: 50, y: 28 }, { x: 50, y: 14 }, { x: 50, y: 2 },   // 9-12: Middle
    { x: 62, y: 46 }, { x: 66, y: 30 }, { x: 68, y: 18 }, { x: 70, y: 8 },   // 13-16: Ring
    { x: 74, y: 52 }, { x: 80, y: 40 }, { x: 86, y: 30 }, { x: 92, y: 18 }   // 17-20: Pinky
  ];

  const handBones = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [5, 9], [9, 10], [10, 11], [11, 12],
    [9, 13], [13, 14], [14, 15], [15, 16],
    [13, 17], [17, 18], [18, 19], [19, 20],
    [0, 17]
  ];

  // Precision Audio Spectrum Frequency Bands
  const spectrumBars = [16, 32, 54, 76, 95, 82, 60, 88, 100, 72, 48, 85, 62, 38, 24, 14];

  return (
    <div className={`splash ${fading ? 'fade-out' : ''}`}>
      {/* 1. Fullscreen Ambient Aurora & Atmospheric Depth */}
      <div className="splash-aurora-blob blob-1" />
      <div className="splash-aurora-blob blob-2" />
      <div className="splash-aurora-blob blob-3" />
      <div className="splash-aurora-blob blob-4" />

      {/* 2. Floating Professional Feature Tags (Strictly No Emojis) */}
      <div className="splash-asl-floating-glyphs">
        <div className="asl-float-chip chip-1">
          <span className="chip-dot" />
          <span>ASL RECOGNITION</span>
        </div>
        <div className="asl-float-chip chip-2">
          <span className="chip-dot" />
          <span>21 LANDMARKS</span>
        </div>
        <div className="asl-float-chip chip-3">
          <span className="chip-dot" />
          <span>ON-DEVICE ML</span>
        </div>
        <div className="asl-float-chip chip-4">
          <span className="chip-dot" />
          <span>VOICE SYNTHESIS</span>
        </div>
      </div>

      {/* 3. Left Stage: Precision 21-Point Hand Landmark Neural Wireframe */}
      <div className="splash-sign-hand-stage">
        <div className="hand-scan-beam" />
        <svg viewBox="0 0 100 100" className="splash-hand-svg">
          <defs>
            <linearGradient id="boneGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#C29591" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#703F37" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          {handBones.map(([from, to], idx) => (
            <line
              key={idx}
              x1={handLandmarks[from].x}
              y1={handLandmarks[from].y}
              x2={handLandmarks[to].x}
              y2={handLandmarks[to].y}
              className="hand-bone-vector"
              style={{ animationDelay: `${idx * 0.04}s` }}
            />
          ))}
          {handLandmarks.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r={idx === 0 || idx % 4 === 0 ? 2.8 : 1.8}
              className={`hand-node-vector ${idx % 4 === 0 ? 'fingertip-node' : ''}`}
              style={{ animationDelay: `${idx * 0.03}s` }}
            />
          ))}
        </svg>
      </div>

      {/* 4. Right Stage: Acoustic Voice Spectrum Equalizer */}
      <div className="splash-speech-spectrum-stage">
        <div className="spectrum-bars-group">
          {spectrumBars.map((height, idx) => (
            <div
              key={idx}
              className="spectrum-bar"
              style={{
                '--bar-max-height': `${height}%`,
                animationDelay: `${idx * 0.06}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* 5. Center Translation Synapse Energy Stream */}
      <svg className="splash-synapse-stream" viewBox="0 0 1200 400" preserveAspectRatio="none">
        <path
          className="synapse-flow-path"
          d="M80,200 C380,70 820,330 1120,200"
        />
        <path
          className="synapse-flow-glow"
          d="M80,200 C380,70 820,330 1120,200"
        />
      </svg>

      {/* 6. Centerstage Ambient Branding */}
      <div className="splash-center-stage">
        <div className="splash-emblem-wrap">
          <div className="emblem-halo-pulse" />
          <div className="emblem-gyro-ring ring-1" />
          <div className="emblem-gyro-ring ring-2" />
          <div className="splash-emblem-core">
            <Logo className="splash-logo" />
          </div>
        </div>

        <h1 className="splash-title">
          <span className="title-shimmer">SignSpeak</span>
        </h1>
        <p className="splash-tagline">Real-Time Sign-to-Speech Accessibility</p>
      </div>

      {/* 7. Fullscreen Cinematic Bottom Loading Progress */}
      <div className="splash-bottom-bar-wrap">
        <div className="splash-progress-track">
          <div className="splash-progress-fill" style={{ width: `${progress}%` }}>
            <div className="progress-leading-flare" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero({ navigate }) {
  const [heroLetter, setHeroLetter] = useState('V');

  return (
    <section className="hero-section">
      <div className="hero-inner">
        <div className="hero-copy">
          <div className="eyebrow-pill">
            <span className="pill-dot" />
            <span>ACCESSIBILITY TECH · ON-DEVICE GOOGLE MEET INTEGRATION</span>
          </div>
          
          <h1 className="hero-title">
            Sign naturally in ASL.<br />
            They hear <span className="grad-accent">real-time speech.</span>
          </h1>

          <p className="hero-lede">
            SignSpeak tracks 21 hand landmarks directly in your browser. It classifies your sign language letters, spells words, and injects spoken audio into your Google Meet call in real time, with <strong>zero cloud transmission</strong>.
          </p>

          <div className="hero-actions">
            <button
              className="btn btn-primary hero-btn"
              onClick={() => {
                const el = document.getElementById('interactive-demo');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span>Try Live Simulator</span>
              <span className="btn-arrow">↓</span>
            </button>
            <button
              className="btn hero-btn-secondary"
              onClick={() => {
                const el = document.getElementById('architecture-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span>Explore Architecture</span>
              <span className="btn-arrow">→</span>
            </button>
          </div>

          <div className="hero-flowchip">
            {['Webcam 30FPS', '21 Landmarks', 'Wrist Norm', 'ML Classifier', 'Speech Synthesizer', 'Meet Audio Mic'].map((item, index) => (
              <span key={item} className="flowchip-item">
                <span className="step-chip">{item}</span>
                {index < 5 && <span className="flow-arrow">→</span>}
              </span>
            ))}
          </div>
        </div>

        <div className="hero-visual">
          <HandStage activeLetter={heroLetter} onSelectLetter={setHeroLetter} />
        </div>
      </div>
    </section>
  );
}

function MetricsBanner() {
  return (
    <section className="metrics-banner-section">
      <div className="metrics-grid">
        {metrics.map((item) => (
          <div key={item.label} className="metric-card">
            <div className="metric-icon">
              <MetricIcon name={item.icon} />
            </div>
            <div className="metric-value">{item.value}</div>
            <div className="metric-label">{item.label}</div>
            <div className="metric-sub">{item.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ComparisonSection() {
  return (
    <section className="section-block" id="comparison">
      <div className="section-header">
        <span className="section-kicker">WHY SIGNSPEAK</span>
        <h2>Overcoming the one-way transcript barrier in video calls.</h2>
        <p className="section-sub">
          Conventional closed-captioning tools only display text locally to the signer. SignSpeak breaks through by speaking directly into meeting audio for everyone in the call.
        </p>
      </div>

      <div className="comparison-cards-grid">
        {comparisonPoints.map((row) => (
          <div key={row.feature} className="comparison-card">
            <div className="comp-card-head">
              <span className="comp-category-tag">{row.category}</span>
              <h4>{row.feature}</h4>
            </div>

            <div className="comp-card-body">
              {/* Conventional Approach */}
              <div className="comp-side legacy-side">
                <div className="comp-side-header">
                  <span className="comp-side-badge legacy-badge">{row.traditionalStatus}</span>
                  <span className="comp-side-label">Conventional Captions</span>
                </div>
                <p>{row.traditional}</p>
              </div>

              {/* SignSpeak Approach */}
              <div className="comp-side speaks-side">
                <div className="comp-side-header">
                  <span className="comp-side-badge speaks-badge">{row.signspeakStatus}</span>
                  <span className="comp-side-label">SignSpeak Engine</span>
                </div>
                <p><strong>{row.signspeak}</strong></p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="section-block" id="features">
      <div className="section-header">
        <span className="section-kicker">MODULAR ARCHITECTURE</span>
        <h2>Engineered for low latency, utmost privacy, and seamless usability.</h2>
        <p className="section-sub">
          Every component runs locally on your machine, eliminating privacy concerns and cloud latency.
        </p>
      </div>

      <div className="features-grid">
        {featureModules.map((module) => (
          <div key={module.title} className="feature-module-card">
            <div className="feature-card-top">
              <span className="module-icon-badge">
                <FeatureIcon name={module.icon} />
              </span>
              <span className="module-tag">{module.tag}</span>
            </div>
            <h3>{module.title}</h3>
            <p>{module.description}</p>
            <ul className="feature-bullets">
              {module.highlights.map((bullet) => (
                <li key={bullet}>
                  <CheckIcon size={14} className="bullet-check" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function SdgImpactSection() {
  return (
    <section className="section-block sdg-block" id="sdg">
      <div className="sdg-section-head">
        <span className="sdg-kicker">UNITED NATIONS GLOBAL ACCESSIBILITY MISSION</span>
        <h2>Advancing UN Sustainable Development Goal 10</h2>
        <p className="sdg-sub-lead">
          SignSpeak directly reduces communication inequalities for the 70M+ Deaf individuals worldwide by delivering real-time, on-device sign-to-speech without cloud subscriptions or paywalls.
        </p>
      </div>

      <div className="sdg-showcase-grid">
        {/* Left Column: Full UN SDG 10 Official Poster Showcase */}
        <div className="sdg-poster-column">
          <div className="sdg-poster-card">
            <div className="sdg-poster-media">
              <Sdg10Icon size={260} className="sdg-full-image" />
              <div className="sdg-poster-glow" />
            </div>
            <div className="sdg-poster-caption">
              <span className="sdg-caption-tag">UN SDG 10 OFFICIAL GOAL</span>
              <strong>Reduced Inequalities</strong>
              <p>Promote universal social, economic, and workplace inclusion for all.</p>
            </div>
          </div>

          <div className="sdg-highlights-stack">
            <div className="sdg-stat-box">
              <span className="stat-num">70M+</span>
              <span className="stat-txt">Deaf &amp; Hard-of-Hearing Global Community</span>
            </div>
            <div className="sdg-stat-box">
              <span className="stat-num">100%</span>
              <span className="stat-txt">Free &amp; Open Source Accessibility Project</span>
            </div>
          </div>
        </div>

        {/* Right Column: Narrative & Specific UN Targets */}
        <div className="sdg-targets-column">
          <div className="sdg-targets-intro">
            <h3>Breaking the One-Way Barrier in Video Calls</h3>
            <p>
              Inaccessibility in modern video conferencing creates systemic hurdles in professional hiring, remote workplace meetings, university classrooms, and telemedicine. SignSpeak closes this divide by turning recognized sign language into spoken audio heard by everyone in the meeting.
            </p>
          </div>

          <div className="sdg-cards-stack">
            {sdgGoals.map((goal) => (
              <div key={goal.code} className="sdg-target-card">
                <div className="sdg-card-head">
                  <span className="sdg-badge">{goal.code}</span>
                  <span className="sdg-target-lbl">UN Target Indicator</span>
                </div>
                <h4>{goal.title}</h4>
                <p>{goal.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function LimitationsSection() {
  return (
    <section className="section-block" id="limitations">
      <div className="section-header">
        <span className="section-kicker">TRANSPARENT ENGINEERING</span>
        <h2>Current Scope &amp; Development Roadmap</h2>
        <p className="section-sub">
          We maintain absolute transparency about our model capabilities, working constraints, and upcoming milestones.
        </p>
      </div>

      <div className="limitations-grid">
        <div className="limits-list-card">
          <h4>Active Scope Constraints</h4>
          <ul className="limits-list">
            {limitations.map((limit, idx) => (
              <li key={idx}>
                <span className="limit-bullet">0{idx + 1}</span>
                <p>{limit}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="roadmap-card">
          <span className="roadmap-tag">UPCOMING MILESTONES</span>
          <h4>Future Development Roadmap</h4>
          <div className="roadmap-timeline">
            <div className="rm-item done">
              <span className="rm-dot" />
              <div className="rm-content">
                <strong>Phase 1: 25-Letter ASL Classifier</strong>
                <p>High-precision MediaPipe + Random Forest local engine at 30 FPS.</p>
              </div>
            </div>
            <div className="rm-item active">
              <span className="rm-dot" />
              <div className="rm-content">
                <strong>Phase 2: Continuous Word &amp; Gesture Chaining</strong>
                <p>Hysteresis filtering and automatic word prediction buffers.</p>
              </div>
            </div>
            <div className="rm-item">
              <span className="rm-dot" />
              <div className="rm-content">
                <strong>Phase 3: Dynamic Sentence Grammar (LSTM / Transformer)</strong>
                <p>Continuous sequence-to-sequence translation for natural ASL expressions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeView({ navigate }) {
  return (
    <div className="home-view">
      <Hero navigate={navigate} />
      <MetricsBanner />

      <section className="section-block" id="interactive-demo">
        <InteractiveDemo />
      </section>

      <section className="section-block" id="architecture-section">
        <div className="section-header">
          <span className="section-kicker">ENGINEERING PIPELINE</span>
          <h2>How landmark signals transform into spoken meeting audio.</h2>
          <p className="section-sub">
            Click through each pipeline stage to inspect the mathematics, feature normalization, and inference protocol.
          </p>
        </div>
        <ArchitectureFlow />
      </section>

      <ComparisonSection />
      <FeaturesSection />
      <SdgImpactSection />

      <section className="section-block" id="quickstart">
        <div className="section-header">
          <span className="section-kicker">DEVELOPER QUICKSTART</span>
          <h2>Get up and running in under 3 minutes.</h2>
          <p className="section-sub">
            Follow these steps to run the local Python engine and connect the Chrome extension.
          </p>
        </div>
        <QuickstartTerminal />
      </section>

      <LimitationsSection />

      <section className="section-block" id="faq">
        <div className="section-header">
          <span className="section-kicker">KNOWLEDGE BASE</span>
          <h2>Frequently Asked Questions</h2>
          <p className="section-sub">
            Everything you need to know about privacy, latency, hardware requirements, and compatibility.
          </p>
        </div>
        <FaqSection />
      </section>

      {/* CTA Final Banner */}
      <section className="cta-final-banner">
        <div className="cta-content">
          <span className="cta-kicker">OPEN ACCESSIBILITY FOR EVERYONE</span>
          <h2>Experience the future of inclusive video calls.</h2>
          <p>Join our community, contribute code, or share valuable feedback on sign language accuracy.</p>
          <div className="cta-btns">
            <button className="btn btn-primary" onClick={() => navigate('feedback')}>
              Give Feedback <span>↗</span>
            </button>
            <button className="btn" onClick={() => navigate('contact')}>
              Contact Support
            </button>
          </div>
        </div>
      </section>

      {/* Rich Multi-Column Footer */}
      <footer className="footer-industry">
        <div className="footer-grid">
          <div className="footer-brand-col">
            <div className="footer-logo-row">
              <Logo className="footer-logo" />
              <strong>SignSpeak</strong>
            </div>
            <p className="footer-desc">
              Real-time on-device sign-to-speech assistive technology for Google Meet. Built with pride for universal accessibility.
            </p>
            <div className="engine-status-tag">
              <span className="live-dot" />
              <span>Privacy Guarantee: <strong>100% On-Device &amp; Private</strong></span>
            </div>
          </div>

          <div className="footer-col">
            <h5>Product</h5>
            <ul>
              <li><a href="#interactive-demo">Interactive Simulator</a></li>
              <li><a href="#architecture-section">ML Architecture</a></li>
              <li><a href="#features">Extension Features</a></li>
              <li><a href="#quickstart">Quickstart Guide</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Impact &amp; Scope</h5>
            <ul>
              <li><a href="#sdg">UN SDG 10 Mission</a></li>
              <li><a href="#comparison">Caption Comparison</a></li>
              <li><a href="#limitations">Scope &amp; Limitations</a></li>
              <li><a href="#faq">Technical FAQ</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Connect &amp; Legal</h5>
            <ul>
              <li><button className="footer-link-btn" onClick={() => navigate('contact')}>Contact Us</button></li>
              <li><button className="footer-link-btn" onClick={() => navigate('feedback')}>Share Feedback</button></li>
              <li><button className="footer-link-btn" onClick={() => navigate('admin')}>Admin Console</button></li>
              <li><span className="footer-text-link">Privacy: 100% On-Device</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-row">
          <p>© {new Date().getFullYear()} SignSpeak Accessibility Initiative. All sign processing is strictly local.</p>
          <div className="footer-tech-stack">
            <span>MediaPipe</span> · <span>Web Speech API</span> · <span>Scikit-Learn</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FormView({ type, onOpenAuth }) {
  return (
    <section className="view active">
      <div className="form-wrap">
        <div className="kicker">{type === 'contact' ? 'GET IN TOUCH' : 'HELP US IMPROVE'}</div>
        <h2>{type === 'contact' ? 'Contact us' : 'Feedback'}</h2>
        <p className="sub">
          {type === 'contact'
            ? 'Questions about the extension, a bug to report, or interest in the learning platform? Send it over.'
            : "Rate the extension, tell us what's working, and what needs improvement."}
        </p>
        {type === 'contact' ? (
          <ContactForm onOpenAuth={onOpenAuth} />
        ) : (
          <FeedbackForm onOpenAuth={onOpenAuth} />
        )}
      </div>
    </section>
  );
}

function PasswordCriteriaChecklist({ password }) {
  if (!password || password.length === 0) return null;

  const criteria = [
    { label: '6–32 chars', met: password.length >= 6 && password.length <= 32 },
    { label: 'Uppercase (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'Lowercase (a-z)', met: /[a-z]/.test(password) },
    { label: 'Number (0-9)', met: /[0-9]/.test(password) },
    { label: 'Symbol (!@#$)', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password) },
  ];

  const metCount = criteria.filter((c) => c.met).length;
  const strengthClass = metCount <= 2 ? 'strength-weak' : metCount <= 4 ? 'strength-medium' : 'strength-strong';
  const strengthLabel = metCount <= 2 ? 'Weak' : metCount <= 4 ? 'Good' : 'Strong & Secure';

  return (
    <div className="pwd-validation-box">
      <div className="pwd-strength-bar-wrap">
        <div className="pwd-strength-header">
          <span>Password strength:</span>
          <strong className={`pwd-strength-tag ${strengthClass}`}>{strengthLabel}</strong>
        </div>
        <div className="pwd-strength-track">
          <div className={`pwd-strength-progress ${strengthClass}`} style={{ width: `${(metCount / 5) * 100}%` }} />
        </div>
      </div>

      <ul className="pwd-criteria-list">
        {criteria.map((item) => (
          <li key={item.label} className={`pwd-crit-item ${item.met ? 'met' : 'unmet'}`}>
            <span className="crit-icon-badge">
              {item.met ? <CheckIcon size={11} /> : <span className="crit-dot" />}
            </span>
            <span className="crit-text">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AuthModal({ onClose, defaultMode = 'login' }) {
  const [mode, setMode] = useState(defaultMode); // 'login' | 'signup' | 'forgot'
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, error: authContextError, isConfigured } = useAuth();
  
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const error = localError || authContextError;

  // Real-time password validation flags
  const lenOk = password.length >= 6 && password.length <= 32;
  const upperOk = /[A-Z]/.test(password);
  const lowerOk = /[a-z]/.test(password);
  const numOk = /[0-9]/.test(password);
  const specOk = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password);
  const isPasswordValid = lenOk && upperOk && lowerOk && numOk && specOk;
  
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  const isNameValid = displayName.trim().length >= 2;
  const isConfirmMatch = password === confirmPassword && confirmPassword.length > 0;

  // Form submittable check
  const canSubmit = mode === 'login'
    ? isEmailValid && password.length >= 6
    : mode === 'signup'
    ? isNameValid && isEmailValid && isPasswordValid && isConfirmMatch
    : isEmailValid; // forgot mode

  async function handleGoogleSignIn() {
    setLocalError('');
    setSuccessNotice('');
    setSubmitting(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err) {
      setLocalError(err.message || 'Google sign-in could not be completed.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError('');
    setSuccessNotice('');

    if (!canSubmit || submitting) return;

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
        onClose();
      } else if (mode === 'signup') {
        await signUpWithEmail(email, password, displayName);
        onClose();
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setSuccessNotice('Password reset link sent! Check your inbox to reset your password.');
      }
    } catch (err) {
      setLocalError(err.message || 'An error occurred during authentication.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="close-auth" type="button" onClick={onClose} aria-label="Close modal">
          <CloseIcon size={16} />
        </button>

        <div className="auth-modal-content-wrap">
          <div className="auth-head">
            <div className="auth-brand">
              <Logo className="mini-logo" />
              <span className="auth-brand-name">SignSpeak</span>
            </div>
            <h3 id="auth-title">
              {mode === 'login'
                ? 'Welcome back'
                : mode === 'signup'
                ? 'Create your account'
                : 'Reset your password'}
            </h3>
            <p className="auth-desc">
              {mode === 'login'
                ? 'Sign in to access your ASL profile, saved presets, and session preferences.'
                : mode === 'signup'
                ? 'Sign up to enable real-time sign-to-speech audio in your video calls.'
                : 'Enter your account email to receive a secure password reset link.'}
            </p>
          </div>

          {mode !== 'forgot' && (
            <div className="auth-tabs">
              <button
                type="button"
                className={`btn ${mode === 'login' ? 'on' : ''}`}
                onClick={() => {
                  setMode('login');
                  setLocalError('');
                  setSuccessNotice('');
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`btn ${mode === 'signup' ? 'on' : ''}`}
                onClick={() => {
                  setMode('signup');
                  setLocalError('');
                  setSuccessNotice('');
                }}
              >
                Sign Up
              </button>
            </div>
          )}

          {!isConfigured && (
            <div className="auth-notice-box">
              <span className="notice-badge">SETUP NOTE</span>
              <p>Firebase configuration is in placeholder mode. Copy <code>.env.example</code> to <code>.env</code> with your credentials for live authentication.</p>
            </div>
          )}

          {error && (
            <div className="auth-error-banner" role="alert">
              <span>{error}</span>
            </div>
          )}

          {successNotice && (
            <div className="auth-success-banner" role="alert">
              <CheckIcon size={16} />
              <span>{successNotice}</span>
            </div>
          )}

          {/* 1. Google One-Click OAuth Action */}
          {mode !== 'forgot' && (
            <>
              <div className="auth-actions-group">
                <button
                  type="button"
                  className="google-sign-in-btn"
                  onClick={handleGoogleSignIn}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <SpinnerIcon size={18} />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <GoogleIcon size={20} />
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>
              </div>

              <div className="auth-divider">
                <span>OR CONTINUE WITH EMAIL</span>
              </div>
            </>
          )}

          {/* 2. Email & Password Form */}
          <form onSubmit={handleSubmit} noValidate className="auth-form-body">
            {mode === 'signup' && (
              <div className="field auth-field">
                <label htmlFor="auth-name">Full Name</label>
                <div className="input-with-icon">
                  <input
                    id="auth-name"
                    type="text"
                    placeholder="Alex Morgan"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
                {displayName.length > 0 && !isNameValid && (
                  <span className="field-hint-error">Please enter at least 2 characters.</span>
                )}
              </div>
            )}

            <div className="field auth-field">
              <label htmlFor="auth-email">Email Address</label>
              <div className="input-with-icon">
                <input
                  id="auth-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              {email.length > 0 && !isEmailValid && (
                <span className="field-hint-error">Please enter a valid email address.</span>
              )}
            </div>

            {mode !== 'forgot' && (
              <div className="field auth-field">
                <div className="auth-pwd-label-row">
                  <label htmlFor="auth-password">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      className="auth-link-forgot"
                      onClick={() => {
                        setMode('forgot');
                        setLocalError('');
                        setSuccessNotice('');
                      }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                <div className="input-with-action">
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    required
                  />
                  <button
                    type="button"
                    className="pwd-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                  </button>
                </div>

                {/* Real-time checklist when creating account */}
                {mode === 'signup' && (
                  <PasswordCriteriaChecklist password={password} />
                )}
              </div>
            )}

            {mode === 'signup' && (
              <div className="field auth-field">
                <label htmlFor="auth-confirm-password">Confirm Password</label>
                <div className="input-with-action">
                  <input
                    id="auth-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="pwd-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                  </button>
                </div>

                {confirmPassword.length > 0 && (
                  <div className={`match-status-pill ${isConfirmMatch ? 'matched' : 'mismatched'}`}>
                    {isConfirmMatch ? (
                      <>
                        <CheckIcon size={12} />
                        <span>Passwords match</span>
                      </>
                    ) : (
                      <span>Passwords do not match</span>
                    )}
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary auth-submit-btn"
              disabled={!canSubmit || submitting}
            >
              {submitting ? (
                <>
                  <SpinnerIcon size={16} />
                  <span>Processing...</span>
                </>
              ) : (
                <span>
                  {mode === 'login'
                    ? 'Sign In to SignSpeak'
                    : mode === 'signup'
                    ? 'Create Account'
                    : 'Send Reset Link'}
                </span>
              )}
            </button>

            {mode === 'forgot' && (
              <div className="auth-back-row">
                <button
                  type="button"
                  className="btn btn-outline mini-btn"
                  onClick={() => {
                    setMode('login');
                    setLocalError('');
                    setSuccessNotice('');
                  }}
                >
                  ← Back to Sign In
                </button>
              </div>
            )}
          </form>

          <div className="auth-security-pill">
            <ShieldIcon size={14} />
            <span>100% On-Device ASL ML · Zero Video Telemetry</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function WelcomeOnboardModal({ onClose }) {
  const { user, profile, updateUserProfile } = useAuth();
  const [nameInput, setNameInput] = useState(profile?.display_name || user?.displayName || '');
  const [role, setRole] = useState('Deaf / Hard-of-Hearing Meeting Signer');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSave(e) {
    e.preventDefault();
    if (!nameInput.trim() || nameInput.trim().length < 2) {
      setError('Please enter your full name (minimum 2 characters).');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await updateUserProfile({
        displayName: nameInput.trim()
      });
      if (user?.uid) {
        localStorage.setItem(`signspeak_onboarded_${user.uid}`, 'true');
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to initialize profile in database.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-overlay">
      <div className="welcome-onboard-modal" role="dialog" aria-modal="true">
        <div className="onboard-header">
          <div className="onboard-badge">
            <SparklesIcon size={16} />
            <span>WELCOME TO SIGNSPEAK</span>
          </div>
          <h2>Let's set up your profile</h2>
          <p className="onboard-desc">
            Your account is ready. Please tell us your name so we can personalize your accessibility preferences and transcripts.
          </p>
        </div>

        <form onSubmit={handleSave} noValidate className="onboard-form">
          {error && <div className="auth-error-banner">{error}</div>}

          <div className="field auth-field">
            <label htmlFor="onboard-name">Your Full Name</label>
            <input
              id="onboard-name"
              type="text"
              placeholder="e.g. Alex Morgan"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="field auth-field">
            <label htmlFor="onboard-role">How will you be using SignSpeak?</label>
            <select id="onboard-role" value={role} onChange={(e) => setRole(e.target.value)}>
              <option>Deaf / Hard-of-Hearing Meeting Signer</option>
              <option>ASL Student / Accessibility Learner</option>
              <option>Meeting Host / Corporate Collaborator</option>
              <option>Accessibility Researcher / Developer</option>
            </select>
          </div>

          <div className="onboard-database-pill">
            <ShieldIcon size={14} />
            <span>Private & secure session · 100% on-device video processing</span>
          </div>

          <button
            type="submit"
            className="btn btn-primary onboard-submit-btn"
            disabled={submitting || nameInput.trim().length < 2}
          >
            {submitting ? (
              <>
                <SpinnerIcon size={16} />
                <span>Saving Profile...</span>
              </>
            ) : (
              <span>Complete Setup & Get Started →</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function ProfileModal({ onClose }) {
  const { user, profile, updateUserProfile, signOutUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile?.display_name || user?.displayName || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const displayName = profile?.display_name || user?.displayName || 'SignSpeak Member';
  const email = profile?.email || user?.email || 'No email provided';
  const photoURL = profile?.photo_url || user?.photoURL;
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Active Session';
  const lastActive = profile?.last_login_at
    ? new Date(profile.last_login_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    : 'Just now';

  async function handleSaveProfile(e) {
    e.preventDefault();
    if (!editName.trim() || editName.trim().length < 2) {
      setError('Name must be at least 2 characters long.');
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccessMsg('');
    try {
      await updateUserProfile({
        displayName: editName.trim()
      });
      setSuccessMsg('Profile updated and synchronized to Neon PostgreSQL!');
      setTimeout(() => {
        setIsEditing(false);
        setSuccessMsg('');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-title">
        <button className="close-auth" type="button" onClick={onClose} aria-label="Close profile">
          <CloseIcon size={16} />
        </button>

        <div className="profile-modal-head">
          <div className="profile-avatar-large">
            {photoURL ? (
              <img src={photoURL} alt={displayName} className="avatar-img-lg" />
            ) : (
              <span className="avatar-initial-lg">{displayName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <h3 id="profile-title">{displayName}</h3>
          <span className="profile-email-badge">{email}</span>
        </div>

        {successMsg && (
          <div className="auth-success-banner" role="alert">
            <CheckIcon size={14} />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="auth-error-banner" role="alert">
            <span>{error}</span>
          </div>
        )}

        {!isEditing ? (
          <>
            <div className="profile-meta-grid">
              <div className="meta-card">
                <span className="meta-lbl">Database Sync</span>
                <span className="meta-val highlight">Neon Lakebase PostgreSQL</span>
              </div>
              <div className="meta-card">
                <span className="meta-lbl">Identity Provider</span>
                <span className="meta-val">Firebase Auth</span>
              </div>
              <div className="meta-card">
                <span className="meta-lbl">Member Since</span>
                <span className="meta-val">{memberSince}</span>
              </div>
              <div className="meta-card">
                <span className="meta-lbl">Last Active</span>
                <span className="meta-val">{lastActive}</span>
              </div>
            </div>

            <div className="profile-modal-actions-row">
              <button
                type="button"
                className="btn btn-outline edit-profile-trigger-btn"
                onClick={() => {
                  setEditName(displayName);
                  setIsEditing(true);
                  setError('');
                  setSuccessMsg('');
                }}
              >
                <EditIcon size={15} />
                <span>Manage Profile</span>
              </button>

              <button
                type="button"
                className="btn btn-outline signout-btn"
                onClick={async () => {
                  await signOutUser();
                  onClose();
                }}
              >
                <LogOutIcon size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSaveProfile} noValidate className="profile-edit-form">
            <div className="field auth-field">
              <label htmlFor="edit-name">Display Name</label>
              <input
                id="edit-name"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="profile-edit-btns">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || editName.trim().length < 2}
              >
                {submitting ? (
                  <>
                    <SpinnerIcon size={15} />
                    <span>Saving to Neon...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setIsEditing(false);
                  setError('');
                }}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const { user, profile, loading: authLoading, signOutUser } = useAuth();
  const [splash, setSplash] = useState(true);
  const [view, setView] = useState(() => {
    const hash = window.location.hash.slice(1);
    return ['about', 'playground', 'contact', 'feedback', 'profile', 'admin'].includes(hash) ? hash : 'about';
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (['about', 'playground', 'contact', 'feedback', 'profile', 'admin'].includes(hash)) {
        setView(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  function handleDismissSplash() {
    setSplash(false);
  }

  function navigate(nextView) {
    setView(nextView);
    window.history.replaceState(null, '', `#${nextView}`);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  const userDisplayName = profile?.display_name || user?.displayName || 'User';
  const userPhoto = profile?.photo_url || user?.photoURL;

  // Detect if user signed in for the first time without a personalized display name
  // Wait until auth and profile are fully resolved to prevent split-second flash on refresh
  const effectiveName = profile?.display_name || user?.displayName || '';
  const needsOnboarding = Boolean(
    !authLoading &&
    user &&
    profile &&
    !welcomeDismissed &&
    (!effectiveName || effectiveName.trim() === '' || effectiveName.trim().toLowerCase() === 'user') &&
    !localStorage.getItem(`signspeak_onboarded_${user.uid}`)
  );

  return (
    <>
      {splash && <Splash onDismiss={handleDismissSplash} />}
      <div className="shell">
        <nav className="sidebar" aria-label="Primary">
          <div className="mark" onClick={() => navigate('about')} role="button" tabIndex={0} title="SignSpeak Home">
            <Logo />
          </div>
          <div className="navlinks">
            {[
              { key: 'about', label: 'Platform', Icon: PlatformIcon },
              { key: 'playground', label: 'Playground', Icon: PlaygroundIcon },
              { key: 'contact', label: 'Contact', Icon: ContactIcon },
              { key: 'feedback', label: 'Feedback', Icon: FeedbackIcon },
            ].map(({ key, label, Icon }) => (
              <button
                className={`navlink ${view === key ? 'active' : ''}`}
                onClick={() => navigate(key)}
                key={key}
              >
                <span className="nav-icon"><Icon size={18} /></span>
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="foot">SIGNSPEAK</div>
        </nav>

        <main className="main">
          <header className="topbar">
            <div className="brand" onClick={() => navigate('about')} style={{ cursor: 'pointer' }}>
              <Logo className="mini-logo" />
              <span>SignSpeak</span>
            </div>

            <div className="topbar-actions">
              <button
                type="button"
                className="btn btn-outline get-extension-btn"
                onClick={() => {
                  if (view !== 'about') navigate('about');
                  setTimeout(() => {
                    const el = document.getElementById('quickstart');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                title="How to setup and install the SignSpeak extension"
              >
                <ExtensionIcon size={15} />
                <span>Get Extension</span>
              </button>

              <button className="btn btn-primary quick-demo-btn" onClick={() => {
                if (view !== 'about') navigate('about');
                setTimeout(() => {
                  const el = document.getElementById('interactive-demo');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}>
                Try Sandbox
              </button>

              {user ? (
                <div className="topbar-user-group">
                  <button
                    type="button"
                    className={`user-profile-btn ${view === 'profile' ? 'active' : ''}`}
                    onClick={() => navigate('profile')}
                    title="Account & Profile Settings"
                  >
                    {userPhoto ? (
                      <img src={userPhoto} alt={userDisplayName} className="topbar-avatar-img" />
                    ) : (
                      <span className="topbar-avatar-initial">{userDisplayName.charAt(0).toUpperCase()}</span>
                    )}
                    <span className="topbar-user-name">{userDisplayName.split(' ')[0]}</span>
                  </button>

                  <button
                    type="button"
                    className="topbar-logout-btn"
                    onClick={async () => {
                      await signOutUser();
                      navigate('about');
                    }}
                    title="Log Out"
                    aria-label="Log Out"
                  >
                    <LogOutIcon size={16} />
                    <span className="topbar-logout-text">Log Out</span>
                  </button>
                </div>
              ) : (
                <button className="btn auth-btn" onClick={() => setAuthModalOpen(true)}>
                  Sign In
                </button>
              )}
            </div>
          </header>

          {view === 'about' ? (
            <HomeView navigate={navigate} />
          ) : view === 'playground' ? (
            <PlaygroundView navigate={navigate} onOpenAuth={() => setAuthModalOpen(true)} />
          ) : view === 'profile' ? (
            <ProfileView navigate={navigate} />
          ) : view === 'admin' ? (
            <AdminDashboard onOpenAuth={() => setAuthModalOpen(true)} navigate={navigate} />
          ) : (
            <FormView type={view} onOpenAuth={() => setAuthModalOpen(true)} />
          )}
        </main>
      </div>

      <ChatAssistant />
      {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
      {profileModalOpen && <ProfileModal onClose={() => setProfileModalOpen(false)} />}
      {needsOnboarding && <WelcomeOnboardModal onClose={() => setWelcomeDismissed(true)} />}
    </>
  );
}
