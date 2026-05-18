import { initRouter } from "./router.js";
import { initTheme } from "./components/theme.js";

const root = document.getElementById("app");
initTheme();
initRouter(root);
