/*
  Warnings:

  - You are about to drop the column `currency` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `currentPrice` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `sector` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `fees` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `taxLotId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `preferences` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `settings` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Alert` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Analytics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Benchmark` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Dividend` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `News` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Rebalancing` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Report` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SocialProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaxLot` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Technical` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Watchlist` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `purchaseDate` to the `Asset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `portfolioId` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Alert" DROP CONSTRAINT "Alert_userId_fkey";

-- DropForeignKey
ALTER TABLE "Analytics" DROP CONSTRAINT "Analytics_portfolioId_fkey";

-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_portfolioId_fkey";

-- DropForeignKey
ALTER TABLE "Benchmark" DROP CONSTRAINT "Benchmark_portfolioId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_postId_fkey";

-- DropForeignKey
ALTER TABLE "Dividend" DROP CONSTRAINT "Dividend_assetId_fkey";

-- DropForeignKey
ALTER TABLE "Portfolio" DROP CONSTRAINT "Portfolio_userId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_socialProfileId_fkey";

-- DropForeignKey
ALTER TABLE "Rebalancing" DROP CONSTRAINT "Rebalancing_portfolioId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_userId_fkey";

-- DropForeignKey
ALTER TABLE "SocialProfile" DROP CONSTRAINT "SocialProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "TaxLot" DROP CONSTRAINT "TaxLot_portfolioId_fkey";

-- DropForeignKey
ALTER TABLE "Technical" DROP CONSTRAINT "Technical_assetId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_assetId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_taxLotId_fkey";

-- DropForeignKey
ALTER TABLE "Watchlist" DROP CONSTRAINT "Watchlist_userId_fkey";

-- DropIndex
DROP INDEX "Asset_portfolioId_symbol_idx";

-- DropIndex
DROP INDEX "Transaction_assetId_date_idx";

-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "currency",
DROP COLUMN "currentPrice",
DROP COLUMN "sector",
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "purchaseDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "fees",
DROP COLUMN "taxLotId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "portfolioId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "date" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "image",
DROP COLUMN "name",
DROP COLUMN "preferences",
DROP COLUMN "settings";

-- DropTable
DROP TABLE "Alert";

-- DropTable
DROP TABLE "Analytics";

-- DropTable
DROP TABLE "Benchmark";

-- DropTable
DROP TABLE "Comment";

-- DropTable
DROP TABLE "Dividend";

-- DropTable
DROP TABLE "News";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "Rebalancing";

-- DropTable
DROP TABLE "Report";

-- DropTable
DROP TABLE "SocialProfile";

-- DropTable
DROP TABLE "TaxLot";

-- DropTable
DROP TABLE "Technical";

-- DropTable
DROP TABLE "Watchlist";

-- DropEnum
DROP TYPE "AlertType";

-- DropEnum
DROP TYPE "AssetType";

-- DropEnum
DROP TYPE "TransactionType";

-- CreateTable
CREATE TABLE "PriceAlert" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceAlert_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceAlert" ADD CONSTRAINT "PriceAlert_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
