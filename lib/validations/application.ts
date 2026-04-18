import { z } from "zod";
import { REJECTED_WITHDRAWN_STAGE } from "@/lib/utils";

const optionalNameSchema = z
  .union([
    z.string().trim().min(1, "Recruiter name is required").max(100),
    z.literal(""),
  ])
  .optional();

const optionalEmailSchema = z
  .union([z.string().email("Must be a valid email"), z.literal("")])
  .optional();

const optionalPhoneSchema = z
  .union([
    z
      .string()
      .regex(
        /^\+\d{1,4}\d{10}$/,
        "Phone must include a country code and exactly 10 digits",
      ),
    z.literal(""),
  ])
  .optional();

const optionalUrlSchema = z
  .union([z.string().url("Must be a valid URL"), z.literal("")])
  .optional();

export const baseStageSchema = z.enum([
  "Applied",
  "Screening",
  "Interview",
  REJECTED_WITHDRAWN_STAGE,
  "Withdrawn",
  "Rejected",
  "Accepted",
]);

const interviewStageSchema = z
  .string()
  .regex(/^Interview:[1-6]$/, "Invalid interview stage");

const stageSchema = z.union([baseStageSchema, interviewStageSchema]);

export const createApplicationSchema = z.object({
  company: z.string().min(1, "Company is required").max(100),
  role: z.string().min(1, "Role is required").max(100),
  jobLink: z.string().url("Must be a valid URL"),
  location: z.string().min(1, "Location is required").max(100),
  recruiterName: optionalNameSchema,
  recruiterEmail: optionalEmailSchema,
  recruiterPhone: optionalPhoneSchema,
  recruiterSocial: optionalUrlSchema,
  status: stageSchema.optional(),
  interviewRounds: z.array(z.string().min(1).max(100)).max(6).optional(),
});

export const updateApplicationSchema = createApplicationSchema.partial();
