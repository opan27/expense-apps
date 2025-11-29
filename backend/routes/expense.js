const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const expenseController = require("../controllers/expenseController");

const JWT_SECRET = process.env.JWT_SECRET;
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.sendStatus(401);
  const token = authHeader.split(" ")[1];
  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch {
    return res.sendStatus(403);
  }
}

router.get("/overview", authMiddleware, expenseController.getOverview);
router.get("/profile", authMiddleware, expenseController.getProfile);
router.get("/summary", authMiddleware, expenseController.getSummary);
router.get("/export", authMiddleware, expenseController.exportExpense);
router.post("/", authMiddleware, expenseController.addExpense);
router.delete("/:id", authMiddleware, expenseController.deleteExpense);
router.put("/:id", authMiddleware, expenseController.updateExpense);

module.exports = router;
