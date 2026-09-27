CREATE TABLE IF NOT EXISTS content_reports (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, reporter_user_id BIGINT UNSIGNED NOT NULL,
  target_type ENUM('post','comment','user','artist') NOT NULL, target_id BIGINT UNSIGNED NOT NULL,
  reason VARCHAR(500) NOT NULL, status ENUM('pending','reviewing','dismissed','actioned') NOT NULL DEFAULT 'pending',
  reviewed_by BIGINT UNSIGNED NULL, reviewed_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id), KEY idx_reports_queue (status, created_at),
  CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reports_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, actor_user_id BIGINT UNSIGNED NULL,
  action VARCHAR(80) NOT NULL, target_type VARCHAR(40) NOT NULL, target_id BIGINT UNSIGNED NULL,
  details JSON NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id), KEY idx_audit_created (created_at), KEY idx_audit_target (target_type, target_id),
  CONSTRAINT fk_audit_actor FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;
