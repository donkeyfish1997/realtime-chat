/*
  Warnings:

  - You are about to drop the column `recipient_id` on the `messages` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `messages` DROP FOREIGN KEY `messages_recipient_id_fkey`;

-- DropIndex
DROP INDEX `messages_recipient_id_fkey` ON `messages`;

-- AlterTable
ALTER TABLE `messages` DROP COLUMN `recipient_id`;
