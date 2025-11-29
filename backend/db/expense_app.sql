-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 16, 2025 at 05:19 AM
-- Server version: 8.0.30
-- PHP Version: 8.2.8

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
  `date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `expense`
--

INSERT INTO `expense` (`id`, `user_id`, `amount`, `category`, `date`) VALUES
(4, 2, '90000.00', 'makan', '2025-11-15'),
(5, 2, '300000.00', 'nongkrong', '2025-11-16'),
(6, 1, '1320000.00', 'Bayar Motor', '2025-11-10'),
(7, 1, '750000.00', 'SPP Kuliah', '2025-11-07'),
(8, 1, '1000000.00', 'Mama', '2025-11-04'),
(10, 1, '450000.00', 'cicilan', '2025-11-11'),
(11, 1, '2400000.00', 'Sewa LC', '2025-11-14');

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
(10, 1, '200000.00', 'Menang Give Away', '2025-11-04');

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
(2, 'bagas', 'bagas@gmail.com', '$2b$10$prxe2JMAxRNXmnIXIK4t0eUqIG.FoBa0J8d0hCPrioHBN0tDP8OYu');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `expense`
--
ALTER TABLE `expense`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `income`
--
ALTER TABLE `income`
  ADD PRIMARY KEY (`id`);

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `income`
--
ALTER TABLE `income`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
