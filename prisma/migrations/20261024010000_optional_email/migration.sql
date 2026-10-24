-- AlterTable
ALTER TABLE "ContactMessage" ADD COLUMN     "phone" TEXT,
ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "email" DROP NOT NULL;

