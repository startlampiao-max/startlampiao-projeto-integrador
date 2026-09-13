"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           STARTLAMPIÃO
           CARDÁPIO DO RESTAURANTE
           ===================================================== */

        const Storage =
            window.StartLampiaoStorage;

        const Utils =
            window.StartLampiaoUtils;

        const Auth =
            window.StartLampiaoAuth;


        /* =====================================================
           VERIFICAR MÓDULOS CENTRAIS
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
           PROTEGER A PÁGINA
           SOMENTE RESTAURANTE LOGADO
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
           OBTER SESSÃO
           ===================================================== */

        const sessao =
            Auth.obterSessao();


        if (
            !sessao ||
            !sessao.restauranteId
        ) {

            alert(
                "Não foi possível identificar o restaurante da sessão."
            );

            Auth.logout();

            window.location.href =
                "../login.html";

            return;
        }


        /* =====================================================
           IDENTIFICAR RESTAURANTE
           ===================================================== */

        const restaurante =
            Storage.buscarRestaurantePorId(
                sessao.restauranteId
            );


        if (!restaurante) {

            alert(
                "Restaurante não encontrado."
            );

            Auth.logout();

            window.location.href =
                "../login.html";

            return;
        }


        /* =====================================================
           ELEMENTOS DA PÁGINA
           ===================================================== */

        const nomeRestaurante =
            document.getElementById(
                "nomeRestaurante"
            );

        const form =
            document.getElementById(
                "formProduto"
            );

        const campoCategoria =
            document.getElementById(
                "categoriaProduto"
            );

        const campoNome =
            document.getElementById(
                "nomeProduto"
            );

        const campoDescricao =
            document.getElementById(
                "descricaoProduto"
            );

        const campoPreco =
            document.getElementById(
                "precoProduto"
            );

        const mensagem =
            document.getElementById(
                "mensagem"
            );

        const listaProdutos =
            document.getElementById(
                "listaProdutos"
            );

        const totalProdutos =
            document.getElementById(
                "totalProdutos"
            );

        const btnCadastrar =
            document.getElementById(
                "btnCadastrar"
            );

        const btnSair =
            document.getElementById(
                "btnSair"
            );


        /* =====================================================
           CONFERIR ESTRUTURA DO HTML
           ===================================================== */

        if (
            !nomeRestaurante ||
            !form ||
            !campoCategoria ||
            !campoNome ||
            !campoDescricao ||
            !campoPreco ||
            !mensagem ||
            !listaProdutos ||
            !totalProdutos ||
            !btnCadastrar ||
            !btnSair
        ) {

            console.error(
                "A página cardapio.html está sem um ou mais elementos obrigatórios."
            );

            return;
        }


        /* =====================================================
           MOSTRAR NOME DO RESTAURANTE
           ===================================================== */

        nomeRestaurante.textContent =
            restaurante.nome;


        /* =====================================================
           CARREGAR CATEGORIAS DO RESTAURANTE
           ===================================================== */

        function carregarCategorias() {

            const categorias =
                Storage.listarCategoriasPorRestaurante(
                    restaurante.id
                );


            campoCategoria.innerHTML =
                `
                    <option value="">
                        Selecione uma categoria
                    </option>
                `;


            categorias
                .filter(
                    categoria =>
                        categoria.ativo !== false
                )
                .forEach(
                    categoria => {

                        const option =
                            document.createElement(
                                "option"
                            );

                        option.value =
                            categoria.id;

                        option.textContent =
                            categoria.nome;

                        campoCategoria.appendChild(
                            option
                        );

                    }
                );


            if (
                categorias.length === 0
            ) {

                Utils.mostrarMensagem(
                    mensagem,
                    "Cadastre pelo menos uma categoria antes de adicionar produtos.",
                    "erro"
                );
            }

        }


        /* =====================================================
           BUSCAR NOME DA CATEGORIA
           ===================================================== */

        function obterCategoriaPorId(
            categoriaId
        ) {

            return Storage
                .listarCategoriasPorRestaurante(
                    restaurante.id
                )
                .find(
                    categoria =>
                        categoria.id ===
                        categoriaId
                ) || null;

        }


        /* =====================================================
           RENDERIZAR PRODUTOS
           ===================================================== */

        function renderizarProdutos() {

            const produtos =
                Storage.listarProdutosPorRestaurante(
                    restaurante.id
                );


            totalProdutos.textContent =
                produtos.length;


            listaProdutos.innerHTML = "";


            if (
                produtos.length === 0
            ) {

                const vazio =
                    document.createElement(
                        "p"
                    );

                vazio.className =
                    "estado-vazio";

                vazio.textContent =
                    "Nenhum produto cadastrado ainda.";

                listaProdutos.appendChild(
                    vazio
                );

                return;
            }


            produtos.forEach(
                produto => {

                    const categoria =
                        obterCategoriaPorId(
                            produto.categoriaId
                        );


                    const item =
                        document.createElement(
                            "article"
                        );

                    item.className =
                        "produto-item";


                    const titulo =
                        document.createElement(
                            "h3"
                        );

                    titulo.textContent =
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


                    const categoriaElemento =
                        document.createElement(
                            "span"
                        );

                    categoriaElemento.className =
                        "produto-categoria";

                    categoriaElemento.textContent =
                        categoria
                            ? categoria.nome
                            : "Categoria não encontrada";


                    item.appendChild(
                        titulo
                    );

                    item.appendChild(
                        descricao
                    );

                    item.appendChild(
                        preco
                    );

                    item.appendChild(
                        categoriaElemento
                    );


                    listaProdutos.appendChild(
                        item
                    );

                }
            );

        }


        /* =====================================================
           CADASTRAR PRODUTO
           ===================================================== */

        form.addEventListener(
            "submit",
            evento => {

                evento.preventDefault();


                Utils.esconderMensagem(
                    mensagem
                );


                const categoriaId =
                    Utils.limparTexto(
                        campoCategoria.value
                    );


                const nome =
                    Utils.limparTexto(
                        campoNome.value
                    );


                const descricao =
                    Utils.limparTexto(
                        campoDescricao.value
                    );


                const preco =
                    Number(
                        campoPreco.value
                    );


                /* =============================================
                   VALIDAR CATEGORIA
                   ============================================= */

                if (!categoriaId) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "Selecione uma categoria.",
                        "erro"
                    );

                    campoCategoria.focus();

                    return;
                }


                const categoria =
                    obterCategoriaPorId(
                        categoriaId
                    );


                if (!categoria) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "A categoria selecionada não pertence a este restaurante.",
                        "erro"
                    );

                    return;
                }


                /* =============================================
                   VALIDAR NOME
                   ============================================= */

                if (!nome) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "Informe o nome do produto.",
                        "erro"
                    );

                    campoNome.focus();

                    return;
                }


                /* =============================================
                   VALIDAR PREÇO
                   ============================================= */

                if (
                    !Number.isFinite(preco)
                    ||
                    preco <= 0
                ) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "Informe um preço válido maior que zero.",
                        "erro"
                    );

                    campoPreco.focus();

                    return;
                }


                /* =============================================
                   VERIFICAR PRODUTO DUPLICADO
                   NO MESMO RESTAURANTE E CATEGORIA
                   ============================================= */

                const produtosDoRestaurante =
                    Storage.listarProdutosPorRestaurante(
                        restaurante.id
                    );


                const nomeNormalizado =
                    nome
                        .trim()
                        .toLowerCase();


                const duplicado =
                    produtosDoRestaurante.some(
                        produto =>
                            produto.categoriaId
                                === categoriaId
                            &&
                            String(
                                produto.nome || ""
                            )
                                .trim()
                                .toLowerCase()
                                === nomeNormalizado
                    );


                if (duplicado) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "Já existe um produto com esse nome nesta categoria.",
                        "erro"
                    );

                    campoNome.focus();

                    return;
                }


                /* =============================================
                   CRIAR PRODUTO
                   ============================================= */

                const produto = {

                    id:
                        Storage.gerarId(
                            "PROD"
                        ),

                    restauranteId:
                        restaurante.id,

                    categoriaId:
                        categoria.id,

                    nome:
                        nome,

                    descricao:
                        descricao,

                    preco:
                        preco,

                    ativo:
                        true,

                    criadoEm:
                        Utils.agoraISO()
                };


                /* =============================================
                   SALVAR
                   ============================================= */

                btnCadastrar.disabled =
                    true;


                btnCadastrar.textContent =
                    "Salvando...";


                const salvo =
                    Storage.adicionarProduto(
                        produto
                    );


                btnCadastrar.disabled =
                    false;


                btnCadastrar.textContent =
                    "Cadastrar produto";


                if (!salvo) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "Não foi possível salvar o produto.",
                        "erro"
                    );

                    return;
                }


                /* =============================================
                   CONFIRMAR GRAVAÇÃO
                   ============================================= */

                const produtoConfirmado =
                    Storage
                        .listarProdutosPorRestaurante(
                            restaurante.id
                        )
                        .find(
                            item =>
                                item.id ===
                                produto.id
                        );


                if (!produtoConfirmado) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "O produto não pôde ser confirmado no armazenamento.",
                        "erro"
                    );

                    return;
                }


                /* =============================================
                   SUCESSO
                   ============================================= */

                Utils.mostrarMensagem(
                    mensagem,
                    "Produto cadastrado com sucesso.",
                    "sucesso"
                );


                form.reset();


                renderizarProdutos();


                campoCategoria.focus();

            }
        );


        /* =====================================================
           SAIR
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

        carregarCategorias();

        renderizarProdutos();

    }
);