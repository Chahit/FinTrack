/*
  Warnings:

  - Added the required column `username` to the `ChatMessage` table without a default value. This is not possible if the table is not empty.

*/
-- First add the column as nullable
ALTER TABLE "ChatMessage" ADD COLUMN "username" TEXT;

-- Update existing messages with a default username from the user's email
UPDATE "ChatMessage" cm
SET username = (
  SELECT SPLIT_PART(email, '@', 1)
  FROM "User" u
  WHERE u.id = cm."userId"
);

-- Make the column required
ALTER TABLE "ChatMessage" ALTER COLUMN "username" SET NOT NULL;
