const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const incomeController = require("../controllers/incomeController");

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

router.get("/profile", authMiddleware, incomeController.getProfile);
router.get("/overview", authMiddleware, incomeController.getOverview);
router.get("/summary", authMiddleware, incomeController.getSummary);
router.get("/export", authMiddleware, incomeController.exportIncome);
router.post("/", authMiddleware, incomeController.addIncome);
router.delete("/:id", authMiddleware, incomeController.deleteIncome);
router.put("/:id", authMiddleware, incomeController.updateIncome);

module.exports = router;
