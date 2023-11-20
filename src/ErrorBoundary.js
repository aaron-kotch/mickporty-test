import React from 'react';
import { EmptyState } from "@Common/EmptyState/EmptyState";
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: '', errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error(error, errorInfo);
    this.setState({error: error, errorInfo: errorInfo.componentStack})
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      console.error('something went wrong');
      return (
        <>
        <EmptyState title="Something went wrong. Please restart the mini program." description={this.state.error} />
        </>
      )
     
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;