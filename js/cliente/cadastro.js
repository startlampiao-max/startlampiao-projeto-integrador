"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           STARTLAMPIÃO
           CADASTRO DO CLIENTE
           ===================================================== */

        const Storage =
            window.StartLampiaoStorage;

        const Utils =
            window.StartLampiaoUtils;

        const Auth =
            window.StartLampiaoAuth;


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
           ELEMENTOS
           ===================================================== */

        const form =
            document.getElementById(
                "formCadastroCliente"
            );

        const nome =
            document.getElementById(
                "nome"
            );

        const cpf =
            document.getElementById(
                "cpf"
            );

        const telefone =
            document.getElementById(
                "telefone"
            );

        const email =
            document.getElementById(
                "email"
            );

        const senha =
            document.getElementById(
                "senha"
            );

        const confirmarSenha =
            document.getElementById(
                "confirmarSenha"
            );

        const mensagem =
            document.getElementById(
                "mensagem"
            );

        const btnCadastrar =
            document.getElementById(
                "btnCadastrar"
            );


        if (
            !form ||
            !nome ||
            !cpf ||
            !telefone ||
            !email ||
            !senha ||
            !confirmarSenha ||
            !mensagem ||
            !btnCadastrar
        ) {

            console.error(
                "A página cadastro.html está sem elementos obrigatórios."
            );

            return;
        }


        /* =====================================================
           MÁSCARA CPF
           ===================================================== */

        cpf.addEventListener(
            "input",
            () => {

                cpf.value =
                    Utils.formatarCPF(
                        cpf.value
                    );

            }
        );


        /* =====================================================
           MÁSCARA TELEFONE
           ===================================================== */

        telefone.addEventListener(
            "input",
            () => {

                telefone.value =
                    Utils.formatarTelefone(
                        telefone.value
                    );

            }
        );


        /* =====================================================
           CADASTRO
           ===================================================== */

        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                Utils.esconderMensagem(
                    mensagem
                );


                const nomeInformado =
                    Utils.limparTexto(
                        nome.value
                    );

                const cpfInformado =
                    Utils.limparTexto(
                        cpf.value
                    );

                const telefoneInformado =
                    Utils.limparTexto(
                        telefone.value
                    );

                const emailInformado =
                    Utils.normalizarEmail(
                        email.value
                    );

                const senhaInformada =
                    senha.value;

                const confirmacao =
                    confirmarSenha.value;


                /* =================================================
                   VALIDAÇÕES
                   ================================================= */

                if (
                    !nomeInformado ||
                    !cpfInformado ||
                    !telefoneInformado ||
                    !emailInformado ||
                    !senhaInformada ||
                    !confirmacao
                ) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "Preencha todos os campos obrigatórios.",
                        "erro"
                    );

                    return;
                }


                if (
                    !Utils.emailValido(
                        emailInformado
                    )
                ) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "Informe um e-mail válido.",
                        "erro"
                    );

                    return;
                }


                if (
                    !Utils.senhaValida(
                        senhaInformada
                    )
                ) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "A senha deve possuir pelo menos 6 caracteres.",
                        "erro"
                    );

                    return;
                }


                if (
                    senhaInformada
                    !==
                    confirmacao
                ) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "As senhas não coincidem.",
                        "erro"
                    );

                    return;
                }


                if (
                    Storage.emailJaExiste(
                        emailInformado
                    )
                ) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "Já existe uma conta cadastrada com este e-mail.",
                        "erro"
                    );

                    return;
                }


                /* =================================================
                   CRIAR CONTA
                   ================================================= */

                btnCadastrar.disabled =
                    true;


                const resultado =
                    Auth.criarConta({

                        nome:
                            nomeInformado,

                        cpf:
                            cpfInformado,

                        telefone:
                            telefoneInformado,

                        email:
                            emailInformado,

                        senha:
                            senhaInformada,

                        tipo:
                            Auth.TIPOS.CLIENTE

                    });


                if (
                    !resultado ||
                    !resultado.sucesso ||
                    !resultado.conta
                ) {

                    btnCadastrar.disabled =
                        false;


                    Utils.mostrarMensagem(
                        mensagem,
                        resultado?.mensagem
                        ||
                        "Não foi possível cadastrar o cliente.",
                        "erro"
                    );

                    return;
                }


                /* =================================================
                   CONFIRMAR GRAVAÇÃO
                   ================================================= */

                const contaConfirmada =
                    Storage.buscarContaPorId(
                        resultado.conta.id
                    );


                if (!contaConfirmada) {

                    btnCadastrar.disabled =
                        false;


                    Utils.mostrarMensagem(
                        mensagem,
                        "A conta não foi confirmada no armazenamento.",
                        "erro"
                    );

                    return;
                }


                /* =================================================
                   SUCESSO
                   ================================================= */

                Utils.mostrarMensagem(
                    mensagem,
                    "Cliente cadastrado com sucesso. Você será direcionado para o login.",
                    "sucesso"
                );


                form.reset();


                setTimeout(
                    () => {

                        window.location.href =
                            "../login.html";

                    },
                    1000
                );

            }
        );


        /* =====================================================
           INICIALIZAÇÃO
           ===================================================== */

        Utils.esconderMensagem(
            mensagem
        );

    }
);