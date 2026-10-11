-- =============================================================================
-- SCRIPT DE CRÉATION DE BASE DE DONNÉES MYSQL (SANS INSERTION)
-- APPLICATION: D'Alexis Transferencia y Accesorio
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `accessorio_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `accessorio_db`;

-- -----------------------------------------------------------------------------
-- 1. Table User
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `User`;
CREATE TABLE `User` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `username` VARCHAR(191) NULL UNIQUE,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password` VARCHAR(191) NOT NULL,
  `role` VARCHAR(191) NOT NULL,
  `avatar` TEXT NULL,
  `location` VARCHAR(191) NOT NULL DEFAULT '',
  `nodeId` VARCHAR(191) NOT NULL DEFAULT 'node-default',
  `status` VARCHAR(191) NOT NULL DEFAULT 'offline',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. Table Transaction
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `Transaction`;
CREATE TABLE `Transaction` (
  `id` VARCHAR(191) NOT NULL,
  `referenceNumber` VARCHAR(191) NOT NULL UNIQUE,
  `senderName` VARCHAR(191) NOT NULL,
  `senderPhone` VARCHAR(191) NOT NULL,
  `receiverName` VARCHAR(191) NOT NULL,
  `receiverPhone` VARCHAR(191) NOT NULL,
  `operator` VARCHAR(191) NOT NULL,
  `serviceType` VARCHAR(191) NOT NULL,
  `channel` VARCHAR(191) NOT NULL,
  `amountDOP` DOUBLE NOT NULL,
  `amountHTG` DOUBLE NOT NULL,
  `amountUSD` DOUBLE NULL DEFAULT 0,
  `exchangeRate` DOUBLE NOT NULL,
  `feeDOP` DOUBLE NOT NULL DEFAULT 0,
  `commissionDOP` DOUBLE NOT NULL DEFAULT 0,
  `createdByNode` VARCHAR(191) NOT NULL DEFAULT 'node-01',
  `createdByName` VARCHAR(191) NOT NULL DEFAULT 'Agent',
  `createdByRole` VARCHAR(191) NOT NULL DEFAULT 'agent_rd',
  `isAdminNominalTrace` TINYINT(1) NOT NULL DEFAULT 0,
  `assignedToNode` VARCHAR(191) NOT NULL DEFAULT 'node-02',
  `assignedToRole` VARCHAR(191) NOT NULL DEFAULT 'agent_haiti',
  `assignedToName` VARCHAR(191) NOT NULL DEFAULT 'Agent Haïti',
  `proofNotes` TEXT NULL,
  `proofUrl` TEXT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'pending_routing',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `completedAt` DATETIME(3) NULL,
  `cancelledAt` DATETIME(3) NULL,
  `cancellationReason` VARCHAR(191) NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. Table AccountBalance (Trésorerie)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `AccountBalance`;
CREATE TABLE `AccountBalance` (
  `id` VARCHAR(191) NOT NULL,
  `operator` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `balance` DOUBLE NOT NULL DEFAULT 0,
  `currency` VARCHAR(191) NOT NULL,
  `accountNumber` VARCHAR(191) NULL,
  `lastUpdated` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `status` VARCHAR(191) NOT NULL DEFAULT 'optimal',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. Table KillSwitch
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `KillSwitch`;
CREATE TABLE `KillSwitch` (
  `operator` VARCHAR(191) NOT NULL,
  `serviceName` VARCHAR(191) NOT NULL,
  `enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `reason` VARCHAR(191) NULL,
  `updatedBy` VARCHAR(191) NOT NULL,
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`operator`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. Table UserPermission
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `UserPermission`;
CREATE TABLE `UserPermission` (
  `userId` VARCHAR(191) NOT NULL,
  `userName` VARCHAR(191) NOT NULL,
  `role` VARCHAR(191) NOT NULL,
  `servicesAllowed` TEXT NOT NULL,
  `maxSingleTransactionDOP` DOUBLE NOT NULL DEFAULT 100000,
  `canCancelTransaction` TINYINT(1) NOT NULL DEFAULT 0,
  `canManageKillSwitch` TINYINT(1) NOT NULL DEFAULT 0,
  `canViewTreasury` TINYINT(1) NOT NULL DEFAULT 0,
  `canEditRates` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. Table ExchangeRate
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `ExchangeRate`;
CREATE TABLE `ExchangeRate` (
  `id` VARCHAR(191) NOT NULL DEFAULT 'rate_official',
  `baseCurrency` VARCHAR(191) NOT NULL DEFAULT 'DOP',
  `targetCurrency` VARCHAR(191) NOT NULL DEFAULT 'HTG',
  `rate` DOUBLE NOT NULL DEFAULT 2.35,
  `updatedBy` VARCHAR(191) NOT NULL DEFAULT 'Admin',
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. Table AuditLog
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `AuditLog`;
CREATE TABLE `AuditLog` (
  `id` VARCHAR(191) NOT NULL,
  `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `nodeId` VARCHAR(191) NOT NULL,
  `actorName` VARCHAR(191) NOT NULL,
  `actorRole` VARCHAR(191) NOT NULL,
  `action` VARCHAR(191) NOT NULL,
  `targetType` VARCHAR(191) NOT NULL,
  `details` TEXT NOT NULL,
  `nodeStatus` VARCHAR(191) NOT NULL DEFAULT 'ACK',
  `priority` VARCHAR(191) NULL DEFAULT 'Medium',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
