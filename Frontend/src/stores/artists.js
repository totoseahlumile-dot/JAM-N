import { apiRequest } from "../services/api";
import { resolveAudioUrl } from "../services/audio";

const knownImageSlugs = new Set([
  "a-reece", "alice-phoebe-lou", "bongeziwe-mabandla", "hunter-rose",
  "internet-girl", "moonchild-sanelly", "the-parlotones", "usimamane",
  "vigro-deep", "will-linley"
]);
const imageFor = (name) => {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return knownImageSlugs.has(slug) ? `/images/artists/${slug}.jpg` : null;
};
const mapArtist = (artist) => ({
  ...artist, name: artist.stageName, genre: artist.genres || [],
  image: artist.avatarUrl || imageFor(artist.stageName),
  tracks: (artist.tracks || []).map((track) => ({
    ...track,
    audioUrl: resolveAudioUrl(track.audioUrl, artist.stageName, track.title),
  })), albums: artist.albums || []
});

export default {
  state: () => ({
    artistsList: [
      {
        id: "1",
        name: "Alice Phoebe Lou",
        handle: "alicephoebelou",
        genre: ["Indie Pop", "Indie Folk", "Alternative"],
        location: "Berlin / Cape Town",
        image: "/images/artists/alice-phoebe-lou.jpg",
        bio: "Independent singer-songwriter known for her soulful vocals and dreamy indie-folk sound.",
        tracks: [
          {
            id: "t1-1",
            title: "Witches",
            audioUrl: "/audio/alice-phoebe-lou-witches.mp3",
          },
          {
            id: "t1-2",
            title: "Open My Door",
            audioUrl: "/audio/alice-phoebe-lou-open-my-door.mp3",
          },
          {
            id: "t1-3",
            title: "Touch",
            audioUrl: "/audio/alice-phoebe-lou-touch.mp3",
          },
          {
            id: "t1-4",
            title: "Only When I",
            audioUrl: "/audio/alice-phoebe-lou-only-when-i.mp3",
          },
          {
            id: "t1-5",
            title: "Angel",
            audioUrl: "/audio/alice-phoebe-lou-angel.mp3",
          },
          {
            id: "t1-6",
            title: "Lover // Over the Moon",
            audioUrl: "/audio/alice-phoebe-lou-lover-over-the-moon.mp3",
          },
        ],
      },
      {
        id: "2",
        name: "A-Reece",
        handle: "areeecsa",
        genre: ["Hip-Hop"],
        location: "Pretoria",
        image: "/images/artists/a-reece.jpg",
        bio: "Prolific lyricist and leading figure in South African hip hop.",
        tracks: [
          {
            id: "t2-1",
            title: "Four Horsemen",
            audioUrl: "/audio/a-reece-four-horsemen.mp3",
          },
          {
            id: "t2-2",
            title: "Activity",
            audioUrl: "/audio/a-reece-activity.mp3",
          },
          {
            id: "t2-3",
            title: "Pavlovian Effect",
            audioUrl: "/audio/a-reece-pavlovian-effect.mp3",
          },
          {
            id: "t2-4",
            title: "Bojack",
            audioUrl: "/audio/a-reece-bojack.mp3",
          },
          {
            id: "t2-5",
            title: "Confused Admiration",
            audioUrl: "/audio/a-reece-confused-admiration.mp3",
          },
          { id: "t2-6", title: "Idgaf", audioUrl: "/audio/a-reece-idgaf.mp3" },
        ],
      },
      {
        id: "3",
        name: "Bongeziwe Mabandla",
        handle: "bongeziwe",
        genre: ["Folk"],
        location: "Johannesburg",
        image: "/images/artists/bongeziwe-mabandla.jpg",
        bio: "Acclaimed Afro-folk artist celebrated for his emotive storytelling and Xhosa lyrics.",
        tracks: [
          {
            id: "t3-1",
            title: "Ndokulandela",
            audioUrl: "/audio/bongeziwe-ndokulandela.mp3",
          },
          {
            id: "t3-2",
            title: "salanabani (13.8.18)",
            audioUrl: "/audio/bongeziwe-salanabani.mp3",
          },
          {
            id: "t3-3",
            title: "masiziyekelele (14.11.16)",
            audioUrl: "/audio/bongeziwe-masiziyekelele.mp3",
          },
          {
            id: "t3-4",
            title: "mini esadibana ngayo (#001)",
            audioUrl: "/audio/bongeziwe-mini-esadibana-ngayo.mp3",
          },
          {
            id: "t3-5",
            title: "jikeleza",
            audioUrl: "/audio/bongeziwe-jikeleza.mp3",
          },
          { id: "t3-6", title: "Yini", audioUrl: "/audio/bongeziwe-yini.mp3" },
        ],
      },
      {
        id: "4",
        name: "Brendan Peyper",
        handle: "brendanpeyper",
        genre: ["Pop", "Contemporary Country"],
        location: "Bloemfontein",
        image: "/images/artists/brendan-peyper.jpg",
        bio: "Energetic singer-songwriter blending modern pop appeal with country-rock elements.",
        tracks: [
          {
            id: "t4-1",
            title: "H2Hart",
            audioUrl: "/audio/brendan-peyper-h2hart.mp3",
          },

          /*
          {
            id: "t4-2",
            title: "Sarie Marais",
            audioUrl: "/audio/brendan-peyper-sarie-marais.mp3",
          },
          */

          {
            id: "t4-3",
            title: "Rooi Vlag",
            audioUrl: "/audio/brendan-peyper-rooi-vlag.mp3",
          },
          {
            id: "t4-4",
            title: "Kyk",
            audioUrl: "/audio/brendan-peyper-kyk.mp3",
          },
          {
            id: "t4-5",
            title: "Lentelyf (Omdat Jy Mag)",
            audioUrl: "/audio/brendan-peyper-lentelyf.mp3",
          },
          {
            id: "t4-6",
            title: "Soen Soos Wat Jy Dans",
            audioUrl: "/audio/brendan-peyper-soen-soos-wat-jy-dans.mp3",
          },
        ],
      },
      {
        id: "5",
        name: "Civil Twilight",
        handle: "civiltwilight",
        genre: ["Alternative Rock", "Art Rock", "Indie Rock"],
        location: "Johannesburg",
        image: "/images/artists/civil-spotlight.jpg",
        bio: "Independent alternative rock group delivering heavy riffs and dynamic hooks.",
        tracks: [
          {
            id: "t5-1",
            title: "Quiet In My Town",
            audioUrl: "/audio/civil-twilight-quiet-in-my-town.mp3",
          },
          {
            id: "t5-2",
            title: "Come As You Are",
            audioUrl: "/audio/civil-twilight-come-as-you-are.mp3",
          },
          {
            id: "t5-3",
            title: "Holy Dove",
            audioUrl: "/audio/civil-twilight-holy-dove.mp3",
          },

          /*
          {
            id: "t5-4",
            title: "The Courage Of The Fall",
            audioUrl: "/audio/civil-twilight-the-courage-of-the-fall.mp3",
          },
          */

          {
            id: "t5-5",
            title: "Holy Weather",
            audioUrl: "/audio/civil-twilight-holy-weather.mp3",
          },
          {
            id: "t5-6",
            title: "Fire Escape",
            audioUrl: "/audio/civil-twilight-fire-escape.mp3",
          },
        ],
      },
      {
        id: "6",
        name: "CrashCarBurn",
        handle: "crashcarburn",
        genre: ["Pop-punk", "Power Pop", "Alternative Rock"],
        location: "Johannesburg",
        image: "/images/artists/crashcarburn.jpg",
        bio: "Veteran South African rock band known for high-octane performances.",
        tracks: [
          {
            id: "t6-1",
            title: "Serenade",
            audioUrl: "/audio/crashcarburn-serenade.mp3",
          },
          {
            id: "t6-2",
            title: "Long Live Tonight",
            audioUrl: "/audio/crashcarburn-long-live-tonight.mp3",
          },
          {
            id: "t6-3",
            title: "Free Fallin'",
            audioUrl: "/audio/crashcarburn-free-fallin.mp3",
          },
          {
            id: "t6-4",
            title: "Stay",
            audioUrl: "/audio/crashcarburn-stay.mp3",
          },
          {
            id: "t6-5",
            title: "Don't Break",
            audioUrl: "/audio/crashcarburn-dont-break.mp3",
          },
          {
            id: "t6-6",
            title: "Don't It Feel Good?",
            audioUrl: "/audio/crashcarburn-dont-it-feel-good.mp3",
          },
        ],
      },
      {
        id: "7",
        name: "Da Capo",
        handle: "dacapo",
        genre: ["Dance/Electronic", "Amapiano"],
        location: "Polokwane",
        image: "/images/artists/da-capo.jpg",
        bio: "Renowned DJ and producer shaping the deep house and afro-house landscape globally.",
        tracks: [
          {
            id: "t7-1",
            title: "Secret ID",
            audioUrl: "/audio/da-capo-secret-id.mp3",
          },
          {
            id: "t7-2",
            title: "Afrika",
            audioUrl: "/audio/da-capo-afrika.mp3",
          },
          {
            id: "t7-3",
            title: "Dance In Villa",
            audioUrl: "/audio/da-capo-dance-in-villa.mp3",
          },
          {
            id: "t7-4",
            title: "I Choose To Stay",
            audioUrl: "/audio/da-capo-i-choose-to-stay.mp3",
          },
          {
            id: "t7-5",
            title: "Meet Me In Africa",
            audioUrl: "/audio/da-capo-meet-me-in-africa.mp3",
          },
          {
            id: "t7-6",
            title: "A Prayer For All My Countrymen",
            audioUrl: "/audio/da-capo-a-prayer-for-all-my-countrymen.mp3",
          },
        ],
      },
      {
        id: "8",
        name: "Halo Yagami",
        handle: "haloyagami",
        genre: ["Experimental R&B", "Soul"],
        location: "Johannesburg",
        image: "/images/artists/halo-yagami.jpg",
        bio: "Innovative artist pushing the boundaries of sound design and modern rap.",
        tracks: [
          {
            id: "t8-1",
            title: "Uyikhokonke",
            audioUrl: "/audio/halo-yagami-uyikhokonke.mp3",
          },
          { id: "t8-2", title: "432", audioUrl: "/audio/halo-yagami-432.mp3" },
          {
            id: "t8-3",
            title: "Nyamazane",
            audioUrl: "/audio/halo-yagami-nyamazane.mp3",
          },
          {
            id: "t8-4",
            title: "Alive",
            audioUrl: "/audio/halo-yagami-alive.mp3",
          },
          {
            id: "t8-5",
            title: "Phresha",
            audioUrl: "/audio/halo-yagami-phresha.mp3",
          },
          {
            id: "t8-6",
            title: "Safari",
            audioUrl: "/audio/halo-yagami-safari.mp3",
          },
        ],
      },
      {
        id: "9",
        name: "Hunter Rose",
        handle: "hunterrose",
        genre: ["Soul", "Jazz", "R&B"],
        location: "Cape Town",
        image: "/images/artists/hunter-rose.jpg",
        bio: "Sensational R&B vocal talent delivering lush harmonies and groovy beats.",
        tracks: [
          {
            id: "t9-1",
            title: "Seaside Dreams",
            audioUrl: "/audio/hunter-rose-seaside-dreams.mp3",
          },
          {
            id: "t9-2",
            title: "Love Birds",
            audioUrl: "/audio/hunter-rose-love-birds.mp3",
          },
          {
            id: "t9-3",
            title: "Fine Wine",
            audioUrl: "/audio/hunter-rose-fine-wine.mp3",
          },
          {
            id: "t9-4",
            title: "TONIGHT?",
            audioUrl: "/audio/hunter-rose-tonight.mp3",
          },
          {
            id: "t9-5",
            title: "Get It",
            audioUrl: "/audio/hunter-rose-get-it.mp3",
          },
          {
            id: "t9-6",
            title: "TIME",
            audioUrl: "/audio/hunter-rose-time.mp3",
          },
        ],
      },
      {
        id: "10",
        name: "Internet Girl",
        handle: "internetgirl",
        genre: ["Indie", "Garage-Rock"],
        location: "South Africa",
        image: "/images/artists/internet-girl.jpg",
        bio: "Genre-bending underground collective crafting glitchy, high-energy alt sounds.",
        tracks: [
          {
            id: "t10-1",
            title: "PULL UP",
            audioUrl: "/audio/internet-girl-pull-up.mp3",
          },
          {
            id: "t10-2",
            title: "I CHANGED (I'M UP)",
            audioUrl: "/audio/internet-girl-i-changed.mp3",
          },
          {
            id: "t10-3",
            title: "COKEHEAD",
            audioUrl: "/audio/internet-girl-cokehead.mp3",
          },
          {
            id: "t10-4",
            title: "F all ur Friends",
            audioUrl: "/audio/internet-girl-f-all-ur-friends.mp3",
          },
          {
            id: "t10-5",
            title: "NEEDY",
            audioUrl: "/audio/internet-girl-needy.mp3",
          },
          {
            id: "t10-6",
            title: "dumb party",
            audioUrl: "/audio/internet-girl-dumb-party.mp3",
          },
        ],
      },
      {
        id: "11",
        name: "Jamali",
        handle: "jamali",
        genre: ["R&B", "Afropop"],
        location: "Johannesburg",
        image: "/images/artists/jamali.jpg",
        bio: "Iconic South African pop-R&B trio celebrated for timeless vocal harmonies.",
        tracks: [
          {
            id: "t11-1",
            title: "Maisha",
            audioUrl: "/audio/jamali-maisha.mp3",
          },
          {
            id: "t11-2",
            title: "Incurable",
            audioUrl: "/audio/jamali-incurable.mp3",
          },
          /*
          {
            id: "t11-3",
            title: "Yours Fatally",
            audioUrl: "/audio/jamali-yours-fatally.mp3",
          },
          */
          {
            id: "t11-4",
            title: "Skut Julle Lywe",
            audioUrl: "/audio/jamali-skut-julle-lywe.mp3",
          },
          {
            id: "t11-5",
            title: "Secrets",
            audioUrl: "/audio/jamali-secrets.mp3",
          },
          {
            id: "t11-6",
            title: "Everytime",
            audioUrl: "/audio/jamali-everytime.mp3",
          },
        ],
      },
      {
        id: "12",
        name: "Lordkez",
        handle: "lordkez",
        genre: ["R&B", "Neo-Soul"],
        location: "Johannesburg",
        image: "/images/artists/lordkez.jpg",
        bio: "Versatile singer, songwriter, and poet creating introspective, moody soundscapes.",
        tracks: [
          { id: "t12-1", title: "Aweh", audioUrl: "/audio/lordkez-aweh.mp3" },

          /*
          { id: "t12-2",
            title: "4SHO",
            audioUrl: "/audio/lordkez-4sho.mp3" },
          */

          {
            id: "t12-3",
            title: "belladonna",
            audioUrl: "/audio/lordkez-belladonna.mp3",
          },
          {
            id: "t12-4",
            title: "Enthralled",
            audioUrl: "/audio/lordkez-enthralled.mp3",
          },
          {
            id: "t12-5",
            title: "Confessions",
            audioUrl: "/audio/lordkez-confessions.mp3",
          },
          { id: "t12-6", title: "22", audioUrl: "/audio/lordkez-22.mp3" },
          {
            id: "t12-7",
            title: "GROOVE99",
            audioUrl: "/audio/lordkez-groove99.mp3",
          },
        ],
      },
      {
        id: "13",
        name: "Moonchild Sanelly",
        handle: "moonchildsanelly",
        genre: ["Future Ghetto Funk"],
        location: "Johannesburg",
        image: "/images/artists/moonchild-sanelly.jpg",
        bio: "Globally acclaimed singer and dancer known for her signature blue hair and high-energy persona.",
        tracks: [
          {
            id: "t13-1",
            title: "Demon",
            audioUrl: "/audio/moonchild-sanelly-demon.mp3",
          },
          {
            id: "t13-2",
            title: "With Love To An Ex",
            audioUrl: "/audio/moonchild-sanelly-with-love-to-an-ex.mp3",
          },
          {
            id: "t13-3",
            title: "Big Man",
            audioUrl: "/audio/moonchild-sanelly-big-man.mp3",
          },
          {
            id: "t13-4",
            title: "Kokokokoko",
            audioUrl: "/audio/moonchild-sanelly-kokokokoko.mp3",
          },
          {
            id: "t13-5",
            title: "Falling",
            audioUrl: "/audio/moonchild-sanelly-falling.mp3",
          },
          {
            id: "t13-6",
            title: "MY POWER",
            audioUrl: "/audio/moonchild-sanelly-my-power.mp3",
          },
        ],
      },
      {
        id: "14",
        name: "Springbok Nude Girls",
        handle: "springboknudegirls",
        genre: ["Alternative Rock", "Pop-Rock"],
        location: "Stellenbosch",
        image: "/images/artists/springbok-nude-girls.jpg",
        bio: "Legendary South African rock heavyweights pioneering alternative music since the 90s.",
        tracks: [
          {
            id: "t14-1",
            title: "Blue Eyes",
            audioUrl: "/audio/springbok-nude-girls-blue-eyes.mp3",
          },
          {
            id: "t14-2",
            title: "Genie",
            audioUrl: "/audio/springbok-nude-girls-genie.mp3",
          },
          {
            id: "t14-3",
            title: "Bubblegum On My Boots",
            audioUrl: "/audio/springbok-nude-girls-bubblegum.mp3",
          },
          {
            id: "t14-4",
            title: "Giant Love Affair",
            audioUrl: "/audio/springbok-nude-girls-giant-love-affair.mp3",
          },
          {
            id: "t14-5",
            title: "Get the Picture",
            audioUrl: "/audio/springbok-nude-girls-get-the-picture.mp3",
          },
          {
            id: "t14-6",
            title: "SA Tan On The Beaches",
            audioUrl: "/audio/springbok-nude-girls-sa-tan.mp3",
          },
        ],
      },
      {
        id: "15",
        name: "The Black Cat Bones",
        handle: "theblackcatbones",
        genre: ["Rock", "Blues", "Country", "Folk"],
        location: "Pretoria",
        image: "/images/artists/the-black-cat-bones.jpg",
        bio: "Raw, gritty blues-rock outfit delivering high-power authentic musicianship.",
        tracks: [
          {
            id: "t15-1",
            title: "Hemingway",
            audioUrl: "/audio/the-black-cat-bones-hemingway.mp3",
          },
          {
            id: "t15-2",
            title: "Dearly Beloved",
            audioUrl: "/audio/the-black-cat-bones-dearly-beloved.mp3",
          },
          {
            id: "t15-3",
            title: "Don't Wake The Scarecrow",
            audioUrl: "/audio/the-black-cat-bones-dont-wake.mp3",
          },

          /*
          {
            id: "t15-4",
            title: "When I See You",
            audioUrl: "/audio/the-black-cat-bones-when-i-see-you.mp3",
          },
          
          {
            id: "t15-5",
            title: "Black Cat Bone",
            audioUrl: "/audio/the-black-cat-bones-black-cat-bone.mp3",
          },
          */

          {
            id: "t15-6",
            title: "The Well",
            audioUrl: "/audio/the-black-cat-bones-the-well.mp3",
          },
        ],
      },
      {
        id: "16",
        name: "The Dirty Skirts",
        handle: "thedirtyskirts",
        genre: ["Indie Rock", "Alternative Rock"],
        location: "Cape Town",
        image: "/images/artists/the-dirty-skirts.jpg",
        bio: "Award-winning indie rock band famous for electrifying live shows and anthemic hooks.",
        tracks: [
          {
            id: "t16-1",
            title: "Daddy Don't Disco",
            audioUrl: "/audio/the-dirty-skirts-daddy-dont-disco.mp3",
          },
          {
            id: "t16-2",
            title: "Strike The Match",
            audioUrl: "/audio/the-dirty-skirts-strike-the-match.mp3",
          },
          {
            id: "t16-3",
            title: "Home Wrecker",
            audioUrl: "/audio/the-dirty-skirts-home-wrecker.mp3",
          },
          {
            id: "t16-4",
            title: "Rolling Like Thunder",
            audioUrl: "/audio/the-dirty-skirts-rolling-like-thunder.mp3",
          },
          {
            id: "t16-5",
            title: "Can't Remember Your Name",
            audioUrl: "/audio/the-dirty-skirts-cant-remember.mp3",
          },

          /*
          {
            id: "t16-6",
            title: "Evil Comes",
            audioUrl: "/audio/the-dirty-skirts-evil-comes.mp3",
          },
          */
        ],
      },
      {
        id: "17",
        name: "The Parlotones",
        handle: "theparlotones",
        genre: ["Indie Rock", "Alternative Rock", "Pop Rock"],
        location: "Johannesburg",
        image: "/images/artists/the-parlotones.jpg",
        bio: "Multi-platinum selling indie rock band with iconic cinematic sound and grand melodic structures.",
        tracks: [
          {
            id: "t17-1",
            title: "Colourful",
            audioUrl: "/audio/the-parlotones-colourful.mp3",
          },
          {
            id: "t17-2",
            title: "I'll Be There",
            audioUrl: "/audio/the-parlotones-ill-be-there.mp3",
          },
          {
            id: "t17-3",
            title: "Giant Mistake",
            audioUrl: "/audio/the-parlotones-giant-mistake.mp3",
          },
          {
            id: "t17-4",
            title: "I'm Only Human",
            audioUrl: "/audio/the-parlotones-im-only-human.mp3",
          },
          {
            id: "t17-5",
            title: "Life In a Jar",
            audioUrl: "/audio/the-parlotones-life-in-a-jar.mp3",
          },
          {
            id: "t17-6",
            title: "Come Together",
            audioUrl: "/audio/the-parlotones-come-together.mp3",
          },
        ],
      },
      {
        id: "18",
        name: "Usimamane",
        handle: "usimamane",
        genre: ["Hip-Hop/Rap"],
        location: "Durban",
        image: "/images/artists/usimamane.jpg",
        bio: "Pioneering new wave rap artist from South Africa making massive waves.",
        tracks: [
          { id: "t18-1", title: "Soft", audioUrl: "/audio/usimamane-soft.mp3" },
          {
            id: "t18-2",
            title: "Anthem",
            audioUrl: "/audio/usimamane-anthem.mp3",
          },
          { id: "t18-3", title: "Wola", audioUrl: "/audio/usimamane-wual.mp3" },
          { id: "t18-4", title: "Star", audioUrl: "/audio/usimamane-star.mp3" },
          { id: "t18-5", title: "21", audioUrl: "/audio/usimamane-21.mp3" },
          {
            id: "t18-6",
            title: "Uphambene",
            audioUrl: "/audio/usimamane-uphambene.mp3",
          },
        ],
      },
      {
        id: "19",
        name: "Vigro Deep",
        handle: "vigrodeep",
        genre: ["Amapiano"],
        location: "Pretoria",
        image: "/images/artists/vigro-deep.jpg",
        bio: "Child prodigy and trailblazing producer driving the evolution of Amapiano.",
        tracks: [
          {
            id: "t19-1",
            title: "Bhampa",
            audioUrl: "/audio/vigro-deep-bhampa.mp3",
          },
          {
            id: "t19-2",
            title: "Ghost Producer",
            audioUrl: "/audio/vigro-deep-ghost-producer.mp3",
          },
          {
            id: "t19-3",
            title: "Uyaganga 2.0",
            audioUrl: "/audio/vigro-deep-uyaganga.mp3",
          },
          {
            id: "t19-4",
            title: "Nomsa",
            audioUrl: "/audio/vigro-deep-nomsa.mp3",
          },
          {
            id: "t19-5",
            title: "Mandebi",
            audioUrl: "/audio/vigro-deep-mandebi.mp3",
          },
          {
            id: "t19-6",
            title: "There's Alot Going On",
            audioUrl: "/audio/vigro-deep-theres-alot-going-on.mp3",
          },
        ],
      },
      {
        id: "20",
        name: "Walk These Skies",
        handle: "walktheseskies",
        genre: ["Modern Metalcore", "Deathcore"],
        location: "Cape Town",
        image: "/images/artists/walk-these-skies.jpg",
        bio: "Melodic rock group known for soaring guitar leads and emotional intensity.",
        tracks: [
          {
            id: "t20-1",
            title: "Godforsaken",
            audioUrl: "/audio/walk-these-skies-godforsaken.mp3",
          },
          {
            id: "t20-2",
            title: "The Bottom",
            audioUrl: "/audio/walk-these-skies-the-bottom.mp3",
          },
          {
            id: "t20-3",
            title: "Cyanide Milkshake",
            audioUrl: "/audio/walk-these-skies-cyanide-milkshake.mp3",
          },
          {
            id: "t20-4",
            title: "All The Same",
            audioUrl: "/audio/walk-these-skies-all-the-same.mp3",
          },
          {
            id: "t20-5",
            title: "Condemned",
            audioUrl: "/audio/walk-these-skies-condemned.mp3",
          },
          {
            id: "t20-6",
            title: "Tetracycline Injection",
            audioUrl: "/audio/walk-these-skies-tetracycline.mp3",
          },
        ],
      },
      {
        id: "21",
        name: "Will Linley",
        handle: "willlinley",
        genre: ["Pop"],
        location: "Cape Town",
        image: "/images/artists/will-linley.jpg",
        bio: "Viral pop singer-songwriter crafting infectious, heartfelt pop tracks.",
        tracks: [
          {
            id: "t21-1",
            title: "Last Call",
            audioUrl: "/audio/will-linley-last-call.mp3",
          },
          {
            id: "t21-2",
            title: "Holding The Line",
            audioUrl: "/audio/will-linley-holding-the-line.mp3",
          },
          {
            id: "t21-3",
            title: "Quite Like Us...",
            audioUrl: "/audio/will-linley-quite-like-us.mp3",
          },
          {
            id: "t21-4",
            title: "First Love",
            audioUrl: "/audio/will-linley-first-love.mp3",
          },
          {
            id: "t21-5",
            title: "How It Starts",
            audioUrl: "/audio/will-linley-how-it-starts.mp3",
          },
          {
            id: "t21-6",
            title: "I Loved, I Lost",
            audioUrl: "/audio/will-linley-i-loved-i-lost.mp3",
          },
        ],
      },
    ],
  }),

  getters: {
    allArtists: (state) => state.artistsList,
    getArtistById: (state) => (id) => {
      return state.artistsList.find((artist) => String(artist.id) === String(id));
    },
  },

  mutations: {
    SET_ARTISTS(state, artists) { state.artistsList = artists; },
    UPSERT_ARTIST(state, artist) {
      const index = state.artistsList.findIndex((item) => String(item.id) === String(artist.id));
      if (index === -1) state.artistsList.push(artist);
      else state.artistsList.splice(index, 1, artist);
    }
  },

  actions: {
    async fetchArtists({ commit }) {
      const { artists } = await apiRequest("/api/artists?limit=100");
      const mapped = artists.map(mapArtist); commit("SET_ARTISTS", mapped); return mapped;
    },
    async fetchArtist({ commit }, id) {
      const { artist } = await apiRequest(`/api/artists/${id}`);
      const mapped = mapArtist(artist); commit("UPSERT_ARTIST", mapped); return mapped;
    }
  },

  namespaced: true,
};
