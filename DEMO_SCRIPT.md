# Demo Video Script (3–5 minutes)

Goal: Show the product working end-to-end: dashboard, API, and Vanna AI chat.
Target length: 3–5 minutes.

## Prep (before recording)
- Ensure live URLs are ready:
  - Web (Vercel): https://<your-web>.vercel.app
  - API (Render): https://<your-api>.onrender.com
  - Vanna (Render): https://<your-vanna>.onrender.com
- Confirm environment variables are set in hosting providers.
- Keep one browser tab open per URL.

## Recording Tool
- Windows 10/11: use Xbox Game Bar (Win + G) or Clipchamp.
- Alternative: OBS Studio.

## Outline and Narration

1) Intro (10–15s)
- “Hi, this is Flowbit Analytics. I’ll show the dashboard, API, and the AI chat powered by Vanna + Groq.”

2) Open Dashboard (45–60s)
- Visit the Vercel URL.
- Narrate key widgets:
  - “Stats: total spend YTD, invoice count, average value.”
  - “Trends: invoice trend chart, category spend, vendor spend.”
  - “Invoices table with search and status filter.”
- Click around the dashboard pages: `/dashboard`, `/chat`.

3) API Health (20–30s)
- Open the API health endpoint in a new tab: `https://<your-api>.onrender.com/health`.
- Briefly explain: “This confirms the Express API is running and reachable by the frontend.”

4) Vanna AI Health (20–30s)
- Open the Vanna health endpoint: `https://<your-vanna>.onrender.com/health`.
- Explain: “FastAPI service for NL→SQL; trained on the same Postgres schema.”

5) AI Chat Demo (60–90s)
- Go back to the web app `/chat`.
- Ask a question: “What are the top 5 vendors by total spend this year?”
- Explain: “The question is turned into SQL against Postgres; we return the result and a concise answer.”
- Optionally show one more:
  - “Monthly spend trend for the last 6 months.”

6) Close (10–15s)
- “That’s the end-to-end demo. Thanks!”

## Tips
- Keep the mouse steady, zoom the browser if needed (Ctrl + +).
- If data is empty in production, re-run your seed script or use simpler queries (e.g., invoice counts).