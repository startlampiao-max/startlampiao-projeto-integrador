"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           STARTLAMPIÃO
           DASHBOARD DO ADMINISTRADOR
           ===================================================== */


        const Storage =
            window.StartLampiaoStorage;

        const Auth =
            window.StartLampiaoAuth;

        const Utils =
            window.StartLampiaoUtils;


        /* =====================================================
           VERIFICAÇÃO DOS MÓDULOS
           ===================================================== */

        if (
            !Storage ||
            !Auth ||
            !Utils
        ) {

            console.error(
                "Os módulos do StartLampião não foram carregados."
            );

            return;
        }


        /* =====================================================
           PROTEÇÃO DA PÁGINA
           ===================================================== */

        const acessoPermitido =
            Auth.exigirTipo(
                Auth.TIPOS.ADMIN,
                "../login.html"
            );


        if (!acessoPermitido) {
            return;
        }


        /* =====================================================
           SESSÃO
           ===================================================== */

        const sessao =
            Auth.obterSessao();


        if (!sessao) {

            window.location.href =
                "../login.html";

            return;
        }


        /* =====================================================
           ELEMENTOS
           ===================================================== */

        const nomeAdministrador =
            document.getElementById(
                "nomeAdministrador"
            );


        const saudacaoAdministrador =
            document.getElementById(
                "saudacaoAdministrador"
            );


        const totalRestaurantes =
            document.getElementById(
                "totalRestaurantes"
            );


        const totalPedidos =
            document.getElementById(
                "totalPedidos"
            );


        const totalClientes =
            document.getElementById(
                "totalClientes"
            );


        const totalEntregadores =
            document.getElementById(
                "totalEntregadores"
            );


        const listaRestaurantesRecentes =
            document.getElementById(
                "listaRestaurantesRecentes"
            );


        const listaPedidosRecentes =
            document.getElementById(
                "listaPedidosRecentes"
            );


        const btnCadastrarRestaurante =
            document.getElementById(
                "btnCadastrarRestaurante"
            );


        const btnSair =
            document.getElementById(
                "btnSair"
            );


        /* =====================================================
           ADMINISTRADOR
           ===================================================== */

        nomeAdministrador.textContent =
            sessao.nome;


        saudacaoAdministrador.textContent =
            sessao.nome;


        /* =====================================================
           CARREGAR INDICADORES
           ===================================================== */

        function carregarIndicadores() {

            const restaurantes =
                Storage.listarRestaurantes();


            const pedidos =
                Storage.listarPedidos();


            const contas =
                Storage.listarContas();


            const entregadores =
                Storage.listarEntregadores();


            const clientes =
                contas.filter(
                    conta =>
                        conta.tipo ===
                        Auth.TIPOS.CLIENTE
                );


            totalRestaurantes.textContent =
                restaurantes.length;


            totalPedidos.textContent =
                pedidos.length;


            totalClientes.textContent =
                clientes.length;


            totalEntregadores.textContent =
                entregadores.length;
        }


        /* =====================================================
           RESTAURANTES RECENTES
           ===================================================== */

        function carregarRestaurantesRecentes() {

            const restaurantes =
                Storage.listarRestaurantes();


            if (
                restaurantes.length === 0
            ) {

                listaRestaurantesRecentes
                    .className =
                    "lista-vazia";


                listaRestaurantesRecentes
                    .textContent =
                    "Nenhum restaurante cadastrado ainda.";

                return;
            }


            listaRestaurantesRecentes
                .className = "";


            const recentes =
                [...restaurantes]
                    .reverse()
                    .slice(0, 5);


            listaRestaurantesRecentes
                .innerHTML =
                recentes
                    .map(
                        restaurante => {

                            const status =
                                restaurante.status
                                || "Pendente";


                            return `
                                <div class="item-recente">

                                    <div>

                                        <strong>
                                            ${restaurante.nome}
                                        </strong>

                                        <span>
                                            ${restaurante.email || ""}
                                        </span>

                                    </div>

                                    <span>
                                        ${status}
                                    </span>

                                </div>
                            `;
                        }
                    )
                    .join("");
        }


        /* =====================================================
           PEDIDOS RECENTES
           ===================================================== */

        function carregarPedidosRecentes() {

            const pedidos =
                Storage.listarPedidos();


            if (
                pedidos.length === 0
            ) {

                listaPedidosRecentes
                    .className =
                    "lista-vazia";


                listaPedidosRecentes
                    .textContent =
                    "Nenhum pedido registrado ainda.";

                return;
            }


            listaPedidosRecentes
                .className = "";


            const recentes =
                [...pedidos]
                    .reverse()
                    .slice(0, 5);


            listaPedidosRecentes
                .innerHTML =
                recentes
                    .map(
                        pedido => {

                            const numero =
                                pedido.numero
                                || pedido.id
                                || "Pedido";


                            const status =
                                pedido.status
                                || "Recebido";


                            return `
                                <div class="item-recente">

                                    <div>

                                        <strong>
                                            ${numero}
                                        </strong>

                                        <span>
                                            ${pedido.clienteNome || "Cliente"}
                                        </span>

                                    </div>

                                    <span>
                                        ${status}
                                    </span>

                                </div>
                            `;
                        }
                    )
                    .join("");
        }


        /* =====================================================
           CADASTRAR RESTAURANTE
           ===================================================== */

        btnCadastrarRestaurante
            .addEventListener(
                "click",
                () => {

                    /*
                     * Essa página será criada
                     * na próxima etapa.
                     */

                    window.location.href =
                        "cadastro_restaurante.html";
                }
            );


        /* =====================================================
           LOGOUT
           ===================================================== */

        btnSair.addEventListener(
            "click",
            () => {

                Auth.logout();

                window.location.href =
                    "../login.html";
            }
        );


        /* =====================================================
           INICIALIZAÇÃO
           ===================================================== */

        carregarIndicadores();

        carregarRestaurantesRecentes();

        carregarPedidosRecentes();

    }
);