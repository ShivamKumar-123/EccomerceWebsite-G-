import { Component } from 'react';

export default class RootErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
  }

  static getDerivedStateFromError(err) {
    return { err };
  }

  componentDidCatch(err, info) {
    if (import.meta.env.DEV) {
      console.error('RootErrorBoundary:', err, info?.componentStack);
    }
  }

  render() {
    if (this.state.err) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-stone-100 dark:bg-stone-900 px-6 text-center">
          <p className="text-lg font-semibold text-stone-900 dark:text-white">Something went wrong</p>
          <p className="max-w-md text-sm text-stone-600 dark:text-stone-400">
            Try a hard refresh. If this persists, disable browser extensions (e.g. translate) for this site and reload.
          </p>
          <button
            type="button"
            className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
