import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { COLORS } from "../../config/colors";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex-1 flex items-center justify-center p-4" style={{ background: COLORS.bg }}>
          <div className="max-w-md text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: COLORS.redSoft }}>
              <AlertTriangle size={32} color={COLORS.red} />
            </div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: COLORS.ink }}>
              Oops! Algo deu errado
            </h2>
            <p className="text-sm mb-4" style={{ color: COLORS.slateSoft }}>
              Esta página encontrou um erro. Tente recarregar.
            </p>
            {this.state.error && (
              <details className="text-left text-xs mb-4 p-3 rounded" style={{ background: COLORS.redSoft }}>
                <summary style={{ color: COLORS.red }}>Detalhes do erro</summary>
                <pre className="mt-2 overflow-auto max-h-32">{this.state.error.toString()}</pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg font-semibold text-white"
              style={{ background: COLORS.orange }}
            >
              <RefreshCw size={16} className="inline mr-1" /> Recarregar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}