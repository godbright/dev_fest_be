import bcrypt from "bcrypt";
import request from "supertest";
import fs from "fs";
import path from "path";
// import FormData from "form-data";

import { AttachmentController } from "../src/controllers/attachmentController";
// import { uploadToS3 } from "../src/utils/s3";
import { User } from "../src/database/models";
import app from "../src/app";

let token = "";
let req, res, next, mockedUploadToS3, mockedFile;

// jest.mock("../src/utils/s3", () => ({
//   uploadToS3: jest.fn(),
// }));

describe("AttachmentController", () => {
  describe("sendAttachment", () => {
    beforeEach(async () => {
      const filePath = path.resolve(__dirname, "test_img.png");
      const fileBuffer = fs.readFileSync(filePath);

      const user = {
        username: "jpirumvaa",
        password: "password123",
      };
      const hashedPswd = await bcrypt.hash(user.password, 10);

      await User.create({
        username: user.username,
        password: hashedPswd,
        role: "citizen",
      });
      const response = await request(app).post("/api/auth/login").send(user);
      token = response.body.data.token;

      mockedFile = fileBuffer;

      req = {
        file: mockedFile,
        body: {
          type: "image",
        },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
      mockedUploadToS3 = jest.fn();
    });

    afterEach(async () => {
      jest.clearAllMocks();
      await User.destroy({
        where: {
          username: "jpirumvaa",
        },
      });
    });
    const filePath = path.resolve(__dirname, "test_img.png");

    it("should return 400 if no file in request", async () => {
      req.file = undefined;
      const response = await request(app)
        .post("/api/attachment")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    }, 10000);

    it("should send an attachment", async () => {
      const response = await request(app)
        .post("/api/attachment")
        .attach("image", filePath)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("data");
    }, 10000);
  });
});
