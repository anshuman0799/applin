import { z } from "zod";

export const baseStageSchema = z.enum([
  "Applied",
  "Screening",
  "Interview",
  "Withdrawn",
  "Rejected",
  "Accepted",
]);

export const createApplicationSchema = z.object({
  company: z.string().min(1, "Company is required").max(100),
  role: z.string().min(1, "Role is required").max(100),
  jobLink: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  location: z.string().max(100).optional(),
  status: baseStageSchema.optional(),
  interviewRounds: z.array(z.string().min(1).max(100)).max(6).optional(),
});

export const updateApplicationSchema = createApplicationSchema.partial();
