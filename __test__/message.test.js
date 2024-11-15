import request from "supertest";
import app from "../src/app";
import { Message, User } from "../src/database/models";
import AuthUtil from "../src/utils/authUtil";

let token = "";
let id = "";

jest.setTimeout(59000); // Set timeout for Tests

beforeAll(async () => {
  const user = {
    username: "test01",
    password: "test01",
  };

  //hash the password
  const hash = await AuthUtil.hashPassword(user.password);

  //create a new user in the database
  await User.create({
    username: user.username,
    password: hash,
    role: "Administrator",
  });
  const response = await request(app).post("/api/auth/login").send(user);
  token = response.body.data.token;
  id = response.id;

  //tear down the messages used during the tests
  const messageData = [
    {
      message: "Hello!",
      sender: "test01",
      receiver: "test02",
      status: "ok",
    },
    {
      message: "Hi!",
      sender: "test02",
      receiver: "test01",
      status: "ok",
    },
    {
      message: "How was your weekend?",
      sender: "test01",
      receiver: "test02",
      status: "ok",
    },
    {
      message: "It was amazing, how about yours?",
      sender: "test02",
      receiver: "test01",
      status: "ok",
    },
  ];
  await Message.bulkCreate(messageData);
});

afterAll(async () => {
  //initialize messages to be used in the tests
  await Message.destroy({
    where: {},
    truncate: true, // This ensures that the table is truncated (emptied) instead of performing individual delete operations
  });

  await User.destroy({
    where: {
      username: "test01",
    },
  });
});

describe("GET /api/messages/public", () => {
  it("Should return 200 status code when the messages are returned", async () => {
    const res = await request(app)
      .get("/api/messages/public")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});

//messages filtered by both sender and receiver
describe("GET /api/messages/public?sender='sender'&receiver='receiver'", () => {
  it("Should return 200 status code when the messages with sender=test01 and receiver=test02 are returned", async () => {
    const res = await request(app)
      .get("/api/messages/public?sender=test01&receiver=test02")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});
//messages filtered by both sender only
describe("GET /api/messages/public?sender='sender'", () => {
  it("Should return 200 status code when the messages with sender=test01 are returned", async () => {
    const res = await request(app)
      .get("/api/messages/public?sender=test01")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});

//messages filtered by both receiver  only
describe("GET /api/messages/public?receiver='receiver'", () => {
  it("Should return 200 status code when the messages with receiver=test01 are returned", async () => {
    const res = await request(app)
      .get("/api/messages/public?receiver=test01")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});


//TODO: Finding more ways to test the socket part of the application 
// (covering significant amount of the project )