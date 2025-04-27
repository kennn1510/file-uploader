/*
  Warnings:

  - You are about to drop the column `age` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `userPreferenceId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserPreference` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_favoritedById_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_userPreferenceId_fkey";

-- DropIndex
DROP INDEX "User_age_name_key";

-- DropIndex
DROP INDEX "User_email_idx";

-- DropIndex
DROP INDEX "User_userPreferenceId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "age",
DROP COLUMN "name",
DROP COLUMN "role",
DROP COLUMN "userPreferenceId",
ADD COLUMN     "password" TEXT NOT NULL DEFAULT 'temporaryPassword';

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "UserPreference";

-- DropEnum
DROP TYPE "Role";

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
