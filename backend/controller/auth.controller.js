import gentoken from "../config/token.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

const sanitizeUser = (user) => {
    if (!user) return null;
    const { password, __v, ...rest } = user.toObject ? user.toObject() : user;
    return rest;
};

const login = async (req, res) => {
    try {
        let { email, password } = req.body;
        console.log('LOGIN ATTEMPT:', { email, password }); // Log incoming signin data
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        email = email.trim();
        password = password.trim();

        const user = await User.findOne({ email });
        if (!user) {
            console.log('LOGIN FAILED: Email does not exist');
            return res.status(400).json({ message: "Email does not exist!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('LOGIN FAILED: Incorrect password');
            return res.status(400).json({ message: "Incorrect password" });
        }
        const token = gentoken(user._id);

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "none", // Required for cross-site cookie
            secure: true,     // Required for HTTPS
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Return safe user info only
        const safeUser = sanitizeUser(user);
        console.log('LOGIN SUCCESS:', safeUser);
        res.status(200).json({ user: safeUser, message: "Login successful" });

    } catch (error) {
        console.log('LOGIN ERROR:', error);
        return res.status(500).json({ message: `Login error: ${error.message}` });
    }
};

const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "Strict",
            secure: process.env.NODE_ENV === "production",
        });
        return res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        return res.status(500).json({ message: `Logout error: ${error.message}` });
    }
};

const signup = async (req, res) => {
    try {
        let { name, email, password } = req.body;
        console.log('SIGNUP ATTEMPT:', { name, email, password }); // Log incoming signup data
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        name = name.trim();
        email = email.trim();
        password = password.trim();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('SIGNUP FAILED: Email already registered');
            return res.status(400).json({ message: "Email already registered" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ name, email, password: hashedPassword });
        console.log('SIGNUP SUCCESS:', sanitizeUser(newUser));
        const safeUser = sanitizeUser(newUser);
        return res.status(201).json({ user: safeUser, message: "Signup successful" });
    } catch (error) {
        console.log('SIGNUP ERROR:', error);
        return res.status(500).json({ message: `Signup error: ${error.message}` });
    }
};

export { signup, login, logout };
