"use strict";

/* =========================================================
   STARTLAMPIÃO
   MIDDLEWARE DE AUTENTICAÇÃO JWT
========================================================= */

const jwt = require("jsonwebtoken");

/* =========================================================
   VERIFICAR TOKEN
========================================================= */

function autenticarToken(req, res, next) {

    try {

        /* -------------------------------------------------
           LER CABEÇALHO AUTHORIZATION
        ------------------------------------------------- */

        const autorizacao =
            req.headers.authorization;

        if (!autorizacao) {

            return res.status(401).json({
                sucesso: false,
                mensagem:
                    "Token de autenticação não informado."
            });

        }

        /* -------------------------------------------------
           FORMATO ESPERADO:
           Authorization: Bearer TOKEN
        ------------------------------------------------- */

        const partes =
            autorizacao.split(" ");

        if (
            partes.length !== 2 ||
            partes[0] !== "Bearer" ||
            !partes[1]
        ) {

            return res.status(401).json({
                sucesso: false,
                mensagem:
                    "Formato do token inválido."
            });

        }

        const token = partes[1];

        /* -------------------------------------------------
           VERIFICAR CONFIGURAÇÃO JWT
        ------------------------------------------------- */

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

        /* -------------------------------------------------
           VALIDAR TOKEN
        ------------------------------------------------- */

        const dadosToken =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        /* -------------------------------------------------
           GUARDAR USUÁRIO AUTENTICADO NA REQUISIÇÃO
        ------------------------------------------------- */

        req.usuario = {
            id: dadosToken.id,
            email: dadosToken.email,
            tipo: dadosToken.tipo
        };

        /* -------------------------------------------------
           CONTINUAR PARA A PRÓXIMA FUNÇÃO/ROTA
        ------------------------------------------------- */

        next();

    } catch (erro) {

        if (erro.name === "TokenExpiredError") {

            return res.status(401).json({
                sucesso: false,
                mensagem:
                    "Token expirado. Faça login novamente."
            });

        }

        if (erro.name === "JsonWebTokenError") {

            return res.status(401).json({
                sucesso: false,
                mensagem:
                    "Token inválido."
            });

        }

        console.error(
            "Erro ao validar token:",
            erro
        );

        return res.status(500).json({
            sucesso: false,
            mensagem:
                "Erro interno de autenticação."
        });

    }

}

/* =========================================================
   EXPORTAÇÃO
========================================================= */

module.exports = autenticarToken;