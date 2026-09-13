"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           STARTLAMPIÃO
           ACESSO DO RESTAURANTE
        ===================================================== */

        const Storage =
            window.StartLampiaoStorage;

        const Utils =
            window.StartLampiaoUtils;


        /* =====================================================
           VERIFICAR MÓDULOS
        ===================================================== */

        if (!Storage || !Utils) {

            console.error(
                "Erro: módulos Storage ou Utils não foram carregados."
            );

            return;
        }


        /* =====================================================
           ELEMENTOS DA PÁGINA
        ===================================================== */

        const form =
            document.getElementById(
                "formAcessoRestaurante"
            );

        const campoCodigo =
            document.getElementById(
                "codigoAcesso"
            );

        const mensagem =
            document.getElementById(
                "mensagem"
            );

        const btnValidar =
            document.getElementById(
                "btnValidar"
            );

        const dadosRestaurante =
            document.getElementById(
                "dadosRestaurante"
            );

        const nomeRestaurante =
            document.getElementById(
                "nomeRestaurante"
            );

        const emailRestaurante =
            document.getElementById(
                "emailRestaurante"
            );

        const responsavelRestaurante =
            document.getElementById(
                "responsavelRestaurante"
            );

        const statusRestaurante =
            document.getElementById(
                "statusRestaurante"
            );

        const btnContinuar =
            document.getElementById(
                "btnContinuar"
            );


        let restauranteValidado = null;


        /* =====================================================
           FORMATAR CÓDIGO
        ===================================================== */

        campoCodigo.addEventListener(
            "input",
            () => {

                campoCodigo.value =
                    campoCodigo.value
                        .toUpperCase()
                        .replace(/\s+/g, "");

            }
        );


        /* =====================================================
           VALIDAR CÓDIGO
        ===================================================== */

        form.addEventListener(
            "submit",
            (evento) => {

                evento.preventDefault();


                Utils.esconderMensagem(
                    mensagem
                );


                dadosRestaurante
                    .classList
                    .add("oculto");


                restauranteValidado = null;


                const codigo =
                    Utils.limparTexto(
                        campoCodigo.value
                    ).toUpperCase();


                if (!codigo) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "Informe o código de acesso do restaurante.",
                        "erro"
                    );

                    campoCodigo.focus();

                    return;
                }


                console.log(
                    "Código informado:",
                    codigo
                );


                const restaurante =
                    Storage.buscarRestaurantePorCodigo(
                        codigo
                    );


                console.log(
                    "Restaurante encontrado:",
                    restaurante
                );


                /* =================================================
                   RESTAURANTE NÃO ENCONTRADO
                ================================================= */

                if (!restaurante) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "Código de acesso não encontrado.",
                        "erro"
                    );

                    return;
                }


                /* =================================================
                   VERIFICAR APROVAÇÃO
                ================================================= */

                if (
                    restaurante.status !==
                    "aprovado"
                ) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "Este restaurante ainda não foi aprovado pelo administrador.",
                        "erro"
                    );

                    return;
                }


                /* =================================================
                   RESTAURANTE VALIDADO
                ================================================= */

                restauranteValidado =
                    restaurante;


                nomeRestaurante.textContent =
                    restaurante.nome ||
                    "Restaurante";


                emailRestaurante.textContent =
                    restaurante.email ||
                    "Não informado";


                responsavelRestaurante.textContent =
                    restaurante.responsavel ||
                    "Não informado";


                statusRestaurante.textContent =
                    "Aprovado";


                dadosRestaurante
                    .classList
                    .remove("oculto");


                Utils.mostrarMensagem(
                    mensagem,
                    "Código validado com sucesso.",
                    "sucesso"
                );


                console.log(
                    "Código validado com sucesso."
                );

            }
        );


        /* =====================================================
           CRIAR CONTA DO RESTAURANTE
        ===================================================== */

        btnContinuar.addEventListener(
            "click",
            () => {

                if (!restauranteValidado) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "Valide primeiro o código do restaurante.",
                        "erro"
                    );

                    return;
                }


                sessionStorage.setItem(
                    "startlampiao_restaurante_validado",
                    restauranteValidado.id
                );


                window.location.href =
                    "cadastro_conta.html";

            }
        );


        console.log(
            "acesso.js carregado corretamente."
        );

    }
);