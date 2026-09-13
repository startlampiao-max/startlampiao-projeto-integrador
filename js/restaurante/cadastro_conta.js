"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const Storage = window.StartLampiaoStorage;
    const Utils = window.StartLampiaoUtils;
    const Auth = window.StartLampiaoAuth;

    const mensagem = document.getElementById("mensagem");
    const nomeRestaurante = document.getElementById("nomeRestaurante");
    const form = document.getElementById("formCadastroContaRestaurante");
    const campoEmail = document.getElementById("email");
    const campoSenha = document.getElementById("senha");
    const campoConfirmarSenha = document.getElementById("confirmarSenha");
    const btnCadastrar = document.getElementById("btnCadastrar");

    if (!Storage || !Utils || !Auth) {
        console.error("Módulos centrais do StartLampião não carregados.");
        return;
    }

    const restauranteId = sessionStorage.getItem("startlampiao_restaurante_validado");
    const restaurante = restauranteId
        ? Storage.buscarRestaurantePorId(restauranteId)
        : null;

    if (!restaurante || restaurante.status !== "aprovado") {
        Utils.mostrarMensagem(
            mensagem,
            "Valide primeiro o código de um restaurante aprovado.",
            "erro"
        );
        form.classList.add("oculto");
        setTimeout(() => {
            window.location.href = "acesso.html";
        }, 1200);
        return;
    }

    nomeRestaurante.textContent = restaurante.nome || "Restaurante";
    campoEmail.value = restaurante.email || "";

    const contaExistente = Storage.listarContas().find(
        conta => conta.tipo === Auth.TIPOS.RESTAURANTE && conta.restauranteId === restaurante.id
    );

    if (contaExistente) {
        Utils.mostrarMensagem(
            mensagem,
            "Este restaurante já possui uma conta. Use a tela de login.",
            "erro"
        );
        btnCadastrar.disabled = true;
        return;
    }

    form.addEventListener("submit", evento => {
        evento.preventDefault();
        Utils.esconderMensagem(mensagem);

        const email = Utils.normalizarEmail(campoEmail.value);
        const senha = campoSenha.value;
        const confirmarSenha = campoConfirmarSenha.value;

        if (!Utils.emailValido(email)) {
            Utils.mostrarMensagem(mensagem, "Informe um e-mail válido.", "erro");
            campoEmail.focus();
            return;
        }

        if (!Utils.senhaValida(senha)) {
            Utils.mostrarMensagem(mensagem, "A senha deve possuir pelo menos 6 caracteres.", "erro");
            campoSenha.focus();
            return;
        }

        if (senha !== confirmarSenha) {
            Utils.mostrarMensagem(mensagem, "As senhas não são iguais.", "erro");
            campoConfirmarSenha.focus();
            return;
        }

        btnCadastrar.disabled = true;
        btnCadastrar.textContent = "Salvando...";

        const resultado = Auth.criarConta({
            nome: restaurante.nome,
            email,
            senha,
            tipo: Auth.TIPOS.RESTAURANTE,
            restauranteId: restaurante.id
        });

        btnCadastrar.disabled = false;
        btnCadastrar.textContent = "Criar conta do restaurante";

        if (!resultado.sucesso) {
            Utils.mostrarMensagem(mensagem, resultado.mensagem, "erro");
            return;
        }

        const contaConferida = Storage.buscarContaPorId(resultado.conta.id);
        if (!contaConferida || contaConferida.restauranteId !== restaurante.id) {
            Utils.mostrarMensagem(
                mensagem,
                "A conta não pôde ser confirmada no armazenamento do navegador.",
                "erro"
            );
            return;
        }

        Storage.atualizarRestaurante(restaurante.id, {
            contaCriada: true,
            contaId: contaConferida.id,
            contaCriadaEm: Utils.agoraISO()
        });

        sessionStorage.removeItem("startlampiao_restaurante_validado");

        Utils.mostrarMensagem(
            mensagem,
            "Conta do restaurante criada com sucesso. Indo para o login...",
            "sucesso"
        );

        form.reset();

        setTimeout(() => {
            window.location.href = "../login.html";
        }, 900);
    });
});
