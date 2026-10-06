-- =========================================================
-- STARTLAMPIÃO
-- ESTRUTURA DO BANCO DE DADOS MYSQL
-- =========================================================

CREATE DATABASE IF NOT EXISTS startlampiao
CHARACTER SET utf8mb4
COLLATE utf8mb4_0900_ai_ci;

USE startlampiao;

-- =========================================================
-- TABELA: usuarios
-- =========================================================

CREATE TABLE IF NOT EXISTS usuarios (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('administrador','cliente','restaurante') NOT NULL,
    telefone VARCHAR(20) DEFAULT NULL,
    ativo TINYINT(1) DEFAULT 1,
    criado_em TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY email (email)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_0900_ai_ci;


-- =========================================================
-- TABELA: restaurantes
-- =========================================================

CREATE TABLE IF NOT EXISTS restaurantes (
    id INT NOT NULL AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    nome_fantasia VARCHAR(150) NOT NULL,
    razao_social VARCHAR(150) DEFAULT NULL,
    cnpj VARCHAR(20) DEFAULT NULL,
    telefone VARCHAR(20) DEFAULT NULL,
    endereco VARCHAR(255) DEFAULT NULL,
    cidade VARCHAR(100) DEFAULT NULL,
    estado VARCHAR(2) DEFAULT NULL,
    cep VARCHAR(10) DEFAULT NULL,
    codigo_autorizacao VARCHAR(50) DEFAULT NULL,
    aprovado TINYINT(1) DEFAULT 0,
    ativo TINYINT(1) DEFAULT 1,
    criado_em TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    KEY fk_restaurante_usuario (usuario_id),

    CONSTRAINT fk_restaurante_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios (id)
        ON DELETE CASCADE
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_0900_ai_ci;


-- =========================================================
-- TABELA: categorias
-- =========================================================

CREATE TABLE IF NOT EXISTS categorias (
    id INT NOT NULL AUTO_INCREMENT,
    restaurante_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255) DEFAULT NULL,
    ativo TINYINT(1) DEFAULT 1,
    criado_em TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    KEY fk_categoria_restaurante (restaurante_id),

    CONSTRAINT fk_categoria_restaurante
        FOREIGN KEY (restaurante_id)
        REFERENCES restaurantes (id)
        ON DELETE CASCADE
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_0900_ai_ci;


-- =========================================================
-- TABELA: produtos
-- =========================================================

CREATE TABLE IF NOT EXISTS produtos (
    id INT NOT NULL AUTO_INCREMENT,
    restaurante_id INT NOT NULL,
    categoria_id INT NOT NULL,
    nome VARCHAR(150) NOT NULL,
    descricao VARCHAR(255) DEFAULT NULL,
    preco DECIMAL(10,2) NOT NULL,
    imagem VARCHAR(255) DEFAULT NULL,
    disponivel TINYINT(1) DEFAULT 1,
    criado_em TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    KEY fk_produto_restaurante (restaurante_id),
    KEY fk_produto_categoria (categoria_id),

    CONSTRAINT fk_produto_categoria
        FOREIGN KEY (categoria_id)
        REFERENCES categorias (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_produto_restaurante
        FOREIGN KEY (restaurante_id)
        REFERENCES restaurantes (id)
        ON DELETE CASCADE
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_0900_ai_ci;


-- =========================================================
-- TABELA: entregadores
-- =========================================================

CREATE TABLE IF NOT EXISTS entregadores (
    id INT NOT NULL AUTO_INCREMENT,
    restaurante_id INT NOT NULL,
    nome VARCHAR(150) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    veiculo VARCHAR(100) DEFAULT NULL,
    placa VARCHAR(20) DEFAULT NULL,
    ativo TINYINT(1) DEFAULT 1,
    criado_em TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    KEY fk_entregador_restaurante (restaurante_id),

    CONSTRAINT fk_entregador_restaurante
        FOREIGN KEY (restaurante_id)
        REFERENCES restaurantes (id)
        ON DELETE CASCADE
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_0900_ai_ci;


-- =========================================================
-- TABELA: pedidos
-- =========================================================

CREATE TABLE IF NOT EXISTS pedidos (
    id INT NOT NULL AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    restaurante_id INT NOT NULL,
    entregador_id INT DEFAULT NULL,
    endereco_entrega VARCHAR(255) NOT NULL,
    forma_pagamento ENUM('pix','dinheiro') NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status ENUM(
        'pendente',
        'confirmado',
        'preparando',
        'pronto',
        'saiu_para_entrega',
        'entregue',
        'cancelado'
    ) DEFAULT 'pendente',
    observacao VARCHAR(255) DEFAULT NULL,
    criado_em TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    KEY fk_pedido_cliente (cliente_id),
    KEY fk_pedido_restaurante (restaurante_id),
    KEY fk_pedido_entregador (entregador_id),

    CONSTRAINT fk_pedido_cliente
        FOREIGN KEY (cliente_id)
        REFERENCES usuarios (id),

    CONSTRAINT fk_pedido_entregador
        FOREIGN KEY (entregador_id)
        REFERENCES entregadores (id)
        ON DELETE SET NULL,

    CONSTRAINT fk_pedido_restaurante
        FOREIGN KEY (restaurante_id)
        REFERENCES restaurantes (id)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_0900_ai_ci;


-- =========================================================
-- TABELA: itens_pedido
-- =========================================================

CREATE TABLE IF NOT EXISTS itens_pedido (
    id INT NOT NULL AUTO_INCREMENT,
    pedido_id INT NOT NULL,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL DEFAULT 1,
    preco_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    observacao VARCHAR(255) DEFAULT NULL,

    PRIMARY KEY (id),
    KEY fk_item_pedido (pedido_id),
    KEY fk_item_produto (produto_id),

    CONSTRAINT fk_item_pedido
        FOREIGN KEY (pedido_id)
        REFERENCES pedidos (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_item_produto
        FOREIGN KEY (produto_id)
        REFERENCES produtos (id)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_0900_ai_ci;