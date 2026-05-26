import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { INITIAL_DATA } from "./src/initialData";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const DATA_FILE_PATH = path.join(process.cwd(), "site_data_store.json");

  // Leverage generous limit configs to allow saving large base64 media packets (up to 30MB limit each)
  app.use(express.json({ limit: "200mb" }));
  app.use(express.urlencoded({ limit: "200mb", extended: true }));

  // Helper to read persisted website content
  const loadSiteData = (): any => {
    try {
      if (fs.existsSync(DATA_FILE_PATH)) {
        const fileContent = fs.readFileSync(DATA_FILE_PATH, "utf-8");
        return JSON.parse(fileContent);
      }
    } catch (error) {
      console.error("Error reading data file from server storage, falling back to static config:", error);
    }
    return INITIAL_DATA;
  };

  // Helper to save website content
  const saveSiteData = (data: any): boolean => {
    try {
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
      return true;
    } catch (error) {
      console.error("Error writing data file to server storage:", error);
      return false;
    }
  };

  // API Endpoints for site customization
  app.get("/api/site-data", (req, res) => {
    const currentData = loadSiteData();
    res.json(currentData);
  });

  app.post("/api/site-data", (req, res) => {
    const clientData = req.body;
    if (!clientData || typeof clientData !== "object" || !clientData.hero || !clientData.about) {
      return res.status(400).json({ error: "Invalid website database payload." });
    }

    const isSaved = saveSiteData(clientData);
    if (isSaved) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: "Failed to write data modifications to server filesystem." });
    }
  });

  app.post("/api/site-data/reset", (req, res) => {
    try {
      if (fs.existsSync(DATA_FILE_PATH)) {
        fs.unlinkSync(DATA_FILE_PATH);
      }
      res.json({ success: true, data: INITIAL_DATA });
    } catch (error) {
      console.error("Error during site reset:", error);
      res.status(500).json({ error: "Failed to erase database on the server. Please dry-run or refresh." });
    }
  });

  // Vite middleware or static serving depending on environment
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Full-Stack Server] Portfolio app running and listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
