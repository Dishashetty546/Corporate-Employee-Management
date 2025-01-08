import jwt from "jsonwebtoken";

const authenticate = (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({ Status: false, Error: "Unauthorized" });

  jwt.verify(token, "jwt_secret_key", (err, decoded) => {
    if (err) return res.status(403).json({ Status: false, Error: "Forbidden" });
    req.user = decoded; // Attach decoded user info to request
    next();
  });
};

export default authenticate;
