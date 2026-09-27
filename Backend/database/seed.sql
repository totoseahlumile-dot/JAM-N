USE jam_n;

INSERT INTO genres (name) VALUES
  ('Alternative'), ('Alternative Rock'), ('Amapiano'), ('Art Rock'), ('Blues'),
  ('Contemporary Country'), ('Country'), ('Deathcore'), ('Electronic'), ('Experimental R&B'),
  ('Folk'), ('Garage Rock'), ('Hip-Hop'), ('Indie'), ('Indie Folk'), ('Indie Pop'),
  ('Indie Rock'), ('Jazz'), ('Modern Metalcore'), ('Neo-Soul'), ('Pop'), ('Pop-Punk'),
  ('Pop-Rock'), ('Power Pop'), ('Power Rock'), ('R&B'), ('Rap'), ('Rock'), ('Soul'),
  ('South African Afropop')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO media_types (name) VALUES ('image'), ('video'), ('audio'), ('text')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO banks (name) VALUES
  ('ABSA'), ('African Bank'), ('Capitec'), ('Discovery Bank'), ('FNB'),
  ('Investec'), ('Nedbank'), ('Standard Bank'), ('TymeBank')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO artist_profiles (stage_name, member_count, spotify_url, youtube_url, apple_music_url) VALUES
  ('Usimamane', 1, 'https://open.spotify.com/artist/7CAuIrM6rFLrIgisYOV0Fs', 'https://music.youtube.com/@usimamane', 'https://music.apple.com/us/artist/usimamane/1668449775'),
  ('Bongeziwe Mabandla', 1, 'https://open.spotify.com/artist/5upKpIk1pv0hh0u2gwblwy', 'https://music.youtube.com/@bongeziwemabandla', 'https://music.apple.com/us/artist/bongeziwe-mabandla/555727068'),
  ('Will Linley', 1, 'https://open.spotify.com/artist/3xnCBQeZDec3FFo8vUSt4N', 'https://music.youtube.com/@willlinley', 'https://music.apple.com/us/artist/will-linley/1591950331'),
  ('Moonchild Sanelly', 1, 'https://open.spotify.com/artist/6aDX1jzNVAI9enlQzW0Pgw', 'https://music.youtube.com/@theemoonchildsanelly', 'https://music.apple.com/us/artist/moonchild-sanelly/829566512'),
  ('A-Reece', 1, 'https://open.spotify.com/artist/5TirRF3azWV5OpyufcDCFP', NULL, 'https://music.apple.com/us/artist/a-reece/914928001'),
  ('Hunter Rose', 1, 'https://open.spotify.com/artist/2G6bNldbTZU1viUkX5Myuq', 'https://music.youtube.com/@hunterrose', 'https://music.apple.com/us/artist/hunter-rose/159230685'),
  ('Vigro Deep', 1, 'https://open.spotify.com/artist/2mF7ygWz9oyJ3L6ZPWlZVH', 'https://music.youtube.com/@vigrodeepofficial', 'https://music.apple.com/us/artist/vigro-deep/1471510406'),
  ('Alice Phoebe Lou', 1, 'https://open.spotify.com/artist/03uMw43UVu9MsQCcHVSGjX', 'https://music.youtube.com/@alicephoebeloumusic', 'https://music.apple.com/us/artist/alice-phoebe-lou/670236358'),
  ('Internet Girl', 3, 'https://open.spotify.com/artist/2eVTKG3Z5bbKk2OWMIe3iL', 'https://music.youtube.com/@internetgirrrl', 'https://music.apple.com/us/artist/internet-girl/1476186420'),
  ('The Parlotones', 6, 'https://open.spotify.com/artist/6kdqDRORMlysnNj2eIOsGs', NULL, NULL)
ON DUPLICATE KEY UPDATE member_count = VALUES(member_count), spotify_url = VALUES(spotify_url),
  youtube_url = VALUES(youtube_url), apple_music_url = VALUES(apple_music_url);

INSERT INTO events (name, location, starts_at, ends_at, price_description) VALUES
  ('Standard Bank Joy of Jazz 2026', 'Sandton Convention Centre, Johannesburg', '2026-09-25 18:00:00', '2026-09-26 23:59:00', 'Day and weekend passes available'),
  ('WOMAD South Africa 2026', 'Artscape Theatre Centre, Cape Town', '2026-09-15 10:00:00', '2026-09-24 23:59:00', 'Free and ticketed performances'),
  ('We Love R&B Johannesburg', 'Maracana, Johannesburg', '2026-09-04 18:00:00', '2026-09-05 23:59:00', 'From R150')
ON DUPLICATE KEY UPDATE location = VALUES(location), ends_at = VALUES(ends_at),
  price_description = VALUES(price_description);

INSERT INTO artist_genres (artist_id, genre_id, is_primary)
SELECT ap.id, g.id, TRUE FROM artist_profiles ap JOIN genres g
WHERE (ap.stage_name = 'Usimamane' AND g.name = 'Hip-Hop')
   OR (ap.stage_name = 'Bongeziwe Mabandla' AND g.name = 'Folk')
   OR (ap.stage_name = 'Will Linley' AND g.name = 'Pop')
   OR (ap.stage_name = 'Moonchild Sanelly' AND g.name = 'South African Afropop')
   OR (ap.stage_name = 'A-Reece' AND g.name = 'Rap')
   OR (ap.stage_name = 'Hunter Rose' AND g.name = 'Neo-Soul')
   OR (ap.stage_name = 'Vigro Deep' AND g.name = 'Amapiano')
   OR (ap.stage_name = 'Alice Phoebe Lou' AND g.name = 'Indie Pop')
   OR (ap.stage_name = 'Internet Girl' AND g.name = 'Alternative Rock')
   OR (ap.stage_name = 'The Parlotones' AND g.name = 'Rock')
ON DUPLICATE KEY UPDATE is_primary = VALUES(is_primary);

INSERT INTO albums (artist_id, title, release_date)
SELECT ap.id, seed.title, seed.release_date
FROM artist_profiles ap JOIN (
  SELECT 'Usimamane' artist, '20th: Days Before Maud' title, '2024-09-20' release_date UNION ALL
  SELECT 'Bongeziwe Mabandla', 'iimini', '2020-03-27' UNION ALL
  SELECT 'Will Linley', 'Don''t Cry Because It''s Over', '2025-01-01' UNION ALL
  SELECT 'Moonchild Sanelly', 'Full Moon', '2025-01-10' UNION ALL
  SELECT 'Vigro Deep', 'Your Piano Is Not My Piano', '2024-11-29' UNION ALL
  SELECT 'Alice Phoebe Lou', 'Glow', '2021-03-19'
) seed ON seed.artist = ap.stage_name
ON DUPLICATE KEY UPDATE release_date = VALUES(release_date);

INSERT INTO tracks (artist_id, album_id, title, release_date)
SELECT ap.id, a.id, seed.title, seed.release_date
FROM artist_profiles ap
JOIN (
  SELECT 'Usimamane' artist, 'Soft' title, NULL album_title, '2025-01-01' release_date UNION ALL
  SELECT 'Usimamane', 'Star', '20th: Days Before Maud', '2024-09-20' UNION ALL
  SELECT 'Bongeziwe Mabandla', 'salanabani', 'iimini', '2020-03-27' UNION ALL
  SELECT 'Bongeziwe Mabandla', 'jikeleza', 'iimini', '2020-03-27' UNION ALL
  SELECT 'Will Linley', 'Quite Like Us...', 'Don''t Cry Because It''s Over', '2025-01-01' UNION ALL
  SELECT 'Moonchild Sanelly', 'Falling', 'Full Moon', '2025-01-10' UNION ALL
  SELECT 'A-Reece', 'Activity', NULL, '2026-01-01' UNION ALL
  SELECT 'Hunter Rose', 'Fine Wine', NULL, '2026-01-01' UNION ALL
  SELECT 'Vigro Deep', 'Nomsa', 'Your Piano Is Not My Piano', '2024-11-29' UNION ALL
  SELECT 'Alice Phoebe Lou', 'Only When I', 'Glow', '2021-03-19' UNION ALL
  SELECT 'Internet Girl', 'PULL UP', NULL, '2024-01-01' UNION ALL
  SELECT 'The Parlotones', 'Colourful', NULL, '2005-01-01'
) seed ON seed.artist = ap.stage_name
LEFT JOIN albums a ON a.artist_id = ap.id AND a.title = seed.album_title
WHERE NOT EXISTS (
  SELECT 1 FROM tracks existing
  WHERE existing.artist_id = ap.id AND existing.title = seed.title
)
ON DUPLICATE KEY UPDATE album_id = VALUES(album_id), release_date = VALUES(release_date);
