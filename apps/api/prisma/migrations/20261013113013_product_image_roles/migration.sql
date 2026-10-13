-- CreateEnum
CREATE TYPE "ImageRole" AS ENUM ('COLOR', 'NEUTRAL', 'TOP');

-- AlterTable
ALTER TABLE "ProductImage" ADD COLUMN     "role" "ImageRole" NOT NULL DEFAULT 'COLOR';

-- CreateIndex
CREATE UNIQUE INDEX "ProductImage_productId_role_key" ON "ProductImage"("productId", "role");

