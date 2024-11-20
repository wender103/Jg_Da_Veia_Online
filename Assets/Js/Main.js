let Pagina_Atual = {
    ID: undefined,
    Classe: undefined
}

let Sala_Atual = undefined

function Abrir_Divs_Opcs(_Divs_Opcs) {
    if(Usuario) {
        _Divs_Opcs = _Divs_Opcs.replace('Btn_', '')
        
        let Todas_As_Divs_Opcs = document.querySelectorAll('.Divs_Opcs')

        Todas_As_Divs_Opcs.forEach(Divs_Opcs => {
            Divs_Opcs.classList.remove('Active')
        })

        document.getElementById(_Divs_Opcs).classList.add('Active')

        Pagina_Atual.ID = _Divs_Opcs
        Pagina_Atual.Classe = document.getElementById(_Divs_Opcs).classList.value

        if(_Divs_Opcs != 'Container_Opcs_Inicio') {
            document.getElementById('Btn_Voltar').classList.add('Active')
        } else {
            document.getElementById('Btn_Voltar').classList.remove('Active')
        }
    } else {
        Fazer_Login()
    }
}

function CopiarParaAreaDeTransferencia(texto) {
    navigator.clipboard.writeText(texto)
        .then(() => {
            console.log('Texto copiado para a área de transferência!') // * Confirmação de cópia
        })
        .catch(err => {
            console.error('Erro ao copiar o texto:', err) // ! Erro ao copiar
        })
}


document.getElementById('Btn_Container_Entrar_Em_Sala').addEventListener('click', () => {
    Carregar_Salas_Criadas()
})

const Codigo_Da_Sala = document.getElementById('Codigo_Da_Sala')

Codigo_Da_Sala.addEventListener('click', () => {
    CopiarParaAreaDeTransferencia(Codigo_Da_Sala.innerText)
})

function Voltar_Pagina() {
    if(Pagina_Atual.ID == 'Container_Jogo_Da_Veia' || Pagina_Atual.ID == 'Container_Esperando') {
        if(Sala_Atual.Criador == Usuario.email) {
            Excluir_Sala()
        } else {
            Adversario_Saiu_Da_Sala()
        }
    }

    if(Pagina_Atual.Classe.includes('Divs_Opcs')) {
        Abrir_Divs_Opcs('Container_Opcs_Inicio')
    } else {
        
    }
}

function Criar_Sala() {
    const Input_Nome_Da_Nova_Sala = document.getElementById('Input_Nome_Da_Nova_Sala')

    if(Input_Nome_Da_Nova_Sala.value.trim() != '') {
        Abrir_Divs_Opcs('Container_Esperando')

        const Nova_Sala = {
            Nome: Input_Nome_Da_Nova_Sala.value,
            Criador: Usuario.email,
            Is_Publica: document.getElementById('Checkbox_Sala_Publica').checked,
            Oponente: null,
            Codigo: db.collection('Salas').doc().id,
            Jogadas: {
                Vez_De: Usuario.email,
                Movimentos: []
            },
            Reiniciar_Jogo: false,
            Pontos: {
                Player1: 0,
                Player2: 0
            },
        }

        Codigo_Da_Sala.innerText = Nova_Sala.Codigo

        db.collection('Salas').doc(Usuario.email).set(Nova_Sala).then(() => {
            Input_Nome_Da_Nova_Sala.value = ''
            document.getElementById('Checkbox_Sala_Publica').checked = false
            Listner_Sala(Nova_Sala.Criador)
        })
    }
}

function Excluir_Sala() {
    db.collection('Salas').doc(Usuario.email).delete()
    Sala_Atual = undefined
}

const Container_Salas_Criadas = document.getElementById('Container_Salas_Criadas')
function Carregar_Salas_Criadas() {
    Container_Salas_Criadas.innerHTML = ''
    let Todas_As_Salas = []
    db.collection('Salas').get().then(Snapshot => {
        let Snapshot_Salas = Snapshot.docs

        Snapshot_Salas.forEach(Sala => {
            Todas_As_Salas.push(Sala.data())

            if(Sala.data().Is_Publica && !Sala.data().Oponente) {
                const Div_Sala = document.createElement('div')
                const Nome_Sala = document.createElement('p')

                Nome_Sala.innerText = Sala.data().Nome
                Div_Sala.classList.add('Salas')

                Div_Sala.appendChild(Nome_Sala)
                Container_Salas_Criadas.appendChild(Div_Sala)

                Div_Sala.addEventListener('click', () => {
                    Entrar_Na_Sala(Sala.data().Codigo)
                })
            }
        })
    })
}

const Btn_Atualizar_Salas = document.getElementById('Btn_Atualizar_Salas')

Btn_Atualizar_Salas.addEventListener('click', () => {
    // Verifica se o botão já está bloqueado
    if (Btn_Atualizar_Salas.classList.contains('Bloqueado')) return

    // Chama a função para carregar as salas
    Carregar_Salas_Criadas()

    // Bloqueia o botão e adiciona a classe "Bloqueado"
    Btn_Atualizar_Salas.classList.add('Bloqueado')
    Btn_Atualizar_Salas.disabled = true

    // Define o temporizador de 3 segundos para desbloquear
    setTimeout(() => {
        Btn_Atualizar_Salas.classList.remove('Bloqueado')
        Btn_Atualizar_Salas.disabled = false
    }, 3000)
})


const Input_Entrar_Sala_Pelo_Codigo = document.getElementById('Input_Entrar_Sala_Pelo_Codigo')
Input_Entrar_Sala_Pelo_Codigo.addEventListener('keypress', (e) => {
    if(e.key == 'Enter' && Input_Entrar_Sala_Pelo_Codigo.value.trim() != '') {
        Entrar_Na_Sala(Input_Entrar_Sala_Pelo_Codigo.value)
    }
})

function Entrar_Na_Sala(_Codigo_Sala) {
    db.collection('Salas').get().then(Snapshot =>  {
        let Snapshot_Salas = Snapshot.docs

        Snapshot_Salas.forEach(Sala => {
            if(Sala.data().Codigo == _Codigo_Sala) {
                if(Sala.data().Oponente) {
                    Abrir_Divs_Opcs('Container_Entrar_Em_Sala')
                    Carregar_Salas_Criadas()
                    alert('Alguém entrou na sala antes de você!')

                } else {
                    db.collection('Salas').doc(Sala.data().Criador).update({  
                        Oponente: Usuario.email
                    }).then(() => {
                        Listner_Sala(Sala.data().Criador)
                        document.getElementById('P_Sua_Vez_Aviso').innerText = 'Vez Do Oponente'
                    })
                }
            }
        })
    })
}

function Adversario_Saiu_Da_Sala() {
    db.collection('Salas').doc(Sala_Atual.Criador).update({
        Oponente: null,
        'Jogadas.Vez_De': Sala_Atual.Criador,
        'Jogadas.Movimentos': [],
        'Pontos.Player1': 0,
        'Pontos.Player2': 0
    }).then(() => {
        Sala_Atual = undefined
    })
}

function Listner_Sala(_Email_Sala) {
    db.collection('Salas').doc(_Email_Sala).onSnapshot(Snapshot => {
        if(Snapshot.exists) {
            const dadosSala = Snapshot.data()            
            
            if (dadosSala.Oponente) {
                //! Caso não esteja na pág do jogo da velha, vai para a pág do jogo da velha
                if (Pagina_Atual.ID != 'Container_Jogo_Da_Veia') {
                    Abrir_Divs_Opcs('Container_Jogo_Da_Veia')
                    Sala_Atual = dadosSala
                    Inicializar_JogoDaVelha()
                } else {
                    Sala_Atual = dadosSala // Atualiza a sala atual
                }
                
                // Atualiza os movimentos do oponente
                const movimentos = dadosSala.Jogadas.Movimentos
                movimentos.forEach((movimento, index) => {
                    // Checa se o movimento já está no estado local
                    if (estadoJogo[movimento.Posicao] === null) {
                        Marcar_Posicao(movimento.Posicao, movimento.Jogador, false, false) // Aplica o movimento do oponente
                    }
                })

                if(dadosSala.Reiniciar_Jogo && Usuario.email == dadosSala.Oponente) {
                    Reiniciar_JogoDaVelha(true)
                }

                document.getElementById('Valor_Placar_X').innerText = `: ${dadosSala.Pontos.Player1}`
                document.getElementById('Valor_Placar_O').innerText = `: ${dadosSala.Pontos.Player2}`
            } else {
                // Caso não tenha oponente, volta para a pág de espera
                if (Pagina_Atual.ID == 'Container_Jogo_Da_Veia') {
                    Abrir_Divs_Opcs('Container_Esperando')
                    Reiniciar_JogoDaVelha()
                    Sala_Atual = dadosSala
                }
            }

            if(Usuario.email == dadosSala.Jogadas.Vez_De) {
                P_Sua_Vez_Aviso.innerText = 'Sua Vez'
            } else {
                P_Sua_Vez_Aviso.innerText = 'Vez Do Oponente'
            }
        } else {
            if(Sala_Atual.Criador != Usuario.email) {
                Abrir_Divs_Opcs('Container_Entrar_Em_Sala')
                Carregar_Salas_Criadas()
            }
        }
    })
}

window.addEventListener('beforeunload', (event) => {
    // ? Aqui você pode chamar uma função para salvar algo, limpar dados, etc.
    if(Sala_Atual.Criador == Usuario.email) {
        Excluir_Sala() // Exemplo de função
    } else {
        Adversario_Saiu_Da_Sala()
    }
    Abrir_Divs_Opcs('Container_Opcs_Inicio')

    // * Essa mensagem só funciona em alguns navegadores
    event.preventDefault()
    event.returnValue = '' // Isso ajuda a exibir uma mensagem de confirmação no navegador
})