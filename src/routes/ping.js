import Router from "express";
import PingController from "../controllers/ping.js";

const router = Router();

router.get("/", PingController.ping);

export default router;
