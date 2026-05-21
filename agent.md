# AI Agent Guidelines (agent.md)

This document provides context and strict guidelines for any AI Agent working on the **Soundscape Survey** project.

## 1. Project Context
- **Name**: Soundscape Survey (Dynamic Survey Platform)
- **Primary Use Case**: A government/municipality portal for surveying installation spots for Public Address (PA) systems, but designed to be generic enough for any other equipment surveys.
- **Key Characteristics**: Uses React (Vite) for frontend and `json-server` as a mock backend to persist state locally (`db.json`).

## 2. Dynamic Configuration System
Before modifying text, labels, or generic descriptions on the Landing page or Survey, check if it's controlled by the `settings` object in `db.json`. 
- **Rule**: Avoid hardcoding text like "เทศบาลนครนครสวรรค์" or "แบบสำรวจ PA" directly into components. Instead, map these to `settings.orgName` and `settings.surveyTitle`.
- **Modifying Settings**: If adding a new setting, remember to:
  1. Add the default value to `db.json`.
  2. Update the initial state hook in both `Dashboard.tsx` and `Landing.tsx` (or `Survey.tsx`).
  3. Add a corresponding input field in the "ตั้งค่าข้อมูลแบบสำรวจ" (Survey Configuration) section of `Dashboard.tsx`.

## 3. UI and Styling Rules
- **TailwindCSS**: The project uses Tailwind for all styling. Do not write custom CSS unless strictly necessary.
- **Responsiveness**: Always use responsive utility classes (e.g., `flex-col sm:flex-row`, `w-full lg:w-auto`). When adding inputs to the Dashboard, ensure they don't break on mobile screens.
- **Shadcn UI**: The project utilizes Shadcn/Radix UI components (found in `src/components/ui`). Reuse existing components (`<Button>`, `<Input>`) before building custom ones.

## 4. Backend Considerations (json-server vs Real Backend)
- The current backend is a mock (`json-server`). When deploying to serverless platforms like Vercel, edits to `db.json` via API calls (`PUT`, `POST`) will **NOT** persist across serverless function invocations.
- If asked to deploy or make it production-ready, kindly remind the user that `json-server` is meant for local dev/prototyping and suggest migrating to a real database (e.g., Firebase, Supabase, PostgreSQL) for data persistence.

## 5. Working with Dates and Periods
- The survey access is gated by `openDate` and `closeDate`.
- Always use standard `Date` parsing when doing client-side time checks. Treat the `closeDate` as inclusive (until 23:59:59 of that day).

## 6. QR Code Generation
- The QR Code feature automatically fetches `window.location.origin` (or typed URL) to generate the survey link. When deploying to Vercel, this seamlessly provides the live URL. No hardcoded domains should be added to the generator default logic.
