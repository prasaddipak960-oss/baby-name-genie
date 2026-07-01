import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";

import { getRouter } from "./router";
import "./styles.css";

function showBootError(error: unknown) {
  console.error(error);
  const root = document.getElementById("root") ?? document.body;
  root.innerHTML = `
    <main style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#fff8f1;color:#40322e;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;text-align:center;">
      <section style="max-width:560px;border:1px solid rgba(120,94,80,.18);border-radius:28px;background:white;padding:32px;box-shadow:0 20px 60px rgba(120,94,80,.12);">
        <div style="font-size:44px;margin-bottom:12px;">🧸</div>
        <h1 style="margin:0 0 10px;font-size:32px;line-height:1.1;">NaamSutra is reloading</h1>
        <p style="margin:0 0 22px;color:#75615a;font-size:16px;">Something interrupted the page load. Please refresh once.</p>
        <button onclick="window.location.reload()" style="border:0;border-radius:999px;background:#79b999;color:white;padding:14px 24px;font-weight:700;font-size:16px;cursor:pointer;">Refresh NaamSutra</button>
      </section>
    </main>
  `;
}

window.addEventListener("error", (event) => showBootError(event.error ?? event.message));
window.addEventListener("unhandledrejection", (event) => showBootError(event.reason));

try {
  const rootElement = document.getElementById("root");

  if (!rootElement) {
    throw new Error("Missing #root element");
  }

  createRoot(rootElement).render(
    <StrictMode>
      <RouterProvider router={getRouter()} />
    </StrictMode>,
  );
} catch (error) {
  showBootError(error);
}