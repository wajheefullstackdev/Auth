import Group from "../models/groupModel.js";
import GroupExpense from "../models/groupExpenseModel.js";
import Settlement from "../models/settlementModel.js";
import User from "../models/usermodel.js";

export async function createGroup(req, res) {
    try {
        const { name, members } = req.body;
        const uniqueMembers = [...new Set([...members, req.user._id.toString()])];

        const group = await Group.create({
            name,
            createdBy: req.user._id,
            members: uniqueMembers
        });

        res.status(201).json({ message: "Group created successfully", group });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error during group creation" });
    }
}

export async function getGroups(req, res) {
    try {
        const groups = await Group.find({ members: req.user._id })
            .select("-__v")
            .populate("members", "username email");

        res.status(200).json({ groups });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error fetching groups" });
    }
}

export async function getGroupDetails(req, res) {
    try {
        const group = await Group.findById(req.params.id)
            .populate("members", "username email")
            .populate("createdBy", "username email");

        if (!group) return res.status(404).json({ message: "Group not found" });

        if (!group.members.some(m => m._id.toString() === req.user._id.toString())) {
            return res.status(403).json({ message: "Not authorized" });
        }

        res.status(200).json({ group });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error fetching group details" });
    }
}

export async function addGroupExpense(req, res) {
    try {
        const { amount, description, paidBy, splitAmong, date } = req.body;
        const groupId = req.params.id;

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: "Group not found" });

        const totalSplit = splitAmong.reduce((acc, curr) => acc + curr.amount, 0);
        if (Math.abs(totalSplit - amount) > 0.01) {
            return res.status(400).json({ message: "Split amounts must equal total amount" });
        }

        const expense = await GroupExpense.create({
            groupId,
            amount,
            description,
            paidBy,
            splitAmong,
            date
        });

        const populated = await expense.populate([
            { path: "paidBy", select: "username" },
            { path: "splitAmong.user", select: "username" }
        ]);

        res.status(201).json({ message: "Group expense added", expense: populated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error adding group expense" });
    }
}

export async function getGroupExpenses(req, res) {
    try {
        const expenses = await GroupExpense.find({ groupId: req.params.id })
            .populate("paidBy", "username")
            .populate("splitAmong.user", "username")
            .sort({ date: -1 });

        res.status(200).json({ expenses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error fetching group expenses" });
    }
}

// Compute net balances and return outstanding settlement pairs
export async function getGroupSettlements(req, res) {
    try {
        const groupId = req.params.id;
        const expenses = await GroupExpense.find({ groupId });

        // Compute raw net balances from expenses
        const balances = {};
        expenses.forEach(exp => {
            const payerId = exp.paidBy.toString();
            balances[payerId] = (balances[payerId] || 0) + exp.amount;

            exp.splitAmong.forEach(split => {
                const debtorId = split.user.toString();
                balances[debtorId] = (balances[debtorId] || 0) - split.amount;
            });
        });

        // Subtract already-paid settlements
        const paidSettlements = await Settlement.find({ groupId, status: "paid" });
        paidSettlements.forEach(s => {
            const fromId = s.from.toString();
            const toId = s.to.toString();
            // When debtor paid, their debt is reduced, creditor's credit is reduced
            balances[fromId] = (balances[fromId] || 0) + s.amount;
            balances[toId] = (balances[toId] || 0) - s.amount;
        });

        const creditors = [];
        const debtors = [];

        for (const [userId, balance] of Object.entries(balances)) {
            if (balance > 0.01) creditors.push({ userId, amount: balance });
            else if (balance < -0.01) debtors.push({ userId, amount: Math.abs(balance) });
        }
g
        const settlements = [];
        let i = 0, j = 0;
          while (i < debtors.length && j < creditors.length) {
            const debtor = debtors[i];
            const creditor = creditors[j];
            const settledAmount = Math.min(debtor.amount, creditor.amount);

            settlements.push({
                from: debtor.userId,
                to: creditor.userId,
                amount: parseFloat(settledAmount.toFixed(2))
            });

            debtor.amount -= settledAmount;
            creditor.amount -= settledAmount;

            if (debtor.amount < 0.01) i++;
            if (creditor.amount < 0.01) j++;
        }

        const populated = await Promise.all(settlements.map(async (s) => {
            const fromUser = await User.findById(s.from).select("username _id");
            const toUser = await User.findById(s.to).select("username _id");
            return { from: fromUser, to: toUser, amount: s.amount };
        }));

        res.status(200).json({ settlements: populated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error calculating settlements" });
    }
}

// Record a settlement (debtor acknowledges they will pay)
export async function recordSettlement(req, res) {
    try {
        const { to, amount } = req.body;
        const groupId = req.params.id;
        const from = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: "Group not found" });

        const existing = await Settlement.findOne({ groupId, from, to, status: "pending" });
        if (existing) {
            return res.status(409).json({ message: "A pending settlement already exists for this pair" });
        }

        const settlement = await Settlement.create({ groupId, from, to, amount, status: "pending" });
        const populated = await settlement.populate([
            { path: "from", select: "username _id" },
            { path: "to", select: "username _id" }
        ]);

        res.status(201).json({ message: "Settlement recorded", settlement: populated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error recording settlement" });
    }
}

// Mark a pending settlement as paid
export async function markSettlementPaid(req, res) {
    try {
        const settlement = await Settlement.findById(req.params.settlementId);
        if (!settlement) return res.status(404).json({ message: "Settlement not found" });

        if (settlement.from.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only the debtor can mark a settlement as paid" });
        }

        if (settlement.status === "paid") {
            return res.status(400).json({ message: "Settlement is already marked as paid" });
        }

        settlement.status = "paid";
        settlement.paidAt = new Date();
        await settlement.save();

        const populated = await settlement.populate([
            { path: "from", select: "username _id" },
            { path: "to", select: "username _id" }
        ]);

        res.status(200).json({ message: "Settlement marked as paid", settlement: populated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error marking settlement paid" });
    }
}

// Unified activity feed: expenses + settlement events, sorted newest first
export async function getGroupActivity(req, res) {
    try {
        const groupId = req.params.id;

        const [expenses, settlements] = await Promise.all([
            GroupExpense.find({ groupId })
                .populate("paidBy", "username _id")
                .populate("splitAmong.user", "username _id")
                .lean(),
            Settlement.find({ groupId })
                .populate("from", "username _id")
                .populate("to", "username _id")
                .lean()
        ]);

        const expenseEvents = expenses.map(e => ({
            type: "expense",
            _id: e._id,
            description: e.description,
            amount: e.amount,
            paidBy: e.paidBy,
            splitAmong: e.splitAmong,
            createdAt: e.createdAt
        }));

        const settlementEvents = settlements.map(s => ({
            type: "settlement",
            _id: s._id,
            from: s.from,
            to: s.to,
            amount: s.amount,
            status: s.status,
            paidAt: s.paidAt,
            createdAt: s.createdAt
        }));

        const activity = [...expenseEvents, ...settlementEvents]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json({ activity });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error fetching activity" });
    }
}

// Get all settlements for a group (pending + paid)
export async function getGroupSettlementRecords(req, res) {
    try {
        const settlements = await Settlement.find({ groupId: req.params.id })
            .populate("from", "username _id")
            .populate("to", "username _id")
            .sort({ createdAt: -1 });

        res.status(200).json({ settlements });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error fetching settlement records" });
    }
}
