<?php

session_start();
header("Content-Type: application/json; charset=UTF-8");

if(($_SESSION["usuario"]["perfil"] ?? "") !== "admin"){
    http_response_code(403);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Acesso restrito ao administrador."
    ]);
    exit;
}

require_once __DIR__ . "/../conexao.php";

try{
    $stmt = $pdo->query("SELECT nome FROM usuarios ORDER BY nome ASC");
    $usuarios = $stmt->fetchAll();

    echo json_encode([
        "sucesso" => true,
        "total" => count($usuarios),
        "usuarios" => $usuarios
    ]);
} catch(PDOException $erro){
    error_log("Erro ao listar usuários:" . $erro->getMessage());
    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Não foi possível carregar os usuários."
    ]);
}

?>
