"use strict";

/* =========================================================
   STARTLAMPIÃO
   ROTAS DE USUÁRIOS
========================================================= */

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

const banco = require("../config/database");
const autenticarToken = require("../middlewares/auth.middleware");

/* =========================================================
   CADASTRAR USUÁRIO
   POST /usuarios
========================================================= */

router.post("/", async (req, res) => {

    try {

        const {
            nome,
            email,
            senha,
            tipo,
            telefone
        } = req.body;

        if (!nome || !email || !senha || !tipo) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "Nome, e-mail, senha e tipo são obrigatórios."
            });

        }

        const tiposPermitidos = [
            "administrador",
            "cliente",
            "restaurante"
        ];

        if (!tiposPermitidos.includes(tipo)) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "Tipo de usuário inválido."
            });

        }

        const emailNormalizado =
            email.trim().toLowerCase();

        const [usuariosExistentes] =
            await banco.execute(
                `
                SELECT id
                FROM usuarios
                WHERE email = ?
                `,
                [emailNormalizado]
            );

        if (usuariosExistentes.length > 0) {

            return res.status(409).json({
                sucesso: false,
                mensagem:
                    "Já existe um usuário cadastrado com este e-mail."
            });

        }

        const senhaCriptografada =
            await bcrypt.hash(
                senha,
                10
            );

        const [resultado] =
            await banco.execute(
                `
                INSERT INTO usuarios
                (
                    nome,
                    email,
                    senha,
                    tipo,
                    telefone
                )
                VALUES (?, ?, ?, ?, ?)
                `,
                [
                    nome.trim(),
                    emailNormalizado,
                    senhaCriptografada,
                    tipo,
                    telefone
                        ? telefone.trim()
                        : null
                ]
            );

        return res.status(201).json({
            sucesso: true,
            mensagem:
                "Usuário cadastrado com sucesso.",
            usuario: {
                id: resultado.insertId,
                nome: nome.trim(),
                email: emailNormalizado,
                tipo,
                telefone:
                    telefone
                        ? telefone.trim()
                        : null
            }
        });

    } catch (erro) {

        console.error(
            "Erro ao cadastrar usuário:",
            erro
        );

        return res.status(500).json({
            sucesso: false,
            mensagem:
                "Erro interno ao cadastrar usuário."
        });

    }

});

/* =========================================================
   LOGIN
   POST /usuarios/login
========================================================= */

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            senha
        } = req.body;

        if (!email || !senha) {

            return res.status(400).json({
                sucesso: false,
                mensagem:
                    "E-mail e senha são obrigatórios."
            });

        }

        const emailNormalizado =
            email.trim().toLowerCase();

        const [usuarios] =
            await banco.execute(
                `
                SELECT
                    id,
                    nome,
                    email,
                    senha,
                    tipo,
                    telefone,
                    ativo
                FROM usuarios
                WHERE email = ?
                LIMIT 1
                `,
                [emailNormalizado]
            );

        if (usuarios.length === 0) {

            return res.status(401).json({
                sucesso: false,
                mensagem:
                    "E-mail ou senha inválidos."
            });

        }

        const usuario = usuarios[0];

        if (!usuario.ativo) {

            return res.status(403).json({
                sucesso: false,
                mensagem:
                    "Usuário inativo."
            });

        }

        const senhaCorreta =
            await bcrypt.compare(
                senha,
                usuario.senha
            );

        if (!senhaCorreta) {

            return res.status(401).json({
                sucesso: false,
                mensagem:
                    "E-mail ou senha inválidos."
            });

        }

        if (!process.env.JWT_SECRET) {

            console.error(
                "JWT_SECRET não configurado no arquivo .env."
            );

            return res.status(500).json({
                sucesso: false,
                mensagem:
                    "Erro interno de autenticação."
            });

        }

        const token =
            jwt.sign(
                {
                    id: usuario.id,
                    email: usuario.email,
                    tipo: usuario.tipo
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "8h"
                }
            );

        return res.status(200).json({
            sucesso: true,
            mensagem:
                "Login realizado com sucesso.",
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo,
                telefone: usuario.telefone
            }
        });

    } catch (erro) {

        console.error(
            "Erro ao realizar login:",
            erro
        );

        return res.status(500).json({
            sucesso: false,
            mensagem:
                "Erro interno ao realizar login."
        });

    }

});

/* =========================================================
   PERFIL DO USUÁRIO AUTENTICADO
   GET /usuarios/perfil

   ROTA PROTEGIDA POR JWT
========================================================= */

router.get(
    "/perfil",
    autenticarToken,
    async (req, res) => {

        try {

            const [usuarios] =
                await banco.execute(
                    `
                    SELECT
                        id,
                        nome,
                        email,
                        tipo,
                        telefone,
                        ativo,
                        criado_em
                    FROM usuarios
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [req.usuario.id]
                );

            if (usuarios.length === 0) {

                return res.status(404).json({
                    sucesso: false,
                    mensagem:
                        "Usuário não encontrado."
                });

            }

            const usuario = usuarios[0];

            if (!usuario.ativo) {

                return res.status(403).json({
                    sucesso: false,
                    mensagem:
                        "Usuário inativo."
                });

            }

            return res.status(200).json({
                sucesso: true,
                mensagem:
                    "Usuário autenticado com sucesso.",
                usuario
            });

        } catch (erro) {

            console.error(
                "Erro ao consultar perfil:",
                erro
            );

            return res.status(500).json({
                sucesso: false,
                mensagem:
                    "Erro interno ao consultar perfil."
            });

        }

    }
);

/* =========================================================
   LISTAR USUÁRIOS
   GET /usuarios
========================================================= */

router.get("/", async (req, res) => {

    try {

        const [usuarios] =
            await banco.execute(
                `
                SELECT
                    id,
                    nome,
                    email,
                    tipo,
                    telefone,
                    ativo,
                    criado_em
                FROM usuarios
                ORDER BY id DESC
                `
            );

        return res.status(200).json({
            sucesso: true,
            total: usuarios.length,
            usuarios
        });

    } catch (erro) {

        console.error(
            "Erro ao listar usuários:",
            erro
        );

        return res.status(500).json({
            sucesso: false,
            mensagem:
                "Erro interno ao listar usuários."
        });

    }

});

/* =========================================================
   EXPORTAÇÃO
========================================================= */

module.exports = router;