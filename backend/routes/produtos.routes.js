const express = require("express");
const router = express.Router();
const db = require("../config/database");

// ======================================================
// API 04 - GERENCIAMENTO DE PRODUTOS
// STARTLAMPIÃO
// ======================================================

// ------------------------------------------------------
// CADASTRAR PRODUTO
// POST /produtos
// ------------------------------------------------------
router.post("/", async (req, res) => {
    try {
        const {
            restaurante_id,
            categoria_id,
            nome,
            descricao,
            preco,
            imagem
        } = req.body;

        // Campos obrigatórios
        if (!restaurante_id || !categoria_id || !nome || preco === undefined) {
            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "restaurante_id, categoria_id, nome e preco são obrigatórios."
            });
        }

        // Verificar se o restaurante existe
        const [restaurantes] = await db.query(
            "SELECT id FROM restaurantes WHERE id = ? AND ativo = 1",
            [restaurante_id]
        );

        if (restaurantes.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Restaurante não encontrado."
            });
        }

        // Verificar se a categoria existe e pertence ao restaurante
        const [categorias] = await db.query(
            `SELECT id
             FROM categorias
             WHERE id = ?
             AND restaurante_id = ?
             AND ativo = 1`,
            [categoria_id, restaurante_id]
        );

        if (categorias.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem:
                    "Categoria não encontrada para este restaurante."
            });
        }

        // Cadastrar produto
        const [resultado] = await db.query(
            `INSERT INTO produtos
            (
                restaurante_id,
                categoria_id,
                nome,
                descricao,
                preco,
                imagem,
                disponivel
            )
            VALUES (?, ?, ?, ?, ?, ?, 1)`,
            [
                restaurante_id,
                categoria_id,
                nome,
                descricao || null,
                preco,
                imagem || null
            ]
        );

        return res.status(201).json({
            sucesso: true,
            mensagem: "Produto cadastrado com sucesso.",
            produto: {
                id: resultado.insertId,
                restaurante_id,
                categoria_id,
                nome,
                descricao: descricao || null,
                preco,
                imagem: imagem || null,
                disponivel: 1
            }
        });
    } catch (erro) {
        console.error("Erro ao cadastrar produto:", erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro interno ao cadastrar produto."
        });
    }
});

// ------------------------------------------------------
// LISTAR PRODUTOS
// GET /produtos
// ------------------------------------------------------
router.get("/", async (req, res) => {
    try {
        const [produtos] = await db.query(
            `SELECT
                p.id,
                p.restaurante_id,
                p.categoria_id,
                p.nome,
                p.descricao,
                p.preco,
                p.imagem,
                p.disponivel,
                p.criado_em,
                c.nome AS categoria,
                r.nome_fantasia AS restaurante
             FROM produtos p
             INNER JOIN categorias c
                ON c.id = p.categoria_id
             INNER JOIN restaurantes r
                ON r.id = p.restaurante_id
             ORDER BY p.id DESC`
        );

        return res.status(200).json({
            sucesso: true,
            total: produtos.length,
            produtos
        });
    } catch (erro) {
        console.error("Erro ao listar produtos:", erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro interno ao listar produtos."
        });
    }
});

module.exports = router;