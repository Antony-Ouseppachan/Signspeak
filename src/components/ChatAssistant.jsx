import { useState, useEffect, useRef, useCallback } from 'react';
import ChatbotIcon from './ChatbotIcon.jsx';

// ─────────────────────────────────────────────
// SIGNA KNOWLEDGE BASE
// Comprehensive coverage of all website content
// ─────────────────────────────────────────────
const KB = [
  // SETUP & INSTALLATION
  {
    id: 'setup',
    tags: ['setup', 'install', 'start', 'begin', 'how to use', 'get started', 'run', 'launch', 'quickstart'],
    answer: `To get started with SignSpeak:\n\n**Step 1 — Clone & Start Detection Engine**\nOpen Command Prompt (Win + R → cmd) and run:\n\`\`\`\ncd downloads\ngit clone -b extension --single-branch https://github.com/Antony-Ouseppachan/Signspeak.git\ncd Signspeak\npython ai_detection_server.py\n\`\`\`\n\n**Step 2 — Load Chrome Extension**\nGo to \`chrome://extensions/\` → Enable "Developer mode" → Click "Load unpacked" → Select the Signspeak folder.\n\n**Step 3 — Join Google Meet**\nOpen meet.google.com → Click the SignSpeak overlay → Begin signing ASL letters!`,
  },
  {
    id: 'clone',
    tags: ['clone', 'git', 'repository', 'download', 'github', 'cmd', 'command prompt', 'terminal'],
    answer: `To clone the SignSpeak repository, open Command Prompt and run:\n\n\`cd downloads\`\n\`git clone -b extension --single-branch https://github.com/Antony-Ouseppachan/Signspeak.git\`\n\nThis clones only the \`extension\` branch. Then \`cd Signspeak\` and run \`python ai_detection_server.py\` to start the local AI detection engine.`,
  },
  {
    id: 'python',
    tags: ['python', 'server', 'ai_detection_server', 'detection engine', 'local server', 'backend'],
    answer: `The local AI detection server runs as a Python process on your machine. After cloning:\n\n\`cd Signspeak\`\n\`python ai_detection_server.py\`\n\nThis starts the on-device ML inference engine that processes your webcam feed using MediaPipe and classifies hand gestures via a Random Forest model — all locally with zero cloud calls.`,
  },
  {
    id: 'extension',
    tags: ['extension', 'chrome extension', 'load unpacked', 'developer mode', 'browser extension', 'install extension'],
    answer: `To load the Chrome extension:\n\n1. Open **chrome://extensions/** in your browser\n2. Enable **"Developer mode"** (toggle in top-right corner)\n3. Click **"Load unpacked"**\n4. Select the **Signspeak** folder you cloned\n\nThe extension will appear in your toolbar and inject a floating HUD into any active Google Meet session.`,
  },
  {
    id: 'meet',
    tags: ['google meet', 'meet', 'video call', 'meeting', 'join', 'overlay', 'hud'],
    answer: `After loading the extension:\n\n1. Open **meet.google.com** and join or start a meeting\n2. The **SignSpeak floating HUD** will appear on your call interface\n3. Click the SignSpeak overlay to activate detection\n4. Begin signing ASL letters — they'll be detected, accumulated into words, and synthesized as speech into your meeting microphone!`,
  },
  // SIGNS & DETECTION
  {
    id: 'letters',
    tags: ['letters', 'signs', 'alphabet', 'asl', 'which signs', 'what signs', 'supported', 'recognized', 'gestures', 'a to z', 'a through z'],
    answer: `SignSpeak currently recognizes **25 ASL static alphabet letters** — A through Y — with high confidence (97–99.8% accuracy).\n\n**Note on Z & J:** These involve motion (J traces a J-curve, Z traces a Z-path in the air), which requires temporal gesture tracking beyond static frames — currently in active development.\n\nFull sentence-level grammar and dynamic gesture recognition are on our development roadmap.`,
  },
  {
    id: 'accuracy',
    tags: ['accuracy', 'confidence', 'precision', 'correct', 'wrong', 'misdetect', 'error', 'reliability'],
    answer: `SignSpeak achieves **97–99.8% confidence** across the supported ASL alphabet set, measured on diverse hand shapes and lighting conditions.\n\n**Tips to improve accuracy:**\n- Ensure your hand is well-lit and clearly visible\n- Keep your hand within the camera frame\n- Sign at a moderate speed — the hysteresis debouncer needs ~3 consistent frames\n- Maintain a neutral background when possible`,
  },
  {
    id: 'latency',
    tags: ['latency', 'speed', 'fast', 'slow', 'delay', 'lag', 'real-time', 'ms', 'milliseconds', 'performance'],
    answer: `SignSpeak achieves **sub-18ms end-to-end latency** — from camera capture to audio synthesis output.\n\nBreakdown:\n- MediaPipe landmark extraction: ~4ms\n- Random Forest ML inference: <4ms\n- Speech synthesis & audio routing: ~10ms\n\nThis is dramatically faster than cloud-based alternatives (300–800ms), as everything runs entirely on your local CPU/GPU.`,
  },
  {
    id: 'speech',
    tags: ['speech', 'audio', 'hear', 'voice', 'sound', 'others', 'participants', 'microphone', 'synthesize', 'speak'],
    answer: `Yes! Once you sign letters that accumulate into a word (via hysteresis debouncing), SignSpeak uses the **Web Speech API** to synthesize natural phoneme audio, which is then **injected directly into your Google Meet WebRTC microphone stream**.\n\nAll participants in the meeting hear your speech in real-time — no special app or extension needed on their end.`,
  },
  // PRIVACY & SECURITY
  {
    id: 'privacy',
    tags: ['privacy', 'data', 'cloud', 'secure', 'safe', 'upload', 'telemetry', 'track', 'collect', 'gdpr', 'video', 'webcam'],
    answer: `SignSpeak is built with **privacy as a first principle**:\n\n- All video processing happens **100% on your local device**\n- Zero video frames, landmark coordinates, or transcribed speech are sent to any server\n- No account required to use the detection engine\n- No usage telemetry or tracking\n- The codebase is **open-source** and fully auditable on GitHub\n\nYour webcam feed never leaves your computer.`,
  },
  // HARDWARE & REQUIREMENTS
  {
    id: 'requirements',
    tags: ['requirements', 'hardware', 'specs', 'laptop', 'computer', 'ram', 'cpu', 'gpu', 'webcam', 'camera', 'compatible', 'minimum'],
    answer: `SignSpeak is engineered for **extreme efficiency** and runs on modest hardware:\n\n- **OS:** Windows, macOS, or Linux\n- **Browser:** Google Chrome (latest)\n- **Webcam:** Standard 720p camera\n- **RAM:** 4GB minimum\n- **CPU:** Modern dual-core processor\n- **GPU:** Not required (runs on CPU)\n- **Python:** 3.8 or later\n\nNo dedicated GPU or enterprise hardware needed.`,
  },
  // TECHNICAL / ML ARCHITECTURE
  {
    id: 'mediapipe',
    tags: ['mediapipe', 'landmark', 'keypoint', 'coordinates', 'hand tracking', 'joints', '21 points', 'skeleton'],
    answer: `SignSpeak uses **Google MediaPipe Hands** to extract **21 three-dimensional (X, Y, Z) keypoint coordinates** from each camera frame — mapped to your physical hand joints (wrist, knuckles, fingertips).\n\nThese 63 coordinates (21 × 3) form a spatial hand skeleton that encodes your hand shape precisely, regardless of camera angle or lighting.`,
  },
  {
    id: 'ml_model',
    tags: ['ml', 'model', 'machine learning', 'ai', 'random forest', 'classifier', 'neural network', 'train', 'inference', 'how does it work'],
    answer: `SignSpeak's detection pipeline:\n\n1. **Frame Capture** — MediaPipe extracts 21 hand landmarks at 30 FPS\n2. **Normalization** — Coordinates are wrist-relative and scale-normalized to [-1, +1]\n3. **ML Inference** — A trained **Random Forest Classifier** evaluates the 63-dim vector in under 4ms\n4. **Debouncing** — Hysteresis logic requires 3 consistent detections before committing a letter\n5. **Speech** — Web Speech API synthesizes audio injected into the meeting microphone\n\nAll 5 stages run locally on your device.`,
  },
  {
    id: 'normalization',
    tags: ['normalization', 'wrist', 'scale', 'invariant', 'vector', 'coordinates', 'math'],
    answer: `To ensure detection works regardless of hand distance or camera angle, SignSpeak normalizes all coordinates:\n\n- Subtract wrist point [0] from all landmarks → **translation invariant**\n- Divide by the hand bounding diagonal → **scale invariant**\n- Result: a normalized vector in [-1.0, +1.0] range\n\nThis means the same sign looks identical to the classifier whether your hand is 30cm or 60cm from the camera.`,
  },
  // FEATURES
  {
    id: 'hud',
    tags: ['hud', 'overlay', 'floating', 'interface', 'ui', 'extension ui', 'controller', 'panel'],
    answer: `The **SignSpeak Floating HUD** seamlessly embeds into your Google Meet interface:\n\n- Real-time visual feedback of recognized letters\n- Backspace gesture controls\n- Volume indicators\n- Dark/Light mode sync with your system\n- Keybinding shortcuts\n- Zero layout interference with Meet's native UI`,
  },
  {
    id: 'debounce',
    tags: ['debounce', 'hysteresis', 'word', 'accumulate', 'letters to words', 'sentence', 'buffer'],
    answer: `SignSpeak uses a **hysteresis debounce algorithm** to convert detected letters into words:\n\n- A letter is only "committed" after being detected consistently for ~3 frames\n- This prevents flickering detections from producing noise\n- Letters accumulate in a buffer until a space/pause gesture triggers word synthesis\n- The committed word is then sent to the Web Speech API for audio output`,
  },
  // PLAYGROUND / LEARNING
  {
    id: 'playground',
    tags: ['playground', 'learn', 'study', 'practice', 'gamification', 'quiz', 'xp', 'level', 'achievement', 'streak', 'module'],
    answer: `The **SignSpeak Learning Playground** is a gamified ASL study module — login required to track your progress:\n\n- **Lab Mode** — Practice individual letters with real-time feedback\n- **Quiz Mode** — Test your knowledge with timed letter recognition challenges\n- **Word Studio** — Spell out full words using ASL signs\n- **Accuracy Sandbox** — Fine-tune your signing precision\n\nYour XP, streaks, and expertise tier (Novice Signer → ASL Master) are synced to your profile and persisted in the cloud.`,
  },
  {
    id: 'xp_levels',
    tags: ['xp', 'experience points', 'level', 'tier', 'novice', 'intermediate', 'advanced', 'master', 'rank', 'expertise', 'progress'],
    answer: `The Playground tracks your ASL expertise progression:\n\n- **Novice Signer** — Just getting started\n- **Apprentice** — Learning the fundamentals\n- **Practitioner** — Comfortable with most letters\n- **Advanced Signer** — High accuracy across the alphabet\n- **ASL Master** — Expert-level proficiency\n\nYour tier is calculated from XP earned through quizzes, streaks, and practice sessions — all saved to your profile.`,
  },
  // PROFILE & AUTH
  {
    id: 'auth',
    tags: ['login', 'sign in', 'google', 'account', 'profile', 'auth', 'register', 'google sign in'],
    answer: `SignSpeak uses **Google Sign-In** for authentication — no separate account creation needed.\n\nLogging in unlocks:\n- Personal profile with your display name\n- ASL expertise level tracking\n- Playground progress sync across devices\n- Streak and achievement persistence\n\nAll authentication is handled via Firebase Auth with Neon PostgreSQL for profile storage.`,
  },
  {
    id: 'profile',
    tags: ['profile', 'name', 'display name', 'account settings', 'user info', 'picture', 'avatar'],
    answer: `Your **SignSpeak profile** shows:\n- Display name (editable, separate from your Google account name)\n- ASL expertise tier and XP progress\n- Learning streak\n- Playground achievements\n\nYou can customize your display name in the Profile view — it's stored independently from your Google account name and persists across sessions.`,
  },
  // SDG / MISSION
  {
    id: 'mission',
    tags: ['mission', 'goal', 'sdg', 'accessibility', 'deaf', 'hard of hearing', 'inclusion', 'why', 'purpose', 'impact'],
    answer: `SignSpeak's mission is to **close the video call communication divide** for Deaf and hard-of-hearing individuals.\n\nWe align with **UN SDG 10** (Reduced Inequalities):\n- **SDG 10.2** — Promote universal social & economic inclusion\n- **SDG 10.3** — Ensure equal opportunities & eliminate disparities\n- **SDG 9.5** — Inclusive research & technological innovation\n\nSignSpeak is free, open-source, and designed to run on standard consumer hardware — no subscriptions, no paywalls.`,
  },
  // COMPARISON
  {
    id: 'comparison',
    tags: ['compare', 'vs', 'versus', 'traditional', 'better', 'alternative', 'other tools', 'difference', 'advantage'],
    answer: `SignSpeak vs traditional captioning tools:\n\n| Feature | Traditional | SignSpeak |\n|---|---|---|\n| **Privacy** | Video sent to cloud | 100% on-device |\n| **Audio** | Text captions only | Spoken speech for all |\n| **Cost** | $30–$100/mo | Free & open-source |\n| **Latency** | 300–800ms | <18ms real-time |\n\nSignSpeak is the only solution that synthesizes actual speech into the meeting microphone — everyone hears you.`,
  },
  // LIMITATIONS
  {
    id: 'limitations',
    tags: ['limitation', 'limitation', 'not supported', 'missing', 'roadmap', 'future', 'what cant', 'issues', 'problems'],
    answer: `SignSpeak's current honest limitations:\n\n- Covers A-Y alphabet; full sentence ASL grammar is on the roadmap\n- Remote speech depends on correct OS/browser audio routing to the meeting mic\n- Chrome's on-device AI (Gemini Nano) varies by browser version and hardware\n- Real ASL includes facial expressions and spatial syntax far beyond letter classification\n- Motion-based letters (J, Z) require temporal gesture tracking — in development\n\nWe're continuously improving — check our GitHub for the latest updates.`,
  },
  // OPEN SOURCE / CONTRIBUTE
  {
    id: 'opensource',
    tags: ['open source', 'github', 'contribute', 'code', 'fork', 'pull request', 'community', 'license'],
    answer: `SignSpeak is **fully open-source** on GitHub:\n\n**Repository:** github.com/Antony-Ouseppachan/Signspeak\n\nYou can:\n- Fork and contribute improvements\n- Report issues or suggest features\n- Study the ML model architecture\n- Audit the privacy-first codebase\n\nContributions to detection accuracy, new sign support, and UI improvements are especially welcome!`,
  },
  // CONTACT / SUPPORT
  {
    id: 'contact',
    tags: ['contact', 'support', 'help', 'email', 'reach out', 'feedback', 'report', 'bug', 'issue'],
    answer: `To get support or share feedback:\n\n- Use the **Contact Support** page (click Contact in the nav or footer)\n- Submit a **GitHub Issue** at github.com/Antony-Ouseppachan/Signspeak/issues\n- Use the **Give Feedback** button on the home page\n\nOur team responds to all genuine issues and suggestions. We especially value accuracy reports and accessibility feedback.`,
  },
  // CHROME AI / GEMINI
  {
    id: 'chrome_ai',
    tags: ['chrome ai', 'gemini nano', 'gemini', 'on-device ai', 'prompt api', 'built-in ai', 'llm', 'chatbot ai'],
    answer: `SignSpeak leverages **Chrome's built-in AI (Gemini Nano via Prompt API)** for enhanced assistant features:\n\n- Operates offline without internet connectivity\n- Powers contextual FAQ lookup and gesture learning tips\n- Runs directly in your browser — no API keys or cloud calls\n- Availability varies by Chrome version and hardware capability\n\nIf Gemini Nano isn't available on your device, the assistant falls back to the local knowledge base.`,
  },
  // TROUBLESHOOTING
  {
    id: 'troubleshoot_detection',
    tags: ['not working', 'not detecting', 'detection failed', 'wrong sign', 'incorrect', 'fix', 'troubleshoot', 'broken', 'debug'],
    answer: `If detection isn't working correctly:\n\n1. **Ensure the Python server is running** — check terminal for errors\n2. **Check your webcam permissions** — Chrome must have camera access\n3. **Improve lighting** — ensure your hand is well-lit, no harsh backlight\n4. **Reduce background clutter** — a plain background improves accuracy\n5. **Check the extension is loaded** — visit chrome://extensions/ and verify it's enabled\n6. **Restart the detection server** — Ctrl+C and re-run \`python ai_detection_server.py\``,
  },
  {
    id: 'troubleshoot_audio',
    tags: ['no sound', 'audio not working', 'mic', 'microphone', 'others cant hear', 'speech not working', 'audio routing'],
    answer: `If others can't hear the synthesized speech:\n\n1. **Check microphone permissions** — Chrome must have mic access\n2. **Verify audio routing** — SignSpeak injects into your active mic input\n3. **Check Google Meet mic settings** — ensure SignSpeak's virtual audio device is selected\n4. **OS audio settings** — on Windows, check Sound settings for the correct output device\n5. **Chrome Web Speech API** — verify it's supported (requires Chrome 33+)\n6. **Try reloading the Meet tab** after enabling the extension`,
  },
];

// ─────────────────────────────────────────────
// SMART ANSWER ENGINE — fixed word-boundary scoring
// ─────────────────────────────────────────────

// Tokenise query into a set of whole words for safe matching
function tokenise(text) {
  return new Set(text.toLowerCase().trim().split(/\W+/).filter(Boolean));
}

function findAnswer(query) {
  const q = query.toLowerCase().trim();
  const qWords = tokenise(q);

  const scored = KB.map((entry) => {
    let score = 0;
    for (const tag of entry.tags) {
      // Exact phrase match (high reward)
      if (q.includes(tag)) {
        score += tag.split(' ').length * 3;
      } else {
        // Whole-word match only — never substring (fixes 'a' inside 'are' etc.)
        const tagWords = tag.split(' ').filter((w) => w.length > 2);
        const matched = tagWords.filter((w) => qWords.has(w));
        score += matched.length;
      }
    }
    return { entry, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];

  // Require a meaningful match score — avoids spurious answers
  if (best.score >= 2) return best.entry.answer;
  return null;
}

// ─── Conversational handlers (checked BEFORE KB) ───
const CONVERSATIONAL = [
  {
    patterns: ['how are you', 'how r u', 'how are u', 'hows it going', "how's it going", 'how do you do', 'you ok', 'are you ok'],
    responses: [
      "I'm doing great — ready to help! Ask me anything about SignSpeak, setup, ASL detection, or the learning playground.",
      "All good here! I'm Signa, your SignSpeak guide. What can I help you with today?",
      "Fantastic, thanks for asking! I'm here and ready. What would you like to know about SignSpeak?",
    ],
  },
  {
    patterns: ['what is your name', 'who are you', 'what are you', 'introduce yourself', 'tell me about yourself', 'your name'],
    responses: [
      "I'm **Signa** — the AI assistant built into the SignSpeak website. I can answer questions about the app, setup, ASL detection, privacy, the learning playground, and anything else on this site.",
    ],
  },
  {
    patterns: ['who made you', 'who built you', 'who created you', 'who made signa', 'who made signspeak', 'who created signspeak', 'who built signspeak', 'who is the developer', 'developer', 'creator', 'who made this', 'author'],
    responses: [
      "SignSpeak was crafted by a passionate group of developers dedicated to accessibility and inclusive technology. The project is open-source on GitHub at github.com/Antony-Ouseppachan/Signspeak.",
      "A dedicated team of developers who care deeply about making communication accessible for everyone built SignSpeak. It's fully open-source — feel free to explore the code!",
    ],
  },
  {
    patterns: ['who is antony', 'antony ouseppachan', 'antony'],
    responses: [
      "SignSpeak was created by a passionate team of developers focused on building privacy-first assistive technology for Deaf and hard-of-hearing individuals.",
    ],
  },
  {
    patterns: ['what can you do', 'what can signa do', 'help', 'what do you know', 'capabilities', 'what topics'],
    responses: [
      "I can help you with:\n\n- **Setup** — Clone, install, run the detection engine\n- **Chrome Extension** — Load and configure it\n- **ASL Detection** — Which letters work, accuracy, latency\n- **Privacy** — How your data stays on-device\n- **ML Architecture** — MediaPipe, Random Forest, normalization\n- **Learning Playground** — XP, levels, quizzes\n- **Troubleshooting** — Detection not working, audio issues\n- **About SignSpeak** — Mission, SDG goals, open source\n\nJust ask!",
    ],
  },
  {
    patterns: ['good morning', 'good afternoon', 'good evening', 'good night'],
    responses: [
      "Good day! I'm Signa, your SignSpeak guide. How can I help you today?",
    ],
  },
  {
    patterns: ['bye', 'goodbye', 'see you', 'later', 'cya', 'take care'],
    responses: [
      "Goodbye! Feel free to come back anytime — just press **Ctrl+K** to open me again. Take care!",
    ],
  },
  {
    patterns: ["you're great", 'you are great', 'you are amazing', "you're amazing", 'love you', 'good job', 'well done', 'nice'],
    responses: [
      "Thank you, that means a lot! I'm here whenever you need help with SignSpeak.",
      "Appreciate it! Let me know if you have more questions about SignSpeak.",
    ],
  },
];

const THANKS_PATTERNS = ['thank you', 'thanks', 'thank u', 'ty', 'thx', 'cheers', 'much appreciated'];

const FALLBACK_RESPONSES = [
  "I'm not sure about that one. Try asking about **setup**, **ASL detection**, **privacy**, **the playground**, or **how SignSpeak works** — those are my strong suits!",
  "That's outside my current knowledge. For anything not covered here, visit the **Contact Support** page and the team will follow up directly.",
  "I couldn't find a match for that. Try rephrasing, or browse the FAQ section on the homepage. You can also reach us via the **Contact** page.",
];

function getResponse(query) {
  const q = query.toLowerCase().trim();
  const qWords = tokenise(q);

  // Conversational checks first (before KB)
  for (const group of CONVERSATIONAL) {
    const matched = group.patterns.some((p) => {
      const pWords = tokenise(p);
      // Full phrase match or all words present
      if (q.includes(p)) return true;
      if (p.split(' ').length >= 2) {
        return p.split(' ').every((w) => q.includes(w));
      }
      return q === p || q.startsWith(p + ' ') || q.endsWith(' ' + p);
    });
    if (matched) {
      const pool = group.responses;
      return pool[Math.floor(Math.random() * pool.length)];
    }
  }

  // Thanks check
  if (THANKS_PATTERNS.some((t) => q.includes(t))) {
    return "You're welcome! Anything else I can help with? Try asking about **setup**, **privacy**, **ASL letters**, or the **Learning Playground**.";
  }

  // Single-word greetings
  if (['hi', 'hello', 'hey', 'howdy', 'yo', 'sup', 'hiya'].includes(q)) {
    return "Hello! I'm **Signa**, your SignSpeak AI guide. Ask me anything about setup, detection, privacy, the ASL playground, or how SignSpeak works!";
  }

  return findAnswer(query) || FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
}


// ─────────────────────────────────────────────
// SUGGESTION CHIPS (contextual quick replies)
// ─────────────────────────────────────────────
const SUGGESTION_GROUPS = {
  default: ['How do I set it up?', 'Which signs work?', 'Is my data private?', 'How fast is detection?'],
  after_setup: ['Load the Chrome extension', 'How does detection work?', 'Troubleshoot detection'],
  after_privacy: ['What hardware do I need?', 'Is it open source?', 'Compare to other tools'],
  after_signs: ['What is the accuracy?', 'How does ML work?', 'Tell me about the playground'],
};

function getSuggestions(lastBotMessageId) {
  if (!lastBotMessageId) return SUGGESTION_GROUPS.default;
  if (['setup', 'clone', 'python'].includes(lastBotMessageId)) return SUGGESTION_GROUPS.after_setup;
  if (['privacy'].includes(lastBotMessageId)) return SUGGESTION_GROUPS.after_privacy;
  if (['letters', 'accuracy'].includes(lastBotMessageId)) return SUGGESTION_GROUPS.after_signs;
  return SUGGESTION_GROUPS.default;
}

// ─────────────────────────────────────────────
// MARKDOWN RENDERER (lightweight inline)
// ─────────────────────────────────────────────
function renderMarkdown(text) {
  // Process line-by-line for blocks, then handle inline
  const lines = text.split('\n');
  const elements = [];
  let key = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Table
    if (line.trim().startsWith('|') && lines[i + 1]?.trim().startsWith('|---')) {
      const headers = line.split('|').filter(Boolean).map((h) => h.trim());
      i += 2; // skip separator
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(lines[i].split('|').filter(Boolean).map((c) => c.trim()));
        i++;
      }
      elements.push(
        <table key={key++} className="signa-table">
          <thead><tr>{headers.map((h, hi) => <th key={hi}>{inlineRender(h)}</th>)}</tr></thead>
          <tbody>{rows.map((row, ri) => <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{inlineRender(cell)}</td>)}</tr>)}</tbody>
        </table>
      );
      continue;
    }

    // Code block (``` ... ```)
    if (line.trim().startsWith('```')) {
      i++;
      const codeLines = [];
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(<pre key={key++} className="signa-code"><code>{codeLines.join('\n')}</code></pre>);
      continue;
    }

    // Inline code with backticks (not block)
    if (line.trim().startsWith('`') && !line.trim().startsWith('```')) {
      elements.push(<p key={key++} className="signa-p">{inlineRender(line)}</p>);
      i++;
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(line.trim())) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(<li key={i}>{inlineRender(lines[i].replace(/^\d+\.\s/, ''))}</li>);
        i++;
      }
      elements.push(<ol key={key++} className="signa-ol">{items}</ol>);
      continue;
    }

    // Bullet list
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const items = [];
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
        items.push(<li key={i}>{inlineRender(lines[i].replace(/^[-*]\s/, ''))}</li>);
        i++;
      }
      elements.push(<ul key={key++} className="signa-ul">{items}</ul>);
      continue;
    }

    // Empty line → spacer
    if (line.trim() === '') {
      elements.push(<div key={key++} className="signa-spacer" />);
      i++;
      continue;
    }

    // Normal paragraph
    elements.push(<p key={key++} className="signa-p">{inlineRender(line)}</p>);
    i++;
  }

  return elements;
}

function inlineRender(text) {
  // Split on **bold**, *italic*, `code`
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="signa-inline-code">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

// ─────────────────────────────────────────────
// SEND ICON
// ─────────────────────────────────────────────
function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function MinimizeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// ─────────────────────────────────────────────
// TYPING INDICATOR
// ─────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="signa-typing">
      <span /><span /><span />
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
let msgIdCounter = 0;

export default function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: ++msgIdCounter,
      text: "Hi! I'm **Signa**, your SignSpeak AI guide. I can answer questions about setup, sign detection, privacy, the ASL playground, and more.\n\nWhat would you like to know?",
      who: 'bot',
      kbId: null,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [suggestions, setSuggestions] = useState(SUGGESTION_GROUPS.default);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const fabRef = useRef(null);

  // Ctrl+K shortcut
  useEffect(() => {
    function handleKey(e) {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => {
          const next = !prev;
          if (next) setTimeout(() => inputRef.current?.focus(), 120);
          return next;
        });
      }
      if (e.key === 'Escape' && open) setOpen(false);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, typing]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  // Click-outside: close panel, preserve input
  useEffect(() => {
    if (!open) return;
    function handleOutsideClick(e) {
      const clickedPanel = panelRef.current?.contains(e.target);
      const clickedFab = fabRef.current?.contains(e.target);
      if (!clickedPanel && !clickedFab) setOpen(false);
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  const sendMessage = useCallback((question) => {
    const q = question.trim();
    if (!q) return;

    const userMsg = { id: ++msgIdCounter, text: q, who: 'user', timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    // Simulate thinking delay (400–900ms)
    const delay = 400 + Math.random() * 500;
    setTimeout(() => {
      const responseText = getResponse(q);
      // Find KB id for suggestions
      const kbMatch = KB.find((entry) =>
        entry.tags.some((tag) => q.toLowerCase().includes(tag))
      );
      const botMsg = {
        id: ++msgIdCounter,
        text: responseText,
        who: 'bot',
        kbId: kbMatch?.id || null,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setSuggestions(getSuggestions(kbMatch?.id || null));
      setTyping(false);
    }, delay);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    sendMessage(input);
  }

  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <>
      {/* FAB Toggle */}
      <button
        ref={fabRef}
        className={`signa-fab ${open ? 'signa-fab--active' : ''}`}
        onClick={() => setOpen((p) => !p)}
        aria-label={open ? 'Close Signa assistant' : 'Open Signa assistant (Ctrl+K)'}
        aria-expanded={open}
        title="Signa AI Assistant (Ctrl+K)"
      >
        <span className="signa-fab-ring" />
        <ChatbotIcon />
        {!open && <span className="signa-fab-badge">AI</span>}
      </button>

      {/* Chat Panel */}
      {open && (
        <div ref={panelRef} className="signa-panel" role="dialog" aria-label="Signa AI Assistant">
          {/* Header */}
          <div className="signa-header">
            <div className="signa-header-avatar">
              <ChatbotIcon />
              <span className="signa-online-dot" />
            </div>
            <div className="signa-header-info">
              <strong>Signa</strong>
              <span>SignSpeak AI Guide &bull; Always here to help</span>
            </div>
            <div className="signa-header-actions">
              <button
                className="signa-icon-btn"
                onClick={() => setOpen(false)}
                aria-label="Close"
                title="Close (Esc)"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* Shortcut hint */}
          <div className="signa-shortcut-hint">
            <kbd>Ctrl</kbd> + <kbd>K</kbd> to toggle anywhere
          </div>

          {/* Messages */}
          <div className="signa-body" ref={bodyRef}>
            {messages.map((msg) => (
              <div key={msg.id} className={`signa-msg-row signa-msg-row--${msg.who}`}>
                {msg.who === 'bot' && (
                  <div className="signa-avatar-sm"><ChatbotIcon /></div>
                )}
                <div className={`signa-bubble signa-bubble--${msg.who}`}>
                  <div className="signa-bubble-content">
                    {msg.who === 'bot' ? renderMarkdown(msg.text) : <p className="signa-p">{msg.text}</p>}
                  </div>
                  <span className="signa-timestamp">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            ))}
            {typing && (
              <div className="signa-msg-row signa-msg-row--bot">
                <div className="signa-avatar-sm"><ChatbotIcon /></div>
                <div className="signa-bubble signa-bubble--bot signa-bubble--typing">
                  <TypingIndicator />
                </div>
              </div>
            )}
          </div>

          {/* Suggestion chips */}
          <div className="signa-suggestions">
            {suggestions.map((s) => (
              <button
                key={s}
                className="signa-chip"
                onClick={() => sendMessage(s)}
                disabled={typing}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <form className="signa-input-row" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Signa anything..."
              aria-label="Message Signa"
              disabled={typing}
              className="signa-input"
              autoComplete="off"
            />
            <button
              type="submit"
              className="signa-send-btn"
              disabled={!input.trim() || typing}
              aria-label="Send"
            >
              <SendIcon />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
