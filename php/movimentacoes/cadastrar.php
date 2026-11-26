
<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/../conexao.php";

// VERIFICAR MÉTODO DA REQUISIÇÃO

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    http_response_code(405);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Método não permitido."
    ]);
    exit;
}

// VERIFICAR SE O USUÁRIO ESTÁ LOGADO

if (!isset($_SESSION["usuario"]["id_usuario"])) {

    http_response_code(401);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Usuário não autenticado."
    ]);
    exit;
}

$idUsuario = $_SESSION["usuario"]["id_usuario"];

// RECEBER OS DADOS DO JAVASCRIPT

$dados = json_decode(file_get_contents("php://input"), true);

if (!is_array($dados)) {

    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Dados inválidos."
    ]);
    exit;
}

$nome = trim($dados["nome"] ?? "");
$valor = $dados["valor"] ?? null;
$tipo = $dados["tipo"] ?? "";
$dataAbertura = $dados["abertura"] ?? "";
$dataVencimento = $dados["vencimento"] ?? "";

// VALIDAR NOME

if ($nome === "") {

    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Informe o nome da movimentação."
    ]);
    exit;
}

preg_match_all('/./us', $nome, $caracteres);

if (count($caracteres[0]) > 100) {

    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "O nome deve possuir no máximo 100 caracteres."
    ]);
    exit;
}

// VALIDAR TIPO

if (!in_array($tipo, ["despesa", "receita"], true)) {

    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Tipo de movimentação inválido."
    ]);
    exit;
}

// VALIDAR VALOR

if (
    !is_numeric($valor) ||
    !is_finite((float) $valor) ||
    (float) $valor <= 0
) {

    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Informe um valor válido."
    ]);
    exit;
}

$valor = number_format((float) $valor, 2, ".", "");

// FUNÇÃO PARA VALIDAR DATAS

function validarData($data) {

    if ($data === "") {
        return true;
    }

    $dataObjeto = DateTime::createFromFormat("!Y-m-d", $data);

    return $dataObjeto && $dataObjeto->format("Y-m-d") === $data;
}

// VALIDAR DATAS SOMENTE PARA DESPESAS

if ($tipo === "despesa") {

    if (!validarData($dataAbertura) || !validarData($dataVencimento)) {

        http_response_code(400);
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Uma das datas informadas é inválida."
        ]);
        exit;
    }

    if (($dataAbertura === "") !== ($dataVencimento === "")) {

        http_response_code(400);
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Informe as duas datas ou deixe ambas vazias."
        ]);
        exit;
    }

    if ($dataAbertura !== "" && $dataVencimento !== "") {

        if ($dataAbertura >= $dataVencimento) {

            http_response_code(400);
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "A data de vencimento deve ser posterior à data de abertura."
            ]);
            exit;
        }
    }

} else {

    // RECEITAS NÃO UTILIZAM DATAS DE ABERTURA E VENCIMENTO
    $dataAbertura = "";
    $dataVencimento = "";

}

// CADASTRAR MOVIMENTAÇÃO NO BANCO

try {

    $sql = "
        INSERT INTO movimentacoes
        (
            id_usuario,
            nome,
            valor,
            tipo,
            data_abertura,
            data_vencimento,
            data_pagamento,
            status
        )

        VALUES
        (
            :id_usuario,
            :nome,
            :valor,
            :tipo,
            :data_abertura,
            :data_vencimento,
            NULL,
            'pendente'
        )
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([

        ":id_usuario" => $idUsuario,
        ":nome" => $nome,
        ":valor" => $valor,
        ":tipo" => $tipo,

        ":data_abertura" => $dataAbertura !== ""
            ? $dataAbertura
            : null,

        ":data_vencimento" => $dataVencimento !== ""
            ? $dataVencimento
            : null

    ]);

    // RECUPERAR ID GERADO PELO MARIADB

    $idMovimentacao = $pdo->lastInsertId();

    // RETORNAR RESPOSTA AO JAVASCRIPT

    echo json_encode([
        "sucesso" => true,
        "mensagem" => $tipo === "despesa"
            ? "Despesa cadastrada com sucesso!"
            : "Receita cadastrada com sucesso!",
        "id_movimentacao" => $idMovimentacao
    ]);

} catch (PDOException $erro) {

    error_log("Erro ao cadastrar movimentação: " . $erro->getMessage());
    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Erro interno ao cadastrar a movimentação."
    ]);
}

?>
