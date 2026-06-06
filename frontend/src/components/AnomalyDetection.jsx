import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Alert, Spinner } from 'react-bootstrap';
import { complianceAPI } from '../services/api';
import { FormSkeleton } from './Skeleton';

const AnomalyDetection = () => {
  const [tickers, setTickers] = useState('AAPL,GOOGL,MSFT,TSLA');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDetect = async () => {
    setLoading(true);
    setError('');

    try {
      const tickerList = tickers.split(',').map((t) => t.trim()).filter((t) => t);
      const response = await complianceAPI.detectAnomalies(tickerList);
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Detection failed');
    } finally {
      setLoading(false);
    }
  };

  const getRiskVariant = (riskLevel) => {
    const variants = { Low: 'success', Medium: 'warning', High: 'danger', Critical: 'dark' };
    return variants[riskLevel] || 'secondary';
  };

  if (loading && results.length === 0) return <FormSkeleton />;

  return (
    <Container>
      <Row className="mb-4 page-header">
        <Col>
          <h2>Anomaly Detection</h2>
          <p>Detect trading anomalies in real-time</p>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card className="dashboard-card">
            <Card.Header><h5>Detect Anomalies</h5></Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}

              <Form.Group className="mb-3">
                <Form.Label htmlFor="tickers-input">Stock Tickers (comma-separated)</Form.Label>
                <Form.Control
                  id="tickers-input"
                  type="text"
                  value={tickers}
                  onChange={(e) => setTickers(e.target.value)}
                  placeholder="e.g., AAPL,GOOGL,MSFT"
                  aria-label="Stock tickers"
                />
                <Form.Text className="text-muted">
                  Enter stock symbols to analyze for anomalies
                </Form.Text>
              </Form.Group>

              <Button variant="primary" onClick={handleDetect} disabled={loading} aria-label="Detect anomalies">
                {loading ? <Spinner animation="border" size="sm" /> : 'Detect Anomalies'}
              </Button>
            </Card.Body>
          </Card>

          {results.length > 0 && (
            <Card className="dashboard-card mt-4">
              <Card.Header><h5>Detection Results</h5></Card.Header>
              <Card.Body>
                <Table striped responsive aria-label="Anomaly detection results">
                  <thead>
                    <tr>
                      <th scope="col">Ticker</th>
                      <th scope="col">Anomaly Score</th>
                      <th scope="col">Risk Level</th>
                      <th scope="col">Price</th>
                      <th scope="col">Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr key={index}>
                        <td>{result.ticker}</td>
                        <td>{result.anomaly_score}</td>
                        <td>
                          <span className={`badge bg-${getRiskVariant(result.risk_level)}`}>
                            {result.risk_level}
                          </span>
                        </td>
                        <td>${result.price}</td>
                        <td>{result.volume.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col md={4}>
          <Card className="dashboard-card">
            <Card.Header><h5>Risk Levels</h5></Card.Header>
            <Card.Body>
              <div className="mb-2">
                <span className="badge bg-success me-2">Low</span>
                <small>Score &lt; 0.3 - Normal trading activity</small>
              </div>
              <div className="mb-2">
                <span className="badge bg-warning me-2">Medium</span>
                <small>Score 0.3-0.6 - Moderate anomaly</small>
              </div>
              <div className="mb-2">
                <span className="badge bg-danger me-2">High</span>
                <small>Score 0.6-0.8 - Significant anomaly</small>
              </div>
              <div>
                <span className="badge bg-dark me-2">Critical</span>
                <small>Score &gt; 0.8 - Critical anomaly</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AnomalyDetection;
