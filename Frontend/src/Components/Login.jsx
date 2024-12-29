import React, { useState } from 'react';
import './style.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [values, setValues] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    axios.defaults.withCredentials = true;

    const handleSubmit = (event) => {
        event.preventDefault();

        // Basic input validation
        if (!values.email || !values.password) {
            setError('Please enter both email and password.');
            return;
        }

        // Email format validation
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailPattern.test(values.email)) {
            setError('Please enter a valid email address.');
            return;
        }

        // Send login request
        axios.post('http://localhost:3000/auth/adminlogin', values)
            .then(result => {
                if (result.data.loginStatus) {
                    localStorage.setItem('valid', true);
                    navigate('/dashboard');
                } else {
                    setError(result.data.Error);
                }
            })
            .catch(err => {
                console.error(err);
                setError('An error occurred. Please try again later.');
            });
    };

    const handleInputChange = (e) => {
        // Clear error when the user starts typing
        setError(null);

        // Update form values
        setValues({
            ...values,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 loginPage">
            <div className="p-3 rounded w-25 border loginForm">
                <div className="text-warning">
                    {error && <div>{error}</div>}
                </div>
                <h2>Login Page</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email"><strong>Email:</strong></label>
                        <input
                            type="email"
                            name="email"
                            autoComplete="off"
                            placeholder="Enter Email"
                            onChange={handleInputChange}
                            className="form-control rounded-0"
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password"><strong>Password:</strong></label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter Password"
                            onChange={handleInputChange}
                            className="form-control rounded-0"
                        />
                    </div>
                    <button type="submit" className="btn btn-success w-100 rounded-0 mb-2">
                        Log in
                    </button>
                    <div className="mb-1">
                        <input type="checkbox" name="tick" id="tick" className="me-2" />
                        <label htmlFor="password">You agree with terms & conditions</label>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
