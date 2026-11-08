/**
 * ReportsStore: the single source of truth for all civic reports.
 *
 * - State management: MobX (makeAutoObservable) so any `observer` component
 *   re-renders when reports change.
 * - Persistence: mobx-persist-store saves `reports` to AsyncStorage, so data
 *   survives app restarts and works fully offline.
 */
import {makeAutoObservable} from 'mobx';
import {hydrateStore, makePersistable} from 'mobx-persist-store';

import {
  canTransition,
  makeId,
  routeReport,
  type AppUser,
  type CategoryId,
  type GeoPoint,
  type Report,
  type ReportStatus,
} from '@/lib/reports';
import {createSeedReports} from './seed-reports';
import type {PVoid} from './types';

export type NewReportInput = {
  category: CategoryId;
  description: string;
  landmark?: string;
  photoUri?: string;
  location?: GeoPoint;
  address?: string;
};

export class ReportsStore {
  reports: Report[] = [];
  /** True once demo data has been added, so it is not re-added after a user clears it. */
  hasSeeded = false;

  constructor() {
    makeAutoObservable(this);
    makePersistable(this, {
      name: 'ReportsStore',
      properties: ['reports', 'hasSeeded'],
    });
  }

  getById(id: string): Report | undefined {
    return this.reports.find(r => r.id === id);
  }

  /** Create a report and route it to the right agency automatically. */
  addReport(input: NewReportInput, user: AppUser): Report {
    const {lead, cc} = routeReport(input.category);
    const now = new Date().toISOString();

    const report: Report = {
      id: makeId(),
      category: input.category,
      description: input.description.trim(),
      landmark: input.landmark?.trim() || undefined,
      photoUri: input.photoUri,
      location: input.location,
      address: input.address,
      leadAgency: lead,
      ccAgencies: cc,
      status: 'submitted',
      history: [{status: 'submitted', at: now, by: user.name}],
      reporterId: user.id,
      reporterName: user.name,
      createdAt: now,
      updatedAt: now,
    };

    this.reports.unshift(report);
    return report;
  }

  /**
   * Move a report to a new status. Returns false if the change is not allowed
   * (e.g. trying to re-open a resolved report).
   */
  updateStatus(
    id: string,
    status: ReportStatus,
    user: AppUser,
    note?: string,
  ): boolean {
    const report = this.getById(id);
    if (!report || !canTransition(report.status, status)) {
      return false;
    }
    const now = new Date().toISOString();
    report.status = status;
    report.updatedAt = now;
    report.history.push({
      status,
      at: now,
      by: user.name,
      note: note?.trim() || undefined,
    });
    return true;
  }

  removeReport(id: string) {
    this.reports = this.reports.filter(r => r.id !== id);
  }
  
  /** Delete every report on this device (e.g. before a user testing session). */
  clearAll() {
    this.reports = [];
    this.hasSeeded = true; // don't re-add the sample reports on next launch
  }

  /** Wipe everything and reload the demo reports (used from Settings). */
  resetDemoData() {
    this.reports = createSeedReports();
    this.hasSeeded = true;
  }

  hydrate = async (): PVoid => {
    await hydrateStore(this);
    // First launch: add a few sample reports so the app is not empty.
    if (!this.hasSeeded) {
      this.resetDemoData();
    }
  };
}
