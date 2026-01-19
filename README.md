# BlurYEffect

BlurYEffect 🌀

BlurYEffect is a simple tool for detecting blurry or low-quality images. It includes a browser-based demo and a backend API, making it easy to test images interactively or integrate blur detection into real workflows.

What It Does

Detects whether an image is blurry

Lets you adjust detection sensitivity

Runs image analysis in the browser (no uploads needed)

Provides a production-ready API

Works on desktop and mobile

Clean dark-mode UI

How It Works

BlurYEffect uses a Laplacian variance technique to measure image sharpness.
Sharp images have strong edges; blurry images don’t. Lower variance means more blur.

Quick Start
npm install
npm start


Open http://localhost:3000 in your browser.

API

POST /api/blurry-image

{
  "data": "https://example.com/image.jpg"
}

{
  "classification": "Blurry",
  "confidence": 0.95
}

Use Cases

Validate user uploads

Clean image datasets

Automated quality checks

Tech Stack

Node.js / Express

HTML5 Canvas

CSS3



License

MIT