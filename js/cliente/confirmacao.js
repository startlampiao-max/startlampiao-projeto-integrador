"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           STARTLAMPIÃO
           ÁREA DO CLIENTE - CONFIRMAÇÃO DO PEDIDO
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

        const mensagem =
            document.getElementById(
                "mensagem"
            );

        const numeroPedido =
            document.getElementById(
                "numeroPedido"
            );

        const nomeRestaurante =
            document.getElementById(
                "nomeRestaurante"
            );

        const formaPagamento =
            document.getElementById(
                "formaPagamento"
            );

        const statusPedido =
            document.getElementById(
                "statusPedido"
            );

        const totalPedido =
            document.getElementById(
                "totalPedido"
            );

        const nomeCliente =
            document.getElementById(
                "nomeCliente"
            );

        const enderecoEntrega =
            document.getElementById(
                "enderecoEntrega"
            );

        const totalItens =
            document.getElementById(
                "totalItens"
            );

        const areaPix =
            document.getElementById(
                "areaPix"
            );

        const areaDinheiro =
            document.getElementById(
                "areaDinheiro"
            );

        const textoTroco =
            document.getElementById(
                "textoTroco"
            );

        const btnWhatsapp =
            document.getElementById(
                "btnWhatsapp"
            );


        if (
            !mensagem ||
            !numeroPedido ||
            !nomeRestaurante ||
            !formaPagamento ||
            !statusPedido ||
            !totalPedido ||
            !nomeCliente ||
            !enderecoEntrega ||
            !totalItens ||
            !areaPix ||
            !areaDinheiro ||
            !textoTroco ||
            !btnWhatsapp
        ) {

            console.error(
                "A página confirmacao.html está sem elementos obrigatórios."
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
                "cliente/confirmacao.html"
            );


            window.location.href =
                "../login.html";


            return;
        }


        /* =====================================================
           PEDIDO CONFIRMADO
           ===================================================== */

        const pedidoId =
            sessionStorage.getItem(
                "startlampiao_pedido_confirmado"
            );


        if (!pedidoId) {

            Utils.mostrarMensagem(
                mensagem,
                "Nenhum pedido confirmado foi encontrado.",
                "erro"
            );

            return;
        }


        /* =====================================================
           LOCALIZAR PEDIDO
           ===================================================== */

        const pedidos =
            Storage.listarPedidos();


        const pedido =
            Array.isArray(
                pedidos
            )
                ? pedidos.find(
                    item =>
                        item.id === pedidoId
                )
                : null;


        if (!pedido) {

            Utils.mostrarMensagem(
                mensagem,
                "Não foi possível localizar os dados do pedido.",
                "erro"
            );

            return;
        }


        /* =====================================================
           FORMATAR STATUS
           ===================================================== */

        function formatarStatus(
            status
        ) {

            const mapa = {

                novo:
                    "Aguardando confirmação",

                aguardando_confirmacao:
                    "Aguardando confirmação",

                confirmado:
                    "Confirmado",

                preparando:
                    "Em preparo",

                pronto:
                    "Pronto para entrega",

                saiu_para_entrega:
                    "Saiu para entrega",

                entregue:
                    "Entregue",

                cancelado:
                    "Cancelado"

            };


            return (
                mapa[status]
                ||
                status
                ||
                "Aguardando confirmação"
            );

        }


        /* =====================================================
           FORMATAR ENDEREÇO
           ===================================================== */

        function formatarEndereco(
            endereco
        ) {

            if (
                !endereco ||
                typeof endereco !== "object"
            ) {

                return "Endereço não informado.";
            }


            const partes = [];


            if (
                endereco.logradouro
            ) {

                let linha =
                    endereco.logradouro;


                if (
                    endereco.numero
                ) {

                    linha +=
                        `, ${endereco.numero}`;

                }


                partes.push(
                    linha
                );

            }


            if (
                endereco.complemento
            ) {

                partes.push(
                    endereco.complemento
                );

            }


            if (
                endereco.bairro
            ) {

                partes.push(
                    endereco.bairro
                );

            }


            if (
                endereco.cidade
                ||
                endereco.estado
            ) {

                const cidadeEstado =
                    [
                        endereco.cidade,
                        endereco.estado
                    ]
                        .filter(
                            Boolean
                        )
                        .join(
                            " - "
                        );


                if (
                    cidadeEstado
                ) {

                    partes.push(
                        cidadeEstado
                    );

                }

            }


            if (
                endereco.cep
            ) {

                partes.push(
                    `CEP ${endereco.cep}`
                );

            }


            if (
                endereco.referencia
            ) {

                partes.push(
                    `Referência: ${endereco.referencia}`
                );

            }


            return partes.join(
                " • "
            );

        }


        /* =====================================================
           WHATSAPP
           ===================================================== */

        function limparTelefone(
            valor
        ) {

            return String(
                valor || ""
            )
                .replace(
                    /\D/g,
                    ""
                );

        }


        function abrirWhatsapp() {

            const restaurante =
                Storage.buscarRestaurantePorId(
                    pedido.restauranteId
                );


            if (
                !restaurante
            ) {

                Utils.mostrarMensagem(
                    mensagem,
                    "Não foi possível localizar os dados do restaurante.",
                    "erro"
                );

                return;
            }


            const telefone =
                limparTelefone(
                    restaurante.telefone
                );


            if (!telefone) {

                Utils.mostrarMensagem(
                    mensagem,
                    "O restaurante ainda não possui telefone cadastrado para pagamento via WhatsApp.",
                    "erro"
                );

                return;
            }


            const telefoneBrasil =
                telefone.startsWith(
                    "55"
                )
                    ? telefone
                    : `55${telefone}`;


            const texto =
                [
                    "Olá! Quero realizar o pagamento via Pix do meu pedido no StartLampião.",
                    "",
                    `Pedido: ${pedido.id}`,
                    `Restaurante: ${pedido.restauranteNome}`,
                    `Total: ${Utils.formatarMoeda(pedido.total)}`
                ]
                    .join(
                        "\n"
                    );


            const url =
                `https://wa.me/${telefoneBrasil}?text=${encodeURIComponent(texto)}`;


            window.open(
                url,
                "_blank",
                "noopener,noreferrer"
            );

        }


        /* =====================================================
           RENDERIZAR PEDIDO
           ===================================================== */

        function renderizarPedido() {

            numeroPedido.textContent =
                pedido.id;


            nomeRestaurante.textContent =
                pedido.restauranteNome
                ||
                "Restaurante";


            nomeCliente.textContent =
                pedido.clienteNome
                ||
                sessao.nome
                ||
                "Cliente";


            totalItens.textContent =
                pedido.quantidadeItens
                ||
                0;


            totalPedido.textContent =
                Utils.formatarMoeda(
                    pedido.total
                    ||
                    0
                );


            statusPedido.textContent =
                formatarStatus(
                    pedido.status
                );


            enderecoEntrega.textContent =
                formatarEndereco(
                    pedido.endereco
                );


            const pagamento =
                pedido.pagamento
                ||
                {};


            formaPagamento.textContent =
                pagamento.descricao
                ||
                (
                    pagamento.forma ===
                    "pix_whatsapp"
                        ? "Pix pelo WhatsApp"
                        : pagamento.forma ===
                          "dinheiro"
                            ? "Dinheiro na entrega"
                            : "Não informado"
                );


            areaPix.classList.add(
                "oculto"
            );


            areaDinheiro.classList.add(
                "oculto"
            );


            /* =================================================
               PIX
               ================================================= */

            if (
                pagamento.forma ===
                "pix_whatsapp"
            ) {

                areaPix.classList.remove(
                    "oculto"
                );

            }


            /* =================================================
               DINHEIRO
               ================================================= */

            if (
                pagamento.forma ===
                "dinheiro"
            ) {

                areaDinheiro.classList.remove(
                    "oculto"
                );


                if (
                    pagamento.trocoPara
                ) {

                    textoTroco.textContent =
                        `Pagamento na entrega. Troco para ${Utils.formatarMoeda(pagamento.trocoPara)}.`;

                } else {

                    textoTroco.textContent =
                        "O pagamento será realizado no momento da entrega. Não foi solicitado troco.";

                }

            }

        }


        /* =====================================================
           BOTÃO WHATSAPP
           ===================================================== */

        btnWhatsapp.addEventListener(
            "click",
            abrirWhatsapp
        );


        /* =====================================================
           INICIALIZAÇÃO
           ===================================================== */

        Utils.esconderMensagem(
            mensagem
        );


        renderizarPedido();

    }
);