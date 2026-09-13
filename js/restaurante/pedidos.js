"use strict";

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           STARTLAMPIÃO
           ÁREA DO RESTAURANTE - PEDIDOS
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

        const nomeRestaurante =
            document.getElementById(
                "nomeRestaurante"
            );

        const mensagem =
            document.getElementById(
                "mensagem"
            );

        const totalPedidos =
            document.getElementById(
                "totalPedidos"
            );

        const totalAguardando =
            document.getElementById(
                "totalAguardando"
            );

        const totalPreparo =
            document.getElementById(
                "totalPreparo"
            );

        const totalProntos =
            document.getElementById(
                "totalProntos"
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
            !nomeRestaurante ||
            !mensagem ||
            !totalPedidos ||
            !totalAguardando ||
            !totalPreparo ||
            !totalProntos ||
            !filtroStatus ||
            !listaPedidos ||
            !estadoVazio ||
            !btnAtualizar ||
            !btnSair
        ) {

            console.error(
                "A página pedidos.html está sem elementos obrigatórios."
            );

            return;
        }


        /* =====================================================
           EXIGIR RESTAURANTE LOGADO
        ===================================================== */

        const sessao =
            Auth.obterSessao();


        if (
            !sessao ||
            sessao.tipo !== Auth.TIPOS.RESTAURANTE
        ) {

            sessionStorage.setItem(
                "startlampiao_retorno_login",
                "restaurante/pedidos.html"
            );

            window.location.href =
                "../login.html";

            return;
        }


        /* =====================================================
           IDENTIFICAR RESTAURANTE
        ===================================================== */

        const restauranteId =
            sessao.restauranteId;


        if (!restauranteId) {

            Utils.mostrarMensagem(
                mensagem,
                "Não foi possível identificar o restaurante conectado.",
                "erro"
            );

            listaPedidos.innerHTML =
                "";

            return;
        }


        const restaurante =
            Storage.buscarRestaurantePorId(
                restauranteId
            );


        if (!restaurante) {

            Utils.mostrarMensagem(
                mensagem,
                "O restaurante conectado não foi localizado.",
                "erro"
            );

            listaPedidos.innerHTML =
                "";

            return;
        }


        nomeRestaurante.textContent =
            restaurante.nome
            ||
            "Restaurante";


        /* =====================================================
           UTILITÁRIOS
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


        function somenteNumeros(
            valor
        ) {

            return String(
                valor || ""
            ).replace(
                /\D/g,
                ""
            );
        }


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
                    "Pronto",

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
           GOOGLE MAPS
        ===================================================== */

        function criarLinkGoogleMaps(
            endereco
        ) {

            if (
                !endereco ||
                typeof endereco !== "object"
            ) {

                return "";
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
                endereco.bairro
            ) {

                partes.push(
                    endereco.bairro
                );
            }


            if (
                endereco.cidade
            ) {

                partes.push(
                    endereco.cidade
                );
            }


            if (
                endereco.estado
            ) {

                partes.push(
                    endereco.estado
                );
            }


            if (
                endereco.cep
            ) {

                partes.push(
                    endereco.cep
                );
            }


            const enderecoBusca =
                partes
                    .filter(
                        Boolean
                    )
                    .join(
                        ", "
                    );


            if (
                !enderecoBusca
            ) {

                return "";
            }


            return (
                "https://www.google.com/maps/search/?api=1&query="
                +
                encodeURIComponent(
                    enderecoBusca
                )
            );
        }


        /* =====================================================
           ENTREGADORES
        ===================================================== */

        function obterEntregadoresRestaurante() {

            const entregadores =
                Storage.listarEntregadores();


            if (
                !Array.isArray(
                    entregadores
                )
            ) {

                return [];
            }


            return entregadores.filter(
                entregador =>
                    entregador.restauranteId
                    ===
                    restauranteId
            );
        }


        function obterEntregadoresDisponiveis() {

            return obterEntregadoresRestaurante()
                .filter(
                    entregador =>
                        entregador.status
                        ===
                        "disponivel"
                );
        }


        function buscarEntregador(
            entregadorId
        ) {

            return obterEntregadoresRestaurante()
                .find(
                    entregador =>
                        entregador.id
                        ===
                        entregadorId
                )
                ||
                null;
        }


        function atualizarStatusEntregador(
            entregadorId,
            novoStatus
        ) {

            const entregadores =
                Storage.listarEntregadores();


            if (
                !Array.isArray(
                    entregadores
                )
            ) {

                return false;
            }


            const indice =
                entregadores.findIndex(
                    entregador =>
                        entregador.id ===
                            entregadorId
                        &&
                        entregador.restauranteId ===
                            restauranteId
                );


            if (
                indice === -1
            ) {

                return false;
            }


            entregadores[indice] = {

                ...entregadores[indice],

                status:
                    novoStatus,

                atualizadoEm:
                    Utils.agoraISO()
            };


            return Storage.salvarEntregadores(
                entregadores
            );
        }


        /* =====================================================
           PEDIDOS DO RESTAURANTE
        ===================================================== */

        function obterPedidosDoRestaurante() {

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
                        pedido.restauranteId ===
                        restauranteId
                )
                .sort(
                    (
                        a,
                        b
                    ) => {

                        const dataA =
                            new Date(
                                a.criadoEm || 0
                            )
                                .getTime();

                        const dataB =
                            new Date(
                                b.criadoEm || 0
                            )
                                .getTime();


                        return (
                            dataB -
                            dataA
                        );
                    }
                );
        }


        /* =====================================================
           SALVAR PEDIDOS
        ===================================================== */

        function salvarPedidos(
            pedidos
        ) {

            return Storage.salvarPedidos(
                pedidos
            );
        }


        /* =====================================================
           ATUALIZAR STATUS DO PEDIDO
        ===================================================== */

        function atualizarStatusPedido(
            pedidoId,
            novoStatus
        ) {

            const todosPedidos =
                Storage.listarPedidos();


            if (
                !Array.isArray(
                    todosPedidos
                )
            ) {

                Utils.mostrarMensagem(
                    mensagem,
                    "Não foi possível acessar os pedidos.",
                    "erro"
                );

                return;
            }


            const indice =
                todosPedidos.findIndex(
                    pedido =>
                        pedido.id === pedidoId
                        &&
                        pedido.restauranteId ===
                            restauranteId
                );


            if (
                indice === -1
            ) {

                Utils.mostrarMensagem(
                    mensagem,
                    "Pedido não encontrado para este restaurante.",
                    "erro"
                );

                return;
            }


            /*
             * Quando o pedido for entregue,
             * o entregador volta a ficar disponível.
             */

            if (
                novoStatus === "entregue"
                &&
                todosPedidos[indice].entregadorId
            ) {

                atualizarStatusEntregador(
                    todosPedidos[indice].entregadorId,
                    "disponivel"
                );
            }


            todosPedidos[indice] = {

                ...todosPedidos[indice],

                status:
                    novoStatus,

                atualizadoEm:
                    Utils.agoraISO()
            };


            if (
                novoStatus ===
                "entregue"
            ) {

                todosPedidos[indice].entregueEm =
                    Utils.agoraISO();
            }


            const salvo =
                salvarPedidos(
                    todosPedidos
                );


            if (!salvo) {

                Utils.mostrarMensagem(
                    mensagem,
                    "Não foi possível atualizar o pedido.",
                    "erro"
                );

                return;
            }


            Utils.mostrarMensagem(
                mensagem,
                `Status atualizado para: ${formatarStatus(novoStatus)}.`,
                "sucesso"
            );


            renderizarPedidos();
        }


        /* =====================================================
           OPÇÕES DE ENTREGADORES
        ===================================================== */

        function criarOpcoesEntregadores() {

            const entregadores =
                obterEntregadoresDisponiveis();


            if (
                entregadores.length === 0
            ) {

                return `
                    <option value="">
                        Nenhum entregador disponível
                    </option>
                `;
            }


            return `
                <option value="">
                    Selecione o entregador
                </option>

                ${
                    entregadores
                        .map(
                            entregador => `
                                <option
                                    value="${escaparHTML(entregador.id)}"
                                >
                                    ${escaparHTML(entregador.nome)}
                                    - ${escaparHTML(entregador.veiculo || "")}
                                </option>
                            `
                        )
                        .join("")
                }
            `;
        }


        /* =====================================================
           AÇÕES DO PEDIDO
        ===================================================== */

        function criarAcoesPedido(
            pedido
        ) {

            switch (
                pedido.status
            ) {

                case "novo":

                case "aguardando_confirmacao":

                    return `
                        <button
                            type="button"
                            class="btn-aceitar"
                            data-acao="confirmado"
                            data-pedido="${escaparHTML(pedido.id)}"
                        >
                            Aceitar pedido
                        </button>

                        <button
                            type="button"
                            class="btn-cancelar"
                            data-acao="cancelado"
                            data-pedido="${escaparHTML(pedido.id)}"
                        >
                            Cancelar pedido
                        </button>
                    `;


                case "confirmado":

                    return `
                        <button
                            type="button"
                            class="btn-preparar"
                            data-acao="preparando"
                            data-pedido="${escaparHTML(pedido.id)}"
                        >
                            Iniciar preparo
                        </button>

                        <button
                            type="button"
                            class="btn-cancelar"
                            data-acao="cancelado"
                            data-pedido="${escaparHTML(pedido.id)}"
                        >
                            Cancelar pedido
                        </button>
                    `;


                case "preparando":

                    return `
                        <button
                            type="button"
                            class="btn-pronto"
                            data-acao="pronto"
                            data-pedido="${escaparHTML(pedido.id)}"
                        >
                            Marcar como pronto
                        </button>
                    `;


                case "pronto":

                    return `
                        <div class="area-entrega">

                            <label
                                for="entregador-${escaparHTML(pedido.id)}"
                            >
                                <strong>
                                    Entregador disponível
                                </strong>
                            </label>

                            <select
                                id="entregador-${escaparHTML(pedido.id)}"
                                class="select-entregador"
                                data-select-pedido="${escaparHTML(pedido.id)}"
                            >
                                ${criarOpcoesEntregadores()}
                            </select>

                            <button
                                type="button"
                                class="btn-aceitar"
                                data-enviar-whatsapp="${escaparHTML(pedido.id)}"
                            >
                                Enviar entrega pelo WhatsApp
                            </button>

                            <a
                                href="entregadores.html"
                                class="btn btn-secundario"
                            >
                                Gerenciar entregadores
                            </a>

                        </div>
                    `;


                case "saiu_para_entrega":

                    return `
                        <button
                            type="button"
                            class="btn-pronto"
                            data-acao="entregue"
                            data-pedido="${escaparHTML(pedido.id)}"
                        >
                            Marcar como entregue
                        </button>
                    `;


                default:

                    return "";
            }
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

                                <div>

                                    <strong>
                                        ${quantidade}×
                                        ${escaparHTML(item.nome)}
                                    </strong>

                                    ${
                                        item.descricao
                                            ? `
                                                <p>
                                                    ${escaparHTML(item.descricao)}
                                                </p>
                                            `
                                            : ""
                                    }

                                </div>

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
           MENSAGEM DO WHATSAPP
        ===================================================== */

        function criarMensagemWhatsApp(
            pedido,
            entregador
        ) {

            const linhas =
                [];


            linhas.push(
                "*STARTLAMPIÃO - NOVA ENTREGA*"
            );

            linhas.push(
                ""
            );

            linhas.push(
                `*Pedido:* ${pedido.id}`
            );

            linhas.push(
                `*Restaurante:* ${restaurante.nome}`
            );

            linhas.push(
                `*Entregador:* ${entregador.nome}`
            );

            linhas.push(
                ""
            );


            linhas.push(
                "*ITENS DO PEDIDO:*"
            );


            if (
                Array.isArray(
                    pedido.itens
                )
            ) {

                pedido.itens.forEach(
                    item => {

                        linhas.push(
                            `${item.quantidade || 1}x ${item.nome}`
                        );
                    }
                );
            }


            linhas.push(
                ""
            );

            linhas.push(
                `*Total:* ${Utils.formatarMoeda(pedido.total || 0)}`
            );


            const pagamento =
                pedido.pagamento || {};


            if (
                pagamento.descricao
            ) {

                linhas.push(
                    `*Pagamento:* ${pagamento.descricao}`
                );

            } else if (
                pagamento.forma ===
                "pix_whatsapp"
            ) {

                linhas.push(
                    "*Pagamento:* Pix pelo WhatsApp"
                );

            } else if (
                pagamento.forma ===
                "dinheiro"
            ) {

                linhas.push(
                    "*Pagamento:* Dinheiro na entrega"
                );
            }


            if (
                pagamento.trocoPara
            ) {

                linhas.push(
                    `*Troco para:* ${Utils.formatarMoeda(pagamento.trocoPara)}`
                );
            }


            linhas.push(
                ""
            );

            linhas.push(
                "*CLIENTE:*"
            );

            linhas.push(
                pedido.clienteNome
                ||
                "Cliente"
            );


            linhas.push(
                ""
            );

            linhas.push(
                "*ENDEREÇO DE ENTREGA:*"
            );

            linhas.push(
                formatarEndereco(
                    pedido.endereco
                )
            );


            /* =================================================
               LINK DO GOOGLE MAPS
            ================================================= */

            const linkGoogleMaps =
                criarLinkGoogleMaps(
                    pedido.endereco
                );


            if (
                linkGoogleMaps
            ) {

                linhas.push(
                    ""
                );

                linhas.push(
                    "*ABRIR ENDEREÇO NO GOOGLE MAPS:*"
                );

                linhas.push(
                    linkGoogleMaps
                );
            }


            linhas.push(
                ""
            );

            linhas.push(
                "Pedido encaminhado pelo StartLampião."
            );


            return linhas.join(
                "\n"
            );
        }


        /* =====================================================
           ENVIAR ENTREGA PELO WHATSAPP
        ===================================================== */

        function enviarEntregaWhatsApp(
            pedidoId
        ) {

            const select =
                document.querySelector(
                    `[data-select-pedido="${CSS.escape(pedidoId)}"]`
                );


            if (!select) {

                Utils.mostrarMensagem(
                    mensagem,
                    "Não foi possível localizar a seleção de entregadores.",
                    "erro"
                );

                return;
            }


            const entregadorId =
                select.value;


            if (!entregadorId) {

                Utils.mostrarMensagem(
                    mensagem,
                    "Selecione um entregador disponível.",
                    "erro"
                );

                return;
            }


            const entregador =
                buscarEntregador(
                    entregadorId
                );


            if (
                !entregador
                ||
                entregador.status !==
                    "disponivel"
            ) {

                Utils.mostrarMensagem(
                    mensagem,
                    "Este entregador não está disponível.",
                    "erro"
                );

                renderizarPedidos();

                return;
            }


            const pedidos =
                Storage.listarPedidos();


            const indice =
                pedidos.findIndex(
                    pedido =>
                        pedido.id ===
                            pedidoId
                        &&
                        pedido.restauranteId ===
                            restauranteId
                );


            if (
                indice === -1
            ) {

                Utils.mostrarMensagem(
                    mensagem,
                    "Pedido não encontrado.",
                    "erro"
                );

                return;
            }


            const pedido =
                pedidos[indice];


            if (
                pedido.status !==
                "pronto"
            ) {

                Utils.mostrarMensagem(
                    mensagem,
                    "Somente pedidos prontos podem ser enviados para entrega.",
                    "erro"
                );

                return;
            }


            const telefone =
                somenteNumeros(
                    entregador.telefone
                );


            if (
                telefone.length < 10
            ) {

                Utils.mostrarMensagem(
                    mensagem,
                    "O WhatsApp do entregador não é válido.",
                    "erro"
                );

                return;
            }


            const telefoneWhatsApp =
                telefone.startsWith(
                    "55"
                )
                    ? telefone
                    : `55${telefone}`;


            const texto =
                criarMensagemWhatsApp(
                    pedido,
                    entregador
                );


            const url =
                "https://wa.me/"
                +
                telefoneWhatsApp
                +
                "?text="
                +
                encodeURIComponent(
                    texto
                );


            window.open(
                url,
                "_blank",
                "noopener,noreferrer"
            );


            /* =================================================
               VINCULAR ENTREGADOR AO PEDIDO
            ================================================= */

            pedidos[indice] = {

                ...pedido,

                entregadorId:
                    entregador.id,

                entregadorNome:
                    entregador.nome,

                entregadorTelefone:
                    entregador.telefone,

                status:
                    "saiu_para_entrega",

                saiuParaEntregaEm:
                    Utils.agoraISO(),

                atualizadoEm:
                    Utils.agoraISO()
            };


            const salvouPedido =
                Storage.salvarPedidos(
                    pedidos
                );


            if (!salvouPedido) {

                Utils.mostrarMensagem(
                    mensagem,
                    "Não foi possível vincular o entregador ao pedido.",
                    "erro"
                );

                return;
            }


            const salvouEntregador =
                atualizarStatusEntregador(
                    entregador.id,
                    "em_entrega"
                );


            if (!salvouEntregador) {

                Utils.mostrarMensagem(
                    mensagem,
                    "O pedido foi atualizado, mas não foi possível atualizar a disponibilidade do entregador.",
                    "erro"
                );

                return;
            }


            Utils.mostrarMensagem(
                mensagem,
                `Entrega encaminhada para ${entregador.nome}.`,
                "sucesso"
            );


            renderizarPedidos();
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


            let informacaoTroco =
                "";


            if (
                pagamento.forma ===
                    "dinheiro"
                &&
                pagamento.trocoPara
            ) {

                informacaoTroco =
                    `
                        <p>
                            <strong>Troco para:</strong>
                            ${Utils.formatarMoeda(
                                pagamento.trocoPara
                            )}
                        </p>
                    `;
            }


            const dataPedido =
                pedido.criadoEm
                    ? Utils.formatarDataHora(
                        pedido.criadoEm
                    )
                    : "Data não informada";


            const dadosEntregador =
                pedido.entregadorNome
                    ? `
                        <h3>
                            Entregador
                        </h3>

                        <p>
                            <strong>Nome:</strong>
                            ${escaparHTML(
                                pedido.entregadorNome
                            )}
                        </p>

                        ${
                            pedido.entregadorTelefone
                                ? `
                                    <p>
                                        <strong>WhatsApp:</strong>
                                        ${escaparHTML(
                                            pedido.entregadorTelefone
                                        )}
                                    </p>
                                `
                                : ""
                        }
                    `
                    : "";


            const acoes =
                criarAcoesPedido(
                    pedido
                );


            return `
                <article
                    class="pedido-card"
                    data-id="${escaparHTML(pedido.id)}"
                >

                    <div class="pedido-cabecalho">

                        <div>

                            <h3 class="pedido-numero">
                                Pedido
                                ${escaparHTML(pedido.id)}
                            </h3>

                            <p class="pedido-data">
                                ${escaparHTML(dataPedido)}
                            </p>

                        </div>


                        <span
                            class="status ${obterClasseStatus(pedido.status)}"
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
                                Cliente e entrega
                            </h3>

                            <p>
                                <strong>Cliente:</strong>
                                ${escaparHTML(
                                    pedido.clienteNome
                                    ||
                                    "Cliente"
                                )}
                            </p>

                            ${
                                pedido.clienteEmail
                                    ? `
                                        <p>
                                            <strong>E-mail:</strong>
                                            ${escaparHTML(
                                                pedido.clienteEmail
                                            )}
                                        </p>
                                    `
                                    : ""
                            }

                            <p>
                                <strong>Endereço:</strong>
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

                            ${informacaoTroco}

                            ${dadosEntregador}

                        </section>

                    </div>


                    ${
                        acoes
                            ? `
                                <div class="acoes-pedido">

                                    ${acoes}

                                </div>
                            `
                            : ""
                    }

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


            totalAguardando.textContent =
                pedidos.filter(
                    pedido =>
                        pedido.status ===
                            "aguardando_confirmacao"
                        ||
                        pedido.status ===
                            "novo"
                ).length;


            totalPreparo.textContent =
                pedidos.filter(
                    pedido =>
                        pedido.status ===
                            "preparando"
                ).length;


            totalProntos.textContent =
                pedidos.filter(
                    pedido =>
                        pedido.status ===
                            "pronto"
                ).length;
        }


        /* =====================================================
           RENDERIZAR
        ===================================================== */

        function renderizarPedidos() {

            const pedidos =
                obterPedidosDoRestaurante();


            atualizarResumo(
                pedidos
            );


            const filtro =
                filtroStatus.value;


            const pedidosFiltrados =
                filtro === "todos"
                    ? pedidos
                    : pedidos.filter(
                        pedido =>
                            pedido.status ===
                            filtro
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
           CLIQUES
        ===================================================== */

        listaPedidos.addEventListener(
            "click",
            event => {

                const botaoStatus =
                    event.target.closest(
                        "button[data-acao][data-pedido]"
                    );


                if (
                    botaoStatus
                ) {

                    const pedidoId =
                        botaoStatus.dataset.pedido;

                    const acao =
                        botaoStatus.dataset.acao;


                    if (
                        pedidoId &&
                        acao
                    ) {

                        atualizarStatusPedido(
                            pedidoId,
                            acao
                        );
                    }


                    return;
                }


                const botaoWhatsApp =
                    event.target.closest(
                        "button[data-enviar-whatsapp]"
                    );


                if (
                    botaoWhatsApp
                ) {

                    const pedidoId =
                        botaoWhatsApp.dataset
                            .enviarWhatsapp;


                    if (
                        pedidoId
                    ) {

                        enviarEntregaWhatsApp(
                            pedidoId
                        );
                    }
                }
            }
        );


        /* =====================================================
           FILTRO
        ===================================================== */

        filtroStatus.addEventListener(
            "change",
            renderizarPedidos
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