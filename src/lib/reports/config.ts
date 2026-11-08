/**
 * Static configuration: agencies, report categories and status labels.
 *
 * The ROUTING RULES of the app live in CATEGORIES below: every category has
 * one lead agency (responsible for fixing it) and optional agencies that are
 * copied in (CC) so they stay informed.
 */
import type {AgencyId, CategoryId, ReportStatus} from './types';

export type Agency = {
  id: AgencyId;
  name: string;
  shortName: string;
  description: string;
  color: string; // used for badges
};

export const AGENCIES: Record<AgencyId, Agency> = {
  council: {
    id: 'council',
    name: 'Island Council',
    shortName: 'Council',
    description: 'Roads, waste, public spaces and general municipal services',
    color: '#2563EB',
  },
  stelco: {
    id: 'stelco',
    name: 'STELCO',
    shortName: 'STELCO',
    description: 'Electricity supply and street lighting',
    color: '#D97706',
  },
  mwsc: {
    id: 'mwsc',
    name: 'MWSC',
    shortName: 'MWSC',
    description: 'Water supply and sewerage',
    color: '#0891B2',
  },
};

export const AGENCY_IDS = Object.keys(AGENCIES) as AgencyId[];

export type Category = {
  id: CategoryId;
  label: string;
  icon: string; // emoji keeps things simple and works on every platform
  hint: string;
  lead: AgencyId;
  cc: AgencyId[];
};

export const CATEGORIES: Category[] = [
  {
    id: 'street_light',
    label: 'Street light',
    icon: '💡',
    hint: 'Broken, flickering or always-on lamp',
    lead: 'stelco',
    cc: ['council'],
  },
  {
    id: 'power_outage',
    label: 'Power / wires',
    icon: '⚡',
    hint: 'Outage, exposed or fallen wires',
    lead: 'stelco',
    cc: ['council'],
  },
  {
    id: 'water_leak',
    label: 'Water leak',
    icon: '💧',
    hint: 'Burst or leaking pipe',
    lead: 'mwsc',
    cc: ['council'],
  },
  {
    id: 'no_water',
    label: 'No water',
    icon: '🚱',
    hint: 'No supply or low pressure',
    lead: 'mwsc',
    cc: [],
  },
  {
    id: 'sewage',
    label: 'Sewage / drain',
    icon: '🚧',
    hint: 'Overflowing sewage or blocked drain',
    lead: 'mwsc',
    cc: ['council'],
  },
  {
    id: 'road_damage',
    label: 'Road damage',
    icon: '🛣️',
    hint: 'Potholes, flooding, damaged paving',
    lead: 'council',
    cc: [],
  },
  {
    id: 'waste',
    label: 'Waste',
    icon: '🗑️',
    hint: 'Missed collection or illegal dumping',
    lead: 'council',
    cc: [],
  },
  {
    id: 'public_space',
    label: 'Public space',
    icon: '🌴',
    hint: 'Parks, beaches, benches, trees',
    lead: 'council',
    cc: [],
  },
  {
    id: 'other',
    label: 'Other',
    icon: '📝',
    hint: 'Anything else for the council',
    lead: 'council',
    cc: [],
  },
];

export type StatusMeta = {
  label: string;
  /** Tailwind classes for the badge background + text. */
  badgeClass: string;
  textClass: string;
};

export const STATUS_META: Record<ReportStatus, StatusMeta> = {
  submitted: {
    label: 'Submitted',
    badgeClass: 'bg-neutral-200 dark:bg-neutral-700',
    textClass: 'text-neutral-800 dark:text-neutral-100',
  },
  acknowledged: {
    label: 'Acknowledged',
    badgeClass: 'bg-blue-100 dark:bg-blue-900',
    textClass: 'text-blue-800 dark:text-blue-100',
  },
  in_progress: {
    label: 'In progress',
    badgeClass: 'bg-amber-100 dark:bg-amber-900',
    textClass: 'text-amber-800 dark:text-amber-100',
  },
  resolved: {
    label: 'Resolved',
    badgeClass: 'bg-green-100 dark:bg-green-900',
    textClass: 'text-green-800 dark:text-green-100',
  },
  rejected: {
    label: 'Rejected',
    badgeClass: 'bg-red-100 dark:bg-red-900',
    textClass: 'text-red-800 dark:text-red-100',
  },
};

export const STATUS_ORDER: ReportStatus[] = [
  'submitted',
  'acknowledged',
  'in_progress',
  'resolved',
  'rejected',
];
