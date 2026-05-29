import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { complianceAPI } from '../services/api';

const Reports = () => {
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  const generateReport = async () => {
    setGenerating(true);
    setError('');

    try {
      const response = await complianceAPI.generateReport();
      setReport(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Report generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = () => {
    const blob = new Blob([report.report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = report.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Container>
      <Row className="mb-4 page-header">
        <Col>
          <h2>Compliance Reports</h2>
          <p>Generate and download compliance reports</p>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card className="dashboard-card">
            <Card.Header><h5>Generate Report</h5></Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}

              <p>
                Generate a comprehensive compliance report including anomaly detection results,
                audit trail summary, and compliance status.
              </p>

              <Button
                variant="primary"
                onClick={generateReport}
                disabled={generating}
                className="me-3"
                aria-label="Generate compliance report"
              >
                {generating ? <Spinner animation="border" size="sm" /> : 'Generate Report'}
              </Button>

              {report && (
                <Button variant="success" onClick={downloadReport} aria-label="Download report">
                  Download Report
                </Button>
              )}
            </Card.Body>
          </Card>

          {report && (
            <Card className="dashboard-card mt-4">
              <Card.Header><h5>Report Preview</h5></Card.Header>
              <Card.Body>
                <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.9em' }}>{report.report}</pre>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col md={4}>
          <Card className="dashboard-card">
            <Card.Header><h5>Report Types</h5></Card.Header>
            <Card.Body>
              <h6>Compliance Report</h6>
              <ul>
                <li>Anomaly detection summary</li>
                <li>Risk assessment</li>
                <li>Audit trail overview</li>
                <li>Compliance status</li>
                <li>Recommendations</li>
              </ul>
              <h6>Usage</h6>
              <p>
                Reports are generated in text format and can be downloaded for record-keeping and
                regulatory compliance purposes.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Reports;
