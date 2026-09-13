"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           STARTLAMPIÃO
           ÁREA DO CLIENTE - RESUMO DO PEDIDO
           ===================================================== */

        const Storage =
            window.StartLampiaoStorage;

        const Utils =
            window.StartLampiaoUtils;

        const Auth =
            window.StartLampiaoAuth;


        /* =====================================================
           VERIFICAR MÓDULOS
           ===================================================== */

        if (
            !Storage ||
            !Utils ||
            !Auth
        ) {

            console.error(
                "Módulos centrais do StartLampião não foram carregados."
            );

            return;
        }


        /* =====================================================
           ELEMENTOS DA PÁGINA
           ===================================================== */

        const nomeRestaurante =
            document.getElementById(
                "nomeRestaurante"
            );

        const mensagem =
            document.getElementById(
                "mensagem"
            );

        const listaResumo =
            document.getElementById(
                "listaResumo"
            );

        const totalItens =
            document.getElementById(
                "totalItens"
            );

        const subtotalPedido =
            document.getElementById(
                "subtotalPedido"
            );

        const totalPedido =
            document.getElementById(
                "totalPedido"
            );

        const btnContinuar =
            document.getElementById(
                "btnContinuar"
            );

        const areaAcessoCliente =
            document.getElementById(
                "areaAcessoCliente"
            );


        if (
            !nomeRestaurante ||
            !mensagem ||
            !listaResumo ||
            !totalItens ||
            !subtotalPedido ||
            !totalPedido ||
            !btnContinuar ||
            !areaAcessoCliente
        ) {

            console.error(
                "A página resumo_pedido.html está sem elementos obrigatórios."
            );

            return;
        }


        /* =====================================================
           CABEÇALHO DO CLIENTE
           ===================================================== */

        function atualizarAreaAcesso() {

            const sessao =
                Auth.obterSessao();


            const clienteLogado =
                sessao
                &&
                sessao.tipo ===
                    Auth.TIPOS.CLIENTE;


            if (
                clienteLogado
            ) {

                areaAcessoCliente.innerHTML = `
                    <button
                        type="button"
                        class="btn btn-primario"
                        id="btnSairCliente"
                    >
                        Sair
                    </button>
                `;


                const btnSairCliente =
                    document.getElementById(
                        "btnSairCliente"
                    );


                if (
                    btnSairCliente
                ) {

                    btnSairCliente.addEventListener(
                        "click",
                        () => {

                            Auth.logout();

                            window.location.href =
                                "../login.html";
                        }
                    );
                }


                return;
            }


            areaAcessoCliente.innerHTML = `
                <a
                    href="../login.html"
                    class="btn btn-primario"
                >
                    Entrar
                </a>
            `;
        }


        /* =====================================================
           OBTER CARRINHO
           ===================================================== */

        function obterCarrinho() {

            const carrinho =
                Storage.obterCarrinho();


            if (
                !Array.isArray(
                    carrinho
                )
            ) {

                return [];
            }


            return carrinho;

        }


        /* =====================================================
           QUANTIDADE TOTAL
           ===================================================== */

        function calcularQuantidadeTotal(
            carrinho
        ) {

            return carrinho.reduce(
                (
                    total,
                    item
                ) => {

                    return (
                        total
                        +
                        (
                            Number(
                                item.quantidade
                            )
                            ||
                            0
                        )
                    );

                },
                0
            );

        }


        /* =====================================================
           VALOR TOTAL
           ===================================================== */

        function calcularTotal(
            carrinho
        ) {

            return carrinho.reduce(
                (
                    total,
                    item
                ) => {

                    const preco =
                        Number(
                            item.preco
                        )
                        ||
                        0;


                    const quantidade =
                        Number(
                            item.quantidade
                        )
                        ||
                        0;


                    return (
                        total
                        +
                        (
                            preco
                            *
                            quantidade
                        )
                    );

                },
                0
            );

        }


        /* =====================================================
           IDENTIFICAR RESTAURANTE
           ===================================================== */

        function mostrarRestaurante(
            carrinho
        ) {

            if (
                carrinho.length === 0
            ) {

                nomeRestaurante.textContent =
                    "Nenhum restaurante selecionado.";

                return;

            }


            const restauranteId =
                carrinho[0]
                    .restauranteId;


            const restaurante =
                restauranteId
                    ? Storage.buscarRestaurantePorId(
                        restauranteId
                    )
                    : null;


            nomeRestaurante.textContent =
                restaurante
                    ? restaurante.nome
                    : "Restaurante";

        }


        /* =====================================================
           CRIAR ITEM DO RESUMO
           ===================================================== */

        function criarItemResumo(
            item
        ) {

            const artigo =
                document.createElement(
                    "article"
                );


            artigo.className =
                "item-resumo";


            const informacoes =
                document.createElement(
                    "div"
                );


            const titulo =
                document.createElement(
                    "h3"
                );


            titulo.textContent =
                item.nome;


            const descricao =
                document.createElement(
                    "p"
                );


            descricao.className =
                "item-resumo-descricao";


            descricao.textContent =
                item.descricao
                ||
                "Sem descrição.";


            const quantidade =
                document.createElement(
                    "p"
                );


            quantidade.className =
                "item-resumo-quantidade";


            quantidade.textContent =
                `Quantidade: ${item.quantidade}`;


            informacoes.appendChild(
                titulo
            );


            informacoes.appendChild(
                descricao
            );


            informacoes.appendChild(
                quantidade
            );


            const valor =
                document.createElement(
                    "strong"
                );


            valor.className =
                "item-resumo-valor";


            valor.textContent =
                Utils.formatarMoeda(
                    Number(
                        item.preco
                    )
                    *
                    Number(
                        item.quantidade
                    )
                );


            artigo.appendChild(
                informacoes
            );


            artigo.appendChild(
                valor
            );


            return artigo;

        }


        /* =====================================================
           RENDERIZAR RESUMO
           ===================================================== */

        function renderizarResumo() {

            const carrinho =
                obterCarrinho();


            listaResumo.innerHTML =
                "";


            mostrarRestaurante(
                carrinho
            );


            const quantidadeTotal =
                calcularQuantidadeTotal(
                    carrinho
                );


            const valorTotal =
                calcularTotal(
                    carrinho
                );


            totalItens.textContent =
                quantidadeTotal;


            subtotalPedido.textContent =
                Utils.formatarMoeda(
                    valorTotal
                );


            totalPedido.textContent =
                Utils.formatarMoeda(
                    valorTotal
                );


            if (
                carrinho.length === 0
            ) {

                const vazio =
                    document.createElement(
                        "p"
                    );


                vazio.className =
                    "estado-vazio";


                vazio.textContent =
                    "Seu carrinho está vazio.";


                listaResumo.appendChild(
                    vazio
                );


                btnContinuar.disabled =
                    true;


                return;

            }


            btnContinuar.disabled =
                false;


            carrinho.forEach(
                item => {

                    listaResumo.appendChild(
                        criarItemResumo(
                            item
                        )
                    );

                }
            );

        }


        /* =====================================================
           CONTINUAR
           ===================================================== */

        btnContinuar.addEventListener(
            "click",
            () => {

                const carrinho =
                    obterCarrinho();


                if (
                    carrinho.length === 0
                ) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "Seu carrinho está vazio.",
                        "erro"
                    );

                    return;

                }


                const sessao =
                    Auth.obterSessao();


                /* =================================================
                   CLIENTE NÃO LOGADO
                   ================================================= */

                if (
                    !sessao
                ) {

                    sessionStorage.setItem(
                        "startlampiao_retorno_login",
                        "cliente/resumo_pedido.html"
                    );


                    Utils.mostrarMensagem(
                        mensagem,
                        "Para continuar o pedido, faça login ou crie sua conta.",
                        "erro"
                    );


                    setTimeout(
                        () => {

                            window.location.href =
                                "../login.html";

                        },
                        900
                    );


                    return;

                }


                /* =================================================
                   CONTA LOGADA, MAS NÃO É CLIENTE
                   ================================================= */

                if (
                    sessao.tipo
                    !==
                    Auth.TIPOS.CLIENTE
                ) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "Para finalizar este pedido, entre com uma conta de cliente.",
                        "erro"
                    );


                    return;

                }


                /* =================================================
                   CLIENTE LOGADO
                   ================================================= */

                Utils.mostrarMensagem(
                    mensagem,
                    "Cliente identificado. Abrindo o endereço de entrega.",
                    "sucesso"
                );


                setTimeout(
                    () => {

                        window.location.href =
                            "endereco.html";

                    },
                    500
                );

            }
        );


        /* =====================================================
           INICIALIZAÇÃO
           ===================================================== */

        Utils.esconderMensagem(
            mensagem
        );


        atualizarAreaAcesso();


        renderizarResumo();

    }
);