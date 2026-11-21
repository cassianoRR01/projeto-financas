// Login antigo agr inutil ractico lixo feio horrivel eca

const formLogin = document.getElementById('formLogin')
const spanEmail = document.getElementById('spanLogin')
const spanSenha = document.getElementById('spanSenha')
const spanSucesso = document.getElementById('spanLoginSucesso')

const camposL = document.querySelectorAll('.campoLog')
const spanL = document.querySelectorAll('.spanLogin')

function setErrorL(index){
    camposL[index].style.border = '2px solid red';
    spanL[index].style.display = 'block';
}

function tiraErroL(index){
    camposL[index].style.border = '';
    spanL[index].style.display = 'none';
}

formLogin.addEventListener("submit", (e) =>{
    e.preventDefault()
    
    const emailLogin = document.getElementById('emailLogin').value
    const senhaLogin = document.getElementById('senhaLogin').value
    
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

    const usuarioEncontrado = usuarios.find(usuario => usuario.emailUser === emailLogin);

    if(!usuarioEncontrado){
        setErrorL(0)
        return false;
    } 

    tiraErroL(0)


    if(usuarioEncontrado.senha !== senhaLogin){
        setErrorL(1)
        return false;
    }
    
    tiraErroL(1)
       
    localStorage.setItem('usuarioLogado', JSON.stringify(usuarioEncontrado));
    spanSucesso.style.display = 'block';
})