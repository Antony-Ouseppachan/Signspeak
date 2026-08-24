import { neon } from '@neondatabase/serverless';

const databaseUrl = 'postgresql://neondb_owner:npg_ReOL70VBcXfW@ep-bold-butterfly-b389b1j5-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function seedData() {
  console.log('Connecting to Neon PostgreSQL...');
  const sql = neon(databaseUrl);

  // 1. Seed Realistic Community Users
  const sampleUsers = [
    {
      uid: 'user_alex_keller_01',
      email: 'alex.keller@berkeley.edu',
      display_name: 'Alex Keller',
      photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    {
      uid: 'user_priya_sharma_02',
      email: 'priya.s@tuta.io',
      display_name: 'Priya Sharma',
      photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    },
    {
      uid: 'user_marcus_vance_03',
      email: 'm.vance@mit.edu',
      display_name: 'Marcus Vance',
      photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    {
      uid: 'user_elena_rostova_04',
      email: 'elena.rostova@designlab.org',
      display_name: 'Elena Rostova',
      photo_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
    },
    {
      uid: 'user_david_chen_05',
      email: 'dchen.asl@gmail.com',
      display_name: 'David Chen',
      photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    },
    {
      uid: 'user_sarah_jenkins_06',
      email: 'sjenkins@deafcommunity.org',
      display_name: 'Sarah Jenkins',
      photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
    },
    {
      uid: 'user_karthik_rajan_07',
      email: 'karthik.r@iisc.ac.in',
      display_name: 'Karthik Rajan',
      photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'
    },
    {
      uid: 'user_maya_lin_08',
      email: 'maya.lin.ux@proton.me',
      display_name: 'Maya Lin',
      photo_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80'
    },
    {
      uid: 'user_jordan_reed_09',
      email: 'jordan.reed@accessibilityfirst.io',
      display_name: 'Jordan Reed',
      photo_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80'
    },
    {
      uid: 'user_ananya_nair_10',
      email: 'ananya.nair@christuniversity.in',
      display_name: 'Ananya Nair',
      photo_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
    }
  ];

  console.log('Inserting/updating sample users...');
  const userMap = {};

  for (const u of sampleUsers) {
    const rows = await sql`
      INSERT INTO users (firebase_uid, email, display_name, photo_url, last_login_at)
      VALUES (${u.uid}, ${u.email}, ${u.display_name}, ${u.photo_url}, NOW() - (RANDOM() * INTERVAL '7 days'))
      ON CONFLICT (firebase_uid) DO UPDATE
      SET email = EXCLUDED.email, display_name = EXCLUDED.display_name, photo_url = EXCLUDED.photo_url
      RETURNING id, email;
    `;
    if (rows && rows[0]) {
      userMap[u.email] = rows[0].id;
    }
  }

  // 2. Realistic Community Feedback (10 records)
  const feedbackData = [
    {
      email: 'alex.keller@berkeley.edu',
      rating: 5,
      categories: ['Speech Accuracy', 'Feature Request'],
      message: 'Tested this during my 45-minute lab seminar on Google Meet. The local landmark pipeline kept up with my rapid fingerspelling around 24-28 FPS on an M2 MacBook. Would love a toggle for custom speed presets on the speech synthesis voice.',
      contact_opt_in: true,
      created_offset: '2 hours'
    },
    {
      email: 'priya.s@tuta.io',
      rating: 4,
      categories: ['Detection Latency', 'Bug'],
      message: 'Detection is remarkably responsive in good daylight! In dim room lighting around 7 PM, the thumb landmark (points 2-4) occasionally flickered between letters "M" and "N". Adding adaptive contrast normalization would make this bulletproof.',
      contact_opt_in: true,
      created_offset: '8 hours'
    },
    {
      email: 'm.vance@mit.edu',
      rating: 5,
      categories: ['Speech Accuracy', 'Design'],
      message: 'The zero-telemetry architecture is what sold our university lab on deploying this. Knowing video streams never leave client WebAssembly memory satisfies our strict student privacy compliance. Outstanding execution.',
      contact_opt_in: false,
      created_offset: '1 day'
    },
    {
      email: 'elena.rostova@designlab.org',
      rating: 5,
      categories: ['Design', 'Praise'],
      message: 'The HUD overlays and real-time landmark bone rendering look super clean and intuitive. The dark sand / terracotta color palette feels respectful and modern rather than clinical. Kudos to the design team!',
      contact_opt_in: true,
      created_offset: '2 days'
    },
    {
      email: 'dchen.asl@gmail.com',
      rating: 4,
      categories: ['Speech Accuracy', 'Feature Request'],
      message: 'As a CODA (Child of Deaf Adults), I tested fingerspelling names and technical terms. Accuracy for single-hand gestures is ~94%. Please consider adding a hotkey to clear the current letter buffer or insert spaces with a palm swipe gesture.',
      contact_opt_in: true,
      created_offset: '3 days'
    },
    {
      email: 'sarah.jenkins@deafcommunity.org',
      rating: 5,
      categories: ['Praise', 'Speech Accuracy'],
      message: 'Used SignSpeak in a standup meeting this morning with hearing colleagues who don\'t know ASL. They were able to hear my signing directly translated into clear speech with practically zero delay. Life changing tool.',
      contact_opt_in: true,
      created_offset: '4 days'
    },
    {
      email: 'karthik.r@iisc.ac.in',
      rating: 3,
      categories: ['Bug', 'Detection Latency'],
      message: 'CPU usage stayed under 18% in Chrome, which is great. However, on dual-monitor setups when dragging the browser window across displays, WebGL landmark rendering paused for about 1.5 seconds. Re-initialization should be seamless.',
      contact_opt_in: false,
      created_offset: '5 days'
    },
    {
      email: 'maya.lin.ux@proton.me',
      rating: 5,
      categories: ['Feature Request', 'Design'],
      message: 'Can we get an option to customize the Web Speech API voice pitch and accent? For non-binary signers, having neutral vocal profiles would be an incredible addition to inclusivity.',
      contact_opt_in: true,
      created_offset: '6 days'
    },
    {
      email: 'jordan.reed@accessibilityfirst.io',
      rating: 4,
      categories: ['Speech Accuracy', 'Feature Request'],
      message: 'The ASL static alphabet dataset handles letters A-Z cleanly. Are there plans to train a 2D CNN or LSTM sequence model for common two-handed conversational signs (e.g. "Thank you", "Help", "Yes", "No") in v2.0?',
      contact_opt_in: true,
      created_offset: '8 days'
    },
    {
      email: 'ananya.nair@christuniversity.in',
      rating: 5,
      categories: ['Speech Accuracy', 'Praise'],
      message: 'Demonstrated SignSpeak in our BCA accessibility symposium today. The judges and faculty were deeply impressed by how effortlessly the MediaPipe pipeline runs without any server lag or GPU requirement. 10/10.',
      contact_opt_in: true,
      created_offset: '10 days'
    }
  ];

  console.log('Inserting realistic feedback entries...');
  for (const fb of feedbackData) {
    const userId = userMap[fb.email] || null;
    await sql`
      INSERT INTO feedback (user_id, rating, categories, message, contact_opt_in, page, created_at)
      VALUES (
        ${userId},
        ${fb.rating},
        ${JSON.stringify(fb.categories)}::jsonb,
        ${fb.message},
        ${fb.contact_opt_in},
        'sandbox',
        NOW() - ${fb.created_offset}::INTERVAL
      );
    `;
  }

  // 3. Realistic Inbound Contact Messages (10 records)
  const contactMessages = [
    {
      name: 'Dr. Arthur Sterling',
      email: 'sterling.a@oxford-disability.org',
      subject: 'Partnership / Academic research',
      message: 'Greetings SignSpeak Team. Our department at Oxford is conducting an NSF-funded study on real-time assistive communication interfaces for hard-of-hearing university students. We would like to explore integrating SignSpeak into our pilot lecture trials this autumn. Could we schedule a 20-minute Zoom call?',
      status: 'unread',
      created_offset: '3 hours'
    },
    {
      name: 'Claire Beauchamp',
      email: 'claire.b@inclusivework.co',
      subject: 'Google Meet Extension integration',
      message: 'Hi there, our enterprise team uses Google Workspace extensively. We have 14 deaf employees across product and QA. We installed your unpacked Chrome extension and it works wonders. Is there an enterprise policy manifest or enterprise deployment guide available for G-Suite admins?',
      status: 'unread',
      created_offset: '7 hours'
    },
    {
      name: 'Rohan Deshmukh',
      email: 'rohan.deshmukh98@gmail.com',
      subject: 'Bug report / Detection glitch',
      message: 'Encountered an edge case: when wearing a watch with a metallic reflective band, MediaPipe occasionally detects the watch buckle as joint landmark 0 (wrist) with high jitter. Turning the watch inward solved it, but thought you might want to know for heuristic filtering.',
      status: 'unread',
      created_offset: '14 hours'
    },
    {
      name: 'Emily Watson',
      email: 'emily.watson@specialedu.k12.wa.us',
      subject: 'ASL Dictionary suggestion',
      message: 'Hello! I am an elementary school educator for deaf children in Seattle. The children are fascinated by seeing their fingerspelling turn into voice on screen! Would it be possible to add a visual learning mode where the app displays flashcards and verifies if the student signs the letter correctly?',
      status: 'unread',
      created_offset: '1 day'
    },
    {
      name: 'Vikramaditya Sengupta',
      email: 'v.sengupta@iitb.ac.in',
      subject: 'Partnership / Academic research',
      message: 'Dear Authors, I reviewed your lightweight feature extraction methodology on 63 normalized coordinates. We have an Indian Sign Language (ISL) dataset with 50,000 landmark frames. Would your team be interested in co-authoring a benchmark paper for multi-dialect sign recognition?',
      status: 'unread',
      created_offset: '2 days'
    },
    {
      name: 'Jessica Gomez',
      email: 'jess.gomez@techaccessibility.org',
      subject: 'General question',
      message: 'Hi SignSpeak team, do you have an open-source contributor guide? A group of deaf developers in our meetup group in Austin would love to contribute custom keyboard shortcut handlers and Spanish TTS voice support to the repo.',
      status: 'unread',
      created_offset: '3 days'
    },
    {
      name: 'Liam O\'Connor',
      email: 'liam.oconnor@telehealth-connect.ie',
      subject: 'Google Meet Extension integration',
      message: 'We are developing a telehealth portal for remote patient consultations in Dublin. Having sign-to-speech embedded directly inside medical video calls could bridge a critical communication gap for our clinical team. Is your WebAssembly module exportable as an npm package?',
      status: 'unread',
      created_offset: '4 days'
    },
    {
      name: 'Ananya Nair',
      email: 'ananya.nair@christuniversity.in',
      subject: 'General question',
      message: 'Hi team! Following our department presentation at Christ University, our faculty head requested a copy of the system architecture diagram and accuracy comparison metrics for the departmental library. Could you share high-res exports of the technical slides?',
      status: 'unread',
      created_offset: '5 days'
    },
    {
      name: 'Marcus Vance',
      email: 'm.vance@mit.edu',
      subject: 'Bug report / Detection glitch',
      message: 'Found that on Firefox Nightly (v130) on Linux Wayland, navigator.mediaDevices.getUserMedia asks for permissions twice if the camera canvas is unmounted and remounted rapidly. In Chrome/Chromium it works smoothly without re-prompting.',
      status: 'unread',
      created_offset: '7 days'
    },
    {
      name: 'Dr. Sophia Lindqvist',
      email: 'sophia.l@karolinska.se',
      subject: 'Partnership / Academic research',
      message: 'Our clinical neuroscience research team at Karolinska Institute is investigating cognitive load reduction in deaf individuals when using assistive voice synthesis during professional remote work. We would like to evaluate SignSpeak as the primary intervention tool for our 6-month clinical cohort.',
      status: 'unread',
      created_offset: '9 days'
    }
  ];

  console.log('Inserting realistic contact submissions...');
  for (const cm of contactMessages) {
    const userId = userMap[cm.email] || null;
    await sql`
      INSERT INTO contact_messages (user_id, name, email, subject, message, status, created_at)
      VALUES (
        ${userId},
        ${cm.name},
        ${cm.email},
        ${cm.subject},
        ${cm.message},
        ${cm.status},
        NOW() - ${cm.created_offset}::INTERVAL
      );
    `;
  }

  // 4. Verify counts
  const fbCount = await sql`SELECT COUNT(*) AS total FROM feedback;`;
  const cmCount = await sql`SELECT COUNT(*) AS total FROM contact_messages;`;
  const userCount = await sql`SELECT COUNT(*) AS total FROM users;`;

  console.log(`\nSuccessfully seeded Neon database!`);
  console.log(`Users: ${userCount[0].total}`);
  console.log(`Feedback Records: ${fbCount[0].total}`);
  console.log(`Contact Messages: ${cmCount[0].total}`);
}

seedData().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
