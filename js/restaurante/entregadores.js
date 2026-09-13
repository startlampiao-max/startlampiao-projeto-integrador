"use strict";

/* =========================================================
   STARTLAMPIÃO
   GERENCIAMENTO DE ENTREGADORES DO RESTAURANTE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           REFERÊNCIAS
           ===================================================== */

        const Storage =
            window.StartLampiaoStorage;

        const Auth =
            window.StartLampiaoAuth;


        const formEntregador =
            document.getElementById(
                "formEntregador"
            );

        const nomeInput =
            document.getElementById(
                "nome"
            );

        const telefoneInput =
            document.getElementById(
                "telefone"
            );

        const veiculoSelect =
            document.getElementById(
                "veiculo"
            );

        const placaInput =
            document.getElementById(
                "placa"
            );

        const statusSelect =
            document.getElementById(
                "status"
            );

        const filtroStatus =
            document.getElementById(
                "filtroStatus"
            );

        const listaEntregadores =
            document.getElementById(
                "listaEntregadores"
            );

        const estadoVazio =
            document.getElementById(
                "estadoVazio"
            );

        const nomeRestaurante =
            document.getElementById(
                "nomeRestaurante"
            );

        const totalEntregadores =
            document.getElementById(
                "totalEntregadores"
            );

        const totalDisponiveis =
            document.getElementById(
                "totalDisponiveis"
            );

        const totalEmEntrega =
            document.getElementById(
                "totalEmEntrega"
            );

        const totalIndisponiveis =
            document.getElementById(
                "totalIndisponiveis"
            );

        const mensagem =
            document.getElementById(
                "mensagem"
            );

        const btnSair =
            document.getElementById(
                "btnSair"
            );


        /* =====================================================
           VARIÁVEIS
           ===================================================== */

        let sessao = null;

        let restaurante = null;


        /* =====================================================
           MENSAGEM
           ===================================================== */

        function mostrarMensagem(
            texto,
            tipo = "sucesso"
        ) {

            mensagem.textContent = texto;

            mensagem.classList.remove(
                "oculto"
            );

            if (tipo === "erro") {

                mensagem.style.backgroundColor =
                    "#fde6e4";

                mensagem.style.color =
                    "#b42318";

                mensagem.style.border =
                    "1px solid #f5b7b1";

            } else {

                mensagem.style.backgroundColor =
                    "#dff3e8";

                mensagem.style.color =
                    "#08783f";

                mensagem.style.border =
                    "1px solid #b8dfca";
            }


            window.setTimeout(
                () => {

                    mensagem.classList.add(
                        "oculto"
                    );

                },
                4500
            );
        }


        /* =====================================================
           NORMALIZAÇÃO
           ===================================================== */

        function limparTexto(valor) {

            return String(
                valor || ""
            ).trim();
        }


        function somenteNumeros(valor) {

            return String(
                valor || ""
            ).replace(
                /\D/g,
                ""
            );
        }


        function formatarTelefone(valor) {

            const numeros =
                somenteNumeros(valor)
                    .slice(0, 11);


            if (numeros.length <= 2) {

                return numeros;
            }


            if (numeros.length <= 7) {

                return numeros.replace(
                    /^(\d{2})(\d+)/,
                    "($1) $2"
                );
            }


            if (numeros.length <= 10) {

                return numeros.replace(
                    /^(\d{2})(\d{4})(\d+)/,
                    "($1) $2-$3"
                );
            }


            return numeros.replace(
                /^(\d{2})(\d{5})(\d{4})/,
                "($1) $2-$3"
            );
        }


        function formatarPlaca(valor) {

            return String(
                valor || ""
            )
                .toUpperCase()
                .replace(
                    /[^A-Z0-9]/g,
                    ""
                )
                .slice(
                    0,
                    7
                );
        }


        /* =====================================================
           SESSÃO DO RESTAURANTE
           ===================================================== */

        function carregarRestaurante() {

            sessao =
                Storage.obterSessao();


            if (
                !sessao
                ||
                sessao.tipo !== "restaurante"
                ||
                !sessao.restauranteId
            ) {

                sessionStorage.setItem(
                    "startlampiao_retorno_login",
                    "restaurante/entregadores.html"
                );

                window.location.href =
                    "../login.html";

                return false;
            }


            restaurante =
                Storage.buscarRestaurantePorId(
                    sessao.restauranteId
                );


            if (!restaurante) {

                mostrarMensagem(
                    "Não foi possível identificar o restaurante conectado.",
                    "erro"
                );

                formEntregador
                    .querySelectorAll(
                        "input, select, button"
                    )
                    .forEach(
                        elemento => {

                            elemento.disabled =
                                true;
                        }
                    );

                return false;
            }


            nomeRestaurante.textContent =
                restaurante.nome
                ||
                "Restaurante";


            return true;
        }


        /* =====================================================
           ENTREGADORES DO RESTAURANTE
           ===================================================== */

        function obterEntregadoresRestaurante() {

            if (!restaurante) {
                return [];
            }


            return Storage
                .listarEntregadores()
                .filter(
                    entregador =>
                        entregador.restauranteId
                        ===
                        restaurante.id
                );
        }


        /* =====================================================
           CONTADORES
           ===================================================== */

        function atualizarResumo() {

            const entregadores =
                obterEntregadoresRestaurante();


            const disponiveis =
                entregadores.filter(
                    entregador =>
                        entregador.status
                        ===
                        "disponivel"
                );


            const emEntrega =
                entregadores.filter(
                    entregador =>
                        entregador.status
                        ===
                        "em_entrega"
                );


            const indisponiveis =
                entregadores.filter(
                    entregador =>
                        entregador.status
                        ===
                        "indisponivel"
                );


            totalEntregadores.textContent =
                entregadores.length;

            totalDisponiveis.textContent =
                disponiveis.length;

            totalEmEntrega.textContent =
                emEntrega.length;

            totalIndisponiveis.textContent =
                indisponiveis.length;
        }


        /* =====================================================
           STATUS
           ===================================================== */

        function obterNomeStatus(status) {

            switch (status) {

                case "disponivel":
                    return "Disponível";

                case "em_entrega":
                    return "Em entrega";

                case "indisponivel":
                    return "Indisponível";

                default:
                    return "Indisponível";
            }
        }


        function obterClasseStatus(status) {

            switch (status) {

                case "disponivel":
                    return "status-disponivel";

                case "em_entrega":
                    return "status-em-entrega";

                default:
                    return "status-indisponivel";
            }
        }


        /* =====================================================
           ATUALIZAR STATUS
           ===================================================== */

        function alterarStatus(
            entregadorId,
            novoStatus
        ) {

            const entregadores =
                Storage.listarEntregadores();


            const indice =
                entregadores.findIndex(
                    entregador =>
                        entregador.id
                        ===
                        entregadorId
                        &&
                        entregador.restauranteId
                        ===
                        restaurante.id
                );


            if (indice === -1) {

                mostrarMensagem(
                    "Entregador não encontrado.",
                    "erro"
                );

                return;
            }


            /*
             * O status "em_entrega" será controlado
             * futuramente pelo fluxo do pedido.
             *
             * Nesta tela o restaurante controla apenas
             * disponível / indisponível.
             */

            entregadores[indice].status =
                novoStatus;

            entregadores[indice].atualizadoEm =
                new Date().toISOString();


            const salvou =
                Storage.salvarEntregadores(
                    entregadores
                );


            if (!salvou) {

                mostrarMensagem(
                    "Não foi possível atualizar o entregador.",
                    "erro"
                );

                return;
            }


            mostrarMensagem(
                `Entregador marcado como ${obterNomeStatus(novoStatus)}.`
            );


            renderizarEntregadores();
        }


        /* =====================================================
           REMOVER ENTREGADOR
           ===================================================== */

        function removerEntregador(
            entregadorId
        ) {

            const entregadores =
                Storage.listarEntregadores();


            const entregador =
                entregadores.find(
                    item =>
                        item.id === entregadorId
                        &&
                        item.restauranteId
                        ===
                        restaurante.id
                );


            if (!entregador) {

                mostrarMensagem(
                    "Entregador não encontrado.",
                    "erro"
                );

                return;
            }


            if (
                entregador.status
                ===
                "em_entrega"
            ) {

                mostrarMensagem(
                    "Este entregador está em uma entrega e não pode ser removido agora.",
                    "erro"
                );

                return;
            }


            const confirmar =
                window.confirm(
                    `Deseja remover o entregador ${entregador.nome}?`
                );


            if (!confirmar) {
                return;
            }


            const atualizados =
                entregadores.filter(
                    item =>
                        item.id
                        !==
                        entregadorId
                );


            const salvou =
                Storage.salvarEntregadores(
                    atualizados
                );


            if (!salvou) {

                mostrarMensagem(
                    "Não foi possível remover o entregador.",
                    "erro"
                );

                return;
            }


            mostrarMensagem(
                "Entregador removido com sucesso."
            );


            renderizarEntregadores();
        }


        /* =====================================================
           WHATSAPP
           ===================================================== */

        function abrirWhatsApp(
            entregador
        ) {

            const telefone =
                somenteNumeros(
                    entregador.telefone
                );


            if (!telefone) {

                mostrarMensagem(
                    "O entregador não possui um WhatsApp válido.",
                    "erro"
                );

                return;
            }


            /*
             * Como o projeto está sendo utilizado no Brasil,
             * acrescentamos o código 55 quando necessário.
             */

            const telefoneWhatsApp =
                telefone.startsWith("55")
                    ? telefone
                    : `55${telefone}`;


            const texto =
                [
                    `Olá, ${entregador.nome}!`,
                    "",
                    `Mensagem do restaurante ${restaurante.nome}.`,
                    "",
                    "Este é um contato do StartLampião."
                ].join("\n");


            const url =
                "https://wa.me/"
                +
                telefoneWhatsApp
                +
                "?text="
                +
                encodeURIComponent(texto);


            window.open(
                url,
                "_blank",
                "noopener,noreferrer"
            );
        }


        /* =====================================================
           CRIAR BOTÃO
           ===================================================== */

        function criarBotao(
            texto,
            classe,
            callback
        ) {

            const botao =
                document.createElement(
                    "button"
                );


            botao.type =
                "button";

            botao.textContent =
                texto;

            botao.className =
                classe;


            botao.addEventListener(
                "click",
                callback
            );


            return botao;
        }


        /* =====================================================
           CRIAR CARD
           ===================================================== */

        function criarCardEntregador(
            entregador
        ) {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "entregador-card";


            /* -----------------------------------------------
               INFORMAÇÕES
               ----------------------------------------------- */

            const info =
                document.createElement(
                    "div"
                );

            info.className =
                "entregador-info";


            const titulo =
                document.createElement(
                    "h3"
                );

            titulo.textContent =
                entregador.nome;


            const telefone =
                document.createElement(
                    "p"
                );

            telefone.textContent =
                `WhatsApp: ${entregador.telefone}`;


            const status =
                document.createElement(
                    "span"
                );

            status.className =
                `status-entregador ${obterClasseStatus(entregador.status)}`;

            status.textContent =
                obterNomeStatus(
                    entregador.status
                );


            info.appendChild(
                titulo
            );

            info.appendChild(
                telefone
            );

            info.appendChild(
                status
            );


            /* -----------------------------------------------
               VEÍCULO
               ----------------------------------------------- */

            const veiculo =
                document.createElement(
                    "div"
                );

            veiculo.className =
                "entregador-veiculo";


            const textoVeiculo =
                document.createElement(
                    "p"
                );


            const nomeVeiculo = {

                moto: "Moto",
                bicicleta: "Bicicleta",
                carro: "Carro",
                outro: "Outro"

            };


            textoVeiculo.textContent =
                `Veículo: ${
                    nomeVeiculo[
                        entregador.veiculo
                    ]
                    ||
                    entregador.veiculo
                    ||
                    "Não informado"
                }`;


            const placa =
                document.createElement(
                    "p"
                );


            placa.textContent =
                `Placa: ${
                    entregador.placa
                    ||
                    "Não informada"
                }`;


            veiculo.appendChild(
                textoVeiculo
            );

            veiculo.appendChild(
                placa
            );


            /* -----------------------------------------------
               AÇÕES
               ----------------------------------------------- */

            const acoes =
                document.createElement(
                    "div"
                );

            acoes.className =
                "entregador-acoes";


            const btnWhatsApp =
                criarBotao(
                    "WhatsApp",
                    "btn-disponivel",
                    () =>
                        abrirWhatsApp(
                            entregador
                        )
                );


            acoes.appendChild(
                btnWhatsApp
            );


            /*
             * Quando estiver em entrega, não permitimos
             * trocar manualmente a disponibilidade aqui.
             *
             * Mais adiante o pedido controlará esse estado.
             */

            if (
                entregador.status
                !==
                "em_entrega"
            ) {

                if (
                    entregador.status
                    ===
                    "disponivel"
                ) {

                    const btnIndisponivel =
                        criarBotao(
                            "Marcar indisponível",
                            "btn-indisponivel",
                            () =>
                                alterarStatus(
                                    entregador.id,
                                    "indisponivel"
                                )
                        );


                    acoes.appendChild(
                        btnIndisponivel
                    );

                } else {

                    const btnDisponivel =
                        criarBotao(
                            "Marcar disponível",
                            "btn-disponivel",
                            () =>
                                alterarStatus(
                                    entregador.id,
                                    "disponivel"
                                )
                        );


                    acoes.appendChild(
                        btnDisponivel
                    );
                }
            }


            const btnRemover =
                criarBotao(
                    "Remover",
                    "btn-remover",
                    () =>
                        removerEntregador(
                            entregador.id
                        )
                );


            acoes.appendChild(
                btnRemover
            );


            card.appendChild(
                info
            );

            card.appendChild(
                veiculo
            );

            card.appendChild(
                acoes
            );


            return card;
        }


        /* =====================================================
           RENDERIZAR
           ===================================================== */

        function renderizarEntregadores() {

            listaEntregadores.innerHTML =
                "";


            const todos =
                obterEntregadoresRestaurante();


            const filtro =
                filtroStatus.value;


            const entregadores =
                filtro === "todos"
                    ?
                    todos
                    :
                    todos.filter(
                        entregador =>
                            entregador.status
                            ===
                            filtro
                    );


            atualizarResumo();


            if (todos.length === 0) {

                estadoVazio.classList.remove(
                    "oculto"
                );

                return;
            }


            estadoVazio.classList.add(
                "oculto"
            );


            if (
                entregadores.length
                ===
                0
            ) {

                const aviso =
                    document.createElement(
                        "div"
                    );

                aviso.className =
                    "estado-vazio";


                const titulo =
                    document.createElement(
                        "h3"
                    );

                titulo.textContent =
                    "Nenhum entregador neste filtro";


                const texto =
                    document.createElement(
                        "p"
                    );

                texto.textContent =
                    "Selecione outro status para visualizar os entregadores.";


                aviso.appendChild(
                    titulo
                );

                aviso.appendChild(
                    texto
                );


                listaEntregadores.appendChild(
                    aviso
                );

                return;
            }


            entregadores.forEach(
                entregador => {

                    listaEntregadores.appendChild(
                        criarCardEntregador(
                            entregador
                        )
                    );
                }
            );
        }


        /* =====================================================
           VALIDAR CADASTRO
           ===================================================== */

        function validarFormulario() {

            const nome =
                limparTexto(
                    nomeInput.value
                );

            const telefone =
                somenteNumeros(
                    telefoneInput.value
                );

            const veiculo =
                limparTexto(
                    veiculoSelect.value
                );

            const placa =
                formatarPlaca(
                    placaInput.value
                );


            if (nome.length < 3) {

                mostrarMensagem(
                    "Informe o nome completo do entregador.",
                    "erro"
                );

                nomeInput.focus();

                return false;
            }


            if (
                telefone.length < 10
                ||
                telefone.length > 11
            ) {

                mostrarMensagem(
                    "Informe um telefone/WhatsApp válido.",
                    "erro"
                );

                telefoneInput.focus();

                return false;
            }


            if (!veiculo) {

                mostrarMensagem(
                    "Selecione o veículo do entregador.",
                    "erro"
                );

                veiculoSelect.focus();

                return false;
            }


            /*
             * Bicicleta não exige placa.
             */

            if (
                veiculo !== "bicicleta"
                &&
                placa.length > 0
                &&
                placa.length < 7
            ) {

                mostrarMensagem(
                    "Informe uma placa válida ou deixe o campo vazio.",
                    "erro"
                );

                placaInput.focus();

                return false;
            }


            return true;
        }


        /* =====================================================
           CADASTRAR
           ===================================================== */

        function cadastrarEntregador(
            evento
        ) {

            evento.preventDefault();


            if (!restaurante) {

                mostrarMensagem(
                    "Restaurante não identificado.",
                    "erro"
                );

                return;
            }


            if (!validarFormulario()) {
                return;
            }


            const telefoneNumeros =
                somenteNumeros(
                    telefoneInput.value
                );


            /*
             * Não permitimos o mesmo WhatsApp duas vezes
             * dentro do mesmo restaurante.
             */

            const duplicado =
                obterEntregadoresRestaurante()
                    .some(
                        entregador =>
                            somenteNumeros(
                                entregador.telefone
                            )
                            ===
                            telefoneNumeros
                    );


            if (duplicado) {

                mostrarMensagem(
                    "Já existe um entregador com este WhatsApp neste restaurante.",
                    "erro"
                );

                telefoneInput.focus();

                return;
            }


            const entregador = {

                id:
                    Storage.gerarId(
                        "ENT"
                    ),

                restauranteId:
                    restaurante.id,

                nome:
                    limparTexto(
                        nomeInput.value
                    ),

                telefone:
                    formatarTelefone(
                        telefoneInput.value
                    ),

                veiculo:
                    veiculoSelect.value,

                placa:
                    formatarPlaca(
                        placaInput.value
                    ),

                status:
                    statusSelect.value,

                criadoEm:
                    new Date().toISOString(),

                atualizadoEm:
                    new Date().toISOString()
            };


            const salvou =
                Storage.adicionarEntregador(
                    entregador
                );


            if (!salvou) {

                mostrarMensagem(
                    "Não foi possível cadastrar o entregador.",
                    "erro"
                );

                return;
            }


            /*
             * Confirma que o entregador realmente foi
             * armazenado antes de informar sucesso.
             */

            const confirmou =
                Storage
                    .listarEntregadores()
                    .some(
                        item =>
                            item.id
                            ===
                            entregador.id
                    );


            if (!confirmou) {

                mostrarMensagem(
                    "O cadastro não pôde ser confirmado no armazenamento.",
                    "erro"
                );

                return;
            }


            formEntregador.reset();


            statusSelect.value =
                "disponivel";


            mostrarMensagem(
                `${entregador.nome} foi cadastrado com sucesso.`
            );


            renderizarEntregadores();
        }


        /* =====================================================
           EVENTOS
           ===================================================== */

        formEntregador.addEventListener(
            "submit",
            cadastrarEntregador
        );


        filtroStatus.addEventListener(
            "change",
            renderizarEntregadores
        );


        telefoneInput.addEventListener(
            "input",
            () => {

                telefoneInput.value =
                    formatarTelefone(
                        telefoneInput.value
                    );
            }
        );


        placaInput.addEventListener(
            "input",
            () => {

                placaInput.value =
                    formatarPlaca(
                        placaInput.value
                    );
            }
        );


        btnSair.addEventListener(
            "click",
            () => {

                if (
                    Auth
                    &&
                    typeof Auth.logout
                    ===
                    "function"
                ) {

                    Auth.logout();

                } else {

                    Storage.limparSessao();
                }


                window.location.href =
                    "../login.html";
            }
        );


        /* =====================================================
           INICIALIZAÇÃO
           ===================================================== */

        if (
            carregarRestaurante()
        ) {

            renderizarEntregadores();
        }

    }
);