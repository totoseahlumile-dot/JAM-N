import express from "express";
import * as catalogController from "../controllers/catalog.controller.js";
import authenticate from "../middleware/authenticate.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import {
  authorizeArtistOwnership,
  authorizeResourceOwnership,
  bindNewArtistToUser
} from "../middleware/authorizeCatalogOwnership.js";

const router = express.Router();

router.get("/artists", catalogController.getArtists);
router.get("/artists/:id", catalogController.getArtist);
router.get("/genres", catalogController.getGenres);
router.get("/genres/:id", catalogController.getGenre);
router.get("/events", catalogController.getEvents);
router.get("/events/:id", catalogController.getEvent);
router.get("/albums", catalogController.getAlbums);
router.get("/albums/:id", catalogController.getAlbum);
router.get("/tracks", catalogController.getTracks);
router.get("/tracks/:id", catalogController.getTrack);

// Reads above are public. Every write below first verifies the JWT and then
// enforces the roles allowed to change that category of catalog data.
const musicEditors = [authenticate, authorizeRoles("artist", "admin")];
const admins = [authenticate, authorizeRoles("admin")];

router.post("/artists", ...musicEditors, bindNewArtistToUser, catalogController.createArtist);
router.put("/artists/:id", ...musicEditors, authorizeArtistOwnership(), catalogController.updateArtist);
router.delete("/artists/:id", ...musicEditors, authorizeArtistOwnership(), catalogController.deleteArtist);

router.post("/genres", ...admins, catalogController.createGenre);
router.put("/genres/:id", ...admins, catalogController.updateGenre);
router.delete("/genres/:id", ...admins, catalogController.deleteGenre);

router.post("/events", ...admins, catalogController.createEvent);
router.put("/events/:id", ...admins, catalogController.updateEvent);
router.delete("/events/:id", ...admins, catalogController.deleteEvent);

router.post(
  "/albums",
  ...musicEditors,
  authorizeArtistOwnership({ source: "body", key: "artistId" }),
  catalogController.createAlbum
);
router.put("/albums/:id", ...musicEditors, authorizeResourceOwnership("album"), catalogController.updateAlbum);
router.delete("/albums/:id", ...musicEditors, authorizeResourceOwnership("album"), catalogController.deleteAlbum);

router.post(
  "/tracks",
  ...musicEditors,
  authorizeArtistOwnership({ source: "body", key: "artistId" }),
  catalogController.createTrack
);
router.put("/tracks/:id", ...musicEditors, authorizeResourceOwnership("track"), catalogController.updateTrack);
router.delete("/tracks/:id", ...musicEditors, authorizeResourceOwnership("track"), catalogController.deleteTrack);

export default router;
