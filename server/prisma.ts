import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: [
    { level: "query", emit: "event" },
    { level: "info", emit: "event" },
    { level: "warn", emit: "event" },
    { level: "error", emit: "event" },
  ],
});

prisma.$on("query", (e) => {
  // Keep logging minimal in production; helpful during development
  console.debug(`prisma query: ${e.query}`);
});

export default prisma;
