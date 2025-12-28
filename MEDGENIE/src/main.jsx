import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

function ThemeInit() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.documentElement.classList.add("dark");
  }
}

ThemeInit();

ReactDOM.createRoot(document.getElementById("root")).render(
  <App />
);
