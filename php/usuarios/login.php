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
    $perfil = "usuario";

    if($email === "admconfia@confia.com"){
        $pdo->exec(
            "CREATE TABLE IF NOT EXISTS administradores (
                id_administrador INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(150) NOT NULL UNIQUE,
                senha VARCHAR(255) NOT NULL
            )"
        );

        $stmt = $pdo->prepare(
            "SELECT id_administrador, email, senha
             FROM administradores
             WHERE email = :email
             LIMIT 1"
        );
        $stmt->execute([":email" => $email]);
        $usuario = $stmt->fetch();

        if(!$usuario){
            $senhaInicial = "admconfia123";
            if($senhaInicial === false || $senhaInicial === ""){
                http_response_code(503);
                echo json_encode([
                    "sucesso" => false,
                    "mensagem" => "A senha inicial do administrador não foi configurada no servidor."
                ]);
                exit;
            }

            $stmt = $pdo->prepare(
                "INSERT IGNORE INTO administradores (email, senha)
                 VALUES (:email, :senha)"
            );
            $stmt->execute([
                ":email" => $email,
                ":senha" => password_hash($senhaInicial, PASSWORD_DEFAULT)
            ]);

            $stmt = $pdo->prepare(
                "SELECT id_administrador, email, senha
                 FROM administradores
                 WHERE email = :email
                 LIMIT 1"
            );
            $stmt->execute([":email" => $email]);
            $usuario = $stmt->fetch();
        }

        $perfil = "admin";
        $senhaValida = $usuario && password_verify($senha, $usuario["senha"]);
        $nome = "Administrador";
        $idUsuario = null;
    } else {
        $sql = "SELECT id_usuario, nome, email, senha FROM usuarios WHERE email = :email LIMIT 1";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([":email" => $email]);
        $usuario = $stmt->fetch();
        $senhaValida = $usuario && password_verify($senha, $usuario["senha"]);
        $nome = $usuario["nome"] ?? "";
        $idUsuario = $usuario["id_usuario"] ?? null;
    }

    if(!$senhaValida){
        http_response_code(401);
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Email ou senha inválidos"
        ]);
        exit;
    }

    session_regenerate_id(true);
    $_SESSION["usuario"] = [
        "id_usuario" => $idUsuario,
        "nome" => $nome,
        "email" => $usuario["email"],
        "perfil" => $perfil
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