import mysql from "mysql";

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Disha@809",
  database: "employeems",
});

con.connect(function (err) {
  if (err) {
    console.log("Connection error:", err);
  } else {
    console.log("Connected to the database!");
  }
});

export default con;
