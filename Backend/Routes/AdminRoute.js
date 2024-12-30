import express from "express";
import con from "../utils/db.js";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";

const router = express.Router();

// Admin login route (no password hashing)
router.post("/adminlogin", (req, res) => {
  const sql = "SELECT * from admin WHERE email = ?";
  con.query(sql, [req.body.email], (err, result) => {
    if (err) return res.json({ loginStatus: false, Error: "Query error" });

    if (result.length > 0) {
      const admin = result[0];

      // Direct password comparison (no bcrypt)
      if (req.body.password === admin.password) {
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
    if (err) {
      console.error("SQL Error:", err.message); // Log the error for debugging
      return res.json({ Status: false, Error: "Query Error" });
    }
    return res.json({ Status: true, Message: "Category added successfully" });
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
const upload = multer({ storage: storage });

// Add new employee with image upload
router.post("/add_employee", upload.single("image"), (req, res) => {
  // Ensure required fields are present
  if (
    !req.body.name ||
    !req.body.email ||
    !req.body.password ||
    !req.body.salary ||
    !req.body.category_id
  ) {
    return res.json({ Status: false, Error: "Missing required fields" });
  }

  // Handle image upload (check if image exists)
  const imageFile = req.file ? req.file.filename : null;

  const sql = `INSERT INTO employee (name, email, password, address, salary, image, category_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    req.body.name,
    req.body.email,
    req.body.password, // No bcrypt here, plain password
    req.body.address,
    req.body.salary,
    imageFile, // Image file
    req.body.category_id, // Category ID
  ];

  con.query(sql, values, (err, result) => {
    if (err) {
      console.error("SQL Error:", err.message); // Log error for debugging
      return res.json({ Status: false, Error: err.message });
    }
    return res.json({ Status: true, Message: "Employee added successfully" });
  });
});

// Delete employee by ID
router.delete("/delete_employee/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM employee WHERE id = ?";
  con.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Message: "Employee deleted successfully" });
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

router.get("/employee_list", (req, res) => {
  const sql = "SELECT * FROM employee"; // SQL query to fetch all employee records
  con.query(sql, (err, result) => {
    if (err) {
      console.error("SQL Error:", err.message); // Log error for debugging
      return res.json({ Status: false, Error: "Query Error" });
    }
    return res.json({ Status: true, Result: result }); // Return the list of employees
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
  return res.json({ Status: true, Message: "Logged out successfully" });
});

export { router as adminRouter };
