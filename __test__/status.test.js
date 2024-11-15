import request from "supertest";
import app from "../src/app";
import { User } from "../src/database/models";
import bcrypt from "bcrypt";
import { StatusController } from "../src/controllers/statusController";

let token = "";

jest.setTimeout(59000); // Set timeout for Tests
let userObj;

beforeAll(async () => {
  const user = {
    username: "jpirumva",
    password: "password",
  };
  const hashedPswd = await bcrypt.hash(user.password, 10);

  await User.create({
    username: user.username,
    password: hashedPswd,
    role: "citizen",
  });

  userObj = await User.findOne({
    where: {
      username: "jpirumva",
    },
  });
  const response = await request(app).post("/api/auth/login").send(user);
  token = response.body.data.token;
});

afterAll(async () => {
  await User.destroy({
    where: {
      username: "jpirumva",
    },
  });
});

describe("Share status", () => {
  it("Should get all available statuses", async () => {
    const res = await request(app)
      .get("/api/status")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("data");
  });
});

describe("Validate status message", () => {
  test("should return invalid status when status is not present .", () => {
    const mockIoEmit = jest.fn();
    const mockIo = { emit: mockIoEmit };

    let sample = {};
    const statusController = new StatusController(mockIo);

    statusController.validateStatusMessage(sample);

    expect(mockIoEmit).toHaveBeenCalledWith("status", {
      data: {},
      message: "invalid status",
    });
  });

  test("should return invalid status when status is not emergency, help, ok or undefined.", () => {
    const mockIoEmit = jest.fn();
    const mockIo = { emit: mockIoEmit };

    let sample = {
      status: "testing",
    };
    const statusController = new StatusController(mockIo);

    statusController.validateStatusMessage(sample);

    expect(mockIoEmit).toHaveBeenCalledWith("status", {
      data: {},
      message: "Status can either be: ok, help, or emergency",
    });
  });

  test("should return status when payload is valid.", () => {
    const mockIoEmit = jest.fn();
    const mockIo = { emit: mockIoEmit };

    let sample = {
      status: "ok",
    };
    const statusController = new StatusController(mockIo);

    const result = statusController.validateStatusMessage(sample);

    expect(result).toBe("ok");
  });

  // added test cases status
  test("Test if user updating status doesn't exist in DB", async () => {
    const mockIoEmit = jest.fn();
    const mockIo = { emit: mockIoEmit };

    let sample = {
      status: "ok",
    };
    let testUser = {
      id: -1,
      role: "citizen",
    };
    const statusController = new StatusController(mockIo);

    await statusController.updateStatus(testUser, sample);

    expect(mockIoEmit).toHaveBeenCalledWith("status", {
      data: {},
      message: "User not found",
    });
  });

  test("Updating status for valid user.", async () => {
    const mockIoEmit = jest.fn();
    const mockIo = { emit: mockIoEmit };

    let sample = {
      status: "ok",
    };

    const statusController = new StatusController(mockIo);
    await statusController.updateStatus(userObj, sample);

    expect(mockIoEmit).toHaveBeenCalledWith(
      "status",
      expect.objectContaining({
        message: "updated",
      })
    );
  });
});
