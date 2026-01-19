const express = require("express");
const path = require("path");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

const NYCKEL_FUNCTION_ID = process.env.NYCKEL_FUNCTION_ID || "blurry-image-identifier";
const NYCKEL_ACCESS_TOKEN = process.env.NYCKEL_ACCESS_TOKEN;

app.use(express.json({ limit: "5mb" }));

app.use(express.static(__dirname));

app.post("/api/blurry-image", async (req, res) => {
  if (!NYCKEL_ACCESS_TOKEN) {
    return res.status(500).json({
      error: "NYCKEL_ACCESS_TOKEN is not configured on the server"
    });
  }

  const data = req.body && req.body.data;
  if (!data) {
    return res.status(400).json({
      error: 'Missing "data" field. Provide an image URL or data URI.'
    });
  }

  const url = "https://www.nyckel.com/v1/functions/" + NYCKEL_FUNCTION_ID + "/invoke";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + NYCKEL_ACCESS_TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ data: data })
    });

    const json = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: json && json.message ? json.message : "Nyckel API error",
        details: json
      });
    }

    return res.json(json);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to call Nyckel API",
      details: error && error.message ? error.message : String(error)
    });
  }
});

app.listen(PORT, () => {
  console.log("BlurYEffect server listening on http://localhost:" + PORT);
});

