import express from "express";
import * as clientController from "../controller/clientController.js";
import { authRequired } from "../middleware/authMiddleware.js"; // pastikan punya middleware ini


const router = express.Router();
// Routes untuk client - basic CRUD only
router.get("/", clientController.getAllClients);
// routes profile client
router.get("/profile", clientController.getClientProfile);
router.get("/active", clientController.getActiveClients);
router.get("/:client_id", clientController.getClientById);
router.put("/:client_id", clientController.updateClient);
router.delete("/:client_id", clientController.deleteClient);
router.get("/:client_id/users", authRequired, clientController.getUsers);
// NOTE: Instagram/TikTok post endpoints removed - web dashboard features
router.get("/:client_id/summary", authRequired, clientController.getSummary);
// NOTE: Satbinmas official account endpoints removed - web dashboard features

// Profil client

export default router;
