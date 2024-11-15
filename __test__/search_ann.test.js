import request from "supertest";
import app from "../src/app";
import { User, Announcement } from "../src/database/models";
import bcrypt from "bcrypt";

jest.setTimeout(59000); // Set timeout for Tests
let token = "";
let user_id = 0;
async function userLogin() {
  //logs in authentication user
  const user = {
    username: "bright",
    password: "bright101",
  };
  const hashedPswd = await bcrypt.hash(user.password, 10);

  let created_user = await User.create({
    username: user.username,
    password: hashedPswd,
    role: "citizen",
    status: "help",
  });
  const response = await request(app).post("/api/auth/login").send(user);
  token = response.body.data.token;
  user_id = created_user.dataValues.id;
}

async function AnnoncementCreation() {
  const announcementData = [
    {
      user_id: user_id,
      content: "Zindiro road is cloased",
    },

    {
      user_id: user_id,
      content: "All citizens living around Zindiro be aware of Flash Floods",
    },
    {
      user_id: user_id,
      content: "Be aware of Heavy Traffic at Kwamushimire",
    },
    {
      user_id: user_id,
      content: "Please do not use Zindiro road. It's flooded",
    },
  ];

  await Announcement.bulkCreate(announcementData);
}

async function announcementDestroy() {
  await Announcement.destroy({
    where: {},
    truncate: true, // This ensures that the table is truncated (emptied) instead of performing individual delete operations
    cascade: true,
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
  await AnnoncementCreation();
});

afterAll(async () => {
  await announcementDestroy();
});

//search for announcements by  keyword
describe("GET /api/annt/", () => {
  it("Should return a list of announcements", async () => {
    const res = await request(app)
      .get("/api/search/announcements?keyword=Be&offset=0&limit=10")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    let i = 0;
    //checks if username appears in the body
    while (i < res.body.length) {
      expect(res.body.data[i]).toHaveProperty("content");
      expect(res.body.data[i]).toHaveProperty("user_id");
      i++;
    }
  });

  //if keyword is not provided
  it("Should return an empty list when the keyword is not provided", async () => {
    const res = await request(app)
      .get("/api/search/announcements?&offset=0&limit=10")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });
});
