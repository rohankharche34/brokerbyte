import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { authAPI } from '../services/api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'user',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.username.trim()) errs.username = 'Username is required';
    if (!formData.password) errs.password = 'Password is required';
    if (formData.password.length < 8) errs.password = 'Password must be at least 8 characters';
    else if (!/[A-Z]/.test(formData.password)) errs.password = 'Password must contain an uppercase letter';
    else if (!/[a-z]/.test(formData.password)) errs.password = 'Password must contain a lowercase letter';
    else if (!/[0-9]/.test(formData.password)) errs.password = 'Password must contain a digit';
    if (!isLogin) {
      if (!formData.full_name.trim()) errs.full_name = 'Full name is required';
      if (!formData.email.trim()) errs.email = 'Email is required';
      else if (!EMAIL_RE.test(formData.email)) errs.email = 'Invalid email format';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError('');

    try {
      const response = isLogin
        ? await authAPI.login(formData)
        : await authAPI.register(formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      onLogin(response.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="text-center mb-4">
          <h2>BrokerByte</h2>
          <p className="brand-subtitle">Financial Compliance Platform</p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit} noValidate>
          {!isLogin && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  isInvalid={!!fieldErrors.full_name}
                  required
                  aria-label="Full Name"
                />
                <Form.Control.Feedback type="invalid">{fieldErrors.full_name}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  isInvalid={!!fieldErrors.email}
                  required
                  aria-label="Email"
                />
                <Form.Control.Feedback type="invalid">{fieldErrors.email}</Form.Control.Feedback>
              </Form.Group>
            </>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              isInvalid={!!fieldErrors.username}
              required
              aria-label="Username"
            />
            <Form.Control.Feedback type="invalid">{fieldErrors.username}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              isInvalid={!!fieldErrors.password}
              required
              aria-label="Password"
            />
            <Form.Control.Feedback type="invalid">{fieldErrors.password}</Form.Control.Feedback>
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100 mb-3" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : isLogin ? 'Login' : 'Register'}
          </Button>

          <div className="text-center">
            <Button variant="link" onClick={() => { setIsLogin(!isLogin); setFieldErrors({}); }}>
              {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
            </Button>
          </div>
        </Form>

      </div>
    </div>
  );
};

export default Login;
