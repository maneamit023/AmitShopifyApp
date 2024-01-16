/*
  Warnings:

  - The primary key for the `session` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `session` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `shop` VARCHAR(191) NOT NULL,
    MODIFY `state` VARCHAR(191) NOT NULL,
    MODIFY `scope` VARCHAR(191) NULL,
    MODIFY `expires` DATETIME(3) NULL,
    MODIFY `accessToken` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);
