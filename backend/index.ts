import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./src/routes/user.route";
import videoRouter from "./src/routes/video.routes";
import tweetRouter from "./src/routes/tweet.route";
import subscriptionRouter from "./src/routes/subscription.route";
import commentRouter from "./src/routes/comment.route";
import likeRouter from "./src/routes/like.route";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);

app.listen(process.env.PORT, () => {
  console.log(` Server is running at port: ${process.env.PORT}`);
});
