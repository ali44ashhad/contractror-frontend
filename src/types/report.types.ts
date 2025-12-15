import { Update } from './update.types';
import { Team } from './team.types';
import { UserReference } from './project.types';

/**
 * Member update interface for individual member's updates per date
 */
export interface MemberUpdate {
  morning: Update | null;
  evening: Update | null;
}

/**
 * Updates grouped by date
 * Key is date string (YYYY-MM-DD), value is map of member ID to their updates
 */
export interface UpdatesByDate {
  [dateKey: string]: {
    [memberId: string]: MemberUpdate;
  };
}

/**
 * Project report interface matching backend response
 */
export interface ProjectReport {
  project: {
    _id: string;
    name: string;
    description: string;
    status: string;
    adminId: string | UserReference;
    contractorId?: string | UserReference | null;
  };
  teams: Team[];
  members: (string | UserReference)[];
  updatesByDate: UpdatesByDate;
}

/**
 * Get project report response from backend
 */
export interface GetProjectReportResponse {
  success: boolean;
  data: ProjectReport;
}

