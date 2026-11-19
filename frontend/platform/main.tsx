// Entry of the Platform Admin app (see vite.platform.config.ts).
import { createRoot } from "react-dom/client";
import PlatformApp from "@/platform/PlatformApp";
import "@/index.css";

createRoot(document.getElementById("root")!).render(<PlatformApp />);
