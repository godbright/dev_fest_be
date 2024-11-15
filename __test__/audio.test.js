import { AudioController } from "../src/controllers/audioController";
import { Message } from "../src/database/models";
import { s3 } from "../src/utils/awsS3Util";
let maxAudiosize = 5;

jest.setTimeout(59000); // Set timeout for Tests

afterAll(async () => {
  await Message.destroy({
    where: {
      sender: "mock_user",
    },
  });
});

describe("Test for audio messages", () => {
  test("should emit 'No audio file found' message if buffer is empty", () => {
    // Mock the io.emit method
    const mockIoEmit = jest.fn();
    const mockIo = { emit: mockIoEmit };

    const audioController = new AudioController(mockIo);

    audioController.validateBuffer(null);

    // Expect that the io.emit method was called with the expected message
    expect(mockIoEmit).toHaveBeenCalledWith("audio-error", {
      message: "No audio file found.",
    });
  });

  test("should emit 'Audio file too large' message if size exceeds the limit", () => {
    // Mock the io.emit method
    const mockIoEmit = jest.fn();
    const mockIo = { emit: mockIoEmit };

    const audioController = new AudioController(mockIo);

    // Set a size larger than the maxAudioSize
    const largeSize = (maxAudiosize + 1) * 1024 * 1024;

    // Call the validateAudiosize method with the large size
    audioController.validateAudiosize(largeSize);

    // Expect that the io.emit method was called with the appropriate message
    expect(mockIoEmit).toHaveBeenCalledWith("audio-error", {
      message: "Audio file too large. File should be lesser than 5",
    });
  });

  test("Should generate unique audio file name of length 16", () => {
    const mockIoEmit = jest.fn();
    const mockIo = { emit: mockIoEmit };

    const audioController = new AudioController(mockIo);

    let audiofilename = AudioController.uniqueAudioFileName();
    expect(audiofilename.length).toBe(32);
  });

  test("should emit 'public-chat' event to 'community'", () => {
    // Mock the io.to().emit method
    const mockToEmit = jest.fn();
    const mockIo = { to: jest.fn(() => ({ emit: mockToEmit })) };

    const audioController = new AudioController(mockIo);

    audioController.sendPublicAudioMessage();

    // Expect that the io.to().emit method was called with the appropriate arguments
    expect(mockIo.to).toHaveBeenCalledWith("community");
    expect(mockToEmit).toHaveBeenCalledWith("public-chat", "updated");
  });

  test("should emit 'private-message-received' event with sender and receiver", () => {
    // Mock the io.emit method
    const mockIoEmit = jest.fn();
    const mockIo = { emit: mockIoEmit };

    const audioController = new AudioController(mockIo);
    const sender = "julius";
    const receiver = "esther";

    audioController.sendPrivateAudioMessage(sender, receiver);

    // Expect that the io.emit method was called with the appropriate arguments
    expect(mockIoEmit).toHaveBeenCalledWith("private-message-received", {
      sender,
      receiver,
    });
  });

  test("should save and generate url", async () => {
    const mockIoEmit = jest.fn();
    const mockIo = { emit: mockIoEmit };

    const audioController = new AudioController(mockIo);
    const audioFileName = AudioController.uniqueAudioFileName();

    const params = {
      buffer: "this is a sample buffer",
      mimeType: "audio/mpeg",
    };
    const url = await audioController.saveFileAndGenerateUrl(
      params.buffer,
      params.mimeType,
      audioFileName
    );

    expect(url).not.toBeUndefined();

    // await audioController.deleteAudioMessage(audioFileName);
  });
});
