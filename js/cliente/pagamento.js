"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           STARTLAMPIÃO
           ÁREA DO CLIENTE - PAGAMENTO
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
                "Os módulos centrais do StartLampião não foram carregados."
            );

            return;
        }


        /* =====================================================
           ELEMENTOS
           ===================================================== */

        const formPagamento =
            document.getElementById(
                "formPagamento"
            );

        const mensagem =
            document.getElementById(
                "mensagem"
            );

        const areaTroco =
            document.getElementById(
                "areaTroco"
            );

        const trocoPara =
            document.getElementById(
                "trocoPara"
            );

        const nomeRestaurante =
            document.getElementById(
                "nomeRestaurante"
            );

        const totalItens =
            document.getElementById(
                "totalItens"
            );

        const totalPedido =
            document.getElementById(
                "totalPedido"
            );

        const btnConfirmar =
            document.getElementById(
                "btnConfirmar"
            );

        const radiosPagamento =
            document.querySelectorAll(
                'input[name="formaPagamento"]'
            );


        if (
            !formPagamento ||
            !mensagem ||
            !areaTroco ||
            !trocoPara ||
            !nomeRestaurante ||
            !totalItens ||
            !totalPedido ||
            !btnConfirmar ||
            radiosPagamento.length === 0
        ) {

            console.error(
                "A página pagamento.html está sem elementos obrigatórios."
            );

            return;
        }


        /* =====================================================
           EXIGIR CLIENTE LOGADO
           ===================================================== */

        const sessao =
            Auth.obterSessao();


        if (
            !sessao ||
            sessao.tipo !== Auth.TIPOS.CLIENTE
        ) {

            sessionStorage.setItem(
                "startlampiao_retorno_login",
                "cliente/pagamento.html"
            );


            window.location.href =
                "../login.html";


            return;
        }


        /* =====================================================
           ENDEREÇO DO PEDIDO
           ===================================================== */

        let enderecoPedido =
            null;


        const enderecoSalvo =
            sessionStorage.getItem(
                "startlampiao_endereco_pedido"
            );


        if (enderecoSalvo) {

            try {

                enderecoPedido =
                    JSON.parse(
                        enderecoSalvo
                    );

            } catch (erro) {

                console.error(
                    "Erro ao ler endereço do pedido:",
                    erro
                );

            }

        }


        if (!enderecoPedido) {

            window.location.href =
                "endereco.html";


            return;
        }


        /* =====================================================
           CARRINHO
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
           RESUMO
           ===================================================== */

        function carregarResumo() {

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


                btnConfirmar.disabled =
                    true;


                nomeRestaurante.textContent =
                    "Nenhum restaurante";


                totalItens.textContent =
                    "0";


                totalPedido.textContent =
                    Utils.formatarMoeda(
                        0
                    );


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


            totalItens.textContent =
                calcularQuantidadeTotal(
                    carrinho
                );


            totalPedido.textContent =
                Utils.formatarMoeda(
                    calcularTotal(
                        carrinho
                    )
                );


            btnConfirmar.disabled =
                false;

        }


        /* =====================================================
           FORMA DE PAGAMENTO
           ===================================================== */

        function obterFormaPagamento() {

            const selecionado =
                document.querySelector(
                    'input[name="formaPagamento"]:checked'
                );


            return selecionado
                ? selecionado.value
                : "";

        }


        radiosPagamento.forEach(
            radio => {

                radio.addEventListener(
                    "change",
                    () => {

                        if (
                            radio.checked &&
                            radio.value ===
                            "dinheiro"
                        ) {

                            areaTroco.classList.remove(
                                "oculto"
                            );


                            return;
                        }


                        if (
                            radio.checked
                        ) {

                            areaTroco.classList.add(
                                "oculto"
                            );


                            trocoPara.value =
                                "";

                        }

                    }
                );

            }
        );


        /* =====================================================
           CONFIRMAR PEDIDO
           ===================================================== */

        formPagamento.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                Utils.esconderMensagem(
                    mensagem
                );


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


                const formaPagamento =
                    obterFormaPagamento();


                if (!formaPagamento) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "Selecione uma forma de pagamento.",
                        "erro"
                    );

                    return;
                }


                const total =
                    calcularTotal(
                        carrinho
                    );


                let valorTroco =
                    null;


                /* =================================================
                   DINHEIRO
                   ================================================= */

                if (
                    formaPagamento ===
                    "dinheiro"
                ) {

                    const valorDigitado =
                        String(
                            trocoPara.value || ""
                        )
                            .trim();


                    if (valorDigitado) {

                        const valor =
                            Number(
                                valorDigitado
                            );


                        if (
                            !Number.isFinite(
                                valor
                            )
                            ||
                            valor <= 0
                        ) {

                            Utils.mostrarMensagem(
                                mensagem,
                                "Informe um valor válido para o troco.",
                                "erro"
                            );

                            return;
                        }


                        if (
                            valor < total
                        ) {

                            Utils.mostrarMensagem(
                                mensagem,
                                "O valor para troco não pode ser menor que o total do pedido.",
                                "erro"
                            );

                            return;
                        }


                        valorTroco =
                            valor;

                    }

                }


                /* =================================================
                   RESTAURANTE
                   ================================================= */

                const restauranteId =
                    carrinho[0]
                        .restauranteId;


                const restaurante =
                    Storage.buscarRestaurantePorId(
                        restauranteId
                    );


                if (!restaurante) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "Não foi possível identificar o restaurante do pedido.",
                        "erro"
                    );

                    return;
                }


                /* =================================================
                   PEDIDO
                   ================================================= */

                const pedido = {

                    id:
                        Storage.gerarId(
                            "PED"
                        ),

                    clienteId:
                        sessao.id,

                    clienteNome:
                        sessao.nome || "",

                    clienteEmail:
                        sessao.email || "",

                    restauranteId:
                        restaurante.id,

                    restauranteNome:
                        restaurante.nome || "",

                    itens:
                        carrinho.map(
                            item => ({

                                produtoId:
                                    item.produtoId,

                                categoriaId:
                                    item.categoriaId,

                                nome:
                                    item.nome,

                                descricao:
                                    item.descricao || "",

                                preco:
                                    Number(
                                        item.preco
                                    ) || 0,

                                quantidade:
                                    Number(
                                        item.quantidade
                                    ) || 1,

                                subtotal:
                                    (
                                        Number(
                                            item.preco
                                        ) || 0
                                    )
                                    *
                                    (
                                        Number(
                                            item.quantidade
                                        ) || 1
                                    )

                            })
                        ),

                    quantidadeItens:
                        calcularQuantidadeTotal(
                            carrinho
                        ),

                    subtotal:
                        total,

                    total:
                        total,

                    endereco:
                        enderecoPedido,

                    pagamento: {

                        forma:
                            formaPagamento,

                        descricao:
                            formaPagamento ===
                            "pix_whatsapp"
                                ? "Pix pelo WhatsApp"
                                : "Dinheiro na entrega",

                        trocoPara:
                            valorTroco

                    },

                    status:
                        "aguardando_confirmacao",

                    criadoEm:
                        Utils.agoraISO()

                };


                /* =================================================
                   SALVAR PEDIDO
                   ================================================= */

                btnConfirmar.disabled =
                    true;


                const salvo =
                    Storage.adicionarPedido(
                        pedido
                    );


                if (!salvo) {

                    btnConfirmar.disabled =
                        false;


                    Utils.mostrarMensagem(
                        mensagem,
                        "Não foi possível registrar o pedido.",
                        "erro"
                    );

                    return;
                }


                /* =================================================
                   CONFIRMAR PEDIDO NO STORAGE
                   ================================================= */

                const pedidos =
                    Storage.listarPedidos();


                const pedidoConfirmado =
                    Array.isArray(
                        pedidos
                    )
                        ? pedidos.find(
                            item =>
                                item.id ===
                                pedido.id
                        )
                        : null;


                if (!pedidoConfirmado) {

                    btnConfirmar.disabled =
                        false;


                    Utils.mostrarMensagem(
                        mensagem,
                        "O pedido não foi confirmado no armazenamento.",
                        "erro"
                    );

                    return;
                }


                /* =================================================
                   GUARDAR ID PARA CONFIRMAÇÃO
                   ================================================= */

                sessionStorage.setItem(
                    "startlampiao_pedido_confirmado",
                    pedido.id
                );


                /* =================================================
                   LIMPAR CARRINHO SOMENTE AGORA
                   ================================================= */

                const carrinhoLimpo =
                    Storage.limparCarrinho();


                if (!carrinhoLimpo) {

                    /*
                     * O pedido já foi salvo.
                     * Não vamos criar outro pedido por causa disso.
                     */

                    console.warn(
                        "Pedido salvo, mas não foi possível limpar o carrinho."
                    );

                }


                /* =================================================
                   LIMPAR DADOS TEMPORÁRIOS
                   ================================================= */

                sessionStorage.removeItem(
                    "startlampiao_endereco_pedido"
                );


                sessionStorage.removeItem(
                    "startlampiao_restaurante_selecionado"
                );


                /* =================================================
                   SUCESSO
                   ================================================= */

                Utils.mostrarMensagem(
                    mensagem,
                    "Pedido confirmado com sucesso.",
                    "sucesso"
                );


                /* =================================================
                   IR PARA CONFIRMAÇÃO
                   ================================================= */

                setTimeout(
                    () => {

                        window.location.href =
                            "confirmacao.html";

                    },
                    700
                );

            }
        );


        /* =====================================================
           INICIALIZAÇÃO
           ===================================================== */

        Utils.esconderMensagem(
            mensagem
        );


        carregarResumo();

    }
);