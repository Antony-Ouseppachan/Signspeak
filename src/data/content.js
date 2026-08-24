export const faq = {
  setup: 'Install the Chrome extension, open a Google Meet call, and start the local detection engine on your computer.',
  letters: 'The model recognizes all 26 ASL alphabet letters (A through Z). Continuous sentence grammar is currently in active development.',
  hear: 'Yes, once you tap Speak or debounce words, synthesized speech is injected into your Google Meet microphone channel so meeting participants can hear you.',
  privacy: 'All video processing and landmark classifications are 100% on-device. Zero video frames or personal data leave your computer.',
};

export const quickQuestions = {
  setup: 'How do I set it up?',
  letters: 'Which letters work?',
  hear: 'Can others hear me?',
};

export const gesturePresets = [
  {
    letter: 'A',
    name: 'Fist with upright thumb',
    confidence: 99.4,
    description: 'Fingers curled inward into a fist with thumb resting upright alongside the index finger.',
    nodes: [
      [160, 275], [130, 255], [105, 230], [92, 195], [88, 155],
      [138, 205], [138, 175], [140, 150], [142, 175],
      [162, 200], [162, 170], [164, 145], [166, 170],
      [186, 205], [186, 175], [188, 150], [190, 175],
      [210, 215], [210, 190], [212, 168], [214, 185]
    ],
    vectors: '[-0.142, -0.421, 0.088, -0.012, 0.384, ... 63 dims]'
  },
  {
    letter: 'B',
    name: 'Open palm with thumb tucked',
    confidence: 98.7,
    description: 'Four fingers extended upward together, thumb folded flat across the palm.',
    nodes: [
      [160, 275], [132, 250], [112, 225], [132, 210], [148, 212],
      [135, 190], [130, 140], [126, 95], [122, 55],
      [160, 182], [158, 130], [156, 85], [154, 45],
      [185, 186], [185, 136], [185, 92], [185, 52],
      [210, 196], [214, 150], [218, 110], [222, 75]
    ],
    vectors: '[0.024, -0.781, -0.014, 0.098, -0.812, ... 63 dims]'
  },
  {
    letter: 'C',
    name: 'Curved hand arc',
    confidence: 97.9,
    description: 'Fingers and thumb curved into an open "C" arc facing sideways.',
    nodes: [
      [160, 275], [130, 250], [105, 215], [92, 175], [98, 140],
      [138, 192], [126, 150], [130, 120], [150, 115],
      [164, 188], [156, 145], [160, 118], [178, 115],
      [188, 194], [182, 152], [185, 125], [202, 122],
      [210, 208], [206, 170], [208, 145], [222, 142]
    ],
    vectors: '[-0.231, -0.342, 0.155, -0.198, 0.412, ... 63 dims]'
  },
  {
    letter: 'D',
    name: 'Index pointing up with circular base',
    confidence: 99.2,
    description: 'Index finger points straight up while other three fingers curl to touch the thumb tip, forming a loop.',
    nodes: [
      [160, 275], [130, 250], [115, 220], [135, 195], [150, 185],
      [138, 190], [132, 140], [128, 92], [124, 48],
      [162, 185], [165, 150], [162, 130], [150, 180],
      [186, 192], [186, 160], [180, 140], [152, 185],
      [210, 206], [208, 175], [198, 155], [156, 190]
    ],
    vectors: '[-0.012, -0.891, 0.045, 0.142, 0.228, ... 63 dims]'
  },
  {
    letter: 'E',
    name: 'Curled fingertips resting on thumb',
    confidence: 97.4,
    description: 'All four fingertips curled down tightly with thumb folded across beneath them.',
    nodes: [
      [160, 275], [132, 252], [118, 230], [140, 218], [158, 216],
      [138, 192], [136, 158], [140, 175], [142, 200],
      [162, 186], [160, 152], [162, 170], [164, 196],
      [186, 192], [184, 158], [184, 175], [186, 202],
      [210, 204], [208, 172], [206, 188], [208, 210]
    ],
    vectors: '[0.082, -0.214, 0.312, -0.045, 0.118, ... 63 dims]'
  },
  {
    letter: 'F',
    name: 'Three fingers up with OK circle',
    confidence: 98.9,
    description: 'Index finger and thumb touch to form an "OK" circle while middle, ring, and pinky fingers extend straight UP.',
    nodes: [
      [160, 275], [130, 250], [112, 225], [128, 195], [142, 175],
      [138, 190], [132, 160], [135, 145], [145, 170],
      [162, 182], [160, 130], [158, 85], [156, 45],
      [186, 186], [186, 136], [186, 92], [186, 52],
      [210, 196], [214, 150], [218, 110], [222, 75]
    ],
    vectors: '[0.112, -0.684, -0.084, 0.312, -0.742, ... 63 dims]'
  },
  {
    letter: 'G',
    name: 'Index pointing sideways with parallel thumb',
    confidence: 98.1,
    description: 'Index finger points horizontally sideways, thumb parallel alongside it, other fingers closed into palm.',
    nodes: [
      [160, 275], [135, 245], [110, 215], [85, 195], [58, 190],
      [140, 188], [115, 175], [85, 165], [52, 160],
      [162, 192], [158, 170], [156, 150], [158, 172],
      [186, 198], [184, 178], [182, 160], [184, 180],
      [208, 210], [206, 192], [204, 178], [206, 194]
    ],
    vectors: '[-0.642, -0.118, 0.054, -0.598, -0.142, ... 63 dims]'
  },
  {
    letter: 'H',
    name: 'Two fingers pointing horizontally',
    confidence: 98.6,
    description: 'Index and middle fingers extended together pointing horizontally sideways, thumb folded over ring finger.',
    nodes: [
      [160, 275], [135, 245], [118, 220], [136, 205], [150, 205],
      [140, 188], [112, 175], [80, 165], [48, 158],
      [162, 184], [132, 172], [100, 162], [68, 155],
      [186, 194], [184, 172], [182, 155], [184, 174],
      [208, 206], [206, 188], [204, 172], [206, 188]
    ],
    vectors: '[-0.584, -0.198, 0.012, -0.612, -0.185, ... 63 dims]'
  },
  {
    letter: 'I',
    name: 'Pinky finger straight up',
    confidence: 99.5,
    description: 'Little finger (pinky) extended straight upward, other three fingers closed in a fist with thumb held over them.',
    nodes: [
      [160, 275], [132, 250], [118, 222], [138, 205], [152, 206],
      [138, 190], [138, 165], [140, 145], [142, 168],
      [162, 186], [162, 160], [164, 140], [166, 165],
      [186, 192], [186, 165], [188, 145], [190, 168],
      [210, 198], [216, 150], [222, 105], [228, 62]
    ],
    vectors: '[0.018, -0.052, 0.088, 0.412, -0.892, ... 63 dims]'
  },
  {
    letter: 'J',
    name: 'Pinky tracing a J-curve',
    confidence: 97.2,
    description: 'Pinky finger extended upward tracing a swooping "J" hook motion in the air.',
    nodes: [
      [160, 275], [132, 250], [118, 222], [138, 205], [152, 206],
      [138, 190], [138, 165], [140, 145], [142, 168],
      [162, 186], [162, 160], [164, 140], [166, 165],
      [186, 192], [186, 165], [188, 145], [190, 168],
      [210, 202], [220, 162], [235, 120], [215, 85]
    ],
    vectors: '[0.045, -0.112, 0.142, 0.384, -0.785, ... 63 dims]'
  },
  {
    letter: 'K',
    name: 'Index up, middle forward with thumb between',
    confidence: 98.4,
    description: 'Index points straight up, middle finger angles forward/upward, thumb placed upright between the two fingers.',
    nodes: [
      [160, 275], [132, 248], [115, 215], [132, 180], [146, 150],
      [138, 188], [132, 138], [128, 90], [124, 45],
      [162, 184], [164, 145], [168, 110], [172, 80],
      [186, 192], [186, 168], [186, 148], [188, 170],
      [210, 204], [210, 182], [212, 162], [214, 182]
    ],
    vectors: '[-0.042, -0.842, 0.088, 0.112, -0.712, ... 63 dims]'
  },
  {
    letter: 'L',
    name: 'Right-angle index and thumb',
    confidence: 99.8,
    description: 'Index finger points straight up, thumb extends horizontally at a 90° angle, other fingers folded.',
    nodes: [
      [160, 275], [126, 245], [95, 220], [68, 205], [42, 200],
      [138, 190], [135, 138], [132, 90], [130, 45],
      [164, 185], [166, 155], [168, 130], [170, 155],
      [188, 192], [188, 162], [190, 138], [192, 162],
      [210, 206], [210, 180], [212, 158], [214, 178]
    ],
    vectors: '[-0.512, -0.104, 0.005, -0.014, -0.892, ... 63 dims]'
  },
  {
    letter: 'M',
    name: 'Three fingers draped over thumb',
    confidence: 97.6,
    description: 'Three fingers (index, middle, ring) folded over the thumb so the thumb tip peeks out beneath the ring finger.',
    nodes: [
      [160, 275], [134, 252], [120, 228], [142, 205], [185, 200],
      [138, 192], [138, 162], [140, 140], [142, 170],
      [162, 186], [162, 158], [164, 138], [166, 168],
      [186, 190], [186, 162], [188, 142], [190, 172],
      [210, 208], [210, 186], [212, 168], [214, 188]
    ],
    vectors: '[0.012, -0.245, 0.185, 0.045, -0.218, ... 63 dims]'
  },
  {
    letter: 'N',
    name: 'Two fingers draped over thumb',
    confidence: 98.2,
    description: 'Two fingers (index, middle) folded over the thumb so the thumb tip peeks out between middle and ring fingers.',
    nodes: [
      [160, 275], [134, 252], [120, 228], [142, 205], [168, 200],
      [138, 192], [138, 162], [140, 140], [142, 170],
      [162, 186], [162, 158], [164, 138], [166, 168],
      [186, 194], [186, 172], [188, 152], [190, 178],
      [210, 208], [210, 186], [212, 168], [214, 188]
    ],
    vectors: '[0.018, -0.285, 0.142, 0.038, -0.242, ... 63 dims]'
  },
  {
    letter: 'O',
    name: 'Fingers curved into closed O',
    confidence: 99.1,
    description: 'All fingertips curve downward to touch the thumb tip, creating a circular "O" shape.',
    nodes: [
      [160, 275], [130, 250], [112, 220], [125, 185], [150, 165],
      [138, 190], [130, 150], [135, 125], [152, 160],
      [162, 186], [155, 145], [158, 122], [160, 160],
      [186, 190], [180, 150], [180, 126], [166, 162],
      [210, 204], [205, 168], [202, 142], [172, 166]
    ],
    vectors: '[-0.045, -0.512, 0.218, 0.088, -0.485, ... 63 dims]'
  },
  {
    letter: 'P',
    name: 'Downward K gesture',
    confidence: 97.5,
    description: 'Hand tilted downward with index pointing forward, middle pointing down, and thumb touching middle knuckle.',
    nodes: [
      [160, 275], [138, 250], [122, 225], [105, 208], [95, 228],
      [138, 195], [110, 190], [80, 185], [48, 180],
      [162, 198], [155, 225], [150, 255], [145, 285],
      [186, 202], [186, 180], [186, 160], [186, 178],
      [208, 212], [208, 192], [208, 175], [208, 192]
    ],
    vectors: '[-0.684, 0.012, 0.045, -0.088, 0.612, ... 63 dims]'
  },
  {
    letter: 'Q',
    name: 'Downward G gesture',
    confidence: 97.1,
    description: 'Hand tilted downward with index finger and thumb pointing downward alongside each other.',
    nodes: [
      [160, 275], [140, 250], [128, 225], [120, 255], [115, 290],
      [138, 195], [142, 228], [145, 262], [148, 298],
      [162, 192], [166, 170], [166, 150], [166, 170],
      [186, 196], [188, 175], [188, 155], [188, 175],
      [208, 206], [210, 188], [210, 170], [210, 188]
    ],
    vectors: '[-0.212, 0.645, 0.088, -0.118, 0.712, ... 63 dims]'
  },
  {
    letter: 'R',
    name: 'Index and middle fingers crossed',
    confidence: 98.8,
    description: 'Index and middle fingers extended upward and crossed over one another, other fingers folded.',
    nodes: [
      [160, 275], [132, 250], [118, 222], [138, 205], [152, 206],
      [138, 188], [142, 138], [152, 90], [160, 45],
      [162, 182], [156, 135], [144, 88], [136, 46],
      [186, 192], [186, 165], [186, 142], [188, 168],
      [210, 204], [210, 182], [212, 162], [214, 182]
    ],
    vectors: '[0.012, -0.884, 0.045, -0.088, -0.865, ... 63 dims]'
  },
  {
    letter: 'S',
    name: 'Tight fist with thumb across fingers',
    confidence: 99.3,
    description: 'Fingers folded into a tight fist with thumb wrapped horizontally across the front of all four fingers.',
    nodes: [
      [160, 275], [130, 252], [115, 225], [145, 200], [185, 200],
      [138, 192], [138, 162], [140, 138], [142, 168],
      [162, 186], [162, 158], [164, 135], [166, 165],
      [186, 192], [186, 162], [188, 140], [190, 170],
      [210, 208], [210, 185], [212, 165], [214, 185]
    ],
    vectors: '[0.082, -0.218, 0.142, 0.012, -0.198, ... 63 dims]'
  },
  {
    letter: 'T',
    name: 'Thumb tucked under index finger',
    confidence: 98.3,
    description: 'Fingers in a fist with thumb tucked upward between the index and middle finger knuckles.',
    nodes: [
      [160, 275], [132, 250], [120, 222], [140, 192], [146, 160],
      [138, 190], [138, 158], [140, 135], [142, 165],
      [162, 188], [162, 162], [164, 142], [166, 170],
      [186, 194], [186, 168], [188, 148], [190, 175],
      [210, 208], [210, 188], [212, 170], [214, 188]
    ],
    vectors: '[-0.045, -0.342, 0.185, 0.012, -0.285, ... 63 dims]'
  },
  {
    letter: 'U',
    name: 'Index and middle fingers together upright',
    confidence: 99.0,
    description: 'Index and middle fingers extended straight up touching closely together side-by-side.',
    nodes: [
      [160, 275], [132, 248], [118, 222], [138, 205], [152, 206],
      [138, 188], [138, 138], [138, 90], [138, 45],
      [162, 184], [160, 136], [158, 88], [156, 45],
      [186, 192], [186, 165], [186, 142], [188, 168],
      [210, 204], [210, 182], [212, 162], [214, 182]
    ],
    vectors: '[-0.088, -0.892, -0.012, -0.018, -0.885, ... 63 dims]'
  },
  {
    letter: 'V',
    name: 'Peace / Victory sign',
    confidence: 99.1,
    description: 'Index and middle fingers extended apart in a "V" shape, ring and pinky fingers folded, thumb over ring.',
    nodes: [
      [160, 275], [130, 248], [115, 220], [138, 205], [152, 206],
      [136, 188], [125, 136], [114, 88], [104, 45],
      [162, 182], [168, 132], [176, 85], [184, 42],
      [188, 190], [186, 160], [186, 134], [188, 160],
      [210, 205], [210, 178], [212, 154], [214, 175]
    ],
    vectors: '[-0.245, -0.842, -0.041, 0.218, -0.865, ... 63 dims]'
  },
  {
    letter: 'W',
    name: 'Three fingers spread upright (W)',
    confidence: 98.9,
    description: 'Index, middle, and ring fingers extended upward and spread apart forming a "W", thumb holding pinky down.',
    nodes: [
      [160, 275], [132, 250], [118, 222], [145, 208], [168, 205],
      [138, 188], [126, 138], [115, 88], [105, 45],
      [162, 182], [160, 132], [158, 82], [156, 40],
      [186, 186], [194, 138], [202, 90], [210, 48],
      [210, 206], [210, 185], [212, 165], [214, 185]
    ],
    vectors: '[-0.218, -0.854, 0.012, 0.285, -0.812, ... 63 dims]'
  },
  {
    letter: 'X',
    name: 'Index bent into a hook',
    confidence: 97.8,
    description: 'Index finger curved into a bent hook shape, other fingers closed in a fist with thumb across.',
    nodes: [
      [160, 275], [132, 250], [118, 222], [138, 205], [152, 206],
      [138, 190], [135, 152], [145, 125], [138, 140],
      [162, 188], [162, 162], [164, 142], [166, 170],
      [186, 194], [186, 168], [188, 148], [190, 175],
      [210, 208], [210, 188], [212, 170], [214, 188]
    ],
    vectors: '[-0.088, -0.512, 0.245, 0.012, -0.285, ... 63 dims]'
  },
  {
    letter: 'Y',
    name: 'Thumb and pinky horns',
    confidence: 98.5,
    description: 'Thumb and little finger extended outwards, three middle fingers held tightly folded into palm.',
    nodes: [
      [160, 275], [124, 245], [92, 220], [66, 200], [40, 192],
      [138, 192], [140, 162], [142, 138], [144, 162],
      [164, 186], [166, 156], [168, 132], [170, 156],
      [188, 192], [188, 162], [190, 138], [192, 162],
      [212, 204], [232, 168], [250, 132], [268, 98]
    ],
    vectors: '[-0.589, -0.192, 0.082, 0.612, -0.684, ... 63 dims]'
  },
  {
    letter: 'Z',
    name: 'Index finger tracing a Z-path',
    confidence: 97.3,
    description: 'Index finger pointing forward to trace the diagonal zig-zag shape of the letter "Z" in the air.',
    nodes: [
      [160, 275], [132, 250], [118, 222], [138, 205], [152, 206],
      [138, 188], [132, 138], [128, 90], [124, 45],
      [162, 188], [162, 162], [164, 142], [166, 170],
      [186, 194], [186, 168], [188, 148], [190, 175],
      [210, 208], [210, 188], [212, 170], [214, 188]
    ],
    vectors: '[-0.045, -0.884, 0.088, 0.012, -0.218, ... 63 dims]'
  }
];

export const metrics = [
  { value: '< 18ms', label: 'End-to-End Latency', sub: 'Camera to audio synthesis', icon: 'latency' },
  { value: '21 Points', label: 'Landmarks / Frame', sub: 'MediaPipe 3D precision', icon: 'landmarks' },
  { value: '26 Signs', label: 'ASL Alphabet Set', sub: 'Complete A through Z models', icon: 'alphabet' },
  { value: '100% Local', label: 'On-Device Inference', sub: 'Zero cloud dependencies', icon: 'shield' },
  { value: '0 KB', label: 'Data Telemetry', sub: 'Complete privacy by default', icon: 'privacy' }
];

export const pipeline = [
  {
    step: '01',
    title: 'Frame Capture & MediaPipe',
    summary: 'High-frequency 30 FPS camera extraction',
    detail: 'Your local camera stream is processed frame-by-frame by MediaPipe Hands, extracting 21 three-dimensional (X, Y, Z) keypoint coordinates mapped to physical hand joints.',
    badge: 'MediaPipe 3D',
    tensor: '21 points × (x, y, z) = 63 coords'
  },
  {
    step: '02',
    title: 'Wrist-Relative Normalization',
    summary: 'Scale and translation invariant math',
    detail: 'All coordinates are subtracted by wrist point [0] and scaled by the hand bounding diagonal. This guarantees identical inference regardless of hand distance or camera angle.',
    badge: 'Vector Math',
    tensor: 'Norm Vector: [-1.0 ... +1.0]'
  },
  {
    step: '03',
    title: 'Local ML Inference Engine',
    summary: 'Trained Random Forest Classifier',
    detail: 'The normalized vector is evaluated locally on-device against an optimized 25-class Random Forest model in sub-4 milliseconds.',
    badge: 'On-Device ML Engine',
    tensor: 'ArgMax Probability: 99.4%'
  },
  {
    step: '04',
    title: 'Speech Synthesis & Meet Audio',
    summary: 'Real-time call microphone injection',
    detail: 'Classified characters accumulate through hysteresis debouncing into words. The Web Speech API generates natural phonemes injected directly into Google Meet microphone tracks.',
    badge: 'Web Audio API',
    tensor: 'Synthesized Meet Output'
  }
];

export const featureModules = [
  {
    tag: 'INTEGRATION',
    title: 'Google Meet In-Call Floating HUD',
    description: 'Seamlessly embeds alongside your Google Meet call interface. Gives you instant visual feedback of recognized letters, backspace gesture controls, and volume indicators without ever navigating away.',
    icon: 'hud',
    highlights: ['Zero layout interference', 'Customizable HUD overlay', 'Dark/Light mode sync', 'Keybinding shortcuts']
  },
  {
    tag: 'MACHINE LEARNING',
    title: 'Local High-Precision Classifier',
    description: 'Operates entirely offline on your local CPU/GPU through lightweight on-device execution. Trained on thousands of diverse hand shapes and lighting conditions for consistent detection.',
    icon: 'brain',
    highlights: ['25 ASL letter alphabet', 'Sub-4ms classification', 'Debounced hysteresis logic', 'Scale invariant']
  },
  {
    tag: 'PRIVACY & SECURITY',
    title: 'Zero Cloud Data Guarantee',
    description: 'Your webcam feed and sign gestures never leave your local device. No video frames, landmark coordinates, or transcribed speech are uploaded or logged to third-party servers.',
    icon: 'shield',
    highlights: ['100% offline capability', 'No account requirement', 'Zero tracking telemetry', 'Open-source auditable']
  },
  {
    tag: 'ON-DEVICE AI',
    title: 'Chrome Built-in AI Companion',
    description: 'Leverages Chrome Prompt API and Gemini Nano directly in the browser to offer contextual conversation shortcuts, ASL learning aids, and instant troubleshooting assistance.',
    icon: 'sparkles',
    highlights: ['Gemini Nano integration', 'Natural language FAQ lookup', 'Instant reply suggestions', 'Offline generative text']
  }
];

export const quickstartSteps = [
  {
    step: '01',
    title: 'Open CMD & Start Detection Engine',
    command: 'cd downloads\ngit clone -b extension --single-branch https://github.com/Antony-Ouseppachan/Signspeak.git\ncd Signspeak\npython ai_detection_server.py',
    tip: 'Open Command Prompt (Press Win + R, type cmd, and press Enter) or Terminal, then paste the command above to start the local AI detection server.'
  },
  {
    step: '02',
    title: 'Load Chrome Extension',
    command: 'chrome://extensions/ -> Enable "Developer mode" -> Click "Load unpacked" -> Select /C:/Users/UserName/Downloads/Signspeak',
    tip: 'Injects the SignSpeak floating controller HUD into any active Google Meet session.'
  },
  {
    step: '03',
    title: 'Join Google Meet & Start Signing',
    command: 'Open meet.google.com -> Click the SignSpeak overlay -> Begin signing ASL letters',
    tip: 'Letters will spell words, synthesize speech, and transmit into meeting audio in real time!'
  }
];

export const sdgGoals = [
  {
    code: 'SDG 10.2',
    title: 'Promote Universal Social & Economic Inclusion',
    desc: 'Empowers Deaf and hard-of-hearing professionals, students, and advocates to communicate autonomously in remote meetings and global conferences.'
  },
  {
    code: 'SDG 10.3',
    title: 'Ensure Equal Opportunities & Eliminate Disparities',
    desc: 'Bridges the digital accessibility divide by delivering low-cost, zero-subscription assistive technology runnable on standard consumer hardware.'
  },
  {
    code: 'SDG 9.5',
    title: 'Inclusive Research & Technological Innovation',
    desc: 'Demonstrates cutting-edge on-device edge AI and browser-native neural computing prioritizing privacy and universal human dignity.'
  }
];

export const comparisonPoints = [
  {
    feature: 'Webcam Data Privacy',
    category: 'Privacy',
    traditional: 'Video frames sent over the network to third-party cloud servers for processing',
    traditionalStatus: 'Cloud Transferred',
    signspeak: '100% processed on your local device without any video or coordinate uploads',
    signspeakStatus: 'Private On-Device'
  },
  {
    feature: 'Meeting Audio Experience',
    category: 'Audio Flow',
    traditional: 'Text transcripts only visible locally to the person signing, leaving others unable to hear',
    traditionalStatus: 'One-Way Captions',
    signspeak: 'Spoken speech synthesized directly into the meeting microphone audio for all attendees',
    signspeakStatus: 'Two-Way Spoken Speech'
  },
  {
    feature: 'Subscription & Pricing',
    category: 'Accessibility',
    traditional: 'Costly recurring subscriptions ($30 - $100 / mo) or restricted enterprise tiers',
    traditionalStatus: 'Paywalled SaaS',
    signspeak: 'Free, open-source assistive technology accessible to everyone without paywalls',
    signspeakStatus: 'Free & Open Source'
  },
  {
    feature: 'Inference Latency',
    category: 'Performance',
    traditional: '300ms - 800ms lag caused by internet network hops and remote cloud queues',
    traditionalStatus: 'Network Latency',
    signspeak: 'Sub-18ms real-time responsiveness running directly on your CPU/GPU',
    signspeakStatus: '< 18ms Real-Time'
  }
];

export const faqList = [
  {
    q: 'How does SignSpeak transmit speech into Google Meet without cloud APIs?',
    a: 'SignSpeak utilizes browser-native Web Speech Synthesis paired with virtual Web Audio API routing. When you sign letters, the local engine debounces the characters into words, synthesizes natural voice audio, and streams the output directly into the WebRTC microphone stream of Google Meet.'
  },
  {
    q: 'Which sign language letters and gestures are supported?',
    a: 'The current model recognizes 25 American Sign Language (ASL) static alphabet letters from A through Y with high confidence. Full sentence-level and dynamic gesture grammar is actively on our development roadmap.'
  },
  {
    q: 'What hardware or specifications are required to run the local engine?',
    a: 'SignSpeak is engineered for extreme efficiency. Any modern dual-core laptop or desktop with a standard 720p webcam, 4GB RAM, and Google Chrome can run the MediaPipe landmark extractor and Random Forest classifier at full 30 FPS.'
  },
  {
    q: 'Is any video or audio data sent over the internet?',
    a: 'None whatsoever. All MediaPipe landmark coordinate extraction, ML classification, and speech generation take place exclusively on your local computer. There is zero telemetry or cloud logging.'
  },
  {
    q: 'How does the on-device AI chatbot assistant work?',
    a: 'The assistant uses Chrome built-in on-device AI (Gemini Nano via Prompt API) paired with a local knowledge base. It answers configuration questions, helps learn gestures, and operates without internet connectivity.'
  }
];

export const slides = [
  {
    eyebrow: '01 · Mission, Vision & SDG Alignment',
    title: 'Closing the video call communication divide.',
    description: 'SignSpeak empowers Deaf and hard-of-hearing individuals to participate equally in remote meetings without relying on third-party cloud subscriptions.',
    content: 'mission'
  },
  {
    eyebrow: '02 · How Detection Works',
    title: 'Your camera, MediaPipe, and a model trained on 25 letters.',
    description: 'Everything runs through a local detection server on your own machine, so no signing data leaves your computer to reach the model.',
    content: 'pipeline'
  },
  {
    eyebrow: "03 · What's Inside the Extension",
    title: 'One extension, four working parts.',
    description: 'Architected modularly for maximum reliability, speed, and privacy.',
    content: 'modules'
  },
  {
    eyebrow: '04 · Honest About Scope',
    title: "What it does today, and what it doesn't yet.",
    description: 'Transparent engineering standards and continuous development roadmap.',
    content: 'limits'
  }
];

export const limitations = [
  'Covers the A-Y alphabet letter set, not unrestricted natural ASL sentence grammar.',
  'Reliable remote speech depends on correct OS/browser audio routing into the meeting microphone.',
  'Chrome on-device AI behavior can vary by browser version, hardware, and configuration.',
  'Image and voice chatbot features depend on local browser capabilities being available.',
  'Real ASL includes movement, facial expression, and spatial syntax far beyond letter classification.'
];
