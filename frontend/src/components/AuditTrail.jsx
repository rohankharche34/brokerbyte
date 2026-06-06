import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Spinner, Badge, Pagination as BsPagination } from 'react-bootstrap';
import { complianceAPI } from '../services/api';
import { AuditSkeleton } from './Skeleton';

const PAGE_SIZE = 10;

const AuditTrail = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    fetchAuditTrail();
  }, [page]);

  const fetchAuditTrail = async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * PAGE_SIZE;
      const response = await complianceAPI.getAuditTrail(PAGE_SIZE, offset);
      setAuditLogs(response.data.entries);
      setTotal(response.data.total);
    } catch (err) {
      setError('Failed to fetch audit trail');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (ts) => new Date(ts).toLocaleString();

  const renderDetails = (details) => {
    if (!details) return 'No details';
    try {
      const parsed = typeof details === 'string' ? JSON.parse(details) : details;
      if (typeof parsed === 'object') {
        return Object.entries(parsed).map(([k, v]) => (
          <div key={k}>
            <strong>{k}:</strong> {JSON.stringify(v)}
          </div>
        ));
      }
      return String(parsed);
    } catch {
      return String(details);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const items = [];
    items.push(
      <BsPagination.Prev
        key="prev"
        disabled={page <= 1}
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        aria-label="Previous page"
      />,
    );
    for (let i = 1; i <= totalPages; i++) {
      items.push(
        <BsPagination.Item
          key={i}
          active={i === page}
          onClick={() => setPage(i)}
          aria-label={`Page ${i}`}
        >
          {i}
        </BsPagination.Item>,
      );
    }
    items.push(
      <BsPagination.Next
        key="next"
        disabled={page >= totalPages}
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        aria-label="Next page"
      />,
    );
    return <BsPagination className="justify-content-center mt-3">{items}</BsPagination>;
  };

  if (loading && auditLogs.length === 0) return <AuditSkeleton />;

  return (
    <Container>
      <Row className="mb-4 page-header">
        <Col>
          <h2>Audit Trail</h2>
          <p>System activity and user actions log ({total} entries)</p>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="dashboard-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5>Recent Activities</h5>
              <Button variant="outline-primary" size="sm" onClick={fetchAuditTrail} aria-label="Refresh audit log">
                Refresh
              </Button>
            </Card.Header>
            <Card.Body>
              {error && <div className="alert alert-danger">{error}</div>}

              <Table striped responsive aria-label="Audit trail table">
                <thead>
                  <tr>
                    <th scope="col">Timestamp</th>
                    <th scope="col">User</th>
                    <th scope="col">Action</th>
                    <th scope="col">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log, index) => (
                    <tr key={index}>
                      <td>{formatTimestamp(log.timestamp)}</td>
                      <td>{log.username || 'System'}</td>
                      <td>
                        <Badge bg="info" className="text-capitalize">
                          {log.action_type}
                        </Badge>
                      </td>
                      <td>
                        <small className="text-muted">{renderDetails(log.details)}</small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {auditLogs.length === 0 && !loading && (
                <div className="text-center text-muted py-4">No audit logs found</div>
              )}

              {loading && (
                <div className="text-center py-2">
                  <Spinner animation="border" size="sm" />
                </div>
              )}

              {renderPagination()}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AuditTrail;
