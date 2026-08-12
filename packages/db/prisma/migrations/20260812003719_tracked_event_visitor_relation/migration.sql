-- AddForeignKey
ALTER TABLE "trackedEvent" ADD CONSTRAINT "trackedEvent_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "trackedVisitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
