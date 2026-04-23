/**
 * Cloudflare Worker: Claude API Proxy with Password Auth
 *
 * 環境変数 (wrangler secret):
 *   ANTHROPIC_API_KEY  - Anthropic API キー
 *   APP_PASSWORD       - アプリのアクセスパスワード
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-App-Password",
};

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // POST only
    if (request.method !== "POST") {
      return jsonResponse(405, { error: "Method not allowed" });
    }

    // Password check
    const password = request.headers.get("X-App-Password") || "";
    if (password !== env.APP_PASSWORD) {
      return jsonResponse(401, { error: "Unauthorized" });
    }

    try {
      const body = await request.text();

      // Forward to Anthropic API
      const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body,
      });

      const data = await anthropicRes.text();

      return new Response(data, {
        status: anthropicRes.status,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      return jsonResponse(500, { error: err.message });
    }
  },
};

function jsonResponse(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}
