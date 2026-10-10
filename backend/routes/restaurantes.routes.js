"use strict";

/* =========================================================
   STARTLAMPIÃO
   ROTAS DE RESTAURANTES

   API 03 - CADASTRO E LISTAGEM
   API 06 - GERENCIAMENTO ADMINISTRATIVO DE PARCEIROS
========================================================= */

const express = require("express");
const router = express.Router();

const banco = require("../config/database");
const autenticarToken = require("../middlewares/auth.middleware");

/* =========================================================
   CADASTRAR RESTAURANTE
   POST /restaurantes

   SOMENTE ADMINISTRADOR
========================================================= */

router.post("/", autenticarToken, async (req, res) => {

    try {

        // Verificar permissão

        if (req.usuario.tipo !== "administrador") {

            return res.status(403).json({
                sucesso: false,
                mensagem: "Apenas administradores podem cadastrar restaurantes."
            });

        }

        // Receber dados

        const {
            usuario_id,
            nome_fantasia,
            razao_social,
            cnpj,
            telefone,
            endereco,
            cidade,
            estado,
            cep,
            codigo_autorizacao
        } = req.body;

        // Validar campos obrigatórios

        if (!usuario_id || !nome_fantasia) {

            return res.status(400).json({
                sucesso: false,
                mensagem: "Usuário e nome do restaurante são obrigatórios."
            });

        }

        // Verificar usuário

        const [usuarios] = await banco.execute(
            `
            SELECT
                id,
                nome,
                email,
                tipo,
                ativo
            FROM usuarios
            WHERE id = ?
            LIMIT 1
            `,
            [usuario_id]
        );

        if (usuarios.length === 0) {

            return res.status(404).json({
                sucesso: false,
                mensagem: "Usuário informado não foi encontrado."
            });

        }

        const usuarioRestaurante = usuarios[0];

        if (usuarioRestaurante.tipo !== "restaurante") {

            return res.status(400).json({
                sucesso: false,
                mensagem: "O usuário informado não é uma conta de restaurante."
            });

        }

        if (!usuarioRestaurante.ativo) {

            return res.status(400).json({
                sucesso: false,
                mensagem: "O usuário do restaurante está inativo."
            });

        }

        // Verificar se usuário já possui restaurante

        const [restaurantesUsuario] = await banco.execute(
            `
            SELECT id
            FROM restaurantes
            WHERE usuario_id = ?
            LIMIT 1
            `,
            [usuario_id]
        );

        if (restaurantesUsuario.length > 0) {

            return res.status(409).json({
                sucesso: false,
                mensagem: "Este usuário já está vinculado a um restaurante."
            });

        }

        // Verificar CNPJ

        if (cnpj) {

            const [restaurantesCnpj] = await banco.execute(
                `
                SELECT id
                FROM restaurantes
                WHERE cnpj = ?
                LIMIT 1
                `,
                [cnpj.trim()]
            );

            if (restaurantesCnpj.length > 0) {

                return res.status(409).json({
                    sucesso: false,
                    mensagem: "Já existe um restaurante cadastrado com este CNPJ."
                });

            }

        }

        // Verificar código de autorização

        if (codigo_autorizacao) {

            const [restaurantesCodigo] = await banco.execute(
                `
                SELECT id
                FROM restaurantes
                WHERE codigo_autorizacao = ?
                LIMIT 1
                `,
                [codigo_autorizacao.trim()]
            );

            if (restaurantesCodigo.length > 0) {

                return res.status(409).json({
                    sucesso: false,
                    mensagem: "Este código de autorização já está sendo utilizado."
                });

            }

        }

        // Cadastrar restaurante

        const [resultado] = await banco.execute(
            `
            INSERT INTO restaurantes
            (
                usuario_id,
                nome_fantasia,
                razao_social,
                cnpj,
                telefone,
                endereco,
                cidade,
                estado,
                cep,
                codigo_autorizacao,
                aprovado,
                ativo
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                usuario_id,
                nome_fantasia.trim(),
                razao_social ? razao_social.trim() : null,
                cnpj ? cnpj.trim() : null,
                telefone ? telefone.trim() : null,
                endereco ? endereco.trim() : null,
                cidade ? cidade.trim() : null,
                estado ? estado.trim().toUpperCase() : null,
                cep ? cep.trim() : null,
                codigo_autorizacao ? codigo_autorizacao.trim() : null,
                true,
                true
            ]
        );

        return res.status(201).json({
            sucesso: true,
            mensagem: "Restaurante cadastrado com sucesso.",
            restaurante: {
                id: resultado.insertId,
                usuario_id,
                nome_fantasia: nome_fantasia.trim(),
                razao_social: razao_social ? razao_social.trim() : null,
                cnpj: cnpj ? cnpj.trim() : null,
                telefone: telefone ? telefone.trim() : null,
                endereco: endereco ? endereco.trim() : null,
                cidade: cidade ? cidade.trim() : null,
                estado: estado ? estado.trim().toUpperCase() : null,
                cep: cep ? cep.trim() : null,
                codigo_autorizacao: codigo_autorizacao
                    ? codigo_autorizacao.trim()
                    : null,
                aprovado: true,
                ativo: true
            }
        });

    } catch (erro) {

        console.error("Erro ao cadastrar restaurante:", erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro interno ao cadastrar restaurante."
        });

    }

});

/* =========================================================
   LISTAR RESTAURANTES
   GET /restaurantes
========================================================= */

router.get("/", async (req, res) => {

    try {

        const [restaurantes] = await banco.execute(
            `
            SELECT
                r.id,
                r.usuario_id,
                r.nome_fantasia,
                r.razao_social,
                r.cnpj,
                r.telefone,
                r.endereco,
                r.cidade,
                r.estado,
                r.cep,
                r.codigo_autorizacao,
                r.aprovado,
                r.ativo,
                r.criado_em,
                u.nome AS nome_usuario,
                u.email AS email_usuario
            FROM restaurantes r
            INNER JOIN usuarios u
                ON u.id = r.usuario_id
            ORDER BY r.id DESC
            `
        );

        return res.status(200).json({
            sucesso: true,
            total: restaurantes.length,
            restaurantes
        });

    } catch (erro) {

        console.error("Erro ao listar restaurantes:", erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro interno ao listar restaurantes."
        });

    }

});

/* =========================================================
   API 06 - GERENCIAMENTO ADMINISTRATIVO DE PARCEIROS

   APROVAR OU REPROVAR RESTAURANTE

   PATCH /restaurantes/:id/aprovacao
========================================================= */

router.patch("/:id/aprovacao", autenticarToken, async (req, res) => {

    try {

        // Verificar se é administrador

        if (req.usuario.tipo !== "administrador") {

            return res.status(403).json({
                sucesso: false,
                mensagem: "Apenas administradores podem gerenciar parceiros."
            });

        }

        const { id } = req.params;
        const { aprovado } = req.body;

        // Validar ID e aprovação

        if (
            !Number.isSafeInteger(Number(id)) ||
            Number(id) <= 0 ||
            typeof aprovado !== "boolean"
        ) {

            return res.status(400).json({
                sucesso: false,
                mensagem: "Informe um ID válido e aprovado como true ou false."
            });

        }

        // Verificar se restaurante existe

        const [restaurantes] = await banco.execute(
            "SELECT id FROM restaurantes WHERE id = ?",
            [id]
        );

        if (restaurantes.length === 0) {

            return res.status(404).json({
                sucesso: false,
                mensagem: "Restaurante não encontrado."
            });

        }

        // Atualizar aprovação

        await banco.execute(
            "UPDATE restaurantes SET aprovado = ? WHERE id = ?",
            [aprovado ? 1 : 0, id]
        );

        return res.status(200).json({
            sucesso: true,
            mensagem: aprovado
                ? "Restaurante aprovado com sucesso."
                : "Restaurante reprovado com sucesso.",
            restaurante_id: Number(id),
            aprovado
        });

    } catch (erro) {

        console.error("Erro ao atualizar aprovação:", erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro interno ao atualizar aprovação do restaurante."
        });

    }

});

/* =========================================================
   API 06 - GERENCIAMENTO ADMINISTRATIVO DE PARCEIROS

   ATIVAR OU DESATIVAR RESTAURANTE

   PATCH /restaurantes/:id/status
========================================================= */

router.patch("/:id/status", autenticarToken, async (req, res) => {

    try {

        // Verificar se é administrador

        if (req.usuario.tipo !== "administrador") {

            return res.status(403).json({
                sucesso: false,
                mensagem: "Apenas administradores podem gerenciar parceiros."
            });

        }

        const { id } = req.params;
        const { ativo } = req.body;

        // Validar ID e status

        if (
            !Number.isSafeInteger(Number(id)) ||
            Number(id) <= 0 ||
            typeof ativo !== "boolean"
        ) {

            return res.status(400).json({
                sucesso: false,
                mensagem: "Informe um ID válido e ativo como true ou false."
            });

        }

        // Verificar se restaurante existe

        const [restaurantes] = await banco.execute(
            "SELECT id FROM restaurantes WHERE id = ?",
            [id]
        );

        if (restaurantes.length === 0) {

            return res.status(404).json({
                sucesso: false,
                mensagem: "Restaurante não encontrado."
            });

        }

        // Atualizar status

        await banco.execute(
            "UPDATE restaurantes SET ativo = ? WHERE id = ?",
            [ativo ? 1 : 0, id]
        );

        return res.status(200).json({
            sucesso: true,
            mensagem: ativo
                ? "Restaurante ativado com sucesso."
                : "Restaurante desativado com sucesso.",
            restaurante_id: Number(id),
            ativo
        });

    } catch (erro) {

        console.error("Erro ao atualizar status:", erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro interno ao atualizar status do restaurante."
        });

    }

});

/* =========================================================
   EXPORTAÇÃO
========================================================= */

module.exports = router;