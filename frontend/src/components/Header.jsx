import React from 'react';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Header = ({ user, onLogout, darkMode, onToggleDark }) => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Navbar expand="lg" className="app-header">
      <Container>
        <Navbar.Brand
          onClick={() => handleNavigation('/dashboard')}
          style={{ cursor: 'pointer' }}
          aria-label="Go to dashboard"
        >
          BrokerByte
        </Navbar.Brand>
        <Navbar.Toggle aria-label="Toggle navigation" />
        <Navbar.Collapse className="justify-content-end">
          <Nav className="me-auto">
            <Nav.Link
              onClick={() => handleNavigation('/dashboard')}
              aria-label="Dashboard"
            >
              Dashboard
            </Nav.Link>
            <Nav.Link
              onClick={() => handleNavigation('/anomalies')}
              aria-label="Anomaly Detection"
            >
              Anomaly Detection
            </Nav.Link>
            <Nav.Link
              onClick={() => handleNavigation('/ekyc')}
              aria-label="eKYC Verification"
            >
              eKYC Verification
            </Nav.Link>
            <Nav.Link
              onClick={() => handleNavigation('/reports')}
              aria-label="Reports"
            >
              Reports
            </Nav.Link>
            <Nav.Link
              onClick={() => handleNavigation('/audit')}
              aria-label="Audit Trail"
            >
              Audit Trail
            </Nav.Link>
          </Nav>
          <Button
            variant="link"
            onClick={onToggleDark}
            className="text-light me-2 p-1"
            style={{ textDecoration: 'none', fontSize: '1.1rem' }}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? '\u2600\uFE0F' : '\uD83C\uDF19'}
          </Button>
          <Navbar.Text>
            Welcome, <strong>{user?.username}</strong> ({user?.role})
          </Navbar.Text>
          <Button
            variant="outline-light"
            size="sm"
            onClick={onLogout}
            className="ms-3"
            aria-label="Logout"
          >
            Logout
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
