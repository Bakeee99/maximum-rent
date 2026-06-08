-- CreateEnum
CREATE TYPE "CarClass" AS ENUM ('CITY_CAR', 'ECONOMY', 'COMPACT', 'MIDSIZE', 'FULLSIZE', 'LUXURY', 'SUV', 'VAN', 'MINIBUS');

-- CreateEnum
CREATE TYPE "Transmission" AS ENUM ('MANUAL', 'AUTOMATIC');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('PETROL', 'DIESEL', 'HYBRID', 'PLUG_IN_HYBRID', 'ELECTRIC');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('HEAD_OFFICE', 'AIRPORT', 'BUS_STATION', 'CITY_OFFICE');

-- CreateEnum
CREATE TYPE "InquiryChannel" AS ENUM ('EMAIL', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('HR', 'EN');

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "LocationType" NOT NULL DEFAULT 'CITY_OFFICE',
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Car" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "carClass" "CarClass" NOT NULL,
    "transmission" "Transmission" NOT NULL,
    "passengers" INTEGER NOT NULL,
    "doors" INTEGER NOT NULL DEFAULT 4,
    "fuelType" "FuelType" NOT NULL,
    "emissionClass" TEXT,
    "luggage" INTEGER,
    "airCondition" BOOLEAN NOT NULL DEFAULT true,
    "pricePerDay" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'BAM',
    "deposit" DECIMAL(10,2),
    "images" TEXT[],
    "descriptionHr" TEXT,
    "descriptionEn" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Car_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "carId" TEXT,
    "carTitleSnapshot" TEXT,
    "pickupLocationId" TEXT,
    "returnLocationId" TEXT,
    "pickupAt" TIMESTAMP(3) NOT NULL,
    "returnAt" TIMESTAMP(3) NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "flightNumber" TEXT,
    "message" TEXT,
    "channel" "InquiryChannel" NOT NULL DEFAULT 'EMAIL',
    "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "locale" "Locale" NOT NULL DEFAULT 'HR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Location_slug_key" ON "Location"("slug");

-- CreateIndex
CREATE INDEX "Location_isActive_sortOrder_idx" ON "Location"("isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Car_slug_key" ON "Car"("slug");

-- CreateIndex
CREATE INDEX "Car_carClass_isAvailable_idx" ON "Car"("carClass", "isAvailable");

-- CreateIndex
CREATE INDEX "Car_isFeatured_sortOrder_idx" ON "Car"("isFeatured", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Inquiry_reference_key" ON "Inquiry"("reference");

-- CreateIndex
CREATE INDEX "Inquiry_status_createdAt_idx" ON "Inquiry"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Inquiry_carId_idx" ON "Inquiry"("carId");

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_pickupLocationId_fkey" FOREIGN KEY ("pickupLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_returnLocationId_fkey" FOREIGN KEY ("returnLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
