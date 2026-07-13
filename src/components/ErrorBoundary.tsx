import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Erro capturado:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md rounded-2xl bg-white p-8 shadow-xl">
            <h1 className="text-xl font-semibold text-red-600">
              Erro ao carregar o aplicativo
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {this.state.error?.message || "Ocorreu um erro inesperado."}
            </p>
            <p className="mt-4 text-xs text-slate-500">
              Abra o console do navegador (F12) e envie o erro para o suporte.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
