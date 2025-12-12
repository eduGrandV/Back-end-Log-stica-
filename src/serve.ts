import router from "./routes";

const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();
const PORT = 3005;

const authMiddleware = (req: any, res: any, next: any) => {

  const userRole = req.headers["x-user-role"] || "master";
  req.user = {
    id: "simulated_user_" + userRole,
    permissao_nivel: userRole,
    entidade_restrita_id:
      userRole === "empresa" ? "matriz" : userRole === "setor" ? "f4" : null,
  };
  next();
};

app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.use(authMiddleware);
app.use("/api", router);

app.listen(PORT, () => {
  console.log(`\nServidor natal rodando em http://localhost:${PORT}`);
});
