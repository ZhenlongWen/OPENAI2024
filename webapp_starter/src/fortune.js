import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { staticServer } from "./shared/server.ts"; // Assuming this serves static files

const app = new Application();
const router = new Router();

// API route to roll a dice
router.get("/api/d6", (ctx) => {
  const roll = Math.floor(Math.random() * 6) + 1;
  ctx.response.body = { value: roll };
});

// API test route
router.get("/api/test", (ctx) => {
  console.log("someone made a request to /api/test");
  console.log("ctx.request.url.pathname:", ctx.request.url.pathname);
  console.log("myParam:", ctx.request.url.searchParams.get("myParam"));
  console.log("ctx.request.method:", ctx.request.method);

  ctx.response.body = "This is a test.";
});

// API route to provide a fortune
router.get("/api/fortune", (ctx) => {
  const name = ctx.request.url.searchParams.get("name");
  const fortunes = [
    `Good things are coming your way, ${name}!`,
    `${name}, a pleasant surprise awaits you.`,
    `${name}, an old friend will bring you joy.`,
    `${name}, trust your instincts in the days ahead.`,
    `A great adventure is on the horizon for you, ${name}.`,
  ];

  const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
  ctx.response.body = randomFortune;
});

app.use(router.routes());
app.use(router.allowedMethods());
app.use(staticServer); // Serve static files if needed

// Use Deno Deploy's environment-provided port
const port = Number(Deno.env.get("PORT") || 8000);
console.log(`\nListening on http://localhost:${port}`);
await app.listen({ port });