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
// `PATCH :id` carries only the four ops-owned scheduling fields. The teacher's
// own bio, languages and specialisations are theirs to edit through
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
}

/** `GET :id` adds the document set and what is blocking approval. */
export interface InstructorDocument {
  id: string;
  docType: string;
  number: string | null;
  verifyStatus: VerifyStatus;
  remarks: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface InstructorDetail extends Instructor {
  documents: InstructorDocument[];
  /** Why `APPROVED` is or is not available, straight from the calculator. */
  approval: { ok: boolean; reasons: string[] };
  allowedStages: OnboardingStage[];
  upcomingSessions: number;
}

export interface InstructorListQuery extends ListQuery {
  stage?: OnboardingStage | '';
  kycStatus?: KycStatus | '';
  status?: InstructorStatus | '';
  branchId?: string;
}

const BASE = '/admin/instructors';

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

  /** `instructors:edit`. The four scheduling inputs, nothing else. */
  update: (id: string, body: Record<string, unknown>) =>
    api.patch<Instructor>(`${BASE}/${id}`, body),

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

/** Stage order, for the stage dialog's select. */
export const ONBOARDING_STAGES: { value: OnboardingStage; label: string }[] = [
  { value: 'APPLIED', label: 'Applied' },
  { value: 'DOCUMENTS_SUBMITTED', label: 'Documents submitted' },
  { value: 'SCREENING_CALL', label: 'Screening call' },
  { value: 'DEMO_SESSION', label: 'Demo session' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];
