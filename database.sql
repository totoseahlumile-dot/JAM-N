CREATE DATABASE IF NOT EXISTS jamn
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
USE jamn;
-- views 
-- triggers
-- procedures
-- tables
CREATE TABLE account_type(
account_id INT PRIMARY KEY AUTO_INCREMENT,
type VARCHAR(50)
);

INSERT INTO account_type (type)
VALUES
		("Listener"),
        ("Artist"),
        ("Producer");

CREATE TABLE users(
user_id INT PRIMARY KEY AUTO_INCREMENT,
username VARCHAR(50) UNIQUE NOT NULL,
email VARCHAR(50) UNIQUE NOT NULL,
password_hash VARCHAR(100) UNIQUE NOT NULL,
account_type VARCHAR(50) NOT NULL,
bio VARCHAR(200) NOT NULL,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (account_type) REFERENCES account_type(type)
);

INSERT INTO users (username, email, account_type, bio)
VALUES
		("ND", "ND@music.com", (SELECT account_id FROM account_type WHERE type = "Listener"), "Rock is my main genre but I'm trying to branch out"),
        ("JJ", "JJ@music.com", (SELECT account_id FROM account_type WHERE type = "Artist"), "Independent singer-songwriter creating alternative music"),
        ("MM", "MM@music.com", (SELECT account_id FROM account_type WHERE type = "Listener"), "I love discovering new artists and making playlists"),
        ("AT", "AT@music.com", (SELECT account_id FROM account_type WHERE type = "Producer"), "Producer and beatmaker experimenting with different sounds");

CREATE TABLE genres(
genre_id INT PRIMARY KEY AUTO_INCREMENT,
genre VARCHAR(50)
);

INSERT INTO genres(genre)
VALUES
		("Hip-Hop"),
        ("Rap"),
        ("Folk"),
        ("Pop"),
        ("Future Ghetto Punk"),
        ("Soul"),
        ("Jazz"),
        ("R&B"),
        ("Amapiano"),
        ("Contemporary Country"),
		("Indie Folk"),
		("Alternative"),
		("Electronic"),
		("Neo-Soul"),
		("Indie"),
		("Garage-rock"),
		("Experimental R&B"),
		("Modern Metalcore"),
		("Deathcore"),
		("Alternative Rock"),
		("Art Rock"),
		("Indie Rock"),
		("Pop-Punk"),
		("Power Pop"),
		("Power Rock"),
		("Pop-Rock"),
		("Rock"),
		("Blues"),
		("Country"),
		("Afropop"),
        ("Indie Pop");
        

CREATE TABLE artist_profile(
artist_id INT PRIMARY KEY AUTO_INCREMENT,
user_id INT,
stage_name VARCHAR(50) UNIQUE NOT NULL,
genre INT NOT NULL, 
genre_2 INT, 
genre_3 INT,
members INT NOT NULL, 
location VARCHAR(50),
booking_email VARCHAR(50),
spotify_url VARCHAR(100),
yt_url VARCHAR(100),
apple_url VARCHAR(100),
verrified BOOLEAN,
FOREIGN KEY (user_id) REFERENCES users(user_id)
);

INSERT INTO artist_profile (stage_name, members, spotify_url, yt_url, apple_url)
VALUES
		("Usimamane", 1, 'https://open.spotify.com/artist/7CAuIrM6rFLrIgisYOV0Fs?si=twWzyHN_Ru6Oykmndvfjeg&utm_source=copy-link', 'https://music.youtube.com/@usimamane?si=llptj10ko0JjJwny', 'https://music.apple.com/us/artist/usimamane/1668449775'),
        ("Bongeziwe Mabandla", 1, 'https://open.spotify.com/artist/5upKpIk1pv0hh0u2gwblwy?si=QF8YXUaXTzm5T_xeQwa1XA&utm_source=copy-link', 'https://music.youtube.com/@bongeziwemabandla?si=POdWy6LkEfSPHeFz', 'https://music.apple.com/us/artist/bongeziwe-mabandla/555727068'),
        ("Will Linley", 1, 'https://open.spotify.com/artist/3xnCBQeZDec3FFo8vUSt4N?si=KM-FBhWiSfuODpQsnkjMzg&utm_source=copy-link', 'https://music.youtube.com/@willlinley?si=7jpuZXTohC_xarmu', 'https://music.apple.com/us/artist/will-linley/1591950331'),
        ("Moonchild Sanelly", 1, 'https://open.spotify.com/artist/6aDX1jzNVAI9enlQzW0Pgw?si=71j5_lOxRPiM9uTES9hFnA&utm_source=copy-link', 'https://music.youtube.com/@theemoonchildsanelly?si=xa-SipxmBcHcsjVW', 'https://music.apple.com/us/artist/moonchild-sanelly/829566512'),
        ("A-Reece", 1, 'https://open.spotify.com/artist/5TirRF3azWV5OpyufcDCFP?si=efW4BO_pRCCRPybF4PnAjw&utm_source=copy-link', 'https://music.youtube.com/@a-reeceofficial?si=C-5R7Jt6KjY80g8S', 'https://music.apple.com/us/artist/a-reece/914928001'),
		("Hunter Rose", 1, 'https://open.spotify.com/artist/2G6bNldbTZU1viUkX5Myuq?si=7mjVxJQ9R46Rzt5IC6csJA&utm_source=copy-link', 'https://music.youtube.com/@hunterrose?si=zN0L7xOvUB6kkxQV', 'https://music.apple.com/us/artist/hunter-rose/159230685'),
		("Vigro Deep", 1, 'https://open.spotify.com/artist/2mF7ygWz9oyJ3L6ZPWlZVH?si=7zINWxQiTWeS76tDnT2C8A&utm_source=copy-link', 'https://music.youtube.com/@vigrodeepofficial?si=ub_w2lTu_Q53LBm-', 'https://music.apple.com/us/artist/vigro-deep/1471510406'), 
		("Brendan Peyper", 1, 'https://open.spotify.com/artist/4K2VQvyBnfU7La65rShI0v?si=QmZdfpl7SW-jP54JDdpq6A&utm_source=copy-link', 'https://music.youtube.com/@brendanpeyper6074?si=75t04g2HuTCQaed1', 'https://music.apple.com/us/artist/brendan-peyper/978471867'),
		("Alice Phoebe Lou", 1, 'https://open.spotify.com/artist/03uMw43UVu9MsQCcHVSGjX?si=Tn_r2h_IThuQdWgIFNzXxg&utm_source=copy-link', 'https://music.youtube.com/@alicephoebeloumusic?si=Hjc-ycVUeqFW6mjT', 'https://music.apple.com/us/artist/alice-phoebe-lou/670236358'),
		("Da Capo", 1, 'https://open.spotify.com/artist/4YuviELTmYBvDR66ThrMy9?si=fIUdv_zxSTeendSQo8-CxA&utm_source=copy-link', 'https://music.youtube.com/@dacapo9380?si=NbzVhlSg1L-CdnkO', 'https://music.apple.com/us/artist/lordkez/1460128506'),
		("Lordkez", 1, 'https://open.spotify.com/artist/3wWNX2BDUj4tPpLF6D1W88?si=KCjLFoo3Q96zcQ3FsZ1vvQ&utm_source=copy-link', 'https://music.youtube.com/@lordkezmusic?si=YLCvatJoH4ZlZDpx', 'https://music.apple.com/us/artist/lordkez/1460128506'),
		("Internet Girl", 3, 'https://open.spotify.com/artist/2eVTKG3Z5bbKk2OWMIe3iL?si=5ndQgIM8RtazkZzWTWGxcA&utm_source=copy-link', 'https://music.youtube.com/@internetgirrrl?si=ds5Jrrz2yKd8bSHF', 'https://music.apple.com/us/artist/internet-girl/1476186420'),
		("Halo Yagami", 1, 'https://open.spotify.com/artist/3boR2ULQR1CX6TUBboHctW?si=_kNo4AXATySiKsE-drbeew&utm_source=copy-link', 'https://music.youtube.com/@haloyagami?si=vrcAm2j4HleXKXO6', 'https://music.apple.com/us/artist/halo-yagami/1470506645'),
		("Walk These Skies", 4, 'https://open.spotify.com/artist/1rWNKANgYCrrMNG4PdYbxc?si=9MSTs6hxTK2bsGgaYLuqCA&utm_source=copy-link', 'https://music.youtube.com/@walktheseskiesofficial?si=PirT5U5risiF9tn-', 'https://music.apple.com/us/artist/walk-these-skies/1656201454'),
		("Civil Twilight", 4, 'https://open.spotify.com/artist/6i4aN0I3l7uldsLTjbZOF8?si=PASPHFpqQEqbHSZqK0KNyA&utm_source=copy-link', 'https://music.youtube.com/@civiltwilight?si=rcMG-nEqE1qXiH8H', 'https://music.apple.com/us/artist/civil-twilight/273059171'),
		("CrashCarBurn", 4, 'https://open.spotify.com/artist/184sdcjHnD6iVWbPEhxJoC?si=ZQdLuVZ3SCq6UWUdLbMW7w&utm_source=copy-link', 'https://music.youtube.com/@crashcarburn?si=EKJY7IUQ7wZ2KHYH', 'https://music.apple.com/us/artist/crashcarburn/250307465'),
		("Springbok Nude Girls", 5, 'https://open.spotify.com/artist/3hz6VscKnCkBeeeiy66Qzh?si=T1P9gF7VRJGsM8b8g7RKcg&utm_source=copy-link', 'https://music.youtube.com/@springboknudegirls?si=-7zN_-VC3sOLXm59', 'https://music.apple.com/us/artist/the-dirty-skirts/251763649'),
		("The Dirty Skirts", 4, 'https://open.spotify.com/artist/2w4kZfcFXj8x2lTiZNaBBP?si=mdZTrlQpS6mZLY33XCALvA&utm_source=copy-link', 'https://music.youtube.com/channel/UCRzgGzTrHABOQWe4Ds8w4IQ?si=0Gu0LaPl16O9YPrF', 'https://music.apple.com/us/artist/the-dirty-skirts/251763649'),
		("The Black Cat Bones", 4, 'https://open.spotify.com/artist/1qg7JzFBXX7rU711SFfPgO?si=wC_g6dt6RMmdyReG2Oi2Ew&utm_source=copy-link', 'https://music.youtube.com/@theblackcatbones?si=9Id6Vw1mbPyZ6IxL', 'https://music.apple.com/us/artist/black-cat-bones/390251747'),
		("The Parlotones", 6, 'https://open.spotify.com/artist/6kdqDRORMlysnNj2eIOsGs?si=u-fYf0w9R2-MqW4WMG9lLg&utm_source=copy-link', 'https://music.youtube.com/channel/UCZ8ojt22k4gcYkIIcvbnHxQ?si=NnLFNZnCddoYk53t', 'https://music.apple.com/us/artist/jamali/111296933'),
		("Jamali", 3);        

CREATE TABLE artist_genre(
-- replace witha actual table 
artist VARCHAR(50),
genre VARCHAR(50)
);

CREATE TABLE media(
media_id INT PRIMARY KEY AUTO_INCREMENT,
type VARCHAR(50)
);

INSERT INTO media(type)
VALUES
		("Image"),
		("Video"),
		("Audio"),
		("Text");

CREATE TABLE posts(
post_id INT PRIMARY KEY AUTO_INCREMENT,
user_id INT NOT NULL,
caption VARCHAR(50),
media_url VARCHAR(100),
media_type INT,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(user_id),
FOREIGN KEY (media_type) REFERENCES media(type)
);

CREATE TABLE albums(
album_id INT PRIMARY KEY AUTO_INCREMENT,
album_name VARCHAR(50)
);

INSERT INTO albums(album_name)
VALUES
		("Single"),
		("Don't Cry Because It's Over"),
		("20th: Days Before Maud"),
		("iimini"),
		("Song Machine, Season One: Strange Timez (Deluxe)"),
		("Full Moon"),
		("The Lion King: The Gift"),
		("REMEMBER?"),
		("EP - HOLDING/EVOLVING"),
		("Baby Boy II: Reloaded"),
		("Baby Boy V"),
		("Your Piano Is Not My Piano"),
		("Shelter"),
        ("Glow"),
        ("Indigo Child"),
        ("Touch"),
        ("Return To The Beginning"),
        ("You, Me & The 90's"),
        ("midsummer"),
        ("Testament"),
        ("ROLE MODEL (DELUXE VERSION)"),
        ("EP - THOSE WHO ARE AGAINST US ALL THE TIME"),
        ("EP - THOSE WHO ARE AGAINST US ALL THE TIME"),
        ("The Indomitable Human Spirit (Deluxe)"),
        ("the world i love"),
        ("Indandtho"),
        ("You Can't Replace the Sun"),
        ("Umsoco"),
        ("I'd Rather Die Than Become What You've Made"),
        ("Civil Twilight"),
        ("compilation - Come As You Are: A 20th Anniversary Tribute To Nirvana's 'Nevermind'"),
        ("Story Of An Immigrant"),
        ("Holy Weather"),
        ("This City Needs a Hero"),
        ("Long Live Tonight"),
        ("Headlights"),
        ("Back From the Dead"),
        ("Surpass The Power"),
        ("AfterlifeSatisfaction"),
        ("EP - Neanderthal 1"),
        ("Daddy Don't Disco"),
        ("Lost In The Fall"),
        ("On A Stellar Bender"),
        ("The Collection: 2005-2012"),
        ("Book of Miriam"),
        ("Beastipiller"),
        ("Here Is A Knife"),
        ("A World Next Door to Yours"),
        ("Radiocontrolledrobot"),
        ("Jamali"),
        ("Toxic Candy"),
        ("Yours Fatally"),
        ("3rd Base");

CREATE TABLE tracks(
track_id INT PRIMARY KEY AUTO_INCREMENT,
artist_id INT,
title VARCHAR(50) NOT NULL,
album VARCHAR(50) NOT NULL,
audio_url VARCHAR(100) NOT NULL,
realease_date YEAR NOT NULL,
streams INT,
FOREIGN KEY (artist_id) REFERENCES artist_profile(artist_id)
);

INSERT INTO tracks(artist_id, title, album, release_date) 
VALUES
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Usimamane"), "Soft", (SELECT album_id FROM albums WHERE album_name = "Single"), 2025),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Usimamane"), "Anthem", (SELECT album_id FROM albums WHERE album_name = "Single"), 2026),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Usimamane"), "Wola", (SELECT album_id FROM albums WHERE album_name = "Single"), 2026),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Usimamane"), "Star", (SELECT album_id FROM albums WHERE album_name = "20th: Days Before Maud"), 2024),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Usimamane"), "21", (SELECT album_id FROM albums WHERE album_name = "20th: Days Before Maud"), 2024),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Usimamane"), "Uphambene", (SELECT album_id FROM albums WHERE album_name = "20th: Days Before Maud"), 2024),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Bongeziwe"), "Ndokulandela", (SELECT album_id FROM albums WHERE album_name = "Mangaliso"), 2017),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Bongeziwe"), "salanabani (13.8.18)", (SELECT album_id FROM albums WHERE album_name = "iimini"), 2020),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Bongeziwe"), "masiziyekelele (14.11.16)", (SELECT album_id FROM albums WHERE album_name = "iimini"), 2020),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Bongeziwe"), "mini esadibana ngayo (#001)", (SELECT album_id FROM albums WHERE album_name = "iimini"), 2020),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Bongeziwe"), "jikeleza", (SELECT album_id FROM albums WHERE album_name = "iimini"), 2020),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Bongeziwe"), "Yini", (SELECT album_id FROM albums WHERE album_name = "Mangaliso"), 2017),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Will Linley"), "Last Call", (SELECT album_id FROM albums WHERE album_name = "Single"), 2022),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Will Linley"), "Holding The Line", (SELECT album_id FROM albums WHERE album_name = "Single"), 2026),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Will Linley"), "Quite Like Us...", (SELECT album_id FROM albums WHERE album_name = "Don't Cry Because It's Over"), 2025),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Will Linley"), "First Love", (SELECT album_id FROM albums WHERE album_name = "Single"), 2026),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Will Linley"), "How It Starts", (SELECT album_id FROM albums WHERE album_name = "Don't Cry Because It's Over"), 2025),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Will Linley"), "I Loved, I Lost", (SELECT album_id FROM albums WHERE album_name = "Single"), 2026),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Moonchild Sanelly"), "Demon", (SELECT album_id FROM albums WHERE album_name = "Single"), 2021),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Moonchild Sanelly"), "With Love To An Ex (Gorillaz feat. Moonchild Sanelly)", (SELECT album_id FROM albums WHERE album_name = "Song Machine, Season One: Strange Timez (Deluxe)"), 2020),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Moonchild Sanelly"), "Big Man (feat. Self Esteem)", (SELECT album_id FROM albums WHERE album_name = "Single"), 2024),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Moonchild Sanelly"), "UYABALABALA (CDQ, Moonchild Sanelly & Islambo feat. Lady Zamar)", (SELECT album_id FROM albums WHERE album_name = "Single"), 2026),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Moonchild Sanelly"), "Falling", (SELECT album_id FROM albums WHERE album_name = "Full Moon"), 2025),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Moonchild Sanelly"), "MY POWER (Beyoncé, Busiswa, Yemi Alade, Moonchild Sanelly, Niniola)", (SELECT album_id FROM albums WHERE album_name = "The Lion King: The Gift"), 2019),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "A-Reece"), "Four Horsemen (Stogie T feat. Nasty C, Maggz & A-Reece)", (SELECT album_id FROM albums WHERE album_name = "ANOMY"), 2025),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "A-Reece"), "Activity", (SELECT album_id FROM albums WHERE album_name = "Single"), 2026),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "A-Reece"), "Pavlovian Effect", (SELECT album_id FROM albums WHERE album_name = "Single"), 2026),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "A-Reece"), "Bojack", (SELECT album_id FROM albums WHERE album_name = "Single"), 2026),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "A-Reece"), "Confused Admiration", (SELECT album_id FROM albums WHERE album_name = "Single"), 2026),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "A-Reece"), "Idgaf", (SELECT album_id FROM albums WHERE album_name = "EP - Business As Usual"), 2025),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Hunter Rose"), "Seaside Dreams (FloFilz feat. Hunter Rose)", (SELECT album_id FROM albums WHERE album_name = "Single"), 2022),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Hunter Rose"), "Love Birds", (SELECT album_id FROM albums WHERE album_name = "Single"), 2025),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Hunter Rose"), "Fine Wine", (SELECT album_id FROM albums WHERE album_name = "Single"), 2026),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Hunter Rose"), "TONIGHT?", (SELECT album_id FROM albums WHERE album_name = "Single"), 2025),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Hunter Rose"), "CITY", (SELECT album_id FROM albums WHERE album_name = "REMEMBER?"), 2025),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Hunter Rose"), "TIME", (SELECT album_id FROM albums WHERE album_name = "EP - HOLDING/EVOLVING"), 2024),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Vigro Deep"), "Bhampa (feat. Zee Nxumalo & Ch'cco)", (SELECT album_id FROM albums WHERE album_name = "Single"), 2025),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Vigro Deep"), "Ghost Producer", (SELECT album_id FROM albums WHERE album_name = "Baby Boy II: Reloaded"), 2019),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Vigro Deep"), "Uyaganga 2.0", (SELECT album_id FROM albums WHERE album_name = "Baby Boy V"), 2025),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Vigro Deep"), "Nomsa", (SELECT album_id FROM albums WHERE album_name = "Your Piano Is Not My Piano"), 2024),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Vigro Deep"), "Mandebi ", (SELECT album_id FROM albums WHERE album_name = "Your Piano Is Not My Piano"), 2024),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Vigro Deep"), "There's Alot Going On", (SELECT album_id FROM albums WHERE album_name = "Your Piano Is Not My Piano"), 2024),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Brendan Peyper"), "H2Hart ", (SELECT album_id FROM albums WHERE album_name = "EP - Troumateriaal"), 2025),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Brendan Peyper"), "Sarie Marais", (SELECT album_id FROM albums WHERE album_name = "Single"), 2025),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Brendan Peyper"), "Rooi Vlag", (SELECT album_id FROM albums WHERE album_name = "Single"), 2025),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Brendan Peyper"), "Kyk", (SELECT album_id FROM albums WHERE album_name = "Single"), 2025),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Brendan Peyper"), "Lentelyf (Omdat Jy Mag)", (SELECT album_id FROM albums WHERE album_name = "Twentysomething"), 2024),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Brendan Peyper"), "Soen Soos Wat Jy Dans", (SELECT album_id FROM albums WHERE album_name = "Single"), 2024),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Alice Phoebe Lou"), "Witches", (SELECT album_id FROM albums WHERE album_name = "Single"), 2020),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Alice Phoebe Lou"), "Open My Door", (SELECT album_id FROM albums WHERE album_name = "Shelter"), 2023),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Alice Phoebe Lou"), "Touch", (SELECT album_id FROM albums WHERE album_name = "Single"), 2020),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Alice Phoebe Lou"), "Only When I", (SELECT album_id FROM albums WHERE album_name = "Glow"), 2021),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Alice Phoebe Lou"), "Angel", (SELECT album_id FROM albums WHERE album_name = "Shelter"), 2023),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Alice Phoebe Lou"), "Lover // Over the Moon", (SELECT album_id FROM albums WHERE album_name = "Glow"), 2021),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Da Capo"), "Secret ID", (SELECT album_id FROM albums WHERE album_name = "Single"), 2023),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Da Capo"), "Afrika ", (SELECT album_id FROM albums WHERE album_name = "Indigo Child"), 2017),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Da Capo"), "Dancing In The Villa", (SELECT album_id FROM albums WHERE album_name = "Indigo Child"), 2017),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Da Capo"), "I Choose To Stay", (SELECT album_id FROM albums WHERE album_name = "Touch"), 2013),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Da Capo"), "Meet Me In Africa", (SELECT album_id FROM albums WHERE album_name = "Indigo Child"), 2017),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Da Capo"), "A Prayer For All My Countrymen", (SELECT album_id FROM albums WHERE album_name = "Return To The Beginning"), 2021),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Lordkez"), "Aweh", (SELECT album_id FROM albums WHERE album_name = "You, Me & The 90's"), 2020),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Lordkez"), "4SHO", (SELECT album_id FROM albums WHERE album_name = "Single"), 2026),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Lordkez"), "belladonna", (SELECT album_id FROM albums WHERE album_name = "midsummer"), 2021),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Lordkez"), "Enthralled", (SELECT album_id FROM albums WHERE album_name = "Testament"), 2023),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Lordkez"), "Confessions", (SELECT album_id FROM albums WHERE album_name = "Testament"), 2023),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Lordkez"), "22", (SELECT album_id FROM albums WHERE album_name = "midsummer"), 2021),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Lordkez"), "GROOVE99", (SELECT album_id FROM albums WHERE album_name = "midsummer"), 2021),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Internet Girl"), "PULL UP", (SELECT album_id FROM albums WHERE album_name = "ROLE MODEL (DELUXE VERSION)"), 2024),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Internet Girl"), "I CHANGED (I'M UP)", (SELECT album_id FROM albums WHERE album_name = "EP - THOSE WHO ARE AGAINST US ALL THE TIME"), 2025),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Internet Girl"), "COKEHEAD ", (SELECT album_id FROM albums WHERE album_name = "EP - THOSE WHO ARE AGAINST US ALL THE TIME"), 2025),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Internet Girl"), "F all ur Friends", (SELECT album_id FROM albums WHERE album_name = "The Indomitable Human Spirit (Deluxe)"), 2026),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Internet Girl"), "NEEDY", (SELECT album_id FROM albums WHERE album_name = "Single"), 2025),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Internet Girl"), "dumb party", (SELECT album_id FROM albums WHERE album_name = "the world i love"), 2021),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Halo Yagami"), "Uyikhokonke", (SELECT album_id FROM albums WHERE album_name = "Indandtho"), 2026),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Halo Yagami"), "432", (SELECT album_id FROM albums WHERE album_name = "You Can't Replace the Sun"), 2022),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Halo Yagami"), "Nyamazane", (SELECT album_id FROM albums WHERE album_name = "You Can't Replace the Sun"), 2022),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Halo Yagami"), "Alive", (SELECT album_id FROM albums WHERE album_name = "Single"), 2025),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Halo Yagami"), "Phresha", (SELECT album_id FROM albums WHERE album_name = "Single"), 2025),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Halo Yagami"), "Safari", (SELECT album_id FROM albums WHERE album_name = "Umsoco"), 2025),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Walk These Skies"), "Godforsaken ", (SELECT album_id FROM albums WHERE album_name = "Single"), 2026),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Walk These Skies"), "The Bottom", (SELECT album_id FROM albums WHERE album_name = "I'd Rather Die Than Become What You've Made"), 2025),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Walk These Skies"), "Cyanide Milkshake", (SELECT album_id FROM albums WHERE album_name = "I'd Rather Die Than Become What You've Made"), 2025),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Walk These Skies"), "All The Same", (SELECT album_id FROM albums WHERE album_name = "Single"), 2024),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Walk These Skies"), "Condemned", (SELECT album_id FROM albums WHERE album_name = "I'd Rather Die Than Become What You've Made"), 2025),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Walk These Skies"), "Tetracycline Injection", (SELECT album_id FROM albums WHERE album_name = "I'd Rather Die Than Become What You've Made"), 2025),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Civil Twilight"), "Quiet In My Town", (SELECT album_id FROM albums WHERE album_name = "Civil Twilight"), 2009),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Civil Twilight"), "Come As You Are", (SELECT album_id FROM albums WHERE album_name = "compilation - Come As You Are: A 20th Anniversary Tribute To Nirvana's 'Nevermind'"), 2011),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Civil Twilight"), "Holy Dove", (SELECT album_id FROM albums WHERE album_name = "Story Of An Immigrant"), 2015),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Civil Twilight"), "The Courage Of The Fall", (SELECT album_id FROM albums WHERE album_name = "Single"), 2014),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Civil Twilight"), "Holy Weather", (SELECT album_id FROM albums WHERE album_name = "Holy Weather"), 2012),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Civil Twilight"), "Fire Escape", (SELECT album_id FROM albums WHERE album_name = "Holy Weather"), 2012),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "CrashCarBurn"), "Serenade ", (SELECT album_id FROM albums WHERE album_name = "This City Needs a Hero"), 2007),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "CrashCarBurn"), "Long Live Tonight", (SELECT album_id FROM albums WHERE album_name = "Long Live Tonight"), 2010),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "CrashCarBurn"), "Free Fallin'", (SELECT album_id FROM albums WHERE album_name = "Headlights"), 2018),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "CrashCarBurn"), "Stay", (SELECT album_id FROM albums WHERE album_name = "Back From the Dead"), 2022),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "CrashCarBurn"), "Don't Break", (SELECT album_id FROM albums WHERE album_name = "Back From the Dead"), 2022),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "CrashCarBurn"), "Don't It Feel Good?", (SELECT album_id FROM albums WHERE album_name = "Back From the Dead"), 2022),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Springbok Nude Girls"), "Blue Eyes", (SELECT album_id FROM albums WHERE album_name = "Surpass The Power"), 1999),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Springbok Nude Girls"), "Genie", (SELECT album_id FROM albums WHERE album_name = "AfterlifeSatisfaction"), 1997),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Springbok Nude Girls"), "Bubblegum On My Boots", (SELECT album_id FROM albums WHERE album_name = "EP - Neanderthal 1"), 1996),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Springbok Nude Girls"), "Giant Love Affair", (SELECT album_id FROM albums WHERE album_name = "Surpass The Power"), 1999),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Springbok Nude Girls"), "Get the Picture", (SELECT album_id FROM albums WHERE album_name = "Single"), 2022),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Springbok Nude Girls"), "SA Tan On The Beaches", (SELECT album_id FROM albums WHERE album_name = "Single"), 2021),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "The Dirty Skirts"), "Daddy Don't Disco", (SELECT album_id FROM albums WHERE album_name = "Daddy Don't Disco"), 2008),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "The Dirty Skirts"), "Strike The Match", (SELECT album_id FROM albums WHERE album_name = "Lost In The Fall"), 2011),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "The Dirty Skirts"), "Home Wrecker", (SELECT album_id FROM albums WHERE album_name = "On A Stellar Bender"), 2007),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "The Dirty Skirts"), "Rolling Like Thunder", (SELECT album_id FROM albums WHERE album_name = "Daddy Don't Disco"), 2008),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "The Dirty Skirts"), "Can't Remember Your Name", (SELECT album_id FROM albums WHERE album_name = "Daddy Don't Disco"), 2008),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "The Dirty Skirts"), "Evil Comes", (SELECT album_id FROM albums WHERE album_name = "The Collection: 2005-2012"), 2013),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "The Black Cat Bones"), "Hemingway ", (SELECT album_id FROM albums WHERE album_name = "Book of Miriam"), 2022),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "The Black Cat Bones"), "Dearly Beloved", (SELECT album_id FROM albums WHERE album_name = "Book of Miriam"), 2022),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "The Black Cat Bones"), "Don't Wake The Scarecrow", (SELECT album_id FROM albums WHERE album_name = "Single"), 2015),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "The Black Cat Bones"), "When I See You", (SELECT album_id FROM albums WHERE album_name = "Book of Miriam"), 2022),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "The Black Cat Bones"), "Black Cat Bone", (SELECT album_id FROM albums WHERE album_name = "Beastipiller"), 2013),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "The Black Cat Bones"), "The Well", (SELECT album_id FROM albums WHERE album_name = "Here Is A Knife"), 2018),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "The Parlotones"), "Colourful ", (SELECT album_id FROM albums WHERE album_name = "Radiocontrolledrobot"), 2005),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "The Parlotones"), "I'll Be There", (SELECT album_id FROM albums WHERE album_name = "A World Next Door to Yours"), 2007),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "The Parlotones"), "Giant Mistake", (SELECT album_id FROM albums WHERE album_name = "A World Next Door to Yours"), 2007),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "The Parlotones"), "I'm Only Human", (SELECT album_id FROM albums WHERE album_name = "A World Next Door to Yours"), 2007),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "The Parlotones"), "Life In a Jar", (SELECT album_id FROM albums WHERE album_name = "A World Next Door to Yours"), 2007),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "The Parlotones"), "Come Together", (SELECT album_id FROM albums WHERE album_name = "Single"), 2009),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Jamali"), "Maisha ", (SELECT album_id FROM albums WHERE album_name = "Jamali"), 2004),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Jamali"), "Incurable ", (SELECT album_id FROM albums WHERE album_name = "Toxic Candy"), 2011),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Jamali"), "Yours Fatally", (SELECT album_id FROM albums WHERE album_name = "Yours Fatally"), 2006),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Jamali"), "Skut Julle Lywe", (SELECT album_id FROM albums WHERE album_name = "3rd Base"), 2007),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Jamali"), "Secrets (feat. Nick G)", (SELECT album_id FROM albums WHERE album_name = "Jamali"), 2004),
		((SELECT artist_id FROM artist_profile WHERE stage_name LIKE "Jamali"), "Everytime ", (SELECT album_id FROM albums WHERE album_name = "Jamali"), 2004);

CREATE TABLE banks(
bank_id INT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(50)
);

CREATE TABLE cards(
card_id INT PRIMARY KEY AUTO_INCREMENT,
bank INT,
card_no VARCHAR(20),
card_holder INT,
FOREIGN KEY (bank) REFERENCES banks(name),
FOREIGN KEY (card_holder) REFERENCES users(user_id)
);

CREATE TABLE events(
event_id INT PRIMARY KEY AUTO_INCREMENT,
event_name VARCHAR(50),
event_location VARCHAR(50),
event_date VARCHAR(50) NOT NULL,
event_price VARCHAR(50)
);

INSERT INTO events(event_name, event_location, event_date, event_price)
VALUES
		("Standard Bank Joy of Jazz 2026", "Sandton Convention Centre, Johannesburg", "25–26 September 2026", "R1,150–R1,350 (day pass), R2,250–R3,250 (weekend pass) — price varies slightly by source"),
        ("WOMAD SA 2026", "Artscape Theatre Centre + V&A Waterfront Amphitheatre, Cape Town", "15–24 September 2026", "Mix of free public performances and ticketed events (no single fixed price)"),
        ("It's Personal Picnic: 15 Years (feat. HVOB, Shimza, Jullian Gomes)", "James & Ethel Gray Park, Johannesburg", "5 September 2026", "From R650 (Picnic only) — Full Experience incl. after-party from R500"),
        ("We Love R&B – Johannesburg", "Maracana, Johannesburg", "4–5 September 2026", "From R150"),
        ("The Picnic Club – Spring Picnic", "Smuts House, Irene", "5 September 2026", "From R350"),
        ("Blomme & Bubbles Festival 2026", "Paternoster", "4–6 September 2026", "R782"),
        ("Springfest 2026", "Midstream College", "5 September 2026", "From R350");
