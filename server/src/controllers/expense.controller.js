import Expense from "../models/expenseModel.js";
import mongoose from "mongoose";

export const addExpense = async (req, res) => {
    try {
        const { amount, description, date } = req.body;

        if (!amount || !description) {
            return res.status(400).json({ message: "Amount and description are required" });
        }

        const expenseDate = date ? new Date(date) : new Date();

        const expense = await Expense.create({
            userId: req.user._id,
            amount: Number(amount),
            description,
            date: expenseDate
        });

        res.status(201).json({
            message: "Expense added successfully",
            expense
        });

    } catch (error) {
        console.error("Error adding expense:", error);
        res.status(500).json({ message: "Server error while adding expense" });
    }
};

export const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ userId: req.user._id })
            .sort({ date: -1 })
            .limit(100); 

        res.status(200).json({
            count: expenses.length,
            expenses
        });
    } catch (error) {
        console.error("Error getting expenses:", error);
        res.status(500).json({ message: "Server error while fetching expenses" });
    }
};

export const getExpensesSummary = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        const startOfThisYear = new Date(now.getFullYear(), 0, 1);

        const summaryPipeline = [
            { $match: { userId: userId } },
            {
                $facet: {
                    overall: [
                        { $group: { _id: null, total: { $sum: "$amount" } } }
                    ],
                    thisMonth: [
                        { $match: { date: { $gte: startOfThisMonth } } },
                        { $group: { _id: null, total: { $sum: "$amount" } } }
                    ],
                    lastMonth: [
                        { $match: { date: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
                        { $group: { _id: null, total: { $sum: "$amount" } } }
                    ],
                    thisYear: [
                        { $match: { date: { $gte: startOfThisYear } } },
                        { $group: { _id: null, total: { $sum: "$amount" } } }
                    ]
                }
            },
            {
                $project: {
                    overall: { $ifNull: [{ $arrayElemAt: ["$overall.total", 0] }, 0] },
                    thisMonth: { $ifNull: [{ $arrayElemAt: ["$thisMonth.total", 0] }, 0] },
                    lastMonth: { $ifNull: [{ $arrayElemAt: ["$lastMonth.total", 0] }, 0] },
                    thisYear: { $ifNull: [{ $arrayElemAt: ["$thisYear.total", 0] }, 0] },
                }
            }
        ];

        const result = await Expense.aggregate(summaryPipeline);
        const summary = result[0] || {
            overall: 0,
            thisMonth: 0,
            lastMonth: 0,
            thisYear: 0
        };
        res.status(200).json({ summary });

    } catch (error) {
        console.error("Error generating expense summary:", error);
        res.status(500).json({ message: "Server error while summarizing expenses" });
    }
};
