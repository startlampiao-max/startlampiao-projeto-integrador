"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           STARTLAMPIÃO
           GERENCIAMENTO DE RESTAURANTES
           ===================================================== */


        const Storage =
            window.StartLampiaoStorage;

        const Auth =
            window.StartLampiaoAuth;

        const Utils =
            window.StartLampiaoUtils;


        /* =====================================================
           VERIFICA OS MÓDULOS
           ===================================================== */

        if (
            !Storage ||
            !Auth ||
            !Utils
        ) {

            console.error(
                "Os módulos do StartLampião não foram carregados corretamente."
            );

            return;
        }


        /* =====================================================
           PROTEÇÃO DA PÁGINA
           ===================================================== */

        const acessoPermitido =
            Auth.exigirTipo(
                Auth.TIPOS.ADMIN,
                "../login.html"
            );


        if (!acessoPermitido) {
            return;
        }


        /* =====================================================
           ELEMENTOS
           ===================================================== */

        const listaRestaurantes =
            document.getElementById(
                "listaRestaurantes"
            );


        const totalRestaurantes =
            document.getElementById(
                "totalRestaurantes"
            );


        const totalPendentes =
            document.getElementById(
                "totalPendentes"
            );


        const totalAprovados =
            document.getElementById(
                "totalAprovados"
            );


        const mensagem =
            document.getElementById(
                "mensagem"
            );


        const btnNovoRestaurante =
            document.getElementById(
                "btnNovoRestaurante"
            );


        const btnSair =
            document.getElementById(
                "btnSair"
            );


        /* =====================================================
           PROTEÇÃO DE TEXTO PARA EXIBIÇÃO
           ===================================================== */

        function escaparHTML(valor) {

            return String(
                valor ?? ""
            )
                .replace(
                    /&/g,
                    "&amp;"
                )
                .replace(
                    /</g,
                    "&lt;"
                )
                .replace(
                    />/g,
                    "&gt;"
                )
                .replace(
                    /"/g,
                    "&quot;"
                )
                .replace(
                    /'/g,
                    "&#039;"
                );
        }


        /* =====================================================
           GERAR CÓDIGO ÚNICO
           ===================================================== */

        function gerarCodigoUnico() {

            let codigo;

            let existe;


            do {

                codigo =
                    Utils
                        .gerarCodigoRestaurante();


                existe =
                    Boolean(
                        Storage
                            .buscarRestaurantePorCodigo(
                                codigo
                            )
                    );

            } while (existe);


            return codigo;
        }


        /* =====================================================
           ATUALIZAR CONTADORES
           ===================================================== */

        function atualizarResumo() {

            const restaurantes =
                Storage
                    .listarRestaurantes();


            const pendentes =
                restaurantes.filter(
                    restaurante =>
                        restaurante.status ===
                        "pendente"
                );


            const aprovados =
                restaurantes.filter(
                    restaurante =>
                        restaurante.status ===
                        "aprovado"
                );


            totalRestaurantes.textContent =
                restaurantes.length;


            totalPendentes.textContent =
                pendentes.length;


            totalAprovados.textContent =
                aprovados.length;
        }


        /* =====================================================
           EXIBIR RESTAURANTES
           ===================================================== */

        function carregarRestaurantes() {

            const restaurantes =
                Storage
                    .listarRestaurantes();


            atualizarResumo();


            if (
                restaurantes.length === 0
            ) {

                listaRestaurantes.innerHTML =
                    `
                        <div class="lista-vazia">
                            Nenhum restaurante cadastrado ainda.
                        </div>
                    `;

                return;
            }


            listaRestaurantes.innerHTML =
                restaurantes
                    .map(
                        restaurante => {

                            const aprovado =
                                restaurante.status ===
                                "aprovado";


                            const endereco =
                                restaurante.endereco
                                || {};


                            const classeStatus =
                                aprovado
                                    ? "status-aprovado"
                                    : "status-pendente";


                            const textoStatus =
                                aprovado
                                    ? "Aprovado"
                                    : "Pendente";


                            const codigo =
                                restaurante
                                    .codigoAcesso
                                || "";


                            return `
                                <article
                                    class="restaurante-card"
                                >

                                    <div
                                        class="restaurante-cabecalho"
                                    >

                                        <div>

                                            <h3>
                                                ${
                                                    escaparHTML(
                                                        restaurante.nome
                                                    )
                                                }
                                            </h3>

                                            <p>
                                                ${
                                                    escaparHTML(
                                                        restaurante.categoria
                                                        || ""
                                                    )
                                                }
                                            </p>

                                        </div>


                                        <span
                                            class="status-restaurante ${classeStatus}"
                                        >
                                            ${textoStatus}
                                        </span>

                                    </div>


                                    <div
                                        class="restaurante-dados"
                                    >

                                        <div>

                                            <span>
                                                CNPJ
                                            </span>

                                            <strong>
                                                ${
                                                    escaparHTML(
                                                        restaurante.cnpj
                                                        || ""
                                                    )
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Responsável
                                            </span>

                                            <strong>
                                                ${
                                                    escaparHTML(
                                                        restaurante.responsavel
                                                        || ""
                                                    )
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                E-mail
                                            </span>

                                            <strong>
                                                ${
                                                    escaparHTML(
                                                        restaurante.email
                                                        || ""
                                                    )
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Telefone
                                            </span>

                                            <strong>
                                                ${
                                                    escaparHTML(
                                                        restaurante.telefone
                                                        || ""
                                                    )
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Cidade
                                            </span>

                                            <strong>
                                                ${
                                                    escaparHTML(
                                                        endereco.cidade
                                                        || ""
                                                    )
                                                }
                                                ${
                                                    endereco.estado
                                                        ? ` - ${
                                                            escaparHTML(
                                                                endereco.estado
                                                            )
                                                        }`
                                                        : ""
                                                }
                                            </strong>

                                        </div>

                                    </div>


                                    ${
                                        aprovado
                                            ? `
                                                <div
                                                    class="codigo-acesso-box"
                                                >

                                                    <div>

                                                        <span>
                                                            Código de acesso
                                                        </span>

                                                        <strong
                                                            class="codigo-acesso"
                                                        >
                                                            ${
                                                                escaparHTML(
                                                                    codigo
                                                                )
                                                            }
                                                        </strong>

                                                    </div>


                                                    <button
                                                        type="button"
                                                        class="btn btn-secundario btn-copiar-codigo"
                                                        data-codigo="${
                                                            escaparHTML(
                                                                codigo
                                                            )
                                                        }"
                                                    >
                                                        Copiar código
                                                    </button>

                                                </div>
                                            `
                                            : `
                                                <div
                                                    class="acoes-restaurante"
                                                >

                                                    <button
                                                        type="button"
                                                        class="btn btn-sucesso btn-aprovar-restaurante"
                                                        data-id="${
                                                            escaparHTML(
                                                                restaurante.id
                                                            )
                                                        }"
                                                    >
                                                        Aprovar restaurante
                                                    </button>

                                                </div>
                                            `
                                    }

                                </article>
                            `;
                        }
                    )
                    .join("");


            configurarBotoes();
        }


        /* =====================================================
           APROVAR RESTAURANTE
           ===================================================== */

        function aprovarRestaurante(
            restauranteId
        ) {

            const restaurante =
                Storage
                    .buscarRestaurantePorId(
                        restauranteId
                    );


            if (!restaurante) {

                Utils.mostrarMensagem(
                    mensagem,
                    "Restaurante não encontrado.",
                    "erro"
                );

                return;
            }


            if (
                restaurante.status ===
                "aprovado"
            ) {

                Utils.mostrarMensagem(
                    mensagem,
                    "Este restaurante já está aprovado.",
                    "erro"
                );

                return;
            }


            const codigo =
                gerarCodigoUnico();


            const atualizado =
                Storage
                    .atualizarRestaurante(
                        restauranteId,
                        {
                            status:
                                "aprovado",

                            codigoAcesso:
                                codigo,

                            codigoGeradoEm:
                                Utils.agoraISO(),

                            aprovadoEm:
                                Utils.agoraISO()
                        }
                    );


            if (!atualizado) {

                Utils.mostrarMensagem(
                    mensagem,
                    "Não foi possível aprovar o restaurante.",
                    "erro"
                );

                return;
            }


            Utils.mostrarMensagem(
                mensagem,
                `Restaurante aprovado com sucesso. Código de acesso: ${codigo}`,
                "sucesso"
            );


            console.log(
                "Restaurante aprovado:",
                restauranteId
            );


            console.log(
                "Código gerado:",
                codigo
            );


            carregarRestaurantes();
        }


        /* =====================================================
           COPIAR CÓDIGO
           ===================================================== */

        async function copiarCodigo(
            codigo
        ) {

            if (!codigo) {
                return;
            }


            try {

                await navigator
                    .clipboard
                    .writeText(
                        codigo
                    );


                Utils.mostrarMensagem(
                    mensagem,
                    "Código copiado com sucesso.",
                    "sucesso"
                );

            } catch (erro) {

                console.error(
                    "Erro ao copiar código:",
                    erro
                );


                Utils.mostrarMensagem(
                    mensagem,
                    `Código de acesso: ${codigo}`,
                    "sucesso"
                );
            }
        }


        /* =====================================================
           CONFIGURAR BOTÕES DA LISTAGEM
           ===================================================== */

        function configurarBotoes() {

            const botoesAprovar =
                document.querySelectorAll(
                    ".btn-aprovar-restaurante"
                );


            botoesAprovar.forEach(
                botao => {

                    botao.addEventListener(
                        "click",
                        () => {

                            const id =
                                botao.dataset.id;


                            aprovarRestaurante(
                                id
                            );
                        }
                    );
                }
            );


            const botoesCopiar =
                document.querySelectorAll(
                    ".btn-copiar-codigo"
                );


            botoesCopiar.forEach(
                botao => {

                    botao.addEventListener(
                        "click",
                        () => {

                            copiarCodigo(
                                botao.dataset.codigo
                            );
                        }
                    );
                }
            );
        }


        /* =====================================================
           NOVO RESTAURANTE
           ===================================================== */

        btnNovoRestaurante
            .addEventListener(
                "click",
                () => {

                    window.location.href =
                        "cadastro_restaurante.html";
                }
            );


        /* =====================================================
           LOGOUT
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
           INICIAR
           ===================================================== */

        carregarRestaurantes();

    }
);