import {stopPersisting} from 'mobx-persist-store';

import type {AppUser} from '@/lib/reports';
import '../_hydration'; // configure AsyncStorage (mocked in jest.setup.js)
import {ReportsStore} from '../reports-store';

const citizen: AppUser = {id: 'aisha', name: 'Aisha', role: 'citizen'};
const stelco: AppUser = {
  id: 'stelco:ali',
  name: 'Ali',
  role: 'staff',
  agency: 'stelco',
};

describe('ReportsStore', () => {
  let store: ReportsStore;

  beforeEach(() => {
    store = new ReportsStore();
    store.reports = [];
  });

  afterEach(() => stopPersisting(store));

  it('adds a report routed to the right agency', () => {
    const r = store.addReport(
      {category: 'street_light', description: '  Lamp is off  ', landmark: ''},
      citizen,
    );
    expect(store.reports).toHaveLength(1);
    expect(r.leadAgency).toBe('stelco');
    expect(r.ccAgencies).toEqual(['council']);
    expect(r.status).toBe('submitted');
    expect(r.description).toBe('Lamp is off'); // trimmed
    expect(r.landmark).toBeUndefined(); // empty string not stored
    expect(r.history).toHaveLength(1);
  });

  it('records each status change in the history', () => {
    const r = store.addReport(
      {category: 'street_light', description: 'Lamp is off'},
      citizen,
    );
    expect(store.updateStatus(r.id, 'acknowledged', stelco)).toBe(true);
    expect(
      store.updateStatus(r.id, 'in_progress', stelco, 'Team on the way'),
    ).toBe(true);

    const updated = store.getById(r.id)!;
    expect(updated.status).toBe('in_progress');
    expect(updated.history.map(h => h.status)).toEqual([
      'submitted',
      'acknowledged',
      'in_progress',
    ]);
    expect(updated.history[2].note).toBe('Team on the way');
  });

  it('rejects invalid status changes', () => {
    const r = store.addReport(
      {category: 'waste', description: 'Bins overflowing'},
      citizen,
    );
    expect(store.updateStatus(r.id, 'resolved', stelco)).toBe(false);
    expect(store.getById(r.id)!.status).toBe('submitted');
    expect(store.updateStatus('missing-id', 'acknowledged', stelco)).toBe(
      false,
    );
  });

  it('removes a report', () => {
    const r = store.addReport(
      {category: 'waste', description: 'Bins overflowing'},
      citizen,
    );
    store.removeReport(r.id);
    expect(store.getById(r.id)).toBeUndefined();
  });

  it('restores demo data', () => {
    store.resetDemoData();
    expect(store.reports.length).toBeGreaterThan(0);
    expect(store.hasSeeded).toBe(true);
  });
});
