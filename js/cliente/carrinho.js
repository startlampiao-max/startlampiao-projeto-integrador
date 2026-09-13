"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           STARTLAMPIÃO
           ÁREA DO CLIENTE - CARRINHO
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

        const listaCarrinho =
            document.getElementById(
                "listaCarrinho"
            );

        const totalItens =
            document.getElementById(
                "totalItens"
            );

        const subtotalCarrinho =
            document.getElementById(
                "subtotalCarrinho"
            );

        const totalCarrinho =
            document.getElementById(
                "totalCarrinho"
            );

        const btnFinalizar =
            document.getElementById(
                "btnFinalizar"
            );

        const btnLimpar =
            document.getElementById(
                "btnLimpar"
            );

        const areaAcessoCliente =
            document.getElementById(
                "areaAcessoCliente"
            );


        if (
            !nomeRestaurante ||
            !mensagem ||
            !listaCarrinho ||
            !totalItens ||
            !subtotalCarrinho ||
            !totalCarrinho ||
            !btnFinalizar ||
            !btnLimpar ||
            !areaAcessoCliente
        ) {

            console.error(
                "A página carrinho.html está sem elementos obrigatórios."
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


            /* =================================================
               CLIENTE LOGADO
               ================================================= */

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


            /* =================================================
               CLIENTE NÃO LOGADO
               ================================================= */

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
           SALVAR CARRINHO
           ===================================================== */

        function salvarCarrinho(
            carrinho
        ) {

            return Storage.salvarCarrinho(
                carrinho
            );

        }


        /* =====================================================
           CALCULAR QUANTIDADE TOTAL
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
           CALCULAR TOTAL
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

        function atualizarNomeRestaurante(
            carrinho
        ) {

            if (
                carrinho.length === 0
            ) {

                nomeRestaurante.textContent =
                    "Seu carrinho está vazio.";

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
           ALTERAR QUANTIDADE
           ===================================================== */

        function alterarQuantidade(
            produtoId,
            diferenca
        ) {

            const carrinho =
                obterCarrinho();


            const indice =
                carrinho.findIndex(
                    item =>
                        item.produtoId
                        ===
                        produtoId
                );


            if (
                indice === -1
            ) {

                return;
            }


            const quantidadeAtual =
                Number(
                    carrinho[indice]
                        .quantidade
                )
                ||
                1;


            const novaQuantidade =
                quantidadeAtual
                +
                diferenca;


            if (
                novaQuantidade <= 0
            ) {

                carrinho.splice(
                    indice,
                    1
                );

            } else {

                carrinho[indice]
                    .quantidade =
                    novaQuantidade;

            }


            const salvo =
                salvarCarrinho(
                    carrinho
                );


            if (!salvo) {

                Utils.mostrarMensagem(
                    mensagem,
                    "Não foi possível atualizar o carrinho.",
                    "erro"
                );

                return;
            }


            renderizarCarrinho();

        }


        /* =====================================================
           REMOVER ITEM
           ===================================================== */

        function removerItem(
            produtoId
        ) {

            const carrinho =
                obterCarrinho();


            const atualizado =
                carrinho.filter(
                    item =>
                        item.produtoId
                        !==
                        produtoId
                );


            const salvo =
                salvarCarrinho(
                    atualizado
                );


            if (!salvo) {

                Utils.mostrarMensagem(
                    mensagem,
                    "Não foi possível remover o produto.",
                    "erro"
                );

                return;
            }


            Utils.mostrarMensagem(
                mensagem,
                "Produto removido do carrinho.",
                "sucesso"
            );


            renderizarCarrinho();

        }


        /* =====================================================
           CRIAR ITEM DO CARRINHO
           ===================================================== */

        function criarItemCarrinho(
            item
        ) {

            const artigo =
                document.createElement(
                    "article"
                );


            artigo.className =
                "item-carrinho";


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
                "item-carrinho-descricao";


            descricao.textContent =
                item.descricao
                ||
                "Sem descrição.";


            const preco =
                document.createElement(
                    "strong"
                );


            preco.className =
                "item-carrinho-preco";


            preco.textContent =
                Utils.formatarMoeda(
                    Number(
                        item.preco
                    )
                    *
                    Number(
                        item.quantidade
                    )
                );


            informacoes.appendChild(
                titulo
            );


            informacoes.appendChild(
                descricao
            );


            informacoes.appendChild(
                preco
            );


            const acoes =
                document.createElement(
                    "div"
                );


            acoes.className =
                "item-carrinho-acoes";


            const controle =
                document.createElement(
                    "div"
                );


            controle.className =
                "controle-quantidade";


            const btnMenos =
                document.createElement(
                    "button"
                );


            btnMenos.type =
                "button";


            btnMenos.className =
                "btn-quantidade";


            btnMenos.textContent =
                "−";


            const quantidade =
                document.createElement(
                    "span"
                );


            quantidade.className =
                "quantidade";


            quantidade.textContent =
                item.quantidade;


            const btnMais =
                document.createElement(
                    "button"
                );


            btnMais.type =
                "button";


            btnMais.className =
                "btn-quantidade";


            btnMais.textContent =
                "+";


            btnMenos.addEventListener(
                "click",
                () => {

                    alterarQuantidade(
                        item.produtoId,
                        -1
                    );

                }
            );


            btnMais.addEventListener(
                "click",
                () => {

                    alterarQuantidade(
                        item.produtoId,
                        1
                    );

                }
            );


            controle.appendChild(
                btnMenos
            );


            controle.appendChild(
                quantidade
            );


            controle.appendChild(
                btnMais
            );


            const btnRemover =
                document.createElement(
                    "button"
                );


            btnRemover.type =
                "button";


            btnRemover.className =
                "btn-remover";


            btnRemover.textContent =
                "Remover";


            btnRemover.addEventListener(
                "click",
                () => {

                    removerItem(
                        item.produtoId
                    );

                }
            );


            acoes.appendChild(
                controle
            );


            acoes.appendChild(
                btnRemover
            );


            artigo.appendChild(
                informacoes
            );


            artigo.appendChild(
                acoes
            );


            return artigo;

        }


        /* =====================================================
           RENDERIZAR CARRINHO
           ===================================================== */

        function renderizarCarrinho() {

            const carrinho =
                obterCarrinho();


            listaCarrinho.innerHTML =
                "";


            atualizarNomeRestaurante(
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


            subtotalCarrinho.textContent =
                Utils.formatarMoeda(
                    valorTotal
                );


            totalCarrinho.textContent =
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


                listaCarrinho.appendChild(
                    vazio
                );


                btnFinalizar.disabled =
                    true;


                btnLimpar.disabled =
                    true;


                return;
            }


            btnFinalizar.disabled =
                false;


            btnLimpar.disabled =
                false;


            carrinho.forEach(
                item => {

                    listaCarrinho.appendChild(
                        criarItemCarrinho(
                            item
                        )
                    );

                }
            );

        }


        /* =====================================================
           LIMPAR CARRINHO
           ===================================================== */

        btnLimpar.addEventListener(
            "click",
            () => {

                const carrinho =
                    obterCarrinho();


                if (
                    carrinho.length === 0
                ) {

                    return;
                }


                const confirmou =
                    window.confirm(
                        "Deseja realmente limpar todo o carrinho?"
                    );


                if (!confirmou) {

                    return;
                }


                const removido =
                    Storage.limparCarrinho();


                if (!removido) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "Não foi possível limpar o carrinho.",
                        "erro"
                    );

                    return;
                }


                Utils.mostrarMensagem(
                    mensagem,
                    "Carrinho limpo com sucesso.",
                    "sucesso"
                );


                renderizarCarrinho();

            }
        );


        /* =====================================================
           CONTINUAR PEDIDO
           ===================================================== */

        btnFinalizar.addEventListener(
            "click",
            () => {

                const carrinho =
                    obterCarrinho();


                if (
                    carrinho.length === 0
                ) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "Adicione produtos antes de continuar.",
                        "erro"
                    );

                    return;
                }


                window.location.href =
                    "resumo_pedido.html";

            }
        );


        /* =====================================================
           INICIALIZAÇÃO
           ===================================================== */

        Utils.esconderMensagem(
            mensagem
        );


        atualizarAreaAcesso();


        renderizarCarrinho();

    }
);