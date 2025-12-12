-- CreateTable
CREATE TABLE `entidades` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(100) NOT NULL,
    `parent_id` VARCHAR(191) NULL,

    UNIQUE INDEX `entidades_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `nome` VARCHAR(100) NOT NULL,
    `permissao_nivel` ENUM('master', 'empresa', 'setor') NOT NULL,
    `entidade_restrita_id` VARCHAR(191) NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `campanhas` (
    `id` VARCHAR(191) NOT NULL,
    `nome_campanha` VARCHAR(150) NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `entidade_id` VARCHAR(191) NOT NULL,
    `dados_planilha` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_entidade_restrita_id_fkey` FOREIGN KEY (`entidade_restrita_id`) REFERENCES `entidades`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campanhas` ADD CONSTRAINT `campanhas_entidade_id_fkey` FOREIGN KEY (`entidade_id`) REFERENCES `entidades`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
