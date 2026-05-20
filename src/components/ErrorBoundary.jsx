import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: "60px 40px", textAlign: "center", fontFamily: "Arial, sans-serif", background: "#0c0e18", minHeight: "100vh", color: "#dde1f5" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#ef4444", marginBottom: 12 }}>
            Algo deu errado / Something went wrong
          </div>
          <div style={{ fontSize: 13, color: "#8890bc", marginBottom: 24, fontFamily: "monospace", maxWidth: 480, margin: "0 auto 24px" }}>
            {this.state.error.message}
          </div>
          <button
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{ padding: "10px 22px", background: "#6271f5", color: "#fff", border: "none", borderRadius: 9, cursor: "pointer", fontSize: 14, fontWeight: 700 }}
          >
            Limpar dados e recarregar / Clear data and reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
