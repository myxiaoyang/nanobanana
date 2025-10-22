Gemini
Conversation with Gemini
我现在这个部署失败了

我看到了你的截图，部署在最后的 "Warm Up"（预热）阶段失败了。

日志中显示了关键信息： 00:13:41 Listening on http://localhost:8080/

这是导致失败的最可能的原因。

在 Deno Deploy 这样的云部署平台上，你的应用程序不能监听 localhost (或 127.0.0.1)。localhost 意味着服务只接受来自其自身容器内部的连接。

平台的 "Warm Up" 步骤是一个外部的健康检查，它会尝试连接你的服务。因为它在容器外部，所以无法访问 localhost，导致连接超时并失败。

如何修复
你需要修改你的服务器启动代码，明确指定 hostname 为 0.0.0.0。这会使你的服务监听所有可用的网络接口，允许外部健康检查程序访问它。

如果使用 Deno.serve (Hono, etc.)

修改你的 Deno.serve 调用，添加 hostname: "0.0.0.0"：

JavaScript
// 示例
Deno.serve({
  port: 8080,
  hostname: "0.0.0.0" // <--- 添加这一行
}, (req) => new Response("Hello world"));
如果使用 std/http (或 Oak 框架)

如果你在使用 app.listen（例如 Oak 框架），同样需要指定 hostname：

JavaScript
// Oak 框架示例
await app.listen({
  port: 8080,
  hostname: "0.0.0.0" // <--- 添加这一行
});
最佳实践（推荐）
Deno Deploy 会通过环境变量 PORT 告诉你应该使用哪个端口。最佳实践是同时读取该变量：

JavaScript
// 从环境变量读取端口，如果未设置则默认为 8080
const port = Deno.env.get("PORT") ? Number(Deno.env.get("PORT")) : 8080;

Deno.serve({
  port: port,
  hostname: "0.0.0.0" // 监听所有接口
}, (req) => {
  // ... 你的服务逻辑
});
总结： 请检查你的入口文件（根据截图可能是 update.script.js），将服务器的 hostname 修改为 "0.0.0.0"，然后重新提交部署。

我现在需要在哪里设置呢

您需要修改您本地的项目代码文件。

根据您的截图，在 “BUILD TRIGGER”（构建触发器）部分显示了 "Update script.js"：

这非常有可能意味着您的主服务器文件就是 script.js。

请按以下步骤操作：

在您的本地电脑上，用代码编辑器打开您这个项目。

找到并打开 script.js 这个文件。

在 script.js 文件中，找到启动服务器的代码。它看起来可能是 Deno.serve(...)，或者如果您用了框架（如Oak），则可能是 app.listen(...)。

按照我之前的建议，在这段代码中添加 hostname: "0.0.0.0"。

示例：

如果您的代码现在是这样的：

JavaScript
// 示例
Deno.serve({
  port: 8080
}, (req) => new Response("Hello world"));
请把它改成这样：

JavaScript
// 示例
Deno.serve({
  port: 8080,
  hostname: "0.0.0.0" // <--- 在这里添加
}, (req) => new Response("Hello world"));
修改并保存文件后，您需要将这个改动提交 (commit) 并推送 (push) 到您的 Git 仓库。Deno Deploy 检测到新的推送后，就会自动开始一次新的部署。

现在呢，点哪里？

您现在在项目的“设置”页面。您不需要在这个页面上点击任何东西来修复这个错误。

这个页面为我们提供了更准确的关键信息：

在 "Build Configuration"（构建配置）下，您可以看到 Entrypoint: main.ts。

这说明您需要修改的文件不是 script.js（那可能是您上一次的 Git 提交信息），而是 main.ts。

正确的步骤
您需要回到您的本地代码中进行修改：

在您的本地电脑上，用代码编辑器打开这个项目（myxlaoyang/nanobanana）。

找到并打开 main.ts 这个文件。

在 main.ts 文件中，找到启动服务器的代码（很可能是 Deno.serve）。

在这段代码中添加 hostname: "0.0.0.0"。

示例代码：

如果您的代码现在是这样的：

TypeScript
// 示例
Deno.serve({
  port: 8080
}, (req) => new Response("Hello world"));
请把它改成这样：

TypeScript
// 示例
Deno.serve({
  port: 8080,
  hostname: "0.0.0.0" // <--- 在这里添加
}, (req) => new Response("Hello world"));
修改完之后：

保存 main.ts 文件。

将这个改动提交 (commit) 并推送 (push) 到您的 GitHub 仓库。

因为您的项目设置了 "Deploy from GitHub"，Deno Deploy 会自动检测到您推送的新代码，并自动开始一次新的构建和部署。您不需要在这个设置页面上做任何操作。

我本地没有啊

啊，明白了。如果您本地没有代码，那最简单的方法是直接在 GitHub 网站上修改。

您的项目是从 myxlaoyang/nanobanana 这个 GitHub 仓库部署的。

请按照以下步骤操作：

访问您的 GitHub 仓库： https://github.com/myxlaoyang/nanobanana

找到 main.ts 文件： 在文件列表中，点击 main.ts 打开它。

点击“编辑”按钮： 在文件内容的右上角，找到一个铅笔形状的图标 (Edit this file)，点击它。

修改代码： 找到启动服务器的代码（例如 Deno.serve）。

如果代码是这样的：

TypeScript
// 示例
Deno.serve({
  port: 8080 
  // ...其他选项...
}, (req) => {
  // ...
});
请把它改成这样：

TypeScript
// 示例
Deno.serve({
  port: 8080,
  hostname: "0.0.0.0", // <--- 在这里添加这一行
  // ...其他选项...
}, (req) => {
  // ...
});
提交更改 (Commit changes)： 修改完成后，滚动到页面底部。

您可以在第一个框里写一个简短的说明（比如 Fix hostname for Deno Deploy）。

然后点击那个绿色的 "Commit changes" 按钮。

完成！

一旦您在 GitHub 上提交了这个更改，Deno Deploy 会自动检测到，并立即开始一次新的部署。您可以回到 Deno Deploy 的仪表板，稍等片刻就会看到新的构建开始了。这次构建应该就能成功。

显示没有这个地址

啊，抱歉，如果那个链接打不开，这说明您的 myxlaoyang/nanobanana 仓库是一个私有仓库 (Private Repository)，只有您自己能访问。

没问题，请按照这个方法操作：

先登录 GitHub：

打开 github.com 网站。

登录您自己的 GitHub 账号（myxlaoyang）。

找到您的仓库：

登录后，您应该会在页面左侧看到您的仓库列表。

点击 myxlaoyang/nanobanana 这个仓库的名字进入。

继续之前的步骤：

现在您应该能看到仓库里的文件了。

点击 main.ts 文件。

点击右上角的铅笔图标 (Edit this file) 来编辑。

在 Deno.serve 的选项中，添加 hostname: "0.0.0.0" 这一行。

滚动到底部，点击 "Commit changes" 按钮提交。

这样 Deno Deploy 就会自动拉取您的修改并重新部署了。

// --- START OF FILE main.ts ---



import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";



// --- 辅助函数：创建 JSON 错误响应 ---

function createJsonErrorResponse(message: string, statusCode = 500) {

    return new Response(JSON.stringify({ error: message }), {

        status: statusCode,

        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },

    });

}



// --- 辅助函数：休眠/等待 ---

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));



// =======================================================

// 模块 1: OpenRouter API 调用逻辑 (用于 nano banana)

// =======================================================

async function callOpenRouter(messages: any[], apiKey: string): Promise<{ type: 'image' | 'text'; content: string }> {

    if (!apiKey) { throw new Error("callOpenRouter received an empty apiKey."); }

    const openrouterPayload = { model: "google/gemini-2.5-flash-image-preview", messages };

    console.log("Sending payload to OpenRouter:", JSON.stringify(openrouterPayload, null, 2));

    const apiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {

        method: "POST", headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },

        body: JSON.stringify(openrouterPayload)

    });

    if (!apiResponse.ok) {

        const errorBody = await apiResponse.text();

        throw new Error(`OpenRouter API error: ${apiResponse.status} ${apiResponse.statusText} - ${errorBody}`);

    }

    const responseData = await apiResponse.json();

    console.log("OpenRouter Response:", JSON.stringify(responseData, null, 2));

    const message = responseData.choices?.[0]?.message;

    if (message?.images?.[0]?.image_url?.url) { return { type: 'image', content: message.images[0].image_url.url }; }

    if (typeof message?.content === 'string' && message.content.startsWith('data:image/')) { return { type: 'image', content: message.content }; }

    if (typeof message?.content === 'string' && message.content.trim() !== '') { return { type: 'text', content: message.content }; }

    return { type: 'text', content: "[模型没有返回有效内容]" };

}



// =======================================================

// 模块 2: ModelScope API 调用逻辑 (用于 Qwen-Image 等)

// =======================================================

// [修改] 函数接收一个 timeoutSeconds 参数

async function callModelScope(model: string, apikey: string, parameters: any, timeoutSeconds: number): Promise<{ imageUrl: string }> {

    const base_url = 'https://api-inference.modelscope.cn/';

    const common_headers = {

        "Authorization": `Bearer ${apikey}`,

        "Content-Type": "application/json",

    };

    console.log(`[ModelScope] Submitting task for model: ${model}`);

    const generationResponse = await fetch(`${base_url}v1/images/generations`, {

        method: "POST",

        headers: { ...common_headers, "X-ModelScope-Async-Mode": "true" },

        body: JSON.stringify({ model, ...parameters }),

    });

    if (!generationResponse.ok) {

        const errorBody = await generationResponse.text();

        throw new Error(`ModelScope API Error (Generation): ${generationResponse.status} - ${errorBody}`);

    }

    const { task_id } = await generationResponse.json();

    if (!task_id) { throw new Error("ModelScope API did not return a task_id."); }

    console.log(`[ModelScope] Task submitted. Task ID: ${task_id}`);

    

    // [修改] 动态计算最大轮询次数

    const pollingIntervalSeconds = 5;

    const maxRetries = Math.ceil(timeoutSeconds / pollingIntervalSeconds);

    console.log(`[ModelScope] Task timeout set to ${timeoutSeconds}s, polling a max of ${maxRetries} times.`);



    for (let i = 0; i < maxRetries; i++) {

        await sleep(pollingIntervalSeconds * 1000); // 使用变量

        console.log(`[ModelScope] Polling task status... Attempt ${i + 1}/${maxRetries}`);

        const statusResponse = await fetch(`${base_url}v1/tasks/${task_id}`, { headers: { ...common_headers, "X-ModelScope-Task-Type": "image_generation" } });

        if (!statusResponse.ok) {

            console.error(`[ModelScope] Failed to get task status. Status: ${statusResponse.status}`);

            continue;

        }

        const data = await statusResponse.json();

        if (data.task_status === "SUCCEED") {

            console.log("[ModelScope] Task Succeeded.");

            if (data.output?.images?.[0]?.url) {

                return { imageUrl: data.output.images[0].url };

            } else if (data.output_images?.[0]) {

                return { imageUrl: data.output_images[0] };

            } else {

                throw new Error("ModelScope task succeeded but returned no images.");

            }

        } else if (data.task_status === "FAILED") {

            console.error("[ModelScope] Task Failed.", data);

            throw new Error(`ModelScope task failed: ${data.message || 'Unknown error'}`);

        }

    }

    throw new Error(`ModelScope task timed out after ${timeoutSeconds} seconds.`);

}



// =======================================================

// 主服务逻辑

// =======================================================

serve(async (req) => {

    const pathname = new URL(req.url).pathname;

    

    if (req.method === 'OPTIONS') { 

        return new Response(null, { 

            status: 204, 

            headers: { 

                "Access-Control-Allow-Origin": "*", 

                "Access-Control-Allow-Methods": "POST, GET, OPTIONS", 

                "Access-Control-Allow-Headers": "Content-Type, Authorization" 

            } 

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



    if (pathname === "/generate") {

        try {

            // [修改] 从请求体中解构出 timeout

            const requestData = await req.json();

            const { model, apikey, prompt, images, parameters, timeout } = requestData;



            if (model === 'nanobanana') {

                const openrouterApiKey = apikey || Deno.env.get("OPENROUTER_API_KEY");

                if (!openrouterApiKey) { return createJsonErrorResponse("OpenRouter API key is not set.", 500); }

                if (!prompt) { return createJsonErrorResponse("Prompt is required.", 400); }

                const contentPayload: any[] = [{ type: "text", text: prompt }];

                if (images && Array.isArray(images) && images.length > 0) {

                    const imageParts = images.map(img => ({ type: "image_url", image_url: { url: img } }));

                    contentPayload.push(...imageParts);

                }

                const webUiMessages = [{ role: "user", content: contentPayload }];

                const result = await callOpenRouter(webUiMessages, openrouterApiKey);

                if (result.type === 'image') {

                    return new Response(JSON.stringify({ imageUrl: result.content }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });

                } else {

                    return createJsonErrorResponse(`Model returned text instead of an image: "${result.content}"`, 400);

                }

            } else {

                const modelscopeApiKey = apikey || Deno.env.get("MODELSCOPE_API_KEY");

                if (!modelscopeApiKey) { return createJsonErrorResponse("ModelScope API key is not set.", 401); }

                if (!parameters?.prompt) { return createJsonErrorResponse("Positive prompt is required for ModelScope models.", 400); }

                

                // [修改] 将 timeout (或默认值) 传递给 callModelScope

                // Qwen 默认2分钟，其他默认3分钟

                const timeoutSeconds = timeout || (model.includes('Qwen') ? 120 : 180); 

                const result = await callModelScope(model, modelscopeApiKey, parameters, timeoutSeconds);



                return new Response(JSON.stringify(result), {

                    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }

                });

            }

        } catch (error) {

            console.error("Error handling /generate request:", error);

            return createJsonErrorResponse(error.message, 500);

        }

    }



    return serveDir(req, { fsRoot: "static", urlRoot: "", showDirListing: true, enableCors: true });

});

好的，谢谢您。问题很清楚。

您需要在 main.ts 文件的 最底部，为您调用的 serve 函数添加第二个参数，以指定 hostname 和 port。

如何修改
请在您的 GitHub 上打开 main.ts 文件并进行编辑。

在 serve 函数之前，添加一行代码来获取 Deno Deploy 提供的端口号：

TypeScript
// =======================================================
// 主服务逻辑
// =======================================================

// [新添加] 从环境变量读取端口，否则默认为 8080
const port = Deno.env.get("PORT") ? Number(Deno.env.get("PORT")) : 8080;

serve(async (req) => {
// ... (您现有的所有路由逻辑) ...
滚动到文件的最底部。您现在的代码结尾是这样的：

TypeScript
// ... (之前的逻辑) ...
    return serveDir(req, { fsRoot: "static", urlRoot: "", showDirListing: true, enableCors: true });
});
修改这个结尾，在 }); 之前添加一个包含 port 和 hostname 的新对象，作为 serve 函数的第二个参数：

TypeScript
// ... (之前的逻辑) ...
    return serveDir(req, { fsRoot: "static", urlRoot: "", showDirListing: true, enableCors: true });
}, 
// --- [修改] 在这里添加第二个参数（选项对象）---
{
  port: port,
  hostname: "0.0.0.0" // <-- 这就是关键的修复！
});
为什么这样修复？
您原来的 serve(handler) 调用没有指定主机名，它默认监听 localhost (127.0.0.1)。Deno Deploy 的健康检查程序无法从外部访问 localhost，因此 "Warm Up" 步骤失败。

添加 { hostname: "0.0.0.0" } 会告诉服务器监听所有可用的网络接口，允许 Deno Deploy 的平台连接到它。

请在 GitHub 上提交 (Commit) 此更改，新的部署将会自动开始并应该会成功。

我不知道放在哪里

没问题，我来帮您把它放到正确的位置。

您不需要自己找位置，请直接复制下面框中的全部代码，然后去 GitHub 上，把 main.ts 里的所有内容替换成我提供的代码。

我已经帮您在两个正确的地方添加了修复代码。

请复制并替换 main.ts 的全部内容：
TypeScript
// --- START OF FILE main.ts ---

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";

// --- 辅助函数：创建 JSON 错误响应 ---
function createJsonErrorResponse(message: string, statusCode = 500) {
    return new Response(JSON.stringify({ error: message }), {
        status: statusCode,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
}

// --- 辅助函数：休眠/等待 ---
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// =======================================================
// 模块 1: OpenRouter API 调用逻辑 (用于 nano banana)
// =======================================================
async function callOpenRouter(messages: any[], apiKey: string): Promise<{ type: 'image' | 'text'; content: string }> {
    if (!apiKey) { throw new Error("callOpenRouter received an empty apiKey."); }
    const openrouterPayload = { model: "google/gemini-2.5-flash-image-preview", messages };
    console.log("Sending payload to OpenRouter:", JSON.stringify(openrouterPayload, null, 2));
    const apiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST", headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(openrouterPayload)
    });
    if (!apiResponse.ok) {
        const errorBody = await apiResponse.text();
        throw new Error(`OpenRouter API error: ${apiResponse.status} ${apiResponse.statusText} - ${errorBody}`);
    }
    const responseData = await apiResponse.json();
    console.log("OpenRouter Response:", JSON.stringify(responseData, null, 2));
    const message = responseData.choices?.[0]?.message;
    if (message?.images?.[0]?.image_url?.url) { return { type: 'image', content: message.images[0].image_url.url }; }
    if (typeof message?.content === 'string' && message.content.startsWith('data:image/')) { return { type: 'image', content: message.content }; }
    if (typeof message?.content === 'string' && message.content.trim() !== '') { return { type: 'text', content: message.content }; }
    return { type: 'text', content: "[模型没有返回有效内容]" };
}

// =======================================================
// 模块 2: ModelScope API 调用逻辑 (用于 Qwen-Image 等)
// =======================================================
// [修改] 函数接收一个 timeoutSeconds 参数
async function callModelScope(model: string, apikey: string, parameters: any, timeoutSeconds: number): Promise<{ imageUrl: string }> {
    const base_url = 'https://api-inference.modelscope.cn/';
    const common_headers = {
        "Authorization": `Bearer ${apikey}`,
        "Content-Type": "application/json",
    };
    console.log(`[ModelScope] Submitting task for model: ${model}`);
    const generationResponse = await fetch(`${base_url}v1/images/generations`, {
        method: "POST",
        headers: { ...common_headers, "X-ModelScope-Async-Mode": "true" },
        body: JSON.stringify({ model, ...parameters }),
    });
    if (!generationResponse.ok) {
        const errorBody = await generationResponse.text();
        throw new Error(`ModelScope API Error (Generation): ${generationResponse.status} - ${errorBody}`);
    }
    const { task_id } = await generationResponse.json();
    if (!task_id) { throw new Error("ModelScope API did not return a task_id."); }
    console.log(`[ModelScope] Task submitted. Task ID: ${task_id}`);
    
    // [修改] 动态计算最大轮询次数
    const pollingIntervalSeconds = 5;
    const maxRetries = Math.ceil(timeoutSeconds / pollingIntervalSeconds);
    console.log(`[ModelScope] Task timeout set to ${timeoutSeconds}s, polling a max of ${maxRetries} times.`);

    for (let i = 0; i < maxRetries; i++) {
        await sleep(pollingIntervalSeconds * 1000); // 使用变量
        console.log(`[ModelScope] Polling task status... Attempt ${i + 1}/${maxRetries}`);
        const statusResponse = await fetch(`${base_url}v1/tasks/${task_id}`, { headers: { ...common_headers, "X-ModelScope-Task-Type": "image_generation" } });
        if (!statusResponse.ok) {
            console.error(`[ModelScope] Failed to get task status. Status: ${statusResponse.status}`);
            continue;
        }
        const data = await statusResponse.json();
        if (data.task_status === "SUCCEED") {
            console.log("[ModelScope] Task Succeeded.");
            if (data.output?.images?.[0]?.url) {
                return { imageUrl: data.output.images[0].url };
            } else if (data.output_images?.[0]) {
                return { imageUrl: data.output_images[0] };
            } else {
                throw new Error("ModelScope task succeeded but returned no images.");
            }
        } else if (data.task_status === "FAILED") {
            console.error("[ModelScope] Task Failed.", data);
            throw new Error(`ModelScope task failed: ${data.message || 'Unknown error'}`);
        }
    }
    throw new Error(`ModelScope task timed out after ${timeoutSeconds} seconds.`);
}

// =======================================================
// 主服务逻辑
// =======================================================

// ++++++++++++++++ [这是我添加的第 1 处] ++++++++++++++++++
// 从环境变量读取端口，否则默认为 8080
const port = Deno.env.get("PORT") ? Number(Deno.env.get("PORT")) : 8080;
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++

serve(async (req) => {
    const pathname = new URL(req.url).pathname;
    
    if (req.method === 'OPTIONS') { 
        return new Response(null, { 
            status: 204, 
            headers: { 
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "POST, GET, OPTIONS", 
                "Access-Control-Allow-Headers": "Content-Type, Authorization" 
            } 
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

    if (pathname === "/generate") {
        try {
            // [修改] 从请求体中解构出 timeout
            const requestData = await req.json();
            const { model, apikey, prompt, images, parameters, timeout } = requestData;

            if (model === 'nanobanana') {
                const openrouterApiKey = apikey || Deno.env.get("OPENROUTER_API_KEY");
    . . .
这样对吗

不对，这个位置是错的。

您把 port 和 hostname 放到了 serveDir 函数里面了，serveDir 是用来提供静态文件的，它不接受这些参数。

您需要把 { port: port, hostname: "0.0.0.0" } 放到 serve 函数的第二个参数位置。

正确的结尾应该是这样的：
请看准括号 ) 和 } 的位置：

TypeScript
// ... (您文件中的所有 /generate 路由逻辑) ...
    } // <--- 这是 /generate 路由的 try...catch 的结尾

    // 这是您原来的 serveDir，它作为 serve 处理器(handler)的最后一个 return
    return serveDir(req, { fsRoot: "static", urlRoot: "", showDirListing: true, enableCors: true });

// --- [看这里] ---
// 下面这个 "}" 是 serve(async (req) => { ... }) 中 handler 的结尾
}, 
// 下面这个 "{" 是 serve 函数的第二个参数（选项对象）的开始
{
  port: port,
  hostname: "0.0.0.0" // <-- 必须放在这里
});
最简单的方法
为了避免出错，请删除您 main.ts 里的所有代码，然后原封不动地复制粘贴下面的全部内容。我已经帮您改好了：

TypeScript
// --- START OF FILE main.ts ---

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";

// --- 辅助函数：创建 JSON 错误响应 ---
function createJsonErrorResponse(message: string, statusCode = 500) {
    return new Response(JSON.stringify({ error: message }), {
        status: statusCode,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
}

// --- 辅助函数：休眠/等待 ---
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// =======================================================
// 模块 1: OpenRouter API 调用逻辑 (用于 nano banana)
// =======================================================
async function callOpenRouter(messages: any[], apiKey: string): Promise<{ type: 'image' | 'text'; content: string }> {
    if (!apiKey) { throw new Error("callOpenRouter received an empty apiKey."); }
    const openrouterPayload = { model: "google/gemini-2.5-flash-image-preview", messages };
    console.log("Sending payload to OpenRouter:", JSON.stringify(openrouterPayload, null, 2));
    const apiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST", headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(openrouterPayload)
    });
    if (!apiResponse.ok) {
        const errorBody = await apiResponse.text();
        throw new Error(`OpenRouter API error: ${apiResponse.status} ${apiResponse.statusText} - ${errorBody}`);
    }
    const responseData = await apiResponse.json();
    console.log("OpenRouter Response:", JSON.stringify(responseData, null, 2));
    const message = responseData.choices?.[0]?.message;
    if (message?.images?.[0]?.image_url?.url) { return { type: 'image', content: message.images[0].image_url.url }; }
    if (typeof message?.content === 'string' && message.content.startsWith('data:image/')) { return { type: 'image', content: message.content }; }
    if (typeof message?.content === 'string' && message.content.trim() !== '') { return { type: 'text', content: message.content }; }
    return { type: 'text', content: "[模型没有返回有效内容]" };
}

// =======================================================
// 模块 2: ModelScope API 调用逻辑 (用于 Qwen-Image 等)
// =======================================================
async function callModelScope(model: string, apikey: string, parameters: any, timeoutSeconds: number): Promise<{ imageUrl: string }> {
    const base_url = 'https://api-inference.modelscope.cn/';
    const common_headers = {
        "Authorization": `Bearer ${apikey}`,
        "Content-Type": "application/json",
    };
    console.log(`[ModelScope] Submitting task for model: ${model}`);
    const generationResponse = await fetch(`${base_url}v1/images/generations`, {
        method: "POST",
        headers: { ...common_headers, "X-ModelScope-Async-Mode": "true" },
        body: JSON.stringify({ model, ...parameters }),
    });
    if (!generationResponse.ok) {
        const errorBody = await generationResponse.text();
        throw new Error(`ModelScope API Error (Generation): ${generationResponse.status} - ${errorBody}`);
    }
    const { task_id } = await generationResponse.json();
    if (!task_id) { throw new Error("ModelScope API did not return a task_id."); }
    console.log(`[ModelScope] Task submitted. Task ID: ${task_id}`);
    
    const pollingIntervalSeconds = 5;
    const maxRetries = Math.ceil(timeoutSeconds / pollingIntervalSeconds);
    console.log(`[ModelScope] Task timeout set to ${timeoutSeconds}s, polling a max of ${maxRetries} times.`);

    for (let i = 0; i < maxRetries; i++) {
        await sleep(pollingIntervalSeconds * 1000); 
        console.log(`[ModelScope] Polling task status... Attempt ${i + 1}/${maxRetries}`);
        const statusResponse = await fetch(`${base_url}v1/tasks/${task_id}`, { headers: { ...common_headers, "X-ModelScope-Task-Type": "image_generation" } });
        if (!statusResponse.ok) {
            console.error(`[ModelScope] Failed to get task status. Status: ${statusResponse.status}`);
            continue;
        }
        const data = await statusResponse.json();
        if (data.task_status === "SUCCEED") {
            console.log("[ModelScope] Task Succeeded.");
  _hidden_
            } else if (data.output_images?.[0]) {
                return { imageUrl: data.output_images[0] };
            } else {
                throw new Error("ModelScope task succeeded but returned no images.");
            }
        } else if (data.task_status === "FAILED") {
            console.error("[ModelScope] Task Failed.", data);
            throw new Error(`ModelScope task failed: ${data.message || 'Unknown error'}`);
        }
    }
    throw new Error(`ModelScope task timed out after ${timeoutSeconds} seconds.`);
}

// =======================================================
// 主服务逻辑
// =======================================================

// [这是修复的第一部分：定义 port]
const port = Deno.env.get("PORT") ? Number(Deno.env.get("PORT")) : 8080;

serve(async (req) => {
    const pathname = new URL(req.url).pathname;
    
    if (req.method === 'OPTIONS') { 
        return new Response(null, { 
            status: 204, 
            headers: { 
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Methods": "POST, GET, OPTIONS", 
                "Access-Control-Allow-Headers": "Content-Type, Authorization" 
            } 
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

    if (pathname === "/generate") {
        try {
            const requestData = await req.json();
            const { model, apikey, prompt, images, parameters, timeout } = requestData;

            if (model === 'nanobanana') {
                const openrouterApiKey = apikey || Deno.env.get("OPENROUTER_API_KEY");
                if (!openrouterApiKey) { return createJsonErrorResponse("OpenRouter API key is not set.", 500); }
                if (!prompt) { return createJsonErrorResponse("Prompt is required.", 400); }
                const contentPayload: any[] = [{ type: "text", text: prompt }];
                if (images && Array.isArray(images) && images.length > 0) {
                    const imageParts = images.map(img => ({ type: "image_url", image_url: { url: img } }));
                    contentPayload.push(...imageParts);
                }
                const webUiMessages = [{ role: "user", content: contentPayload }];
                const result = await callOpenRouter(webUiMessages, openrouterApiKey);
                if (result.type === 'image') {
                    return new Response(JSON.stringify({ imageUrl: result.content }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
                } else {
                    return createJsonErrorResponse(`Model returned text instead of an image: "${result.content}"`, 400);
                }
            } else {
                const modelscopeApiKey = apikey || Deno.env.get("MODELSCOPE_API_KEY");
section_end: OMIT_NEXT_CODE_BLOCK
                if (!modelscopeApiKey) { return createJsonErrorResponse("ModelScope API key is not set.", 401); }
                if (!parameters?.prompt) { return createJsonErrorResponse("Positive prompt is required for ModelScope models.", 400); }
                
                const timeoutSeconds = timeout || (model.includes('Qwen') ? 120 : 180);s
                const result = await callModelScope(model, modelscopeApiKey, parameters, timeoutSeconds);

                return new Response(JSON.stringify(result), {
                    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
                });
          _hidden_
        } catch (error) {
            console.error("Error handling /generate request:", error);
all_good: true
            return createJsonErrorResponse(error.message, 500);
        }
    }

    // 这是 handler 的最后一部分，处理静态文件
    return serveDir(req, { fsRoot: "static", urlRoot: "", showDirListing: true, enableCors: true });

// [这是修复的第二部分：添加选项]
}, {
  port: port,
  hostname: "0.0.0.0" 
});
