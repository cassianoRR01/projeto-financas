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

    // Objeto do usuário baseado na sessão PHP
    const usuarioLogado = {
        id_usuario: usuarioSessao.id_usuario,
        nomeUser: usuarioSessao.nome,
        emailUser: usuarioSessao.email,

        // Os dados serão carregados pelo MariaDB
        contas: [],
        historico: [],
        receitas: []
    };

    function mostrarNotificacao(tipo, titulo, mensagem, duracao = 4000) {

        const area = document.getElementById("areaNotificacoes");

        if (!area) {
            console.error("Área de notificações não encontrada.");
            return;
        }

        const icones = {
            sucesso: "",
            erro: "",
            aviso: "",
            info: ""
        };

        if (!Object.hasOwn(icones, tipo)) {
            tipo = "info";
        }

        const notificacao = document.createElement("div");
        notificacao.classList.add("notificacao", tipo);

        const icone = document.createElement("span");
        icone.classList.add("notificacaoIcone");
        icone.textContent = icones[tipo];

        const conteudo = document.createElement("div");
        conteudo.classList.add("notificacaoConteudo");

        const tituloElemento = document.createElement("h3");
        tituloElemento.textContent = titulo;

        const mensagemElemento = document.createElement("p");
        mensagemElemento.textContent = mensagem;

        const fechar = document.createElement("button");
        fechar.classList.add("fecharNotificacao");
        fechar.textContent = "×";
        fechar.setAttribute("aria-label", "Fechar notificação");

        conteudo.append(tituloElemento, mensagemElemento);
        notificacao.append(icone, conteudo, fechar);

        area.appendChild(notificacao);

        let temporizador;

        function removerNotificacao() {
            if (notificacao.classList.contains("saindo")) return;

            clearTimeout(temporizador);

            notificacao.classList.add("saindo");

            notificacao.addEventListener("animationend", () => {
                notificacao.remove();
            }, { once: true });

            // Garante a remoção caso animações estejam desativadas.
            setTimeout(() => notificacao.remove(), 300);
            }

            fechar.addEventListener("click", removerNotificacao);

            if (duracao > 0) {
                temporizador = setTimeout(removerNotificacao, duracao);
            }
    }   

    // PARADAS DO HTML
   
    const BtnLogin = document.getElementById("btnLogin");
    const loginDialog = document.getElementById("loginDialog");
    const infoUsuario = document.getElementById("infoUsuario");
    const fecharLogin = document.getElementById("fecharLogin");

    const btnExcluirConta = document.getElementById("excluirContaBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const dialogConfirmarLogout = document.getElementById("dialogConfirmarLogout");

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

    // dialog adm

    const perfilAdm = document.getElementById("dialogPerfilAdm");
    const btnAdm = document.getElementById("btnAdm");
    const fecharAdm = document.getElementById("fecharAdm");
    const totalUsuariosAdm = document.getElementById("totalUsuariosAdm");
    const estadoUsuariosAdm = document.getElementById("estadoUsuariosAdm");
    const listaUsuariosAdm = document.getElementById("listaUsuariosAdm");

    async function verificarPerfilAdm() {
        try {
            const resposta = await fetch("../php/usuarios/verificar_sessao.php");
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

            mostrarNotificacao(
                "info",
                "Recurso indisponível",
                "A exclusão da conta ainda precisa ser implementada no PHP e no banco de dados."
            );

        });
    }
   

    // MODAL DE CONFIRMAÇÃO DE LOGOUT

    function confirmarLogout() {

        return new Promise(resolve => {
            // Aguarda o fechamento da modal
            dialogConfirmarLogout.addEventListener("close", () => {
                // Retorna true somente se o usuário confirmou
                resolve(dialogConfirmarLogout.returnValue === "confirmar");
            }, { once: true });

            dialogConfirmarLogout.showModal();

        });
    }

    // LOGOUT

    if (logoutBtn) {

        logoutBtn.addEventListener("click", async (e) => {
            e.preventDefault();

            // Abre a modal e aguarda a decisão
            const confirmar = await confirmarLogout();

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

                console.log("Resposta do logout:", resultado);

                if (!resposta.ok || !resultado.sucesso) {
                    mostrarNotificacao(
                        "erro",
                        "Erro ao sair",
                        "Não foi possível encerrar sua sessão."
                    );
                    return;
                }

                // Redireciona para o login
                window.location.replace(
                    "/projeto-financas/paginas/login.html"
                );

            } catch (erro) {

                console.error("Erro ao realizar logout:", erro);
                mostrarNotificacao(
                    "erro",
                    "Erro de conexão",
                    "Não foi possível conectar ao servidor para encerrar sua sessão."
                );
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
   
    // Busca movimentações no Banco
    async function carregarMovimentacoes() {

        try {
            const resposta = await fetch(
                "../php/movimentacoes/listar.php"
            );

            const resultado = await resposta.json();

            if (!resposta.ok || !resultado.sucesso) {
                throw new Error(
                    resultado.mensagem || "Erro ao carregar movimentações."
                );
            }

            // Limpa os arrays antes de carregar os dados
            usuarioLogado.contas = [];
            usuarioLogado.historico = [];
            usuarioLogado.receitas = [];

            // Percorre todas as movimentações retornadas pelo PHP
            resultado.movimentacoes.forEach(movimentacao => {

                const registro = {
                    id: Number(movimentacao.id_movimentacao),
                    nome: movimentacao.nome,
                    valor: Number(movimentacao.valor),
                    abertura: movimentacao.data_abertura || "",
                    vencimento: movimentacao.data_vencimento || "",
                    status: movimentacao.status,
                    dataPagamento: movimentacao.data_pagamento ? formatarData(movimentacao.data_pagamento) : ""
                };

                // Separa as movimentações por tipo e situação
                if (movimentacao.tipo === "despesa") {

                    if (movimentacao.status === "paga") {
                        usuarioLogado.historico.push(registro);
                    } else {
                        usuarioLogado.contas.push(registro);
                    }

                } else if (movimentacao.tipo === "receita") {

                    const dataCadastro = movimentacao.data_criacao
                        ? formatarData(movimentacao.data_criacao.split(" ")[0])
                        : "Não informado";

                    usuarioLogado.receitas.push({
                        ...registro,
                        dataCadastro: dataCadastro
                    });
                }
            });

            console.log("Movimentações carregadas:", {
                despesas: usuarioLogado.contas,
                historico: usuarioLogado.historico,
                receitas: usuarioLogado.receitas
            });

        } catch (erro) {

            console.error("Erro ao carregar movimentações:", erro);
            alert(
                "Não foi possível carregar seus dados financeiros."
            );

        }

    }

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

    formConta.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nomeConta = document.getElementById("nome").value.trim();
        const valorConta = Number(
            document.getElementById("valor").value
        );

        const dataAbertura = campoAbertura.value;
        const dataVencimento = campoVencimento.value;

        // Executa as validações existentes
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

        // Dados que serão enviados ao PHP
        const novaDespesa = {
            nome: nomeConta,
            valor: valorConta,
            tipo: "despesa",
            abertura: checkVenci.checked ? "" : dataAbertura,
            vencimento: checkVenci.checked ? "" : dataVencimento
        };

        try {

            // Envia os dados para o PHP
            const resposta = await fetch(
                "../php/movimentacoes/cadastrar.php",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(novaDespesa)
                }
            );

           const resultado = await resposta.json();

            // Verifica se o cadastro foi realizado
            if (!resposta.ok || !resultado.sucesso) {

                mostrarNotificacao(
                    "erro",
                    "Erro ao cadastrar despesa",
                    resultado.mensagem || "Não foi possível cadastrar sua despesa."
                );
                return;
            }

            // Cria o objeto utilizando o ID gerado pelo MariaDB
            const contaCadastrada = {
                id: Number(resultado.id_movimentacao),
                nome: nomeConta,
                valor: valorConta,
                abertura: novaDespesa.abertura,
                vencimento: novaDespesa.vencimento,
                status: "pendente"
            };

            // Atualiza os dados em memória
            usuarioLogado.contas.push(contaCadastrada);

            // Atualiza a interface
            exibirContaTela(contaCadastrada);

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

            mostrarNotificacao(
                "sucesso",
                "Despesa cadastrada!",
                resultado.mensagem || "Sua despesa foi salva com sucesso."
            );

        } catch (erro) {
            console.error("Erro ao cadastrar despesa:", erro);
            alert("Não foi possível conectar ao servidor.");
        }

    });

    listaContas.addEventListener("click", (e) => {
        const botao = e.target.closest("button[data-pago]");

        if (!botao) {
            return;
        }
        
        const idConta = Number(botao.dataset.pago);
        pagoConta(idConta);
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

    async function pagoConta(idConta) {

        const indiceConta = usuarioLogado.contas.findIndex(
            conta => Number(conta.id) === Number(idConta)
        );

        if (indiceConta === -1) {
            return;
        }

        const conta = usuarioLogado.contas[indiceConta];

        try {

            const resposta = await fetch(
                "../php/movimentacoes/pagar.php",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        id_movimentacao: idConta
                    })
                }
            );

            const resultado = await resposta.json();

            if (!resposta.ok || !resultado.sucesso) {

                alert(
                    resultado.mensagem || "Não foi possível atualizar a despesa."
                );

                return;
            }

            // Converte a data do banco para o formato brasileiro
            const dataPagamento = resultado.data_pagamento
                .split("-")
                .reverse()
                .join("/");

            // Cria o registro do histórico
            const contaHistorico = {

                ...conta,

                status: "paga",

                dataPagamento: dataPagamento

            };

            // Adiciona ao histórico em memória
            usuarioLogado.historico.push(contaHistorico);

            // Remove das despesas pendentes em memória
            usuarioLogado.contas.splice(indiceConta, 1);

            // Atualiza a interface
            carregarContas();

            carregarHistorico();

            atualizarTotais();

            mostrarNotificacao(
                "sucesso",
                "Despesa paga!",
                "A despesa foi movida para seu histórico de pagamentos."
            );

        } catch (erro) {

            console.error("Erro ao pagar despesa:", erro);

            alert("Não foi possível conectar ao servidor.");

        }
    }

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

    formRec.addEventListener("submit", async (e) => {

        e.preventDefault();

        const nome = nomeRec.value.trim();
        const valor = Number(valorRec.value);

        // Validação
        if (
            nome === "" ||
            !Number.isFinite(valor) ||
            valor <= 0
        ) {
            mostrarNotificacao(
                "aviso",
                "Dados inválidos",
                "Preencha corretamente o nome e o valor da receita."
            );
            return;
        }

        // Dados enviados ao PHP
        const novaReceita = {
            nome: nome,
            valor: valor,
            tipo: "receita"
        };

        try {

            const resposta = await fetch(
                "../php/movimentacoes/cadastrar.php",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(novaReceita)
                }
            );

            const resultado = await resposta.json();

            if (!resposta.ok || !resultado.sucesso) {
                alert(
                    resultado.mensagem || "Não foi possível cadastrar a receita."
                );
                return;
            }

            // Cria o objeto utilizando o ID
            const receitaCadastrada = {

                id: Number(resultado.id_movimentacao),
                nome: nome,
                valor: valor,
                dataCadastro: resultado.data_criacao
                    ? formatarData(resultado.data_criacao.split(" ")[0])
                    : new Date().toLocaleDateString("pt-BR")
            };

            // Atualiza os dados em memória
            usuarioLogado.receitas.push(receitaCadastrada);

            // Atualiza a interface
            exibirReceitaTela(receitaCadastrada);
            atualizarMensagemSemContas();
            atualizarTotais();

            // Fecha e limpa o formulário
            modalConta.close();
            formRec.reset();
            mostrarNotificacao(
                "sucesso",
                "Receita cadastrada!",
                resultado.mensagem || "Sua receita foi salva com sucesso."
            );

        } catch (erro) {

            console.error("Erro ao cadastrar receita:", erro);
            alert("Não foi possível conectar ao servidor.");

        }

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

    await carregarMovimentacoes();

    carregarContas();
    carregarHistorico();

}

iniciarFinanceiro();
