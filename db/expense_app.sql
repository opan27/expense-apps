-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 06, 2025 at 07:06 AM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `expense_app`
--

-- --------------------------------------------------------

--
-- Table structure for table `expense`
--

CREATE TABLE `expense` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `amount` decimal(14,2) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `installment_id` int DEFAULT NULL,
  `date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `expense`
--

INSERT INTO `expense` (`id`, `user_id`, `amount`, `category`, `installment_id`, `date`) VALUES
(4, 2, '90000.00', 'makan', NULL, '2025-11-15'),
(5, 2, '300000.00', 'nongkrong', NULL, '2025-11-16'),
(6, 1, '1320000.00', 'Bayar Motor', NULL, '2025-11-10'),
(7, 1, '750000.00', 'SPP Kuliah', NULL, '2025-11-07'),
(8, 1, '1000000.00', 'Mama', NULL, '2025-11-04'),
(10, 1, '450000.00', 'cicilan', NULL, '2025-11-11'),
(11, 1, '2400000.00', 'Sewa LC', NULL, '2025-11-14'),
(12, 2, '1320000.00', 'Tagihan motor', NULL, '2025-11-29'),
(13, 2, '4500000.00', 'KPR', NULL, '2025-11-30'),
(14, 2, '1320.00', 'MOTOR', 1, '2025-11-30'),
(15, 2, '1320000.00', 'MOTOR', 1, '2025-11-30'),
(16, 2, '45000000.00', 'BAYAR CICILAN KPR', 4, '2025-12-03'),
(17, 2, '1320000.00', 'cicilan', 7, '2025-12-03'),
(18, 2, '1320000.00', 'bayar center', 8, '2025-12-03'),
(19, 2, '1500000.00', 'cicilan', 6, '2025-12-03'),
(20, 2, '1500000.00', 'bayar supllier', 6, '2025-12-03'),
(21, 2, '3000000.00', 'cicilan', 9, '2025-12-03'),
(22, 1, '1320000.00', 'cicilan', 10, '2025-12-03');

-- --------------------------------------------------------

--
-- Table structure for table `income`
--

CREATE TABLE `income` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `amount` decimal(14,2) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `income`
--

INSERT INTO `income` (`id`, `user_id`, `amount`, `category`, `date`) VALUES
(3, 2, '5000000.00', 'Gaji', '2025-11-05'),
(4, 2, '700000.00', 'Insentive', '2025-11-12'),
(5, 2, '1000000.00', 'Freelance', '2025-11-18'),
(6, 1, '6500000.00', 'Gajiii', '2025-11-10'),
(8, 1, '7000000.00', 'Project', '2025-11-05'),
(9, 1, '300000.00', 'Bonus', '2025-11-07'),
(10, 1, '200000.00', 'Menang Give Away', '2025-11-04'),
(11, 2, '7500000.00', 'GAJI', '2025-11-30');

-- --------------------------------------------------------

--
-- Table structure for table `installments`
--

CREATE TABLE `installments` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `principal` decimal(15,2) NOT NULL,
  `interest_rate` decimal(5,2) DEFAULT '0.00',
  `monthly_payment` decimal(15,2) NOT NULL,
  `remaining_months` int DEFAULT NULL,
  `start_date` date NOT NULL,
  `total_months` int NOT NULL,
  `due_day` tinyint NOT NULL,
  `status` enum('active','closed','deleted') DEFAULT 'active',
  `notes` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `installments`
--

INSERT INTO `installments` (`id`, `user_id`, `name`, `principal`, `interest_rate`, `monthly_payment`, `remaining_months`, `start_date`, `total_months`, `due_day`, `status`, `notes`, `created_at`) VALUES
(1, 2, 'MOTOR', '32000000.00', '12.00', '1320000.00', 12, '2024-08-07', 0, 10, 'deleted', 'asdasdasdasdaasas', '2025-11-29 16:53:39'),
(2, 2, 'KPR', '300000000.00', '12.00', '4500000.00', 15, '2023-05-30', 0, 4, 'deleted', 'TEST', '2025-11-30 07:06:16'),
(3, 2, 'MOTOR', '32000000.00', '12.00', '1320000.00', 12, '2024-08-03', 12, 10, 'deleted', 'SDFSDFSFS', '2025-12-03 14:14:20'),
(4, 2, 'kpr', '320000000.00', '12.00', '45000000.00', 36, '2024-08-03', 36, 10, 'active', 'SDFSFSSD', '2025-12-03 14:17:55'),
(5, 2, 'pusat-data', '23000000.00', '12.00', '1300000.00', NULL, '2024-05-16', 13, 10, 'deleted', 'asdadsasd', '2025-12-03 14:23:22'),
(6, 2, 'supplier', '45000000.00', '12.00', '1500000.00', 11, '2024-04-24', 12, 20, 'active', 'asdadadsfs', '2025-12-03 14:31:54'),
(7, 2, 'MOTOR', '24000000.00', '12.00', '1320000.00', 12, '2024-08-03', 12, 10, 'active', 'ASDSASSSA', '2025-12-03 14:57:41'),
(8, 2, 'center', '13000000.00', '12.00', '1320000.00', 12, '2024-08-14', 12, 10, 'active', 'ASDASDAD', '2025-12-03 14:58:30'),
(9, 2, 'sales', '35000000.00', '12.00', '3000000.00', 11, '2024-07-03', 12, 15, 'active', 'asdafsf', '2025-12-03 15:17:38'),
(10, 1, 'MOTOR', '32000000.00', '12.00', '1320000.00', 11, '2024-08-06', 12, 15, 'active', 'qedsfsdfds', '2025-12-03 15:33:41');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`) VALUES
(1, 'taufan', 'opancoganjp1@gmail.com', '$2b$10$mxgz70yBBwBsWP/CtpRdVOtbhwc3pyb9riyrt6Ohhb2oUAHVE7wk2'),
(2, 'bagas', 'bagas@gmail.com', '$2b$10$prxe2JMAxRNXmnIXIK4t0eUqIG.FoBa0J8d0hCPrioHBN0tDP8OYu'),
(4, 'vanes', 'vanes@gmail.com', '$2b$10$wtwpcWbFXn5pdRA3c9Uvies85TaqhvCnlZhqO9wyf0crtCnpDtToq');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `expense`
--
ALTER TABLE `expense`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_expense_installment_id` (`installment_id`);

--
-- Indexes for table `income`
--
ALTER TABLE `income`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `installments`
--
ALTER TABLE `installments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_installments_users` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `expense`
--
ALTER TABLE `expense`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `income`
--
ALTER TABLE `income`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `installments`
--
ALTER TABLE `installments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `expense`
--
ALTER TABLE `expense`
  ADD CONSTRAINT `fk_expense_installment` FOREIGN KEY (`installment_id`) REFERENCES `installments` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `installments`
--
ALTER TABLE `installments`
  ADD CONSTRAINT `fk_installments_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
