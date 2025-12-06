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
// >>> semua route di bawah ini wajib lewat auth
router.use(authMiddleware);

// SEKARANG semua sudah punya req.user
router.post("/pay-installment/:id", expenseController.payInstallment);
router.get("/overview", expenseController.getOverview);
router.get("/profile", expenseController.getProfile);
router.get("/summary", expenseController.getSummary);
router.get("/export", expenseController.exportExpense);
router.post("/", expenseController.addExpense);
router.delete("/:id", expenseController.deleteExpense);
router.put("/:id", expenseController.updateExpense);

module.exports = router;
