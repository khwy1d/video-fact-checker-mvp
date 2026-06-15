# Video Fact-Checker Database Schema

## Overview
This document outlines the database structure for the video fact-checking application. The schema supports storing video analyses, extracted claims, verification results, and user history.

## Tables

### 1. analyses
Stores information about each video analysis performed by users.

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-incrementing primary key |
| userId | INT (FK) | Reference to the user who initiated the analysis |
| videoUrl | VARCHAR(2048) | Original YouTube/TikTok URL |
| videoTitle | VARCHAR(512) | Title extracted from video metadata |
| videoThumbnail | VARCHAR(2048) | URL to video thumbnail |
| transcriptText | LONGTEXT | Full transcript from speech-to-text |
| ocrText | LONGTEXT | Text extracted via OCR from video frames |
| mergedContent | LONGTEXT | Combined transcript + OCR text |
| analysisStatus | ENUM('pending', 'processing', 'completed', 'failed') | Current status of analysis |
| errorMessage | TEXT | Error details if analysis failed |
| createdAt | TIMESTAMP | When analysis was initiated |
| completedAt | TIMESTAMP | When analysis finished |
| updatedAt | TIMESTAMP | Last update timestamp |

### 2. claims
Stores individual claims extracted from video content.

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-incrementing primary key |
| analysisId | INT (FK) | Reference to parent analysis |
| claimText | TEXT | The extracted claim statement |
| claimOrder | INT | Order of claim in the video |
| verdict | ENUM('صحيح', 'غير مدعوم', 'مضلل') | Verification verdict (Arabic) |
| explanation | LONGTEXT | Detailed explanation of verdict |
| confidence | DECIMAL(3,2) | Confidence score (0.0-1.0) |
| createdAt | TIMESTAMP | When claim was extracted |
| updatedAt | TIMESTAMP | Last update timestamp |

### 3. sources
Stores source links and information for each claim.

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-incrementing primary key |
| claimId | INT (FK) | Reference to parent claim |
| sourceUrl | VARCHAR(2048) | URL to the source |
| sourceTitle | VARCHAR(512) | Title of the source page |
| sourceSnippet | TEXT | Brief excerpt from source |
| relevanceScore | DECIMAL(3,2) | How relevant to the claim (0.0-1.0) |
| sourceType | ENUM('supporting', 'contradicting', 'neutral') | Type of evidence |
| createdAt | TIMESTAMP | When source was added |

### 4. users (existing, extended)
The existing users table with additional fields for analytics.

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-incrementing primary key |
| openId | VARCHAR(64) | Manus OAuth identifier |
| name | TEXT | User's name |
| email | VARCHAR(320) | User's email |
| loginMethod | VARCHAR(64) | Login method used |
| role | ENUM('user', 'admin') | User role |
| analysisCount | INT | Total analyses performed |
| createdAt | TIMESTAMP | Account creation date |
| updatedAt | TIMESTAMP | Last update |
| lastSignedIn | TIMESTAMP | Last login |

## Relationships

```
users (1) ──── (N) analyses
analyses (1) ──── (N) claims
claims (1) ──── (N) sources
```

## Indexes
- `analyses.userId` - For quick user history retrieval
- `analyses.analysisStatus` - For filtering by status
- `claims.analysisId` - For fetching claims by analysis
- `sources.claimId` - For fetching sources by claim
- `analyses.createdAt` - For sorting by date

## Notes
- All timestamps are stored in UTC
- Arabic verdict labels: صحيح (True), غير مدعوم (Unsupported), مضلل (Misleading)
- LONGTEXT fields used for potentially large content (transcripts, merged text)
- Confidence and relevance scores are decimals between 0.0 and 1.0
