"use strict";

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           STARTLAMPIÃO
           CLIENTE - MEUS PEDIDOS
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

        const nomeCliente =
            document.getElementById(
                "nomeCliente"
            );

        const mensagem =
            document.getElementById(
                "mensagem"
            );

        const totalPedidos =
            document.getElementById(
                "totalPedidos"
            );

        const totalEmAndamento =
            document.getElementById(
                "totalEmAndamento"
            );

        const totalEntregues =
            document.getElementById(
                "totalEntregues"
            );

        const filtroStatus =
            document.getElementById(
                "filtroStatus"
            );

        const listaPedidos =
            document.getElementById(
                "listaPedidos"
            );

        const estadoVazio =
            document.getElementById(
                "estadoVazio"
            );

        const btnAtualizar =
            document.getElementById(
                "btnAtualizar"
            );

        const btnSair =
            document.getElementById(
                "btnSair"
            );


        if (
            !nomeCliente ||
            !mensagem ||
            !totalPedidos ||
            !totalEmAndamento ||
            !totalEntregues ||
            !filtroStatus ||
            !listaPedidos ||
            !estadoVazio ||
            !btnAtualizar ||
            !btnSair
        ) {

            console.error(
                "A página meus_pedidos.html está sem elementos obrigatórios."
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
                "cliente/meus_pedidos.html"
            );

            window.location.href =
                "../login.html";

            return;
        }


        /* =====================================================
           IDENTIFICAR CLIENTE
        ===================================================== */

        nomeCliente.textContent =
            sessao.nome
            ||
            "Cliente";


        /* =====================================================
           SEGURANÇA DE HTML
        ===================================================== */

        function escaparHTML(
            valor
        ) {

            return String(
                valor ?? ""
            )
                .replaceAll(
                    "&",
                    "&amp;"
                )
                .replaceAll(
                    "<",
                    "&lt;"
                )
                .replaceAll(
                    ">",
                    "&gt;"
                )
                .replaceAll(
                    '"',
                    "&quot;"
                )
                .replaceAll(
                    "'",
                    "&#039;"
                );
        }


        /* =====================================================
           STATUS
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
                    "Pedido confirmado",

                preparando:
                    "Em preparo",

                pronto:
                    "Pedido pronto",

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
                "Aguardando confirmação"
            );
        }


        function obterClasseStatus(
            status
        ) {

            const mapa = {

                novo:
                    "status-aguardando",

                aguardando_confirmacao:
                    "status-aguardando",

                confirmado:
                    "status-confirmado",

                preparando:
                    "status-preparando",

                pronto:
                    "status-pronto",

                saiu_para_entrega:
                    "status-entrega",

                entregue:
                    "status-entregue",

                cancelado:
                    "status-cancelado"

            };


            return (
                mapa[status]
                ||
                "status-aguardando"
            );
        }


        /* =====================================================
           ENDEREÇO
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


            const partes =
                [];


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
                endereco.cidade ||
                endereco.estado
            ) {

                partes.push(
                    [
                        endereco.cidade,
                        endereco.estado
                    ]
                        .filter(
                            Boolean
                        )
                        .join(
                            " - "
                        )
                );
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


            return partes
                .filter(
                    Boolean
                )
                .join(
                    " • "
                );
        }


        /* =====================================================
           PEDIDOS DO CLIENTE
        ===================================================== */

        function obterPedidosCliente() {

            const pedidos =
                Storage.listarPedidos();


            if (
                !Array.isArray(
                    pedidos
                )
            ) {

                return [];
            }


            return pedidos
                .filter(
                    pedido =>
                        pedido.clienteId ===
                        sessao.id
                )
                .sort(
                    (
                        a,
                        b
                    ) => {

                        const dataA =
                            new Date(
                                a.criadoEm || 0
                            ).getTime();

                        const dataB =
                            new Date(
                                b.criadoEm || 0
                            ).getTime();


                        return (
                            dataB -
                            dataA
                        );
                    }
                );
        }


        /* =====================================================
           ITENS
        ===================================================== */

        function criarHTMLItens(
            itens
        ) {

            if (
                !Array.isArray(
                    itens
                )
                ||
                itens.length === 0
            ) {

                return `
                    <p>
                        Nenhum item informado.
                    </p>
                `;
            }


            return itens
                .map(
                    item => {

                        const quantidade =
                            Number(
                                item.quantidade
                            )
                            ||
                            1;


                        const preco =
                            Number(
                                item.preco
                            )
                            ||
                            0;


                        return `
                            <div class="item-pedido">

                                <strong>
                                    ${quantidade}×
                                    ${escaparHTML(
                                        item.nome
                                    )}
                                </strong>

                                <span>
                                    ${Utils.formatarMoeda(
                                        preco *
                                        quantidade
                                    )}
                                </span>

                            </div>
                        `;
                    }
                )
                .join(
                    ""
                );
        }


        /* =====================================================
           CARD DO PEDIDO
        ===================================================== */

        function criarHTMLPedido(
            pedido
        ) {

            const pagamento =
                pedido.pagamento
                ||
                {};


            const formaPagamento =
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


            const dataPedido =
                pedido.criadoEm
                    ? Utils.formatarDataHora(
                        pedido.criadoEm
                    )
                    : "Data não informada";


            let dadosEntregador =
                "";


            if (
                pedido.entregadorNome
            ) {

                dadosEntregador = `
                    <div class="dados-entregador">

                        <p>
                            <strong>
                                Entregador:
                            </strong>

                            ${escaparHTML(
                                pedido.entregadorNome
                            )}
                        </p>

                        ${
                            pedido.entregadorTelefone
                                ? `
                                    <p>
                                        <strong>
                                            WhatsApp:
                                        </strong>

                                        ${escaparHTML(
                                            pedido.entregadorTelefone
                                        )}
                                    </p>
                                `
                                : ""
                        }

                    </div>
                `;
            }


            return `
                <article
                    class="pedido-card"
                    data-id="${escaparHTML(pedido.id)}"
                >

                    <div class="pedido-cabecalho">

                        <div>

                            <h2>
                                ${escaparHTML(
                                    pedido.restauranteNome
                                    ||
                                    "Restaurante"
                                )}
                            </h2>

                            <p class="pedido-data">
                                Pedido
                                ${escaparHTML(pedido.id)}
                                •
                                ${escaparHTML(dataPedido)}
                            </p>

                        </div>


                        <span
                            class="status ${obterClasseStatus(
                                pedido.status
                            )}"
                        >
                            ${escaparHTML(
                                formatarStatus(
                                    pedido.status
                                )
                            )}
                        </span>

                    </div>


                    <div class="pedido-corpo">


                        <section class="bloco-pedido">

                            <h3>
                                Itens
                            </h3>

                            <div class="lista-itens">

                                ${criarHTMLItens(
                                    pedido.itens
                                )}

                            </div>


                            <div class="valor-total">

                                <span>
                                    Total
                                </span>

                                <strong>
                                    ${Utils.formatarMoeda(
                                        pedido.total || 0
                                    )}
                                </strong>

                            </div>

                        </section>


                        <section class="bloco-pedido">

                            <h3>
                                Entrega
                            </h3>

                            <p>
                                ${escaparHTML(
                                    formatarEndereco(
                                        pedido.endereco
                                    )
                                )}
                            </p>


                            <h3>
                                Pagamento
                            </h3>

                            <p>
                                ${escaparHTML(
                                    formaPagamento
                                )}
                            </p>


                            ${
                                pagamento.trocoPara
                                    ? `
                                        <p>
                                            <strong>
                                                Troco para:
                                            </strong>

                                            ${Utils.formatarMoeda(
                                                pagamento.trocoPara
                                            )}
                                        </p>
                                    `
                                    : ""
                            }


                            ${dadosEntregador}

                        </section>


                    </div>

                </article>
            `;
        }


        /* =====================================================
           RESUMO
        ===================================================== */

        function atualizarResumo(
            pedidos
        ) {

            totalPedidos.textContent =
                pedidos.length;


            totalEntregues.textContent =
                pedidos.filter(
                    pedido =>
                        pedido.status ===
                        "entregue"
                ).length;


            totalEmAndamento.textContent =
                pedidos.filter(
                    pedido =>
                        pedido.status !==
                            "entregue"
                        &&
                        pedido.status !==
                            "cancelado"
                ).length;
        }


        /* =====================================================
           FILTRO
        ===================================================== */

        function aplicarFiltro(
            pedidos
        ) {

            const filtro =
                filtroStatus.value;


            if (
                filtro === "todos"
            ) {

                return pedidos;
            }


            if (
                filtro ===
                "em_andamento"
            ) {

                return pedidos.filter(
                    pedido =>
                        pedido.status !==
                            "entregue"
                        &&
                        pedido.status !==
                            "cancelado"
                );
            }


            return pedidos.filter(
                pedido =>
                    pedido.status ===
                    filtro
            );
        }


        /* =====================================================
           RENDERIZAR
        ===================================================== */

        function renderizarPedidos() {

            const pedidos =
                obterPedidosCliente();


            atualizarResumo(
                pedidos
            );


            const pedidosFiltrados =
                aplicarFiltro(
                    pedidos
                );


            if (
                pedidosFiltrados.length ===
                0
            ) {

                listaPedidos.innerHTML =
                    "";

                estadoVazio.classList.remove(
                    "oculto"
                );

                return;
            }


            estadoVazio.classList.add(
                "oculto"
            );


            listaPedidos.innerHTML =
                pedidosFiltrados
                    .map(
                        criarHTMLPedido
                    )
                    .join(
                        ""
                    );
        }


        /* =====================================================
           FILTRO
        ===================================================== */

        filtroStatus.addEventListener(
            "change",
            () => {

                Utils.esconderMensagem(
                    mensagem
                );

                renderizarPedidos();
            }
        );


        /* =====================================================
           ATUALIZAR
        ===================================================== */

        btnAtualizar.addEventListener(
            "click",
            () => {

                Utils.esconderMensagem(
                    mensagem
                );

                renderizarPedidos();

                Utils.mostrarMensagem(
                    mensagem,
                    "Pedidos atualizados.",
                    "sucesso"
                );
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

        Utils.esconderMensagem(
            mensagem
        );

        renderizarPedidos();

    }
);