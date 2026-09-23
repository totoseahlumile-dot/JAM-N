CREATE TABLE IF NOT EXISTS track_plays (
  playback_id CHAR(36) NOT NULL PRIMARY KEY,
  track_id BIGINT UNSIGNED NOT NULL,
  counted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_track_plays_track (track_id),
  CONSTRAINT fk_track_plays_track FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE
) ENGINE=InnoDB;
