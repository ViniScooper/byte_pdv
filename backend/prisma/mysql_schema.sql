-- MySQL Script to create database and tables for the PDV application
-- This schema matches the actual columns and tables queried by the backend route scripts.

CREATE DATABASE IF NOT EXISTS pdv_cantina;
USE pdv_cantina;

-- Table: User
CREATE TABLE IF NOT EXISTS `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(255) NULL,
    `pictureUrl` VARCHAR(191) NULL,
    `googleId` VARCHAR(191) NULL,
    `role` ENUM('ADMIN', 'CAIXA') NOT NULL DEFAULT 'CAIXA',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_googleId_key`(`googleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table: Shift
CREATE TABLE IF NOT EXISTS `Shift` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `startTime` DATETIME(3) NULL,
    `endTime` DATETIME(3) NULL,
    `initialBalance` DOUBLE NOT NULL DEFAULT 0,
    `finalExpectedBalance` DOUBLE NULL,
    `finalActualBalance` DOUBLE NULL,
    `status` ENUM('OPEN', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    -- Additional fields added by migrations:
    `operador` VARCHAR(255) NULL,
    `saldoInicial` DOUBLE NULL DEFAULT 0,
    `saldoFinal` DOUBLE NULL,
    `saldoEsperado` DOUBLE NULL,
    `diferenca` DOUBLE NULL,
    `abertoEm` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechadoEm` DATETIME(3) NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `Shift_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table: Supplier
CREATE TABLE IF NOT EXISTS `Supplier` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `contact` VARCHAR(191) NULL,
    `document` VARCHAR(191) NULL,
    -- Additional fields added by migrations:
    `tipoInsumo` VARCHAR(255) NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table: Ingredient
CREATE TABLE IF NOT EXISTS `Ingredient` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `measurementUnit` ENUM('KG', 'G', 'L', 'ML', 'UN') NOT NULL DEFAULT 'UN',
    `costPrice` DOUBLE NOT NULL DEFAULT 0,
    `stockQuantity` DOUBLE NOT NULL DEFAULT 0,
    `supplierId` VARCHAR(191) NULL,
    -- Additional fields added by migrations:
    `unidade` VARCHAR(10) NULL DEFAULT 'un',
    `precoCusto` DOUBLE NULL DEFAULT 0,
    `estoque` DOUBLE NULL DEFAULT 0,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    CONSTRAINT `Ingredient_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table: Product
CREATE TABLE IF NOT EXISTS `Product` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `price` DOUBLE NOT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `isManufactured` TINYINT(1) NOT NULL DEFAULT 0,
    -- Additional fields added by migrations:
    `precoVenda` DOUBLE NULL DEFAULT 0,
    `precoCusto` DOUBLE NULL DEFAULT 0,
    `estoque` DOUBLE NULL DEFAULT 0,
    `categoria` VARCHAR(100) NULL,
    `setorProducao` VARCHAR(100) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fichaTecnicaJson` TEXT NULL,
    `gruposIdsJson` TEXT NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table: TechnicalSheet
CREATE TABLE IF NOT EXISTS `TechnicalSheet` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `ingredientId` VARCHAR(191) NOT NULL,
    `quantityNeeded` DOUBLE NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `TechnicalSheet_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `TechnicalSheet_ingredientId_fkey` FOREIGN KEY (`ingredientId`) REFERENCES `Ingredient` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table: OptionGroup
CREATE TABLE IF NOT EXISTS `OptionGroup` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `minOptions` INTEGER NOT NULL DEFAULT 0,
    `maxOptions` INTEGER NOT NULL DEFAULT 1,
    `productId` VARCHAR(191) NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `OptionGroup_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table: OptionItem
CREATE TABLE IF NOT EXISTS `OptionItem` (
    `id` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `additionalPrice` DOUBLE NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    CONSTRAINT `OptionItem_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `OptionGroup` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table: Order
CREATE TABLE IF NOT EXISTS `Order` (
    `id` VARCHAR(191) NOT NULL,
    `shiftId` VARCHAR(191) NOT NULL,
    `totalAmount` DOUBLE NOT NULL,
    `discount` DOUBLE NOT NULL DEFAULT 0,
    `paymentMethod` ENUM('DINHEIRO', 'PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO') NOT NULL DEFAULT 'DINHEIRO',
    `status` ENUM('PENDING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'COMPLETED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    CONSTRAINT `Order_shiftId_fkey` FOREIGN KEY (`shiftId`) REFERENCES `Shift` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table: OrderItem
CREATE TABLE IF NOT EXISTS `OrderItem` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unitPrice` DOUBLE NOT NULL,
    `totalPrice` DOUBLE NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table: Expense
CREATE TABLE IF NOT EXISTS `Expense` (
    `id` VARCHAR(191) NOT NULL,
    `shiftId` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `ingredientId` VARCHAR(191) NULL,
    `receiptUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    CONSTRAINT `Expense_shiftId_fkey` FOREIGN KEY (`shiftId`) REFERENCES `Shift` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `Expense_ingredientId_fkey` FOREIGN KEY (`ingredientId`) REFERENCES `Ingredient` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table: Transacao (added in migrate.js)
CREATE TABLE IF NOT EXISTS `Transacao` (
    `id` VARCHAR(255) NOT NULL,
    `tipo` VARCHAR(20) NOT NULL,
    `subtipo` VARCHAR(50) NULL,
    `turnoId` VARCHAR(255) NULL,
    `valor` DOUBLE NOT NULL,
    `metodoPagamento` VARCHAR(50) NULL,
    `descricao` TEXT NULL,
    `motivo` VARCHAR(255) NULL,
    `origem` VARCHAR(50) NULL,
    `mesaIdentificacao` VARCHAR(100) NULL,
    `itensJson` TEXT NULL,
    `criadoEm` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table: GrupoOpcoes (added in migrate.js)
CREATE TABLE IF NOT EXISTS `GrupoOpcoes` (
    `id` VARCHAR(255) NOT NULL,
    `nome` VARCHAR(255) NOT NULL,
    `minOpcoes` INT NULL DEFAULT 0,
    `maxOpcoes` INT NULL DEFAULT 0,
    `opcoesJson` TEXT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table: Mesa (added in migrate.js)
CREATE TABLE IF NOT EXISTS `Mesa` (
    `id` VARCHAR(255) NOT NULL,
    `identificacao` VARCHAR(100) NOT NULL,
    `status` VARCHAR(20) NULL DEFAULT 'aberta',
    `itensJson` TEXT NULL,
    `criadoEm` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table: ProdutoGrupo (added in migrate.js)
CREATE TABLE IF NOT EXISTS `ProdutoGrupo` (
    `produtoId` VARCHAR(255) NOT NULL,
    `grupoId` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`produtoId`, `grupoId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Auto-seed master admin user (password: 123456)
INSERT INTO `User` (id, name, email, passwordHash, role, createdAt)
VALUES ('aa181371-c14c-4bda-a8c4-b7717f43a2bb', 'Admin Cantina', 'admincantina@gmail.com', '$2b$10$54sPW0tKWNRDDOA88jC5CeleqDSHTm6VtGxHhqlli1R1GU.f5/CxC', 'ADMIN', NOW())
ON DUPLICATE KEY UPDATE email=email;
