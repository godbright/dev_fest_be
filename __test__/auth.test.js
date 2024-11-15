import request from "supertest";
import app from "../src/app";
import { User } from "../src/database/models";

let token = " ";

jest.setTimeout(59000); // Set timeout for Tests

afterAll(async () => {
  // write logic to tear down the test database
  await User.destroy({
    where: {
      username: "username_test",
    },
  });
});

//Tests for the register route
describe("POST /users/register", () => {
  //  check the response status code
  it("Should return the correct status code", async () => {
    const res = await request(app)
      .post("/api/users/register")
      .send({
        username: "username_test",
        password: "password_test",
      }).set("Accept", "application/json");

    token = res.body.data.token;

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message", "User was created successfully");
  });

  //check if the username has already been registered
  it("Should return the error if  username is already in the database", async () => {
    const res = await request(app)
      .post("/api/users/register")
      .send({
        username: "username_test",
        password: "password_test",
      })
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Username already exists");
  });
});

//Tests for the login route
describe("POST auth/login ", () => {
  //given username and password
  it("Should return success given username and password", async () => {
    //check the response status code
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        username: "username_test",
        password: "password_test",
      })
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Login was successful");
    expect(res.body.data).toHaveProperty("token");
  });

  it("Should return error when the password used is incorrect", async () => {
    //test providing a username not existing in the database
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        username: "username_test",
        password: "wrong_password",
      })
      .set("Accept", "application/json");

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty(
      "message",
      "Username or password incorrect"
    );
  });

  //when the password is incorrect
  it("Should return error when the username used is not in the database", async () => {
    //test providing a username not existing in the database
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        username: "wrong_username",
        password: "password_test",
      })
      .set("Accept", "application/json");

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Username not found");
  });

  //check if the response has a json content type
});


//TODO check for the names used and password test length  using unit tests 