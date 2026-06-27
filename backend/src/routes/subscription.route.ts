import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller";

const router = Router();

router.route("/c/:channelId").get(verifyJWT, getSubscribedChannels);
router.route("/c/:channelId").post(verifyJWT, toggleSubscription);

router.route("/u/:subscriberId").get(verifyJWT, getUserChannelSubscribers);

export default router;
