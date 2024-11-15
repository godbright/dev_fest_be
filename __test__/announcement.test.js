import request from "supertest";
import app from "../src/app";
import { User } from "../src/database/models";
import { Announcement } from "../src/database/models";
import AuthUtil from "../src/utils/authUtil";
import { AnnouncementController } from "../src/controllers/announcementController";

let token = " ";
let userId = "";
let annId = "";
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
    role: "Coordinator",
  });

  //log in the user to be used in the test database
  const response = await request(app).post("/api/auth/login").send(user);
  token = response.body.data.token;
  userId = newUser.id;

  let announcement_obj = {
    user_id: userId,
    content: "Test announcement",
  };

  //create a announcement object to be used

  const res = await Announcement.create(announcement_obj);
  annId = res.id;
});

afterAll(async () => {
  // write logic to tear down the test database
  await User.destroy({
    where: {},
    truncate: true, // This ensur
    cascade: true,
  });

  await Announcement.destroy({
    where: {},
    truncate: true, // This ensures that the table is truncated (emptied) instead of performing individual delete operations
    cascade: true,
  });
});

//Create a single announcement

//send announcement
describe("Test for sending announcements", () => {
  test("Should emit announcement not provided error", async () => {
    // Mock the io.emit method
    const mockIoEmit = jest.fn();
    const mockIo = { emit: mockIoEmit };

    const anntController = new AnnouncementController(mockIo);
    let invalidAnnt = { content: "" };

    await anntController.sendAnnouncement(newUser, invalidAnnt);
    expect(mockIoEmit).toHaveBeenCalledWith("announcement", {
      data: {},
      message: "announcement not provided",
    });
  });

  test("SHould return a valid output", async () => {
    const mockIoEmit = jest.fn();
    const mockIo = { emit: mockIoEmit };

    const anntController = new AnnouncementController(mockIo);
    let validAnnt = { content: "Nyandungu is closed" };

    let ann = await anntController.sendAnnouncement(newUser, validAnnt);

    expect(mockIoEmit).toHaveBeenCalledWith("announcement", {
      data: expect.objectContaining({
        ...ann,
        username: "test_coord",
      }),
      message: "announcement was created successfully",
    });
  });
});

describe("Test invalid user to post an announcement", () => {
  test("Should emit an error if user is not found ", async () => {
    const mockIoEmit = jest.fn();
    const mockIo = { emit: mockIoEmit };

    const anntController = new AnnouncementController(mockIo);
    let validAnnt = { content: "Nyandungu is closed" };
    let invalidUser = { id: -1, username: "Nyandung" };

    await anntController.sendAnnouncement(invalidUser, validAnnt);

    expect(mockIoEmit).toHaveBeenCalledWith("announcement", {
      data: {},
      message: "user not found",
    });
  });
});

//Getting single announcement
describe("Get /api/annt/:id ", () => {
  test("Should return  200 status code when the announcement is found", async () => {
    const res = await request(app)
      .get(`/api/annt/${annId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("content");
  });
});

///get All announcements
describe("GET /api/annt ", () => {
  test("Should return 200 status code  when the announcements are found", async () => {
    const res = await request(app)
      .get("/api/annt")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    //expect the first element to have the required properties
    let i = 0;
    while (i < res.body.data.length) {
      expect(res.body.data[i]).toHaveProperty("content");
      i++;
    }
  });
});
