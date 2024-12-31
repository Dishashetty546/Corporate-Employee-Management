import express from "express";
import con from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"; // or bcryptjs if you are using that

const router = express.Router();

//employee login logic
router.post("/employee_login", (req, res) => {
  const sql = "SELECT * FROM employee WHERE email = ?";
  con.query(sql, [req.body.email], (err, result) => {
    if (err) return res.json({ loginStatus: false, Error: "Query error" });

    if (result.length > 0) {
      console.log("Received email:", req.body.email);
      console.log("Received password:", req.body.password);
      console.log("Stored hashed password:", result[0].password);

      bcrypt.compare(req.body.password, result[0].password, (err, response) => {
        if (err)
          return res.json({ loginStatus: false, Error: "Wrong Password" });

        if (response) {
          const email = result[0].email;
          const token = jwt.sign(
            { role: "employee", email: email, id: result[0].id },
            "jwt_secret_key",
            { expiresIn: "1d" }
          );
          res.cookie("token", token, { httpOnly: true, secure: false }); // Setting cookie with HttpOnly flag
          return res.json({ loginStatus: true, id: result[0].id });
        } else {
          return res.json({ loginStatus: false, Error: "Incorrect password" });
        }
      });
    } else {
      return res.json({
        loginStatus: false,
        Error: "No user found with this email",
      });
    }
  });
});

// Get employee details
router.get("/detail/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM employee WHERE id = ?";
  con.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false });
    return res.json(result);
  });
});

// Logout route (clears cookie)  -- clearing cookies from browser developers tool
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ Status: true });
});

export { router as EmployeeRouter };
