"use strict";

const express = require("express");
const router = express.Router();

const banco = require("../config/database");
const autenticarToken = require("../middlewares/auth.middleware");

// Verificar permissão para gerenciar categorias
async function verificarPermissao(req, restauranteId) {

    const [restaurantes] = await banco.query(
        "SELECT id, usuario_id FROM restaurantes WHERE id = ?",
        [restauranteId]
    );

    if (restaurantes.length === 0) {
        return {
            autorizado: false,
            status: 404,
            mensagem: "Restaurante não encontrado."
        };
    }

    if (req.usuario.tipo === "administrador") {
        return { autorizado: true };
    }

    if (
        req.usuario.tipo === "restaurante" &&
        Number(restaurantes[0].usuario_id) === Number(req.usuario.id)
    ) {
        return { autorizado: true };
    }

    return {
        autorizado: false,
        status: 403,
        mensagem: "Acesso não autorizado."
    };
}

// CADASTRAR CATEGORIA
router.post("/", autenticarToken, async (req, res) => {

    try {

        const { restaurante_id, nome, descricao } = req.body;

        if (
            !Number.isInteger(Number(restaurante_id)) ||
            Number(restaurante_id) <= 0 ||
            typeof nome !== "string" ||
            !nome.trim()
        ) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Informe um restaurante válido e o nome da categoria."
            });
        }

        const permissao = await verificarPermissao(req, restaurante_id);

        if (!permissao.autorizado) {
            return res.status(permissao.status).json({
                sucesso: false,
                mensagem: permissao.mensagem
            });
        }

        const [resultado] = await banco.query(
            `INSERT INTO categorias
             (restaurante_id, nome, descricao, ativo)
             VALUES (?, ?, ?, 1)`,
            [restaurante_id, nome.trim(), descricao || null]
        );

        return res.status(201).json({
            sucesso: true,
            mensagem: "Categoria cadastrada com sucesso.",
            id: resultado.insertId
        });

    } catch (erro) {

        console.error(erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao cadastrar categoria."
        });
    }
});

// LISTAR CATEGORIAS
router.get("/", async (req, res) => {

    try {

        const { restaurante_id } = req.query;

        let sql = "SELECT * FROM categorias";
        const parametros = [];

        if (restaurante_id !== undefined) {

            if (
                !Number.isInteger(Number(restaurante_id)) ||
                Number(restaurante_id) <= 0
            ) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Restaurante inválido."
                });
            }

            sql += " WHERE restaurante_id = ?";
            parametros.push(restaurante_id);
        }

        sql += " ORDER BY nome";

        const [categorias] = await banco.query(sql, parametros);

        return res.json({
            sucesso: true,
            total: categorias.length,
            categorias
        });

    } catch (erro) {

        console.error(erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao listar categorias."
        });
    }
});

// ATUALIZAR CATEGORIA
router.put("/:id", autenticarToken, async (req, res) => {

    try {

        const { id } = req.params;
        const { nome, descricao } = req.body;

        if (
            !Number.isInteger(Number(id)) ||
            Number(id) <= 0 ||
            typeof nome !== "string" ||
            !nome.trim()
        ) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "ID e nome válidos são obrigatórios."
            });
        }

        const [categorias] = await banco.query(
            "SELECT * FROM categorias WHERE id = ?",
            [id]
        );

        if (categorias.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Categoria não encontrada."
            });
        }

        const permissao = await verificarPermissao(
            req,
            categorias[0].restaurante_id
        );

        if (!permissao.autorizado) {
            return res.status(permissao.status).json({
                sucesso: false,
                mensagem: permissao.mensagem
            });
        }

        await banco.query(
            "UPDATE categorias SET nome = ?, descricao = ? WHERE id = ?",
            [nome.trim(), descricao || null, id]
        );

        return res.json({
            sucesso: true,
            mensagem: "Categoria atualizada com sucesso."
        });

    } catch (erro) {

        console.error(erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao atualizar categoria."
        });
    }
});

// ATIVAR OU DESATIVAR CATEGORIA
router.patch("/:id/status", autenticarToken, async (req, res) => {

    try {

        const { id } = req.params;
        const { ativo } = req.body;

        if (
            !Number.isInteger(Number(id)) ||
            Number(id) <= 0 ||
            typeof ativo !== "boolean"
        ) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Informe um ID válido e ativo como true ou false."
            });
        }

        const [categorias] = await banco.query(
            "SELECT * FROM categorias WHERE id = ?",
            [id]
        );

        if (categorias.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Categoria não encontrada."
            });
        }

        const permissao = await verificarPermissao(
            req,
            categorias[0].restaurante_id
        );

        if (!permissao.autorizado) {
            return res.status(permissao.status).json({
                sucesso: false,
                mensagem: permissao.mensagem
            });
        }

        await banco.query(
            "UPDATE categorias SET ativo = ? WHERE id = ?",
            [ativo ? 1 : 0, id]
        );

        return res.json({
            sucesso: true,
            mensagem: ativo
                ? "Categoria ativada com sucesso."
                : "Categoria desativada com sucesso."
        });

    } catch (erro) {

        console.error(erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao alterar status da categoria."
        });
    }
});

module.exports = router;