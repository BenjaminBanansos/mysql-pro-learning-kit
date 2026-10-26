-- ========================================================================
-- Schema: aws_open_data_db (AWS Open Data Registry Public Datasets)
-- Data Sources: s3://nyc-tlc/ (NYC Taxi), s3://amazon-reviews-pds/ (Amazon Reviews)
-- ========================================================================

CREATE DATABASE IF NOT EXISTS aws_open_data_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE aws_open_data_db;

-- ------------------------------------------------------------------------
-- 1. NYC Yellow Taxi Trips Table (Partitioned by Year/Month on AWS S3)
-- Target Scale: 3,000,000+ rows per month
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nyc_yellow_taxi_trips (
    trip_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    pickup_datetime DATETIME NOT NULL,
    dropoff_datetime DATETIME NOT NULL,
    passenger_count SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    trip_distance DECIMAL(6,2) NOT NULL,
    pickup_location_id INT UNSIGNED NOT NULL,
    dropoff_location_id INT UNSIGNED NOT NULL,
    rate_code_id TINYINT UNSIGNED NOT NULL DEFAULT 1,
    payment_type TINYINT UNSIGNED NOT NULL,
    fare_amount DECIMAL(8,2) NOT NULL,
    tip_amount DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    tolls_amount DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(8,2) NOT NULL,
    PRIMARY KEY (trip_id, pickup_datetime),
    KEY idx_taxi_pickup_dropoff (pickup_location_id, dropoff_location_id),
    KEY idx_taxi_passenger_fare (passenger_count, total_amount),
    KEY idx_taxi_tip_rate (payment_type, tip_amount)
) ENGINE=InnoDB
PARTITION BY RANGE COLUMNS(pickup_datetime) (
    PARTITION p_2022 VALUES LESS THAN ('2023-01-01 00:00:00'),
    PARTITION p_2023_q1 VALUES LESS THAN ('2023-04-01 00:00:00'),
    PARTITION p_2023_q2 VALUES LESS THAN ('2023-07-01 00:00:00'),
    PARTITION p_2023_q3 VALUES LESS THAN ('2023-10-01 00:00:00'),
    PARTITION p_2023_q4 VALUES LESS THAN ('2024-01-01 00:00:00'),
    PARTITION p_future VALUES LESS THAN (MAXVALUE)
);

-- ------------------------------------------------------------------------
-- 2. Amazon Customer Product Reviews (Full-Text Search Engine)
-- Target Scale: 1,800,000+ reviews per category (Camera, Electronics)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS amazon_product_reviews (
    review_id VARCHAR(20) NOT NULL,
    marketplace CHAR(2) NOT NULL DEFAULT 'US',
    customer_id INT UNSIGNED NOT NULL,
    product_id VARCHAR(20) NOT NULL,
    product_title VARCHAR(255) NOT NULL,
    product_category VARCHAR(50) NOT NULL,
    star_rating TINYINT UNSIGNED NOT NULL,
    helpful_votes INT UNSIGNED NOT NULL DEFAULT 0,
    total_votes INT UNSIGNED NOT NULL DEFAULT 0,
    vine ENUM('Y', 'N') NOT NULL DEFAULT 'N',
    verified_purchase ENUM('Y', 'N') NOT NULL DEFAULT 'N',
    review_headline VARCHAR(255) NOT NULL,
    review_body TEXT NOT NULL,
    review_date DATE NOT NULL,
    PRIMARY KEY (review_id),
    KEY idx_amazon_prod_rating (product_id, star_rating),
    KEY idx_amazon_cust_date (customer_id, review_date),
    -- InnoDB Full-Text Inverted Index:
    FULLTEXT KEY ft_review_text (review_headline, review_body)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------
-- 3. Airports & Spatial Geometries (MySQL 8 Spatial GIS)
-- Target Scale: 75,000+ worldwide nodes
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS airports_gis (
    airport_id INT UNSIGNED NOT NULL,
    ident VARCHAR(10) NOT NULL,
    type VARCHAR(30) NOT NULL,
    name VARCHAR(255) NOT NULL,
    latitude_deg DECIMAL(10,6) NOT NULL,
    longitude_deg DECIMAL(10,6) NOT NULL,
    elevation_ft INT NULL,
    iso_country CHAR(2) NOT NULL,
    municipality VARCHAR(100) NULL,
    location POINT NOT NULL /*!80003 SRID 4326 */,
    PRIMARY KEY (airport_id),
    KEY idx_airports_country (iso_country),
    SPATIAL KEY sp_airports_loc (location)
) ENGINE=InnoDB;
