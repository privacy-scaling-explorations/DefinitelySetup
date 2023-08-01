import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ChakraProvider, extendTheme,ColorModeScript  } from "@chakra-ui/react";

import '@fontsource/poppins/700.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/200.css'

//@ts-ignore
if (typeof global === 'undefined') {
  //@ts-ignore
  window.global = window;
}

const colors = {
  brand: {
    900: "#000000",
    800: "#000000",
    700: "#000000"
  }
};

const theme = extendTheme({
  fonts: {
    body: "Poppins",
    heading: "Sofia Sans"
  },
  colors,
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
    
  </React.StrictMode>
);
