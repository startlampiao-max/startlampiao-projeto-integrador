"use strict";

/* =========================================================
   STARTLAMPIÃO
   ROTAS DE RESTAURANTES
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

router.post(
    "/",
    autenticarToken,
    async (req, res) => {

        try {

            /* -------------------------------------------------
               VERIFICAR PERMISSÃO
            ------------------------------------------------- */

            if (req.usuario.tipo !== "administrador") {

                return res.status(403).json({
                    sucesso: false,
                    mensagem:
                        "Apenas administradores podem cadastrar restaurantes."
                });

            }

            /* -------------------------------------------------
               RECEBER DADOS
            ------------------------------------------------- */

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

            /* -------------------------------------------------
               VALIDAR CAMPOS OBRIGATÓRIOS
            ------------------------------------------------- */

            if (!usuario_id || !nome_fantasia) {

                return res.status(400).json({
                    sucesso: false,
                    mensagem:
                        "Usuário e nome do restaurante são obrigatórios."
                });

            }

            /* -------------------------------------------------
               VERIFICAR USUÁRIO
            ------------------------------------------------- */

            const [usuarios] =
                await banco.execute(
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
                    mensagem:
                        "Usuário informado não foi encontrado."
                });

            }

            const usuarioRestaurante = usuarios[0];

            if (usuarioRestaurante.tipo !== "restaurante") {

                return res.status(400).json({
                    sucesso: false,
                    mensagem:
                        "O usuário informado não é uma conta de restaurante."
                });

            }

            if (!usuarioRestaurante.ativo) {

                return res.status(400).json({
                    sucesso: false,
                    mensagem:
                        "O usuário do restaurante está inativo."
                });

            }

            /* -------------------------------------------------
               VERIFICAR SE USUÁRIO JÁ POSSUI RESTAURANTE
            ------------------------------------------------- */

            const [restaurantesUsuario] =
                await banco.execute(
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
                    mensagem:
                        "Este usuário já está vinculado a um restaurante."
                });

            }

            /* -------------------------------------------------
               VERIFICAR CNPJ
            ------------------------------------------------- */

            if (cnpj) {

                const [restaurantesCnpj] =
                    await banco.execute(
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
                        mensagem:
                            "Já existe um restaurante cadastrado com este CNPJ."
                    });

                }

            }

            /* -------------------------------------------------
               VERIFICAR CÓDIGO DE AUTORIZAÇÃO
            ------------------------------------------------- */

            if (codigo_autorizacao) {

                const [restaurantesCodigo] =
                    await banco.execute(
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
                        mensagem:
                            "Este código de autorização já está sendo utilizado."
                    });

                }

            }

            /* -------------------------------------------------
               CADASTRAR RESTAURANTE
            ------------------------------------------------- */

            const [resultado] =
                await banco.execute(
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

                        razao_social
                            ? razao_social.trim()
                            : null,

                        cnpj
                            ? cnpj.trim()
                            : null,

                        telefone
                            ? telefone.trim()
                            : null,

                        endereco
                            ? endereco.trim()
                            : null,

                        cidade
                            ? cidade.trim()
                            : null,

                        estado
                            ? estado.trim().toUpperCase()
                            : null,

                        cep
                            ? cep.trim()
                            : null,

                        codigo_autorizacao
                            ? codigo_autorizacao.trim()
                            : null,

                        true,
                        true
                    ]
                );

            /* -------------------------------------------------
               RESPOSTA
            ------------------------------------------------- */

            return res.status(201).json({
                sucesso: true,
                mensagem:
                    "Restaurante cadastrado com sucesso.",
                restaurante: {
                    id: resultado.insertId,
                    usuario_id,
                    nome_fantasia:
                        nome_fantasia.trim(),
                    razao_social:
                        razao_social
                            ? razao_social.trim()
                            : null,
                    cnpj:
                        cnpj
                            ? cnpj.trim()
                            : null,
                    telefone:
                        telefone
                            ? telefone.trim()
                            : null,
                    endereco:
                        endereco
                            ? endereco.trim()
                            : null,
                    cidade:
                        cidade
                            ? cidade.trim()
                            : null,
                    estado:
                        estado
                            ? estado.trim().toUpperCase()
                            : null,
                    cep:
                        cep
                            ? cep.trim()
                            : null,
                    codigo_autorizacao:
                        codigo_autorizacao
                            ? codigo_autorizacao.trim()
                            : null,
                    aprovado: true,
                    ativo: true
                }
            });

        } catch (erro) {

            console.error(
                "Erro ao cadastrar restaurante:",
                erro
            );

            return res.status(500).json({
                sucesso: false,
                mensagem:
                    "Erro interno ao cadastrar restaurante."
            });

        }

    }
);

/* =========================================================
   LISTAR RESTAURANTES
   GET /restaurantes
========================================================= */

router.get("/", async (req, res) => {

    try {

        const [restaurantes] =
            await banco.execute(
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

        console.error(
            "Erro ao listar restaurantes:",
            erro
        );

        return res.status(500).json({
            sucesso: false,
            mensagem:
                "Erro interno ao listar restaurantes."
        });

    }

});

/* =========================================================
   EXPORTAÇÃO
========================================================= */

module.exports = router;