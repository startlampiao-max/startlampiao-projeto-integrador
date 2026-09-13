"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           STARTLAMPIÃO
           CADASTRO DE RESTAURANTE PELO ADMINISTRADOR
           ===================================================== */

        const Storage =
            window.StartLampiaoStorage;

        const Auth =
            window.StartLampiaoAuth;

        const Utils =
            window.StartLampiaoUtils;


        /* =====================================================
           VERIFICAÇÃO DOS MÓDULOS
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

        const form =
            document.getElementById(
                "formCadastroRestaurante"
            );

        const mensagem =
            document.getElementById(
                "mensagem"
            );

        const btnSalvar =
            document.getElementById(
                "btnSalvar"
            );

        const btnCancelar =
            document.getElementById(
                "btnCancelar"
            );

        const btnVoltar =
            document.getElementById(
                "btnVoltar"
            );

        const btnSair =
            document.getElementById(
                "btnSair"
            );


        const campoNome =
            document.getElementById(
                "nome"
            );

        const campoCNPJ =
            document.getElementById(
                "cnpj"
            );

        const campoTelefone =
            document.getElementById(
                "telefone"
            );

        const campoEmail =
            document.getElementById(
                "email"
            );

        const campoResponsavel =
            document.getElementById(
                "responsavel"
            );

        const campoCategoria =
            document.getElementById(
                "categoria"
            );

        const campoCEP =
            document.getElementById(
                "cep"
            );

        const campoEndereco =
            document.getElementById(
                "endereco"
            );

        const campoNumero =
            document.getElementById(
                "numero"
            );

        const campoBairro =
            document.getElementById(
                "bairro"
            );

        const campoCidade =
            document.getElementById(
                "cidade"
            );

        const campoEstado =
            document.getElementById(
                "estado"
            );

        const campoDescricao =
            document.getElementById(
                "descricao"
            );


        /* =====================================================
           FORMATAÇÃO DO CNPJ
           ===================================================== */

        campoCNPJ.addEventListener(
            "input",
            () => {

                let valor =
                    Utils.somenteNumeros(
                        campoCNPJ.value
                    )
                    .slice(0, 14);


                valor =
                    valor.replace(
                        /^(\d{2})(\d)/,
                        "$1.$2"
                    );

                valor =
                    valor.replace(
                        /^(\d{2})\.(\d{3})(\d)/,
                        "$1.$2.$3"
                    );

                valor =
                    valor.replace(
                        /\.(\d{3})(\d)/,
                        ".$1/$2"
                    );

                valor =
                    valor.replace(
                        /(\d{4})(\d)/,
                        "$1-$2"
                    );


                campoCNPJ.value =
                    valor;
            }
        );


        /* =====================================================
           FORMATAÇÃO DO TELEFONE
           ===================================================== */

        campoTelefone.addEventListener(
            "input",
            () => {

                campoTelefone.value =
                    Utils.formatarTelefone(
                        campoTelefone.value
                    );
            }
        );


        /* =====================================================
           FORMATAÇÃO DO CEP
           ===================================================== */

        campoCEP.addEventListener(
            "input",
            () => {

                const numeros =
                    Utils.somenteNumeros(
                        campoCEP.value
                    )
                    .slice(0, 8);


                campoCEP.value =
                    numeros.replace(
                        /^(\d{5})(\d)/,
                        "$1-$2"
                    );
            }
        );


        /* =====================================================
           ESTADO
           ===================================================== */

        campoEstado.addEventListener(
            "input",
            () => {

                campoEstado.value =
                    campoEstado.value
                        .replace(
                            /[^a-zA-Z]/g,
                            ""
                        )
                        .toUpperCase()
                        .slice(0, 2);
            }
        );


        /* =====================================================
           VERIFICA CNPJ DUPLICADO
           ===================================================== */

        function cnpjJaExiste(cnpj) {

            const cnpjNumeros =
                Utils.somenteNumeros(
                    cnpj
                );


            const restaurantes =
                Storage.listarRestaurantes();


            return restaurantes.some(
                restaurante => {

                    const cadastrado =
                        Utils.somenteNumeros(
                            restaurante.cnpj
                        );


                    return (
                        cadastrado ===
                        cnpjNumeros
                    );
                }
            );
        }


        /* =====================================================
           VERIFICA E-MAIL DUPLICADO
           ===================================================== */

        function emailRestauranteJaExiste(
            email
        ) {

            const emailNormalizado =
                Utils.normalizarEmail(
                    email
                );


            return Storage
                .listarRestaurantes()
                .some(
                    restaurante =>
                        Utils.normalizarEmail(
                            restaurante.email
                        )
                        ===
                        emailNormalizado
                );
        }


        /* =====================================================
           ENVIO DO FORMULÁRIO
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

                const cnpj =
                    Utils.limparTexto(
                        campoCNPJ.value
                    );

                const telefone =
                    Utils.limparTexto(
                        campoTelefone.value
                    );

                const email =
                    Utils.normalizarEmail(
                        campoEmail.value
                    );

                const responsavel =
                    Utils.limparTexto(
                        campoResponsavel.value
                    );

                const categoria =
                    Utils.limparTexto(
                        campoCategoria.value
                    );

                const cep =
                    Utils.limparTexto(
                        campoCEP.value
                    );

                const endereco =
                    Utils.limparTexto(
                        campoEndereco.value
                    );

                const numero =
                    Utils.limparTexto(
                        campoNumero.value
                    );

                const bairro =
                    Utils.limparTexto(
                        campoBairro.value
                    );

                const cidade =
                    Utils.limparTexto(
                        campoCidade.value
                    );

                const estado =
                    Utils.limparTexto(
                        campoEstado.value
                    );

                const descricao =
                    Utils.limparTexto(
                        campoDescricao.value
                    );


                /* =================================================
                   CAMPOS OBRIGATÓRIOS
                   ================================================= */

                if (
                    !nome ||
                    !cnpj ||
                    !telefone ||
                    !email ||
                    !responsavel ||
                    !categoria ||
                    !cep ||
                    !endereco ||
                    !numero ||
                    !bairro ||
                    !cidade ||
                    !estado
                ) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "Preencha todos os campos obrigatórios.",
                        "erro"
                    );

                    return;
                }


                /* =================================================
                   CNPJ
                   ================================================= */

                const cnpjNumeros =
                    Utils.somenteNumeros(
                        cnpj
                    );


                if (
                    cnpjNumeros.length !== 14
                ) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "Informe um CNPJ com 14 números.",
                        "erro"
                    );

                    campoCNPJ.focus();

                    return;
                }


                if (
                    cnpjJaExiste(
                        cnpj
                    )
                ) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "Já existe um restaurante cadastrado com este CNPJ.",
                        "erro"
                    );

                    campoCNPJ.focus();

                    return;
                }


                /* =================================================
                   TELEFONE
                   ================================================= */

                const telefoneNumeros =
                    Utils.somenteNumeros(
                        telefone
                    );


                if (
                    telefoneNumeros.length < 10
                ) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "Informe um telefone válido.",
                        "erro"
                    );

                    campoTelefone.focus();

                    return;
                }


                /* =================================================
                   E-MAIL
                   ================================================= */

                if (
                    !Utils.emailValido(
                        email
                    )
                ) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "Informe um e-mail válido.",
                        "erro"
                    );

                    campoEmail.focus();

                    return;
                }


                if (
                    emailRestauranteJaExiste(
                        email
                    )
                ) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "Já existe um restaurante cadastrado com este e-mail.",
                        "erro"
                    );

                    campoEmail.focus();

                    return;
                }


                /* =================================================
                   CEP
                   ================================================= */

                if (
                    Utils.somenteNumeros(
                        cep
                    ).length !== 8
                ) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "Informe um CEP válido com 8 números.",
                        "erro"
                    );

                    campoCEP.focus();

                    return;
                }


                /* =================================================
                   ESTADO
                   ================================================= */

                if (
                    estado.length !== 2
                ) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "Informe a sigla do estado com 2 letras.",
                        "erro"
                    );

                    campoEstado.focus();

                    return;
                }


                /* =================================================
                   CRIA RESTAURANTE
                   ================================================= */

                const sessao =
                    Auth.obterSessao();


                const restaurante = {

                    id:
                        Storage.gerarId(
                            "REST"
                        ),

                    nome,

                    cnpj,

                    telefone,

                    email,

                    responsavel,

                    categoria,

                    endereco: {
                        cep,
                        logradouro:
                            endereco,
                        numero,
                        bairro,
                        cidade,
                        estado
                    },

                    descricao,

                    status:
                        "pendente",

                    codigoAcesso:
                        null,

                    codigoGeradoEm:
                        null,

                    aprovadoEm:
                        null,

                    cadastradoPor:
                        sessao
                            ? sessao.contaId
                            : null,

                    criadoEm:
                        Utils.agoraISO()
                };


                /* =================================================
                   SALVAR
                   ================================================= */

                btnSalvar.disabled =
                    true;


                btnSalvar.textContent =
                    "Salvando...";


                const salvo =
                    Storage
                        .adicionarRestaurante(
                            restaurante
                        );


                btnSalvar.disabled =
                    false;


                btnSalvar.textContent =
                    "Salvar restaurante";


                if (!salvo) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "Não foi possível salvar o restaurante.",
                        "erro"
                    );

                    return;
                }


                /* =================================================
                   SUCESSO
                   ================================================= */

                Utils.mostrarMensagem(
                    mensagem,
                    "Restaurante cadastrado com sucesso. Status: pendente de aprovação.",
                    "sucesso"
                );


                console.log(
                    "Restaurante salvo:",
                    restaurante
                );


                form.reset();


                /*
                 * Não redirecionamos automaticamente.
                 * Primeiro vamos confirmar o armazenamento.
                 */

            }
        );


        /* =====================================================
           VOLTAR
           ===================================================== */

        btnVoltar.addEventListener(
            "click",
            () => {

                window.location.href =
                    "dashboard.html";
            }
        );


        /* =====================================================
           CANCELAR
           ===================================================== */

        btnCancelar.addEventListener(
            "click",
            () => {

                window.location.href =
                    "dashboard.html";
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

    }
);