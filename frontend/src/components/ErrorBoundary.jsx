import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container className="py-5 text-center">
          <Card className="dashboard-card p-4">
            <h4>Something went wrong</h4>
            <p className="text-muted mb-3">{this.state.error?.message}</p>
            <Button
              variant="primary"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/dashboard';
              }}
            >
              Go to Dashboard
            </Button>
          </Card>
        </Container>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
