"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           STARTLAMPIÃO
           LOGIN CENTRAL
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

        const formLogin =
            document.getElementById(
                "formLogin"
            );

        const campoEmail =
            document.getElementById(
                "email"
            );

        const campoSenha =
            document.getElementById(
                "senha"
            );

        const mensagemLogin =
            document.getElementById(
                "mensagemLogin"
            );

        const btnMostrarSenha =
            document.getElementById(
                "btnMostrarSenha"
            );

        const btnCriarConta =
            document.getElementById(
                "btnCriarConta"
            );

        const btnExplorar =
            document.getElementById(
                "btnExplorar"
            );

        const btnInicio =
            document.getElementById(
                "btnInicio"
            );

        const btnEsqueciSenha =
            document.getElementById(
                "btnEsqueciSenha"
            );

        const modalSenha =
            document.getElementById(
                "modalSenha"
            );

        const btnFecharSenha =
            document.getElementById(
                "btnFecharSenha"
            );

        const btnEntendi =
            document.getElementById(
                "btnEntendi"
            );

        const avisoPerfil =
            document.getElementById(
                "avisoPerfil"
            );

        const anoAtual =
            document.getElementById(
                "anoAtual"
            );

        const botoesTipo =
            document.querySelectorAll(
                "[data-tipo]"
            );


        if (
            !formLogin ||
            !campoEmail ||
            !campoSenha ||
            !mensagemLogin ||
            !btnCriarConta
        ) {

            console.error(
                "A página login.html está sem elementos obrigatórios."
            );

            return;
        }


        /* =====================================================
           PERFIL SELECIONADO
           ===================================================== */

        let tipoSelecionado =
            Auth.TIPOS.CLIENTE;


        /* =====================================================
           MENSAGEM
           ===================================================== */

        function esconderMensagem() {

            mensagemLogin.textContent =
                "";

            mensagemLogin.classList.add(
                "oculto"
            );

            mensagemLogin.classList.remove(
                "erro",
                "sucesso",
                "mensagem-erro",
                "mensagem-sucesso"
            );

        }


        function mostrarMensagem(
            texto,
            tipo = "erro"
        ) {

            mensagemLogin.textContent =
                texto;


            mensagemLogin.classList.remove(
                "oculto",
                "erro",
                "sucesso",
                "mensagem-erro",
                "mensagem-sucesso"
            );


            if (
                tipo === "sucesso"
            ) {

                mensagemLogin.classList.add(
                    "sucesso",
                    "mensagem-sucesso"
                );

            } else {

                mensagemLogin.classList.add(
                    "erro",
                    "mensagem-erro"
                );

            }

        }


        /* =====================================================
           NORMALIZAR TIPO
           ===================================================== */

        function normalizarTipo(
            tipo
        ) {

            return String(
                tipo || ""
            )
                .trim()
                .toLowerCase();

        }


        /* =====================================================
           ATUALIZAR PERFIL
           ===================================================== */

        function atualizarPerfil(
            tipo
        ) {

            tipoSelecionado =
                normalizarTipo(
                    tipo
                );


            botoesTipo.forEach(
                botao => {

                    botao.classList.toggle(
                        "ativo",
                        normalizarTipo(
                            botao.dataset.tipo
                        )
                        ===
                        tipoSelecionado
                    );

                }
            );


            esconderMensagem();


            if (
                tipoSelecionado ===
                Auth.TIPOS.CLIENTE
            ) {

                btnCriarConta.textContent =
                    "Criar conta de cliente";


                if (avisoPerfil) {

                    avisoPerfil.textContent =
                        "Clientes podem criar sua conta livremente.";

                }


                return;

            }


            if (
                tipoSelecionado ===
                Auth.TIPOS.RESTAURANTE
            ) {

                btnCriarConta.textContent =
                    "Acessar cadastro do restaurante";


                if (avisoPerfil) {

                    avisoPerfil.textContent =
                        "Restaurantes precisam do código de acesso fornecido pela administração.";

                }


                return;

            }


            if (
                tipoSelecionado ===
                Auth.TIPOS.ADMIN
            ) {

                btnCriarConta.textContent =
                    "Cadastrar administrador";


                if (avisoPerfil) {

                    avisoPerfil.textContent =
                        "O acesso administrativo é destinado à gestão da plataforma.";

                }

            }

        }


        /* =====================================================
           SELEÇÃO DOS PERFIS
           ===================================================== */

        botoesTipo.forEach(
            botao => {

                botao.addEventListener(
                    "click",
                    () => {

                        atualizarPerfil(
                            botao.dataset.tipo
                        );

                    }
                );

            }
        );


        /* =====================================================
           MOSTRAR / OCULTAR SENHA
           ===================================================== */

        if (
            btnMostrarSenha
        ) {

            btnMostrarSenha.addEventListener(
                "click",
                () => {

                    const mostrando =
                        campoSenha.type
                        ===
                        "text";


                    campoSenha.type =
                        mostrando
                            ? "password"
                            : "text";


                    btnMostrarSenha.setAttribute(
                        "aria-label",
                        mostrando
                            ? "Mostrar senha"
                            : "Ocultar senha"
                    );

                }
            );

        }


        /* =====================================================
           CADASTROS
           ===================================================== */

        btnCriarConta.addEventListener(
            "click",
            () => {

                /* =============================================
                   CLIENTE
                   ============================================= */

                if (
                    tipoSelecionado ===
                    Auth.TIPOS.CLIENTE
                ) {

                    window.location.href =
                        "cliente/cadastro.html";

                    return;

                }


                /* =============================================
                   RESTAURANTE
                   ============================================= */

                if (
                    tipoSelecionado ===
                    Auth.TIPOS.RESTAURANTE
                ) {

                    window.location.href =
                        "restaurante/acesso.html";

                    return;

                }


                /* =============================================
                   ADMINISTRADOR
                   ============================================= */

                if (
                    tipoSelecionado ===
                    Auth.TIPOS.ADMIN
                ) {

                    window.location.href =
                        "cadastro_administrador.html";

                }

            }
        );


        /* =====================================================
           DIRECIONAR APÓS LOGIN
           ===================================================== */

        function direcionarDepoisLogin(
            conta
        ) {

            const tipo =
                normalizarTipo(
                    conta.tipo
                );


            /* =============================================
               CLIENTE
               ============================================= */

            if (
                tipo ===
                Auth.TIPOS.CLIENTE
            ) {

                const retorno =
                    sessionStorage.getItem(
                        "startlampiao_retorno_login"
                    );


                if (retorno) {

                    sessionStorage.removeItem(
                        "startlampiao_retorno_login"
                    );


                    window.location.href =
                        retorno;


                    return;

                }


                window.location.href =
                    "cliente/restaurantes.html";


                return;

            }


            /* =============================================
               RESTAURANTE
               ============================================= */

            if (
                tipo ===
                Auth.TIPOS.RESTAURANTE
            ) {

                sessionStorage.removeItem(
                    "startlampiao_retorno_login"
                );


                window.location.href =
                    "restaurante/dashboard.html";


                return;

            }


            /* =============================================
               ADMINISTRADOR
               ============================================= */

            if (
                tipo ===
                Auth.TIPOS.ADMIN
            ) {

                sessionStorage.removeItem(
                    "startlampiao_retorno_login"
                );


                window.location.href =
                    "admin/dashboard.html";


                return;

            }


            mostrarMensagem(
                "Tipo de conta inválido.",
                "erro"
            );

        }


        /* =====================================================
           LOGIN
           ===================================================== */

        formLogin.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                esconderMensagem();


                const email =
                    Utils.normalizarEmail(
                        campoEmail.value
                    );


                const senha =
                    campoSenha.value;


                if (
                    !email ||
                    !senha
                ) {

                    mostrarMensagem(
                        "Informe seu e-mail e sua senha."
                    );

                    return;

                }


                /* =============================================
                   LOCALIZAR CONTA
                   ============================================= */

                const conta =
                    Storage.buscarContaPorEmail(
                        email
                    );


                if (!conta) {

                    mostrarMensagem(
                        "Não encontramos nenhuma conta cadastrada com este e-mail."
                    );

                    return;

                }


                const tipoConta =
                    normalizarTipo(
                        conta.tipo
                    );


                /* =============================================
                   PERFIL SELECIONADO CORRETO?
                   ============================================= */

                if (
                    tipoConta !==
                    tipoSelecionado
                ) {

                    const nomes = {

                        cliente:
                            "Cliente",

                        restaurante:
                            "Restaurante",

                        administrador:
                            "Administrador"

                    };


                    const nomePerfil =
                        nomes[tipoConta]
                        ||
                        tipoConta;


                    mostrarMensagem(
                        `Esta conta pertence ao perfil ${nomePerfil}. Selecione ${nomePerfil} acima para entrar.`
                    );


                    return;

                }


                /* =============================================
                   AUTENTICAR
                   ============================================= */

                const resultado =
                    Auth.login(
                        email,
                        senha
                    );


                if (
                    !resultado ||
                    resultado.sucesso !== true
                ) {

                    mostrarMensagem(
                        resultado?.mensagem
                        ||
                        "E-mail ou senha inválidos."
                    );


                    return;

                }


                /* =============================================
                   CONFIRMAR SESSÃO
                   ============================================= */

                const sessao =
                    Auth.obterSessao();


                if (!sessao) {

                    mostrarMensagem(
                        "Não foi possível confirmar a sessão de acesso."
                    );


                    return;

                }


                mostrarMensagem(
                    "Login realizado com sucesso!",
                    "sucesso"
                );


                setTimeout(
                    () => {

                        direcionarDepoisLogin(
                            resultado.conta
                            ||
                            conta
                        );

                    },
                    500
                );

            }
        );


        /* =====================================================
           CONTINUAR EXPLORANDO
           ===================================================== */

        if (
            btnExplorar
        ) {

            btnExplorar.addEventListener(
                "click",
                () => {

                    window.location.href =
                        "cliente/restaurantes.html";

                }
            );

        }


        /* =====================================================
           LOGO / INÍCIO
           ===================================================== */

        if (
            btnInicio
        ) {

            btnInicio.addEventListener(
                "click",
                () => {

                    window.location.href =
                        "cliente/restaurantes.html";

                }
            );

        }


        /* =====================================================
           RECUPERAÇÃO DE SENHA
           ===================================================== */

        function abrirModalSenha() {

            if (!modalSenha) {
                return;
            }


            modalSenha.classList.remove(
                "oculto"
            );

        }


        function fecharModalSenha() {

            if (!modalSenha) {
                return;
            }


            modalSenha.classList.add(
                "oculto"
            );

        }


        if (
            btnEsqueciSenha
        ) {

            btnEsqueciSenha.addEventListener(
                "click",
                abrirModalSenha
            );

        }


        if (
            btnFecharSenha
        ) {

            btnFecharSenha.addEventListener(
                "click",
                fecharModalSenha
            );

        }


        if (
            btnEntendi
        ) {

            btnEntendi.addEventListener(
                "click",
                fecharModalSenha
            );

        }


        if (
            modalSenha
        ) {

            modalSenha.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        modalSenha
                    ) {

                        fecharModalSenha();

                    }

                }
            );

        }


        /* =====================================================
           ANO
           ===================================================== */

        if (
            anoAtual
        ) {

            anoAtual.textContent =
                new Date()
                    .getFullYear();

        }


        /* =====================================================
           INICIALIZAÇÃO
           ===================================================== */

        esconderMensagem();


        atualizarPerfil(
            Auth.TIPOS.CLIENTE
        );

    }
);