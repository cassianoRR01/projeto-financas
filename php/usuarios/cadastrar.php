<?php

header("Content-Type: application/json; charset=UTF-8");
require_once "../conexao.php";

// Receba os dados do javascript rival //
$dados = json_decode(file_get_contents("php://input"), true);

if(!$dados){
    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "FUDEU, dados não foram recebidos"
    ]);
    exit;
}

// Pega os campos dnv nessa desgraça
$nome = trim($dados["nome"] ?? "");
$email = strtolower(trim($dados["email"] ?? ""));
$senha = $dados["senha"] ?? "";
$cpf = preg_replace('/\D/', '', $dados["cpf"] ?? "");

$cep = preg_replace('/\D/', '', $dados["cep"] ?? "");
$rua = trim($dados["rua"] ?? "");
$bairro = trim($dados["bairro"] ?? "");
$cidade = trim($dados["cidade"] ?? "");
$estado = trim($dados["estado"] ?? "");
$uf = trim($dados["uf"] ?? "");
$numero = trim($dados["numero"] ?? "");
$complemento = trim($dados["complemento"] ?? "");

// Validacao pra mandar pro servidor pra nao explodir com tudo

function validarCPF($cpf) {
    if (strlen($cpf) !== 11 ||
        preg_match('/^(\d)\1{10}$/', $cpf)) {
        return false;
    }
    for ($t = 9; $t < 11; $t++) {
        $soma = 0;
        for ($i = 0; $i < $t; $i++) {
            $soma += intval($cpf[$i]) * (($t + 1) - $i);
        }
        $digito = ((10 * $soma) % 11) % 10;
        if ($digito !== intval($cpf[$t])) {
            return false;
        }
    }
    return true;
}

if($nome === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)){
    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Nome ou email inválido."
    ]);
    exit;
}

if(strlen($senha) < 8 || !preg_match('/[A-Za-z]/', $senha) || !preg_match('/\d/', $senha)){
    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "A senha precisa ter pelo menos 8 caracteres, incluindo letras e números."
    ]);
    exit;
}

if(!validarCPF($cpf)){
    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "CPF inválido."
    ]);
    exit;
}

if(strlen($cep) !== 8){
    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "CEP inválido."
    ]);
    exit;
}

// Averigua possivel resenha no banco pra ver se o cpf ou email ja ta cadastrado
$consulta = $pdo->prepare("SELECT id_usuario FROM usuarios WHERE email = :email OR cpf = :cpf LIMIT 1");
$consulta->execute([
    ":email" => $email,
    ":cpf" => $cpf
]);

if($consulta->fetch()){
    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Este email ou CPF já está cadastrado."
    ]);
    exit;
}

// Transforma a senha num hash
$senhaHash = password_hash($senha, PASSWORD_DEFAULT);

// Mete tudo pra dentro 
$sql = "INSERT INTO usuarios(nome, email, senha, cpf, cep, rua, bairro, cidade, estado, uf, numero, complemento) VALUES (:nome, :email, :senha, :cpf, :cep, :rua, :bairro,
    :cidade, :estado, :uf, :numero, :complemento)";

try {
    $inserir = $pdo->prepare($sql);
    $inserir->execute([
        ":nome" => $nome,
        ":email" => $email,
        ":senha" => $senhaHash,
        ":cpf" => $cpf,
        ":cep" => $cep,
        ":rua" => $rua,
        ":bairro" => $bairro,
        ":cidade" => $cidade,
        ":estado" => $estado,
        ":uf" => $uf,
        ":numero" => $numero,
        ":complemento" => $complemento
    ]);

    http_response_code(201);
    echo json_encode([
        "sucesso" => true,
        "mensagem" => "Usuário cadastrado com sucesso!"
    ]);

} catch(PDOException $erro){
    error_log($erro->getMessage());
    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Não foi possivel cadastrar o usuário."
    ]);
}

?>