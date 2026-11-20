// Typed calls for /admin/instructors/*, matching the NestJS DTOs in
// hello_fit_backend/src/modules/instructor/dto/admin-instructor.dto.ts.
//
// This is the recruitment pipeline, not a CRUD table. A teacher creates their
// own record by applying from the app (`POST /app/instructor/apply`), so there
// is **no create route** and **no delete route** here; what ops does is move
// an applicant along the stages, verify their documents, set the scheduling
// numbers and — once approved — suspend or blacklist.
//
// Three permissions, deliberately split: reads are `instructors:view`, the
// profile and document decisions are `instructors:edit`, and the two
// effectively irreversible ones — approving someone, or taking them off the
// platform — are `instructors:approve`, which the Operations Manager role does
// not get by default.
//
// `PATCH :id` carries the ops-owned fields only: branch, daily cap, the
// services this provider may deliver, and the commission override. The
// teacher's own bio, languages and specialisations are theirs to edit through
// `/app/instructor/profile`; they are shown here, not edited here.

import { api } from './api';
import { listed, qs } from './masters.api';
import type { ListQuery } from './masters.api';

/** Prisma enums, mirrored. */
export type OnboardingStage =
  | 'APPLIED'
  | 'DOCUMENTS_SUBMITTED'
  | 'SCREENING_CALL'
  | 'DEMO_SESSION'
  | 'APPROVED'
  | 'REJECTED';

export type KycStatus = 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export type InstructorStatus = 'ACTIVE' | 'SUSPENDED' | 'BLACKLISTED';

export type DutyStatus = 'ON_DUTY' | 'OFF_DUTY';

export type VerifyStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface Instructor {
  id: string;
  userId: string;
  name: string;
  gender: string;
  experienceYears: number;
  languages: string[];
  specialisations: string[];
  /** The wizard's professional and address pages (added 19-11-2026). */
  qualification: string | null;
  institute: string | null;
  city: string | null;
  /** Per-provider commission override as a percent; null uses the service's. */
  commissionPct: string | null;
  branchId: string | null;
  dailySessionCap: number;
  travelBufferMin: number;
  travelRadiusKm: number;
  kycStatus: KycStatus;
  onboardingStage: OnboardingStage;
  ratingAvg: string;
  ratingCount: number;
  reliabilityScore: string;
  dutyStatus: DutyStatus;
  status: InstructorStatus;
  statusReason: string | null;
  codeOfConductAt: string | null;
  joinedAt: string | null;
  createdAt: string;
  user: { id: string; mobile: string; status: string };
  branch?: { id: string; name: string } | null;
  /**
   * The services this provider currently delivers — what the Edit dialog's
   * Services multi-select starts on (client, 20-11-2026). On the list row
   * rather than behind the detail call, so opening Edit costs no request.
   */
  instructorServices?: {
    serviceId: string;
    service: { id: string; name: string };
  }[];
}

/** `GET :id` adds the document set and what is blocking approval. */
export interface InstructorDocument {
  id: string;
  docType: string;
  number: string | null;
  verifyStatus: VerifyStatus;
  remarks: string | null;
  /**
   * `expiryDate`, not `expiresAt` — the column's name, and what
   * `documentView` puts on the wire. Already `dd-mm-yyyy` (hard rule 4):
   * print it, never put it through `new Date()`.
   */
  expiryDate: string | null;
  issueDate: string | null;
  createdAt: string;
}

/**
 * One service this provider offers (PDF 6.5, "review provider service
 * information").
 *
 * `approvedAt` is the switch that puts them on the public website:
 * `provider-visibility.ts` requires at least one approved, active offering
 * before a provider appears in Find a Trainer at all. Since 20-11-2026 it is
 * written by the Edit dialog's Services multi-select — admin choosing a
 * service *is* approving it — so there is no publish action any more.
 *
 * No `customPrice`: provider-set pricing went on 17-11-2026, and the column
 * went with it. The rate is `service.basePrice`, whoever delivers the session.
 */
export interface InstructorOffering {
  id: string;
  level: string;
  isActive: boolean;
  approvedAt: string | null;
  createdAt: string;
  service: {
    id: string;
    name: string;
    basePrice: string;
    durationMin: number;
    isActive: boolean;
    category: { id: string; name: string } | null;
  };
}

/**
 * `GET :id` — the whole applicant file, which is what the View dialog renders
 * (client, 20-11-2026: "show all information there in compact format").
 *
 * Every date here arrives already `dd-mm-yyyy` (hard rule 4, formatted by
 * `instructor-view.ts` on the way out), so the screen prints these strings
 * and must never put one through `new Date()`.
 */
export interface InstructorDetail extends Instructor {
  bio: string | null;
  dob: string | null;
  photoUrl: string | null;
  /** The wizard's address page. */
  addressLine: string | null;
  landmark: string | null;
  state: string | null;
  pincode: string | null;
  country: string | null;
  clientsTrainedBand: string | null;
  serviceLocality: string | null;
  homeBaseLat: string | null;
  homeBaseLng: string | null;
  offerings: InstructorOffering[];
  documents: InstructorDocument[];
  /** Why `APPROVED` is or is not available, straight from the calculator. */
  approval: { ok: boolean; reasons: string[] };
  allowedStages: OnboardingStage[];
  upcomingSessions: number;
  /** What the applicant still owes, from the shared onboarding calculator. */
  onboarding: {
    progressPercent: number;
    missingDocuments: string[];
    unverifiedDocuments: string[];
    expiredDocuments: string[];
    missingProfileFields: string[];
    codeOfConductAccepted: boolean;
    blockedBy: string[];
  };
}

export interface InstructorListQuery extends ListQuery {
  stage?: OnboardingStage | '';
  kycStatus?: KycStatus | '';
  status?: InstructorStatus | '';
  branchId?: string;
}

const BASE = '/admin/instructors';

/**
 * The Services multi-select arrives comma-joined from `CrudPage`, which holds
 * flat form values; the API takes a list of uuids.
 *
 * **An empty value is still sent, not dropped.** "No service" is a real
 * instruction — it takes the provider off the website — and dropping the key
 * would leave the old selection in place, which is the opposite of what the
 * admin just did. Same reasoning as `packageBody` in `pricing.api.ts`.
 */
function instructorBody(body: Record<string, unknown>): Record<string, unknown> {
  const raw = body.serviceIds;
  if (raw === undefined) return body;

  return { ...body, serviceIds: String(raw).split(',').filter(Boolean) };
}

export const instructorsApi = {
  list: async (query: InstructorListQuery = {}) =>
    listed<Instructor>(await api.get<Instructor[]>(`${BASE}${qs(query)}`)),

  get: (id: string) => api.get<InstructorDetail>(`${BASE}/${id}`),

  /** A short-lived signed URL for one document. */
  documentUrl: (id: string, documentId: string) =>
    api.get<{ url: string; expiresIn: number }>(
      `${BASE}/${id}/documents/${documentId}/url`,
    ),

  /** `instructors:edit`. A remark is mandatory on a rejection. */
  verifyDocument: (
    id: string,
    documentId: string,
    body: { verifyStatus: VerifyStatus; remarks?: string },
  ) =>
    api.post<InstructorDocument>(
      `${BASE}/${id}/documents/${documentId}/verify`,
      body,
    ),

  /**
   * `instructors:approve`. Refused when the transition is illegal, and
   * `APPROVED` is refused again while any must-verify document is unverified
   * or expired — the refusal names which.
   */
  changeStage: (id: string, body: { stage: OnboardingStage; reason: string }) =>
    api.post<Instructor>(`${BASE}/${id}/stage`, body),

  /**
   * `instructors:edit`. Branch, daily cap, `serviceIds` and the commission —
   * nothing else; travel buffer and radius came off on 20-11-2026.
   *
   * `serviceIds` is the **whole set**, so an id left out is withdrawn. The API
   * refuses the lot when one service is retired, and names it.
   */
  update: (id: string, body: Record<string, unknown>) =>
    api.patch<Instructor>(`${BASE}/${id}`, instructorBody(body)),

  /** `instructors:approve`. Reports how many sessions need reassigning. */
  changeStatus: (
    id: string,
    body: { status: InstructorStatus; reason: string },
  ) =>
    api.post<Instructor & { upcomingSessions: number }>(
      `${BASE}/${id}/status`,
      body,
    ),
};

/**
 * Stage order, for the list filter. Screening call and demo session are off
 * the pipeline (client, 20-11-2026) so they are not offered; the Prisma enum
 * still carries them, so a row stranded in one keeps rendering its badge.
 */
export const ONBOARDING_STAGES: { value: OnboardingStage; label: string }[] = [
  { value: 'APPLIED', label: 'Applied' },
  { value: 'DOCUMENTS_SUBMITTED', label: 'Documents submitted' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

/**
 * The only stages the Stage dialog offers (client, 20-11-2026). Admin decides;
 * the pipeline steps in between are not an admin action. Still intersected
 * with the API's `allowedStages`, which is the authority on what it will take.
 */
export const DECIDABLE_STAGES: OnboardingStage[] = ['APPROVED', 'REJECTED'];
