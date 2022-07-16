import { RouterContext } from "https://deno.land/x/oak@v10.6.0/mod.ts";

import { timeoutMs } from "./constants.ts";
import { timeout } from "./utils.ts";

export const handleRun = async (context: RouterContext<"/run">) => {
  let code = context.request.url.searchParams.get("code");

  context.response.headers.set("content-type", "application/json");

  if (!code && context.request.body.length < 1024 * 1024) {
    try {
      const body = context.request.body();
      const value = await body.value;
      code = decodeURIComponent(value?.code || "");
    } catch (error) {
      console.error(error);
    }
  }

  if (!code) {
    context.response.status = 400;
    context.response.body = JSON.stringify({
      success: false,
      message: "missing property: code",
      data: null,
    });
    return;
  }

  if (typeof code === "string" && code.includes("return")) {
    try {
      const result = await Promise.race([
        Object.getPrototypeOf(async () => {}).constructor(
          `
          Deno = undefined;
          ${code}
        `,
        )(),
        timeout(timeoutMs),
      ]);

      context.response.body = JSON.stringify(result);

      return;
    } catch (error) {
      console.log(error);

      context.response.status = 500;
      // console.error(error);
      context.response.body = JSON.stringify({
        success: false,
        message: `${
          (error as Error)?.message ? (error as Error)?.message : error
        }`,
        data: null,
      });
      return;
    }
  }

  context.response.status = 400;
  context.response.body = JSON.stringify({
    success: false,
    message: "invalid code. code must have a return statement",
    data: null,
  });
};
