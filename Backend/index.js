import express from "express";
import cors from "cors";
import { adminRouter } from "./Routes/AdminRoute.js";
import { EmployeeRouter } from "./Routes/EmployeeRoute.js";
import Jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const app = express();

// CORS Configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Middleware to parse JSON and cookies
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/auth", adminRouter);
app.use("/employee", EmployeeRouter);

// Static files (optional, in case you have any static content)
app.use(express.static("Public"));

// JWT Verification Middleware
const verifyUser = (req, res, next) => {
  const token = req.cookies.token; // Getting token from cookies

  if (token) {
    Jwt.verify(token, "jwt_secret_key", (err, decoded) => {
      if (err) return res.json({ Status: false, Error: "Invalid Token" });
      req.id = decoded.id;
      req.role = decoded.role;
      next();
    });
  } else {
    return res.json({ Status: false, Error: "Not Authenticated" });
  }
};

// Protected route to verify the user (only accessible if authenticated)
app.get("/verify", verifyUser, (req, res) => {
  return res.json({ Status: true, role: req.role, id: req.id });
});

// Server listening on port 3000
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
