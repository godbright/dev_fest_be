import request from "supertest";
import app from "../src/app";
import { User, Message } from "../src/database/models";
import bcrypt from "bcrypt";

let token = "";

jest.setTimeout(59000); // Set timeout for Tests

async function userLogin() {
  //logs in authentication user
  const user = {
    username: "bright",
    password: "bright101",
  };
  const hashedPswd = await bcrypt.hash(user.password, 10);

  await User.create({
    username: user.username,
    password: hashedPswd,
    role: "citizen",
    status: "help",
  });
  const response = await request(app).post("/api/auth/login").send(user);
  token = response.body.data.token;
}

async function MessageCreation() {
  const messageData = [
    {
      message: "Hi guys!",
      sender: "user_five",
      receiver: "all",
      status: "ok",
    },
    {
      message: "Hi!",
      sender: "user_five",
      receiver: "user_four",
      status: "ok",
    },
    {
      message: "How was your weekend?",
      sender: "user_two",
      receiver: "user_one",
      status: "ok",
    },
    {
      message: "It was amazing, how about yours?",
      sender: "user_two",
      receiver: "all",
      status: "ok",
    },
    {
      message: "What matters is no much?",
      sender: "user_five",
      receiver: "all",
      status: "ok",
    },
  ];
  await Message.bulkCreate(messageData);
}

async function messageDestroy() {
  await Message.destroy({
    where: {},
    truncate: true, // This ensures that the table is truncated (emptied) instead of performing individual delete operations
  });
  await User.destroy({
    where: {
      username: "bright",
    },
    cascade: true,
  });
}

beforeAll(async () => {
  await userLogin();
  await MessageCreation();
});

afterAll(async () => {
  await messageDestroy();
});

describe("GET /api/search/message/", () => {
  //search for public messages by keyword
  it("Should return public  messages corresponding to the keyword provided ", async () => {
    const res = await request(app)
      .get("/api/search/messages/public?keyword=H&limit=10&offset=0")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);

    if (res.body.length > 0) {
      let i = 0;

      while (i < res.body.length) {
        expect(res.body[i]).toHaveProperty("message");
        expect(res.body[i]).toHaveProperty("receiver");
        expect(res.body[i]).toHaveProperty("receiver", "all");
        i++;
      }
    } else {
      expect(res.body).toHaveProperty("message");
      expect(res.body).toHaveProperty("receiver");
      expect(res.body).toHaveProperty("receiver", "all");
    }
  });

  it("search for public messages without keyword", async () => {
    const res = await request(app)
      .get(
        "/api/search/messages/public?&limit=10&offset=0&sender=user_two&receiver=all"
      )
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(0);
  });

  //search for private messages  by keyword
  it("search for private messages by keyword", async () => {
    const res = await request(app)
      .get(
        "/api/search/messages/private?keyword=H&limit=10&offset=0&sender=user_two&receiver=user_one"
      )
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);

    if (res.body.length > 0) {
      let i = 0;

      while (i < res.body.length) {
        expect(res.body[i]).toHaveProperty("message");
        expect(res.body[i].receiver).not.toHaveProperty("all");
        expect(res.body[i]).toHaveProperty("receiver");
        i++;
      }
    } else {
      expect(res.body[0]).toHaveProperty("message");
      expect(res.body[0]).toHaveProperty("receiver");
      expect(res.body[0].receiver).not.toHaveProperty("receiver");
    }
  });
  //search for private messages  by without providing the keyword
  it("search for private messages without keyword", async () => {
    const res = await request(app)
      .get(
        "/api/search/messages/private?&limit=10&offset=0&sender=user_two&receiver=user_one"
      )
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(0);
  });
});
