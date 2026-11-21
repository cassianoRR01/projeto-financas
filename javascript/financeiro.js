// VERIFICAÇÃO DA SESSÃO DO USUÁRIO

async function verificarUsuario() {
    try {
        const resposta = await fetch(
            "../php/usuarios/verificar_sessao.php"
        );

        const resultado = await resposta.json();

        if (!resposta.ok || !resultado.logado) {
            window.location.href = "login.html";
            return null;
        }

        return resultado.usuario;

    } catch (erro) {
        console.error("Erro ao verificar usuário:", erro);
        window.location.href = "login.html";
        return null;
    }
}

// INICIA O SISTEMA FINANCEIRO

async function iniciarFinanceiro() {

    // Confirmação da sessão PHP
    const usuarioSessao = await verificarUsuario();

    if (!usuarioSessao) {
        return;
    }

    // Id dos dados financeiros
    const idDados = `dadosFinanceiro_${usuarioSessao.id_usuario}`;

    // Recupera os dados financeiros temporários
    let dadosSalvos = {};

    try {
        dadosSalvos = JSON.parse(localStorage.getItem(idDados)) || {};
    } catch (erro) {
        console.error("Erro ao recuperar dados financeiros:", erro);
    }

    // Objeto do usuário baseado na sessão PHP
    const usuarioLogado = {
        id_usuario: usuarioSessao.id_usuario,
        nomeUser: usuarioSessao.nome,
        emailUser: usuarioSessao.email,
        contas: Array.isArray(dadosSalvos.contas)
            ? dadosSalvos.contas
            : [],
        historico: Array.isArray(dadosSalvos.historico)
            ? dadosSalvos.historico
            : [],
        receitas: Array.isArray(dadosSalvos.receitas)
            ? dadosSalvos.receitas
            : []
    };
   
    // PARADAS DO HTML
   
    const BtnLogin = document.getElementById("btnLogin");
    const loginDialog = document.getElementById("loginDialog");
    const infoUsuario = document.getElementById("infoUsuario");
    const fecharLogin = document.getElementById("fecharLogin");

    const btnExcluirConta = document.getElementById("excluirContaBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    const btnHis = document.getElementById("btnHistorico");
    const modalHis = document.getElementById("dialogHistorico");
    const fecharHis = document.getElementById("fecharHis");

    const btnAdd = document.getElementById("btnAdd");
    const modalConta = document.getElementById("modalConta");
    const fecharDespesa = document.getElementById("fecharDespesa");
    const fecharReceita = document.getElementById("fecharReceita");

    const formConta = document.getElementById("formConta");
    const formRec = document.getElementById("formRec");

    const fundoContas = document.querySelector(".semContas");
    const listaContas = document.querySelector(".contas");
    const listaHistorico = document.querySelector(".historico");

    const btnReceita = document.getElementById("opcreceita");
    const btnDespesa = document.getElementById("opcdespesa");

    const nomeRec = document.getElementById("nomeRec");
    const valorRec = document.getElementById("valorRec");

    const checkVenci = document.getElementById("checkvencimento");
    const campoAbertura = document.getElementById("abertura");
    const campoVencimento = document.getElementById("vencimento");

    const campo = document.querySelectorAll(".campo");
    const spanConta = document.querySelectorAll(".spanForm");

   
    // SALVAR DADOS FINANCEIROS

    function salvarUsuario() {

        const dadosFinanceiros = {
            contas: usuarioLogado.contas,
            historico: usuarioLogado.historico,
            receitas: usuarioLogado.receitas
        };

        localStorage.setItem(
            idDados,
            JSON.stringify(dadosFinanceiros)
        );
    }
   
    // INFORMAÇÕES DO USUÁRIO
   
    if (BtnLogin && loginDialog && infoUsuario) {

        BtnLogin.addEventListener("click", () => {

            infoUsuario.replaceChildren();

            const titulo = document.createElement("h2");
            titulo.textContent = `Bem-vindo(a), ${usuarioLogado.nomeUser}`;

            const email = document.createElement("p");
            email.textContent = `Email: ${usuarioLogado.emailUser}`;

            infoUsuario.append(titulo, email);

            loginDialog.showModal();
        });
    }

    if (fecharLogin && loginDialog) {

        fecharLogin.addEventListener("click", (e) => {
            e.preventDefault();
            loginDialog.close();
        });
    }
   
    // EXCLUIR CONTA
   
    if (btnExcluirConta) {

        btnExcluirConta.addEventListener("click", () => {

            alert(
                "A exclusão da conta precisa ser implementada pelo PHP e pelo banco de dados. Esta função ainda não está disponível."
            );

        });
    }
   
    // LOGOUT
   
    if (logoutBtn) {

        logoutBtn.addEventListener("click", async () => {

            const confirmar = confirm("Deseja realmente sair da sua conta?");

            if (!confirmar) {
                return;
            }

            try {

                const resposta = await fetch(
                    "../php/usuarios/logout.php",
                    {
                        method: "POST"
                    }
                );

                const resultado = await resposta.json();

                if (!resposta.ok || !resultado.sucesso) {
                    alert("Não foi possível encerrar a sessão.");
                    return;
                }

                window.location.href = "login.html";

            } catch (erro) {

                console.error("Erro ao realizar logout:", erro);
                alert("Erro ao tentar sair da conta.");

            }
        });
    }

    // HISTÓRICO DE PAGAMENTOS - ABRIR E FECHAR
   

    if (btnHis && modalHis) {

        btnHis.addEventListener("click", (e) => {
            e.preventDefault();
            modalHis.showModal();
        });
    }

    if (fecharHis && modalHis) {

        fecharHis.addEventListener("click", (e) => {
            e.preventDefault();
            modalHis.close();
        });
    }

    // TOTAIS FINANCEIROS
   
    function atualizarTotais() {

        let totalDespesas = 0;
        let totalReceitas = 0;

        // Despesas pendentes
        usuarioLogado.contas.forEach(conta => {
            totalDespesas += Number(conta.valor);
        });

        // Despesas já pagas
        usuarioLogado.historico.forEach(conta => {
            totalDespesas += Number(conta.valor);
        });

        // Receitas cadastradas
        usuarioLogado.receitas.forEach(receita => {
            totalReceitas += Number(receita.valor);
        });

        // Saldo final
        const saldo = totalReceitas - totalDespesas;

        const elementoDespesas = document.getElementById("totalDespesas");
        const elementoReceitas = document.getElementById("totalReceitas");
        const elementoSaldo = document.getElementById("saldo");

        if (elementoDespesas) {
            elementoDespesas.textContent =
                `R$ ${totalDespesas.toFixed(2)}`;
        }

        if (elementoReceitas) {
            elementoReceitas.textContent =
                `R$ ${totalReceitas.toFixed(2)}`;
        }

        if (elementoSaldo) {
            elementoSaldo.textContent =
                `R$ ${saldo.toFixed(2)}`;
        }
    }

    // MENSAGEM DE LISTA VAZIA
   
    function atualizarMensagemSemContas() {

        if (!fundoContas) {
            return;
        }

        if (
            usuarioLogado.contas.length === 0 &&
            usuarioLogado.receitas.length === 0
        ) {

            fundoContas.style.display = "block";

        } else {

            fundoContas.style.display = "none";

        }
    }

    // ABRIR E FECHAR MODAL DE CADASTRO
   
    if (btnAdd) {

        btnAdd.addEventListener("click", () => {
            modalConta.showModal();
        });
    }

    if (fecharDespesa) {

        fecharDespesa.addEventListener("click", () => {

            modalConta.close();
            formConta.reset();

            spanConta.forEach((span, index) => {
                if (campo[index]) {
                    campo[index].style.border = "";
                }

                span.style.display = "none";
            });
        });
    }

    if (fecharReceita) {

        fecharReceita.addEventListener("click", () => {

            modalConta.close();
            formRec.reset();
        });
    }

    // FORMATAÇÃO DE DATAS
   
    function formatarData(data) {

        if (!data) {
            return "Não informada";
        }

        return data.split("-").reverse().join("/");
    }

    // EXIBIR DESPESA NA TELA
   
    function exibirContaTela(conta) {

        const contaDiv = document.createElement("div");

        contaDiv.classList.add("conta");
        contaDiv.id = String(conta.id);

        const titulo = document.createElement("h3");
        titulo.textContent = conta.nome;

        const abertura = document.createElement("p");
        abertura.textContent =
            `Abertura: ${formatarData(conta.abertura)}`;

        const vencimento = document.createElement("p");
        vencimento.textContent =
            `Vencimento: ${formatarData(conta.vencimento)}`;

        const valor = document.createElement("p");
        valor.textContent =
            `Valor: R$ ${Number(conta.valor).toFixed(2)}`;

        contaDiv.append(
            titulo,
            abertura,
            vencimento,
            valor
        );

        if (conta.status === "pendente") {

            const botaoPago = document.createElement("button");

            botaoPago.type = "button";
            botaoPago.textContent = "Pago";
            botaoPago.dataset.pago = String(conta.id);

            contaDiv.appendChild(botaoPago);

        } else {
            
            const mensagemPago = document.createElement("p");
            mensagemPago.textContent = "✓ Pago";

            contaDiv.appendChild(mensagemPago);
        }

        listaContas.appendChild(contaDiv);
    }

    // EXIBIR RECEITA NA TELA
   
    function exibirReceitaTela(receita) {

        const receitaDiv = document.createElement("div");

        receitaDiv.classList.add("conta", "receita");
        receitaDiv.id = String(receita.id);

        const titulo = document.createElement("h3");
        titulo.textContent = receita.nome;

        const tipo = document.createElement("p");
        tipo.textContent = "Tipo: Receita";

        const valor = document.createElement("p");
        valor.textContent =
            `Valor: R$ ${Number(receita.valor).toFixed(2)}`;

        const cadastro = document.createElement("p");
        cadastro.textContent =
            `Cadastro: ${receita.dataCadastro}`;

        receitaDiv.append(
            titulo,
            tipo,
            valor,
            cadastro
        );

        listaContas.appendChild(receitaDiv);
    }

    // CARREGAR DESPESAS E RECEITAS
   
    function carregarContas() {

        listaContas.innerHTML = "";

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

    // VALIDAÇÃO DOS CAMPOS

    function setError(index) {

        if (!campo[index] || !spanConta[index]) {
            return;
        }

        campo[index].style.border = "2px solid red";
        spanConta[index].style.display = "block";
    }

    function tiraErro(index) {

        if (!campo[index] || !spanConta[index]) {
            return;
        }

        campo[index].style.border = "";
        spanConta[index].style.display = "none";
    }

    function valNome() {

        if (campo[0].value.trim() === "") {
            setError(0);
            return false;
        } else {
            tiraErro(0);
            return true;
        }
    }

    function valValor() {

        const valor = Number(campo[1].value);

        if (
            campo[1].value.trim() === "" ||
            !Number.isFinite(valor) ||
            valor <= 0
        ) {
            setError(1);
            return false;

        } else {
            tiraErro(1);
            return true;
        }
    }

    function valDataAber() {

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

    function valDataVenc() {

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

    // VALIDAÇÃO ENTRE AS DATAS

    function valDatas() {

        if (checkVenci.checked) {
            return true;
        }

        const dataAbertura = campoAbertura.value;
        const dataVencimento = campoVencimento.value;

        if (!dataAbertura || !dataVencimento) {
            return true;
        }

        if (dataAbertura === dataVencimento) {
            setError(2);
            setError(3);
            spanConta[2].textContent = "Datas iguais";
            spanConta[3].textContent = "Datas iguais";
            return false;
        }

        if (dataAbertura > dataVencimento) {
            setError(3);
            spanConta[3].textContent =
                "Data de vencimento é anterior à abertura";
            return false;
        }

        tiraErro(2);
        tiraErro(3);

        return true;
    }

    // CADASTRAR DESPESA
   
    formConta.addEventListener("submit", (e) => {

        e.preventDefault();

        const nomeConta = document.getElementById("nome").value.trim();

        const valorConta = Number(
            document.getElementById("valor").value
        );

        const dataAbertura = campoAbertura.value;
        const dataVencimento = campoVencimento.value;

        // Executa todas as validações
        const validacoes = [
            valNome(),
            valValor(),
            valDataAber(),
            valDataVenc(),
            valDatas()
        ];

        const formValido = validacoes.every(resultado => resultado);

        if (!formValido) {
            return;
        }

        // Cria a nova despesa
        const novaConta = {

            id: Date.now(),
            nome: nomeConta,
            valor: valorConta,
            abertura: checkVenci.checked ? "" : dataAbertura,
            vencimento: checkVenci.checked ? "" : dataVencimento,
            status: "pendente"
        };

        // Adiciona ao usuário
        usuarioLogado.contas.push(novaConta);

        salvarUsuario();

        // Atualiza a tela
        exibirContaTela(novaConta);

        atualizarMensagemSemContas();
        atualizarTotais();

        // Fecha e limpa o formulário
        modalConta.close();
        formConta.reset();

        spanConta.forEach((span, index) => {
            span.style.display = "none";

            if (campo[index]) {
                campo[index].style.border = "";
            }
        });
    });
   
    // EXIBIR HISTÓRICO NA TELA
   
    function exibirHistoricoTela(conta) {

        const item = document.createElement("div");

        item.classList.add("itemHistorico");

        const titulo = document.createElement("h3");
        titulo.textContent = conta.nome;

        const valor = document.createElement("p");
        valor.textContent =
            `Valor: R$ ${Number(conta.valor).toFixed(2)}`;

        const abertura = document.createElement("p");
        abertura.textContent =
            `Abertura: ${formatarData(conta.abertura)}`;

        const vencimento = document.createElement("p");
        vencimento.textContent =
            `Vencimento: ${formatarData(conta.vencimento)}`;

        const pagamento = document.createElement("p");
        pagamento.textContent =
            `Pagamento: ${conta.dataPagamento}`;

        item.append(
            titulo,
            valor,
            abertura,
            vencimento,
            pagamento
        );

        listaHistorico.appendChild(item);
    }
   
    // CARREGAR HISTÓRICO
   
    function carregarHistorico() {

        listaHistorico.innerHTML = "";

        usuarioLogado.historico.forEach(conta => {
            exibirHistoricoTela(conta);
        });
    }

    // 21. MARCAR DESPESA COMO PAGA

    function pagoConta(idConta) {

        const indiceConta = usuarioLogado.contas.findIndex(
            conta => Number(conta.id) === Number(idConta)
        );

        if (indiceConta === -1) {
            return;
        }

        const conta = usuarioLogado.contas[indiceConta];

        const contaHistorico = {
            ...conta,
            status: "pago",
            dataPagamento: new Date().toLocaleDateString("pt-BR")
        };

        // Adiciona ao histórico
        usuarioLogado.historico.push(contaHistorico);

        // Remove das despesas pendentes
        usuarioLogado.contas.splice(indiceConta, 1);

        salvarUsuario();

        // Atualiza as listas
        carregarContas();
        carregarHistorico();
    }


    // Evento para os botões de pagamento
    listaContas.addEventListener("click", (e) => {

        const botao = e.target.closest("button[data-pago]");

        if (!botao) {
            return;
        }

        const idConta = Number(botao.dataset.pago);

        pagoConta(idConta);
    });

    // ALTERNAR ENTRE DESPESA E RECEITA

    if (btnReceita && btnDespesa) {

        btnReceita.addEventListener("click", () => {

            formConta.hidden = true;
            formRec.hidden = false;

            btnReceita.style.backgroundColor = "rgb(37, 197, 37)";
            btnReceita.style.color = "white";

            btnDespesa.style.backgroundColor = "rgb(219, 93, 93)";
            btnDespesa.style.color = "black";
        });


        btnDespesa.addEventListener("click", () => {

            formRec.hidden = true;
            formConta.hidden = false;

            btnDespesa.style.backgroundColor = "rgb(206, 63, 63)";
            btnDespesa.style.color = "white";

            btnReceita.style.backgroundColor = "#22c55e";
            btnReceita.style.color = "black";
        });
    }

    // CADASTRAR RECEITA

    formRec.addEventListener("submit", (e) => {

        e.preventDefault();

        const nome = nomeRec.value.trim();
        const valor = Number(valorRec.value);

        // Validação
        if (
            nome === "" ||
            !Number.isFinite(valor) ||
            valor <= 0
        ) {

            alert("Preencha corretamente o nome e o valor da receita.");

            return;
        }

        // Cria da receita
        const novaReceita = {
            id: Date.now(),
            nome: nome,
            valor: valor,
            dataCadastro: new Date().toLocaleDateString("pt-BR")
        };

        // Adiciona ao usuário
        usuarioLogado.receitas.push(novaReceita);

        salvarUsuario();

        // Atualiza a tela
        exibirReceitaTela(novaReceita);

        atualizarMensagemSemContas();
        atualizarTotais();

        // Fecha e limpa o formulário
        modalConta.close();
        formRec.reset();
    });

    // OPÇÃO DE DESPESA SEM DATA
  
    if (checkVenci) {

        const elementosData = [
            document.querySelector('label[for="abertura"]'),
            campoAbertura,
            campoAbertura.nextElementSibling,
            document.querySelector('label[for="vencimento"]'),
            campoVencimento,
            campoVencimento.nextElementSibling
        ];

        checkVenci.addEventListener("change", () => {

            elementosData.forEach(elemento => {

                if (elemento) {
                    elemento.classList.toggle(
                        "oculto",
                        checkVenci.checked
                    );
                }
            });

            if (checkVenci.checked) {
                tiraErro(2);
                tiraErro(3);
            }
        });
    }

    carregarContas();
    carregarHistorico();

}

iniciarFinanceiro();
