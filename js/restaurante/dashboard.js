"use strict";

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           STARTLAMPIÃO
           DASHBOARD DO RESTAURANTE
        ===================================================== */

        const Storage =
            window.StartLampiaoStorage;

        const Auth =
            window.StartLampiaoAuth;


        /* =====================================================
           VERIFICAR MÓDULOS
        ===================================================== */

        if (
            !Storage ||
            !Auth
        ) {

            console.error(
                "Módulos centrais do StartLampião não carregados."
            );

            return;
        }


        /* =====================================================
           EXIGIR LOGIN DO RESTAURANTE
        ===================================================== */

        if (
            !Auth.exigirTipo(
                Auth.TIPOS.RESTAURANTE,
                "../login.html"
            )
        ) {

            return;
        }


        /* =====================================================
           IDENTIFICAR RESTAURANTE
        ===================================================== */

        const sessao =
            Auth.obterSessao();


        const restauranteId =
            sessao?.restauranteId;


        const restaurante =
            restauranteId
                ? Storage.buscarRestaurantePorId(
                    restauranteId
                )
                : null;


        /* =====================================================
           ELEMENTOS DA PÁGINA
        ===================================================== */

        const nomeRestaurante =
            document.getElementById(
                "nomeRestaurante"
            );

        const textoBoasVindas =
            document.getElementById(
                "textoBoasVindas"
            );

        const totalAguardando =
            document.getElementById(
                "totalAguardando"
            );

        const totalPreparo =
            document.getElementById(
                "totalPreparo"
            );

        const totalProntos =
            document.getElementById(
                "totalProntos"
            );

        const totalEntregadoresDisponiveis =
            document.getElementById(
                "totalEntregadoresDisponiveis"
            );

        const btnSair =
            document.getElementById(
                "btnSair"
            );


        /* =====================================================
           IDENTIFICAÇÃO VISUAL
        ===================================================== */

        if (
            nomeRestaurante
        ) {

            nomeRestaurante.textContent =
                restaurante?.nome
                ||
                sessao?.nome
                ||
                "Restaurante";
        }


        if (
            textoBoasVindas
        ) {

            textoBoasVindas.textContent =
                "Acompanhe seus pedidos, cardápio e entregadores em um só lugar.";
        }


        /* =====================================================
           PEDIDOS DO RESTAURANTE
        ===================================================== */

        function obterPedidosRestaurante() {

            const pedidos =
                Storage.listarPedidos();


            if (
                !Array.isArray(
                    pedidos
                )
            ) {

                return [];
            }


            return pedidos.filter(
                pedido =>
                    pedido.restauranteId
                    ===
                    restauranteId
            );
        }


        /* =====================================================
           ENTREGADORES DO RESTAURANTE
        ===================================================== */

        function obterEntregadoresRestaurante() {

            const entregadores =
                Storage.listarEntregadores();


            if (
                !Array.isArray(
                    entregadores
                )
            ) {

                return [];
            }


            return entregadores.filter(
                entregador =>
                    entregador.restauranteId
                    ===
                    restauranteId
            );
        }


        /* =====================================================
           ATUALIZAR RESUMO
        ===================================================== */

        function atualizarResumo() {

            const pedidos =
                obterPedidosRestaurante();


            const entregadores =
                obterEntregadoresRestaurante();


            const aguardando =
                pedidos.filter(
                    pedido =>
                        pedido.status ===
                            "novo"
                        ||
                        pedido.status ===
                            "aguardando_confirmacao"
                ).length;


            const preparo =
                pedidos.filter(
                    pedido =>
                        pedido.status ===
                        "preparando"
                ).length;


            const prontos =
                pedidos.filter(
                    pedido =>
                        pedido.status ===
                        "pronto"
                ).length;


            const entregadoresDisponiveis =
                entregadores.filter(
                    entregador =>
                        entregador.status ===
                        "disponivel"
                ).length;


            if (
                totalAguardando
            ) {

                totalAguardando.textContent =
                    aguardando;
            }


            if (
                totalPreparo
            ) {

                totalPreparo.textContent =
                    preparo;
            }


            if (
                totalProntos
            ) {

                totalProntos.textContent =
                    prontos;
            }


            if (
                totalEntregadoresDisponiveis
            ) {

                totalEntregadoresDisponiveis
                    .textContent =
                    entregadoresDisponiveis;
            }
        }


        /* =====================================================
           SAIR
        ===================================================== */

        if (
            btnSair
        ) {

            btnSair.addEventListener(
                "click",
                () => {

                    Auth.logout();

                    window.location.href =
                        "../login.html";
                }
            );
        }


        /* =====================================================
           INICIALIZAÇÃO
        ===================================================== */

        atualizarResumo();

    }
);