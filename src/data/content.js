export const faq = {
  setup: 'Install the Chrome extension, open a Google Meet call, then start the local detection server on your computer. The extension connects to it at 127.0.0.1:8765.',
  letters: 'The current model recognizes ASL letters A through Y (25 classes). Full sentence-level ASL is on the roadmap.',
  hear: 'Yes, once you tap Speak, recognized text is converted to speech and routed toward the meeting audio path so the other participant can hear it.',
};

export const quickQuestions = {
  setup: 'How do I set it up?',
  letters: 'Which letters work?',
  hear: 'Can others hear me?',
};

export const slides = [
  {
    eyebrow: '01 · Mission, Vision & SDG Alignment',
    title: null,
    content: 'mission',
  },
  {
    eyebrow: '02 · How Detection Works',
    title: 'Your camera, MediaPipe, and a model trained on 25 letters.',
    description: 'Everything runs through a local detection server on your own machine, so no signing data leaves your computer to reach the model.',
    content: 'pipeline',
  },
  {
    eyebrow: "03 · What's Inside the Extension",
    title: 'One extension, four working parts.',
    content: 'modules',
  },
  {
    eyebrow: '04 · Honest About Scope',
    title: "What it does today, and what it doesn't yet.",
    content: 'limits',
  },
];

export const pipeline = [
  ['Capture', 'The camera watches your hand while MediaPipe extracts 21 hand landmarks per frame.'],
  ['Normalize', 'Landmarks are made wrist-relative and scale-normalized into 63 numerical features.'],
  ['Classify', 'A local Random Forest model, served at 127.0.0.1:8765, predicts the ASL letter, A through Y.'],
  ['Speak', 'Stable letters accumulate into text, then convert to speech routed toward the meeting audio.'],
];

export const modules = [
  ['Google Meet integration', 'Sits alongside your Meet call and provides detection and speech controls without leaving the tab.', '▣'],
  ['AI chatbot', "Matches common questions against a 50+ item knowledge base first, then falls back to Chrome's on-device AI.", '◷'],
  ['Privacy by default', 'The extension takes the necessary permissions and meeting data is not shipped unnecessarily.', '▤'],
];

export const limitations = [
  'Covers the A-Y letter set, not unrestricted natural ASL sentence understanding.',
  'Reliable remote speech depends on correct OS/browser audio routing into the meeting microphone.',
  'Chrome on-device AI behavior can vary by browser version, hardware, and configuration.',
  'Image and voice chatbot features depend on local browser capabilities being available.',
  'Real ASL includes movement and expression far beyond what a letter classifier captures.',
];
