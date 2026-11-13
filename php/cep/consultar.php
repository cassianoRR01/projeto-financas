
<?php

header("Content-Type: application/json; charset=UTF-8");

// Recebe o CEP pela URL
$cep = preg_replace('/\D/', '', $_GET["cep"] ?? "");

// Valida o formato
if (strlen($cep) !== 8) {
    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "CEP deve conter 8 números."
    ]);
    exit;
}

// Monta a URL do ViaCEP
$url = "https://viacep.com.br/ws/" . $cep . "/json/";

// Inicializa o cURL
$curl = curl_init($url);

curl_setopt_array($curl, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2
]);

// Executa a consulta
$resposta = curl_exec($curl);
$erro = curl_error($curl);
$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

// Verifica falhas de comunicação
if ($resposta === false || $status !== 200) {
    error_log("Erro ViaCEP: " . $erro);
    http_response_code(502);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Não foi possível consultar o ViaCEP."
    ]);
    exit;
}

// Converte a resposta
$dados = json_decode($resposta, true);

if (!is_array($dados)) {
    http_response_code(502);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Resposta inválida do ViaCEP."
    ]);
    exit;
}

// Verifica se o CEP existe
if (isset($dados["erro"]) && $dados["erro"] === true) {
    http_response_code(404);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "CEP não encontrado."
    ]);
    exit;
}

// Retorna os dados ao JavaScript
echo json_encode([
    "sucesso" => true,
    "endereco" => $dados
]);

?>
