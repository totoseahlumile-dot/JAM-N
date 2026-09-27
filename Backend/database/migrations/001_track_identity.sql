SET @index_exists = (SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'tracks' AND index_name = 'uq_tracks_artist_title');
SET @migration_sql = IF(@index_exists = 0,
  'ALTER TABLE tracks ADD UNIQUE KEY uq_tracks_artist_title (artist_id, title)', 'SELECT 1');
PREPARE migration_statement FROM @migration_sql;
EXECUTE migration_statement;
DEALLOCATE PREPARE migration_statement;
