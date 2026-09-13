"use strict";

/* =========================================================
   STARTLAMPIÃO
   ARMAZENAMENTO CENTRAL DO PROJETO
   ========================================================= */

const Storage = {

    CHAVES: {
        CONTAS: "startlampiao_contas",
        RESTAURANTES: "startlampiao_restaurantes",
        CATEGORIAS: "startlampiao_categorias",
        PRODUTOS: "startlampiao_produtos",
        ENTREGADORES: "startlampiao_entregadores",
        PEDIDOS: "startlampiao_pedidos",
        CARRINHO: "startlampiao_carrinho",
        SESSAO: "startlampiao_sessao",
        FIDELIDADE: "startlampiao_fidelidade"
    },


    /* =====================================================
       LER DADOS
       ===================================================== */

    ler(chave, valorPadrao = []) {

        try {

            const dado = localStorage.getItem(chave);

            if (dado === null) {
                return valorPadrao;
            }

            return JSON.parse(dado);

        } catch (erro) {

            console.error(
                `Erro ao ler a chave ${chave}:`,
                erro
            );

            return valorPadrao;
        }
    },


    /* =====================================================
       SALVAR DADOS
       ===================================================== */

    salvar(chave, valor) {

        try {

            const serializado =
                JSON.stringify(valor);

            localStorage.setItem(
                chave,
                serializado
            );

            /*
             * Confirma imediatamente que o navegador
             * realmente gravou o valor solicitado.
             */
            const conferido =
                localStorage.getItem(chave);

            if (conferido !== serializado) {

                console.error(
                    `Falha ao confirmar a gravação da chave ${chave}.`
                );

                return false;
            }

            return true;

        } catch (erro) {

            console.error(
                `Erro ao salvar a chave ${chave}:`,
                erro
            );

            return false;
        }
    },


    /* =====================================================
       REMOVER UMA CHAVE
       ===================================================== */

    remover(chave) {

        try {

            localStorage.removeItem(chave);

            return true;

        } catch (erro) {

            console.error(
                `Erro ao remover a chave ${chave}:`,
                erro
            );

            return false;
        }
    },


    /* =====================================================
       GERAR ID
       ===================================================== */

    gerarId(prefixo = "ID") {

        const tempo = Date.now();

        const aleatorio = Math.floor(
            Math.random() * 100000
        );

        return `${prefixo}-${tempo}-${aleatorio}`;
    },


    /* =====================================================
       CONTAS
       ===================================================== */

    listarContas() {

        return this.ler(
            this.CHAVES.CONTAS,
            []
        );
    },


    salvarContas(contas) {

        return this.salvar(
            this.CHAVES.CONTAS,
            contas
        );
    },


    adicionarConta(conta) {

        const contas = this.listarContas();

        contas.push(conta);

        return this.salvarContas(contas);
    },


    buscarContaPorEmail(email) {

        const contas = this.listarContas();

        return contas.find(
            conta =>
                conta.email
                    .toLowerCase()
                    .trim()
                ===
                email
                    .toLowerCase()
                    .trim()
        ) || null;
    },


    buscarContaPorId(id) {

        const contas = this.listarContas();

        return contas.find(
            conta => conta.id === id
        ) || null;
    },


    emailJaExiste(email) {

        return Boolean(
            this.buscarContaPorEmail(email)
        );
    },


    /* =====================================================
       RESTAURANTES
       ===================================================== */

    listarRestaurantes() {

        return this.ler(
            this.CHAVES.RESTAURANTES,
            []
        );
    },


    salvarRestaurantes(restaurantes) {

        return this.salvar(
            this.CHAVES.RESTAURANTES,
            restaurantes
        );
    },


    adicionarRestaurante(restaurante) {

        const restaurantes =
            this.listarRestaurantes();

        restaurantes.push(restaurante);

        return this.salvarRestaurantes(
            restaurantes
        );
    },


    buscarRestaurantePorId(id) {

        const restaurantes =
            this.listarRestaurantes();

        return restaurantes.find(
            restaurante =>
                restaurante.id === id
        ) || null;
    },


    buscarRestaurantePorCodigo(codigo) {

        const restaurantes =
            this.listarRestaurantes();

        return restaurantes.find(
            restaurante =>
                restaurante.codigoAcesso
                &&
                restaurante.codigoAcesso
                    .toUpperCase()
                    .trim()
                ===
                codigo
                    .toUpperCase()
                    .trim()
        ) || null;
    },


    atualizarRestaurante(
        id,
        novosDados
    ) {

        const restaurantes =
            this.listarRestaurantes();

        const indice =
            restaurantes.findIndex(
                restaurante =>
                    restaurante.id === id
            );

        if (indice === -1) {
            return false;
        }

        restaurantes[indice] = {
            ...restaurantes[indice],
            ...novosDados
        };

        return this.salvarRestaurantes(
            restaurantes
        );
    },


    /* =====================================================
       CATEGORIAS
       ===================================================== */

    listarCategorias() {

        return this.ler(
            this.CHAVES.CATEGORIAS,
            []
        );
    },


    salvarCategorias(categorias) {

        return this.salvar(
            this.CHAVES.CATEGORIAS,
            categorias
        );
    },


    adicionarCategoria(categoria) {

        const categorias =
            this.listarCategorias();

        categorias.push(categoria);

        return this.salvarCategorias(
            categorias
        );
    },


    listarCategoriasPorRestaurante(
        restauranteId
    ) {

        return this
            .listarCategorias()
            .filter(
                categoria =>
                    categoria.restauranteId
                    ===
                    restauranteId
            );
    },


    /* =====================================================
       PRODUTOS
       ===================================================== */

    listarProdutos() {

        return this.ler(
            this.CHAVES.PRODUTOS,
            []
        );
    },


    salvarProdutos(produtos) {

        return this.salvar(
            this.CHAVES.PRODUTOS,
            produtos
        );
    },


    adicionarProduto(produto) {

        const produtos =
            this.listarProdutos();

        produtos.push(produto);

        return this.salvarProdutos(
            produtos
        );
    },


    listarProdutosPorRestaurante(
        restauranteId
    ) {

        return this
            .listarProdutos()
            .filter(
                produto =>
                    produto.restauranteId
                    ===
                    restauranteId
            );
    },


    listarProdutosPorCategoria(
        categoriaId
    ) {

        return this
            .listarProdutos()
            .filter(
                produto =>
                    produto.categoriaId
                    ===
                    categoriaId
            );
    },


    /* =====================================================
       ENTREGADORES
       ===================================================== */

    listarEntregadores() {

        return this.ler(
            this.CHAVES.ENTREGADORES,
            []
        );
    },


    salvarEntregadores(entregadores) {

        return this.salvar(
            this.CHAVES.ENTREGADORES,
            entregadores
        );
    },


    adicionarEntregador(entregador) {

        const entregadores =
            this.listarEntregadores();

        entregadores.push(entregador);

        return this.salvarEntregadores(
            entregadores
        );
    },


    /* =====================================================
       PEDIDOS
       ===================================================== */

    listarPedidos() {

        return this.ler(
            this.CHAVES.PEDIDOS,
            []
        );
    },


    salvarPedidos(pedidos) {

        return this.salvar(
            this.CHAVES.PEDIDOS,
            pedidos
        );
    },


    adicionarPedido(pedido) {

        const pedidos =
            this.listarPedidos();

        pedidos.push(pedido);

        return this.salvarPedidos(
            pedidos
        );
    },


    /* =====================================================
       CARRINHO
       ===================================================== */

    obterCarrinho() {

        return this.ler(
            this.CHAVES.CARRINHO,
            []
        );
    },


    salvarCarrinho(carrinho) {

        return this.salvar(
            this.CHAVES.CARRINHO,
            carrinho
        );
    },


    limparCarrinho() {

        return this.remover(
            this.CHAVES.CARRINHO
        );
    },


    /* =====================================================
       SESSÃO
       ===================================================== */

    obterSessao() {

        return this.ler(
            this.CHAVES.SESSAO,
            null
        );
    },


    salvarSessao(sessao) {

        return this.salvar(
            this.CHAVES.SESSAO,
            sessao
        );
    },


    limparSessao() {

        return this.remover(
            this.CHAVES.SESSAO
        );
    },


    /* =====================================================
       LIMPAR DADOS DO PROJETO
       Usaremos apenas durante testes
       ===================================================== */

    limparTudo() {

        Object
            .values(this.CHAVES)
            .forEach(
                chave =>
                    localStorage.removeItem(chave)
            );
    }

};


/* =========================================================
   DISPONIBILIZA O STORAGE GLOBALMENTE
   ========================================================= */

window.StartLampiaoStorage = Storage;