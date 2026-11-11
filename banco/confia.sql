CREATE DATABASE IF NOT EXISTS confia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE confia;

-- Tabela Usuários --
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    cpf CHAR(11) NOT NULL UNIQUE,
    cep CHAR(8),
    rua VARCHAR(150),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(100),
    uf CHAR(2),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE movimentacoes(
	id_movimentacao INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    nome varchar(100) NOT NULL,
    valor decimal(10,2) NOT NULL,
    tipo enum('despesa', 'receita') NOT NULL,
    data_abertura DATE,
    data_vencimento DATE,
    data_pagamento DATE,
    status ENUM('pendente','paga','recebida') NOT NULL DEFAULT 'pendente',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_movimentacao_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);
show tables;
