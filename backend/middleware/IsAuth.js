// import jwt from "jsonwebtoken";
// const isAuth = async (req, res, next) => {
//   try {
//     // console.log("IsAuth - Request path:", req.path);
//     // console.log("IsAuth - Cookies received:", req.cookies);
//     // console.log("IsAuth - Headers:", req.headers);

//     const token = req.cookies.token;
//     console.log(token);
//     if (!token) {
//       return res.status(401).json({ message: "Unauthorized - No token found" });
//     }

//     console.log("IsAuth - Token found:", token);
//     const verifyToken = jwt.verify(token, process.env.JWT_SECRET);

//     req.UserId = verifyToken.UserId;
//     next();
//   } catch (error) {
//     console.log(error);
//     return res.status(401).json({ message: "Unauthorized" });
//   }
// };
// export default isAuth;

import jwt from "jsonwebtoken";

const isAuth = (req, res, next) => {
  try {
    let token = req.cookies.token;
    // If not in cookies, check Authorization header
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }
    if (!token) {
      // Dev shortcut: allow X-DEV-USER-ID header when not in production
      if (process.env.NODE_ENV !== 'production' && req.headers['x-dev-user-id']) {
        req.user = { id: req.headers['x-dev-user-id'] };
        console.log('IsAuth ⚠️ Using X-DEV-USER-ID for local development:', req.user.id);
        return next();
      }
      return res.status(401).json({ message: "Unauthorized - No token found" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // normalized shape: { id: userId } or other fields
    req.user = decoded;

    console.log("IsAuth ✅ User authenticated:", req.user);
    next();
  } catch (error) {
    console.error("IsAuth ❌ JWT verification failed:", error.message);
    // As a last resort in non-production, allow dev header if present
    if (process.env.NODE_ENV !== 'production' && req.headers['x-dev-user-id']) {
      req.user = { id: req.headers['x-dev-user-id'] };
      console.log('IsAuth ⚠️ Using X-DEV-USER-ID for local development after JWT error:', req.user.id);
      return next();
    }
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};

export default isAuth;