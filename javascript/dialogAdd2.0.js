// Verifa se o usuario está logado, caso não, ele é redirecionado a tela de login //
const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'))

if(!usuarioLogado){
    window.location.href = 'login.html';
}

if(!usuarioLogado.contas){
    usuarioLogado.contas = [];
}

if(!usuarioLogado.historico){
    usuarioLogado.historico = [];
}

// Integração Login com a DialogLogin //
const BtnLogin = document.getElementById("btnLogin");
const loginDialog = document.getElementById("loginDialog");
const infoUsuario = document.getElementById('infoUsuario')
const fecharLogin = document.getElementById('fecharLogin');

BtnLogin.addEventListener("click", () => {
    infoUsuario.innerHTML = `
    <h2>Bem Vindo(a), ${usuarioLogado.nomeUser}</h2>
    <p>Email: ${usuarioLogado.emailUser}</p>
    `;

    loginDialog.showModal();
})

fecharLogin.addEventListener("click", (e) =>{
    e.preventDefault(); loginDialog.close()
});

const btnExcluirConta = document.getElementById('excluirContaBtn');

btnExcluirConta.addEventListener('click', () => {

    const confirmar = confirm(
        'Tem certeza que deseja excluir sua conta? Esta ação não poderá ser desfeita.'
    );

    if (!confirmar) return;

    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

    usuarios = usuarios.filter(
        usuario => usuario.emailUser !== usuarioLogado.emailUser
    );

    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    localStorage.removeItem('usuarioLogado');

    alert('Conta excluída com sucesso!');

    window.location.href = 'cadastro.html';
});

// Logout //
const btnLogout = document.getElementById('logoutBtn')
btnLogout.addEventListener('click', () => {
    localStorage.removeItem('usuarioLogado');
    window.location.href = 'login.html'
});

// Historico de pagamentos //
const btnHis = document.getElementById('btnHistorico')
const modalHis = document.getElementById('dialogHistorico')
const fecharHis = document.getElementById('fecharHis')

btnHis.addEventListener("click", (e) => {
    e.preventDefault();
    modalHis.showModal();
})

fecharHis.addEventListener("click", (e) => {
    e.preventDefault();
    modalHis.close();
})


// Salvar as paradas no Usuario //
function salvarUsuario(){
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

    const indice = usuarios.findIndex(usuario => usuario.emailUser === usuarioLogado.emailUser);

    usuarios[indice] = usuarioLogado;

    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
}

// Variáveis Totalizadoras //
let totalMensal = 0;
let pendente = 0;
let pago = 0;

function atualizarTotais(){

    totalMensal = 0;
    pendente = 0;
    pago = 0;

    // Soma as contas pendentes
    usuarioLogado.contas.forEach(conta => {
        totalMensal += conta.valor;
        pendente += conta.valor;
    });

    // Soma as contas já pagas
    usuarioLogado.historico.forEach(conta => {
        totalMensal += conta.valor;
        pago += conta.valor;
    });

    document.getElementById('totalMen').textContent =
        `R$ ${totalMensal.toFixed(2)}`;

    document.getElementById('pago').textContent =
        `R$ ${pago.toFixed(2)}`;

    document.getElementById('pendente').textContent =
        `R$ ${pendente.toFixed(2)}`;
}


const btnAdd = document.getElementById('btnAdd');
const modalConta = document.getElementById('modalConta');
const fechar = document.getElementById('fechar');
const formConta = document.getElementById('formConta');
const fundoContas = document.querySelector(".semContas");

btnAdd.addEventListener("click", function() {
    modalConta.showModal();
});

function atualizarMensagemSemContas() {
    if (usuarioLogado.contas.length === 0) {
        fundoContas.style.display = "block";
    } else {
        fundoContas.style.display = "none";
    }
}

fechar.addEventListener("click", () =>{modalConta.close(),formConta.reset()});

// Function que carrega todas as contas quando recarrega a pagina //
function carregarContas(){

    document.querySelector('.contas').innerHTML = '';

    usuarioLogado.contas.forEach(conta => {
        exibirContaTela(conta);
    });

    atualizarMensagemSemContas();
    atualizarTotais();
}

carregarContas();

// Exibir as contas na tela //
function exibirContaTela(conta){
    
    const listaContas = document.querySelector('.contas');

    const contaDiv = document.createElement('div');
    contaDiv.classList.add('conta');
    contaDiv.id = conta.id;

    // Formatar Data // 
    const [anoAbertura, mesAbertura, diaAbertura] = conta.abertura.split("-");
    const [anoVencimento, mesVencimento, diaVencimento] =conta.vencimento.split("-");

    const dataAberFormatada = `${diaAbertura}/${mesAbertura}/${anoAbertura}`;
    const dataVencFormatada = `${diaVencimento}/${mesVencimento}/${anoVencimento}`;

    contaDiv.innerHTML = `
        <h3>${conta.nome}</h3>
        <p>Abertura: ${dataAberFormatada}</p>
        <p>Vencimento: ${dataVencFormatada}</p>
        <p>Valor: R$ ${conta.valor.toFixed(2)}</p>
        ${
            conta.status === 'pendente'?
            `<button onclick="pagoConta(${conta.id})">Pago</button>`:`<p>✓Pago</p>`
        }
    `;

    listaContas.appendChild(contaDiv)
}

// Mensagem de Erro //

const spanConta = document.querySelectorAll('.spanForm')
const campo = document.querySelectorAll('.campo')

// Functions para Validar Campos //

function setError(index){
    campo[index].style.border = '2px solid red';
    spanConta[index].style.display = 'block';
}

function tiraErro(index){
    campo[index].style.border = '';
    spanConta[index].style.display = 'none';
}

function valNome(){
    if(campo[0].value.trim() === ''){
        setError(0);
        return false;
    } else {
        tiraErro(0);
        return true;
    }
}

function valValor(){
    if(campo[1].value.trim() === ''){
        setError(1)
        return false;
    } else {
        tiraErro(1)
        return true;
    }
}

function valDataAber(){
    if(campo[2].value == ""){
        setError(2)
        spanConta[2].textContent = "Data Inválida"
        return false;
    } else {
        tiraErro(2)
        return true;
    }
}

function valDataVenc(){
    if(campo[3].value == ""){
        setError(3)
        spanConta[3].textContent = "Data Inválida"
        return false;
    } else {
        tiraErro(3)
        return true;
    }
}

function exibirHistoricoTela(conta){
    const historicoDiv = document.querySelector('.historico');
    const item = document.createElement('div');
    item.classList.add('itemHistorico');

    const [anoA, mesA, diaA] = conta.abertura.split('-')
    const [anoV, mesV, diaV] = conta.vencimento.split('-')

    item.innerHTML = `
        <h3>${conta.nome}</h3>
        <p>Valor: R$ ${conta.valor.toFixed(2)}</p>
        <p>Abertura: ${diaA}/${mesA}/${anoA}</p>
        <p>Vencimento: ${diaV}/${mesV}/${anoV}</p>
        <p>Pagamento: ${conta.dataPagamento}</p>
    `;

    historicoDiv.appendChild(item);
}

function carregarHistorico(){
    document.querySelector('.historico').innerHTML = '';

    usuarioLogado.historico.forEach(conta =>{
        exibirHistoricoTela(conta);
    });
}




formConta.addEventListener("submit", (e) => {
    e.preventDefault()
    
    // Campo do Formulário //
    
    const nomeConta = document.getElementById('nome').value;
    const valorConta = parseFloat(document.getElementById('valor').value);
    const dataAbertura = document.getElementById('abertura').value;
    const dataVencimento = document.getElementById('vencimento').value;

    function valDatas(){
        if(dataAbertura == dataVencimento){
            console.log('Datas iguais')
            setError(2)
            setError(3)
            spanConta[2].textContent = 'Datas Iguais'
            spanConta[3].textContent = 'Datas Iguais'
            return false;
        } 
        else if(dataAbertura > dataVencimento){
            console.log("Abertura > Vencimento")
            setError(3)
            spanConta[3].textContent = 'Data de Vencimento é anterior à Abertura'
            return false;
        } 
        else if(dataAbertura < dataVencimento){
            console.log("Abertura < Vencimento")
            tiraErro(2)
            tiraErro(3)
            return true;
        }
    }



    // Variável que diz se o Formulário pode ser ou não enviado //
    const validacoes = [
    valNome(),
    valValor(),
    valDataAber(),
    valDataVenc(),
    valDatas()
    ];

    const formValido = validacoes.every(resultado => resultado);

    console.log(formValido)
    if(formValido){

        const novaConta = {
            id: Date.now(),
            nome: nomeConta,
            valor: valorConta,
            abertura: dataAbertura,
            vencimento: dataVencimento,
            status: 'pendente'
        };

        usuarioLogado.contas.push(novaConta);

        salvarUsuario();
        exibirContaTela(novaConta);
        atualizarMensagemSemContas();
        atualizarTotais();
        modalConta.close();
        formConta.reset();
    }
    
})

function pagoConta(idConta){

    const indiceConta = usuarioLogado.contas.findIndex(
        conta => conta.id === idConta
    );

    if(indiceConta === -1){
        return;
    }

    const conta = usuarioLogado.contas[indiceConta];

    const contaHistorico = {
        ...conta,
        dataPagamento: new Date().toLocaleDateString('pt-BR')
    };

    // Salva no histórico
    usuarioLogado.historico.push(contaHistorico);

    // Remove da lista de contas
    usuarioLogado.contas.splice(indiceConta, 1);

    salvarUsuario();

    carregarContas();
    carregarHistorico();
    atualizarTotais();
}

carregarContas();
carregarHistorico();


// ADIÇÃO DA RECEITA
const btnReceita = document.getElementById('opcreceita');
const btnDespesa = document.getElementById('opcdespesa');

const formRec = document.getElementById('formRec');

btnReceita.addEventListener('click', () => {
    formConta.hidden = true;
    formRec.hidden = false;

    btnReceita.style.backgroundColor = "rgb(37, 197, 37)";
    btnReceita.style.color = "white";

    btnDespesa.style.backgroundColor = "rgb(219, 93, 93)";
    btnDespesa.style.color = "black";
})

btnDespesa.addEventListener('click', () => {
    formRec.hidden = true;
    formConta.hidden = false;

    btnDespesa.style.backgroundColor = "rgb(206, 63, 63)";
    btnDespesa.style.color = "white";

    btnReceita.style.backgroundColor = "#22c55e";
    btnReceita.style.color = "black";
})