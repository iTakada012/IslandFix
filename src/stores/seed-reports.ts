/**
 * Demo data shown on first launch so the app (and user testing sessions)
 * start with realistic content. Dates are relative to "now".
 */
import {
  routeReport,
  type CategoryId,
  type Report,
  type ReportStatus,
} from '@/lib/reports';

const hoursAgo = (h: number) =>
  new Date(Date.now() - h * 3600_000).toISOString();

type SeedInput = {
  id: string;
  category: CategoryId;
  description: string;
  landmark: string;
  reporterName: string;
  createdHoursAgo: number;
  steps: {status: ReportStatus; hoursAgo: number; by: string; note?: string}[];
};

const SEEDS: SeedInput[] = [
  {
    id: 'seed-1',
    category: 'street_light',
    description:
      'Street lamp has been off for three nights. The lane is very dark.',
    landmark: 'Lane behind the island school',
    reporterName: 'Aisha',
    createdHoursAgo: 50,
    steps: [
      {status: 'acknowledged', hoursAgo: 40, by: 'STELCO Ops'},
      {
        status: 'in_progress',
        hoursAgo: 20,
        by: 'STELCO Ops',
        note: 'Technician scheduled for tomorrow morning.',
      },
    ],
  },
  {
    id: 'seed-2',
    category: 'sewage',
    description:
      'Sewage overflowing from the manhole after the rain. Strong smell.',
    landmark: 'Near the main mosque',
    reporterName: 'Ibrahim',
    createdHoursAgo: 8,
    steps: [],
  },
  {
    id: 'seed-3',
    category: 'road_damage',
    description:
      'Large pothole filling with water, motorbikes swerving around it.',
    landmark: 'Harbour road junction',
    reporterName: 'Mariyam',
    createdHoursAgo: 120,
    steps: [
      {status: 'acknowledged', hoursAgo: 110, by: 'Council Works'},
      {status: 'in_progress', hoursAgo: 90, by: 'Council Works'},
      {
        status: 'resolved',
        hoursAgo: 72,
        by: 'Council Works',
        note: 'Pothole filled and levelled.',
      },
    ],
  },
  {
    id: 'seed-4',
    category: 'waste',
    description: 'Garbage not collected this week, bins overflowing.',
    landmark: 'Beach side park',
    reporterName: 'Hassan',
    createdHoursAgo: 26,
    steps: [{status: 'acknowledged', hoursAgo: 20, by: 'Council Works'}],
  },
];

export function createSeedReports(): Report[] {
  return SEEDS.map(s => {
    const {lead, cc} = routeReport(s.category);
    const createdAt = hoursAgo(s.createdHoursAgo);
    const history = [
      {status: 'submitted' as ReportStatus, at: createdAt, by: s.reporterName},
      ...s.steps.map(st => ({
        status: st.status,
        at: hoursAgo(st.hoursAgo),
        by: st.by,
        note: st.note,
      })),
    ];
    const last = history[history.length - 1];
    return {
      id: s.id,
      category: s.category,
      description: s.description,
      landmark: s.landmark,
      leadAgency: lead,
      ccAgencies: cc,
      status: last.status,
      history,
      reporterId: s.reporterName.toLowerCase(),
      reporterName: s.reporterName,
      createdAt,
      updatedAt: last.at,
    };
  });
}
