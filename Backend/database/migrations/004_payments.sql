CREATE TABLE IF NOT EXISTS payment_orders (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  plan_id ENUM('plus', 'pro') NOT NULL,
  amount_cents INT UNSIGNED NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'ZAR',
  status ENUM('pending', 'paid', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
  provider_payment_id VARCHAR(100) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paid_at DATETIME NULL,
  UNIQUE KEY uq_payment_orders_provider (provider_payment_id),
  KEY idx_payment_orders_user (user_id, created_at),
  CONSTRAINT fk_payment_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_subscriptions (
  user_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
  plan_id ENUM('plus', 'pro') NOT NULL,
  active_until DATETIME NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_subscriptions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
