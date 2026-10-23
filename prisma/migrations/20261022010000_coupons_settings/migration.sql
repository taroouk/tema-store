-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENT', 'FIXED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "couponCode" TEXT;

-- CreateTable
CREATE TABLE "Coupon" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "type" "DiscountType" NOT NULL DEFAULT 'PERCENT',
    "value" DECIMAL(10,2) NOT NULL,
    "minSubtotal" DECIMAL(10,2),
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "storeName" TEXT NOT NULL DEFAULT 'TEMA',
    "supportEmail" TEXT,
    "supportPhone" TEXT,
    "announcement" TEXT,
    "standardShippingFee" DECIMAL(10,2) NOT NULL DEFAULT 80,
    "expressShippingFee" DECIMAL(10,2) NOT NULL DEFAULT 150,
    "freeShippingThreshold" DECIMAL(10,2) NOT NULL DEFAULT 1500,

    CONSTRAINT "StoreSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_isActive_idx" ON "Coupon"("isActive");


-- Row Level Security: server-only access (see 20261022000100_enable_rls)
ALTER TABLE "Coupon" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StoreSettings" ENABLE ROW LEVEL SECURITY;

-- Default settings row + the two coupons the storefront already advertised
INSERT INTO "StoreSettings" ("id", "updatedAt") VALUES (1, CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;
INSERT INTO "Coupon" ("id", "code", "type", "value", "updatedAt")
VALUES (gen_random_uuid(), 'TEMA10', 'PERCENT', 10, CURRENT_TIMESTAMP),
       (gen_random_uuid(), 'WELCOME15', 'PERCENT', 15, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
