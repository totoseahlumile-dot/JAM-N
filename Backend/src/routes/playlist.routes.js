import express from "express";
import * as controller from "../controllers/playlist.controller.js";
import authenticate from "../middleware/authenticate.js";
import optionalAuthenticate from "../middleware/optionalAuthenticate.js";

const router = express.Router();
router.get("/playlists", controller.getPublic);
router.get("/playlists/mine", authenticate, controller.getMine);
router.get("/playlists/:id", optionalAuthenticate, controller.getOne);
router.post("/playlists", authenticate, controller.create);
router.put("/playlists/:id", authenticate, controller.update);
router.delete("/playlists/:id", authenticate, controller.remove);
router.post("/playlists/:id/tracks", authenticate, controller.addTrack);
router.delete("/playlists/:id/tracks/:trackId", authenticate, controller.removeTrack);
router.put("/playlists/:id/tracks/order", authenticate, controller.reorder);
export default router;
