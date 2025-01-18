-- Rename the message column to content and handle existing data
ALTER TABLE "ChatMessage" RENAME COLUMN "message" TO "content";

-- Add role column with default value
ALTER TABLE "ChatMessage" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'user';

-- Add groupId column (nullable)
ALTER TABLE "ChatMessage" ADD COLUMN "groupId" TEXT;

-- Drop username column
ALTER TABLE "ChatMessage" DROP COLUMN "username";

-- CreateTable
CREATE TABLE "ChatGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatGroupMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatGroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatGroup_inviteCode_key" ON "ChatGroup"("inviteCode");

-- CreateIndex
CREATE INDEX "ChatGroup_inviteCode_idx" ON "ChatGroup"("inviteCode");

-- CreateIndex
CREATE UNIQUE INDEX "ChatGroupMember_userId_groupId_key" ON "ChatGroupMember"("userId", "groupId");

-- CreateIndex
CREATE INDEX "ChatGroupMember_groupId_idx" ON "ChatGroupMember"("groupId");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ChatGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatGroupMember" ADD CONSTRAINT "ChatGroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatGroupMember" ADD CONSTRAINT "ChatGroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ChatGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE; 