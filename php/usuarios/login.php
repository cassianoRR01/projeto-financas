<?php
// TO FAZENDO AINDA TA IMCOMPRETO
session_start();
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/../conexao.php";

if($_SERVER["REQUEST_METHOD"] !== "POST"){
    http_response_code(405);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Método não permitido"
    ]);
    exit;
}

$dados = json_decode(file_get_contents("php://input"), true);

?>