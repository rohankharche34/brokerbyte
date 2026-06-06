import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { complianceAPI } from '../services/api';

const EKYCVerification = () => {
  const [formData, setFormData] = useState({
    document_type: 'aadhaar',
    document_data: { number: '' },
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await complianceAPI.verifyIdentity(formData);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'document_number') {
      setFormData((prev) => ({ ...prev, document_data: { number: value } }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <Container>
      <Row className="mb-4 page-header">
        <Col>
          <h2>eKYC Verification</h2>
          <p>Electronic Know Your Customer verification</p>
        </Col>
      </Row>

      <Row className="g-3">
        <Col md={6}>
          <Card className="dashboard-card">
            <Card.Header><h5>Verify Identity</h5></Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="ekyc-doc-type">Document Type</Form.Label>
                  <Form.Select
                    id="ekyc-doc-type"
                    name="document_type"
                    value={formData.document_type}
                    onChange={handleInputChange}
                    aria-label="Document type"
                  >
                    <option value="aadhaar">Aadhaar Card</option>
                    <option value="pan">PAN Card</option>
                    <option value="passport">Passport</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label htmlFor="ekyc-doc-number">Document Number</Form.Label>
                  <Form.Control
                    id="ekyc-doc-number"
                    type="text"
                    name="document_number"
                    placeholder="Enter document number"
                    value={formData.document_data.number}
                    onChange={handleInputChange}
                    aria-label="Document number"
                  />
                </Form.Group>

                <Button variant="primary" type="submit" disabled={loading} aria-label="Verify identity">
                  {loading ? <Spinner animation="border" size="sm" /> : 'Verify Identity'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          {result && (
            <Card className="dashboard-card mb-3">
              <Card.Header><h5>Verification Result</h5></Card.Header>
              <Card.Body>
                <Alert variant={result.success ? 'success' : 'warning'}>
                  <strong>Status: {result.status}</strong>
                  <br />
                  {result.success ? (
                    <>
                      Verification Score: {(result.score * 100).toFixed(1)}%
                      <br />
                      <small>Verification ID: {result.verification_id}</small>
                    </>
                  ) : (
                    result.error
                  )}
                </Alert>

                {result.success && (
                  <div>
                    <h6>Next Steps:</h6>
                    <ul className="mb-0">
                      <li>Document verification completed</li>
                      <li>Compliance review scheduled</li>
                      <li>Results will be available in audit trail</li>
                    </ul>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          <Card className="dashboard-card">
            <Card.Header><h6>Supported Documents</h6></Card.Header>
            <Card.Body>
              <ul className="mb-0">
                <li><strong>Aadhaar Card:</strong> 12-digit number</li>
                <li><strong>PAN Card:</strong> 10-character alphanumeric</li>
                <li><strong>Passport:</strong> 8-character alphanumeric</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EKYCVerification;
