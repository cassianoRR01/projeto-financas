
<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/../conexao.php";

// VERIFICAR A SESSÃO

if (!isset($_SESSION["usuario"]["id_usuario"])) {

    http_response_code(401);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Usuário não autenticado."
    ]);

    exit;
}

$idUsuario = $_SESSION["usuario"]["id_usuario"];

// CONSULTAR AS MOVIMENTAÇÕES

try {

    $sql = "
        SELECT
            id_movimentacao,
            nome,
            valor,
            tipo,
            data_abertura,
            data_vencimento,
            data_pagamento,
            status
        FROM movimentacoes
        WHERE id_usuario = :id_usuario
        ORDER BY id_movimentacao DESC
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ":id_usuario" => $idUsuario
    ]);

    $movimentacoes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // RETORNAR OS DADOS

    echo json_encode([
        "sucesso" => true,
        "movimentacoes" => $movimentacoes
    ]);

} catch (PDOException $erro) {

    error_log("Erro ao listar movimentações: " . $erro->getMessage());

    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Erro interno ao consultar movimentações."
    ]);
}

?>
