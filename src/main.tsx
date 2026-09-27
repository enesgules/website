import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./App";
import "./styles/global.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("The root element is missing from index.html.");
}

const app = (
  <StrictMode>
    <App initialPathname={window.location.pathname} />
  </StrictMode>
);

// Built pages are prerendered; dev and lab pages start with an empty root.
if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
