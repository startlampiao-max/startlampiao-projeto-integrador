"use strict";

/* =========================================================
   STARTLAMPIÃO
   FUNÇÕES AUXILIARES DO PROJETO
   ========================================================= */

const Utils = {

    /* =====================================================
       TEXTO
       ===================================================== */

    limparTexto(valor) {

        if (typeof valor !== "string") {
            return "";
        }

        return valor.trim();
    },


    normalizarEmail(email) {

        return this
            .limparTexto(email)
            .toLowerCase();
    },


    /* =====================================================
       VALIDAÇÕES
       ===================================================== */

    emailValido(email) {

        const emailLimpo =
            this.normalizarEmail(email);

        const regex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return regex.test(emailLimpo);
    },


    senhaValida(senha) {

        if (typeof senha !== "string") {
            return false;
        }

        return senha.length >= 6;
    },


    campoPreenchido(valor) {

        if (
            valor === null ||
            valor === undefined
        ) {
            return false;
        }

        return String(valor).trim() !== "";
    },


    /* =====================================================
       CPF
       ===================================================== */

    somenteNumeros(valor) {

        return String(valor || "")
            .replace(/\D/g, "");
    },


    formatarCPF(valor) {

        const numeros =
            this.somenteNumeros(valor)
                .slice(0, 11);

        return numeros
            .replace(
                /(\d{3})(\d)/,
                "$1.$2"
            )
            .replace(
                /(\d{3})(\d)/,
                "$1.$2"
            )
            .replace(
                /(\d{3})(\d{1,2})$/,
                "$1-$2"
            );
    },


    /* =====================================================
       TELEFONE
       ===================================================== */

    formatarTelefone(valor) {

        const numeros =
            this.somenteNumeros(valor)
                .slice(0, 11);

        if (numeros.length <= 10) {

            return numeros
                .replace(
                    /(\d{2})(\d)/,
                    "($1) $2"
                )
                .replace(
                    /(\d{4})(\d)/,
                    "$1-$2"
                );
        }

        return numeros
            .replace(
                /(\d{2})(\d)/,
                "($1) $2"
            )
            .replace(
                /(\d{5})(\d)/,
                "$1-$2"
            );
    },


    /* =====================================================
       DINHEIRO
       ===================================================== */

    formatarMoeda(valor) {

        const numero =
            Number(valor) || 0;

        return numero.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );
    },


    /* =====================================================
       DATAS
       ===================================================== */

    agoraISO() {

        return new Date().toISOString();
    },


    formatarData(data) {

        if (!data) {
            return "";
        }

        const objetoData =
            new Date(data);

        if (
            Number.isNaN(
                objetoData.getTime()
            )
        ) {
            return "";
        }

        return objetoData.toLocaleDateString(
            "pt-BR"
        );
    },


    formatarDataHora(data) {

        if (!data) {
            return "";
        }

        const objetoData =
            new Date(data);

        if (
            Number.isNaN(
                objetoData.getTime()
            )
        ) {
            return "";
        }

        return objetoData.toLocaleString(
            "pt-BR"
        );
    },


    /* =====================================================
       CÓDIGO DO RESTAURANTE
       ===================================================== */

    gerarCodigoRestaurante() {

        const letras = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        const numeros = "23456789";

        let parteLetras = "";
        let parteNumeros = "";

        for (
            let i = 0;
            i < 3;
            i++
        ) {

            parteLetras +=
                letras[
                    Math.floor(
                        Math.random()
                        * letras.length
                    )
                ];
        }

        for (
            let i = 0;
            i < 4;
            i++
        ) {

            parteNumeros +=
                numeros[
                    Math.floor(
                        Math.random()
                        * numeros.length
                    )
                ];
        }

        return (
            `SL-${parteLetras}-${parteNumeros}`
        );
    },


    /* =====================================================
       GERAR ID SIMPLES
       ===================================================== */

    gerarId(prefixo = "ID") {

        const tempo =
            Date.now();

        const aleatorio =
            Math.floor(
                Math.random() * 100000
            );

        return (
            `${prefixo}-${tempo}-${aleatorio}`
        );
    },


    /* =====================================================
       NAVEGAÇÃO
       ===================================================== */

    irPara(caminho) {

        if (!caminho) {
            return;
        }

        window.location.href = caminho;
    },


    voltar() {

        window.history.back();
    },


    /* =====================================================
       MENSAGENS
       ===================================================== */

    mostrarMensagem(
        elemento,
        texto,
        tipo = "sucesso"
    ) {

        if (!elemento) {
            return;
        }

        elemento.textContent = texto;

        elemento.classList.remove(
            "mensagem-sucesso",
            "mensagem-erro"
        );

        elemento.classList.add(
            "mensagem",
            "ativa"
        );

        if (tipo === "erro") {

            elemento.classList.add(
                "mensagem-erro"
            );

        } else {

            elemento.classList.add(
                "mensagem-sucesso"
            );
        }
    },


    esconderMensagem(elemento) {

        if (!elemento) {
            return;
        }

        elemento.classList.remove(
            "ativa",
            "mensagem-sucesso",
            "mensagem-erro"
        );

        elemento.textContent = "";
    }

};


/* =========================================================
   DISPONIBILIZA GLOBALMENTE
   ========================================================= */

window.StartLampiaoUtils = Utils;