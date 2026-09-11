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

export { getAlbums, getArtist, getArtists, getEvents, getGenres, getTracks };
