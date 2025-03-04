-- mot de passe :  password
-- tous les mots de passe de tous les utilisateurs sont le méme

-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : mar. 04 mars 2025 à 10:10
-- Version du serveur : 8.2.0
-- Version de PHP : 8.2.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `ticketsmanagment`
--

-- --------------------------------------------------------

--
-- Structure de la table `categorieproblemes`
--

DROP TABLE IF EXISTS `categorieproblemes`;
CREATE TABLE IF NOT EXISTS `categorieproblemes` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Nom` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `CreatedAt` datetime DEFAULT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `DeletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `categorieproblemes`
--

INSERT INTO `categorieproblemes` (`Id`, `Nom`, `CreatedAt`, `UpdatedAt`, `DeletedAt`) VALUES
(1, 'Divalto Commerce & Logistique', NULL, NULL, NULL),
(2, 'Divalto Production', NULL, NULL, NULL),
(3, 'Divalto C.R.M', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `contrats`
--

DROP TABLE IF EXISTS `contrats`;
CREATE TABLE IF NOT EXISTS `contrats` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `DateDebut` datetime(6) NOT NULL,
  `DateFin` datetime(6) DEFAULT NULL,
  `Type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `TypeContrat` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `SocietePartenaireId` int DEFAULT NULL,
  `ClientId` int DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_Contrats_ClientId` (`ClientId`),
  KEY `IX_Contrats_SocietePartenaireId` (`SocietePartenaireId`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `contrats`
--

INSERT INTO `contrats` (`Id`, `DateDebut`, `DateFin`, `Type`, `TypeContrat`, `SocietePartenaireId`, `ClientId`) VALUES
(1, '2025-03-01 00:00:00.000000', '2026-03-01 00:00:00.000000', 'Standard', 'Client-Societe', NULL, 1),
(2, '2024-02-16 00:00:00.000000', '2026-06-26 00:00:00.000000', 'Standard', 'Client-Societe', NULL, 6);

-- --------------------------------------------------------

--
-- Structure de la table `pays`
--

DROP TABLE IF EXISTS `pays`;
CREATE TABLE IF NOT EXISTS `pays` (
  `id_pays` int NOT NULL AUTO_INCREMENT,
  `Nom` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id_pays`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `pays`
--

INSERT INTO `pays` (`id_pays`, `Nom`) VALUES
(1, 'Tunisie'),
(2, 'Maghreb'),
(3, 'Sénégal');

-- --------------------------------------------------------

--
-- Structure de la table `photos`
--

DROP TABLE IF EXISTS `photos`;
CREATE TABLE IF NOT EXISTS `photos` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Url` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PublicId` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `PaysId` int NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_Photos_PaysId` (`PaysId`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `photos`
--

INSERT INTO `photos` (`Id`, `Url`, `PublicId`, `PaysId`) VALUES
(1, 'https://res.cloudinary.com/dno4bttdb/image/upload/v1739965886/ticketManagment/lgzile1s1goy9x2efbzr.png', 'ticketManagment/lgzile1s1goy9x2efbzr', 1),
(2, 'https://res.cloudinary.com/dno4bttdb/image/upload/v1739965917/ticketManagment/ljmz2gft9tp3kycyuqpo.png', 'ticketManagment/ljmz2gft9tp3kycyuqpo', 2),
(3, 'https://res.cloudinary.com/dno4bttdb/image/upload/v1739965939/ticketManagment/j6kpl8spmskaphhtoj9v.png', 'ticketManagment/j6kpl8spmskaphhtoj9v', 3);

-- --------------------------------------------------------

--
-- Structure de la table `priorities`
--

DROP TABLE IF EXISTS `priorities`;
CREATE TABLE IF NOT EXISTS `priorities` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `priorities`
--

INSERT INTO `priorities` (`Id`, `Name`) VALUES
(1, 'Urgent'),
(2, 'Élevé'),
(3, 'Moyen'),
(4, 'Faible'),
(5, 'Amélioration');

-- --------------------------------------------------------

--
-- Structure de la table `problemcategories`
--

DROP TABLE IF EXISTS `problemcategories`;
CREATE TABLE IF NOT EXISTS `problemcategories` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) NOT NULL,
  `CreatedAt` datetime DEFAULT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `DeletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `problemcategories`
--

INSERT INTO `problemcategories` (`Id`, `Name`, `CreatedAt`, `UpdatedAt`, `DeletedAt`) VALUES
(1, 'Divalto Commerce & Logistique', NULL, NULL, NULL),
(2, 'Divalto Production', NULL, NULL, NULL),
(3, 'Divalto C.R.M', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `projets`
--

DROP TABLE IF EXISTS `projets`;
CREATE TABLE IF NOT EXISTS `projets` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Nom` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `SocieteId` int DEFAULT NULL,
  `id_pays` int NOT NULL,
  `CreatedAt` datetime DEFAULT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `DeletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_Projets_id_pays` (`id_pays`),
  KEY `IX_Projets_SocieteId` (`SocieteId`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `projets`
--

INSERT INTO `projets` (`Id`, `Nom`, `Description`, `SocieteId`, `id_pays`, `CreatedAt`, `UpdatedAt`, `DeletedAt`) VALUES
(1, 'projet exp', '', NULL, 1, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `projetuser`
--

DROP TABLE IF EXISTS `projetuser`;
CREATE TABLE IF NOT EXISTS `projetuser` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `ProjetId` int NOT NULL,
  `UserId` int NOT NULL,
  `CreatedAt` datetime DEFAULT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `ProjetId` (`ProjetId`),
  KEY `UserId` (`UserId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `qualifications`
--

DROP TABLE IF EXISTS `qualifications`;
CREATE TABLE IF NOT EXISTS `qualifications` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `qualifications`
--

INSERT INTO `qualifications` (`Id`, `Name`) VALUES
(1, 'Ticket Support'),
(2, 'Demande De Formation'),
(3, 'Demande D\'Information');

-- --------------------------------------------------------

--
-- Structure de la table `roles`
--

DROP TABLE IF EXISTS `roles`;
CREATE TABLE IF NOT EXISTS `roles` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `roles`
--

INSERT INTO `roles` (`Id`, `Name`) VALUES
(1, 'Super Admin'),
(2, 'Chef de Projet'),
(3, 'Collaborateur'),
(4, 'Client');

-- --------------------------------------------------------

--
-- Structure de la table `societes`
--

DROP TABLE IF EXISTS `societes`;
CREATE TABLE IF NOT EXISTS `societes` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Nom` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Adresse` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Telephone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PaysId` int NOT NULL,
  `CreatedAt` datetime DEFAULT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `DeletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_Societes_PaysId` (`PaysId`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `societes`
--

INSERT INTO `societes` (`Id`, `Nom`, `Adresse`, `Telephone`, `PaysId`, `CreatedAt`, `UpdatedAt`, `DeletedAt`) VALUES
(1, 'Copropha', '12 Avenue Habib Bourguiba, Tunis', '+216 71 555 555', 1, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `societe_user`
--

DROP TABLE IF EXISTS `societe_user`;
CREATE TABLE IF NOT EXISTS `societe_user` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `societe_id` int NOT NULL,
  `user_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `societe_user_societe_id_foreign` (`societe_id`),
  KEY `societe_user_user_id_foreign` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `statutsdestickets`
--

DROP TABLE IF EXISTS `statutsdestickets`;
CREATE TABLE IF NOT EXISTS `statutsdestickets` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) NOT NULL,
  `CreatedAt` datetime DEFAULT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `DeletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `statutsdestickets`
--

INSERT INTO `statutsdestickets` (`Id`, `Name`, `CreatedAt`, `UpdatedAt`, `DeletedAt`) VALUES
(1, 'Ouvert', NULL, NULL, NULL),
(2, 'En cours', NULL, NULL, NULL),
(3, 'Résolu', NULL, NULL, NULL),
(4, 'Non Résolu', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `tickets`
--

DROP TABLE IF EXISTS `tickets`;
CREATE TABLE IF NOT EXISTS `tickets` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Title` varchar(255) NOT NULL,
  `Description` text NOT NULL,
  `PriorityId` int DEFAULT NULL,
  `ProjetId` int DEFAULT NULL,
  `OwnerId` int DEFAULT NULL,
  `QualificationId` int DEFAULT NULL,
  `ProblemCategoryId` int DEFAULT NULL,
  `ValidationId` int DEFAULT NULL,
  `StatutId` int DEFAULT NULL,
  `ResponsibleId` int DEFAULT NULL,
  `CreatedAt` datetime DEFAULT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `ApprovedAt` datetime DEFAULT NULL,
  `SolvedAt` datetime DEFAULT NULL,
  `DeletedAt` datetime DEFAULT NULL,
  `Attachments` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `PriorityId` (`PriorityId`),
  KEY `ProjetId` (`ProjetId`),
  KEY `OwnerId` (`OwnerId`),
  KEY `QualificationId` (`QualificationId`),
  KEY `ProblemCategoryId` (`ProblemCategoryId`),
  KEY `ValidationId` (`ValidationId`),
  KEY `StatutId` (`StatutId`),
  KEY `ResponsibleId` (`ResponsibleId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Email` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PasswordHash` longblob NOT NULL,
  `PasswordSalt` longblob NOT NULL,
  `FirstName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `LastName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `NumTelephone` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Actif` tinyint(1) NOT NULL,
  `Pays` int NOT NULL,
  `SocieteId` int DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL DEFAULT '0001-01-01 00:00:00.000000',
  `DeletedAt` datetime(6) DEFAULT NULL,
  `RoleId` int NOT NULL DEFAULT '0',
  `UpdatedAt` datetime(6) NOT NULL DEFAULT '0001-01-01 00:00:00.000000',
  PRIMARY KEY (`Id`),
  KEY `IX_Users_Pays` (`Pays`),
  KEY `IX_Users_SocieteId` (`SocieteId`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`Id`, `Email`, `PasswordHash`, `PasswordSalt`, `FirstName`, `LastName`, `NumTelephone`, `Actif`, `Pays`, `SocieteId`, `CreatedAt`, `DeletedAt`, `RoleId`, `UpdatedAt`) VALUES
(1, 'drgaieg@gmail.com', 0xe62be558d246206a98627705be52e08e618d86ef4f931d0b86872280b0e825074d82dfcc94698ea5db8fb55ea51173acdff37dccda82288def0bb4ef3783ae97, 0x76962a9ed912ffad9caf923eba96fceff399ff2ecb3d2797ff9192201ddcb58ad7f9f27b5b745f9a4218e95d96e725195c7aecd8affc7d52fb1590328c56ff0b5aab6cc5deec99a2ad575c2bdb6c1b48190ee81443ef421d0887d816156bab26cfdb5fafa446452b00e1b55be65695f83b42b68a3fd7fb90dcb8a13a083562c6, 'Dhouha', 'Regaieg', '0987654321', 1, 1, NULL, '0001-01-01 00:00:00.000000', NULL, 1, '0001-01-01 00:00:00.000000'),
(4, 'dhouha.ragaieg3@gmail.com', 0x4ee6909cbf50b09e568be223d545af2dad8a2d4787a6497b072b3f03ae6bb9c00caf095a902317b8902f2e56657135ee38859f900e1df592445b926a85fde935, 0x8f27b088801c4b62e810e3f7dd5103501c4f5e959b3e937f0ed9ee5fc38c112b110f197346f2a114fc05b8a4d1a594041057af4dba6e0fcce1eda9cd7357dba7cf8616a415310b4f65e13cd9c7a47e10da9e3fcda26adcef08f58dda3a3116dbe3b9d0cfef170688d67e1ec87326e3aa8383a0aedeabdd2617d686017f2b818b, 'DHOUHA', 'REG', '+216 54 567 746', 1, 1, NULL, '0001-01-01 00:00:00.000000', NULL, 2, '0001-01-01 00:00:00.000000'),
(5, 'nour@gmail.com', 0x045e37854f4534ef5300e913e99de6701446e0b140f9ac41f4bb06a39e8580c5441016bf3fc13ef06ca5a2795161b3b2b8aadcd67fa3afd90bd4549551b7d239, 0x8b57faf379c60f0dc085564ba1ccc0f3b2b87936ee736a61d2458abe5daee1247a70eb6997da515eebf7cfdd1a795751c39a73f601620f0f41397e67ae270504304fed1acd48c8f9c90c6e86733e8151c6cf87ca4d5c88ff30f882a7cfc29ee9d26c19fe663b8706b80f0ead53af62f9d6fab9c64b9b45a2c39c44d6894e4398, 'Nour', 'Ghraieb', '+216 54 567 746', 1, 1, NULL, '0001-01-01 00:00:00.000000', NULL, 3, '0001-01-01 00:00:00.000000'),
(6, 'anas@gmail.com', 0x64d5206616f559206841bb82f612aaf7fc6f8a7286fed7d389c28fcc9f8a547836c2e8dc285cb8ca6dbdd3ae7db0fe380d0bea305c191d5a0c9506f63a178430, 0xd5ddf08fda05b63431b2af24945c221218234a694842a3be3b0d8492f54d4baef3187e1c79453b8d8c84ab0d53d645ff505558bc55562fd00d3bda46e93e99d63248da2a664b10e2ba63648cab6eee1e5aae0aa949bbcd1ecb811b3e7f5d42fbcdfc16b8f9c44fa419e27fd7ae8fc1cdde3d1bb37ebe8eec14e990d89b8687e8, 'Anas', 'Ghraieb', '+216 54 567 746', 1, 1, NULL, '0001-01-01 00:00:00.000000', NULL, 4, '0001-01-01 00:00:00.000000');

-- --------------------------------------------------------

--
-- Structure de la table `validation`
--

DROP TABLE IF EXISTS `validation`;
CREATE TABLE IF NOT EXISTS `validation` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) NOT NULL,
  `CreatedAt` datetime DEFAULT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `DeletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `validation`
--

INSERT INTO `validation` (`Id`, `Name`, `CreatedAt`, `UpdatedAt`, `DeletedAt`) VALUES
(1, 'Accepter', NULL, NULL, NULL),
(2, 'Refuser', NULL, NULL, NULL),
(3, 'Terminer', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `__efmigrationshistory`
--

DROP TABLE IF EXISTS `__efmigrationshistory`;
CREATE TABLE IF NOT EXISTS `__efmigrationshistory` (
  `MigrationId` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ProductVersion` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`MigrationId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `__efmigrationshistory`
--

INSERT INTO `__efmigrationshistory` (`MigrationId`, `ProductVersion`) VALUES
('20250219110255_InitialCreate', '8.0.10'),
('20250225143918_AddCategorieProbleme', '8.0.10'),
('20250226125835_ticketsUpdate', '8.0.10'),
('20250226134338_ticketsUpdate2', '8.0.10'),
('20250301204235_updateTicket', '8.0.10'),
('20250303105201_updateDataBase', '8.0.10'),
('20250303120842_RemoveClientFromProjet', '8.0.10');

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `societe_user`
--
ALTER TABLE `societe_user`
  ADD CONSTRAINT `societe_user_societe_id_foreign` FOREIGN KEY (`societe_id`) REFERENCES `societes` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `societe_user_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`Id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
