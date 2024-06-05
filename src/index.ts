import { Server } from "./types";
import { findServer } from "./findServer";

const main = async () => {
  const onlineServerWithLowestPrority: Server | null = await findServer();
  if (!onlineServerWithLowestPrority) {
    console.info("No server is online");
    return;
  }

  console.log("=====================================");
  console.info("Server with lowest priority is:", onlineServerWithLowestPrority?.url);
  console.info("Priority:", onlineServerWithLowestPrority?.priority);
  console.log("=====================================");
};

main();
