// ARQUIVO ANTIGO MAS DEIXA AQ PQ VAI Q DA MERDA

// Verifa se o usuario está logado, caso não, ele é redirecionado a tela de login //
const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado')) || {}

async function verificarUsuario(){
    try {
        const resposta = await fetch(
            "../php/usuarios/verificar_sessao.php"
        );
        const resultado = await resposta.json();

        if(!resposta.ok || !resultado.logado){
            window.location.href = "login.html";
            return null;
        }
        return resultado.usuario;
    } catch(erro){
        console.error("Erro ao verificar usuário: ", erro);
        window.location.href = "login.html";
        return null;
    }
}

if(!usuarioLogado.contas){
    usuarioLogado.contas = [];
}

if(!usuarioLogado.historico){
    usuarioLogado.historico = [];
}

if(!usuarioLogado.receitas){
    usuarioLogado.receitas = [];
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

// dialog adm

const perfilAdm = document.getElementById("dialogPerfilAdm");
const btnAdm = document.getElementById("btnAdm");
const fecharAdm = document.getElementById("fecharAdm");
const totalUsuariosAdm = document.getElementById("totalUsuariosAdm");
const estadoUsuariosAdm = document.getElementById("estadoUsuariosAdm");
const listaUsuariosAdm = document.getElementById("listaUsuariosAdm");

async function verificarPerfilAdm() {
    try {
        const resposta = await fetch("../php/usuarios/verifcar_sessao.php");
        const resultado = await resposta.json();

        if (resposta.ok && resultado.logado && resultado.usuario.perfil === "admin") {
            btnAdm.hidden = false;
        }
    } catch (erro) {
        console.error("Erro ao verificar o perfil administrativo:", erro);
    }
}

verificarPerfilAdm();

btnAdm.addEventListener("click", async () => {
    perfilAdm.showModal();
    totalUsuariosAdm.textContent = "";
    listaUsuariosAdm.replaceChildren();
    estadoUsuariosAdm.textContent = "Carregando usuários...";

    try {
        const resposta = await fetch("../php/usuarios/listar_usuarios.php");
        const resultado = await resposta.json();

        if (!resposta.ok || !resultado.sucesso) {
            throw new Error(resultado.mensagem || "Não foi possível carregar os usuários.");
        }

        totalUsuariosAdm.textContent = `${resultado.total} usuário(s) cadastrado(s)`;
        estadoUsuariosAdm.textContent = resultado.total
            ? ""
            : "Nenhum usuário cadastrado.";

        resultado.usuarios.forEach(usuario => {
            const item = document.createElement("li");
            item.textContent = usuario.nome;
            listaUsuariosAdm.appendChild(item);
        });
    } catch (erro) {
        console.error("Erro ao carregar a lista de usuários:", erro);
        estadoUsuariosAdm.textContent = "Não foi possível carregar os usuários. Tente novamente.";
    }
});

fecharAdm.addEventListener("click", () => {
    perfilAdm.close();
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

    let totalDespesas = 0;
    let totalReceitas = 0;

    // Soma despesas pendentes
    usuarioLogado.contas.forEach(conta => {
        totalDespesas += Number(conta.valor);
    });

    // Soma despesas pagas
    usuarioLogado.historico.forEach(conta => {
        totalDespesas += Number(conta.valor);
    });

    // Soma receitas
    usuarioLogado.receitas.forEach(receita => {
        totalReceitas += Number(receita.valor);
    });

    // Calcula saldo
    const saldo = totalReceitas - totalDespesas;

    document.getElementById('totalDespesas').textContent = `R$ ${totalDespesas.toFixed(2)}`;

    document.getElementById('totalReceitas').textContent = `R$ ${totalReceitas.toFixed(2)}`;

    document.getElementById('saldo').textContent = `R$ ${saldo.toFixed(2)}`;
}


const btnAdd = document.getElementById('btnAdd');
const modalConta = document.getElementById('modalConta');
const fecharDespesa = document.getElementById('fecharDespesa');
const fecharReceita = document.getElementById('fecharReceita');
const formConta = document.getElementById('formConta');
const fundoContas = document.querySelector(".semContas");

btnAdd.addEventListener("click", function() {
    modalConta.showModal();
});

function atualizarMensagemSemContas() {
    if (
        usuarioLogado.contas.length === 0 &&
        usuarioLogado.receitas.length === 0
    ) {
        fundoContas.style.display = "block";
    } else {
        fundoContas.style.display = "none";
    }
}

fecharDespesa.addEventListener('click', () => {
    modalConta.close();
    formConta.reset();
});

fecharReceita.addEventListener('click', () => {
    modalConta.close();
    formRec.reset();
});

// Function que carrega todas as contas quando recarrega a pagina //

function carregarContas() {

    document.querySelector('.contas').innerHTML = '';

    // Carrega despesas pendentes
    usuarioLogado.contas.forEach(conta => {
        exibirContaTela(conta);
    });

    // Carrega receitas
    usuarioLogado.receitas.forEach(receita => {
        exibirReceitaTela(receita);
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

    // Formatação das datas
    const dataAberFormatada = conta.abertura
        ? conta.abertura.split('-').reverse().join('/')
        : 'Não informada';

    const dataVencFormatada = conta.vencimento
        ? conta.vencimento.split('-').reverse().join('/')
        : 'Não informada';

    contaDiv.innerHTML = `
        <h3>${conta.nome}</h3>

        <p>Abertura: ${dataAberFormatada}</p>

        <p>Vencimento: ${dataVencFormatada}</p>

        <p>Valor: R$ ${Number(conta.valor).toFixed(2)}</p>

        ${
            conta.status === 'pendente'
            ? `<button onclick="pagoConta(${conta.id})">Pago</button>`
            : `<p>✓ Pago</p>`
        }
    `;

    listaContas.appendChild(contaDiv);
}

// Mensagem de Erro //

const spanConta = document.querySelectorAll('.spanForm')
const campo = document.querySelectorAll('.campo')

function exibirReceitaTela(receita) {

    const listaContas = document.querySelector('.contas');

    const receitaDiv = document.createElement('div');

    receitaDiv.classList.add('conta', 'receita');

    receitaDiv.id = receita.id;

    receitaDiv.innerHTML = `
        <h3>${receita.nome}</h3>

        <p>Tipo: Receita</p>

        <p>Valor: R$ ${Number(receita.valor).toFixed(2)}</p>

        <p>Cadastro: ${receita.dataCadastro}</p>
    `;

    listaContas.appendChild(receitaDiv);
}

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
    if (checkVenci.checked) {
        tiraErro(2);
        return true;
    }

    if (campo[2].value === "") {
        setError(2);
        spanConta[2].textContent = "Data de abertura inválida";
        return false;
    }

    tiraErro(2);
    return true;
}

function valDataVenc(){
    if (checkVenci.checked) {
        tiraErro(3);
        return true;
    }

    if (campo[3].value === "") {
        setError(3);
        spanConta[3].textContent = "Data de vencimento inválida";
        return false;
    }

    tiraErro(3);
    return true;
}

function exibirHistoricoTela(conta){
    const historicoDiv = document.querySelector('.historico');

    const item = document.createElement('div');

    item.classList.add('itemHistorico');

    const dataAberFormatada = conta.abertura
        ? conta.abertura.split('-').reverse().join('/')
        : 'Não informada';

    const dataVencFormatada = conta.vencimento
        ? conta.vencimento.split('-').reverse().join('/')
        : 'Não informada';

    item.innerHTML = `
        <h3>${conta.nome}</h3>

        <p>Valor: R$ ${Number(conta.valor).toFixed(2)}</p>

        <p>Abertura: ${dataAberFormatada}</p>

        <p>Vencimento: ${dataVencFormatada}</p>

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

    function valDatas() {

        if (checkVenci.checked) {
            return true;
        }

        if (!dataAbertura || !dataVencimento) {
            return true;
        }

        if (dataAbertura === dataVencimento) {

            setError(2);
            setError(3);

            spanConta[2].textContent = 'Datas iguais';
            spanConta[3].textContent = 'Datas iguais';

            return false;
        }

        if (dataAbertura > dataVencimento) {

            setError(3);

            spanConta[3].textContent =
                'Data de vencimento é anterior à abertura';

            return false;
        }

        tiraErro(2);
        tiraErro(3);

        return true;
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
            abertura: checkVenci.checked ? '' : dataAbertura,
            vencimento: checkVenci.checked ? '' : dataVencimento,
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

const nomeRec = document.getElementById('nomeRec');
const valorRec = document.getElementById('valorRec');

formRec.addEventListener('submit', (e) => {

    e.preventDefault();

    const nome = nomeRec.value.trim();
    const valor = parseFloat(valorRec.value);

    // Validação
    if (nome === '' || isNaN(valor) || valor <= 0) {

        alert('Preencha corretamente o nome e o valor da receita.');

        return;
    }

    // Criação da receita
    const novaReceita = {

        id: Date.now(),

        nome: nome,

        valor: valor,

        dataCadastro: new Date().toLocaleDateString('pt-BR')

    };

    // Adiciona ao usuário
    usuarioLogado.receitas.push(novaReceita);

    // Salva no localStorage
    salvarUsuario();

    // Atualiza a tela
    exibirReceitaTela(novaReceita);

    atualizarMensagemSemContas();

    atualizarTotais();

    // Fecha e limpa o formulário
    modalConta.close();

    formRec.reset();

});

// Vencimento

const checkVenci = document.getElementById("checkvencimento");
const campoAbertura = document.getElementById("abertura");
const campoVencimento = document.getElementById("vencimento");
const elementosData = [
    document.querySelector('label[for="abertura"]'),
    campoAbertura,
    campoAbertura.nextElementSibling,
    document.querySelector('label[for="vencimento"]'),
    campoVencimento,
    campoVencimento.nextElementSibling
];

checkVenci.addEventListener('change', () => {
    elementosData.forEach(elemento => {
        elemento.classList.toggle('oculto', checkVenci.checked);
    });
});
