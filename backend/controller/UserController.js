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
        // Use correct field names from frontend
        const { assistantName, assistantImage, description } = req.body;
        let imageUrl = null;

        // If image uploaded, upload to Cloudinary
        if (req.file) {
            imageUrl = await Uploadoncloudinary(req.file.path);
            if (!imageUrl) {
                return res.status(500).json({ message: "Image upload failed" });
            }
        }

        // Log assistantName and assistantImage for debugging
        console.log('ASSISTANT UPDATE:', {
            assistantName,
            assistantImage: imageUrl || assistantImage
        });

        // Accept either all fields or error
        // Accept both file upload (imageUrl) and direct image URL (assistantImage)
        // Accept empty string as invalid for all fields
        if (!assistantName || assistantName.trim() === '' ||
            (!imageUrl && (!assistantImage || assistantImage === 'null' || assistantImage === 'undefined' || assistantImage.trim() === '')) ||
            !description || description.trim() === '') {
            return res.status(400).json({ message: "Assistant name, image, and description are required." });
        }

        // If assistantImage is a URL (from frontend), use it directly. If imageUrl (from upload), use that.
        let finalAssistantImage = imageUrl || assistantImage;
        // If the image is a local file path (starts with /src or /assets), allow it (frontend will resolve)
        if (finalAssistantImage && (finalAssistantImage.startsWith('/src') || finalAssistantImage.startsWith('/assets'))) {
            // No transformation needed for Vite/React static assets
        }

        // Optionally: store a timestamp for assistant update
        const updateData = {
            assistantName: assistantName.trim(),
            assistantImage: finalAssistantImage,
            description: description.trim(),
            assistantUpdatedAt: new Date(),
        };

        // Update the user's assistantName, assistantImage, and description fields
        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select("-password -__v");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Log the updated assistant data for debugging
        console.log('Assistant updated:', {
            assistantName: user.assistantName,
            assistantImage: user.assistantImage,
            description: user.description,
            userId: user._id
        });

        return res.status(200).json({ user });
    } catch (error) {
        return res.status(500).json({ message: "Update assistant error", error: error.message });
    }
};
export const askToAssistant = async (req, res) => {
    try {
        const { command } = req.body;
        // Fix: use correct user fetching and variable names
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ response: "User not found" });
        }
        const userName = user.name;
        const assistantName = user.assistantName;
        const result = await geminiResponse(command, assistantName, userName);

        // Try to parse JSON from Gemini response
        let gemResult;
        try {
            // Try to extract JSON block if present
            const jsonMatch = result.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch) {
                gemResult = JSON.parse(jsonMatch[1]);
            } else {
                gemResult = JSON.parse(result);
            }
        } catch (err) {
            return res.status(400).json({ response: "Sorry, I can't understand." });
        }
        const type = gemResult.type;

        switch (type) {
            case "get_date":
            case "get-date":
                return res.json({
                    type: "get-date",
                    response: `Today is ${moment().format("MMMM Do YYYY")}`,
                    responseText: `Today is ${moment().format("MMMM Do YYYY")}`
                });
            case "get_day":
            case "get-day":
                return res.json({
                    type: "get-day",
                    response: `Today is ${moment().format("dddd")}`,
                    responseText: `Today is ${moment().format("dddd")}`
                });
            case "get_month":
            case "get-month":
                return res.json({
                    type: "get-month",
                    response: `Current month is ${moment().format("MMMM")}`,
                    responseText: `Current month is ${moment().format("MMMM")}`
                });
            case "get_time":
            case "get-time":
                return res.json({
                    type: "get-time",
                    response: `Current time is ${moment().format("hh:mm A")}`,
                    responseText: `Current time is ${moment().format("hh:mm A")}`
                });
            case "general":
            case "google_search":
            case "youtube_search":
            case "youtube_play":
            case "calculator_open":
            case "instagram_open":
            case "facebook_open":
            case "weather_show":
                return res.json({
                    type: type,
                    userinput: gemResult.userinput,
                    response: gemResult.response,
                    responseText: gemResult.responseText || gemResult.response
                });
            default:
                return res.status(400).json({ response: "Sorry, I can't understand that command." });
        }
    } catch (error) {
        return res.status(500).json({ response: "An error occurred while processing your request", error: error.message });
    }
}