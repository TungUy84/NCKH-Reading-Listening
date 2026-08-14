# FE-USER - Learner Web Application

Frontend web application for Learners to take English placement tests, practice Listening and Reading skills, follow personalized roadmaps, and track performance analytics.

---

## 1. Key Features

1. Authentication and Profile Management:
   - Secure registration, JWT-authenticated login, avatar uploads, and password modification.

2. Placement Testing Engine:
   - Standardized multi-part tests assessing Listening and Reading proficiency.
   - Synchronized countdown timer, automatic progress persistence in LocalStorage, and automated submission upon time expiry.
   - Deterministic scoring algorithm assigning proficiency levels from AV1 to AV7.

3. Skill Practice Library:
   - Segregated learning paths for Reading and Listening skills.
   - Filterable by proficiency tiers (AV1-AV3, AV4-AV5, AV6, AV7) and search keywords.
   - Dedicated Reading Experience:
     - Split Pane Resizer for simultaneous reading passage and question evaluation.
     - Text Zoom Controller (A- / A+) for enhanced reading comfort across devices.
     - Inline text highlighting and contextual note-taking on passage segments.
   - Dedicated Listening Experience: Custom player with precise seek controls and section-based audio segmentation.

4. Result Evaluation and Detailed Review:
   - Post-test score summary, completion duration, and accuracy metrics by question type.
   - Two-column review interface: side-by-side display of original passage/audio alongside user responses, correct answers, and thorough explanations.

5. Personalized Learning Roadmaps and Lessons:
   - Automatic roadmap unlocking aligned with placement test outcomes.
   - Structured theoretical lessons paired with checkpoint practice exercises.

6. Blog and Learning Analytics:
   - Language learning tips, examination news, and strategy guides.
   - Graphical performance tracking across practice attempts over time.

---

## 2. Setup and Execution

1. Install dependencies:
```bash
cd fe-user
npm install
```

2. Configure environment variables in `.env`:
```env
PORT=3002
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_BASE_URL=http://localhost:3002
```

3. Start development server:
```bash
npm start
```

The application will run at `http://localhost:3002`.

---

## 3. Source Directory Structure

```
fe-user/
├── public/
│   └── index.html
├── src/
│   ├── components/            # Header, Footer, Audio Player, Button, UI Components
│   ├── pages/
│   │   ├── HomePage.tsx       # Landing page
│   │   ├── PlacementTestPage/ # Placement test taking, summary, and results
│   │   ├── PracticePage/      # Skill practice library, taking flow, review
│   │   ├── LessonsPage/       # Lesson modules and theoretical contents
│   │   ├── RoadmapPage/       # Personalized learning roadmap
│   │   ├── BlogPage/          # Tips, news, and learning strategies
│   │   └── UserPage/          # User profile, security, performance statistics
│   ├── services/              # API integration client (Axios)
│   ├── types/                 # TypeScript type declarations
│   ├── utils/                 # Formatters, media handlers, highlight persistence
│   ├── App.tsx
│   ├── index.tsx
│   └── index.css
├── package.json
└── tsconfig.json
```

---

## 4. Production Build

To generate an optimized production bundle:
```bash
npm run build
```
The compiled output is located in the `build/` directory, ready for deployment to any static hosting provider.
