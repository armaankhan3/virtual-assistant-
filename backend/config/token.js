import jwt from "jsonwebtoken";

const genToken = (userId) => {
  try {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "10d",
    });
  } catch (error) {
    console.error("genToken error:", error);
    return null;
  }
};

export default genToken;