import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Badge, Table } from 'react-bootstrap';
import { complianceAPI } from '../services/api';
import { DashboardSkeleton } from './Skeleton';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await complianceAPI.getDashboard();
      setDashboardData(response.data);
    } catch (err) {
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (riskLevel) => {
    const cls = {
      Low: 'risk-low',
      Medium: 'risk-medium',
      High: 'risk-high',
      Critical: 'risk-critical',
    }[riskLevel] || 'risk-low';
    return <Badge className={`risk-badge ${cls}`}>{riskLevel}</Badge>;
  };

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <Container>
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="mb-4 page-header">
        <Col>
          <h2>Compliance Dashboard</h2>
          <p>Real-time monitoring and analytics</p>
        </Col>
      </Row>

      <Row className="mb-4 g-3">
        <Col md={4}>
          <Card className="stat-card stat-total" aria-label={`Total checks: ${dashboardData?.stats?.total_checks || 0}`}>
            <Card.Body>
              <h3>{dashboardData?.stats?.total_checks || 0}</h3>
              <p>Total Checks</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="stat-card stat-anomalies" aria-label={`Anomalies detected: ${dashboardData?.stats?.anomalies_found || 0}`}>
            <Card.Body>
              <h3>{dashboardData?.stats?.anomalies_found || 0}</h3>
              <p>Anomalies Detected</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="stat-card stat-highrisk" aria-label={`High risk items: ${dashboardData?.stats?.high_risk_count || 0}`}>
            <Card.Body>
              <h3>{dashboardData?.stats?.high_risk_count || 0}</h3>
              <p>High Risk Items</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3">
        <Col md={6}>
          <Card className="dashboard-card h-100">
            <Card.Header><h5>Recent Alerts</h5></Card.Header>
            <Card.Body>
              {dashboardData?.alerts?.map((alert, index) => (
                <Alert
                  key={index}
                  variant={alert.severity === 'high' ? 'danger' : 'warning'}
                  className="alert-item"
                >
                  <strong>{alert.title}</strong>
                  <br />
                  {alert.description}
                  <br />
                  <small>Due: {new Date(alert.deadline).toLocaleDateString()}</small>
                </Alert>
              ))}
              {(!dashboardData?.alerts || dashboardData.alerts.length === 0) && (
                <div className="text-center text-muted py-4">No alerts</div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="dashboard-card h-100">
            <Card.Header><h5>Recent Anomalies</h5></Card.Header>
            <Card.Body>
              <Table striped responsive size="sm" aria-label="Recent anomalies table">
                <thead>
                  <tr>
                    <th scope="col">Ticker</th>
                    <th scope="col">Score</th>
                    <th scope="col">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData?.anomalies?.map((anomaly, index) => (
                    <tr key={index}>
                      <td>{anomaly.ticker}</td>
                      <td>{anomaly.anomaly_score}</td>
                      <td>{getRiskBadge(anomaly.risk_level)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {(!dashboardData?.anomalies || dashboardData.anomalies.length === 0) && (
                <div className="text-center text-muted py-4">No anomalies detected</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
