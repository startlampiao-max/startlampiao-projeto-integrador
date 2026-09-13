"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           STARTLAMPIÃO
           CATEGORIAS DO RESTAURANTE
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
                "formCategoria"
            );

        const campoNome =
            document.getElementById(
                "nomeCategoria"
            );

        const campoDescricao =
            document.getElementById(
                "descricaoCategoria"
            );

        const mensagem =
            document.getElementById(
                "mensagem"
            );

        const listaCategorias =
            document.getElementById(
                "listaCategorias"
            );

        const totalCategorias =
            document.getElementById(
                "totalCategorias"
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
            !campoNome ||
            !campoDescricao ||
            !mensagem ||
            !listaCategorias ||
            !totalCategorias ||
            !btnCadastrar ||
            !btnSair
        ) {

            console.error(
                "A página categorias.html está sem um ou mais elementos obrigatórios."
            );

            return;
        }


        /* =====================================================
           MOSTRAR NOME DO RESTAURANTE
           ===================================================== */

        nomeRestaurante.textContent =
            restaurante.nome;


        /* =====================================================
           RENDERIZAR CATEGORIAS
           ===================================================== */

        function renderizarCategorias() {

            const categorias =
                Storage.listarCategoriasPorRestaurante(
                    restaurante.id
                );


            totalCategorias.textContent =
                categorias.length;


            listaCategorias.innerHTML = "";


            if (
                categorias.length === 0
            ) {

                const vazio =
                    document.createElement(
                        "p"
                    );

                vazio.className =
                    "estado-vazio";

                vazio.textContent =
                    "Nenhuma categoria cadastrada ainda.";

                listaCategorias.appendChild(
                    vazio
                );

                return;
            }


            categorias.forEach(
                categoria => {

                    const item =
                        document.createElement(
                            "article"
                        );


                    item.className =
                        "categoria-item";


                    const titulo =
                        document.createElement(
                            "h3"
                        );


                    titulo.textContent =
                        categoria.nome;


                    const descricao =
                        document.createElement(
                            "p"
                        );


                    descricao.textContent =
                        categoria.descricao
                        ||
                        "Sem descrição.";


                    const status =
                        document.createElement(
                            "span"
                        );


                    status.className =
                        "categoria-status";


                    status.textContent =
                        categoria.ativo
                        ? "Ativa"
                        : "Inativa";


                    item.appendChild(
                        titulo
                    );


                    item.appendChild(
                        descricao
                    );


                    item.appendChild(
                        status
                    );


                    listaCategorias.appendChild(
                        item
                    );

                }
            );

        }


        /* =====================================================
           CADASTRAR CATEGORIA
           ===================================================== */

        form.addEventListener(
            "submit",
            evento => {

                evento.preventDefault();


                Utils.esconderMensagem(
                    mensagem
                );


                const nome =
                    Utils.limparTexto(
                        campoNome.value
                    );


                const descricao =
                    Utils.limparTexto(
                        campoDescricao.value
                    );


                /* =============================================
                   VALIDAR NOME
                   ============================================= */

                if (!nome) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "Informe o nome da categoria.",
                        "erro"
                    );

                    campoNome.focus();

                    return;
                }


                /* =============================================
                   VERIFICAR DUPLICIDADE
                   APENAS NO RESTAURANTE LOGADO
                   ============================================= */

                const categoriasDoRestaurante =
                    Storage.listarCategoriasPorRestaurante(
                        restaurante.id
                    );


                const nomeNormalizado =
                    nome.toLowerCase();


                const categoriaDuplicada =
                    categoriasDoRestaurante.some(
                        categoria =>
                            String(
                                categoria.nome || ""
                            )
                                .trim()
                                .toLowerCase()
                            ===
                            nomeNormalizado
                    );


                if (
                    categoriaDuplicada
                ) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "Já existe uma categoria com esse nome neste restaurante.",
                        "erro"
                    );

                    campoNome.focus();

                    return;
                }


                /* =============================================
                   CRIAR OBJETO DA CATEGORIA
                   ============================================= */

                const categoria = {

                    id:
                        Storage.gerarId(
                            "CAT"
                        ),

                    restauranteId:
                        restaurante.id,

                    nome:
                        nome,

                    descricao:
                        descricao,

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
                    Storage.adicionarCategoria(
                        categoria
                    );


                btnCadastrar.disabled =
                    false;


                btnCadastrar.textContent =
                    "Cadastrar categoria";


                if (!salvo) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "Não foi possível salvar a categoria.",
                        "erro"
                    );

                    return;
                }


                /* =============================================
                   CONFIRMAR GRAVAÇÃO
                   ============================================= */

                const categoriaConfirmada =
                    Storage
                        .listarCategoriasPorRestaurante(
                            restaurante.id
                        )
                        .find(
                            item =>
                                item.id ===
                                categoria.id
                        );


                if (
                    !categoriaConfirmada
                ) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "A categoria não pôde ser confirmada no armazenamento.",
                        "erro"
                    );

                    return;
                }


                /* =============================================
                   SUCESSO
                   ============================================= */

                Utils.mostrarMensagem(
                    mensagem,
                    "Categoria cadastrada com sucesso.",
                    "sucesso"
                );


                form.reset();


                renderizarCategorias();


                campoNome.focus();

            }
        );


        /* =====================================================
           SAIR DA CONTA
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

        renderizarCategorias();

    }
);