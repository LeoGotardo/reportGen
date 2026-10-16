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
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: "10px 22px", background: "#6271f5", color: "#fff", border: "none", borderRadius: 9, cursor: "pointer", fontSize: 14, fontWeight: 700 }}
            >
              Recarregar / Reload
            </button>
            <button
              onClick={() => {
                // Apaga só os dados do ReportGen (todos os relatórios), não o localStorage inteiro.
                if (!window.confirm("Apagar TODOS os relatórios salvos neste navegador? / Delete ALL reports saved in this browser?")) return;
                Object.keys(localStorage).filter(k => k.startsWith("rg_")).forEach(k => localStorage.removeItem(k));
                window.location.reload();
              }}
              style={{ padding: "10px 22px", background: "transparent", color: "#f87171", border: "1.5px solid rgba(239,68,68,.4)", borderRadius: 9, cursor: "pointer", fontSize: 14, fontWeight: 700 }}
            >
              Apagar relatórios e recarregar / Delete reports and reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
