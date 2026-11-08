import {
  canDelete,
  canTransition,
  canUpdateStatus,
  countByStatus,
  filterByStatus,
  makeUserId,
  nextStatuses,
  reportsForScope,
  routeReport,
  sortNewestFirst,
  timeAgo,
} from '../logic';
import {shortenAddress} from '../geocode';
import type {AppUser, Report} from '../types';

const citizen: AppUser = {id: 'aisha', name: 'Aisha', role: 'citizen'};
const stelco: AppUser = {
  id: 'stelco:ali',
  name: 'Ali',
  role: 'staff',
  agency: 'stelco',
};
const council: AppUser = {
  id: 'council:sara',
  name: 'Sara',
  role: 'staff',
  agency: 'council',
};

function makeReport(overrides: Partial<Report> = {}): Report {
  const now = new Date('2026-11-01T10:00:00Z').toISOString();
  return {
    id: 'r1',
    category: 'street_light',
    description: 'Lamp broken',
    leadAgency: 'stelco',
    ccAgencies: ['council'],
    status: 'submitted',
    history: [{status: 'submitted', at: now, by: 'Aisha'}],
    reporterId: 'aisha',
    reporterName: 'Aisha',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('routeReport (who receives a report)', () => {
  it('sends street lights to STELCO and copies the Council', () => {
    expect(routeReport('street_light')).toEqual({
      lead: 'stelco',
      cc: ['council'],
    });
  });

  it('sends sewage to MWSC and copies the Council', () => {
    expect(routeReport('sewage')).toEqual({lead: 'mwsc', cc: ['council']});
  });

  it('sends no-water reports to MWSC only', () => {
    expect(routeReport('no_water')).toEqual({lead: 'mwsc', cc: []});
  });

  it('sends roads and waste to the Council only', () => {
    expect(routeReport('road_damage')).toEqual({lead: 'council', cc: []});
    expect(routeReport('waste')).toEqual({lead: 'council', cc: []});
  });

  it('returns a copy so callers cannot change the config', () => {
    const r = routeReport('street_light');
    r.cc.push('mwsc');
    expect(routeReport('street_light').cc).toEqual(['council']);
  });

  it('throws for an unknown category', () => {
    expect(() => routeReport('spaceship' as any)).toThrow('Unknown category');
  });
});

describe('status transitions', () => {
  it('moves forward one step at a time', () => {
    expect(nextStatuses('submitted')).toEqual(['acknowledged', 'rejected']);
    expect(canTransition('acknowledged', 'in_progress')).toBe(true);
    expect(canTransition('submitted', 'resolved')).toBe(false);
  });

  it('does not allow changes after resolved or rejected', () => {
    expect(nextStatuses('resolved')).toEqual([]);
    expect(canTransition('rejected', 'submitted')).toBe(false);
  });
});

describe('permissions', () => {
  it('only lead agency staff can update a report', () => {
    const report = makeReport();
    expect(canUpdateStatus(stelco, report)).toBe(true);
    expect(canUpdateStatus(council, report)).toBe(false); // only CC'd
    expect(canUpdateStatus(citizen, report)).toBe(false);
    expect(canUpdateStatus(null, report)).toBe(false);
  });

  it('staff cannot update a closed report', () => {
    expect(canUpdateStatus(stelco, makeReport({status: 'resolved'}))).toBe(
      false,
    );
  });

  it('a citizen can withdraw only their own untouched report', () => {
    expect(canDelete(citizen, makeReport())).toBe(true);
    expect(canDelete(citizen, makeReport({status: 'acknowledged'}))).toBe(
      false,
    );
    expect(canDelete(citizen, makeReport({reporterId: 'someone-else'}))).toBe(
      false,
    );
  });
});

describe('list filtering', () => {
  const reports = [
    makeReport({id: 'a', createdAt: '2026-11-01T10:00:00Z'}),
    makeReport({
      id: 'b',
      category: 'sewage',
      leadAgency: 'mwsc',
      ccAgencies: ['council'],
      reporterId: 'ibrahim',
      status: 'resolved',
      createdAt: '2026-11-03T10:00:00Z',
    }),
    makeReport({
      id: 'c',
      category: 'waste',
      leadAgency: 'council',
      ccAgencies: [],
      reporterId: 'ibrahim',
      createdAt: '2026-11-02T10:00:00Z',
    }),
  ];

  it('shows a citizen only their own reports under "mine"', () => {
    expect(reportsForScope(reports, citizen, 'mine').map(r => r.id)).toEqual([
      'a',
    ]);
  });

  it('shows staff the reports their agency leads', () => {
    expect(
      reportsForScope(reports, council, 'assigned').map(r => r.id),
    ).toEqual(['c']);
  });

  it('shows staff the reports they are copied in on', () => {
    expect(reportsForScope(reports, council, 'cc').map(r => r.id)).toEqual([
      'a',
      'b',
    ]);
  });

  it('returns nothing when signed out', () => {
    expect(reportsForScope(reports, null, 'community')).toEqual([]);
  });

  it('filters open vs closed', () => {
    expect(filterByStatus(reports, 'open').map(r => r.id)).toEqual(['a', 'c']);
    expect(filterByStatus(reports, 'closed').map(r => r.id)).toEqual(['b']);
  });

  it('sorts newest first without mutating the input', () => {
    expect(sortNewestFirst(reports).map(r => r.id)).toEqual(['b', 'c', 'a']);
    expect(reports[0].id).toBe('a');
  });

  it('counts reports by status', () => {
    expect(countByStatus(reports)).toEqual({total: 3, open: 2, resolved: 1});
  });
});

describe('helpers', () => {
  it('makes stable user ids', () => {
    expect(makeUserId('  Aisha Naseem ')).toBe('aisha-naseem');
    expect(makeUserId('Ali', 'stelco')).toBe('stelco:ali');
  });

  it('formats relative times', () => {
    const now = new Date('2026-11-01T12:00:00Z');
    expect(timeAgo('2026-11-01T11:59:40Z', now)).toBe('just now');
    expect(timeAgo('2026-11-01T11:30:00Z', now)).toBe('30 min ago');
    expect(timeAgo('2026-11-01T09:00:00Z', now)).toBe('3 h ago');
    expect(timeAgo('2026-10-30T12:00:00Z', now)).toBe('2 d ago');
  });

  it('shortens long Nominatim addresses', () => {
    expect(
      shortenAddress('Majeedhee Magu, Henveiru, Malé, Kaafu Atoll, Maldives'),
    ).toBe('Majeedhee Magu, Henveiru, Malé');
  });
});
