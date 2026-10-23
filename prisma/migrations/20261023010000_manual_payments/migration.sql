-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'AWAITING_VERIFICATION';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentProof" TEXT,
ADD COLUMN     "paymentReference" TEXT,
ADD COLUMN     "paymentSender" TEXT;

-- AlterTable
ALTER TABLE "StoreSettings" ADD COLUMN     "codEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "instapayAccountName" TEXT,
ADD COLUMN     "instapayEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "instapayHandle" TEXT,
ADD COLUMN     "paymentInstructions" TEXT,
ADD COLUMN     "walletEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "walletNumber" TEXT,
ADD COLUMN     "walletProvider" TEXT;

