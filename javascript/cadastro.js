

// Formulário //
const formCad = document.getElementById("formCadastro")

// Campos do Formulario de Cadastro //

const nomeCad = document.getElementById("nomeCadastro")
const emailCad = document.getElementById("emailCadastro")
const senhaCad = document.getElementById('senhaCad')
const conSenha = document.getElementById('conSenhaCad')
const cpfCad = document.getElementById("cpfCadastro")

const cepCad = document.getElementById("cepCadastro")
const ruaCad = document.getElementById('ruaCadastro')
const bairroCad = document.getElementById('bairroCadastro')
const localidadeCad = document.getElementById('cidadeCadastro')
const estadoCad = document.getElementById('estadoCadastro')
const ufCad = document.getElementById('ufCadastro')
const numCad = document.getElementById('numCadastro')
const complementoCad = document.getElementById('complementoCadastro')

// Mensagem Sucesso //
const spanCad = document.getElementById('spanCadastro')

/* Antiga funcao do ViaCep pq o javascript ficou de putaria e tive q mudar
function consultaCEP(){
    let cep = cepCad.value.replace(/\D/g, '');

    let urlCEP = `https://viacep.com.br/ws/${cep}/json/`
    fetch(urlCEP)
        .then(response => response.json())
        .then(data => {
            ruaCad.value = data.logradouro
            bairroCad.value = data.bairro
            localidadeCad.value = data.localidade
            estadoCad.value = data.estado
            ufCad.value = data.uf
        })
        .catch(error => console.error(error))
} */
 
async function consultaCEP() {

    const cep = cepCad.value.replace(/\D/g, '');

    // Verifica se o CEP possui 8 números
    if (cep.length !== 8) {
        return;
    }

    try {
        const resposta = await fetch(
            `../php/cep/consultar.php?cep=${encodeURIComponent(cep)}`
        );

        const resultado = await resposta.json();

        // Verifica se houve algum erro na consulta
        if (!resposta.ok || !resultado.sucesso) {
            throw new Error(resultado.mensagem);
        }

        // Recupera os dados do endereço
        const endereco = resultado.endereco;
        ruaCad.value = endereco.logradouro || "";
        bairroCad.value = endereco.bairro || "";
        localidadeCad.value = endereco.localidade || "";
        estadoCad.value = endereco.estado || "";
        ufCad.value = endereco.uf || "";

        tiraErro(5);

    } catch (erro) {
        console.error("Erro ao consultar CEP:", erro);
        spanConta[5].textContent =
            erro.message || "Não foi possível consultar o CEP.";
        setError(5);

    }
}


// Mensagem de Erro //

const spanConta = document.querySelectorAll('.spanForm')
const campo = document.querySelectorAll('.campo')

// Functions para Validar Campos //

function setError(index){
    campo[index].style.border = '2px solid red';
    spanConta[index].style.display = 'inline-block';
}

function tiraErro(index){
    campo[index].style.border = '';
    spanConta[index].style.display = 'none';
}

function valCadNome(){
    if(campo[0].value.trim() === ''){
        setError(0);
        return false;
    } else {
        tiraErro(0);
        return true;
    }
}

function valCadEmail(){
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const email = emailCad.value.trim();
    if(regex.test(email)){
        tiraErro(1)
        return true
    } else{
        setError(1)
        return false
    }
}

function valSenhaCad(){
    const senha = senhaCad.value.trim();
    const confirmarSenha = conSenha.value.trim();

    // Mínimo de 8 caracteres, pelo menos 1 letra e 1 número
    const regexSenha = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

    if(!regexSenha.test(senha)){
        setError(2);
        spanConta[2].textContent = 'Senha muito Curta (Mín.: 8 caracteres, contendo letras e números).';
        return false;
    }

    tiraErro(2);

    if(senha !== confirmarSenha){
        setError(3);
        spanConta[3].textContent = 'As senhas precisam ser iguais.';
        return false;
    }

    tiraErro(3);
    return true;
}

function valCpfCad(){
    let cpf = cpfCad.value.replace(/\D/g, '');

    if(cpf.length !== 11){
        setError(4);
        return false;
    }

    // Impede CPFs com todos os números iguais
    if(/^(\d)\1+$/.test(cpf)){
        setError(4);
        return false;
    }

    // Primeiro dígito verificador
    let soma = 0;

    for(let i = 0; i < 9; i++){
        soma += Number(cpf.charAt(i)) * (10 - i);
    }

    let resto = (soma * 10) % 11;
    if(resto === 10) resto = 0;

    if(resto !== Number(cpf.charAt(9))){
        setError(4);
        return false;
    }

    // Segundo dígito verificador
    soma = 0;

    for(let i = 0; i < 10; i++){
        soma += Number(cpf.charAt(i)) * (11 - i);
    }

    resto = (soma * 10) % 11;
    if(resto === 10) resto = 0;

    if(resto !== Number(cpf.charAt(10))){
        setError(4);
        return false;
    }

    tiraErro(4);
    return true;
}

function valCepCad(){
    let cep = cepCad.value.replace(/\D/g, '');

    if(cep.length !== 8){
        setError(5);
        spanConta[5].textContent = 'CEP deve conter 8 números.';
        return false;
    }

    tiraErro(5);
    return true;
}

/* Comentando a função antiga de salvamento pq se der merda tem ela pra tapar buraco
function salvarCad(){
    const userCadastrados = JSON.parse(localStorage.getItem('userCadastrados')) || [];

    const usuario = {
        nomeUser: nomeCad.value,
        emailUser: emailCad.value,
        senha: senhaCad.value,
        cpfUser: cpfCad.value,
        contas: [],
        historico: [],
        cepUser: cepCad.value,
        rua: ruaCad.value,
        bairro: bairroCad.value,
        cidade: localidadeCad.value,
        estado: estadoCad.value,
        uf: ufCad.value,
        nº: numCad.value,
        complemento: complementoCad.value
    };
    
    const emailExiste = userCadastrados.some(usuario => usuario.emailUser === emailCad.value);

    if(emailExiste){
        setError(1);
        spanConta[1].textContent = 'Email já Registrado';
        return false;
    }

    tiraErro(1);

    userCadastrados.push(usuario);

    localStorage.setItem('usuarios', JSON.stringify(userCadastrados));

    return true;
} */

/* Essa parte tbm pq é ela q envia pra parada la etc
formCad.addEventListener("submit", (e) => {
    e.preventDefault();

    const validacoesCad = [
        valCadNome(),
        valCadEmail(),
        valSenhaCad(),
        valCpfCad(),
        valCepCad()
    ];

    const formCadValido = validacoesCad.every(resultado => resultado)

    if(formCadValido){
        salvarCad();
        spanCad.style.display = 'inline-block'
        
    } 
}); */

// Agr começa a nova forma de salvar a parada, vai mandar pro php primeiro e depois pro banco SUPOSTAMENTE

async function salvarCad(){
    // Os dados que vao pro php
    const usuario = {
        nome: nomeCad.value.trim(),
        email: emailCad.value.trim().toLowerCase(),
        senha: senhaCad.value,
        cpf: cpfCad.value.replace(/\D/g, ''),
        cep: cepCad.value.replace(/\D/g, ''),
        rua: ruaCad.value.trim(),
        bairro: bairroCad.value.trim(),
        cidade: localidadeCad.value.trim(),
        estado: estadoCad.value.trim(),
        uf: ufCad.value.trim(),
        numero: numCad.value.trim(),
        complemento: complementoCad.value.trim()
    }

    try {
        const resposta = await fetch(
            "../php/usuarios/cadastrar.php",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(usuario)
            }
        );

        const resultado = await resposta.json();

        if(!resposta.ok){
            throw new Error(resultado.mensagem);
        }

        spanCad.textContent = resultado.mensagem;
        spanCad.style.color = "green";
        spanCad.style.display = "inline-block";

        formCad.reset();

    } catch(erro){
        spanCad.textContent = erro.mensagem || "Erro ao realizar cadastro.";
        spanCad.style.color = "red";
        spanCad.style.display = "inline-block";
    }
}

// Evento que envia a porra toda (ou nao)
formCad.addEventListener("submit", async(e) =>{
    e.preventDefault();

    spanCad.style.display = "none";

    emailCad.value = emailCad.value.trim().toLowerCase();
    
    const validacoesCad = [
        valCadNome(),
        valCadEmail(),
        valSenhaCad(),
        valCpfCad(),
        valCepCad()
    ];

    const formCadValido = validacoesCad.every(resultado => resultado === true);

    if(formCadValido){
        await salvarCad();
    }
});

