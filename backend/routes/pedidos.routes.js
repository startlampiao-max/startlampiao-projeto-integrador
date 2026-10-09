"use strict";

/* =====================================================
   STARTLAMPIÃO — API 07
   GERENCIAMENTO DE PEDIDOS
===================================================== */

const express = require("express");
const router = express.Router();

const banco = require("../config/database");
const autenticarToken = require("../middlewares/auth.middleware");

/* =====================================================
   CADASTRAR NOVO PEDIDO
   POST /pedidos
===================================================== */

router.post("/", autenticarToken, async (req, res) => {
    let conexao;

    try {
        const clienteId = Number(req.usuario.id);

        const {
            restaurante_id,
            endereco_entrega,
            forma_pagamento,
            observacao,
            itens
        } = req.body;

        const restauranteId = Number(restaurante_id);

        // Validar informações obrigatórias
        if (
            !Number.isInteger(clienteId) ||
            clienteId <= 0 ||
            !Number.isInteger(restauranteId) ||
            restauranteId <= 0 ||
            typeof endereco_entrega !== "string" ||
            !endereco_entrega.trim() ||
            endereco_entrega.length > 255 ||
            !["pix", "dinheiro"].includes(forma_pagamento) ||
            !Array.isArray(itens) ||
            itens.length === 0
        ) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Dados do pedido inválidos."
            });
        }

        if (
            observacao != null &&
            (typeof observacao !== "string" ||
             observacao.length > 255)
        ) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Observação inválida."
            });
        }

        // Validar itens e impedir produtos repetidos
        const produtosInformados = new Set();

        for (const item of itens) {
            if (
                !item ||
                !Number.isInteger(item.produto_id) ||
                item.produto_id <= 0 ||
                !Number.isInteger(item.quantidade) ||
                item.quantidade <= 0 ||
                item.quantidade > 1000 ||
                (
                    item.observacao != null &&
                    (typeof item.observacao !== "string" ||
                     item.observacao.length > 255)
                ) ||
                produtosInformados.has(item.produto_id)
            ) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Lista de produtos inválida."
                });
            }

            produtosInformados.add(item.produto_id);
        }

        conexao = await banco.getConnection();
        await conexao.beginTransaction();

        // Confirmar se o restaurante pode receber pedidos
        const [restaurantes] = await conexao.query(
            `SELECT id
             FROM restaurantes
             WHERE id = ? AND ativo = 1 AND aprovado = 1`,
            [restauranteId]
        );

        if (restaurantes.length === 0) {
            await conexao.rollback();

            return res.status(404).json({
                sucesso: false,
                mensagem: "Restaurante não disponível."
            });
        }

        let totalCentavos = 0;
        const itensCalculados = [];

        // Consultar os preços diretamente no banco
        for (const item of itens) {
            const [produtos] = await conexao.query(
                `SELECT id, preco
                 FROM produtos
                 WHERE id = ?
                   AND restaurante_id = ?
                   AND disponivel = 1`,
                [item.produto_id, restauranteId]
            );

            if (produtos.length === 0) {
                await conexao.rollback();

                return res.status(400).json({
                    sucesso: false,
                    mensagem: `Produto ${item.produto_id} indisponível.`
                });
            }

            const precoCentavos = Math.round(
                Number(produtos[0].preco) * 100
            );

            if (
                !Number.isSafeInteger(precoCentavos) ||
                precoCentavos < 0
            ) {
                throw new Error("Preço inválido no banco de dados.");
            }

            const subtotalCentavos =
                precoCentavos * item.quantidade;

            totalCentavos += subtotalCentavos;

            if (
                !Number.isSafeInteger(subtotalCentavos) ||
                !Number.isSafeInteger(totalCentavos) ||
                totalCentavos > 999999999
            ) {
                await conexao.rollback();

                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Valor do pedido excede o limite permitido."
                });
            }

            itensCalculados.push({
                produto_id: item.produto_id,
                quantidade: item.quantidade,
                preco_unitario: (precoCentavos / 100).toFixed(2),
                subtotal: (subtotalCentavos / 100).toFixed(2),
                observacao: item.observacao || null
            });
        }

        const total = (totalCentavos / 100).toFixed(2);

        // Registrar pedido
        const [resultado] = await conexao.query(
            `INSERT INTO pedidos
             (cliente_id, restaurante_id, endereco_entrega,
              forma_pagamento, total, observacao)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                clienteId,
                restauranteId,
                endereco_entrega.trim(),
                forma_pagamento,
                total,
                observacao || null
            ]
        );

        const pedidoId = resultado.insertId;

        // Registrar os itens
        for (const item of itensCalculados) {
            await conexao.query(
                `INSERT INTO itens_pedido
                 (pedido_id, produto_id, quantidade,
                  preco_unitario, subtotal, observacao)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    pedidoId,
                    item.produto_id,
                    item.quantidade,
                    item.preco_unitario,
                    item.subtotal,
                    item.observacao
                ]
            );
        }

        await conexao.commit();

        return res.status(201).json({
            sucesso: true,
            mensagem: "Pedido cadastrado com sucesso!",
            pedido: {
                id: pedidoId,
                cliente_id: clienteId,
                restaurante_id: restauranteId,
                total,
                status: "pendente",
                itens: itensCalculados
            }
        });

    } catch (erro) {
        if (conexao) {
            try {
                await conexao.rollback();
            } catch (_) {
                // A conexão pode ter sido encerrada.
            }
        }

        console.error("Erro ao cadastrar pedido:", erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao cadastrar pedido."
        });

    } finally {
        if (conexao) {
            conexao.release();
        }
    }
});

/* =====================================================
   CONSULTAR PEDIDOS DO CLIENTE
   GET /pedidos
===================================================== */

router.get("/", autenticarToken, async (req, res) => {
    try {
        const clienteId = Number(req.usuario.id);

        if (!Number.isInteger(clienteId) || clienteId <= 0) {
            return res.status(401).json({
                sucesso: false,
                mensagem: "Usuário não identificado."
            });
        }

        const [pedidos] = await banco.query(
            `SELECT *
             FROM pedidos
             WHERE cliente_id = ?
             ORDER BY criado_em DESC, id DESC`,
            [clienteId]
        );

        return res.json({
            sucesso: true,
            pedidos
        });

    } catch (erro) {
        console.error("Erro ao consultar pedidos:", erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao consultar pedidos."
        });
    }
});

module.exports = router;
/* =========================================================
   API 08 - ACOMPANHAMENTO E ATUALIZACAO DE PEDIDOS
========================================================= */

// CONSULTAR STATUS DE UM PEDIDO
router.get("/:id/status", autenticarToken, async (req, res) => {
    try {
        const pedidoId = Number(req.params.id);

        if (!Number.isInteger(pedidoId) || pedidoId <= 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "ID do pedido inválido."
            });
        }

        const [pedidos] = await banco.execute(
            `SELECT p.id, p.cliente_id, p.restaurante_id,
                    p.status, p.total, p.criado_em,
                    r.usuario_id AS dono_restaurante
             FROM pedidos p
             INNER JOIN restaurantes r ON r.id = p.restaurante_id
             WHERE p.id = ?`,
            [pedidoId]
        );

        if (pedidos.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Pedido não encontrado."
            });
        }

        const pedido = pedidos[0];
        const usuario = req.usuario;

        const autorizado =
            usuario.tipo === "administrador" ||
            (usuario.tipo === "cliente" &&
                Number(pedido.cliente_id) === Number(usuario.id)) ||
            (usuario.tipo === "restaurante" &&
                Number(pedido.dono_restaurante) === Number(usuario.id));

        if (!autorizado) {
            return res.status(403).json({
                sucesso: false,
                mensagem: "Você não tem permissão para consultar este pedido."
            });
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: "Status consultado com sucesso.",
            pedido: {
                id: pedido.id,
                status: pedido.status,
                total: pedido.total,
                criado_em: pedido.criado_em
            }
        });

    } catch (erro) {
        console.error("Erro ao consultar status:", erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao consultar status do pedido."
        });
    }
});


// ATUALIZAR STATUS DE UM PEDIDO
router.patch("/:id/status", autenticarToken, async (req, res) => {
    try {
        const pedidoId = Number(req.params.id);
        const { status } = req.body;

        if (!Number.isInteger(pedidoId) || pedidoId <= 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "ID do pedido inválido."
            });
        }

        const statusPermitidos = [
            "pendente",
            "confirmado",
            "preparando",
            "pronto",
            "saiu_para_entrega",
            "entregue",
            "cancelado"
        ];

        if (!statusPermitidos.includes(status)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Status informado é inválido."
            });
        }

        const [pedidos] = await banco.execute(
            `SELECT p.id, p.status,
                    r.usuario_id AS dono_restaurante
             FROM pedidos p
             INNER JOIN restaurantes r ON r.id = p.restaurante_id
             WHERE p.id = ?`,
            [pedidoId]
        );

        if (pedidos.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Pedido não encontrado."
            });
        }

        const pedido = pedidos[0];
        const usuario = req.usuario;

        const autorizado =
            usuario.tipo === "administrador" ||
            (usuario.tipo === "restaurante" &&
                Number(pedido.dono_restaurante) === Number(usuario.id));

        if (!autorizado) {
            return res.status(403).json({
                sucesso: false,
                mensagem: "Você não tem permissão para atualizar este pedido."
            });
        }

        const proximosStatus = {
            pendente: ["confirmado", "cancelado"],
            confirmado: ["preparando", "cancelado"],
            preparando: ["pronto", "cancelado"],
            pronto: ["saiu_para_entrega", "cancelado"],
            saiu_para_entrega: ["entregue"],
            entregue: [],
            cancelado: []
        };

        if (!proximosStatus[pedido.status]?.includes(status)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: `Não é permitido alterar de ${pedido.status} para ${status}.`
            });
        }

        const [resultado] = await banco.execute(
            `UPDATE pedidos
             SET status = ?
             WHERE id = ? AND status = ?`,
            [status, pedidoId, pedido.status]
        );

        if (resultado.affectedRows === 0) {
            return res.status(409).json({
                sucesso: false,
                mensagem: "O pedido foi atualizado por outra operação. Consulte o status novamente."
            });
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: "Status atualizado com sucesso.",
            pedido: {
                id: pedidoId,
                status_anterior: pedido.status,
                status_atual: status
            }
        });

    } catch (erro) {
        console.error("Erro ao atualizar status:", erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao atualizar status do pedido."
        });
    }
});
