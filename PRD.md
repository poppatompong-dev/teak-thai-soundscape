# Product Requirements Document (PRD)
## Smart Survey — ระบบสำรวจความต้องการจุดติดตั้งระบบเสียงตามสาย (PA)

> For: TestSprite automated test generation
> Last updated: 2026-05-29

---

## 1. Product Overview

A public web application for a Thai municipality (เทศบาลนครนครสวรรค์) that collects
requests from internal departments for installing/upgrading public-address (PA)
speaker points. Departments fill in a short multi-step survey (typically via a QR
code on mobile). Administrators review, edit, filter, export, and print the
collected requests for budget planning.

- **Primary language:** Thai (UI text is in Thai).
- **Audience:** (a) municipal staff submitting requests; (b) one admin managing data.
- **Hosting:** Vercel (SPA). **Database:** Google Cloud Firestore.

### Tech stack
- React 18 + TypeScript, Vite, React Router v6
- Tailwind CSS + shadcn/ui components
- Firebase Firestore (client SDK, `experimentalForceLongPolling: true`)
- State: React Context (`SurveyProvider`) + localStorage draft persistence
- Excel export via `xlsx`; QR via `qrcode.react`

---

## 2. User Roles

| Role | How identified | Capabilities |
|------|----------------|--------------|
| **Respondent** (public) | No auth | View landing, fill & submit survey, see confirmation |
| **Admin** | `sessionStorage.isAdmin === "true"` after login | All of the above + dashboard, edit/delete records, change settings, export Excel, print report |

### Test credentials (admin)
- URL: `/login`
- Username: `pop`
- Password: `pop`
- On success: sets `sessionStorage.isAdmin = "true"` and redirects to `/admin/dashboard`.
- On failure: shows error text "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง".

---

## 3. Routes / Pages

| Path | Page | Protected | Purpose |
|------|------|-----------|---------|
| `/` | Landing | No | Hero, survey title/description, open/close status, CTA to survey |
| `/survey` | Survey | No | Org selection + 3-step form |
| `/review` | Review | No | Read-only summary + submit |
| `/confirmation` | Confirmation | No | Success screen with reference number |
| `/login` | Login | No | Admin login form |
| `/admin/dashboard` | Dashboard | **Yes** | Manage requests + settings |
| `/admin/report` | OfficialReport | **Yes** | Printable A4 report |
| `*` | NotFound | No | 404 |

Protected routes redirect to `/login` when `sessionStorage.isAdmin !== "true"`.

---

## 4. Feature Specifications & Acceptance Criteria

### 4.1 Landing page (`/`)
- Loads `config/settings` from Firestore; falls back to defaults if missing.
- Displays `surveyTitle`, `surveyDescription`, `orgName`, and the open/close date range.
- **Survey availability** is `settings.isOpen && (now within openDate..closeDate)`.
  - If available: shows enabled CTA "ทำแบบสำรวจทันที (ใช้เวลา 1 นาที)" linking to `/survey`.
  - If not available: shows disabled button "หมดเขตการทำแบบสำรวจ" / "ปิดรับข้อมูลแล้ว".
- Footer link "สำหรับผู้ดูแลระบบ" → `/login`.

**Acceptance**
- AC-L1: Given the survey is open, when the user clicks the CTA, they are taken to `/survey`.
- AC-L2: Given `isOpen=false`, the CTA is disabled and no navigation to `/survey` occurs.

### 4.2 Survey (`/survey`)
A guard checks `config/settings`; if closed (and not admin) the form is blocked.
The flow has an **organization selection** gate, then **3 steps**:

- **Org select:** choose `bureau` (สำนัก/กอง) → `division` → optional `section`.
  Must confirm before the step form appears. `bureau` and `division` are required.
- **Step 0 — สถานที่และผู้ติดต่อ:** `surveyor` (required), `building` (required),
  `floor`, `room`, `contactPerson`, `phone` (optional; if present must match
  `/^[0-9\-+\s()]{8,}$/`).
- **Step 1 — ความต้องการ:** `problems[]`, `speakerType`, `proposedCount` (required),
  `proposedPosition`, `photoName`.
- **Step 2 — งบประมาณ/ความเห็น:** `reasonForNeed`, `beneficiaries`,
  `urgency` (required), `comments`, `satisfaction`.
- "ถัดไป" validates the current step; invalid fields show inline error messages.
- Final step navigates to `/review`.

**Draft persistence:** all entered data is saved to `localStorage["survey-draft"]`
on every change and restored on reload. Cleared on successful submit / reset.

**Acceptance**
- AC-S1: Submitting Step 0 with empty `surveyor` shows "กรุณากรอกชื่อผู้สำรวจ" and does not advance.
- AC-S2: Entering `phone` = "abc" shows "รูปแบบเบอร์โทรไม่ถูกต้อง".
- AC-S3: Step 1 with empty `proposedCount` shows "กรุณาระบุจำนวนจุด".
- AC-S4: Reloading the page mid-form preserves previously entered values.

### 4.3 Review (`/review`)
- Shows a read-only summary of all entered fields, grouped into sections.
- "กลับไปแก้ไข" → `/survey`. "ส่งข้อมูลสรุป" submits.
- **Submit behavior:**
  - Generates `id = "PA-" + year + "-" + random6digits`.
  - Writes document to `surveys/{id}` with `withRetry` (retries on flaky network).
  - Before writing, stores payload in `localStorage["pending-submission"]`.
  - On success: clears pending + draft, sets ref number, toast "ส่งแบบสำรวจสำเร็จ",
    navigates to `/confirmation`.
  - On failure (after retries): toast "ส่งข้อมูลไม่สำเร็จ (เครือข่ายไม่เสถียร)" and
    keeps data locally so the user can retry without re-entering.
  - Button is disabled and shows "กำลังส่ง..." while submitting (no double submit).

**Acceptance**
- AC-R1: A successful submit lands on `/confirmation` showing a reference number `PA-YYYY-NNNNNN`.
- AC-R2: The submit button is disabled during the in-flight request.

### 4.4 Confirmation (`/confirmation`)
- Displays success state and the reference number from context.
- If visited directly without a submission (no ref), it should handle gracefully
  (e.g., redirect or show a neutral state).

### 4.5 Login (`/login`)
- AC-A1: Correct credentials (`pop`/`pop`) redirect to `/admin/dashboard`.
- AC-A2: Wrong credentials show the error and stay on `/login`.

### 4.6 Admin Dashboard (`/admin/dashboard`) — protected
- Loads all `surveys` and `config/settings` (both via `withRetry`).
- **Stat cards:** total requests, total points (Σ proposedCount), buildings, pending count.
- **System settings panel:**
  - Toggle `isOpen` (เปิด/บังคับปิด).
  - Edit `openDate`, `closeDate` (date inputs) + "บันทึกเวลา".
  - Edit `surveyTitle`, `orgName`, `surveyDescription`, `contactInfo` + save.
  - Saving writes `config/settings` and shows a success toast.
- **Requests table** with:
  - **Search** by building / department / reference id.
  - **Filters:** bureau, speaker type, urgency, status.
  - Row actions: **Edit** (modal: building, proposedCount, urgency, status) and **Delete** (confirm dialog).
- **QR Code modal:** generates a downloadable PNG QR for the survey URL.
- **Export Excel:** downloads a workbook (executive summary + raw data + per-bureau summary sheets).
- **Print report** link → `/admin/report`.
- **Logout:** clears `sessionStorage.isAdmin`, returns to `/`.

**Acceptance**
- AC-D1: Visiting `/admin/dashboard` without login redirects to `/login`.
- AC-D2: Toggling `isOpen` updates the status badge and persists to Firestore.
- AC-D3: Applying the urgency filter shows only matching rows; "ล้างตัวกรอง" resets filters.
- AC-D4: Deleting a row removes it from the table after confirmation.
- AC-D5: "ส่งออก Excel" triggers an `.xlsx` download.

### 4.7 Official Report (`/admin/report`) — protected
- Printable A4 layout. Loads `surveys` via `withRetry`.
- Sections: overview box, summary by bureau, by urgency, by type, per-request
  detail table (sorted by bureau then urgency), and a sign-off block.
- "พิมพ์รายงาน" calls `window.print()`.

**Acceptance**
- AC-O1: Visiting `/admin/report` without login redirects to `/login`.
- AC-O2: The report renders totals consistent with the dashboard (total points = Σ proposedCount).

---

## 5. Data Model (Firestore)

### Collection `surveys` — document id = reference (`PA-YYYY-NNNNNN`)
| Field | Type | Notes |
|-------|------|-------|
| id | string | same as doc id |
| date | string | Thai-formatted submit date, e.g. "29 พ.ค. 2569" |
| status | string | `pending` \| `in_progress` \| `completed` \| `cancelled` |
| bureau, division, section | string | org values (see `ORG_STRUCTURE`) |
| surveyDate, surveyor, building, floor, room, contactPerson, phone | string | location & contact |
| problems | string[] | `no_coverage` \| `unclear` \| `other` |
| problemsOther, speakerTypeOther, proposedPosition, photoName | string | |
| speakerType | string | `ceiling` \| `wall` \| `horn` \| `other` |
| proposedCount | string | numeric string (count of points) |
| reasonForNeed, beneficiaries, comments | string | |
| urgency | string | `high` \| `medium` \| `low` |
| satisfaction | string | "1".."5" |

### Document `config/settings`
| Field | Type |
|-------|------|
| isOpen | boolean |
| openDate, closeDate | string (YYYY-MM-DD) |
| orgName, surveyTitle, surveyDescription, contactInfo | string |

---

## 6. Key End-to-End Flows

1. **Submit a request (happy path):** `/` → CTA → `/survey` → select org → fill
   Step 0/1/2 (passing validation) → `/review` → "ส่งข้อมูลสรุป" → `/confirmation`
   with reference number; a new doc appears in `surveys`.
2. **Blocked when closed:** Admin sets `isOpen=false` → public `/` shows closed
   state; `/survey` is blocked for non-admins.
3. **Admin manage:** `/login` (pop/pop) → `/admin/dashboard` → filter/search →
   edit a record → save → value updates in table.
4. **Reporting:** Dashboard → "ส่งออก Excel" downloads workbook; "พิมพ์รายงาน (PDF)"
   → `/admin/report` → print.

---

## 7. Non-functional / Resilience (testable behaviors)

- **Network resilience:** Firestore is configured for long-polling; all reads and
  the submit write retry automatically (`withRetry`, up to 5 attempts with backoff).
- **No data loss:** an in-progress survey persists to localStorage; a failed submit
  keeps a `pending-submission` copy and prompts the user to retry.
- **No duplicate submit:** the submit button is disabled while a request is in flight.

---

## 8. Environment / Setup for testing

- Dev server: `npm install` then `npm run dev` → http://localhost:8080
- Firebase config comes from `.env` (`VITE_FIREBASE_*`). On Vercel these are set as
  Environment Variables.
- Admin login is client-side only (no backend auth): `pop` / `pop`.

### Known constraints for test design
- Reference IDs are random (not sequential) — tests should capture the returned id
  rather than predict it.
- Submissions store a day-level `date` string (no per-second timestamp on legacy records).
- The app depends on a live Firestore connection; tests touching submit/admin need
  network access to `firestore.googleapis.com`.
