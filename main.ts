// --- START OF FILE main.ts ---

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";

// --- 辅助函数：创建 JSON 错误响应 ---
function createJsonErrorResponse(message: string, statusCode = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status: statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

// --- 辅助函数：休眠/等待 ---
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// =======================================================
// 模块 1: OpenRouter API 调用逻辑 (用于 nanobanana)
// =======================================================
async function callOpenRouter(
  messages: any[],
  apiKey: string,
): Promise<{ type: "image" | "text"; content: string }> {
  if (!apiKey) {
    throw new Error("callOpenRouter received an empty apiKey.");
  }

  const openrouterPayload = {
    model: "google/gemini-2.5-flash-image-preview",
    messages,
  };

  const apiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(openrouterPayload),
  });

  if (!apiResponse.ok) {
    const errorBody = await apiResponse.text();
    throw new Error(`OpenRouter API error: ${apiResponse.status} ${apiResponse.statusText} - ${errorBody}`);
  }

  const responseData = await apiResponse.json();
  const message = responseData.choices?.[0]?.message;

  if (message?.images?.[0]?.image_url?.url) {
    return { type: "image", content: message.images[0].image_url.url };
  }

  if (typeof message?.content === "string" && message.content.startsWith("data:image/")) {
    return { type: "image", content: message.content };
  }

  if (typeof message?.content === "string" && message.content.trim() !== "") {
    return { type: "text", content: message.content };
  }

  return { type: "text", content: "[模型没有返回有效内容]" };
}

// =======================================================
// 模块 2: ModelScope API 调用逻辑 (用于 Qwen-Image 等)
// =======================================================
async function callModelScope(
  model: string,
  apikey: string,
  parameters: any,
  timeoutSeconds: number,
): Promise<{ imageUrl: string }> {
  const base_url = "https://api-inference.modelscope.cn/";
  const common_headers = {
    Authorization: `Bearer ${apikey}`,
    "Content-Type": "application/json",
  };

  const generationResponse = await fetch(`${base_url}v1/images/generations`, {
    method: "POST",
    headers: { ...common_headers, "X-ModelScope-Async-Mode": "true" },
    body: JSON.stringify({ model, ...parameters }),
  });

  if (!generationResponse.ok) {
    const errorBody = await generationResponse.text();
    throw new Error(`ModelScope API Error (Generation): ${generationResponse.status} - ${errorBody}`);
  }

  const genJson = await generationResponse.json();
  const task_id = genJson?.task_id;
  if (!task_id) {
    throw new Error("ModelScope API did not return a task_id.");
  }

  const pollingIntervalSeconds = 5;
  const maxRetries = Math.ceil(timeoutSeconds / pollingIntervalSeconds);

  for (let i = 0; i < maxRetries; i++) {
    await sleep(pollingIntervalSeconds * 1000);

    const statusResponse = await fetch(`${base_url}v1/tasks/${task_id}`, {
      headers: { ...common_headers, "X-ModelScope-Task-Type": "image_generation" },
    });

    if (!statusResponse.ok) {
      // 非致命：继续下一次重试
      continue;
    }

    const data = await statusResponse.json();

    if (data.task_status === "SUCCEED") {
      if (data.output?.images?.[0]?.url) {
        return { imageUrl: data.output.images[0].url };
      } else if (Array.isArray(data.output_images) && data.output_images[0]) {
        return { imageUrl: data.output_images[0] };
      } else {
        throw new Error("ModelScope task succeeded but returned no images.");
      }
    } else if (data.task_status === "FAILED") {
      throw new Error(`ModelScope task failed: ${data.message || "Unknown error"}`);
    }

    // 如果是 PENDING / RUNNING / 等其他状态，继续等待下一轮
  }

  throw new Error(`ModelScope task timed out after ${timeoutSeconds} seconds.`);
}

// =======================================================
// 主服务逻辑
// =======================================================
const port = Deno.env.get("PORT") ? Number(Deno.env.get("PORT")) : 8080;

serve(
  async (req: Request) => {
    const pathname = new URL(req.url).pathname;

    // CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    if (pathname === "/api/key-status") {
      const isSet = !!Deno.env.get("OPENROUTER_API_KEY");
      return new Response(JSON.stringify({ isSet }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    if (pathname === "/api/modelscope-key-status") {
      const isSet = !!Deno.env.get("MODELSCOPE_API_KEY");
      return new Response(JSON.stringify({ isSet }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    if (pathname === "/generate" && req.method === "POST") {
      try {
        const requestData = await req.json();
        const { model, apikey, prompt, images, parameters, timeout } = requestData;

        if (model === "nanobanana") {
          const openrouterApiKey = apikey || Deno.env.get("OPENROUTER_API_KEY");
          if (!openrouterApiKey) {
            return createJsonErrorResponse("OpenRouter API key is not set.", 500);
          }
          if (!prompt) {
            return createJsonErrorResponse("Prompt is required.", 400);
          }

          const contentPayload: any[] = [{ type: "text", text: prompt }];
          if (images && Array.isArray(images) && images.length > 0) {
            const imageParts = images.map((img: string) => ({ type: "image_url", image_url: { url: img } }));
            contentPayload.push(...imageParts);
          }

          const result = await callOpenRouter(contentPayload, String(openrouterApiKey));

          if (result.type === "image") {
            return new Response(JSON.stringify({ imageUrl: result.content }), {
              headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            });
          } else {
            return createJsonErrorResponse(`Model returned text instead of an image: "${result.content}"`, 400);
          }
        } else {
          const modelscopeApiKey = apikey || Deno.env.get("MODELSCOPE_API_KEY");
          if (!modelscopeApiKey) {
            return createJsonErrorResponse("ModelScope API key is not set.", 401);
          }
          if (!parameters?.prompt) {
            return createJsonErrorResponse("Positive prompt is required for ModelScope models.", 400);
          }

          const timeoutSeconds = timeout || (String(model).includes("Qwen") ? 120 : 180);
          const result = await callModelScope(String(model), String(modelscopeApiKey), parameters, timeoutSeconds);

          return new Response(JSON.stringify(result), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          });
        }
      } catch (error) {
        return createJsonErrorResponse(String(error?.message ?? error), 500);
      }
    }

    // 静态文件处理
    return serveDir(req, { fsRoot: "static", urlRoot: "", showDirListing: true, enableCors: true });
  },
  {
    port,
    hostname: "0.0.0.0",
  },
);

// --- END OF FILE main.ts ---
