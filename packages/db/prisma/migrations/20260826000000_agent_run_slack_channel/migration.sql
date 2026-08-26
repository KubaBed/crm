-- AlterTable
ALTER TABLE "agentRun" ADD COLUMN     "slackChannelId" TEXT;

-- CreateIndex
CREATE INDEX "agentRun_slackChannelId_status_idx" ON "agentRun"("slackChannelId", "status");
