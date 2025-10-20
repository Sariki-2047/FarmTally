/*
  Warnings:

  - The values [IN_TRANSIT,MAINTENANCE] on the enum `LorryStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [MEDIUM] on the enum `RequestPriority` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `advance_payments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `adjusted_in_delivery` on the `advance_payments` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `advance_payments` table. All the data in the column will be lost.
  - You are about to drop the column `farmer_id` on the `advance_payments` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `advance_payments` table. All the data in the column will be lost.
  - You are about to drop the column `payment_date` on the `advance_payments` table. All the data in the column will be lost.
  - You are about to drop the column `payment_method` on the `advance_payments` table. All the data in the column will be lost.
  - You are about to drop the column `reason` on the `advance_payments` table. All the data in the column will be lost.
  - You are about to drop the column `receipt_photo` on the `advance_payments` table. All the data in the column will be lost.
  - You are about to drop the column `recorded_by` on the `advance_payments` table. All the data in the column will be lost.
  - You are about to drop the column `reference_number` on the `advance_payments` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `advance_payments` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `advance_payments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - The `status` column on the `advance_payments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `deliveries` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `advance_amount` on the `deliveries` table. All the data in the column will be lost.
  - You are about to drop the column `bags_count` on the `deliveries` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `deliveries` table. All the data in the column will be lost.
  - You are about to drop the column `delivery_date` on the `deliveries` table. All the data in the column will be lost.
  - You are about to drop the column `farmer_id` on the `deliveries` table. All the data in the column will be lost.
  - You are about to drop the column `final_amount` on the `deliveries` table. All the data in the column will be lost.
  - You are about to drop the column `gross_weight` on the `deliveries` table. All the data in the column will be lost.
  - You are about to drop the column `individual_weights` on the `deliveries` table. All the data in the column will be lost.
  - You are about to drop the column `interest_charges` on the `deliveries` table. All the data in the column will be lost.
  - You are about to drop the column `lorry_id` on the `deliveries` table. All the data in the column will be lost.
  - You are about to drop the column `manager_id` on the `deliveries` table. All the data in the column will be lost.
  - You are about to drop the column `moisture_content` on the `deliveries` table. All the data in the column will be lost.
  - You are about to drop the column `net_weight` on the `deliveries` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `deliveries` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `deliveries` table. All the data in the column will be lost.
  - You are about to drop the column `photos` on the `deliveries` table. All the data in the column will be lost.
  - You are about to drop the column `price_per_kg` on the `deliveries` table. All the data in the column will be lost.
  - You are about to drop the column `quality_deduction` on the `deliveries` table. All the data in the column will be lost.
  - You are about to drop the column `quality_deduction_reason` on the `deliveries` table. All the data in the column will be lost.
  - You are about to drop the column `standard_deduction` on the `deliveries` table. All the data in the column will be lost.
  - You are about to drop the column `total_value` on the `deliveries` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `deliveries` table. All the data in the column will be lost.
  - The primary key for the `farmer_organizations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `farmer_id` on the `farmer_organizations` table. All the data in the column will be lost.
  - You are about to drop the column `join_date` on the `farmer_organizations` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `farmer_organizations` table. All the data in the column will be lost.
  - You are about to drop the column `quality_rating` on the `farmer_organizations` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `farmer_organizations` table. All the data in the column will be lost.
  - You are about to drop the column `total_deliveries` on the `farmer_organizations` table. All the data in the column will be lost.
  - You are about to drop the column `total_earnings` on the `farmer_organizations` table. All the data in the column will be lost.
  - The primary key for the `farmers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `bank_details` on the `farmers` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `farmers` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `farmers` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `farmers` table. All the data in the column will be lost.
  - You are about to drop the column `id_number` on the `farmers` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `farmers` table. All the data in the column will be lost.
  - The primary key for the `lorries` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `assigned_at` on the `lorries` table. All the data in the column will be lost.
  - You are about to drop the column `assigned_manager_id` on the `lorries` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `lorries` table. All the data in the column will be lost.
  - You are about to drop the column `license_plate` on the `lorries` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `lorries` table. All the data in the column will be lost.
  - You are about to drop the column `maintenance_schedule` on the `lorries` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `lorries` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `lorries` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `lorries` table. All the data in the column will be lost.
  - The primary key for the `lorry_requests` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `approved_at` on the `lorry_requests` table. All the data in the column will be lost.
  - You are about to drop the column `approved_by` on the `lorry_requests` table. All the data in the column will be lost.
  - You are about to drop the column `assigned_lorry_id` on the `lorry_requests` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `lorry_requests` table. All the data in the column will be lost.
  - You are about to drop the column `estimated_duration` on the `lorry_requests` table. All the data in the column will be lost.
  - You are about to drop the column `expected_volume` on the `lorry_requests` table. All the data in the column will be lost.
  - You are about to drop the column `manager_id` on the `lorry_requests` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `lorry_requests` table. All the data in the column will be lost.
  - You are about to drop the column `rejection_reason` on the `lorry_requests` table. All the data in the column will be lost.
  - You are about to drop the column `required_date` on the `lorry_requests` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `lorry_requests` table. All the data in the column will be lost.
  - The primary key for the `organizations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `owner_id` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `settings` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `organizations` table. All the data in the column will be lost.
  - The primary key for the `report_generations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `report_generations` table. All the data in the column will be lost.
  - You are about to drop the column `farmer_id` on the `report_generations` table. All the data in the column will be lost.
  - You are about to drop the column `generated_by_id` on the `report_generations` table. All the data in the column will be lost.
  - You are about to drop the column `lorry_id` on the `report_generations` table. All the data in the column will be lost.
  - You are about to drop the column `report_data` on the `report_generations` table. All the data in the column will be lost.
  - You are about to drop the column `report_id` on the `report_generations` table. All the data in the column will be lost.
  - You are about to drop the column `report_type` on the `report_generations` table. All the data in the column will be lost.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `fcm_tokens` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_login` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `password_hash` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `preferences` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `audit_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[farmerId,organizationId]` on the table `farmer_organizations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `farmers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[plateNumber]` on the table `lorries` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[licensePlate]` on the table `lorries` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `farmerId` to the `advance_payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `advance_payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `processedById` to the `advance_payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `advance_payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bagsCount` to the `deliveries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `farmerId` to the `deliveries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fieldManagerId` to the `deliveries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grossWeight` to the `deliveries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `individualWeights` to the `deliveries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lorryId` to the `deliveries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `netWeight` to the `deliveries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `deliveries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `deliveries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `farmerId` to the `farmer_organizations` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `farmer_organizations` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `organizationId` to the `farmer_organizations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `farmer_organizations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `farmers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `farmers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `farmers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `farmers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `licensePlate` to the `lorries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `lorries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plateNumber` to the `lorries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `lorries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estimatedFarmers` to the `lorry_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estimatedWeight` to the `lorry_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `managerId` to the `lorry_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `lorry_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requestedDate` to the `lorry_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `lorry_requests` table without a default value. This is not possible if the table is not empty.
  - Made the column `location` on table `lorry_requests` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `organizations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `report_generations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parameters` to the `report_generations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reportType` to the `report_generations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `report_generations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `report_generations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `users` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "QualityGrade" AS ENUM ('A', 'B', 'C', 'D', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('ADVANCE', 'SETTLEMENT', 'BONUS', 'DEDUCTION');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('FARMER_SETTLEMENT', 'LORRY_SUMMARY', 'DELIVERY_REPORT', 'PAYMENT_HISTORY', 'ADVANCE_SUMMARY');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('GENERATING', 'COMPLETED', 'FAILED');

-- AlterEnum
BEGIN;
CREATE TYPE "LorryStatus_new" AS ENUM ('AVAILABLE', 'ASSIGNED', 'LOADING', 'SUBMITTED', 'SENT_TO_DEALER');
ALTER TABLE "lorries" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "lorries" ALTER COLUMN "status" TYPE "LorryStatus_new" USING ("status"::text::"LorryStatus_new");
ALTER TYPE "LorryStatus" RENAME TO "LorryStatus_old";
ALTER TYPE "LorryStatus_new" RENAME TO "LorryStatus";
DROP TYPE "LorryStatus_old";
ALTER TABLE "lorries" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "RequestPriority_new" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
ALTER TABLE "lorry_requests" ALTER COLUMN "priority" DROP DEFAULT;
ALTER TABLE "lorry_requests" ALTER COLUMN "priority" TYPE "RequestPriority_new" USING ("priority"::text::"RequestPriority_new");
ALTER TYPE "RequestPriority" RENAME TO "RequestPriority_old";
ALTER TYPE "RequestPriority_new" RENAME TO "RequestPriority";
DROP TYPE "RequestPriority_old";
ALTER TABLE "lorry_requests" ALTER COLUMN "priority" SET DEFAULT 'NORMAL';
COMMIT;

-- DropForeignKey
ALTER TABLE "advance_payments" DROP CONSTRAINT "advance_payments_farmer_id_fkey";

-- DropForeignKey
ALTER TABLE "advance_payments" DROP CONSTRAINT "advance_payments_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "advance_payments" DROP CONSTRAINT "advance_payments_recorded_by_fkey";

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "deliveries" DROP CONSTRAINT "deliveries_farmer_id_fkey";

-- DropForeignKey
ALTER TABLE "deliveries" DROP CONSTRAINT "deliveries_lorry_id_fkey";

-- DropForeignKey
ALTER TABLE "deliveries" DROP CONSTRAINT "deliveries_manager_id_fkey";

-- DropForeignKey
ALTER TABLE "deliveries" DROP CONSTRAINT "deliveries_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "farmer_organizations" DROP CONSTRAINT "farmer_organizations_farmer_id_fkey";

-- DropForeignKey
ALTER TABLE "farmer_organizations" DROP CONSTRAINT "farmer_organizations_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "farmers" DROP CONSTRAINT "farmers_created_by_fkey";

-- DropForeignKey
ALTER TABLE "lorries" DROP CONSTRAINT "lorries_assigned_manager_id_fkey";

-- DropForeignKey
ALTER TABLE "lorries" DROP CONSTRAINT "lorries_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "lorry_requests" DROP CONSTRAINT "lorry_requests_approved_by_fkey";

-- DropForeignKey
ALTER TABLE "lorry_requests" DROP CONSTRAINT "lorry_requests_assigned_lorry_id_fkey";

-- DropForeignKey
ALTER TABLE "lorry_requests" DROP CONSTRAINT "lorry_requests_manager_id_fkey";

-- DropForeignKey
ALTER TABLE "lorry_requests" DROP CONSTRAINT "lorry_requests_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_fkey";

-- DropForeignKey
ALTER TABLE "organizations" DROP CONSTRAINT "organizations_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "report_generations" DROP CONSTRAINT "report_generations_generated_by_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_organization_id_fkey";

-- DropIndex
DROP INDEX "report_generations_report_id_key";

-- DropIndex
DROP INDEX "users_phone_key";

-- AlterTable
ALTER TABLE "advance_payments" DROP CONSTRAINT "advance_payments_pkey",
DROP COLUMN "adjusted_in_delivery",
DROP COLUMN "created_at",
DROP COLUMN "farmer_id",
DROP COLUMN "organization_id",
DROP COLUMN "payment_date",
DROP COLUMN "payment_method",
DROP COLUMN "reason",
DROP COLUMN "receipt_photo",
DROP COLUMN "recorded_by",
DROP COLUMN "reference_number",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "farmerId" TEXT NOT NULL,
ADD COLUMN     "interestRate" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "organizationId" TEXT NOT NULL,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "processedById" TEXT NOT NULL,
ADD COLUMN     "reference" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION,
DROP COLUMN "status",
ADD COLUMN     "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD CONSTRAINT "advance_payments_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "deliveries" DROP CONSTRAINT "deliveries_pkey",
DROP COLUMN "advance_amount",
DROP COLUMN "bags_count",
DROP COLUMN "created_at",
DROP COLUMN "delivery_date",
DROP COLUMN "farmer_id",
DROP COLUMN "final_amount",
DROP COLUMN "gross_weight",
DROP COLUMN "individual_weights",
DROP COLUMN "interest_charges",
DROP COLUMN "lorry_id",
DROP COLUMN "manager_id",
DROP COLUMN "moisture_content",
DROP COLUMN "net_weight",
DROP COLUMN "notes",
DROP COLUMN "organization_id",
DROP COLUMN "photos",
DROP COLUMN "price_per_kg",
DROP COLUMN "quality_deduction",
DROP COLUMN "quality_deduction_reason",
DROP COLUMN "standard_deduction",
DROP COLUMN "total_value",
DROP COLUMN "updated_at",
ADD COLUMN     "advanceAmount" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "bagsCount" INTEGER NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "deliveryDate" TIMESTAMP(3),
ADD COLUMN     "farmerId" TEXT NOT NULL,
ADD COLUMN     "fieldManagerId" TEXT NOT NULL,
ADD COLUMN     "finalAmount" DOUBLE PRECISION,
ADD COLUMN     "grossWeight" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "individualWeights" JSONB NOT NULL,
ADD COLUMN     "interestCharges" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "lorryId" TEXT NOT NULL,
ADD COLUMN     "moistureContent" DOUBLE PRECISION,
ADD COLUMN     "netWeight" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "organizationId" TEXT NOT NULL,
ADD COLUMN     "pricePerKg" DOUBLE PRECISION,
ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "qualityDeduction" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "qualityGrade" "QualityGrade",
ADD COLUMN     "standardDeduction" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "totalValue" DOUBLE PRECISION,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "deliveries_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "farmer_organizations" DROP CONSTRAINT "farmer_organizations_pkey",
DROP COLUMN "farmer_id",
DROP COLUMN "join_date",
DROP COLUMN "organization_id",
DROP COLUMN "quality_rating",
DROP COLUMN "status",
DROP COLUMN "total_deliveries",
DROP COLUMN "total_earnings",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "farmerId" TEXT NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "organizationId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "farmer_organizations_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "farmers" DROP CONSTRAINT "farmers_pkey",
DROP COLUMN "bank_details",
DROP COLUMN "created_at",
DROP COLUMN "created_by",
DROP COLUMN "email",
DROP COLUMN "id_number",
DROP COLUMN "updated_at",
ADD COLUMN     "bankAccount" TEXT,
ADD COLUMN     "bankDetails" JSONB,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "idNumber" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "organizationId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "phone" SET DATA TYPE TEXT,
ADD CONSTRAINT "farmers_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "lorries" DROP CONSTRAINT "lorries_pkey",
DROP COLUMN "assigned_at",
DROP COLUMN "assigned_manager_id",
DROP COLUMN "created_at",
DROP COLUMN "license_plate",
DROP COLUMN "location",
DROP COLUMN "maintenance_schedule",
DROP COLUMN "name",
DROP COLUMN "organization_id",
DROP COLUMN "updated_at",
ADD COLUMN     "assignedManagerId" TEXT,
ADD COLUMN     "assignedToId" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "licensePlate" TEXT NOT NULL,
ADD COLUMN     "organizationId" TEXT NOT NULL,
ADD COLUMN     "plateNumber" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "capacity" SET DATA TYPE DOUBLE PRECISION,
ADD CONSTRAINT "lorries_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "lorry_requests" DROP CONSTRAINT "lorry_requests_pkey",
DROP COLUMN "approved_at",
DROP COLUMN "approved_by",
DROP COLUMN "assigned_lorry_id",
DROP COLUMN "created_at",
DROP COLUMN "estimated_duration",
DROP COLUMN "expected_volume",
DROP COLUMN "manager_id",
DROP COLUMN "organization_id",
DROP COLUMN "rejection_reason",
DROP COLUMN "required_date",
DROP COLUMN "updated_at",
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "assignedLorryId" TEXT,
ADD COLUMN     "assignedLorryNumber" TEXT,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "estimatedFarmers" INTEGER NOT NULL,
ADD COLUMN     "estimatedWeight" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "managerId" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "organizationId" TEXT NOT NULL,
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "requestedDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "priority" SET DEFAULT 'NORMAL',
ALTER COLUMN "location" SET NOT NULL,
ADD CONSTRAINT "lorry_requests_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "organizations" DROP CONSTRAINT "organizations_pkey",
DROP COLUMN "created_at",
DROP COLUMN "owner_id",
DROP COLUMN "settings",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "ownerId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "code" SET DATA TYPE TEXT,
ALTER COLUMN "phone" SET DATA TYPE TEXT,
ALTER COLUMN "email" SET DATA TYPE TEXT,
ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "report_generations" DROP CONSTRAINT "report_generations_pkey",
DROP COLUMN "created_at",
DROP COLUMN "farmer_id",
DROP COLUMN "generated_by_id",
DROP COLUMN "lorry_id",
DROP COLUMN "report_data",
DROP COLUMN "report_id",
DROP COLUMN "report_type",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "filePath" TEXT,
ADD COLUMN     "generatedAt" TIMESTAMP(3),
ADD COLUMN     "organizationId" TEXT NOT NULL,
ADD COLUMN     "parameters" JSONB NOT NULL,
ADD COLUMN     "reportType" "ReportType" NOT NULL,
ADD COLUMN     "status" "ReportStatus" NOT NULL DEFAULT 'GENERATING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "report_generations_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "created_at",
DROP COLUMN "fcm_tokens",
DROP COLUMN "last_login",
DROP COLUMN "organization_id",
DROP COLUMN "password_hash",
DROP COLUMN "preferences",
DROP COLUMN "status",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "organizationId" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "phone" SET DATA TYPE TEXT,
ALTER COLUMN "profile" DROP NOT NULL,
ALTER COLUMN "profile" DROP DEFAULT,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "audit_logs";

-- DropTable
DROP TABLE "notifications";

-- DropEnum
DROP TYPE "AdvanceStatus";

-- DropEnum
DROP TYPE "NotificationPriority";

-- DropEnum
DROP TYPE "PaymentMethod";

-- DropEnum
DROP TYPE "UserStatus";

-- CreateTable
CREATE TABLE "bags" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "bagNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT,
    "farmerId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "processedById" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "PaymentType" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "reference" TEXT,
    "notes" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "farmer_organizations_farmerId_organizationId_key" ON "farmer_organizations"("farmerId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "farmers_phone_key" ON "farmers"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "lorries_plateNumber_key" ON "lorries"("plateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "lorries_licensePlate_key" ON "lorries"("licensePlate");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farmers" ADD CONSTRAINT "farmers_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farmer_organizations" ADD CONSTRAINT "farmer_organizations_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farmer_organizations" ADD CONSTRAINT "farmer_organizations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lorries" ADD CONSTRAINT "lorries_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lorries" ADD CONSTRAINT "lorries_assignedManagerId_fkey" FOREIGN KEY ("assignedManagerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lorry_requests" ADD CONSTRAINT "lorry_requests_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lorry_requests" ADD CONSTRAINT "lorry_requests_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lorry_requests" ADD CONSTRAINT "lorry_requests_assignedLorryId_fkey" FOREIGN KEY ("assignedLorryId") REFERENCES "lorries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_lorryId_fkey" FOREIGN KEY ("lorryId") REFERENCES "lorries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_fieldManagerId_fkey" FOREIGN KEY ("fieldManagerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bags" ADD CONSTRAINT "bags_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "deliveries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "deliveries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advance_payments" ADD CONSTRAINT "advance_payments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advance_payments" ADD CONSTRAINT "advance_payments_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advance_payments" ADD CONSTRAINT "advance_payments_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_generations" ADD CONSTRAINT "report_generations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_generations" ADD CONSTRAINT "report_generations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
