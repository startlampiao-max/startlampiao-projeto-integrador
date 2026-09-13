"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           STARTLAMPIÃO
           CADASTRO DO ADMINISTRADOR
           ===================================================== */


        const Auth =
            window.StartLampiaoAuth;

        const Utils =
            window.StartLampiaoUtils;


        /* =====================================================
           ELEMENTOS
           ===================================================== */

        const form =
            document.getElementById(
                "formCadastroAdministrador"
            );

        const campoNome =
            document.getElementById(
                "nome"
            );

        const campoCPF =
            document.getElementById(
                "cpf"
            );

        const campoTelefone =
            document.getElementById(
                "telefone"
            );

        const campoEmail =
            document.getElementById(
                "email"
            );

        const campoSenha =
            document.getElementById(
                "senha"
            );

        const campoConfirmarSenha =
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


        /* =====================================================
           VERIFICA SE OS MÓDULOS CARREGARAM
           ===================================================== */

        if (
            !Auth ||
            !Utils
        ) {

            console.error(
                "Os módulos do StartLampião não foram carregados corretamente."
            );

            return;
        }


        /* =====================================================
           MÁSCARA CPF
           ===================================================== */

        campoCPF.addEventListener(
            "input",
            () => {

                campoCPF.value =
                    Utils.formatarCPF(
                        campoCPF.value
                    );
            }
        );


        /* =====================================================
           MÁSCARA TELEFONE
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
           ENVIO DO FORMULÁRIO
           ===================================================== */

        form.addEventListener(
            "submit",
            evento => {

                evento.preventDefault();

                Utils.esconderMensagem(
                    mensagem
                );


                /* ---------------------------------------------
                   Captura dos valores
                   --------------------------------------------- */

                const nome =
                    Utils.limparTexto(
                        campoNome.value
                    );

                const cpf =
                    Utils.limparTexto(
                        campoCPF.value
                    );

                const telefone =
                    Utils.limparTexto(
                        campoTelefone.value
                    );

                const email =
                    Utils.normalizarEmail(
                        campoEmail.value
                    );

                const senha =
                    campoSenha.value;

                const confirmarSenha =
                    campoConfirmarSenha.value;


                /* ---------------------------------------------
                   Campos obrigatórios
                   --------------------------------------------- */

                if (
                    !nome ||
                    !cpf ||
                    !telefone ||
                    !email ||
                    !senha ||
                    !confirmarSenha
                ) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "Preencha todos os campos.",
                        "erro"
                    );

                    return;
                }


                /* ---------------------------------------------
                   CPF
                   --------------------------------------------- */

                const cpfNumeros =
                    Utils.somenteNumeros(
                        cpf
                    );

                if (
                    cpfNumeros.length !== 11
                ) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "Informe um CPF com 11 números.",
                        "erro"
                    );

                    campoCPF.focus();

                    return;
                }


                /* ---------------------------------------------
                   Telefone
                   --------------------------------------------- */

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


                /* ---------------------------------------------
                   E-mail
                   --------------------------------------------- */

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


                /* ---------------------------------------------
                   Senha
                   --------------------------------------------- */

                if (
                    !Utils.senhaValida(
                        senha
                    )
                ) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "A senha deve possuir pelo menos 6 caracteres.",
                        "erro"
                    );

                    campoSenha.focus();

                    return;
                }


                /* ---------------------------------------------
                   Confirmação de senha
                   --------------------------------------------- */

                if (
                    senha !== confirmarSenha
                ) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "As senhas não são iguais.",
                        "erro"
                    );

                    campoConfirmarSenha.focus();

                    return;
                }


                /* =================================================
                   CRIAÇÃO DA CONTA
                   ================================================= */

                btnCadastrar.disabled = true;

                btnCadastrar.textContent =
                    "Salvando...";


                const resultado =
                    Auth.criarConta({
                        nome,
                        cpf,
                        telefone,
                        email,
                        senha,
                        tipo:
                            Auth.TIPOS.ADMIN
                    });


                btnCadastrar.disabled = false;

                btnCadastrar.textContent =
                    "Criar conta do administrador";


                /* =================================================
                   ERRO
                   ================================================= */

                if (
                    !resultado.sucesso
                ) {

                    Utils.mostrarMensagem(
                        mensagem,
                        resultado.mensagem,
                        "erro"
                    );

                    return;
                }


                /* =================================================
                   SUCESSO
                   ================================================= */

                const contaConferida =
                    window.StartLampiaoStorage
                        .buscarContaPorId(
                            resultado.conta.id
                        );


                if (!contaConferida) {

                    Utils.mostrarMensagem(
                        mensagem,
                        "A conta não pôde ser confirmada no armazenamento do navegador.",
                        "erro"
                    );

                    return;
                }


                Utils.mostrarMensagem(
                    mensagem,
                    "Administrador cadastrado com sucesso. Indo para o login...",
                    "sucesso"
                );


                form.reset();


                console.log(
                    "Administrador salvo e conferido:",
                    contaConferida
                );


                setTimeout(
                    () => {
                        window.location.href =
                            "login.html";
                    },
                    800
                );

            }
        );

    }
);