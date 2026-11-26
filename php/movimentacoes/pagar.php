
<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/../conexao.php";

// 1. VERIFICAR MÉTODO

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    http_response_code(405);

    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Método não permitido."
    ]);

    exit;
}

// 2. VERIFICAR SESSÃO

if (!isset($_SESSION["usuario"]["id_usuario"])) {

    http_response_code(401);

    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Usuário não autenticado."
    ]);

    exit;
}

$idUsuario = $_SESSION["usuario"]["id_usuario"];

// 3. RECEBER ID DA DESPESA

$dados = json_decode(file_get_contents("php://input"), true);

$idMovimentacao = $dados["id_movimentacao"] ?? null;

if (
    !is_numeric($idMovimentacao) ||
    (int) $idMovimentacao <= 0
) {

    http_response_code(400);

    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Identificador da despesa inválido."
    ]);

    exit;
}

$idMovimentacao = (int) $idMovimentacao;

// 4. ATUALIZAR DESPESA NO BANCO

try {

    $sql = "
        UPDATE movimentacoes
        SET
            status = 'paga',
            data_pagamento = CURDATE()
        WHERE
            id_movimentacao = :id_movimentacao
            AND id_usuario = :id_usuario
            AND tipo = 'despesa'
            AND status = 'pendente'
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([

        ":id_movimentacao" => $idMovimentacao,
        ":id_usuario" => $idUsuario

    ]);

    // Verifica se alguma despesa foi atualizada
    if ($stmt->rowCount() === 0) {

        http_response_code(404);
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Despesa não encontrada, já paga ou não pertence a este usuário."
        ]);

        exit;
    }

    // Recupera a data registrada pelo banco
    $sqlData = "
        SELECT DATE_FORMAT(data_pagamento, '%Y-%m-%d') AS data_pagamento
        FROM movimentacoes
        WHERE id_movimentacao = :id_movimentacao
          AND id_usuario = :id_usuario
    ";

    $stmtData = $pdo->prepare($sqlData);

    $stmtData->execute([
        ":id_movimentacao" => $idMovimentacao,
        ":id_usuario" => $idUsuario
    ]);

    $resultado = $stmtData->fetch(PDO::FETCH_ASSOC);

    echo json_encode([

        "sucesso" => true,
        "mensagem" => "Despesa marcada como paga!",
        "data_pagamento" => $resultado["data_pagamento"]

    ]);

} catch (PDOException $erro) {

    error_log("Erro ao pagar despesa: " . $erro->getMessage());
    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Erro interno ao atualizar a despesa."
    ]);
}

?>
