import express from "express";
import con from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";

const router = express.Router();

// Admin login route
router.post("/adminlogin", (req, res) => {
  const sql = "SELECT * from admin WHERE email = ?";
  con.query(sql, [req.body.email], (err, result) => {
    if (err) return res.json({ loginStatus: false, Error: "Query error" });

    if (result.length > 0) {
      const admin = result[0];

      // Compare passwords using bcrypt
      bcrypt.compare(req.body.password, admin.password, (err, isMatch) => {
        if (err)
          return res.json({
            loginStatus: false,
            Error: "Password comparison error",
          });

        if (isMatch) {
          const token = jwt.sign(
            { role: "admin", email: admin.email, id: admin.id },
            "jwt_secret_key",
            { expiresIn: "1d" }
          );
          res.cookie("token", token);
          return res.json({ loginStatus: true });
        } else {
          return res.json({
            loginStatus: false,
            Error: "Wrong email or password",
          });
        }
      });
    } else {
      return res.json({ loginStatus: false, Error: "Wrong email or password" });
    }
  });
});

// Category retrieval
router.get("/category", (req, res) => {
  const sql = "SELECT * FROM category";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

// Add new category
router.post("/add_category", (req, res) => {
  const sql = "INSERT INTO category (name) VALUES (?)";
  con.query(sql, [req.body.category], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true });
  });
});

// Image upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Public/Images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({
  storage: storage,
});

// Add new employee with image upload
router.post("/add_employee", upload.single("image"), (req, res) => {
  const sql = `INSERT INTO employee 
    (name, email, password, address, salary, image, category_id) 
    VALUES (?)`;

  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err)
      return res.json({ Status: false, Error: "Error hashing password" });

    const values = [
      req.body.name,
      req.body.email,
      hash,
      req.body.address,
      req.body.salary,
      req.file ? req.file.filename : null, // Handle image file conditionally
      req.body.category_id,
    ];

    con.query(sql, [values], (err, result) => {
      if (err) return res.json({ Status: false, Error: err.message });
      return res.json({ Status: true });
    });
  });
});

// Retrieve all employees
router.get("/employee", (req, res) => {
  const sql = "SELECT * FROM employee";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

// Retrieve specific employee by ID
router.get("/employee/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM employee WHERE id = ?";
  con.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

// Edit employee information
router.put("/edit_employee/:id", (req, res) => {
  const id = req.params.id;
  const sql = `UPDATE employee 
    SET name = ?, email = ?, salary = ?, address = ?, category_id = ? 
    WHERE id = ?`;

  const values = [
    req.body.name,
    req.body.email,
    req.body.salary,
    req.body.address,
    req.body.category_id,
  ];

  con.query(sql, [...values, id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

// Delete employee by ID
router.delete("/delete_employee/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM employee WHERE id = ?";
  con.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

// Get the count of admins
router.get("/admin_count", (req, res) => {
  const sql = "SELECT count(id) AS admin FROM admin";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

// Get the count of employees
router.get("/employee_count", (req, res) => {
  const sql = "SELECT count(id) AS employee FROM employee";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

// Get the sum of salaries of all employees
router.get("/salary_count", (req, res) => {
  const sql = "SELECT SUM(salary) AS salaryOFEmp FROM employee";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

// Get all admin records
router.get("/admin_records", (req, res) => {
  const sql = "SELECT * FROM admin";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

// Logout and clear the token cookie
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ Status: true });
});

export { router as adminRouter };
