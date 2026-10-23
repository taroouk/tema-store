-- AlterTable
ALTER TABLE "StoreSettings" ADD COLUMN     "bingVerification" TEXT,
ADD COLUMN     "googleVerification" TEXT,
ADD COLUMN     "storeHours" TEXT;

-- CreateTable
CREATE TABLE "ContentPage" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL,

    CONSTRAINT "ContentPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaqItem" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FaqItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContentPage_slug_key" ON "ContentPage"("slug");

-- CreateIndex
CREATE INDEX "ContentPage_slug_idx" ON "ContentPage"("slug");

-- CreateIndex
CREATE INDEX "FaqItem_position_idx" ON "FaqItem"("position");


ALTER TABLE "ContentPage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FaqItem" ENABLE ROW LEVEL SECURITY;
