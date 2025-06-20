import User from "../models/user.model.js";
import Uploadoncloudinary from "../config/Cloudinary.js";
import e, { response } from "express";
import geminiResponse from "../Gemini.js";
import moment from "moment/moment.js";

export const getcurrentUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password -__v");
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

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select("-password -__v");

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
        const { command } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ response: "User not found" });
        }
        const userName = user.name;
        const assistantName = user.assistantName;
        const result = await geminiResponse(command, assistantName, userName);
        // Directly return the result object from geminiResponse
        if (!result || !result.response) {
            return res.status(400).json({ response: "Sorry, I can't understand." });
        }
        return res.json(result);
    } catch (error) {
        return res.status(500).json({ response: "An error occurred while processing your request", error: error.message });
    }
}