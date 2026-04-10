const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const generateToken = require(
  "../utils/generateToken"
);

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

const registerUser = async (
  req,
  res,
  next
) => {
  try {
    const rawEmail = req.body.email;
    const password = req.body.password;

    if (
      !rawEmail ||
      !password ||
      typeof rawEmail !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const email = normalizeEmail(rawEmail);
    if (!email) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const userExists =
      await pool.query(
        "SELECT * FROM users WHERE email=$1",
        [email]
      );

    if (userExists.rows.length > 0) {
      return res
        .status(400)
        .json({
          message:
            "User already exists",
        });
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    const newUser =
      await pool.query(
        "INSERT INTO users (email,password) VALUES ($1,$2) RETURNING id,email",
        [email, hashedPassword]
      );

    const token =
      generateToken(
        newUser.rows[0].id
      );

    res.status(201).json({
      token,
      user:
        newUser.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (
  req,
  res,
  next
) => {
  try {
    const rawEmail = req.body.email;
    const password = req.body.password;

    if (
      !rawEmail ||
      !password ||
      typeof rawEmail !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const email = normalizeEmail(rawEmail);
    if (!email) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user =
      await pool.query(
        "SELECT * FROM users WHERE email=$1",
        [email]
      );

    if (
      user.rows.length === 0
    ) {
      return res
        .status(401)
        .json({
          message:
            "Invalid credentials",
        });
    }

    const validPassword =
      await bcrypt.compare(
        password,
        user.rows[0].password
      );

    if (!validPassword) {
      return res
        .status(401)
        .json({
          message:
            "Invalid credentials",
        });
    }

    const token =
      generateToken(
        user.rows[0].id
      );

    res.json({
      token,
      user: { id: user.rows[0].id, email: user.rows[0].email },
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = (
  req,
  res
) => {
  res.json(req.user);
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
};
