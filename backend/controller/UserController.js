import User from "../models/user.model.js";
import fallbackDb from "../config/fallbackDb.js";
import Uploadoncloudinary from "../config/Cloudinary.js";
import e, { response } from "express";
import geminiResponse from "../Gemini.js";
import moment from "moment/moment.js";

export const getcurrentUser = async (req, res) => {
    try {
        const userId = req.user && (req.user.id || req.user._id || req.user);
        let user = null;
        try {
            user = await User.findById(userId).select("-password -__v");
        } catch (e) {
            user = await fallbackDb.findUserById(userId);
        }
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ user });
    } catch (error) {
        return res.status(500).json({ message: "get current user error" });
    }
};

// Update or set the user's assistant (object with name, image, description)
export const UpdateAssistent = async (req, res) => {
    try {
        const userId = req.user.id;
        const { assistantName, assistantImage, description } = req.body;
        let imageUrl = null;

        if (req.file) {
            imageUrl = await Uploadoncloudinary(req.file.path);
            if (!imageUrl) {
                return res.status(500).json({ message: "Image upload failed" });
            }
        }

        if (!assistantName || assistantName.trim() === '' ||
            (!imageUrl && (!assistantImage || assistantImage === 'null' || assistantImage === 'undefined' || assistantImage.trim() === '')) ||
            !description || description.trim() === '') {
            return res.status(400).json({ message: "Assistant name, image, and description are required." });
        }

        let finalAssistantImage = imageUrl || assistantImage;
        // If the image is a local file path (starts with /src or /assets), allow it (frontend will resolve)
        if (finalAssistantImage && (finalAssistantImage.startsWith('/src') || finalAssistantImage.startsWith('/assets'))) {
            // No transformation needed for Vite/React static assets
        }

        const safeDescription = (description && description.trim()) ? description.trim() : 'A creative and friendly assistant for your daily needs.';
        const updateData = {
            assistantName: assistantName.trim(),
            assistantImage: finalAssistantImage,
            description: safeDescription,
            assistantUpdatedAt: new Date(),
        };

        let user = null;
        try {
            user = await User.findByIdAndUpdate(
                userId,
                updateData,
                { new: true, runValidators: true }
            ).select("-password -__v");
        } catch (e) {
            user = await fallbackDb.updateUser(userId, updateData);
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ user });
    } catch (error) {
        return res.status(500).json({ message: "Update assistant error", error: error.message });
    }
};
export const askToAssistant = async (req, res) => {
    try {
        console.log('[askToAssistant] request received');
        // store last timings in-memory for health endpoint
        if (!global.__lastTimings__) global.__lastTimings__ = {};
        global.__lastTimings__.lastRequestAt = new Date().toISOString();
        const __startTotal = Date.now();
        const { command } = req.body;
        let user = null;
        try {
            // If Mongoose is not connected, use fallback DB immediately to avoid per-request connection delays
            if (require('mongoose').connection && require('mongoose').connection.readyState === 1) {
                user = await User.findById(req.user.id);
            } else {
                user = await fallbackDb.findUserById(req.user.id);
            }
        } catch (e) {
            user = await fallbackDb.findUserById(req.user.id);
        }
            if (!user) {
                // If running locally and x-dev-user-id was used, create a transient dev user object
                if (process.env.NODE_ENV !== 'production' && req.headers['x-dev-user-id']) {
                    user = {
                        _id: req.headers['x-dev-user-id'],
                        id: req.headers['x-dev-user-id'],
                        name: 'Dev User',
                        assistantName: 'Local Assistant',
                        assistantImage: null,
                        description: 'Temporary developer user'
                    };
                } else {
                    return res.status(404).json({ response: "User not found" });
                }
            }
            const userName = user.name;
            const assistantName = user.assistantName;
        const __startProvider = Date.now();
        const result = await geminiResponse(command, assistantName, userName);
        const __endProvider = Date.now();
        global.__lastTimings__.lastProviderMs = __endProvider - __startProvider;
        // Directly return the result object from geminiResponse
        if (!result || !result.response) {
                console.timeEnd(`[askToAssistant] total`);
            return res.status(400).json({ response: "Sorry, I can't understand." });
        }
            const __endTotal = Date.now();
            global.__lastTimings__.lastTotalMs = __endTotal - __startTotal;
            console.log('[askToAssistant] sending response', { providerMs: global.__lastTimings__.lastProviderMs, totalMs: global.__lastTimings__.lastTotalMs });
        return res.json(result);
    } catch (error) {
            console.error('[askToAssistant] error', error);
            try { global.__lastTimings__.lastError = error && error.message ? error.message : String(error); } catch (e) {}
        return res.status(500).json({ response: "An error occurred while processing your request", error: error.message });
    }
}

export const getLastTimings = (req, res) => {
    return res.json({ timings: global.__lastTimings__ || null });
};