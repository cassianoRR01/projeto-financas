<?php 

session_start();

header("Content-Type: application/json; charset=UTF-8");

if(!isset($_SESSION["usuario"])){
    http_response_code(401);

    echo json_encode([
        "sucesso" => false,
        "logado" => false,
        "mensagem" => "Nenhum usuário conectado"
    ]);

    exit;
}

$usuario = $_SESSION["usuario"];

echo json_encode([
    "sucesso" => true,
    "logado" => true,
    "usuario" => [
        "id_usuario" => $usuario["id_usuario"],
        "nome" => $usuario["nome"],
        "email" => $usuario["email"],
        "perfil" => $usuario["perfil"] ?? "usuario"
    ]
]);

?>