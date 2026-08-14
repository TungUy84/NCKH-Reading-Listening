# English Learning Platform - Backend API Service

The Backend subsystem provides RESTful API services, automated test grading, placement determination, personalized learning roadmaps, and administrative management.

---

## 1. Technologies and Stack

- Runtime: Node.js (>= 18.x)
- Framework: Express.js
- Database: MongoDB via Mongoose ODM
- Authentication: JSON Web Token (JWT), bcryptjs
- Email Service: Nodemailer (SMTP)
- Document Parsing: Mammoth (.docx), XLSX (.xlsx), PDF-Parse (.pdf)
- Task Scheduling: Node-cron
- AI Integration: Google Gemini AI SDK

---

## 2. Setup and Execution

1. Install package dependencies:
```bash
cd Server
npm install
```

2. Configure environment variables in `.env`:
```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb://localhost:27017/english_learning_platform

JWT_SECRET=your_secure_jwt_secret_key_minimum_32_chars
JWT_EXPIRE=30d

EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

CLIENT_URL=http://localhost:3002
ADMIN_URL=http://localhost:3000
```

3. Initialize default administrator account:
```bash
npm run create-admin
```

4. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

---

## 3. API Endpoints Reference

Base URL: `http://localhost:5000/api`

### 3.1. Authentication Routes (`/api/auth`)
- `POST /api/auth/register`: Register a new learner account.
- `POST /api/auth/login`: Authenticate user credentials and return JWT token.
- `GET /api/auth/profile`: Get current authenticated user profile.
- `PUT /api/auth/profile`: Update profile info (full name, phone, avatar).
- `PUT /api/auth/change-password`: Change user account password.
- `POST /api/auth/forgot-password`: Request password recovery link via email.
- `PUT /api/auth/reset-password/:token`: Reset password using validation token.
- `POST /api/auth/logout`: Invalidate user session.

### 3.2. User Management Routes (`/api/users` - Admin Only)
- `GET /api/users`: Get paginated list of users with search and role filters.
- `GET /api/users/stats`: Get summary metrics of user distribution.
- `GET /api/users/:id`: Get detailed single user profile.
- `POST /api/users`: Create user account manually.
- `PUT /api/users/:id`: Update user properties, role, or activation status.
- `DELETE /api/users/:id`: Remove user account.

### 3.3. Placement Test Routes (`/api/placement-tests`)
- `GET /api/placement-tests`: Retrieve active placement tests for learners.
- `GET /api/placement-tests?scope=admin`: Retrieve full list of tests for admin.
- `GET /api/placement-tests/:testId`: Fetch test content for taking (answer keys hidden).
- `GET /api/placement-tests/:testId/details`: Fetch full test data including answer keys.
- `POST /api/placement-tests`: Create a new placement test.
- `PUT /api/placement-tests/:testId`: Update placement test metadata.
- `PUT /api/placement-tests/:testId/content`: Update sections and questions.
- `DELETE /api/placement-tests/:testId`: Delete a placement test.
- `POST /api/placement-tests/:testId/submissions`: Submit test answers and calculate score.
- `POST /api/placement-tests/import`: Ingest and parse tests from Word, Excel, or PDF.
- `POST /api/placement-tests/media`: Upload section media assets (audio, image).
- `POST /api/placement-tests/bulk-delete`: Delete multiple placement tests simultaneously.
- `POST /api/placement-tests/bulk-update-status`: Update activation status for multiple tests.
- `GET /api/placement-tests/stats`: Get test analytics reports.

### 3.4. Practice Routes (`/api/practices`)
- `GET /api/practices`: Retrieve practice sets filtered by skill and level.
- `GET /api/practices/:practiceId`: Get practice content for learner taking.
- `POST /api/practices`: Create a new practice set (Admin).
- `PUT /api/practices/:practiceId`: Update practice content.
- `DELETE /api/practices/:practiceId`: Remove practice set.
- `POST /api/practices/:practiceId/submissions`: Submit practice attempt and evaluate results.
- `GET /api/practices/attempts/:attemptId`: Retrieve detailed attempt evaluation.
- `GET /api/practices/:practiceId/my-attempts`: Get learner historical attempts.

### 3.5. Roadmap and Progress Routes (`/api/roadmaps`)
- `GET /api/roadmaps`: Fetch roadmap structures for levels AV1 through AV7.
- `GET /api/roadmaps/my-progress`: Retrieve learner roadmap progression.
- `POST /api/roadmaps`: Create a new roadmap tier (Admin).
- `PUT /api/roadmaps/:id`: Update roadmap stages and requirements.
- `POST /api/roadmaps/progress`: Update completed items in the learner roadmap.

### 3.6. Lesson Routes (`/api/lessons`)
- `GET /api/lessons`: List lessons filtered by skill and proficiency tier.
- `GET /api/lessons/:id`: Fetch detailed lesson contents.
- `POST /api/lessons`: Create a new lesson (Admin).
- `PUT /api/lessons/:id`: Update lesson content.
- `DELETE /api/lessons/:id`: Delete a lesson.

### 3.7. Blog Routes (`/api/blogs`)
- `GET /api/blogs`: Retrieve public published blog posts.
- `GET /api/blogs/:slug`: Fetch a single blog article by slug.
- `POST /api/blogs`: Publish a new blog post (Admin).
- `PUT /api/blogs/:id`: Update a blog post.
- `DELETE /api/blogs/:id`: Delete a blog post.

---

## 4. Authorization Header Format

For protected endpoints, supply the bearer token in the HTTP header:
```http
Authorization: Bearer <jwt_token>
```
