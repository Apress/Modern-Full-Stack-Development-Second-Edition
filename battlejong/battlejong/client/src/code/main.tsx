// Style imports.
import "normalize.css";
import "../css/main.css";

// React imports.
import React from "react";
import { createRoot, Root } from "react-dom/client";

// App imports.
import BaseLayout from "./components/BaseLayout";


// Render UI.
const baseComponent: Root = createRoot(document.getElementById("mainContainer")!);
baseComponent.render(<BaseLayout />);
