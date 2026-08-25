// ASL Fingerspelling Dataset with 21-point MediaPipe Normalized Landmarks & Gamification Metadata

// Standard 21 Hand Landmark indices:
// 0: Wrist
// 1-4: Thumb (CMC, MCP, IP, Tip)
// 5-8: Index (MCP, PIP, DIP, Tip)
// 9-12: Middle (MCP, PIP, DIP, Tip)
// 13-16: Ring (MCP, PIP, DIP, Tip)
// 17-20: Pinky (MCP, PIP, DIP, Tip)

export const handBones = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17]
];

export const aslAlphabet = [
  {
    letter: 'A',
    category: 'Vowels & Core',
    difficulty: 'Beginner',
    xp: 20,
    hint: 'Fist closed, thumb rests upright against the side of the index finger.',
    funFact: 'One of the most frequent letters in ASL finger spelling.',
    audioWord: 'A',
    landmarks: [
      { x: 50, y: 88 }, { x: 38, y: 78 }, { x: 30, y: 64 }, { x: 26, y: 50 }, { x: 26, y: 38 },
      { x: 42, y: 56 }, { x: 42, y: 68 }, { x: 42, y: 76 }, { x: 42, y: 82 },
      { x: 50, y: 54 }, { x: 50, y: 66 }, { x: 50, y: 76 }, { x: 50, y: 82 },
      { x: 58, y: 56 }, { x: 58, y: 68 }, { x: 58, y: 76 }, { x: 58, y: 82 },
      { x: 66, y: 60 }, { x: 66, y: 70 }, { x: 66, y: 78 }, { x: 66, y: 84 }
    ]
  },
  {
    letter: 'B',
    category: 'Flat Handshape',
    difficulty: 'Beginner',
    xp: 20,
    hint: 'Four fingers straight up and pressed together, thumb tucked across the palm.',
    funFact: 'Represents the number 4 or a flat barrier in ASL classifier gestures.',
    audioWord: 'B',
    landmarks: [
      { x: 50, y: 90 }, { x: 42, y: 78 }, { x: 46, y: 68 }, { x: 50, y: 62 }, { x: 52, y: 58 },
      { x: 38, y: 50 }, { x: 38, y: 34 }, { x: 38, y: 22 }, { x: 38, y: 10 },
      { x: 46, y: 48 }, { x: 46, y: 30 }, { x: 46, y: 18 }, { x: 46, y: 6 },
      { x: 54, y: 50 }, { x: 54, y: 32 }, { x: 54, y: 20 }, { x: 54, y: 8 },
      { x: 62, y: 54 }, { x: 62, y: 38 }, { x: 62, y: 28 }, { x: 62, y: 18 }
    ]
  },
  {
    letter: 'C',
    category: 'Curved Handshape',
    difficulty: 'Beginner',
    xp: 20,
    hint: 'Form a curved "C" shape with all fingers and thumb facing outward.',
    funFact: 'Iconic shape that directly mimics the Latin letter C.',
    audioWord: 'C',
    landmarks: [
      { x: 50, y: 88 }, { x: 38, y: 80 }, { x: 32, y: 72 }, { x: 34, y: 64 }, { x: 40, y: 60 },
      { x: 42, y: 52 }, { x: 40, y: 38 }, { x: 44, y: 26 }, { x: 54, y: 22 },
      { x: 50, y: 50 }, { x: 48, y: 36 }, { x: 52, y: 24 }, { x: 62, y: 20 },
      { x: 58, y: 52 }, { x: 56, y: 38 }, { x: 60, y: 28 }, { x: 68, y: 26 },
      { x: 66, y: 58 }, { x: 64, y: 46 }, { x: 68, y: 38 }, { x: 74, y: 36 }
    ]
  },
  {
    letter: 'D',
    category: 'Pointing Shapes',
    difficulty: 'Beginner',
    xp: 25,
    hint: 'Index finger points straight up while thumb and remaining fingers form an "O".',
    funFact: 'The index finger represents the upright stroke of letter D.',
    audioWord: 'D',
    landmarks: [
      { x: 50, y: 90 }, { x: 40, y: 80 }, { x: 42, y: 68 }, { x: 48, y: 60 }, { x: 52, y: 54 },
      { x: 38, y: 48 }, { x: 38, y: 32 }, { x: 38, y: 18 }, { x: 38, y: 6 },
      { x: 48, y: 48 }, { x: 52, y: 58 }, { x: 54, y: 66 }, { x: 52, y: 72 },
      { x: 56, y: 52 }, { x: 58, y: 60 }, { x: 60, y: 68 }, { x: 58, y: 74 },
      { x: 64, y: 56 }, { x: 66, y: 64 }, { x: 68, y: 72 }, { x: 66, y: 78 }
    ]
  },
  {
    letter: 'E',
    category: 'Vowels & Core',
    difficulty: 'Intermediate',
    xp: 30,
    hint: 'All four fingertips curled down tightly, thumb tucked below fingertips.',
    funFact: 'Requires claw-like tension on the intermediate knuckles.',
    audioWord: 'E',
    landmarks: [
      { x: 50, y: 90 }, { x: 38, y: 80 }, { x: 36, y: 70 }, { x: 40, y: 62 }, { x: 46, y: 58 },
      { x: 40, y: 52 }, { x: 40, y: 40 }, { x: 44, y: 46 }, { x: 44, y: 54 },
      { x: 48, y: 50 }, { x: 48, y: 38 }, { x: 52, y: 44 }, { x: 52, y: 52 },
      { x: 56, y: 52 }, { x: 56, y: 40 }, { x: 60, y: 46 }, { x: 60, y: 54 },
      { x: 64, y: 56 }, { x: 64, y: 46 }, { x: 68, y: 52 }, { x: 68, y: 60 }
    ]
  },
  {
    letter: 'F',
    category: 'Key Signatures',
    difficulty: 'Intermediate',
    xp: 30,
    hint: 'Index finger and thumb touch to form a circle; remaining three fingers extended up.',
    funFact: 'The mirror opposite shape of letter D in fingerspelling.',
    audioWord: 'F',
    landmarks: [
      { x: 50, y: 90 }, { x: 38, y: 78 }, { x: 34, y: 66 }, { x: 38, y: 56 }, { x: 44, y: 50 },
      { x: 40, y: 52 }, { x: 42, y: 44 }, { x: 44, y: 48 }, { x: 44, y: 52 },
      { x: 48, y: 48 }, { x: 48, y: 32 }, { x: 48, y: 18 }, { x: 48, y: 6 },
      { x: 56, y: 50 }, { x: 56, y: 34 }, { x: 56, y: 20 }, { x: 56, y: 8 },
      { x: 64, y: 54 }, { x: 64, y: 40 }, { x: 64, y: 28 }, { x: 64, y: 18 }
    ]
  },
  {
    letter: 'G',
    category: 'Horizontal Signs',
    difficulty: 'Intermediate',
    xp: 30,
    hint: 'Index finger and thumb point horizontally to the side in parallel.',
    funFact: 'Often used to indicate small thickness or gauge.',
    audioWord: 'G',
    landmarks: [
      { x: 50, y: 88 }, { x: 42, y: 76 }, { x: 44, y: 64 }, { x: 52, y: 56 }, { x: 64, y: 52 },
      { x: 40, y: 52 }, { x: 52, y: 48 }, { x: 66, y: 44 }, { x: 80, y: 42 },
      { x: 44, y: 58 }, { x: 48, y: 66 }, { x: 48, y: 74 }, { x: 46, y: 80 },
      { x: 50, y: 62 }, { x: 54, y: 68 }, { x: 54, y: 76 }, { x: 52, y: 82 },
      { x: 56, y: 66 }, { x: 60, y: 72 }, { x: 60, y: 80 }, { x: 58, y: 84 }
    ]
  },
  {
    letter: 'H',
    category: 'Horizontal Signs',
    difficulty: 'Intermediate',
    xp: 30,
    hint: 'Index and middle fingers held straight and flat horizontally side-by-side.',
    funFact: 'Extending two fingers horizontally mimics the number 2 in horizontal space.',
    audioWord: 'H',
    landmarks: [
      { x: 50, y: 88 }, { x: 42, y: 76 }, { x: 44, y: 66 }, { x: 48, y: 60 }, { x: 50, y: 56 },
      { x: 38, y: 50 }, { x: 52, y: 46 }, { x: 66, y: 42 }, { x: 80, y: 38 },
      { x: 42, y: 54 }, { x: 56, y: 50 }, { x: 70, y: 46 }, { x: 84, y: 42 },
      { x: 48, y: 60 }, { x: 50, y: 68 }, { x: 50, y: 76 }, { x: 48, y: 82 },
      { x: 54, y: 64 }, { x: 56, y: 72 }, { x: 56, y: 80 }, { x: 54, y: 84 }
    ]
  },
  {
    letter: 'I',
    category: 'Vowels & Core',
    difficulty: 'Beginner',
    xp: 20,
    hint: 'Pinky finger straight up, remaining fingers folded into a fist with thumb across.',
    funFact: 'Pinky extension is key for words like "Idea" and "Island".',
    audioWord: 'I',
    landmarks: [
      { x: 50, y: 90 }, { x: 40, y: 80 }, { x: 42, y: 70 }, { x: 48, y: 64 }, { x: 52, y: 60 },
      { x: 38, y: 54 }, { x: 38, y: 66 }, { x: 38, y: 76 }, { x: 38, y: 82 },
      { x: 46, y: 52 }, { x: 46, y: 64 }, { x: 46, y: 74 }, { x: 46, y: 80 },
      { x: 54, y: 54 }, { x: 54, y: 66 }, { x: 54, y: 76 }, { x: 54, y: 82 },
      { x: 62, y: 56 }, { x: 66, y: 40 }, { x: 70, y: 26 }, { x: 74, y: 12 }
    ]
  },
  {
    letter: 'K',
    category: 'Advanced Handshape',
    difficulty: 'Advanced',
    xp: 35,
    hint: 'Index finger upright, middle finger forward at an angle, thumb tucked between them.',
    funFact: 'The palm faces outward with the thumb touching the middle knuckle.',
    audioWord: 'K',
    landmarks: [
      { x: 50, y: 90 }, { x: 40, y: 78 }, { x: 40, y: 64 }, { x: 44, y: 52 }, { x: 48, y: 44 },
      { x: 38, y: 48 }, { x: 36, y: 32 }, { x: 34, y: 18 }, { x: 32, y: 6 },
      { x: 48, y: 48 }, { x: 54, y: 38 }, { x: 60, y: 30 }, { x: 66, y: 22 },
      { x: 56, y: 54 }, { x: 58, y: 64 }, { x: 58, y: 74 }, { x: 56, y: 80 },
      { x: 64, y: 58 }, { x: 66, y: 68 }, { x: 66, y: 78 }, { x: 64, y: 84 }
    ]
  },
  {
    letter: 'L',
    category: 'Iconic Shapes',
    difficulty: 'Beginner',
    xp: 20,
    hint: 'Thumb and index finger extended at a 90-degree right angle to form an "L".',
    funFact: 'One of the most universally recognized sign language shapes worldwide.',
    audioWord: 'L',
    landmarks: [
      { x: 50, y: 90 }, { x: 36, y: 82 }, { x: 26, y: 76 }, { x: 16, y: 72 }, { x: 6, y: 70 },
      { x: 38, y: 48 }, { x: 38, y: 32 }, { x: 38, y: 18 }, { x: 38, y: 6 },
      { x: 48, y: 52 }, { x: 50, y: 64 }, { x: 50, y: 74 }, { x: 48, y: 80 },
      { x: 56, y: 56 }, { x: 58, y: 66 }, { x: 58, y: 76 }, { x: 56, y: 82 },
      { x: 64, y: 60 }, { x: 66, y: 70 }, { x: 66, y: 80 }, { x: 64, y: 84 }
    ]
  },
  {
    letter: 'M',
    category: 'Fingers Over Thumb',
    difficulty: 'Intermediate',
    xp: 30,
    hint: 'Three fingers (index, middle, ring) folded over the thumb, with the thumb tip resting under the ring finger.',
    funFact: 'Three knuckles visible on top represent the three legs of the letter M.',
    audioWord: 'M',
    landmarks: [
      { x: 50, y: 90 }, { x: 42, y: 78 }, { x: 46, y: 68 }, { x: 56, y: 64 }, { x: 64, y: 66 },
      { x: 40, y: 52 }, { x: 42, y: 44 }, { x: 44, y: 54 }, { x: 44, y: 64 },
      { x: 48, y: 50 }, { x: 50, y: 42 }, { x: 52, y: 52 }, { x: 52, y: 64 },
      { x: 56, y: 52 }, { x: 58, y: 44 }, { x: 60, y: 54 }, { x: 60, y: 66 },
      { x: 64, y: 58 }, { x: 64, y: 68 }, { x: 64, y: 78 }, { x: 64, y: 84 }
    ]
  },
  {
    letter: 'N',
    category: 'Fingers Over Thumb',
    difficulty: 'Intermediate',
    xp: 30,
    hint: 'Two fingers (index and middle) folded over the thumb so the thumb tip peeks out between the middle and ring fingers.',
    funFact: 'Two knuckles resting over the thumb represent the two downward stems of the letter N.',
    audioWord: 'N',
    landmarks: [
      { x: 50, y: 90 }, { x: 42, y: 78 }, { x: 46, y: 68 }, { x: 52, y: 64 }, { x: 58, y: 66 },
      { x: 40, y: 52 }, { x: 42, y: 44 }, { x: 44, y: 54 }, { x: 44, y: 64 },
      { x: 48, y: 50 }, { x: 50, y: 42 }, { x: 52, y: 52 }, { x: 52, y: 64 },
      { x: 56, y: 54 }, { x: 56, y: 66 }, { x: 56, y: 76 }, { x: 56, y: 82 },
      { x: 64, y: 58 }, { x: 64, y: 68 }, { x: 64, y: 78 }, { x: 64, y: 84 }
    ]
  },
  {
    letter: 'O',
    category: 'Vowels & Core',
    difficulty: 'Beginner',
    xp: 20,
    hint: 'All fingers curl down to touch the thumb, forming a complete circle "O".',
    funFact: 'Represents round objects and is a foundational closed classifier.',
    audioWord: 'O',
    landmarks: [
      { x: 50, y: 90 }, { x: 40, y: 78 }, { x: 36, y: 68 }, { x: 40, y: 58 }, { x: 48, y: 54 },
      { x: 40, y: 52 }, { x: 40, y: 38 }, { x: 44, y: 44 }, { x: 48, y: 54 },
      { x: 48, y: 50 }, { x: 48, y: 36 }, { x: 50, y: 42 }, { x: 50, y: 54 },
      { x: 56, y: 52 }, { x: 56, y: 38 }, { x: 56, y: 44 }, { x: 54, y: 56 },
      { x: 64, y: 56 }, { x: 64, y: 44 }, { x: 62, y: 50 }, { x: 58, y: 60 }
    ]
  },
  {
    letter: 'P',
    category: 'Downward Shapes',
    difficulty: 'Intermediate',
    xp: 30,
    hint: 'Hand tilted downward with index pointing forward, middle finger bent straight down, and thumb touching middle knuckle.',
    funFact: 'The shape is an inverted letter K pointing towards the ground.',
    audioWord: 'P',
    landmarks: [
      { x: 50, y: 90 }, { x: 42, y: 78 }, { x: 44, y: 66 }, { x: 48, y: 58 }, { x: 52, y: 54 },
      { x: 40, y: 50 }, { x: 52, y: 46 }, { x: 66, y: 44 }, { x: 80, y: 42 },
      { x: 46, y: 52 }, { x: 48, y: 64 }, { x: 50, y: 76 }, { x: 50, y: 88 },
      { x: 54, y: 56 }, { x: 56, y: 66 }, { x: 56, y: 76 }, { x: 54, y: 82 },
      { x: 62, y: 60 }, { x: 64, y: 70 }, { x: 64, y: 80 }, { x: 62, y: 84 }
    ]
  },
  {
    letter: 'R',
    category: 'Crossed Shapes',
    difficulty: 'Intermediate',
    xp: 30,
    hint: 'Index and middle fingers crossed over one another (middle over index).',
    funFact: 'Associated with the phrase "fingers crossed for good luck".',
    audioWord: 'R',
    landmarks: [
      { x: 50, y: 90 }, { x: 40, y: 80 }, { x: 42, y: 70 }, { x: 48, y: 64 }, { x: 52, y: 60 },
      { x: 40, y: 48 }, { x: 44, y: 32 }, { x: 46, y: 18 }, { x: 48, y: 6 },
      { x: 48, y: 48 }, { x: 42, y: 32 }, { x: 38, y: 18 }, { x: 36, y: 6 },
      { x: 56, y: 54 }, { x: 58, y: 64 }, { x: 58, y: 74 }, { x: 56, y: 80 },
      { x: 64, y: 58 }, { x: 66, y: 68 }, { x: 66, y: 78 }, { x: 64, y: 84 }
    ]
  },
  {
    letter: 'S',
    category: 'Fist Signatures',
    difficulty: 'Beginner',
    xp: 20,
    hint: 'Full fist with thumb crossed firmly across the front of all fingers.',
    funFact: 'Compare to "A" where the thumb rests beside the index finger.',
    audioWord: 'S',
    landmarks: [
      { x: 50, y: 88 }, { x: 38, y: 78 }, { x: 42, y: 66 }, { x: 52, y: 62 }, { x: 62, y: 64 },
      { x: 40, y: 54 }, { x: 40, y: 66 }, { x: 40, y: 74 }, { x: 40, y: 80 },
      { x: 48, y: 52 }, { x: 48, y: 64 }, { x: 48, y: 74 }, { x: 48, y: 80 },
      { x: 56, y: 54 }, { x: 56, y: 66 }, { x: 56, y: 74 }, { x: 56, y: 80 },
      { x: 64, y: 58 }, { x: 64, y: 68 }, { x: 64, y: 76 }, { x: 64, y: 82 }
    ]
  },
  {
    letter: 'U',
    category: 'Upright Shapes',
    difficulty: 'Beginner',
    xp: 20,
    hint: 'Index and middle fingers straight up and held tightly together.',
    funFact: 'Distinguished from "V" by keeping both fingers pressed flush together.',
    audioWord: 'U',
    landmarks: [
      { x: 50, y: 90 }, { x: 40, y: 80 }, { x: 42, y: 70 }, { x: 48, y: 64 }, { x: 52, y: 60 },
      { x: 42, y: 48 }, { x: 42, y: 32 }, { x: 42, y: 18 }, { x: 42, y: 6 },
      { x: 48, y: 48 }, { x: 48, y: 32 }, { x: 48, y: 18 }, { x: 48, y: 6 },
      { x: 56, y: 54 }, { x: 58, y: 64 }, { x: 58, y: 74 }, { x: 56, y: 80 },
      { x: 64, y: 58 }, { x: 66, y: 68 }, { x: 66, y: 78 }, { x: 64, y: 84 }
    ]
  },
  {
    letter: 'V',
    category: 'Peace & Victory',
    difficulty: 'Beginner',
    xp: 20,
    hint: 'Index and middle fingers extended up spread apart in a "V" shape.',
    funFact: 'Represents the number 2 or eyesight direction in sign linguistics.',
    audioWord: 'V',
    landmarks: [
      { x: 50, y: 90 }, { x: 40, y: 80 }, { x: 42, y: 70 }, { x: 48, y: 64 }, { x: 52, y: 60 },
      { x: 40, y: 48 }, { x: 36, y: 32 }, { x: 32, y: 18 }, { x: 28, y: 6 },
      { x: 48, y: 48 }, { x: 52, y: 32 }, { x: 56, y: 18 }, { x: 60, y: 6 },
      { x: 56, y: 54 }, { x: 58, y: 64 }, { x: 58, y: 74 }, { x: 56, y: 80 },
      { x: 64, y: 58 }, { x: 66, y: 68 }, { x: 66, y: 78 }, { x: 64, y: 84 }
    ]
  },
  {
    letter: 'W',
    category: 'Tri-Finger Handshape',
    difficulty: 'Intermediate',
    xp: 25,
    hint: 'Index, middle, and ring fingers extended upward and spread into a "W".',
    funFact: 'Represents the number 3 or water in contextual ASL conversations.',
    audioWord: 'W',
    landmarks: [
      { x: 50, y: 90 }, { x: 40, y: 80 }, { x: 44, y: 70 }, { x: 50, y: 64 }, { x: 58, y: 62 },
      { x: 38, y: 48 }, { x: 34, y: 32 }, { x: 30, y: 18 }, { x: 26, y: 6 },
      { x: 46, y: 46 }, { x: 46, y: 30 }, { x: 46, y: 16 }, { x: 46, y: 4 },
      { x: 54, y: 48 }, { x: 58, y: 32 }, { x: 62, y: 18 }, { x: 66, y: 6 },
      { x: 64, y: 58 }, { x: 66, y: 68 }, { x: 66, y: 78 }, { x: 64, y: 84 }
    ]
  },
  {
    letter: 'Y',
    category: 'Hang Loose Handshape',
    difficulty: 'Beginner',
    xp: 20,
    hint: 'Thumb and pinky finger fully extended out, three middle fingers curled down.',
    funFact: 'Directly mirrors the "Shaka" gesture; widely used in greetings.',
    audioWord: 'Y',
    landmarks: [
      { x: 50, y: 90 }, { x: 36, y: 80 }, { x: 24, y: 72 }, { x: 14, y: 64 }, { x: 6, y: 56 },
      { x: 42, y: 56 }, { x: 42, y: 66 }, { x: 42, y: 76 }, { x: 42, y: 82 },
      { x: 50, y: 54 }, { x: 50, y: 64 }, { x: 50, y: 74 }, { x: 50, y: 80 },
      { x: 58, y: 56 }, { x: 58, y: 66 }, { x: 58, y: 76 }, { x: 58, y: 82 },
      { x: 66, y: 60 }, { x: 74, y: 48 }, { x: 82, y: 36 }, { x: 90, y: 24 }
    ]
  }
];

export const wordChallenges = [
  {
    id: 'w1',
    word: 'HELLO',
    level: 'Beginner',
    xpReward: 60,
    meaning: 'Friendly universal greeting',
    letters: ['H', 'E', 'L', 'L', 'O']
  },
  {
    id: 'w2',
    word: 'SIGN',
    level: 'Beginner',
    xpReward: 50,
    meaning: 'Visual language expression',
    letters: ['S', 'I', 'G', 'N']
  },
  {
    id: 'w3',
    word: 'PEACE',
    level: 'Intermediate',
    xpReward: 90,
    meaning: 'Harmony, tranquil conversation',
    letters: ['P', 'E', 'A', 'C', 'E']
  },
  {
    id: 'w4',
    word: 'VOICE',
    level: 'Intermediate',
    xpReward: 100,
    meaning: 'Sign-to-speech audio synthesis',
    letters: ['V', 'O', 'I', 'C', 'E']
  },
  {
    id: 'w5',
    word: 'LOVE',
    level: 'Beginner',
    xpReward: 55,
    meaning: 'Care, warmth and connection',
    letters: ['L', 'O', 'V', 'E']
  },
  {
    id: 'w6',
    word: 'WORLD',
    level: 'Intermediate',
    xpReward: 95,
    meaning: 'Global inclusive accessibility',
    letters: ['W', 'O', 'R', 'L', 'D']
  },
  {
    id: 'w7',
    word: 'ACCESS',
    level: 'Advanced',
    xpReward: 140,
    meaning: 'Empowering communication for all',
    letters: ['A', 'C', 'C', 'E', 'S', 'S']
  }
];

export const achievementsList = [
  {
    id: 'first_letter',
    title: 'First Sign',
    description: 'Inspect and practice your first ASL letter landmark mesh.',
    xpRequired: 20
  },
  {
    id: 'vowel_master',
    title: 'Vowel Virtuoso',
    description: 'Learn the primary vowels A, E, I, O in the interactive dictionary.',
    xpRequired: 80
  },
  {
    id: 'speed_driller',
    title: 'Flashcard Sprint',
    description: 'Score 100+ points in the speed recognition game mode.',
    xpRequired: 150
  },
  {
    id: 'word_crafter',
    title: 'Spelling Champion',
    description: 'Complete a full word spelling sequence in the sandbox.',
    xpRequired: 250
  }
];
