import { StrictMode } from "react";
import { Provider as ChakraProvider } from "./components/ui/theme-provider";
import App, { type tProps } from "./App";

export const renderApp = (props: tProps) => (
  <StrictMode>
    <ChakraProvider>
      <App {...props} />
    </ChakraProvider>
  </StrictMode>
);
