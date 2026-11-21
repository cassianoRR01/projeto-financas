// Login novo bonito bem feito (ou nao)


const formLogin = document.getElementById('formLogin');

const emailInput = document.getElementById('emailLogin');
const senhaInput = document.getElementById('senhaLogin');

const spanEmail = document.getElementById('spanLogin');
const spanSenha = document.getElementById('spanSenha');
const spanSucesso = document.getElementById('spanLoginSucesso');

const camposL = document.querySelectorAll('.campoLog');
const spanL = document.querySelectorAll('.spanLogin');

function setErrorL(index) {
    camposL[index].style.border = '2px solid red';
    spanL[index].style.display = 'block';
}

function tiraErroL(index) {
    camposL[index].style.border = '';
    spanL[index].style.display = 'none';
}

formLogin.addEventListener("submit", async(e) =>{
    e.preventDefault();

    tiraErroL(0);
    tiraErroL(1);

    spanSucesso.style.display = 'none';

    const email = emailInput.value.trim().toLowerCase();
    const senha = senhaInput.value;

    if(email === ""){
        spanEmail.textContent = "Informe seu email";
        setErrorL(0);
        return;
    }

    if(senha === ""){
        spanSenha.textContent = "Informe sua senha";
        setErrorL(1);
        return;
    }

    try{

        const resposta = await fetch("../php/usuarios/login.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email,
                senha: senha
            })
        });

        const resultado = await resposta.json();

        if(!resposta.ok || !resultado.sucesso) {
            spanSenha.textContent = resultado.mensagem || 'Não foi possível realizar o login.';
            setErrorL(1)
            return;
        }

        spanSucesso.textContent = resultado.mensagem;
        spanSucesso.style.display = 'block';
    } catch(erro){
        console.error("Erro ao realizar login:", erro);
        spanSenha.textContent = 'Não foi possível conectar ao servidor.';
        setErrorL(1);
    }
});