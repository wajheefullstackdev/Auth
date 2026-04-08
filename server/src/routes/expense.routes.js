import { Router } from "express";
import { addExpense, getExpenses, getExpensesSummary } from "../controllers/expense.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const expenseRoutes = Router();

expenseRoutes.use(protect);

expenseRoutes.route("/") .post(addExpense) .get(getExpenses);

expenseRoutes.get("/summary", getExpensesSummary);

export default expenseRoutes;
