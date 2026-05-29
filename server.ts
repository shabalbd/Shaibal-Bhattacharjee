import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { INITIAL_DATA } from "./src/initialData";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const DATA_FILE_PATH = path.join(process.cwd(), "site_data_store.json");
  const UPLOADS_DIR = path.join(process.cwd(), "uploads");

  // Helper to recursively merge codebase data into stored data, preferring code fields when updated
  const smartMergeCodeFirst = (stored: any, codeMaster: any): any => {
    if (typeof stored !== typeof codeMaster || stored === null || codeMaster === null) {
      return codeMaster;
    }

    if (Array.isArray(codeMaster)) {
      const mergedArray = [...stored];
      for (const codeItem of codeMaster) {
        if (codeItem && typeof codeItem === 'object' && codeItem.id) {
          const storedIndex = mergedArray.findIndex((item: any) => item && item.id === codeItem.id);
          if (storedIndex === -1) {
            mergedArray.push(codeItem);
          } else {
            mergedArray[storedIndex] = smartMergeCodeFirst(mergedArray[storedIndex], codeItem);
          }
        } else if (typeof codeItem !== 'object') {
          if (!mergedArray.includes(codeItem)) {
            mergedArray.push(codeItem);
          }
        }
      }
      return mergedArray;
    }

    if (typeof codeMaster === 'object') {
      const mergedObj = { ...stored };
      for (const key in codeMaster) {
        if (!(key in stored)) {
          mergedObj[key] = codeMaster[key];
        } else {
          mergedObj[key] = smartMergeCodeFirst(stored[key], codeMaster[key]);
        }
      }
      return mergedObj;
    }

    return codeMaster;
  };

  // Synchronize stored database file with the newly built/deployed codebase data if needed
  const syncOnStartup = async () => {
    try {
      const buildTimestampPath = path.join(process.cwd(), "dist", "build_timestamp.txt");
      let buildTimestamp = "";
      if (fs.existsSync(buildTimestampPath)) {
        buildTimestamp = fs.readFileSync(buildTimestampPath, "utf-8").trim();
      }

      if (!buildTimestamp) {
        console.log("[Sync] No build timestamp found yet. Skipping startup sync.");
        return;
      }

      console.log(`[Sync] Detected build timestamp: ${buildTimestamp}`);

      let storedData: any = null;
      if (fs.existsSync(DATA_FILE_PATH)) {
        try {
          const fileContent = fs.readFileSync(DATA_FILE_PATH, "utf-8");
          storedData = JSON.parse(fileContent);
        } catch (e) {
          console.error("[Sync] Errant site_data_store.json file. Rebuilding from baseline.");
        }
      }

      if (!storedData) {
        console.log("[Sync] Creating fresh site_data_store.json with build tag.");
        const baseline = { ...INITIAL_DATA, lastPublishedBuildTimestamp: buildTimestamp };
        fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(baseline, null, 2), "utf-8");
        return;
      }

      const storedTimestamp = storedData.lastPublishedBuildTimestamp || "";
      if (storedTimestamp !== buildTimestamp) {
        console.log(`[Sync] Build mismatch! Stored tag: "${storedTimestamp}", Brand-new build: "${buildTimestamp}". Migrating code changes.`);
        const mergedData = smartMergeCodeFirst(storedData, INITIAL_DATA);
        mergedData.lastPublishedBuildTimestamp = buildTimestamp;
        
        fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(mergedData, null, 2), "utf-8");
        console.log("[Sync] Successfully merged newly published code changes cleanly.");
      } else {
        console.log("[Sync] App state is fully aligned with published build.");
      }
    } catch (err) {
      console.error("[Sync] Error checking database sync on boot:", err);
    }
  };

  // Perform codebase sync immediately on boot
  await syncOnStartup();

  // Leverage generous limit configs to allow saving large base64 media packets (up to 30MB limit each)
  app.use(express.json({ limit: "200mb" }));
  app.use(express.urlencoded({ limit: "200mb", extended: true }));

  // Statically serve uploaded files directory
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  app.use("/api/uploads", express.static(UPLOADS_DIR));

  // Helper to read persisted website content
  const loadSiteData = async (customUrl?: string): Promise<any> => {
    const targetUrl = (customUrl && customUrl.startsWith('http')) 
      ? customUrl 
      : (process.env.GOOGLE_APPS_SCRIPT_URL && process.env.GOOGLE_APPS_SCRIPT_URL.startsWith('http'))
        ? process.env.GOOGLE_APPS_SCRIPT_URL
        : null;

    if (targetUrl) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s
        const response = await fetch(targetUrl, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (response.ok) {
          const data = await response.json();
          if (data && !data.error) {
            return data;
          }
        }
      } catch (err) {
        console.error("Error fetching from Google Apps Script, falling back to local file:", err);
      }
    }

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
  const saveSiteData = async (data: any, customUrl?: string): Promise<boolean> => {
    const targetUrl = (customUrl && customUrl.startsWith('http')) 
      ? customUrl 
      : (process.env.GOOGLE_APPS_SCRIPT_URL && process.env.GOOGLE_APPS_SCRIPT_URL.startsWith('http'))
        ? process.env.GOOGLE_APPS_SCRIPT_URL
        : null;

    if (targetUrl) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout
        const response = await fetch(targetUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(data),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (response.ok) {
          try {
            const result = await response.json();
            console.log("Save response from Google Apps Script:", result);
          } catch (jsonErr) {
            // In case response is successfully received but is not standard JSON (e.g., text, empty)
          }
          // Also write to local file as backup
          fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
          return true;
        } else if (response.status === 200) {
          fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
          return true;
        } else {
          console.warn(`Response status was not ok: ${response.status} ${response.statusText}`);
        }
      } catch (err) {
        console.error("Error saving to Google Apps Script, falling back to local file only:", err);
      }
    }

    try {
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
      return true;
    } catch (error) {
      console.error("Error writing data file to server storage:", error);
      return false;
    }
  };

  // API Endpoints for site customization
  app.get("/api/site-data", async (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    const customUrl = req.query.externalUrl as string | undefined;
    const currentData = await loadSiteData(customUrl);
    res.json(currentData);
  });

  app.post("/api/site-data", async (req, res) => {
    try {
      let clientData = req.body;
      let customUrl = req.query.externalUrl as string | undefined;

      if (clientData && typeof clientData === 'object' && ('data' in clientData)) {
        customUrl = clientData.externalUrl;
        clientData = clientData.data;
      }

      if (!clientData || typeof clientData !== "object" || !clientData.hero || !clientData.about) {
        return res.status(400).json({ error: "Invalid website database payload." });
      }

      const isSaved = await saveSiteData(clientData, customUrl);
      if (isSaved) {
        res.json({ success: true });
      } else {
        res.status(500).json({ error: "Failed to write data modifications to server filesystem." });
      }
    } catch (e: any) {
      console.error("Crash inside post handler", e);
      res.status(500).json({ error: "Internal server error" });
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

  // Dedicated file upload handling endpoint to prevent huge base64 payload save issues
  app.post("/api/upload", (req, res) => {
    try {
      const { name, type, base64 } = req.body;
      if (!name || !base64) {
        return res.status(400).json({ error: "Missing name or base64 data for upload." });
      }

      // Sanitize file name to block path traversal and prevent collisions
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const sanitizedName = `${timestamp}_${randomStr}_${name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      
      const filePath = path.join(UPLOADS_DIR, sanitizedName);

      // Extract raw base64 data bypassing data URL prefixes
      const base64Content = base64.includes(";base64,")
        ? base64.split(";base64,").pop()
        : base64;

      if (!base64Content) {
        return res.status(400).json({ error: "Invalid base64 encoding content syntax." });
      }

      const buffer = Buffer.from(base64Content, "base64");
      fs.writeFileSync(filePath, buffer);

      console.log(`[File Written] Saved static upload file: ${sanitizedName} (${buffer.length} bytes)`);

      res.json({
        success: true,
        url: `/api/uploads/${sanitizedName}`,
      });
    } catch (error) {
      console.error("Error writing uploaded file on server filesystem:", error);
      res.status(500).json({ error: "Could not save file to server storage system." });
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
    
    // Serve static assets with standard caching except for index.html files
    app.use(express.static(distPath, {
      etag: true,
      lastModified: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith("index.html") || filePath.endsWith("index.htm")) {
          res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
        } else {
          // JS, CSS, and other hashed client-side bundled static resources are completely safe to cache immutably
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      }
    }));

    // Fallback wildcards for SPA must never be cached so users fetch latest client index bundle immediately
    app.get("*", (req, res) => {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Full-Stack Server] Portfolio app running and listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
