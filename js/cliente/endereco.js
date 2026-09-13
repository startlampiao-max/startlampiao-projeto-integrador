"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           STARTLAMPIÃO
           ÁREA DO CLIENTE - ENDEREÇO DE ENTREGA
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

        const formEndereco =
            document.getElementById(
                "formEndereco"
            );

        const mensagem =
            document.getElementById(
                "mensagem"
            );

        const cep =
            document.getElementById(
                "cep"
            );

        const estado =
            document.getElementById(
                "estado"
            );

        const cidade =
            document.getElementById(
                "cidade"
            );

        const bairro =
            document.getElementById(
                "bairro"
            );

        const logradouro =
            document.getElementById(
                "logradouro"
            );

        const numero =
            document.getElementById(
                "numero"
            );

        const complemento =
            document.getElementById(
                "complemento"
            );

        const referencia =
            document.getElementById(
                "referencia"
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

        const btnContinuar =
            document.getElementById(
                "btnContinuar"
            );


        if (
            !formEndereco ||
            !mensagem ||
            !cep ||
            !estado ||
            !cidade ||
            !bairro ||
            !logradouro ||
            !numero ||
            !complemento ||
            !referencia ||
            !nomeRestaurante ||
            !totalItens ||
            !totalPedido ||
            !btnContinuar
        ) {

            console.error(
                "A página endereco.html está sem elementos obrigatórios."
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
                "cliente/endereco.html"
            );


            window.location.href =
                "../login.html";


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
           RESUMO DO PEDIDO
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


                btnContinuar.disabled =
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


            btnContinuar.disabled =
                false;
        }


        /* =====================================================
           CEP
           ===================================================== */

        cep.addEventListener(
            "input",
            () => {

                let valor =
                    String(
                        cep.value || ""
                    )
                        .replace(
                            /\D/g,
                            ""
                        )
                        .slice(
                            0,
                            8
                        );


                if (
                    valor.length > 5
                ) {

                    valor =
                        valor.slice(
                            0,
                            5
                        )
                        +
                        "-"
                        +
                        valor.slice(
                            5
                        );
                }


                cep.value =
                    valor;
            }
        );


        /* =====================================================
           ESTADO
           ===================================================== */

        estado.addEventListener(
            "input",
            () => {

                estado.value =
                    String(
                        estado.value || ""
                    )
                        .replace(
                            /[^a-zA-Z]/g,
                            ""
                        )
                        .slice(
                            0,
                            2
                        )
                        .toUpperCase();
            }
        );


        /* =====================================================
           ENDEREÇO DO CLIENTE
           ===================================================== */

        const CHAVE_ENDERECO =
            `startlampiao_endereco_cliente_${sessao.id}`;


        function carregarEnderecoSalvo() {

            const salvo =
                Storage.ler(
                    CHAVE_ENDERECO,
                    null
                );


            if (
                !salvo ||
                typeof salvo !== "object"
            ) {

                return;
            }


            cep.value =
                salvo.cep || "";

            estado.value =
                salvo.estado || "";

            cidade.value =
                salvo.cidade || "";

            bairro.value =
                salvo.bairro || "";

            logradouro.value =
                salvo.logradouro || "";

            numero.value =
                salvo.numero || "";

            complemento.value =
                salvo.complemento || "";

            referencia.value =
                salvo.referencia || "";
        }


        /* =====================================================
           CONFIRMAR ENDEREÇO
           ===================================================== */

        formEndereco.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                Utils.esconderMensagem(
                    mensagem
                );


                const dadosEndereco = {

                    clienteId:
                        sessao.id,

                    cep:
                        Utils.limparTexto(
                            cep.value
                        ),

                    estado:
                        Utils.limparTexto(
                            estado.value
                        )
                            .toUpperCase(),

                    cidade:
                        Utils.limparTexto(
                            cidade.value
                        ),

                    bairro:
                        Utils.limparTexto(
                            bairro.value
                        ),

                    logradouro:
                        Utils.limparTexto(
                            logradouro.value
                        ),

                    numero:
                        Utils.limparTexto(
                            numero.value
                        ),

                    complemento:
                        Utils.limparTexto(
                            complemento.value
                        ),

                    referencia:
                        Utils.limparTexto(
                            referencia.value
                        ),

                    atualizadoEm:
                        Utils.agoraISO()
                };


                /* =================================================
                   CAMPOS OBRIGATÓRIOS
                   ================================================= */

                if (
                    !dadosEndereco.cep ||
                    !dadosEndereco.estado ||
                    !dadosEndereco.cidade ||
                    !dadosEndereco.bairro ||
                    !dadosEndereco.logradouro ||
                    !dadosEndereco.numero
                ) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "Preencha todos os campos obrigatórios do endereço.",
                        "erro"
                    );

                    return;
                }


                /* =================================================
                   VALIDAR CEP
                   ================================================= */

                const cepNumeros =
                    dadosEndereco.cep
                        .replace(
                            /\D/g,
                            ""
                        );


                if (
                    cepNumeros.length !== 8
                ) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "Informe um CEP válido com 8 números.",
                        "erro"
                    );

                    return;
                }


                /* =================================================
                   VALIDAR ESTADO
                   ================================================= */

                if (
                    dadosEndereco.estado.length !== 2
                ) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "Informe a sigla do estado com 2 letras.",
                        "erro"
                    );

                    return;
                }


                /* =================================================
                   VERIFICAR CARRINHO
                   ================================================= */

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


                /* =================================================
                   SALVAR ENDEREÇO DO CLIENTE
                   ================================================= */

                btnContinuar.disabled =
                    true;


                const salvo =
                    Storage.salvar(
                        CHAVE_ENDERECO,
                        dadosEndereco
                    );


                if (!salvo) {

                    btnContinuar.disabled =
                        false;


                    Utils.mostrarMensagem(
                        mensagem,
                        "Não foi possível salvar o endereço de entrega.",
                        "erro"
                    );

                    return;
                }


                /* =================================================
                   CONFIRMAR GRAVAÇÃO
                   ================================================= */

                const confirmado =
                    Storage.ler(
                        CHAVE_ENDERECO,
                        null
                    );


                if (!confirmado) {

                    btnContinuar.disabled =
                        false;


                    Utils.mostrarMensagem(
                        mensagem,
                        "O endereço não foi confirmado no armazenamento.",
                        "erro"
                    );

                    return;
                }


                /* =================================================
                   ENDEREÇO DESTE PEDIDO
                   ================================================= */

                sessionStorage.setItem(
                    "startlampiao_endereco_pedido",
                    JSON.stringify(
                        dadosEndereco
                    )
                );


                /* =================================================
                   SUCESSO
                   ================================================= */

                Utils.mostrarMensagem(
                    mensagem,
                    "Endereço confirmado. Abrindo pagamento...",
                    "sucesso"
                );


                /* =================================================
                   IR PARA PAGAMENTO
                   ================================================= */

                setTimeout(
                    () => {

                        window.location.href =
                            "pagamento.html";

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


        carregarEnderecoSalvo();


        carregarResumo();

    }
);