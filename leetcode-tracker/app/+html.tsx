import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en" style={{ backgroundColor: "#04001a" }}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{
          __html: `
            *, *::before, *::after { box-sizing: border-box; }
            html, body, #root { 
              height: 100%;
              background-color: #04001a !important;
              margin: 0; padding: 0;
              overscroll-behavior: none;
            }
            input, textarea {
              background: transparent !important;
              outline: none !important;
              border: none !important;
              -webkit-appearance: none;
            }
          `,
        }} />
      </head>
      <body style={{ backgroundColor: "#04001a", margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}