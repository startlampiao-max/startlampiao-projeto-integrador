"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           STARTLAMPIÃO
           ÁREA DO CLIENTE - RESTAURANTES
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

        const campoBusca =
            document.getElementById(
                "buscaRestaurante"
            );

        const listaRestaurantes =
            document.getElementById(
                "listaRestaurantes"
            );

        const totalRestaurantes =
            document.getElementById(
                "totalRestaurantes"
            );

        const mensagem =
            document.getElementById(
                "mensagem"
            );

        const acoesCabecalho =
            document.querySelector(
                ".acoes-cabecalho"
            );


        /* =====================================================
           CONFERIR HTML
           ===================================================== */

        if (
            !campoBusca ||
            !listaRestaurantes ||
            !totalRestaurantes ||
            !mensagem ||
            !acoesCabecalho
        ) {

            console.error(
                "A página restaurantes.html está sem um ou mais elementos obrigatórios."
            );

            return;
        }


        /* =====================================================
           CABEÇALHO DO CLIENTE
           ===================================================== */

        function atualizarCabecalho() {

            const sessao =
                Auth.obterSessao();


            const clienteLogado =
                sessao
                &&
                sessao.tipo ===
                    Auth.TIPOS.CLIENTE;


            /*
             * CLIENTE LOGADO
             *
             * Mostra:
             * - Meus Pedidos
             * - Sair
             */

            if (
                clienteLogado
            ) {

                acoesCabecalho.innerHTML = `
                    <a
                        href="meus_pedidos.html"
                        class="btn btn-secundario"
                    >
                        Meus Pedidos
                    </a>

                    <button
                        type="button"
                        class="btn btn-secundario"
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


            /*
             * CLIENTE NÃO LOGADO
             *
             * Mostra:
             * - Meus Pedidos
             * - Entrar
             *
             * Ao tentar abrir Meus Pedidos sem login,
             * a própria tela meus_pedidos.html enviará
             * o usuário para o login.
             */

            acoesCabecalho.innerHTML = `
                <a
                    href="meus_pedidos.html"
                    class="btn btn-secundario"
                >
                    Meus Pedidos
                </a>

                <a
                    href="../login.html"
                    class="btn btn-secundario"
                >
                    Entrar
                </a>
            `;
        }


        /* =====================================================
           OBTER RESTAURANTES APROVADOS
           ===================================================== */

        function obterRestaurantesAprovados() {

            const restaurantes =
                Storage.listarRestaurantes();


            if (
                !Array.isArray(
                    restaurantes
                )
            ) {

                return [];
            }


            return restaurantes.filter(
                restaurante => {

                    const status =
                        String(
                            restaurante.status || ""
                        )
                            .trim()
                            .toLowerCase();


                    return (
                        status === "aprovado"
                        ||
                        status === "aprovada"
                    );

                }
            );

        }


        /* =====================================================
           CRIAR CARD DO RESTAURANTE
           ===================================================== */

        function criarCardRestaurante(
            restaurante
        ) {

            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "restaurante-card";


            /* =================================================
               NOME
               ================================================= */

            const nome =
                document.createElement(
                    "h3"
                );

            nome.textContent =
                restaurante.nome
                ||
                "Restaurante";


            /* =================================================
               DESCRIÇÃO
               ================================================= */

            const descricao =
                document.createElement(
                    "p"
                );

            descricao.textContent =
                restaurante.descricao
                ||
                "Conheça o cardápio deste restaurante.";


            /* =================================================
               DETALHES
               ================================================= */

            const detalhes =
                document.createElement(
                    "div"
                );

            detalhes.className =
                "restaurante-detalhes";


            if (
                restaurante.categoria
            ) {

                const categoria =
                    document.createElement(
                        "span"
                    );

                categoria.className =
                    "tag-restaurante";

                categoria.textContent =
                    restaurante.categoria;

                detalhes.appendChild(
                    categoria
                );
            }


            if (
                restaurante.cidade
            ) {

                const cidade =
                    document.createElement(
                        "span"
                    );

                cidade.className =
                    "tag-restaurante";

                cidade.textContent =
                    restaurante.estado
                        ? `${restaurante.cidade} - ${restaurante.estado}`
                        : restaurante.cidade;

                detalhes.appendChild(
                    cidade
                );
            }


            /* =================================================
               AÇÕES
               ================================================= */

            const acoes =
                document.createElement(
                    "div"
                );

            acoes.className =
                "restaurante-acoes";


            const botao =
                document.createElement(
                    "button"
                );

            botao.type =
                "button";

            botao.className =
                "btn btn-primario btn-ver-cardapio";

            botao.textContent =
                "Ver cardápio";


            /* =================================================
               ABRIR CARDÁPIO DO RESTAURANTE
               ================================================= */

            botao.addEventListener(
                "click",
                () => {

                    /*
                     * Guarda temporariamente
                     * o restaurante escolhido.
                     */

                    sessionStorage.setItem(
                        "startlampiao_restaurante_selecionado",
                        restaurante.id
                    );


                    /*
                     * Confere se o ID foi realmente armazenado.
                     */

                    const restauranteSelecionado =
                        sessionStorage.getItem(
                            "startlampiao_restaurante_selecionado"
                        );


                    if (
                        restauranteSelecionado
                        !==
                        restaurante.id
                    ) {

                        Utils.mostrarMensagem(
                            mensagem,
                            "Não foi possível selecionar o restaurante.",
                            "erro"
                        );

                        return;
                    }


                    /*
                     * Abre o cardápio.
                     */

                    window.location.href =
                        "cardapio.html";

                }
            );


            acoes.appendChild(
                botao
            );


            /* =================================================
               MONTAR CARD
               ================================================= */

            card.appendChild(
                nome
            );

            card.appendChild(
                descricao
            );

            card.appendChild(
                detalhes
            );

            card.appendChild(
                acoes
            );


            return card;

        }


        /* =====================================================
           RENDERIZAR RESTAURANTES
           ===================================================== */

        function renderizarRestaurantes(
            termoBusca = ""
        ) {

            Utils.esconderMensagem(
                mensagem
            );


            const restaurantes =
                obterRestaurantesAprovados();


            const termo =
                Utils
                    .limparTexto(
                        termoBusca
                    )
                    .toLowerCase();


            const filtrados =
                restaurantes.filter(
                    restaurante => {

                        if (
                            !termo
                        ) {

                            return true;
                        }


                        const nome =
                            String(
                                restaurante.nome || ""
                            )
                                .toLowerCase();


                        const categoria =
                            String(
                                restaurante.categoria || ""
                            )
                                .toLowerCase();


                        const cidade =
                            String(
                                restaurante.cidade || ""
                            )
                                .toLowerCase();


                        return (
                            nome.includes(
                                termo
                            )
                            ||
                            categoria.includes(
                                termo
                            )
                            ||
                            cidade.includes(
                                termo
                            )
                        );

                    }
                );


            totalRestaurantes.textContent =
                filtrados.length;


            listaRestaurantes.innerHTML =
                "";


            /* =================================================
               NENHUM RESTAURANTE APROVADO
               ================================================= */

            if (
                restaurantes.length === 0
            ) {

                const vazio =
                    document.createElement(
                        "div"
                    );

                vazio.className =
                    "estado-vazio";


                const texto =
                    document.createElement(
                        "p"
                    );

                texto.textContent =
                    "Nenhum restaurante aprovado está disponível no momento.";


                vazio.appendChild(
                    texto
                );


                listaRestaurantes.appendChild(
                    vazio
                );


                return;
            }


            /* =================================================
               BUSCA SEM RESULTADO
               ================================================= */

            if (
                filtrados.length === 0
            ) {

                const vazio =
                    document.createElement(
                        "div"
                    );

                vazio.className =
                    "estado-vazio";


                const texto =
                    document.createElement(
                        "p"
                    );

                texto.textContent =
                    "Nenhum restaurante encontrado para essa busca.";


                vazio.appendChild(
                    texto
                );


                listaRestaurantes.appendChild(
                    vazio
                );


                return;
            }


            /* =================================================
               LISTAR RESTAURANTES
               ================================================= */

            filtrados.forEach(
                restaurante => {

                    listaRestaurantes.appendChild(
                        criarCardRestaurante(
                            restaurante
                        )
                    );

                }
            );

        }


        /* =====================================================
           BUSCA
           ===================================================== */

        campoBusca.addEventListener(
            "input",
            () => {

                renderizarRestaurantes(
                    campoBusca.value
                );

            }
        );


        /* =====================================================
           INICIALIZAÇÃO
           ===================================================== */

        atualizarCabecalho();

        renderizarRestaurantes();

    }
);