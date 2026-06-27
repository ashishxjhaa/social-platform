import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controller";

const router = Router();

router.route("/:videoId").get(verifyJWT, getVideoComments);
router.route("/:videoId").post(verifyJWT, addComment);

router.route("/c/:commentId").patch(verifyJWT, updateComment);
router.route("/c/:commentId").delete(verifyJWT, deleteComment);

export default router;
