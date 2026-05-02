import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // CNN Fear and Greed Proxy
  app.get("/api/fear-and-greed", async (req, res) => {
    try {
      const response = await axios.get("https://production.dataviz.cnn.io/index/fearandgreed/graphdata", {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("Fear and Greed Fetch Error:", error.message);
      res.status(500).json({ error: "Failed to fetch Fear and Greed data" });
    }
  });

  // BOK ECOS API Proxy
  app.get("/api/bond-yields", async (req, res) => {
    const { bondcd, start_date, end_date, bondcd1 } = req.query;
    // 제공된 키를 기본값으로 사용하되 환경 변수가 있으면 이를 우선함
    const apiKey = process.env.ECOS_API_KEY || "967SFAC1NLQO1Z31HUMX";

    const url = `http://ecos.bok.or.kr/api/StatisticSearch/${apiKey}/json/kr/1/10000/${bondcd}/D/${start_date}/${end_date}/${bondcd1}`;

    try {
      console.log(`Fetching BOK data: ${bondcd1} from ${start_date}`);
      const response = await axios.get(url);
      
      if (response.data?.RESULT?.CODE === "INFO-200") {
        console.warn("BOK API: No data found for specified parameters");
      }
      
      res.json(response.data);
    } catch (error: any) {
      console.error("BOK ECOS Fetch Error:", error.message);
      res.status(500).json({ error: "Failed to fetch Bond Yield data" });
    }
  });

  // Vite middleware for development
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
