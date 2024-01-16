-- CreateTable
CREATE TABLE `Session` (
    `id` TEXT NOT NULL,
    `shop` TEXT NOT NULL,
    `state` TEXT NOT NULL,
    `isOnline` BOOLEAN NOT NULL DEFAULT false,
    `scope` TEXT,
    `expires` DATETIME,
    `accessToken` TEXT NOT NULL,
    `userId` BIGINT,
    PRIMARY KEY (`id`(255)) 
);