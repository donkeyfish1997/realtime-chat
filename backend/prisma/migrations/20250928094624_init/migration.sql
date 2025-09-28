/*
  Warnings:

  - You are about to drop the column `token` on the `verification_tokens` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tokenHash]` on the table `verification_tokens` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[identifier,tokenHash]` on the table `verification_tokens` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tokenHash` to the `verification_tokens` table without a default value. This is not possible if the table is not empty.
  - Made the column `type` on table `verification_tokens` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `verification_tokens_identifier_token_key` ON `verification_tokens`;

-- DropIndex
DROP INDEX `verification_tokens_token_key` ON `verification_tokens`;

-- AlterTable
ALTER TABLE `verification_tokens` DROP COLUMN `token`,
    ADD COLUMN `tokenHash` VARCHAR(191) NOT NULL,
    MODIFY `type` ENUM('EMAIL_VERIFY', 'PASSWORD_RESET', 'CHANGE_EMAIL') NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `verification_tokens_tokenHash_key` ON `verification_tokens`(`tokenHash`);

-- CreateIndex
CREATE UNIQUE INDEX `verification_tokens_identifier_tokenHash_key` ON `verification_tokens`(`identifier`, `tokenHash`);
