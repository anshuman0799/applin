export enum Status {
  APPLIED = 'APPLIED',
  PHONE_SCREEN = 'PHONE_SCREEN',
  INTERVIEW = 'INTERVIEW',
  OFFER = 'OFFER',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export interface Note {
  id: string
  applicationId: string
  content: string
  createdAt: Date
  updatedAt: Date
}

export interface Application {
  id: string
  userId: string
  company: string
  role: string
  jobLink?: string | null
  location?: string | null
  salary?: string | null
  status: Status
  appliedAt: Date
  updatedAt: Date
}

export interface ApplicationWithNotes extends Application {
  notes: Note[]
}

export interface ApplicationSummary extends Application {
  _count: {
    notes: number
  }
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}
