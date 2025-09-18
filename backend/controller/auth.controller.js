import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import genToken from "../config/Token.js";
import fallbackDb from "../config/fallbackDb.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log('Signup request body:', req.body);

    if (!name || !email || !password) {
      console.log('Missing fields:', { name, email, password });
      return res.status(400).json({ message: "All fields are required" });
    }

    let existEmail = null;
    try {
      existEmail = await User.findOne({ email });
    } catch (e) {
      existEmail = await fallbackDb.findUserByEmail(email);
    }
    if (existEmail) {
      console.log('Email already exists:', email);
      return res.status(400).json({ message: "Email already exists" });
    }

    if (password.length < 8) {
      console.log('Password too short:', password);
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    let user;
    try {
      user = await User.create({ name, email, password: hashedPassword });
    } catch (e) {
      user = await fallbackDb.createUser({ name, email, password: hashedPassword });
    }

  const token = genToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 365 * 24 * 60 * 60 * 1000, // Extended to 1 year
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: "none",
    });

    // Return token and user for frontend convenience
    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: `Sign up error: ${error.message}` });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user;
    try {
      user = await User.findOne({ email });
    } catch (e) {
      user = await fallbackDb.findUserByEmail(email);
    }
    if (!user) {
      return res.status(400).json({ message: "Email does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const token = genToken(user._id);
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 365 * 24 * 60 * 60 * 1000, // Extended to 1 year
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
        });
        console.log("Login: Set-Cookie token:", token);
        console.log("Login: Cookie options:", {
            httpOnly: true,
            maxAge: 365 * 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
        });
        console.log("Login: Request cookies before response:", req.cookies);
    // Return token so frontend can store it if needed
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(500).json({ message: `Login error: ${error.message}` });
  }
};
export const logout = (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: `Logout error: ${error.message}` });
  }
};

// Backwards-compatible aliases (if any other files import old names)
export { signup as signUp, login as LogIn, logout as LogOut };