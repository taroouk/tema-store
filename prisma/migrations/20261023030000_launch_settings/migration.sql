-- AlterTable
ALTER TABLE "StoreSettings" ADD COLUMN     "businessAddress" TEXT,
ADD COLUMN     "commercialRegister" TEXT,
ADD COLUMN     "facebookUrl" TEXT,
ADD COLUMN     "instagramUrl" TEXT,
ADD COLUMN     "pinterestUrl" TEXT,
ADD COLUMN     "taxCardNumber" TEXT,
ADD COLUMN     "tiktokUrl" TEXT,
ADD COLUMN     "unpaidHoldHours" INTEGER NOT NULL DEFAULT 48,
ADD COLUMN     "xUrl" TEXT;

