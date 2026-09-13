"use strict";

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           STARTLAMPIÃO
           PÁGINA INICIAL
        ===================================================== */

        const btnRestaurantes =
            document.getElementById(
                "btnRestaurantes"
            );

        const btnEntrar =
            document.getElementById(
                "btnEntrar"
            );


        /* =====================================================
           NAVEGAÇÃO
        ===================================================== */

        /*
         * A navegação principal é feita diretamente
         * pelos links definidos no index.html.
         *
         * Ver restaurantes:
         * cliente/restaurantes.html
         *
         * Entrar:
         * login.html
         *
         * O JavaScript não altera as rotas existentes,
         * evitando interferência no restante do projeto.
         */

        if (
            !btnRestaurantes ||
            !btnEntrar
        ) {

            console.warn(
                "Os links principais da página inicial não foram encontrados."
            );
        }

    }
);