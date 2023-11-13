/* @refresh reload */
import { render } from "solid-js/web";

import "./index.css";

import { StoreProvider } from "./Store";

import AllRoutes from "./AllRoutes";

render(
  () => (
    <StoreProvider>
      <AllRoutes />
    </StoreProvider>
  ),
  document.getElementById("root")
);
