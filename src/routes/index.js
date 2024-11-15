import Router from "express";
import pingRoutes from "./ping";
import productRoutes from "./productRoute";


const router = Router();

router.use("/ping", pingRoutes);

router.use("/product", productRoutes); // Register the messages routes for chat

export default router;

