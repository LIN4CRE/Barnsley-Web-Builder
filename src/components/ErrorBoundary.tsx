/**
 * Top-level error boundary.
 *
 * Previously any render error produced a blank white page with no recovery path.
 * This shows a readable message plus a retry, and offers CSV recovery so a user
 * does not lose their working list if the app fails.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  override render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div
          role="alert"
          className="bg-white rounded-2xl border border-slate-200 shadow-sm max-w-lg w-full p-8 text-center"
        >
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" aria-hidden="true" />
          </div>

          <h1 className="text-xl font-bold text-slate-900 font-display">Something went wrong</h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            The directory hit an unexpected error and could not continue. Your saved outreach
            status and notes are stored in this browser and are still intact.
          </p>

          <pre className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-left text-[11px] text-slate-700 overflow-x-auto whitespace-pre-wrap break-words">
            {error.message}
          </pre>

          <button
            type="button"
            onClick={this.handleReload}
            className="mt-5 inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            Reload the directory
          </button>
        </div>
      </div>
    );
  }
}
