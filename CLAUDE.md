# claude.md — AI-Powered Learning Management System (LMS)

### Next tasks (Sprint 8 — Complete ✅)
- **AI-Powered Adaptive Learning Pathways**: Implemented personalized student study recommendations, next steps roadmap, and AI Assistant integration.

### Next tasks (Sprint 9 — TBD)
- **TBD**: Review remaining recommendations or user suggestions.

## Project overview

A web-based Learning Management System built for a school/institution, with AI capabilities powered by the Anthropic Claude API. The system serves three user roles: **Student**, **Lecturer**, and **Admin**, each with a dedicated dashboard and scoped permissions.

---

## Repository structure

```
lms/
├── lms-backend/        # Node.js + Express API
└── lms-frontend/       # React + TypeScript + Vite
```

---

## Tech stack

### Frontend
- **Framework:** React 18 + TypeScript
- **Build tool:** Vite
- **Styling:** Tailwind CSS
- **State management:** Zustand (UI/global state), React Query (server state)
- **Routing:** React Router v6
- **Charts:** Recharts
- **HTTP client:** Axios

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **ORM:** Prisma
- **Database:** SQLite (local dev) — migrated from MySQL
- **Auth:** JWT (access token + refresh token pattern)
- **Password hashing:** bcrypt
- **Validation:** Zod
- **File uploads:** Multer + Azure Blob Storage

### AI layer
- **Provider:** Anthropic Claude API (`claude-sonnet-4-20250514`)
- **Use cases:** AI study assistant (RAG), content generation, auto-grading feedback, plagiarism detection, personalised learning suggestions
- **RAG approach:** pgvector is NOT used (MySQL). Instead, use a lightweight embedding approach — store embeddings in a separate table or use a hosted vector DB (e.g. Qdrant or Pinecone) for the study assistant feature.

### Infrastructure
- **Hosting:** Azure (backend), Vercel or Azure Static Web Apps (frontend)
- **File storage:** Azure Blob Storage
- **CI/CD:** GitHub Actions
- **Environment:** `.env` files with dotenv; never commit secrets

---

## Database models (Prisma schema reference)

```
User
  id          String   @id @default(cuid())
  name        String
  email       String   @unique
  password    String
  role        Role     (ADMIN | LECTURER | STUDENT)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

Course
  id          String   @id @default(cuid())
  title       String
  code        String   @unique
  description String?
  status      CourseStatus (DRAFT | PUBLISHED | ARCHIVED)
  lecturerId  String
  lecturer    User     @relation(...)
  createdAt   DateTime @default(now())

Enrolment
  id          String   @id @default(cuid())
  studentId   String
  courseId    String
  enrolledAt  DateTime @default(now())

Module         (course sections — ordered content blocks)
Resource       (files, links, videos attached to a module)
Assignment     (tasks with due dates, belongs to a course)
Submission     (student submission for an assignment)
Grade          (score + feedback for a submission)
Announcement   (course-level notice from lecturer)
Message        (direct message between users)
```

---

## API structure

All routes are prefixed with `/api`.

### Auth
```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me
```

### Users (Admin only)
```
GET    /api/users
POST   /api/users
GET    /api/users/:id
PATCH  /api/users/:id
DELETE /api/users/:id          (soft delete / deactivate)
```

### Courses
```
GET    /api/courses             (scoped by role)
POST   /api/courses             (admin or lecturer)
GET    /api/courses/:id
PATCH  /api/courses/:id
DELETE /api/courses/:id
POST   /api/courses/:id/enrol   (admin enrolls a student)
GET    /api/courses/:id/students
```

### Modules & Resources
```
GET    /api/courses/:id/modules
POST   /api/courses/:id/modules
PATCH  /api/modules/:id
DELETE /api/modules/:id
POST   /api/modules/:id/resources
DELETE /api/resources/:id
```

### Assessments
```
GET    /api/courses/:id/assignments
POST   /api/courses/:id/assignments
GET    /api/assignments/:id
PATCH  /api/assignments/:id
POST   /api/assignments/:id/submit    (student submits)
GET    /api/assignments/:id/submissions
PATCH  /api/submissions/:id/grade
```

### AI endpoints
```
POST   /api/ai/chat              (study assistant — course-scoped)
POST   /api/ai/generate-quiz     (lecturer: generate MCQs from text)
POST   /api/ai/summarise         (lecturer: summarise uploaded material)
POST   /api/ai/grade-feedback    (auto-grade draft for short answers)
POST   /api/ai/plagiarism-check  (compare submission against course pool)
```

---

## Auth & RBAC rules

- Accounts are **created by admin only** — no self-registration.
- JWT access token expires in **15 minutes**. Refresh token expires in **7 days**.
- Refresh tokens are stored in the database (invalidated on logout).
- Role hierarchy: `ADMIN > LECTURER > STUDENT`.
- Middleware order: `authenticate` (verify JWT) → `authorise(...roles)` (check role).

```ts
// Usage in routes
router.post('/users', authenticate, authorise('ADMIN'), createUser)
router.get('/courses', authenticate, authorise('ADMIN', 'LECTURER', 'STUDENT'), getCourses)
```

---

## Frontend structure

```
src/
├── assets/
├── components/
│   ├── ui/              # Reusable: Button, Input, Modal, Table, Badge
│   ├── layout/          # Sidebar, Navbar, DashboardShell
│   └── shared/          # CourseCard, UserAvatar, GradeTag
├── pages/
│   ├── auth/            # Login
│   ├── admin/           # AdminDashboard, UserManagement, CourseManagement
│   ├── lecturer/        # LecturerDashboard, MyCourses, Gradebook
│   └── student/         # StudentDashboard, MyCourses, Assignments, AiAssistant
├── hooks/               # useAuth, useCourses, useAI, etc.
├── store/               # Zustand stores
├── services/            # Axios API calls (per domain)
├── types/               # Shared TypeScript interfaces
├── utils/
└── router/              # React Router config with protected routes
```

---

## Role-based routing (frontend)

After login, redirect based on role:
```
ADMIN    → /admin/dashboard
LECTURER → /lecturer/dashboard
STUDENT  → /student/dashboard
```

Use a `<ProtectedRoute role="ADMIN">` wrapper component that reads from the auth store and redirects to `/login` if unauthenticated or to `/unauthorized` if the role doesn't match.

---

## AI integration notes

- Always pass `courseId` as context when calling the study assistant — responses must be grounded in that course's materials, not general knowledge.
- Lecturer-facing AI features (quiz generation, summarise) accept raw text or a `resourceId` and return structured JSON.
- Auto-grading returns a **draft** grade and feedback — lecturers must review and confirm before it is saved.
- Never expose the Claude API key on the frontend. All AI calls go through the backend `/api/ai/*` endpoints.
- Use `claude-sonnet-4-20250514` for all AI features unless a task is simple enough for Haiku.

---

## Environment variables

### Backend `.env`
```
DATABASE_URL="file:./dev.db"
JWT_SECRET=
JWT_REFRESH_SECRET=
ANTHROPIC_API_KEY=
AZURE_STORAGE_CONNECTION_STRING=
PORT=3000
NODE_ENV=development
```

### Frontend `.env`
```
VITE_API_BASE_URL=http://localhost:3000/api
```

---

## Coding conventions

- **TypeScript strict mode** on both frontend and backend.
- **Zod** for all request body validation on the backend.
- **Prisma** migrations for all schema changes — never edit the DB directly.
- Use `async/await` throughout — no `.then()` chains.
- Backend errors follow this shape: `{ success: false, message: string, errors?: any }`.
- Backend success responses: `{ success: true, data: any }`.
- All dates stored as UTC; format on the frontend.
- No `any` types unless absolutely unavoidable — use `unknown` and narrow.

---

## Out of scope (not building)

- Transcripts / academic record exports
- Video conferencing / live classes
- Mobile native app (web only, responsive)
- Payment / fee management

---

## Current build phase

**Sprint 5 — Complete ✅**
**Sprint 6 — Complete ✅**
**Sprint 7 — Complete ✅**
**Sprint 8 — Complete ✅**

---

## Completed work

### Sprint 1 — Auth + User Management + Course Management ✅

#### Backend
- `prisma/schema.prisma` — all models: User, RefreshToken, Course, Enrolment, Module, Resource, Assignment, Submission, Grade, Announcement, Message
- `src/utils/jwt.ts` — access token (15 min) + refresh token (7 days), rotation on refresh
- `src/utils/password.ts` — bcrypt hash/verify
- `src/middleware/authenticate.ts` — Bearer token → `req.user`
- `src/middleware/authorise.ts` — role-guard factory
- `src/middleware/errorHandler.ts` — Zod + generic error handling
- `src/controllers/auth.controller.ts` — login, logout, refresh (token rotation), me
- `src/controllers/user.controller.ts` — full CRUD, soft-delete (`isActive`), pagination, role filter
- `src/controllers/course.controller.ts` — CRUD + enrol student + get students, role-scoped list
- `src/routes/auth.routes.ts`, `user.routes.ts`, `course.routes.ts`

#### Frontend
- Vite + React 18 + TypeScript + Tailwind CSS + Zustand + React Query + React Router v6
- `src/store/authStore.ts` — Zustand with localStorage persistence (user, accessToken, refreshToken)
- `src/services/api.ts` — Axios instance with auto-refresh interceptor (queues concurrent requests during refresh)
- `src/services/auth.service.ts` — login, logout, me
- `src/hooks/useAuth.ts` — login (redirects by role), logout
- `src/router/ProtectedRoute.tsx` — role-gated route wrapper
- `src/components/ui/` — Button, Input, Select, Textarea, Badge, Modal (portal, ESC close, scroll lock)
- `src/components/layout/` — DashboardShell, Sidebar (role-aware nav), Navbar
- Pages: LoginPage, AdminDashboard, LecturerDashboard, StudentDashboard, NotFound, Unauthorized
- Routes: `/login`, `/admin/dashboard`, `/lecturer/dashboard`, `/student/dashboard`

### Sprint 1b — User Management + Course Management pages ✅

#### Frontend
- `src/services/user.service.ts`, `course.service.ts`
- `src/hooks/useUsers.ts`, `useCourses.ts` — full React Query mutation hooks
- `src/pages/admin/UserManagement.tsx` — table with create/edit modals, activate/deactivate toggle, role filter, pagination
- `src/pages/admin/CourseManagement.tsx` — table with create/edit/delete, enrol student modal (shows enrolled list + available students), status filter
- `src/pages/lecturer/MyCourses.tsx` — card grid with create/edit course, view students modal
- Routes added: `/admin/users`, `/admin/courses`, `/lecturer/courses`

### Sprint 1c — Modules + Resources ✅

#### Backend
- `src/controllers/module.controller.ts` — listModules, createModule, updateModule, deleteModule, createResource, deleteResource; role-scoped access (student must be enrolled, lecturer must own course)
- `src/routes/module.routes.ts` — three routers: `courseModuleRouter` (`/api/courses/:id/modules`), `moduleRouter` (`/api/modules/:id`), `resourceRouter` (`/api/resources/:id`)

#### Frontend
- `src/services/module.service.ts` — all module + resource calls
- `src/hooks/useModules.ts` — React Query hooks (create, update, delete module; add/delete resource)
- `src/pages/lecturer/CourseModules.tsx` — module list with up/down reordering, expand/collapse, inline add-resource form (title + type + URL), delete
- `src/pages/student/MyCourses.tsx` — enrolled course card grid linking to course view
- `src/pages/student/CourseView.tsx` — read-only accordion of modules with typed resource links (FILE/LINK/VIDEO icons)
- Routes added: `/lecturer/courses/:courseId/modules`, `/student/courses`, `/student/courses/:courseId`

### Sprint 2 — Assignments + Submissions + Grading ✅

#### Backend
- `src/controllers/assignment.controller.ts` — CRUD, student submit (upsert), list submissions, grade submission (upsert, draft/publish), gradebook (student × assignment matrix)
- `src/routes/assignment.routes.ts` — `courseAssignmentRouter` (`/api/courses/:id/assignments`), `courseGradebookRouter` (`/api/courses/:id/gradebook`), `assignmentRouter` (`/api/assignments/:id`), `submissionRouter` (`/api/submissions/:id`)
- `src/controllers/ai.controller.ts` — `POST /api/ai/grade-feedback` auto-grade using Claude, returns `isDraft: true`
- `src/routes/ai.routes.ts`

#### Frontend
- `src/services/assignment.service.ts` — all assignment, submission, grade, gradebook, AI calls
- `src/hooks/useAssignments.ts` — React Query hooks for all assignment operations
- `src/pages/lecturer/CourseAssignments.tsx` — CRUD + submissions panel with inline grading + AI suggest button
- `src/pages/lecturer/Gradebook.tsx` — student × assignment score matrix with draft/published indicators
- `src/pages/student/Assignments.tsx` — upcoming/past split, submit modal, grade/feedback view
- Routes added: `/lecturer/courses/:courseId/assignments`, `/lecturer/courses/:courseId/gradebook`, `/student/courses/:courseId/assignments`

### Sprint 3 — AI Features + Announcements + Dashboard stats ✅

#### Backend
- `src/controllers/dashboard.controller.ts` — role-scoped stats (admin: users/courses/enrolments; lecturer: courses/students/pending grades/recent submissions; student: enrolled courses/upcoming assignments/recent grades)
- `src/routes/dashboard.routes.ts` — `GET /api/dashboard/stats`
- `src/controllers/announcement.controller.ts` — CRUD, role-scoped access
- `src/routes/announcement.routes.ts` — `courseAnnouncementRouter` + `announcementRouter`
- `src/controllers/ai.controller.ts` — added `chat` (course-scoped study assistant), `generateQuiz` (MCQs), `summarise`
- `src/routes/ai.routes.ts` — added `/api/ai/chat`, `/api/ai/generate-quiz`, `/api/ai/summarise`

#### Frontend
- `src/services/dashboard.service.ts`, `src/hooks/useDashboard.ts` — role-typed stats
- `src/pages/admin/AdminDashboard.tsx` — real stats: user count, course breakdown bar chart, recent users
- `src/pages/lecturer/LecturerDashboard.tsx` — real stats: courses, students, assignments, pending grades, recent submissions feed
- `src/pages/student/StudentDashboard.tsx` — real stats: enrolled courses, upcoming assignments with submit status, recent grades
- `src/services/announcement.service.ts`, `src/hooks/useAnnouncements.ts`
- `src/components/shared/AnnouncementsPanel.tsx` — shared panel (canEdit prop); wired into CourseModules (lecturer) and CourseView (student)
- `src/services/ai.service.ts` — chat, generateQuiz, summarise calls
- `src/pages/student/AiAssistant.tsx` — chat UI with streaming-style bubble layout, Enter-to-send
- `src/components/shared/AiToolsModal.tsx` — tabbed modal: Quiz Generator (show/hide answers) + Summarise; wired into CourseAssignments with "✦ AI Tools" button
- Routes added: `/student/courses/:courseId/ai`

### Sprint 4 — Direct Messaging + Plagiarism Detection + UI Polish ✅

#### Backend
- `src/controllers/message.controller.ts` — getContacts (role-scoped), getConversations (with unread count), getThread (marks read), sendMessage (fires NEW_MESSAGE notification)
- `src/routes/message.routes.ts` — all message endpoints
- `src/controllers/notification.controller.ts` — listNotifications, markRead, markAllRead
- `src/routes/notification.routes.ts` — notification endpoints
- `src/utils/notifications.ts` — createNotification, createManyNotifications helpers
- `src/controllers/announcement.controller.ts` — fires NEW_ANNOUNCEMENT to all enrolled students
- `src/controllers/assignment.controller.ts` — fires GRADE_PUBLISHED on non-draft grade save
- `src/controllers/ai.controller.ts` — plagiarismCheck: compares submission against course pool via Claude

#### Frontend
- `src/components/ui/Toast.tsx` — ToastProvider, useToast hook, ToastItem with auto-dismiss (4s)
- `src/components/ui/Skeleton.tsx` — Skeleton, SkeletonCard, SkeletonTable, SkeletonList
- `src/services/message.service.ts`, `src/hooks/useMessages.ts` — contacts, conversations, thread (10s poll), send
- `src/services/notification.service.ts`, `src/hooks/useNotifications.ts` — list (15s poll), markRead, markAllRead
- `src/pages/Messages.tsx` — two-panel inbox: contact list with search + unread badges, thread with read receipts, Enter-to-send
- `src/components/layout/Navbar.tsx` — bell icon with unread count badge, dropdown with all 3 notification types, mark-all-read
- Plagiarism check wired into CourseAssignments submissions panel (🔍 Plagiarism button, result panel with severity badges)
- Toasts wired into: CourseAssignments (grade save/delete), Messages (send error), UserManagement (create/edit/activate/deactivate), CourseModules (add/rename/delete module)
- Skeletons replacing "Loading…" text in: CourseModules, CourseView, Gradebook; inline skeleton rows in UserManagement and CourseManagement tables
- Routes: `/admin/messages`, `/lecturer/messages`, `/student/messages`

---

### Sprint 5 — WebSockets Direct Messaging + Local DB Migration ✅

#### Backend
- Ported database system from MySQL to SQLite (`prisma/dev.db`), manually replicating Prisma enums using a custom TypeScript schema.
- Refactored server entry to wrap the Express core with an HTTP Server wrapper to support Socket.io bindings.
- Created `src/lib/socket.ts` including JWT authorization handshake middleware and user presence maps.
- Configured Socket.io events: broadcasts `presence_update` to online contacts on connection status changes, pushes `new_message` updates during active chats, and emits `messages_read` to enable real-time read receipts.
- Configured typing listeners to bridge instant `typing` and `stop_typing` alerts between chat users.

#### Frontend
- Installed `socket.io-client`.
- Created `<SocketProvider>` context to establish socket sessions using current JWT access tokens, supporting token rotations.
- Removed all periodic polling intervals (`refetchInterval`) from React hooks, saving CPU and query overhead.
- Updated `Messages.tsx` with premium online presence indicators (a green dot `🟢` next to contacts) and real-time read receipts.
- Built debounced typing listeners emitting keypress actions and displaying typing bubbles with smooth bouncing loader animations.

### Sprint 5 Phase 2 — Student Progress Tracker & Unified Calendar Upgrades ✅

#### Backend
- **Prisma Schema (`schema.prisma`):** Created `ResourceCompletion` model mapping student resource progress with unique student-resource indices.
- **Progress Controller (`progress.controller.ts`):** Implemented check/uncheck resource toggles and lecturer course statistics aggregation.
- **At-Risk Radar:** Integrated completion stats directly into course analytics, raising warning indexes for students with under 40% resource completion.
- **Calendar Controller (`calendar.controller.ts`):** Chronologically aggregates assignments, announcements, and module releases.

#### Frontend
- **Student Progress (`CourseView.tsx`):** Added scale-animated checkboxes for resource completion, live progress counters, and a visual radial progress ring.
- **Lecturer Progress Tab (`CourseModules.tsx`):** Created a "Student Progress Matrix" tab incorporating class averages, module completion engagement charts, and individual progress bars.
- **Unified Month Calendar (`CalendarPage.tsx`):** Built a monthly visual grid calendar with colored category dots (🔴 assignments, 🟢 announcements, 🔵 modules) and a Day Inspector sidebar with quick-access links.
- **Header Shortcuts & Navigation:** Integrated a permanent calendar shortcut button in `Navbar.tsx` and updated role-specific routing under `/admin/calendar`, `/lecturer/calendar`, and `/student/calendar`.

### Sprint 8 — AI-Powered Adaptive Learning Pathways ✅

#### Backend
- `src/controllers/ai.controller.ts` — Added `getAdaptivePathway` query controller that fetches student resource completion progress, missed assignment counts, and grade trajectories, and uses Claude or SQLite database mock logic to return custom action steps.
- `src/routes/ai.routes.ts` — Exposed `GET /api/ai/adaptive-pathway/:courseId` endpoint.

#### Frontend
- `src/services/ai.service.ts` — Added the `adaptivePathway` call.
- `src/hooks/useAssignments.ts` — Created the `useAdaptivePathway` Query Hook.
- `src/pages/student/AdaptivePathway.tsx` — Created a premium glassmorphic study guide dashboard.
- `src/pages/student/CourseView.tsx` — Embedded `✦ AI Pathway` primary nav button.
- `src/pages/student/AiAssistant.tsx` — Added location state listener to automatically prefill and submit initial message prompts on mount.
- `src/router/index.tsx` — Registered route `/student/courses/:courseId/pathway`.


