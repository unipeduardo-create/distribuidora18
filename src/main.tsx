import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

const rootElement = document.getElementById("root");

if (!rootElement) {
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif; color: #dc2626;">
      <h1>Erro crítico</h1>
      <p>Elemento #root não encontrado no HTML.</p>
    </div>
  `;
} else {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    console.log("[App] Aplicação iniciada com sucesso.");
  } catch (error) {
    console.error("[App] Erro ao iniciar aplicação:", error);
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif;">
        <h1 style="color: #dc2626;">Erro ao carregar o aplicativo</h1>
        <p style="color: #4b5563;">
          ${error instanceof Error ? error.message : "Erro desconhecido"}
        </p>
        <p style="color: #6b7280; font-size: 14px;">
          Verifique o console do navegador (F12) para mais detalhes.
        </p>
      </div>
    `;
  }
}
