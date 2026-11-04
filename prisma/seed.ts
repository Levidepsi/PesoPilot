import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  console.log(
    "Schema ready. Register your own business at http://localhost:3000/login",
  );
}
main().finally(() => db.$disconnect());
