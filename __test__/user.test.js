import request from "supertest";
import app from "../src/app";
import { User } from "../src/database/models";
import AuthUtil from "../src/utils/authUtil";

let token = " ";
let id = "";

jest.setTimeout(59000); // Set timeout for Tests

//Use hooks to add custom data into the test database
beforeAll(async () => {
  //write logic to initialize the databas with mock data
  const user = {
    username: "test_user",
    password: "test_password",
  };

  //hash the password
  const hashpassword = await AuthUtil.hashPassword(user.password);

  //create a new user in the database
  const newUser = await User.create({
    username: user.username,
    password: hashpassword,
    role: "Administrator",
  });

  //log in the user to be used in the test database
  const response = await request(app).post("/api/auth/login").send(user);
  token = response.body.data.token;
  id = newUser.id;
});

afterAll(async () => {
  // write logic to tear down the test database
  await User.destroy({
    where: {
      username: "test_user",
    },
  });
});

//test for the get single user route
describe("GET /users/:userId", () => {
  //check if the user id is present in the header
  // check if the request header has a property called  id

  it("Should return 401 when token is not provided ", async () => {
    //check if the response has a status code 200
    //check to make sure the response do not have a password property
    const res = await request(app).get(`/api/users/${id}`);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Token not provided");
    expect(res.body).not.toHaveProperty("password");
  });

  it("Should return 200 status code when the user is returned", async () => {
    //check if the response has a status code 200
    //check to make sure the response do not have a password property
    const res = await request(app)
      .get(`/api/users/${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);

    expect(res.body).not.toHaveProperty("password");
  });
});

//test for the get all the  users route
describe("GET /users/", () => {
  it("Should return 401 when token is not provided ", async () => {
    //check if the response has a status code 200
    //check to make sure the response do not have a password property
    const res = await request(app).get(`/api/users/`);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Token not provided");
    expect(res.body).not.toHaveProperty("password");
  });

  //check if the response has a status code 200
  it("Should return 200 status code when the users are returned", async () => {
    const res = await request(app)
      .get("/api/users/")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).not.toHaveProperty("password");
  });
  //check to make sure the response do not have a password property
});

//test for get all online users route
describe("GET /users/sorted", () => {
  it("Should return 401 when token is not provided ", async () => {
    //check if the response has a status code 200
    //check to make sure the response do not have a password property
    const res = await request(app).get("/api/users/sorted");

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Token not provided");
    expect(res.body).not.toHaveProperty("password");
  });

  //check to make sure the response do not have a password property
  //check if the status code 200
  it("Should return 200 status code when the users are returned", async () => {
    const res = await request(app)
      .get("/api/users/sorted")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).not.toHaveProperty("password");
  });
});
