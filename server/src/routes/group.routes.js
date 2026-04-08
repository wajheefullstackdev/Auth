import { Router } from "express";
import * as groupControllers from "../controllers/group.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const groupRoutes = Router();

// All group routes are protected
groupRoutes.use(protect);

groupRoutes.post("/", groupControllers.createGroup);
groupRoutes.get("/", groupControllers.getGroups);
groupRoutes.get("/:id", groupControllers.getGroupDetails);

groupRoutes.post("/:id/expenses", groupControllers.addGroupExpense);
groupRoutes.get("/:id/expenses", groupControllers.getGroupExpenses);

groupRoutes.get("/:id/settlements", groupControllers.getGroupSettlements);
groupRoutes.get("/:id/settlement-records", groupControllers.getGroupSettlementRecords);
groupRoutes.post("/:id/settlements/record", groupControllers.recordSettlement);
groupRoutes.patch("/settlements/:settlementId/pay", groupControllers.markSettlementPaid);

groupRoutes.get("/:id/activity", groupControllers.getGroupActivity);

export default groupRoutes;

