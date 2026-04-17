ALTER TABLE "public"."Application"
ADD COLUMN "interviewRounds" TEXT[] DEFAULT ARRAY[]::TEXT[];

UPDATE "public"."Application"
SET "interviewRounds" = ARRAY['Round 1']
WHERE "status" = 'Interview';

ALTER TABLE "public"."Application"
ALTER COLUMN "interviewRounds" SET NOT NULL;