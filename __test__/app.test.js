import request from "supertest";
import app from "../src/app";

jest.setTimeout(59000); // Set timeout for Tests

describe("Entry file", () => {
  it("Should return welcoming message", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
  });
  it("Should return a success on ping", async () => {
    const res = await request(app).get("/api/ping");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
  });
  it("Should return 404 if the endpoint is not found", async () => {
    const res = await request(app).get("/api/not_found");
    expect(res.status).toBe(404);
  });
});
