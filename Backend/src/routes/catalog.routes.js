import express from "express";
import * as catalogController from "../controllers/catalog.controller.js";
import authenticate from "../middleware/authenticate.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

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

const musicEditors = [authenticate, authorizeRoles("artist", "admin")];
const admins = [authenticate, authorizeRoles("admin")];

router.post("/artists", ...musicEditors, catalogController.createArtist);
router.put("/artists/:id", ...musicEditors, catalogController.updateArtist);
router.delete("/artists/:id", ...musicEditors, catalogController.deleteArtist);

router.post("/genres", ...admins, catalogController.createGenre);
router.put("/genres/:id", ...admins, catalogController.updateGenre);
router.delete("/genres/:id", ...admins, catalogController.deleteGenre);

router.post("/events", ...admins, catalogController.createEvent);
router.put("/events/:id", ...admins, catalogController.updateEvent);
router.delete("/events/:id", ...admins, catalogController.deleteEvent);

router.post("/albums", ...musicEditors, catalogController.createAlbum);
router.put("/albums/:id", ...musicEditors, catalogController.updateAlbum);
router.delete("/albums/:id", ...musicEditors, catalogController.deleteAlbum);

router.post("/tracks", ...musicEditors, catalogController.createTrack);
router.put("/tracks/:id", ...musicEditors, catalogController.updateTrack);
router.delete("/tracks/:id", ...musicEditors, catalogController.deleteTrack);

export default router;
