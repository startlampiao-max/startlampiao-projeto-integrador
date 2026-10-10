"use strict";

/* =========================================================
   STARTLAMPIÃO
   BACK-END - SERVIDOR PRINCIPAL
   PROJETO INTEGRADOR II - ENTREGA 3
========================================================= */

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const banco = require("./config/database");

/* =========================================================
   ROTAS
========================================================= */

// API 01 e 02 - Cadastro, login e autenticação
const usuariosRoutes =
    require("./routes/usuarios.routes");

// Rotas de restaurantes
const restaurantesRoutes =
    require("./routes/restaurantes.routes");

// API 05 - Gerenciamento de categorias (Robson)
const categoriasRoutes =
    require("./routes/categorias.routes");

// API 07 e 08 - Pedidos e atualização de status (Eudes)
const pedidosRoutes =
    require("./routes/pedidos.routes");

/* =========================================================
   APLICAÇÃO
========================================================= */

const app = express();

const PORT = process.env.PORT || 3000;

/* =========================================================
   MIDDLEWARES
========================================================= */

app.use(cors());

app.use(express.json());

/* =========================================================
   REGISTRO DAS ROTAS
========================================================= */

// Usuários
app.use(
    "/usuarios",
    usuariosRoutes
);

// Restaurantes
app.use(
    "/restaurantes",
    restaurantesRoutes
);

// API 05 - Categorias
app.use(
    "/categorias",
    categoriasRoutes
);

// API 07 e 08 - Pedidos
app.use(
    "/pedidos",
    pedidosRoutes
);

/* =========================================================
   ROTA INICIAL
========================================================= */

app.get("/", (req, res) => {

    res.json({
        sucesso: true,
        mensagem: "API StartLampião funcionando!"
    });

});

/* =========================================================
   TESTE DE CONEXÃO COM O BANCO DE DADOS
========================================================= */

async function testarBanco() {

    try {

        const conexao =
            await banco.getConnection();

        console.log(
            "Banco de dados MySQL conectado com sucesso."
        );

        conexao.release();

    } catch (erro) {

        console.error(
            "Erro ao conectar ao MySQL:"
        );

        console.error(
            erro.message
        );

    }

}

/* =========================================================
   INICIALIZAÇÃO DO SERVIDOR
========================================================= */

app.listen(
    PORT,
    async () => {

        console.log("");

        console.log(
            "=========================================="
        );

        console.log(
            "   STARTLAMPIÃO - BACK-END"
        );

        console.log(
            "=========================================="
        );

        console.log(
            `Servidor funcionando na porta ${PORT}`
        );

        console.log(
            `Acesse: http://localhost:${PORT}`
        );

        console.log(
            "=========================================="
        );

        console.log("");

        await testarBanco();

    }
);