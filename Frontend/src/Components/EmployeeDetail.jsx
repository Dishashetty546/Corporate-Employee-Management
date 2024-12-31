import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const EmployeeDetail = () => {
  const [employee, setEmployee] = useState(null);
  const { id } = useParams(); // Get the employee id from URL

  useEffect(() => {
    axios.get(`http://localhost:3000/admin/employee/detail/${id}`)
      .then(result => {
        if (result.data.Status === false) {
          console.error(result.data.Error); // Handle error if employee not found
        } else {
          setEmployee(result.data.Data); // Now we use 'Data' to set employee state
        }
      })
      .catch(err => {
        console.error("Error fetching employee details:", err);
      });
  }, [id]); // Run when 'id' changes

  if (!employee) {
    return <div>Loading...</div>; // Show loading while the employee data is fetched
  }

  return (
    <div>
      <h3>Employee Details</h3>
      <h4>Name: {employee.name}</h4>
      <h4>Email: {employee.email}</h4>
      <h4>Salary: ${employee.salary}</h4>
      {employee.image && (
        <img
          src={`http://localhost:3000/Public/Images/${employee.image}`}
          alt="Employee"
          className="emp_det_image"
        />
      )}
    </div>
  );
};

export default EmployeeDetail;
