/**
 * Pure business logic for reports.
 * No React, no storage: every function here is covered by unit tests in
 * src/lib/reports/__tests__/logic.test.ts.
 */
import {CATEGORIES, type Category} from './config';
import type {
  AgencyId,
  AppUser,
  CategoryId,
  Report,
  ReportStatus,
} from './types';

export function getCategory(id: CategoryId): Category {
  const category = CATEGORIES.find(c => c.id === id);
  if (!category) {
    throw new Error(`Unknown category: ${id}`);
  }
  return category;
}

/**
 * Decide which agency is responsible for a category and who is copied in.
 * Example: street_light -> lead STELCO, CC Council.
 */
export function routeReport(categoryId: CategoryId): {
  lead: AgencyId;
  cc: AgencyId[];
} {
  const {lead, cc} = getCategory(categoryId);
  return {lead, cc: [...cc]};
}

/**
 * Allowed status changes. A report moves forward one step at a time and can
 * be rejected any time before it is resolved. Resolved/rejected are final.
 */
const TRANSITIONS: Record<ReportStatus, ReportStatus[]> = {
  submitted: ['acknowledged', 'rejected'],
  acknowledged: ['in_progress', 'rejected'],
  in_progress: ['resolved', 'rejected'],
  resolved: [],
  rejected: [],
};

export function nextStatuses(status: ReportStatus): ReportStatus[] {
  return TRANSITIONS[status];
}

export function canTransition(from: ReportStatus, to: ReportStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function isOpen(status: ReportStatus): boolean {
  return status !== 'resolved' && status !== 'rejected';
}

/** Only staff of the lead agency may change a report's status. */
export function canUpdateStatus(user: AppUser | null, report: Report): boolean {
  return (
    !!user &&
    user.role === 'staff' &&
    user.agency === report.leadAgency &&
    isOpen(report.status)
  );
}

/** Citizens may withdraw (delete) their own report while it is untouched. */
export function canDelete(user: AppUser | null, report: Report): boolean {
  return (
    !!user &&
    user.role === 'citizen' &&
    user.id === report.reporterId &&
    report.status === 'submitted'
  );
}

export type ReportScope = 'mine' | 'community' | 'assigned' | 'cc';

/** Filter the full report list down to what a given tab/segment shows. */
export function reportsForScope(
  reports: Report[],
  user: AppUser | null,
  scope: ReportScope,
): Report[] {
  if (!user) return [];
  switch (scope) {
    case 'mine':
      return reports.filter(r => r.reporterId === user.id);
    case 'community':
      return reports;
    case 'assigned':
      return reports.filter(r => r.leadAgency === user.agency);
    case 'cc':
      return reports.filter(
        r => !!user.agency && r.ccAgencies.includes(user.agency),
      );
  }
}

export type StatusFilter = 'all' | 'open' | 'closed';

export function filterByStatus(
  reports: Report[],
  filter: StatusFilter,
): Report[] {
  if (filter === 'open') return reports.filter(r => isOpen(r.status));
  if (filter === 'closed') return reports.filter(r => !isOpen(r.status));
  return reports;
}

/** Newest first. Returns a new array (does not mutate the input). */
export function sortNewestFirst(reports: Report[]): Report[] {
  return [...reports].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

/** Simple counts for the profile screen. */
export function countByStatus(reports: Report[]) {
  return {
    total: reports.length,
    open: reports.filter(r => isOpen(r.status)).length,
    resolved: reports.filter(r => r.status === 'resolved').length,
  };
}

/** Turn a display name into a stable local user id, e.g. "Aisha N" -> "aisha-n". */
export function makeUserId(name: string, agency?: AgencyId): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return agency ? `${agency}:${slug}` : slug;
}

export function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** "5 min ago", "3 h ago", "2 d ago", or a date for older items. */
export function timeAgo(iso: string, now: Date = new Date()): string {
  const diffMs = now.getTime() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} d ago`;
  return new Date(iso).toLocaleDateString();
}
