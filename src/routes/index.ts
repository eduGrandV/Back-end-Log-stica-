import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { Mutex } from 'async-mutex';

import { AuthUser, UploadPayload, PermissaoNivel } from "../types/backend.js";

const prisma = new PrismaClient();
const router = Router();
const saveMutex = new Mutex();

router.post("/filiais", async (req: any, res: any) => {
  const { entidadeId, nomeCampanha, filiais }: UploadPayload = req.body;

  const user: AuthUser = req.user || {
    permissao_nivel: "master",
    entidade_restrita_id: null,
  };

  if (!entidadeId || !nomeCampanha || !filiais) {
    return res.status(400).json({ error: "Dados incompletos." });
  }

  try {
    if (
      user.permissao_nivel !== "master" &&
      user.entidade_restrita_id !== entidadeId
    ) {
      return res
        .status(403)
        .json({ error: "Acesso negado. Não pode escrever nesta entidade." });
    }

    const novaCampanha = await prisma.campaign.create({
      data: {
        nomeCampanha: nomeCampanha,
        entidadeId: entidadeId,
        dadosPlanilha: filiais as any,
      },
    });

    res.status(201).json({
      message: "Dados salvos com sucesso!",
      campanhaId: novaCampanha.id,
    });
  } catch (error) {
    console.error("ERRO PRISMA DETALHADO:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

router.post("/natal", async (req: any, res: any) => {
  const { entidadeId, nomeCampanha, filiais }: UploadPayload = req.body;

  const user: AuthUser = req.user || {
    permissao_nivel: "master",
    entidade_restrita_id: null,
  };

  if (!entidadeId || !nomeCampanha || !filiais) {
    return res.status(400).json({ error: "Dados incompletos." });
  }

  try {
    if (
      user.permissao_nivel !== "master" &&
      user.entidade_restrita_id !== entidadeId
    ) {
      return res
        .status(403)
        .json({ error: "Acesso negado. Não pode escrever nesta entidade." });
    }


    const novaCampanha = await prisma.campaignNatal.create({
      data: {
        nomeCampanha: nomeCampanha,
        entidadeId: entidadeId,
        dadosPlanilha: filiais as any,
      },
    });

    res.status(201).json({
      message: "Campanha de Natal salva com sucesso!",
      campanhaId: novaCampanha.id,
    });
  } catch (error) {
    console.error("ERRO PRISMA NATAL:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

router.get("/dashboard-data", async (req: any, res: any) => {
  const user: AuthUser = req.user;

  try {
    let entidadeIdsPermitidos: string[] = [];

    if (user.permissao_nivel === "master") {
      const todas = await prisma.entity.findMany({ select: { id: true } });
      entidadeIdsPermitidos = todas.map((e) => e.id);
    } else {
      const base = user.entidade_restrita_id;
      if (!base) {
        return res.status(403).json({ error: "Permissão inválida." });
      }

      if (user.permissao_nivel === "setor") {
        entidadeIdsPermitidos = [base];
      } else {
        const filhas = await prisma.entity.findMany({
          where: { parentId: base },
          select: { id: true },
        });
        entidadeIdsPermitidos = [base, ...filhas.map((f) => f.id)];
      }
    }

    const campanhas = await prisma.campaign.findMany({
      where: { entidadeId: { in: entidadeIdsPermitidos } },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      campanhas,
      entidadeIdsPermitidos,
      entidades: await prisma.entity.findMany(),
    });
  } catch (error) {
    console.error("Erro no Dashboard:", error);
    res.status(500).json({ error: "Erro interno." });
  }
});

router.get("/dashboard-dataN", async (req: any, res: any) => {
  const user: AuthUser = req.user;

  try {
    let entidadeIdsPermitidos: string[] = [];

    if (user.permissao_nivel === "master") {
      const todas = await prisma.entity.findMany({ select: { id: true } });
      entidadeIdsPermitidos = todas.map((e) => e.id);
    } else {
      const base = user.entidade_restrita_id;
      if (!base) {
        return res.status(403).json({ error: "Permissão inválida." });
      }

      if (user.permissao_nivel === "setor") {
        entidadeIdsPermitidos = [base];
      } else {
        const filhas = await prisma.entity.findMany({
          where: { parentId: base },
          select: { id: true },
        });
        entidadeIdsPermitidos = [base, ...filhas.map((f) => f.id)];
      }
    }

    const campanhas = await prisma.campaignNatal.findMany({
      where: { entidadeId: { in: entidadeIdsPermitidos } },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      campanhas,
      entidadeIdsPermitidos,
      entidades: await prisma.entity.findMany(),
    });
  } catch (error) {
    console.error("Erro no Dashboard:", error);
    res.status(500).json({ error: "Erro interno." });
  }
});


router.put("/filiais", async (req: any, res: any) => {
  // dados enviados no corpo front para back
  const { campanhaId, filiais } = req.body;
  const user: AuthUser = req.user || {
    permissao_nivel: "master",
    entidade_restrita_id: null,
  };

  if (!campanhaId || !filiais) {
    return res.status(400).json({ error: "Dados incompletos" });
  }

  try {
    //busca a campanha
    const campanhaExistente = await prisma.campaign.findUnique({
      where: { id: campanhaId },
      select: { entidadeId: true },
    });
    if (!campanhaExistente) {
      return res.status(400).json({ error: "Campanha não encontrada" });
    }

    //verifica se o usuario pode editar
    if (
      user.permissao_nivel !== "master" &&
      user.entidade_restrita_id !== campanhaExistente.entidadeId
    ) {
      return res.status(403).json({
        error:
          "Acesso negado. Você não tem permissão para alterar estes dados.",
      });
    }

    //atualiza os dados
    const campanhaAtualizada = await prisma.campaign.update({
      where: { id: campanhaId },
      data: {
        dadosPlanilha: filiais as any,
      },
    });
    res.status(200).json({
      message: "Dados atualizados com sucesso!",
      id: campanhaAtualizada.id,
    });
  } catch (error) {
    console.error("ERRO PUT /filiais:", error);
    res.status(500).json({ error: "Erro interno ao atualizar dados." });
  }
});


router.put("/natal", async (req: any, res: any) => {
  // 1. Recebemos os dados do Frontend (formato NOVO)
  const { campanhaId, filialNome, chapa, dadosNovos } = req.body;

  // 2. Log para debug (vai aparecer no seu terminal preto do PC)
  console.log("Recebido PUT /natal:", { campanhaId, filialNome, chapa });

  // 3. Validação do formato NOVO
  if (!campanhaId || !chapa || !dadosNovos) {
    // Se faltar isso, devolvemos erro. 
    // O erro antigo pedia "filiais", este pede "dadosNovos".
    return res.status(400).json({ 
        error: "Dados incompletos. Esperado: campanhaId, chapa e dadosNovos." 
    });
  }

  const user = req.user || { permissao_nivel: "master", entidade_restrita_id: null };

  try {
    await saveMutex.runExclusive(async () => {

      const campanhaExistente = await prisma.campaignNatal.findUnique({
        where: { id: campanhaId },
      });

      if (!campanhaExistente) {
        throw new Error("Campanha não encontrada no banco.");
      }

      if (user.permissao_nivel !== "master") {
        if (campanhaExistente.entidadeId !== user.entidade_restrita_id) {
          throw new Error("Acesso negado.");
        }
      }

      const dadosAtuais = campanhaExistente.dadosPlanilha as any[];

      const novosDadosPlanilha = dadosAtuais.map((filial: any) => {
        if (filial.nome === filialNome) {
          const novasSecoes = filial.secoes.map((secao: any) => {
            const novosColaboradores = secao.colaboradores.map((col: any) => {
              if (String(col.chapa) === String(chapa)) {
                return { ...col, ...dadosNovos }; 
              }
              return col;
            });
            return { ...secao, colaboradores: novosColaboradores };
          });
          return { ...filial, secoes: novasSecoes };
        }
        return filial;
      });

      await prisma.campaignNatal.update({
        where: { id: campanhaId },
        data: { dadosPlanilha: novosDadosPlanilha },
      });

    }); 

    return res.status(200).json({ message: "Salvo com sucesso!" });

  } catch (error: any) {
    console.error("Erro no Backend:", error);
    const msg = error.message || "Erro interno";
    return res.status(500).json({ error: msg }); 
  }
});

export default router;
