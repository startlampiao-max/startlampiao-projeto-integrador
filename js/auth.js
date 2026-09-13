"use strict";

/* =========================================================
   STARTLAMPIÃO
   AUTENTICAÇÃO E CONTROLE DE SESSÃO
   ========================================================= */

const Auth = {

    /* =====================================================
       ACESSO AOS MÓDULOS CENTRAIS
       ===================================================== */

    storage() {

        if (!window.StartLampiaoStorage) {

            console.error(
                "StartLampiaoStorage não foi carregado."
            );

            return null;
        }

        return window.StartLampiaoStorage;
    },


    utils() {

        if (!window.StartLampiaoUtils) {

            console.error(
                "StartLampiaoUtils não foi carregado."
            );

            return null;
        }

        return window.StartLampiaoUtils;
    },


    /* =====================================================
       TIPOS DE CONTA PERMITIDOS
       ===================================================== */

    TIPOS: {
        ADMIN: "administrador",
        CLIENTE: "cliente",
        RESTAURANTE: "restaurante",
        ENTREGADOR: "entregador"
    },


    /* =====================================================
       CRIAR CONTA
       ===================================================== */

    criarConta(dados) {

        const storage = this.storage();
        const utils = this.utils();

        if (!storage || !utils) {

            return {
                sucesso: false,
                mensagem:
                    "Erro ao carregar os módulos do sistema."
            };
        }


        const nome =
            utils.limparTexto(
                dados?.nome
            );

        const email =
            utils.normalizarEmail(
                dados?.email
            );

        const senha =
            String(
                dados?.senha || ""
            );

        const tipo =
            utils.limparTexto(
                dados?.tipo
            );


        /* ---------------------------------------------
           Validação do nome
           --------------------------------------------- */

        if (!nome) {

            return {
                sucesso: false,
                mensagem:
                    "Informe o nome."
            };
        }


        /* ---------------------------------------------
           Validação do e-mail
           --------------------------------------------- */

        if (!utils.emailValido(email)) {

            return {
                sucesso: false,
                mensagem:
                    "Informe um e-mail válido."
            };
        }


        /* ---------------------------------------------
           Validação da senha
           --------------------------------------------- */

        if (!utils.senhaValida(senha)) {

            return {
                sucesso: false,
                mensagem:
                    "A senha deve possuir pelo menos 6 caracteres."
            };
        }


        /* ---------------------------------------------
           Validação do tipo de conta
           --------------------------------------------- */

        const tiposPermitidos =
            Object.values(
                this.TIPOS
            );

        if (
            !tiposPermitidos.includes(
                tipo
            )
        ) {

            return {
                sucesso: false,
                mensagem:
                    "Tipo de conta inválido."
            };
        }


        /* ---------------------------------------------
           Verifica e-mail duplicado
           --------------------------------------------- */

        if (
            storage.emailJaExiste(
                email
            )
        ) {

            return {
                sucesso: false,
                mensagem:
                    "Já existe uma conta cadastrada com este e-mail."
            };
        }


        /* ---------------------------------------------
           Monta a conta
           --------------------------------------------- */

        const conta = {

            id:
                storage.gerarId(
                    "CONTA"
                ),

            nome,

            email,

            senha,

            tipo,

            ativo: true,

            criadoEm:
                utils.agoraISO()
        };


        /* ---------------------------------------------
           Dados opcionais
           --------------------------------------------- */

        if (dados.telefone) {

            conta.telefone =
                utils.limparTexto(
                    dados.telefone
                );
        }


        if (dados.cpf) {

            conta.cpf =
                utils.limparTexto(
                    dados.cpf
                );
        }


        if (dados.restauranteId) {

            conta.restauranteId =
                dados.restauranteId;
        }


        if (dados.entregadorId) {

            conta.entregadorId =
                dados.entregadorId;
        }


        /* ---------------------------------------------
           Salva
           --------------------------------------------- */

        const salvo =
            storage.adicionarConta(
                conta
            );


        if (!salvo) {

            return {
                sucesso: false,
                mensagem:
                    "Não foi possível salvar a conta."
            };
        }


        return {
            sucesso: true,
            mensagem:
                "Conta cadastrada com sucesso.",
            conta
        };
    },


    /* =====================================================
       LOGIN
       ===================================================== */

    login(
        emailInformado,
        senhaInformada
    ) {

        const storage = this.storage();
        const utils = this.utils();

        if (!storage || !utils) {

            return {
                sucesso: false,
                mensagem:
                    "Erro ao carregar os módulos do sistema."
            };
        }


        const email =
            utils.normalizarEmail(
                emailInformado
            );

        const senha =
            String(
                senhaInformada || ""
            );


        if (
            !email ||
            !senha
        ) {

            return {
                sucesso: false,
                mensagem:
                    "Informe o e-mail e a senha."
            };
        }


        const conta =
            storage.buscarContaPorEmail(
                email
            );


        if (!conta) {

            return {
                sucesso: false,
                mensagem:
                    "Conta não encontrada."
            };
        }


        if (
            conta.senha !== senha
        ) {

            return {
                sucesso: false,
                mensagem:
                    "Senha incorreta."
            };
        }


        if (
            conta.ativo === false
        ) {

            return {
                sucesso: false,
                mensagem:
                    "Esta conta está desativada."
            };
        }


        /* ---------------------------------------------
           Criação da sessão
           --------------------------------------------- */

        const sessao = {

            contaId:
                conta.id,

            nome:
                conta.nome,

            email:
                conta.email,

            tipo:
                conta.tipo,

            restauranteId:
                conta.restauranteId
                || null,

            entregadorId:
                conta.entregadorId
                || null,

            loginEm:
                utils.agoraISO()
        };


        const sessaoSalva =
            storage.salvarSessao(
                sessao
            );


        if (!sessaoSalva) {

            return {
                sucesso: false,
                mensagem:
                    "Não foi possível iniciar a sessão."
            };
        }


        return {
            sucesso: true,
            mensagem:
                "Login realizado com sucesso.",
            conta,
            sessao
        };
    },


    /* =====================================================
       LOGOUT
       ===================================================== */

    logout() {

        const storage =
            this.storage();

        if (!storage) {
            return false;
        }

        return storage.limparSessao();
    },


    /* =====================================================
       OBTER SESSÃO
       ===================================================== */

    obterSessao() {

        const storage =
            this.storage();

        if (!storage) {
            return null;
        }

        return storage.obterSessao();
    },


    /* =====================================================
       VERIFICAR LOGIN
       ===================================================== */

    estaLogado() {

        return Boolean(
            this.obterSessao()
        );
    },


    /* =====================================================
       OBTER CONTA LOGADA
       ===================================================== */

    obterContaLogada() {

        const storage =
            this.storage();

        const sessao =
            this.obterSessao();

        if (
            !storage ||
            !sessao
        ) {
            return null;
        }

        return storage.buscarContaPorId(
            sessao.contaId
        );
    },


    /* =====================================================
       VERIFICAR TIPO DE USUÁRIO
       ===================================================== */

    temTipo(tipo) {

        const sessao =
            this.obterSessao();

        if (!sessao) {
            return false;
        }

        return (
            sessao.tipo === tipo
        );
    },


    /* =====================================================
       EXIGIR LOGIN
       ===================================================== */

    exigirLogin(
        paginaLogin = "../login.html"
    ) {

        if (
            !this.estaLogado()
        ) {

            window.location.href =
                paginaLogin;

            return false;
        }

        return true;
    },


    /* =====================================================
       EXIGIR TIPO ESPECÍFICO
       ===================================================== */

    exigirTipo(
        tipo,
        paginaLogin = "../login.html"
    ) {

        const sessao =
            this.obterSessao();


        if (!sessao) {

            window.location.href =
                paginaLogin;

            return false;
        }


        if (
            sessao.tipo !== tipo
        ) {

            console.warn(
                "Usuário sem permissão para acessar esta página."
            );

            window.location.href =
                paginaLogin;

            return false;
        }


        return true;
    },


    /* =====================================================
       DESTINO APÓS LOGIN
       ===================================================== */

    obterDestinoPorTipo(tipo) {

        switch (tipo) {

            case this.TIPOS.ADMIN:

                return "admin/dashboard.html";


            case this.TIPOS.RESTAURANTE:

                return "restaurante/dashboard.html";


            case this.TIPOS.CLIENTE:

                return "cliente/restaurantes.html";


            case this.TIPOS.ENTREGADOR:

                return "entregador/dashboard.html";


            default:

                return "index.html";
        }
    }

};


/* =========================================================
   DISPONIBILIZA GLOBALMENTE
   ========================================================= */

window.StartLampiaoAuth = Auth;