import React, {ErrorInfo, ReactNode} from "react";

import NoMatchRedirect from "../../pages/noMatchRedirect";

interface Props {
  children?: ReactNode;

}

interface State {
  hasError: boolean
  errorMessage?: string
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  static getDerivedStateFromError(error:Error):State {
    return {hasError: true};
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({...this.state, errorMessage: error.message});
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>
        <NoMatchRedirect message={this.state.errorMessage}/>;
      </div>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;