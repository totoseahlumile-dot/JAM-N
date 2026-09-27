import * as searchModel from "../models/search.model.js";
import httpError from "../utils/httpError.js";

const supportedTypes = ["artists", "albums", "tracks", "events", "users"];

const search = async (req, res, next) => {
  try {
    const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (query.length < 2 || query.length > 100) throw httpError(400, "INVALID_SEARCH_QUERY", "q must contain 2 to 100 characters");
    const types = req.query.types
      ? [...new Set(String(req.query.types).split(",").map((type) => type.trim()).filter(Boolean))]
      : supportedTypes;
    if (!types.length || types.some((type) => !supportedTypes.includes(type))) {
      throw httpError(400, "INVALID_SEARCH_TYPE", `types may contain only: ${supportedTypes.join(", ")}`);
    }
    const parsedLimit = Number(req.query.limit ?? 10);
    if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 25) throw httpError(400, "INVALID_SEARCH_LIMIT", "limit must be between 1 and 25");
    const results = await searchModel.search({ term: query, types, limit: parsedLimit });
    res.json({ query, results });
  } catch (error) { next(error); }
};

export { search };
