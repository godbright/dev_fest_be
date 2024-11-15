import { SettingsController } from "../src/controllers/settingController";
import AuthUtil from "../src/utils/authUtil";
import request from "supertest";
import app from "../src/app";
import { User } from "../src/database/models";
let token = " ";
let userId = "";
let newUser;

jest.setTimeout(59000); // Set timeout for Tests

//Use hooks to add custom data into the test database
beforeAll(async () => {
  //write logic to initialize the databas with mock data
  const user = {
    username: "test_coord",
    password: "test_password",
  };

  //hash the password
  const hashpassword = await AuthUtil.hashPassword(user.password);

  //create a new user in the database
  newUser = await User.create({
    username: user.username,
    password: hashpassword,
    role: "Administrator",
  });

  //log in the user to be used in the test database
  const response = await request(app).post("/api/auth/login").send(user);
  token = response.body.data.token;
  userId = newUser.id;
});

afterAll(async () => {
  // write logic to tear down the test database
  await User.destroy({
    where: {},
    truncate: true, // This ensur
    cascade: true,
  });
});

describe("Test invalid user to post an announcement", () => {
  test("Should emit an error if user is not valid ", async () => {
    const mockIoEmit = jest.fn();
    const mockIo = { emit: mockIoEmit };

    const setController = new SettingsController(mockIo);
    let UsrObj = {
      id: 4,
      username: "zumnba",
      isActiveAccount: true,
    };

    await setController.updateUser(UsrObj);

    expect(mockIoEmit).toHaveBeenCalledWith("settings", {
      data: {},
      message: "user not found",
    });
  });
});

describe("Test invalid user to post an announcement", () => {
  test("Should emit an error if user is not valid ", async () => {
    const mockIoEmit = jest.fn();
    const mockIo = { emit: mockIoEmit };

    const setController = new SettingsController(mockIo);
    let UsrObj = {
      id: userId,
      username: "zumnba",
      isActiveAccount: true,
    };

    let updatedUser = await setController.updateUser(UsrObj);

    expect(mockIoEmit).toHaveBeenCalledWith("User-info-updated", {
      data: updatedUser,
      message: "User information was updated successfully",
    });
  });
});
