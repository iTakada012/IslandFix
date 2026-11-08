/**
 * Core types for the civic reporting domain.
 * Kept free of React / MobX imports so they can be unit tested easily.
 */

/** Organisations that can receive reports. */
export type AgencyId = 'council' | 'stelco' | 'mwsc';

/** Who is using the app. Citizens report; agency staff respond. */
export type Role = 'citizen' | 'staff';

export type CategoryId =
  | 'street_light'
  | 'power_outage'
  | 'water_leak'
  | 'no_water'
  | 'sewage'
  | 'road_damage'
  | 'waste'
  | 'public_space'
  | 'other';

export type ReportStatus =
  | 'submitted'
  | 'acknowledged'
  | 'in_progress'
  | 'resolved'
  | 'rejected';

export type GeoPoint = {
  latitude: number;
  longitude: number;
};

/** One entry in a report's status timeline. */
export type StatusEvent = {
  status: ReportStatus;
  at: string; // ISO date string (JSON-friendly for AsyncStorage)
  by: string; // display name of the person who made the change
  note?: string;
};

export type Report = {
  id: string;
  category: CategoryId;
  description: string;
  landmark?: string;
  photoUri?: string;
  location?: GeoPoint;
  address?: string; // human readable, from the Nominatim API (optional)
  leadAgency: AgencyId;
  ccAgencies: AgencyId[];
  status: ReportStatus;
  history: StatusEvent[];
  reporterId: string;
  reporterName: string;
  createdAt: string;
  updatedAt: string;
};

/** The signed-in person (stored locally, no real backend). */
export type AppUser = {
  id: string;
  name: string;
  role: Role;
  agency?: AgencyId; // only for staff
};
