# FE-ADMIN - Administrator Dashboard Application

Frontend web application for Administrators and Instructors to manage the English Listening and Reading Assessment platform.

---

## 1. Key Features

1. Dashboard and Analytics:
   - Real-time statistics on total tests, question banks, active users, and attempt counts.
   - Graphical charts detailing learner level distributions and completion rates.

2. Placement Test Management:
   - Authoring, editing, and previewing multi-section tests.
   - Comprehensive question management supporting multiple formats.
   - Drag-and-drop question and section reordering powered by `@hello-pangea/dnd`.
   - Media asset upload and management (Audio, Image).

3. Intelligent Document Parser & Importer:
   - Direct upload support for Word (.docx), Excel (.xlsx), and PDF (.pdf) documents.
   - Automated extraction of metadata, reading passages, question items, options, and answers.
   - Interactive full preview allowing live editing prior to database commitment.
   - Downloadable sample templates available under `public/import-samples/`.

4. Skill Practice Library Management:
   - Separate organization for Reading and Listening practices.
   - Tiered categorization: AV1-AV3, AV4-AV5, AV6, AV7.

5. Lesson and Roadmap Configuration:
   - WYSIWYG rich text editor for theory lesson authoring.
   - Multi-stage learning roadmap configuration mapped to proficiency benchmarks.

6. User and Access Control:
   - Role management (Admin / User), account activation, and password resets.

---

## 2. Setup and Execution

1. Install dependencies:
```bash
cd fe-admin
npm install
```

2. Configure environment variables in `.env`:
```env
PORT=3000
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_BASE_URL=http://localhost:3000
```

3. Start development server:
```bash
npm start
```

The application will run at `http://localhost:3000`.

---

## 3. Source Directory Structure

```
fe-admin/
├── public/
│   ├── import-samples/        # Sample import templates (.docx, .xlsx)
│   └── index.html
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── layout/            # Layout, Header, Sidebar
│   │   ├── ui/                # Button, Modal, Table, Loader
│   │   └── editor/            # Rich text editor
│   ├── pages/                 # Administrator pages
│   │   ├── DashboardPage.tsx  # Overview metrics
│   │   ├── PlacementTestPage/ # Placement test manager, editor, importer
│   │   ├── PracticePage/      # Practice manager, editor, importer
│   │   ├── LessonsPage/       # Lesson authoring
│   │   ├── RoadmapPage/       # Roadmap builder
│   │   ├── BlogPage/          # Blog publishing
│   │   └── UsersPage/         # User directory
│   ├── services/              # API Client integration
│   ├── types/                 # TypeScript type declarations
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
The compiled output is located in the `build/` directory, ready for deployment to any static web server (Nginx, Apache, Vercel, Netlify).
