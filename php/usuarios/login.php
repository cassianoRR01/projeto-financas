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
// Pega os dados do javascript supostamente
$dados = json_decode(file_get_contents("php://input"), true);

if(!is_array($dados)){
    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Dados inválidos"
    ]);
    exit;
}

$email = strtolower(trim($dados["email"] ?? ""));
$senha = $dados["senha"] ?? "";

if($email === "" || $senha === ""){
    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Email ou senha não podem ser vazios"
    ]);
    exit;
}

try{
    $sql = "SELECT id_usuario, nome, email, senha FROM usuarios WHERE email = :email LIMIT 1";
    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ":email" => $email
    ]);

    $usuario = $stmt->fetch();

    if(!$usuario || !password_verify($senha, $usuario["senha"])){
        http_response_code(401);
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Email ou senha inválidos"
        ]);
        exit;
    }

    session_regenerate_id(true);
    $_SESSION["usuario"] = [
        "id_usuario" => $usuario["id_usuario"],
        "nome" => $usuario["nome"],
        "email" => $usuario["email"]
    ];

    echo json_encode([
        "sucesso" => true,
        "mensagem" => "Login realizado com sucesso"
    ]);
} catch(PDOException $erro){
    error_log("Erro no login:" . $erro->getMessage());

    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Erro interno ao realizar login"
    ]);
}

?>