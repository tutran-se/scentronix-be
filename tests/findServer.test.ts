import nock from "nock";
import { findServer } from "../src/findServer";

describe("findServer", () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.abortPendingRequests();
  });

  it("should resolve with the online server with the lowest priority", async () => {
    nock("https://does-not-work.perfume.new").get("/").replyWithError("Network error");
    nock("http://app.scnt.me").get("/").reply(200);
    nock("https://gitlab.com").get("/").reply(200);
    nock("https://offline.scentronix.com").get("/").replyWithError("Network error");

    const result = await findServer();
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(result.url).toBe("http://app.scnt.me");
    }
  });

  it("should return null if no servers are online", async () => {
    nock("https://does-not-work.perfume.new").get("/").replyWithError("Network error");
    nock("https://gitlab.com").get("/").replyWithError("Network error");
    nock("http://app.scnt.me").get("/").replyWithError("Network error");
    nock("https://offline.scentronix.com").get("/").replyWithError("Network error");

    const result = await findServer();
    expect(result).toBeNull();
  });

  it("should handle server timeouts gracefully", async () => {
    nock("https://does-not-work.perfume.new").get("/").delay(6000).reply(200);
    nock("https://gitlab.com").get("/").reply(200);
    nock("http://app.scnt.me").get("/").replyWithError("Network error");
    nock("https://offline.scentronix.com").get("/").replyWithError("Network error");

    const result = await findServer();
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(result.url).toBe("https://gitlab.com");
    }
  }, 10000);

  it("should prioritize the server with the lowest priority if multiple are online", async () => {
    nock("https://does-not-work.perfume.new").get("/").reply(200);
    nock("https://gitlab.com").get("/").reply(200);
    nock("http://app.scnt.me").get("/").reply(200);
    nock("https://offline.scentronix.com").get("/").reply(200);

    const result = await findServer();
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(result.url).toBe("https://does-not-work.perfume.new");
    }
  });

  it("should handle a mix of online and offline servers and return the one with the lowest priority", async () => {
    nock("https://does-not-work.perfume.new").get("/").replyWithError("Network error");
    nock("https://gitlab.com").get("/").reply(200);
    nock("http://app.scnt.me").get("/").reply(200);
    nock("https://offline.scentronix.com").get("/").replyWithError("Network error");

    const result = await findServer();
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(result.url).toBe("http://app.scnt.me");
    }
  });
});
