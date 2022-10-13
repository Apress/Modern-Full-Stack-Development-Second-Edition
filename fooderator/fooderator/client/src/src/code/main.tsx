import "normalize.css";
import "antd/dist/antd.dark.css";
import React from "react";
import { createRoot, Root } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./components/App";
import Menu from "./components/menu/Menu";
import Recipes from "./components/recipes/Recipes";
import ShoppingList from "./components/shoppingList/ShoppingList";


// Render the UI.
const baseComponent: Root = createRoot(document.getElementById("mainContainer"));
console.log("main.tsx baseComponent", baseComponent);
baseComponent.render(
  <BrowserRouter>
    <Routes>
      <Route path="/static/index.html" element={<App />} />
      <Route path="/static/index.html/recipes" element={<Recipes />} />
      <Route path="/static/index.html/menu" element={<Menu />} />
      <Route path="/static/index.html/shoppingList" element={<ShoppingList />} />
    </Routes>
  </BrowserRouter>
);


console.log("main.tsx loaded");
