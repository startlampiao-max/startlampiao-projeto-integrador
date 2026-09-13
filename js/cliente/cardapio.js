"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           STARTLAMPIÃO
           ÁREA DO CLIENTE - CARDÁPIO
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

        const descricaoRestaurante =
            document.getElementById(
                "descricaoRestaurante"
            );

        const listaCategorias =
            document.getElementById(
                "listaCategorias"
            );

        const listaProdutos =
            document.getElementById(
                "listaProdutos"
            );

        const mensagem =
            document.getElementById(
                "mensagem"
            );

        const areaAcessoCliente =
            document.getElementById(
                "areaAcessoCliente"
            );


        if (
            !nomeRestaurante ||
            !descricaoRestaurante ||
            !listaCategorias ||
            !listaProdutos ||
            !mensagem ||
            !areaAcessoCliente
        ) {

            console.error(
                "A página cardapio.html está sem elementos obrigatórios."
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
           RESTAURANTE SELECIONADO
           ===================================================== */

        const restauranteId =
            sessionStorage.getItem(
                "startlampiao_restaurante_selecionado"
            );


        if (!restauranteId) {

            window.location.href =
                "restaurantes.html";

            return;
        }


        const restaurante =
            Storage.buscarRestaurantePorId(
                restauranteId
            );


        if (!restaurante) {

            sessionStorage.removeItem(
                "startlampiao_restaurante_selecionado"
            );

            window.location.href =
                "restaurantes.html";

            return;
        }


        /* =====================================================
           MOSTRAR RESTAURANTE
           ===================================================== */

        nomeRestaurante.textContent =
            restaurante.nome
            ||
            "Restaurante";


        descricaoRestaurante.textContent =
            restaurante.descricao
            ||
            "Conheça os produtos disponíveis neste restaurante.";


        /* =====================================================
           DADOS DO RESTAURANTE
           ===================================================== */

        const categorias =
            Storage
                .listarCategoriasPorRestaurante(
                    restaurante.id
                )
                .filter(
                    categoria =>
                        categoria.ativo !== false
                );


        const produtos =
            Storage
                .listarProdutosPorRestaurante(
                    restaurante.id
                )
                .filter(
                    produto =>
                        produto.ativo !== false
                );


        /* =====================================================
           ADICIONAR PRODUTO AO CARRINHO
           ===================================================== */

        function adicionarAoCarrinho(
            produto
        ) {

            let carrinho =
                Storage.obterCarrinho();


            if (
                !Array.isArray(
                    carrinho
                )
            ) {

                carrinho = [];
            }


            /* =================================================
               NÃO MISTURAR RESTAURANTES NO MESMO CARRINHO
               ================================================= */

            if (
                carrinho.length > 0
                &&
                carrinho[0].restauranteId
                    !== restaurante.id
            ) {

                const confirmou =
                    window.confirm(
                        "Seu carrinho possui produtos de outro restaurante. Deseja limpar o carrinho e adicionar este produto?"
                    );


                if (!confirmou) {

                    return;
                }


                carrinho = [];
            }


            /* =================================================
               VERIFICAR SE PRODUTO JÁ ESTÁ NO CARRINHO
               ================================================= */

            const indice =
                carrinho.findIndex(
                    item =>
                        item.produtoId
                        ===
                        produto.id
                );


            if (
                indice >= 0
            ) {

                carrinho[indice]
                    .quantidade += 1;

            } else {

                carrinho.push({

                    produtoId:
                        produto.id,

                    restauranteId:
                        restaurante.id,

                    categoriaId:
                        produto.categoriaId,

                    nome:
                        produto.nome,

                    descricao:
                        produto.descricao
                        ||
                        "",

                    preco:
                        Number(
                            produto.preco
                        )
                        ||
                        0,

                    quantidade:
                        1

                });

            }


            const salvo =
                Storage.salvarCarrinho(
                    carrinho
                );


            if (!salvo) {

                Utils.mostrarMensagem(
                    mensagem,
                    "Não foi possível adicionar o produto ao carrinho.",
                    "erro"
                );

                return;
            }


            Utils.mostrarMensagem(
                mensagem,
                `${produto.nome} foi adicionado ao carrinho.`,
                "sucesso"
            );

        }


        /* =====================================================
           ESTADO VAZIO DOS PRODUTOS
           ===================================================== */

        function mostrarEstadoProdutos(
            texto
        ) {

            listaProdutos.innerHTML =
                "";


            const vazio =
                document.createElement(
                    "p"
                );


            vazio.className =
                "estado-vazio";


            vazio.textContent =
                texto;


            listaProdutos.appendChild(
                vazio
            );

        }


        /* =====================================================
           RENDERIZAR PRODUTOS
           ===================================================== */

        function renderizarProdutos(
            categoriaId
        ) {

            const produtosFiltrados =
                produtos.filter(
                    produto =>
                        produto.categoriaId
                        ===
                        categoriaId
                );


            listaProdutos.innerHTML =
                "";


            if (
                produtosFiltrados.length
                ===
                0
            ) {

                mostrarEstadoProdutos(
                    "Nenhum produto disponível nesta categoria."
                );

                return;
            }


            produtosFiltrados.forEach(
                produto => {

                    const card =
                        document.createElement(
                            "article"
                        );


                    card.className =
                        "produto-card";


                    const nome =
                        document.createElement(
                            "h3"
                        );


                    nome.textContent =
                        produto.nome;


                    const descricao =
                        document.createElement(
                            "p"
                        );


                    descricao.textContent =
                        produto.descricao
                        ||
                        "Sem descrição.";


                    const preco =
                        document.createElement(
                            "strong"
                        );


                    preco.className =
                        "produto-preco";


                    preco.textContent =
                        Utils.formatarMoeda(
                            produto.preco
                        );


                    const acoes =
                        document.createElement(
                            "div"
                        );


                    acoes.className =
                        "produto-acoes";


                    const botao =
                        document.createElement(
                            "button"
                        );


                    botao.type =
                        "button";


                    botao.className =
                        "btn btn-primario btn-adicionar";


                    botao.textContent =
                        "Adicionar";


                    botao.addEventListener(
                        "click",
                        () => {

                            adicionarAoCarrinho(
                                produto
                            );

                        }
                    );


                    acoes.appendChild(
                        botao
                    );


                    card.appendChild(
                        nome
                    );


                    card.appendChild(
                        descricao
                    );


                    card.appendChild(
                        preco
                    );


                    card.appendChild(
                        acoes
                    );


                    listaProdutos.appendChild(
                        card
                    );

                }
            );

        }


        /* =====================================================
           RENDERIZAR CATEGORIAS
           ===================================================== */

        function renderizarCategorias() {

            listaCategorias.innerHTML =
                "";


            if (
                categorias.length
                ===
                0
            ) {

                const vazio =
                    document.createElement(
                        "p"
                    );


                vazio.className =
                    "estado-vazio";


                vazio.textContent =
                    "Este restaurante ainda não possui categorias disponíveis.";


                listaCategorias.appendChild(
                    vazio
                );


                mostrarEstadoProdutos(
                    "Nenhum produto disponível."
                );


                return;
            }


            categorias.forEach(
                (
                    categoria,
                    indice
                ) => {

                    const botao =
                        document.createElement(
                            "button"
                        );


                    botao.type =
                        "button";


                    botao.className =
                        "btn-categoria";


                    botao.textContent =
                        categoria.nome;


                    if (
                        indice === 0
                    ) {

                        botao.classList.add(
                            "ativa"
                        );

                    }


                    botao.addEventListener(
                        "click",
                        () => {

                            const botoes =
                                listaCategorias
                                    .querySelectorAll(
                                        ".btn-categoria"
                                    );


                            botoes.forEach(
                                item =>
                                    item.classList.remove(
                                        "ativa"
                                    )
                            );


                            botao.classList.add(
                                "ativa"
                            );


                            renderizarProdutos(
                                categoria.id
                            );

                        }
                    );


                    listaCategorias.appendChild(
                        botao
                    );

                }
            );


            renderizarProdutos(
                categorias[0].id
            );

        }


        /* =====================================================
           INICIALIZAÇÃO
           ===================================================== */

        Utils.esconderMensagem(
            mensagem
        );


        atualizarAreaAcesso();


        renderizarCategorias();

    }
);