# Daily Balance Tracker — Phase 1 Spec
**Manual Flow: Registration → Tracking, on NestJS + PostgreSQL**

Owner decisions locked in:
- Backend of record: **NestJS + Prisma + PostgreSQL** (Firebase Auth/Firestore fully retired from the frontend)
- UI direction: **warm & friendly** — soft colors, light illustration touches, human copywriting. Explicitly avoid generic "AI app" look (no default purple gradients, no cold corporate dashboard feel).
- Attachment storage: **not decided yet** — build the upload feature behind a storage interface so we can point it at local disk now and swap to S3/Cloudinary later without touching the API contract or the frontend.

---

## 1. Why this phase matters

Right now the native Android SMS automation (Phase 2) is fully built and sitting on top of a frontend that's still wired to Firebase, with no category system, no attachments, and a UI that was never designed — just assembled. Phase 1 fixes the foundation so Phase 2's automation has something solid to plug into: real accounts, real categories, real history, an app that feels like a product a person would actually want to open every day.

---

## 2. Data model changes (Prisma)

Current schema has bare-bones `User` and `Transaction` models. Phase 1 needs:

**Category**
- `id`, `userId` (FK), `name`, `icon` (emoji or icon key), `color` (hex), `type` (`income` | `expense` | `both`), `isDefault` (bool), timestamps
- Every new user gets a seeded default set on registration (Food, Transport, Shopping, Bills, Salary, etc.) so the app never opens empty
- Users can create/edit/archive their own categories

**Transaction** (extend existing)
- Replace any free-text `category` string with `categoryId` FK → `Category`
- Add `note` (optional text), `attachmentUrl` (nullable string), `attachmentType` (`image` | `pdf` | null)
- Keep `amount`, `type`, `date`, `userId` as-is

**Attachment handling**
- Don't create a separate `Attachment` table yet — one optional attachment per transaction is enough for Phase 1. Store just the URL/path + type on the transaction row. Revisit only if multi-attachment becomes a real need.

---

## 3. Backend (NestJS) scope

- `auth` module: already exists (JWT + bcrypt). Confirm register/login/refresh all work end-to-end; add a `GET /auth/me` if not present, since the frontend will need it to restore session on load.
- `categories` module (new): CRUD, scoped to the authenticated user, auto-seed defaults on user creation.
- `transactions` module: extend existing CRUD to accept `categoryId`, `note`, and optional file upload; add query params for filtering (date range, categoryId, type) and a `/transactions/summary` endpoint that returns balance/income/expense totals for a given range — the frontend should never compute financial totals client-side from a full unfiltered list once the data set grows.
- `uploads` module (new): a single storage interface (e.g. `StorageService` with `save()` / `getUrl()` / `delete()`), implemented first with local disk under `backend/uploads/`, so swapping to cloud storage later is a one-file change, not a rewrite.

---

## 4. Frontend (React) scope

**Kill Firebase.**
- `AuthContext.jsx`: replace all Firebase Auth calls with calls to the NestJS `auth` endpoints; store JWT (httpOnly cookie preferred over localStorage if the backend supports it — otherwise localStorage with clear expiry handling).
- `TransactionContext.jsx`: replace all Firestore reads/writes with REST calls to the `transactions` endpoints; keep the existing computed-balance logic but prefer the new `/transactions/summary` endpoint once available.
- New `CategoryContext.jsx`: loads user's categories, exposes create/edit/archive.

**New/updated screens**
- Register/Login: friendly, not corporate. Short copy, no wall of legal text, clear error states (wrong password ≠ generic "auth error").
- Add/Edit Transaction: amount, type toggle (expense/income), category picker (icon + color, not a plain dropdown), date, optional note, optional receipt upload (image or PDF) with a preview thumbnail.
- Categories management: grid of category chips (icon + color), add/edit/archive; can't delete a category that has transactions attached to it — archive instead.
- Dashboard/Balance page: current balance front and center, income vs expense for the current period, recent transactions list, category breakdown chart (existing `CategoryChart.jsx` wired to real filtered data).
- Transaction history: filterable by date range / category / type, searchable, with the receipt thumbnail visible inline if one exists.

**UX principles (non-negotiable for this phase)**
- Every list has a designed empty state with copy that helps, not a blank screen ("No expenses yet — add your first one" with a friendly illustration, not "No data").
- Every destructive action (delete transaction, delete category) has a confirm step.
- Every async action has a real loading state — no flash of empty content before data arrives.
- Amounts always show currency formatting (₹) and consistent decimal rules.
- Mobile-first layout and touch targets — this runs inside a Capacitor WebView on Android as the primary surface.

---

## 5. What's explicitly out of scope for Phase 1

- SMS automation UI hookup (Phase 2 — the native side already works, we're not touching `SmsService.java` / `SmsReceiver.java` / `MainActivity.java` yet)
- Multi-currency, multi-account, recurring transactions, budgets — good Phase 1.5/2 candidates once the foundation is solid, not blockers for launch
- Cloud attachment storage — ship on local disk behind the storage interface, swap later

---

## 6. Definition of done for Phase 1

- A new user can register, land on a dashboard seeded with default categories, add an expense with a receipt photo, see it reflected instantly in their balance and category chart, edit or delete it, and log out/back in with everything persisted — with zero Firebase calls left anywhere in the codebase.
