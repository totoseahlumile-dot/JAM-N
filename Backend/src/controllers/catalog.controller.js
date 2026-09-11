import * as catalog from "../models/catalog.model.js";
import httpError from "../utils/httpError.js";

const parsePositiveInteger = (value, name, { optional = false, max } = {}) => {
  if (optional && (value === undefined || value === "")) return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || (max && parsed > max)) {
    throw httpError(400, "INVALID_QUERY", `${name} must be a positive integer${max ? ` no greater than ${max}` : ""}`);
  }
  return parsed;
};

const pagination = (query) => ({
  limit: query.limit === undefined ? 50 : parsePositiveInteger(query.limit, "limit", { max: 100 }),
  offset: query.offset === undefined ? 0 : Math.max(0, Number.parseInt(query.offset, 10) || 0)
});

const formatArtist = (artist) => ({
  ...artist,
  isVerified: Boolean(artist.isVerified),
  genres: artist.genreNames ? artist.genreNames.split("|") : [],
  genreNames: undefined
});

const stringField = (body, name, { required = false, max = 2048 } = {}) => {
  const value = body[name];
  if (value === undefined && !required) return undefined;
  if (typeof value !== "string" || !value.trim() || value.trim().length > max) {
    throw httpError(400, "VALIDATION_ERROR", `${name} must be a non-empty string no longer than ${max} characters`);
  }
  return value.trim();
};

const nullableStringField = (body, name, max = 2048) => {
  if (body[name] === undefined) return undefined;
  if (body[name] === null || body[name] === "") return null;
  return stringField(body, name, { max });
};

const optionalId = (body, name) => body[name] === null
  ? null
  : body[name] === undefined
    ? undefined
    : parsePositiveInteger(body[name], name);

const runMutation = async (next, operation) => {
  try {
    return await operation();
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return next(httpError(409, "RESOURCE_EXISTS", "A record with those unique values already exists"));
    }
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return next(httpError(400, "INVALID_REFERENCE", "A referenced record does not exist"));
    }
    return next(error);
  }
};

const compact = (object) => Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined));

const artistFields = (body, creating = false) => compact({
  user_id: optionalId(body, "userId"),
  stage_name: stringField(body, "stageName", { required: creating, max: 100 }),
  member_count: body.memberCount === undefined ? undefined : parsePositiveInteger(body.memberCount, "memberCount"),
  location: nullableStringField(body, "location", 120),
  booking_email: nullableStringField(body, "bookingEmail", 255),
  spotify_url: nullableStringField(body, "spotifyUrl"),
  youtube_url: nullableStringField(body, "youtubeUrl"),
  apple_music_url: nullableStringField(body, "appleMusicUrl"),
  is_verified: body.isVerified === undefined ? undefined : Boolean(body.isVerified)
});

const eventFields = (body, creating = false) => compact({
  name: stringField(body, "name", { required: creating, max: 255 }),
  location: stringField(body, "location", { required: creating, max: 255 }),
  starts_at: stringField(body, "startsAt", { required: creating, max: 40 }),
  ends_at: nullableStringField(body, "endsAt", 40),
  price_description: nullableStringField(body, "priceDescription", 500),
  ticket_url: nullableStringField(body, "ticketUrl")
});

const albumFields = (body, creating = false) => compact({
  artist_id: body.artistId === undefined && !creating ? undefined : parsePositiveInteger(body.artistId, "artistId"),
  title: stringField(body, "title", { required: creating, max: 255 }),
  release_date: nullableStringField(body, "releaseDate", 10),
  cover_url: nullableStringField(body, "coverUrl")
});

const trackFields = (body, creating = false) => compact({
  artist_id: body.artistId === undefined && !creating ? undefined : parsePositiveInteger(body.artistId, "artistId"),
  album_id: optionalId(body, "albumId"),
  title: stringField(body, "title", { required: creating, max: 255 }),
  audio_url: nullableStringField(body, "audioUrl"),
  release_date: nullableStringField(body, "releaseDate", 10),
  stream_count: body.streamCount === undefined ? undefined : Math.max(0, Number.parseInt(body.streamCount, 10) || 0)
});

const getArtists = async (req, res, next) => {
  try {
    const options = {
      ...pagination(req.query),
      search: typeof req.query.search === "string" ? req.query.search.trim() : "",
      genre: typeof req.query.genre === "string" ? req.query.genre.trim() : ""
    };
    const artists = await catalog.listArtists(options);
    res.json({ artists: artists.map(formatArtist), pagination: { limit: options.limit, offset: options.offset } });
  } catch (error) {
    next(error);
  }
};

const getArtist = async (req, res, next) => {
  try {
    const id = parsePositiveInteger(req.params.id, "artist id");
    const artist = await catalog.findArtistById(id);
    if (!artist) return next(httpError(404, "ARTIST_NOT_FOUND", "Artist not found"));
    return res.json({ artist: formatArtist(artist) });
  } catch (error) {
    return next(error);
  }
};

const getGenres = async (req, res, next) => {
  try {
    res.json({ genres: await catalog.listGenres() });
  } catch (error) {
    next(error);
  }
};

const getEvents = async (req, res, next) => {
  try {
    const options = { ...pagination(req.query), upcoming: req.query.upcoming === "true" };
    res.json({ events: await catalog.listEvents(options), pagination: { limit: options.limit, offset: options.offset } });
  } catch (error) {
    next(error);
  }
};

const getAlbums = async (req, res, next) => {
  try {
    const options = { ...pagination(req.query), artistId: parsePositiveInteger(req.query.artistId, "artistId", { optional: true }) };
    res.json({ albums: await catalog.listAlbums(options), pagination: { limit: options.limit, offset: options.offset } });
  } catch (error) {
    next(error);
  }
};

const getTracks = async (req, res, next) => {
  try {
    const options = {
      ...pagination(req.query),
      artistId: parsePositiveInteger(req.query.artistId, "artistId", { optional: true }),
      albumId: parsePositiveInteger(req.query.albumId, "albumId", { optional: true })
    };
    res.json({ tracks: await catalog.listTracks(options), pagination: { limit: options.limit, offset: options.offset } });
  } catch (error) {
    next(error);
  }
};

const createResource = (create, fields) => (req, res, next) => runMutation(next, async () => {
  const id = await create(fields(req.body, true));
  res.status(201).json({ id });
});

const updateResource = (update, fields, label) => (req, res, next) => runMutation(next, async () => {
  const id = parsePositiveInteger(req.params.id, `${label} id`);
  const values = fields(req.body, false);
  if (Object.keys(values).length === 0) throw httpError(400, "VALIDATION_ERROR", "At least one field is required");
  if (!await update(id, values)) throw httpError(404, "RESOURCE_NOT_FOUND", `${label} not found`);
  res.json({ id, updated: true });
});

const deleteResource = (remove, label) => (req, res, next) => runMutation(next, async () => {
  const id = parsePositiveInteger(req.params.id, `${label} id`);
  if (!await remove(id)) throw httpError(404, "RESOURCE_NOT_FOUND", `${label} not found`);
  res.status(204).end();
});

const getResource = (find, label, responseKey) => async (req, res, next) => {
  try {
    const id = parsePositiveInteger(req.params.id, `${label} id`);
    const resource = await find(id);
    if (!resource) return next(httpError(404, "RESOURCE_NOT_FOUND", `${label} not found`));
    return res.json({ [responseKey]: resource });
  } catch (error) {
    return next(error);
  }
};

const genreFields = (body, creating = false) => compact({
  name: stringField(body, "name", { required: creating, max: 80 })
});

const createArtist = createResource(catalog.createArtist, artistFields);
const updateArtist = updateResource(catalog.updateArtist, artistFields, "Artist");
const deleteArtist = deleteResource(catalog.deleteArtist, "Artist");
const createGenre = createResource(catalog.createGenre, genreFields);
const updateGenre = updateResource(catalog.updateGenre, genreFields, "Genre");
const deleteGenre = deleteResource(catalog.deleteGenre, "Genre");
const createEvent = createResource(catalog.createEvent, eventFields);
const updateEvent = updateResource(catalog.updateEvent, eventFields, "Event");
const deleteEvent = deleteResource(catalog.deleteEvent, "Event");
const createAlbum = createResource(catalog.createAlbum, albumFields);
const updateAlbum = updateResource(catalog.updateAlbum, albumFields, "Album");
const deleteAlbum = deleteResource(catalog.deleteAlbum, "Album");
const createTrack = createResource(catalog.createTrack, trackFields);
const updateTrack = updateResource(catalog.updateTrack, trackFields, "Track");
const deleteTrack = deleteResource(catalog.deleteTrack, "Track");
const getGenre = getResource(catalog.findGenreById, "Genre", "genre");
const getEvent = getResource(catalog.findEventById, "Event", "event");
const getAlbum = getResource(catalog.findAlbumById, "Album", "album");
const getTrack = getResource(catalog.findTrackById, "Track", "track");

export {
  createAlbum, createArtist, createEvent, createGenre, createTrack,
  deleteAlbum, deleteArtist, deleteEvent, deleteGenre, deleteTrack,
  getAlbum, getAlbums, getArtist, getArtists, getEvent, getEvents,
  getGenre, getGenres, getTrack, getTracks,
  updateAlbum, updateArtist, updateEvent, updateGenre, updateTrack
};
