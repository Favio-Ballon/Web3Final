import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router";
import RouterConfig from "./navigation/RouterConfig.tsx";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./redux/store.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate
        loading={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Cargando...</p>
            </div>
          </div>
        }
        persistor={persistor}
      >
        <BrowserRouter>
          <RouterConfig />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </StrictMode>
);
