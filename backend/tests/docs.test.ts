import { describe, expect, it } from "vitest";
import { api, useTestDb } from "./helpers.js";

useTestDb();

describe("API docs", () => {
  it("serves the OpenAPI JSON and Swagger UI", async () => {
    const json = await api().get("/api/docs.json");
    expect(json.status).toBe(200);
    expect(json.body.openapi).toBe("3.1.0");
    expect((await api().get("/api/docs/")).text).toContain("swagger-ui");
  });

  it("every documented endpoint really exists (no 404 NOT_FOUND route)", async () => {
    const doc = (await api().get("/api/docs.json")).body as { paths: Record<string, Record<string, unknown>> };
    const fakeId = "64b000000000000000000000";
    let checked = 0;

    for (const [path, ops] of Object.entries(doc.paths)) {
      const url = "/api/v1" + path.replace(/\{\w+\}/g, fakeId);
      for (const method of Object.keys(ops) as ("get" | "post" | "patch" | "put" | "delete")[]) {
        const res = await api()[method](url).send({});
        // any answer except "this route doesn't exist" proves the route is mounted
        const routeMissing = res.status === 404 && res.body?.error?.message?.startsWith("Route ");
        expect(routeMissing, `${method.toUpperCase()} ${path} is documented but not implemented`).toBe(false);
        checked++;
      }
    }
    expect(checked).toBeGreaterThanOrEqual(40);
  });
});
