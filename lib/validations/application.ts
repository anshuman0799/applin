import { z } from "zod";

export const createApplicationSchema = z.object({
  company: z.string().min(1, "Company is required").max(100),
  role: z.string().min(1, "Role is required").max(100),
  jobLink: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  location: z.string().max(100).optional(),
  status: z.string().min(1, "Status is required").max(100).optional(),
});

export const updateApplicationSchema = createApplicationSchema.partial();
