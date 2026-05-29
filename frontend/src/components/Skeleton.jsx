import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const SkeletonBar = ({ width = '100%', height = '1rem', className = '' }) => (
  <div
    className={`skeleton-pulse ${className}`}
    style={{
      width,
      height,
      borderRadius: '6px',
      background: 'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)',
      backgroundSize: '200% 100%',
      animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
      marginBottom: '0.5rem',
    }}
  />
);

export const DashboardSkeleton = () => (
  <Container>
    <div className="mb-4 page-header">
      <SkeletonBar width="220px" height="1.8rem" />
      <SkeletonBar width="160px" height="1rem" />
    </div>
    <Row className="mb-4 g-3">
      {[1, 2, 3].map((i) => (
        <Col md={4} key={i}>
          <Card className="stat-card" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
            <Card.Body className="text-center">
              <SkeletonBar width="60px" height="2rem" className="mx-auto" />
              <SkeletonBar width="80px" height="0.85rem" className="mx-auto" />
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
    <Row className="g-3">
      {[1, 2].map((i) => (
        <Col md={6} key={i}>
          <Card className="dashboard-card">
            <Card.Header>
              <SkeletonBar width="120px" height="1rem" />
            </Card.Header>
            <Card.Body>
              {[1, 2, 3].map((j) => (
                <SkeletonBar key={j} height="3rem" />
              ))}
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  </Container>
);

export const AuditSkeleton = () => (
  <Container>
    <div className="mb-4 page-header">
      <SkeletonBar width="160px" height="1.8rem" />
      <SkeletonBar width="120px" height="1rem" />
    </div>
    <Card className="dashboard-card">
      <Card.Header>
        <SkeletonBar width="140px" height="1rem" />
      </Card.Header>
      <Card.Body>
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonBar key={i} height="2.5rem" />
        ))}
      </Card.Body>
    </Card>
  </Container>
);

export const FormSkeleton = () => (
  <Container>
    <div className="mb-4 page-header">
      <SkeletonBar width="200px" height="1.8rem" />
      <SkeletonBar width="140px" height="1rem" />
    </div>
    <Row className="g-3">
      <Col md={6}>
        <Card className="dashboard-card">
          <Card.Header>
            <SkeletonBar width="120px" height="1rem" />
          </Card.Header>
          <Card.Body>
            {[1, 2, 3, 4].map((i) => (
              <SkeletonBar key={i} height="3.5rem" />
            ))}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);
