import request from "supertest";
import app from "../src/app";
import { User } from "../src/database/models";
import bcrypt from "bcrypt";

let token = "";
let currentEnv = process.env.NODE_ENV;

jest.setTimeout(59000); // Set timeout for Tests

beforeAll(async () => {
  process.env.NODE_ENV = "speed_test";
  const user = {
    username: "bright",
    password: "bright101",
  };
  const hashedPswd = await bcrypt.hash(user.password, 10);

  await User.create({
    username: user.username,
    password: hashedPswd,
    role: "citizen",
  });
  const response = await request(app).post("/api/auth/login").send(user);
  token = response.body.data.token;

  //   console.log(token);
});

afterAll(async () => {
  await User.destroy({
    where: {
      username: "bright",
    },
  });
  process.env.NODE_ENV = currentEnv;
  await new Promise((resolve) => setTimeout(() => resolve(), 10000));
});
describe("Speed test", () => {
  jest.setTimeout(30000);

  it("Should use test_speed environment", async () => {
    const res = await request(app)
      .post("/api/performance/test")
      .send({
        interval: 1,
        duration: 1,
      })
      .set("Authorization", `Bearer ${token}`);
    expect(process.env.NODE_ENV).toBe("speed_test");
  });
  it("Should run the test and return results", async () => {
    const res = await request(app)
      .post("/api/performance/test")
      .send({
        interval: 1,
        duration: 1,
      })
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("terminated");
    expect(res.body.data).toHaveProperty("post_performance");
    expect(res.body.data).toHaveProperty("get_performance");
    expect(res.body.data).toHaveProperty("total_requests");
  });
  it("Should abort speed test request", async () => {
    const res = await request(app)
      .post("/api/performance/abort")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
  });
});
