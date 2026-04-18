export interface Note {
  id: string;
  applicationId: string;
  stage?: string | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ApplicationStage =
  | "Applied"
  | "Screening"
  | "Interview"
  | "Rejected/Withdrawn"
  | "Withdrawn"
  | "Rejected"
  | "Accepted";

export interface StageDefinition {
  id: ApplicationStage;
  label: string;
  description: string;
}

export interface Application {
  id: string;
  userId: string;
  company: string;
  role: string;
  jobLink?: string | null;
  location?: string | null;
  recruiterName?: string | null;
  recruiterEmail?: string | null;
  recruiterPhone?: string | null;
  recruiterSocial?: string | null;
  status: string;
  interviewRounds: string[];
  appliedAt: Date;
  updatedAt: Date;
}

export interface ApplicationWithNotes extends Application {
  notes: Note[];
}

export interface ApplicationSummary extends Application {
  _count: {
    notes: number;
  };
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
