import axios from "axios";
import { Server } from "./types";

const servers: Server[] = [
  {
    url: "https://does-not-work.perfume.new",
    priority: 1,
  },
  {
    url: "https://gitlab.com",
    priority: 4,
  },
  {
    url: "http://app.scnt.me",
    priority: 3,
  },
  {
    url: "https://offline.scentronix.com",
    priority: 2,
  },
];

const SERVER_TIMEOUT = 5000;

const checkServer = (server: Server): Promise<Server | null> => {
  let promise = new Promise<Server | null>(async (resolve, reject) => {
    try {
      const response = await axios.get(server.url, { timeout: SERVER_TIMEOUT });
      if (response.status >= 200 && response.status < 300) {
        return resolve(server);
      }
    } catch (error) {
      // TODO: Log error
      // console.log(error);
    }
    return reject(null);
  });

  return promise;
};

export const findServer = async (): Promise<Server | null> => {
  const serverChecks = servers.map(checkServer);

  // running check in parallel
  const results = await Promise.allSettled(serverChecks);

  // Get all online servers
  const onlineServers: Server[] = [];
  for (const result of results) {
    if (result.status === "fulfilled" && result.value) {
      onlineServers.push(result.value);
    }
  }

  // if no server is online return null
  if (onlineServers.length === 0) {
    return null;
  }

  // sort online servers by priority
  onlineServers.sort((a, b) => a.priority - b.priority);

  return onlineServers[0];
};
