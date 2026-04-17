import { z } from "zod";

const noteStageSchema = z
  .string()
  .regex(
    /^(Applied|Screening|Withdrawn|Rejected|Accepted|Interview(?::[1-6])?)$/,
    "Invalid stage",
  );

export const createNoteSchema = z.object({
  content: z.string().min(1, "Note content is required").max(2000),
  stage: noteStageSchema.optional().nullable(),
});

export const updateNoteSchema = createNoteSchema.partial();
