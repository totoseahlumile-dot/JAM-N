import express from "express";
import * as catalogController from "../controllers/catalog.controller.js";

const router = express.Router();

router.get("/artists", catalogController.getArtists);
router.get("/artists/:id", catalogController.getArtist);
router.get("/genres", catalogController.getGenres);
router.get("/events", catalogController.getEvents);
router.get("/albums", catalogController.getAlbums);
router.get("/tracks", catalogController.getTracks);

export default router;
