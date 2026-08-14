# English Exit Exam Prep Platform

This repository contains the backend services and RESTful APIs for the UNSkills platform, built with Node.js and Express.js. It handles user authentication, automated grading for placement tests, personalized learning roadmaps, and integrates with AI models for content generation.

---

## Table of Contents

1. System Overview
2. Architecture and Technology Stack
3. Directory Structure
4. Core Features
   - Learner Portal (fe-user)
   - Administrator Portal (fe-admin)
   - Backend API Service (Server)
5. Supported Question Types and Test Formats
6. Installation and Setup Guide
7. Environment Variable Configuration
8. API Endpoints Reference
9. Test Parsing and Import Workflow
10. Roadmap and Future Improvements

---

## 1. System Overview

This platform is engineered to digitize English language assessment and practice through the following core objectives:
- Initial proficiency assessment through standardized multi-skill Placement Tests.
- Automated level determination corresponding to proficiency benchmarks from AV1 through AV7.
- Dynamic delivery of personalized learning roadmaps comprising theoretical lessons and skill-building practices.
- Advanced examination interfaces with automated scoring, persistent progress tracking, and granular answer explanations.
- Administrative control with automated test parsing from Word (.docx), Excel (.xlsx), and PDF (.pdf) documents, combined with AI-assisted question generation and audio transcription.

---

## 2. Architecture and Technology Stack

The platform follows a decoupled client-server architecture with dedicated frontends for learners and administrators:

### Frontend Applications
- fe-user (Learner Portal):
  - Core: React 18, TypeScript
  - Routing: React Router v6
  - Styling: Tailwind CSS (Custom Design System)
  - Interactive Utilities: Split Pane Resizer (flexible passage-question layout), Highlighter & Note Taking Engine, Text Zoom Controller (A- / A+)
  - Media: Custom HTML5 Audio Player with seek controls and duration tracking
  - UI Feedback: SweetAlert2, React Toastify, AOS Animations, Headless UI, Heroicons

- fe-admin (Administration Dashboard):
  - Core: React 18, TypeScript
  - Drag and Drop: @hello-pangea/dnd (interactive reordering of test sections and questions)
  - Rich Text Editor: React Quill (formatting passage texts, lesson contents, and blog articles)
  - Document Parsers: Mammoth.js (.docx), XLSX (.xlsx), PDF.js (.pdf)
  - Artificial Intelligence: Google Gemini AI SDK for structure parsing, automated transcription, and question synthesis

### Backend API (Server)
- Runtime: Node.js (>= 18.x)
- Framework: Express.js
- Database: MongoDB via Mongoose ODM
- Authentication and Security: JSON Web Token (JWT), bcryptjs, CORS, Express Validator
- File Management: Multer (media files, listening audios, images, and document imports)
- Mail Service: Nodemailer (SMTP for verification, password recovery, and reminders)
- Cron Jobs: Node-cron (scheduled reminder notifications and learning progress checks)

---

## 3. Directory Structure

```
Source/
├── README.md                      # Primary project documentation
├── Server/                        # Backend RESTful API (Express + MongoDB)
│   ├── config/                    # Database connections and system configurations
│   ├── controllers/               # Business logic controllers
│   │   ├── analyticsController.js # Aggregated statistics and metric reports
│   │   ├── authController.js      # JWT authentication, registration, password recovery
│   │   ├── blogController.js      # Article and news management
│   │   ├── lessonController.js    # Theoretical lesson management
│   │   ├── placementTestController.js # Placement test lifecycle and grading
│   │   ├── practiceController.js  # Skill practice lifecycle and attempt evaluation
│   │   ├── roadmapController.js   # Learning roadmap and progress tracking
│   │   └── userController.js      # User management and authorization
│   ├── middleware/                # Auth, role validation, file upload, error handling
│   ├── models/                    # Mongoose schemas (User, Test, Practice, Roadmap, etc.)
│   ├── routes/                    # Express routing definitions
│   ├── utils/                     # Document parsers, email delivery, AI utilities
│   ├── uploads/                   # Uploaded media storage (images, audios, imports)
│   ├── package.json
│   └── .env
│
├── fe-admin/                      # Administrator & Instructor web application
│   ├── public/
│   │   └── import-samples/        # Sample import templates (.docx, .xlsx, .pdf)
│   ├── src/
│   │   ├── components/            # Reusable UI, layout, modals, editors
│   │   ├── pages/                 # Dashboard, test manager, practices, users, roadmaps
│   │   ├── services/              # API integration client
│   │   ├── types/                 # TypeScript type declarations
│   │   └── utils/                 # Formatters, helper functions
│   ├── package.json
│   └── .env
│
└── fe-user/                       # Learner portal web application
    ├── public/
    ├── src/
    │   ├── components/            # Layout, UI elements, audio player, practice panels
    │   ├── pages/
    │   │   ├── HomePage.tsx       # Landing page and overview
    │   │   ├── PlacementTestPage/ # Placement test taking, summary, and results
    │   │   ├── PracticePage/      # Skill practice library, taking flow, review
    │   │   ├── LessonsPage/       # Theoretical lessons and modules
    │   │   ├── RoadmapPage/       # Personalized learning roadmap
    │   │   ├── BlogPage/          # Tips, news, and learning strategies
    │   │   └── UserPage/          # User profile, security, performance statistics
    │   ├── services/              # API integration client (Axios)
    │   ├── types/                 # TypeScript type declarations
    │   └── utils/                 # Media helpers, highlight persistence, time formatters
    ├── package.json
    └── .env
```

---

## 4. Core Features

### Learner Portal (fe-user)
1. Authentication and Profile Management:
   - Secure registration, JWT-based login, avatar uploads, and email-based password recovery.
2. Placement Test Engine:
   - Comprehensive multi-part Listening and Reading entrance tests.
   - Synchronized countdown timer, automatic progress persistence in LocalStorage, and automatic submission upon deadline expiry.
   - Automated multi-criteria scoring algorithm yielding level placement from AV1 to AV7.
3. Skill Practice Library:
   - Separate modules for Reading and Listening skills.
   - Filtering by target proficiency tiers: AV1-AV3 (Foundation), AV4-AV5 (Intermediate), AV6-AV7 (Advanced).
   - Dedicated Reading Experience: Split pane resizer, text size scaling (A- / A+), inline text highlighting, and margin note creation.
   - Dedicated Listening Experience: Custom player with precise seeking and section-based audio segmentation.
4. Evaluation and Detailed Review:
   - Post-test score breakdowns: percentage, accuracy rates per question type, and completion duration.
   - Two-column review layout: side-by-side display of original passage/audio alongside user answers, answer keys, and comprehensive explanations.
5. Personalized Learning Roadmaps and Lessons:
   - Stage-based unlocked progression based on placement results.
   - Interactive lessons paired with checkpoint exercises.
6. Performance Analytics:
   - Graphical charts tracking score evolution, strengths, and target areas.

### Administrator Portal (fe-admin)
1. Overview Analytics Dashboard:
   - Key metrics: total active tests, question bank size, enrolled learners, test attempts, and level distribution.
2. Placement Test and Practice Management:
   - Full authoring suite for multi-section tests with audio, image, and text passages.
   - Drag-and-drop question ordering and section organization.
   - Batch actions for activating, deactivating, or removing assessments.
3. Automated Test Import Engine:
   - Direct document ingestion from Word (.docx), Excel (.xlsx), and PDF (.pdf) files.
   - Automated extraction of metadata, passage content, question structures, option sets, answer keys, and explanations.
   - Interactive live preview enabling corrections before committing to the database.
4. User and Access Management:
   - User directory with role filters (admin vs. learner) and account activation controls.
5. Lesson and Roadmap Builder:
   - WYSIWYG rich text editor for lesson creation.
   - Multi-tier roadmap configuration mapping practices and tests to proficiency bands.
6. Content and Blog Publishing:
   - Publication of study guides, examination announcements, and learning tips.

### Backend API Service (Server)
- Standardized RESTful API with route protection and role-based access control.
- Deterministic automated scoring engine supporting multiple answer representations (strings, option arrays, matching mappings).
- Robust file ingestion pipelines with validation checks and error recovery.
- Automated background task scheduling for email dispatch and learner progress reminders.

---

## 5. Supported Question Types and Test Formats

The platform natively supports major question patterns utilized in international examinations (IELTS, TOEIC, VSTEP):

1. Multiple Choice - Single Selection:
   - Selecting a single correct answer from A, B, C, D.
2. Multiple Choice - Multiple Selection:
   - Selecting two or more correct options matching question criteria.
3. Short Answer / Fill in the Blanks:
   - Free-text input evaluated against a list of acceptable normalized answers (case-insensitive, whitespace-trimmed).
4. Dropdown Selection / Gap Fill:
   - Contextual inline dropdowns for selecting targeted vocabulary or phrases.
5. Matching Pairs:
   - Mapping prompts, titles, or concepts to corresponding statements or passage paragraphs.
6. True / False / Not Given & Yes / No / Not Given:
   - Assessing factual consistency against reading text evidence.

---

## 6. Installation and Setup Guide

### System Prerequisites
- Node.js version >= 18.0.0
- npm version >= 9.0.0 or yarn
- Running MongoDB instance (local or MongoDB Atlas cluster)

### Step-by-Step Setup

#### 1. Backend Server Setup
```bash
cd Server
npm install
# Configure your .env file with appropriate database credentials
npm run dev
```
The backend server runs by default at `http://localhost:5000`.

#### 2. Administrator Portal Setup
```bash
cd fe-admin
npm install
npm start
```
The administration frontend runs by default at `http://localhost:3000`.

#### 3. Learner Portal Setup
```bash
cd fe-user
npm install
npm start
```
The learner frontend runs by default at `http://localhost:3002`.

---

## 7. Environment Variable Configuration

### 1. File: `Server/.env`
```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb://localhost:27017/english_learning_platform

JWT_SECRET=your_secure_jwt_secret_key_minimum_32_chars
JWT_EXPIRE=30d

EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

CLIENT_URL=http://localhost:3002
ADMIN_URL=http://localhost:3000
```

### 2. File: `fe-admin/.env`
```env
PORT=3000
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_BASE_URL=http://localhost:3000
```

### 3. File: `fe-user/.env`
```env
PORT=3002
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_BASE_URL=http://localhost:3002
```

---

## 8. API Endpoints Reference

### Authentication Routes (`/api/auth`)
- `POST /api/auth/register`: Register a new learner account.
- `POST /api/auth/login`: Authenticate credentials and receive a JWT token.
- `GET /api/auth/profile`: Retrieve the authenticated user profile.
- `PUT /api/auth/profile`: Update user information (full name, phone, avatar).
- `PUT /api/auth/change-password`: Modify user password.
- `POST /api/auth/forgot-password`: Initiate password reset email request.
- `PUT /api/auth/reset-password/:token`: Complete password reset with token.

### User Management Routes (`/api/users` - Admin Protected)
- `GET /api/users`: List users with pagination, keyword search, and role filtering.
- `GET /api/users/stats`: Retrieve aggregate user metrics.
- `GET /api/users/:id`: Get detailed profile of a single user.
- `POST /api/users`: Create a user account manually.
- `PUT /api/users/:id`: Update user details, roles, or activation state.
- `DELETE /api/users/:id`: Delete a user account.

### Placement Test Routes (`/api/placement-tests`)
- `GET /api/placement-tests`: List active placement tests for learners.
- `GET /api/placement-tests?scope=admin`: List all placement tests with administrative details.
- `GET /api/placement-tests/:testId`: Fetch test content for taking (answer keys hidden).
- `GET /api/placement-tests/:testId/details`: Fetch full test data including answer keys (Admin).
- `POST /api/placement-tests`: Create a new placement test.
- `PUT /api/placement-tests/:testId`: Update placement test metadata.
- `PUT /api/placement-tests/:testId/content`: Update sections and question bank.
- `DELETE /api/placement-tests/:testId`: Delete a placement test.
- `POST /api/placement-tests/:testId/submissions`: Submit test attempt and compute score.
- `POST /api/placement-tests/import`: Ingest and parse tests from Word, Excel, or PDF.
- `POST /api/placement-tests/media`: Upload section media assets (audio, images).

### Practice Routes (`/api/practices`)
- `GET /api/practices`: Retrieve practice sets filtered by skill and proficiency tier.
- `GET /api/practices/:practiceId`: Get practice set content for learner taking.
- `POST /api/practices`: Create a new practice set (Admin).
- `PUT /api/practices/:practiceId`: Update practice content (Admin).
- `DELETE /api/practices/:practiceId`: Remove a practice set.
- `POST /api/practices/:practiceId/submissions`: Submit practice attempt and save results.
- `GET /api/practices/attempts/:attemptId`: Retrieve detailed attempt evaluation and review.
- `GET /api/practices/:practiceId/my-attempts`: List learner historical attempts for a practice set.

### Roadmap and Progress Routes (`/api/roadmaps`)
- `GET /api/roadmaps`: Fetch roadmap structures for levels AV1 through AV7.
- `GET /api/roadmaps/my-progress`: Retrieve current learner progress across stages.
- `POST /api/roadmaps`: Create a new roadmap tier (Admin).
- `PUT /api/roadmaps/:id`: Update stages and module requirements.

### Lesson Routes (`/api/lessons`)
- `GET /api/lessons`: List lessons filtered by skill and level.
- `GET /api/lessons/:id`: Fetch detailed lesson content.
- `POST /api/lessons`: Create a new lesson (Admin).
- `PUT /api/lessons/:id`: Update lesson content.
- `DELETE /api/lessons/:id`: Remove a lesson.

### Blog Routes (`/api/blogs`)
- `GET /api/blogs`: Retrieve public published blog posts.
- `GET /api/blogs/:slug`: Fetch a single blog article by slug.
- `POST /api/blogs`: Publish a new blog post (Admin).
- `PUT /api/blogs/:id`: Update a blog post.
- `DELETE /api/blogs/:id`: Delete a blog post.

---

## 9. Test Parsing and Import Workflow

The automated document parser executes the following pipeline:

1. File Ingestion: Uploading .docx, .xlsx, or .pdf files through the admin interface.
2. Parser Extraction Engine:
   - Word Documents: Structural parsing based on headings, boundary separators (`---`), and asterisk or bracketed markers (`*` or `[x]`) for correct answers.
   - Excel Spreadsheets: Reading `Metadata` sheet for test properties and `Questions` sheet for tabular question matrices.
   - PDF Files: Plain text extraction with paragraph boundary detection and regex-based question splitting.
3. Schema Validation: Verification of question contents, minimum option thresholds, and validation of at least one valid correct answer.
4. Interactive Review: Full editable preview displayed in the browser before final database persistence.

---

## 10. Roadmap and Future Improvements

- Speaking Assessment Module with audio recording and speech-to-text pronunciation evaluation.
- Writing Assessment Module with AI evaluation of grammar, vocabulary lexical resource, and coherence.
- Live Proctored Mock Exam Room with synchronized real-time timers and automated tab-switching detection.
- PDF Exporting for individual performance reports and certificates of completion.
- Cross-platform Mobile Application using React Native.
