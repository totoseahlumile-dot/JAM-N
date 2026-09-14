import express from "express";
import * as followController from "../controllers/follow.controller.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.get("/users/:userId/followers", followController.getUserFollowers);
router.get("/users/:userId/following", followController.getUserFollowing);
router.get("/users/:userId/follow-stats", followController.getUserStats);
router.put("/users/:userId/follow", authenticate, followController.followUser);
router.delete("/users/:userId/follow", authenticate, followController.unfollowUser);

router.get("/artists/:artistId/followers", followController.getArtistFollowers);
router.get("/artists/:artistId/follow-stats", followController.getArtistStats);
router.put("/artists/:artistId/follow", authenticate, followController.followArtist);
router.delete("/artists/:artistId/follow", authenticate, followController.unfollowArtist);

router.get("/follows", authenticate, followController.getMyFollows);

export default router;
