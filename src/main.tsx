//! Libraries
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

//! CSS
import "./index.css";

//! App
import App from "./App.tsx";

//! Redux
import { Provider } from "react-redux";
import { store } from "./store";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
