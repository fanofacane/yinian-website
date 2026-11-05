import React from "react";
import { renderToString } from "react-dom/server";
import { App } from "./App.jsx";

export function render(notFound = false, path = "/") {
  return renderToString(<App notFound={notFound} path={path} />);
}

export { pageRegistry } from "./site-pages";
