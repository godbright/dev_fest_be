import request from "supertest";
import app from "../src/app";
import { User } from "../src/database/models";
import bcrypt from "bcrypt";

let token = "";
jest.setTimeout(59000); // Set timeout for Tests

async function newLogin() {
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

async function userCreation() {
  // Creates testing users
  const userInfo = [
    {
      username: "user_one",
      password: "pass01",
      role: "citizen",
      status: "help",
    },
    {
      username: "user_two",
      password: "pass02",
      role: "citizen",
      status: "emergency",
    },
    {
      username: "user_three",
      password: "pass03",
      role: "citizen",
      status: "help",
    },
    {
      username: "user_four",
      password: "pass04",
      role: "citizen",
      status: "help",
    },
    {
      username: "user_five",
      password: "pass01",
      role: "citizen",
      status: "help",
    },
  ];

  // Hash the passwords for each user
  for (let user of userInfo) {
    // Hash the password
    const hashedPswd = await bcrypt.hash(user.password, 10);
    // Update the user object with the hashed password
    user.password = hashedPswd;
  }

  // Create users with hashed passwords
  await User.bulkCreate(userInfo);
}

async function resourcesDestroy() {
  //destroys all the resources created

  await User.destroy({
    where: {},
    truncate: true, // This ensur
    cascade: true,
  });
}

beforeAll(async () => {
  await newLogin();
  await userCreation();
});

afterAll(async () => {
  await resourcesDestroy();
});

//search for users  by username || status || (username & status)
describe("GET /api/search/users", () => {
  it("Should return a list of users based on the username", async () => {
    const res = await request(app)
      .get("/api/search/users?username=user_five")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    let i = 0;
    //checks if username appears in the body
    while (i < res.body.length) {
      expect(res.body[i]).toHaveProperty("username");
      expect(res.body[i]).toHaveProperty("role");
      i++;
    }
  });

  it("Should return a list of user based on their status ", async () => {
    const res = await request(app)
      .get("/api/search/users?status=help")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    let i = 0;
    //checks if username appears in the body
    while (i < res.body.length) {
      expect(res.body[i]).toHaveProperty("username");
      expect(res.body[i]).toHaveProperty("role");
      i++;
    }
  });
  it("Should return a list of user based on their status and username ", async () => {
    const res = await request(app)
      .get("/api/search/users?status=help&username=bright")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    let i = 0;
    //checks if username appears in the body
    while (i < res.body.length) {
      expect(res.body[i]).toHaveProperty("username");
      expect(res.body[i]).toHaveProperty("role");
      i++;
    }
  });

  it("Should return  an empty list username or status not provided ", async () => {
    const res = await request(app)
      .get("/api/search/users")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });
});
