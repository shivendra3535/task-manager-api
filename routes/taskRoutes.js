const express = require("express");

const router = express.Router();

const protect = require(
  "../middleware/authMiddleware"
);

const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require(
  "../controllers/taskController"
);

router.use(protect);

router.post("/", createTask);

router.get("/", getTasks);

router.get("/:id", getTaskById);

router.patch("/:id", updateTask);
router.put("/:id", updateTask);
router.post("/:id", updateTask);

router.delete("/:id", deleteTask);

module.exports = router;