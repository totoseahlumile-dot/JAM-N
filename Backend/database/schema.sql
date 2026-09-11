CREATE DATABASE IF NOT EXISTS jam_n
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE jam_n;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(30) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(80) NOT NULL,
  bio VARCHAR(500) NULL,
  avatar_url VARCHAR(2048) NULL,
  role ENUM('listener', 'artist', 'admin') NOT NULL DEFAULT 'listener',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_username (username),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  replaced_by_token_hash CHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_refresh_tokens_hash (token_hash),
  KEY idx_refresh_tokens_user (user_id),
  KEY idx_refresh_tokens_expiry (expires_at),
  CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS genres (
  id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(80) NOT NULL,
  PRIMARY KEY (id), UNIQUE KEY uq_genres_name (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS artist_profiles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NULL,
  stage_name VARCHAR(100) NOT NULL,
  member_count SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  location VARCHAR(120) NULL,
  booking_email VARCHAR(255) NULL,
  spotify_url VARCHAR(2048) NULL,
  youtube_url VARCHAR(2048) NULL,
  apple_music_url VARCHAR(2048) NULL,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_artist_profiles_user (user_id),
  UNIQUE KEY uq_artist_profiles_stage_name (stage_name),
  CONSTRAINT fk_artist_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS artist_genres (
  artist_id BIGINT UNSIGNED NOT NULL,
  genre_id SMALLINT UNSIGNED NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (artist_id, genre_id), KEY idx_artist_genres_genre (genre_id),
  CONSTRAINT fk_artist_genres_artist FOREIGN KEY (artist_id) REFERENCES artist_profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_artist_genres_genre FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS media_types (
  id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(30) NOT NULL,
  PRIMARY KEY (id), UNIQUE KEY uq_media_types_name (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS posts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  caption VARCHAR(1000) NULL,
  media_url VARCHAR(2048) NULL,
  media_type_id TINYINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id), KEY idx_posts_user_created (user_id, created_at), KEY idx_posts_media_type (media_type_id),
  CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_posts_media_type FOREIGN KEY (media_type_id) REFERENCES media_types(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS albums (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  artist_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  release_date DATE NULL,
  cover_url VARCHAR(2048) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id), UNIQUE KEY uq_albums_artist_title (artist_id, title),
  CONSTRAINT fk_albums_artist FOREIGN KEY (artist_id) REFERENCES artist_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tracks (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  artist_id BIGINT UNSIGNED NOT NULL,
  album_id BIGINT UNSIGNED NULL,
  title VARCHAR(255) NOT NULL,
  audio_url VARCHAR(2048) NULL,
  release_date DATE NULL,
  stream_count BIGINT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id), KEY idx_tracks_artist (artist_id), KEY idx_tracks_album (album_id),
  CONSTRAINT fk_tracks_artist FOREIGN KEY (artist_id) REFERENCES artist_profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_tracks_album FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS banks (
  id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  PRIMARY KEY (id), UNIQUE KEY uq_banks_name (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payment_cards (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  bank_id SMALLINT UNSIGNED NULL,
  provider_token VARCHAR(255) NOT NULL,
  last_four CHAR(4) NOT NULL,
  cardholder_name VARCHAR(120) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id), UNIQUE KEY uq_payment_cards_provider_token (provider_token),
  KEY idx_payment_cards_user (user_id), KEY idx_payment_cards_bank (bank_id),
  CONSTRAINT fk_payment_cards_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_payment_cards_bank FOREIGN KEY (bank_id) REFERENCES banks(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  starts_at DATETIME NOT NULL,
  ends_at DATETIME NULL,
  price_description VARCHAR(500) NULL,
  ticket_url VARCHAR(2048) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id), UNIQUE KEY uq_events_name_start (name, starts_at), KEY idx_events_starts_at (starts_at)
) ENGINE=InnoDB;
