/*
  Warnings:

  - The `status` column on the `Application` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Application" DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Applied';

-- DropEnum
DROP TYPE "Status";
