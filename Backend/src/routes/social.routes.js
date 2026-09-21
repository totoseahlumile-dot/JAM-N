import express from "express";
import * as socialController from "../controllers/social.controller.js";
import authenticate from "../middleware/authenticate.js";
import authorizeSocialOwnership from "../middleware/authorizeSocialOwnership.js";

const router = express.Router();

router.get("/posts", socialController.getPosts);
router.get("/posts/:id", socialController.getPost);
router.post("/posts", authenticate, socialController.createPost);
router.put("/posts/:id", authenticate, authorizeSocialOwnership("post"), socialController.updatePost);
router.delete("/posts/:id", authenticate, authorizeSocialOwnership("post"), socialController.deletePost);

router.put("/posts/:postId/like", authenticate, socialController.likePost);
router.delete("/posts/:postId/like", authenticate, socialController.unlikePost);

router.get("/posts/:postId/comments", socialController.getComments);
router.post("/posts/:postId/comments", authenticate, socialController.createComment);
router.put("/comments/:id", authenticate, authorizeSocialOwnership("comment"), socialController.updateComment);
router.delete("/comments/:id", authenticate, authorizeSocialOwnership("comment"), socialController.deleteComment);

export default router;
