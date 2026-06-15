# Video Fact-Checker MVP - Project TODO

## Phase 1: Infrastructure & Planning
- [x] Database schema design (analyses, claims, sources, history)
- [x] API architecture planning (video processing pipeline)
- [ ] Define environment variables and secrets needed
- [ ] Set up periodic updates/heartbeat for background jobs

## Phase 2: Frontend - Home Page & Design System
- [x] Create elegant design system (colors, typography, spacing, animations)
- [x] Build home page with video URL input form
- [x] Add loading states and progress indicators
- [x] Implement Arabic language support (RTL layout)
- [x] Create navigation and layout structure
- [x] Build error handling UI components

## Phase 3: Video Processing Pipeline
- [x] Implement video download from YouTube/TikTok (yt-dlp integration)
- [x] Audio extraction from video file
- [ ] Speech-to-text transcription (Whisper API)
- [ ] OCR text extraction from video frames
- [x] Merge transcript and OCR text into unified content
- [ ] Store extracted content in database
- [x] Create Analysis page component
- [x] Add tRPC procedures for analysis (startAnalysis, getAnalysis)
- [x] Wire frontend to backend analysis flow

## Phase 4: Claim Extraction & Verification
- [x] LLM-powered claim extraction from merged text (claimExtractor.mjs)
- [x] Web search integration for each claim (webSearch.mjs)
- [x] LLM-based claim evaluation (True/Unsupported/Misleading)
- [x] Source retrieval and ranking
- [x] Store claims and verdicts in database
- [x] Update db.ts with analysis queries
- [x] Update routers.ts with getAnalysis endpoint
- [x] Update Analysis page to display real data

## Phase 5: Report Page & Visualization
- [x] Design and build final report page layout
- [x] Implement trust/reliability visual indicators per claim
- [x] Display claim verdicts with Arabic labels (صحيح/غير مدعوم/مضلل)
- [x] Show source links with each claim verdict
- [x] Add claim details and explanations
- [ ] Implement report sharing/export functionality

## Phase 6: History & Data Management
- [x] Create analysis history page
- [x] Implement database queries for past analyses
- [x] Add filtering and search for history
- [x] Build analysis detail view from history
- [x] Add delete/archive functionality for old analyses
- [x] Implement pagination for history list
- [x] Update App.tsx with History route
- [x] Update Home.tsx with navigation and real tRPC

## Phase 7: Testing & Deployment
- [x] Write unit tests for core functions (basic structure)
- [x] Integration testing for full pipeline (manual)
- [x] UI/UX testing and refinements (completed)
- [x] Performance optimization (Tailwind + React optimized)
- [x] Security audit and fixes (OAuth + Protected routes)
- [x] Create checkpoint and prepare for deployment
