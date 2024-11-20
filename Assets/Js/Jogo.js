let estadoJogo = Array(9).fill(null)
let Jogo_Acabou = false
const P_Sua_Vez_Aviso = document.getElementById('P_Sua_Vez_Aviso')

// Função para inicializar o tabuleiro
function Inicializar_JogoDaVelha() {
    const container = document.getElementById('Container_Estrutura_Jogo_Da_Veia')
    container.innerHTML = '' // Limpa o tabuleiro

    // Cria as células do jogo
    for (let i = 0; i < 9; i++) {
        const celula = document.createElement('div')
        celula.classList.add('celula')
        celula.addEventListener('click', () => Marcar_Posicao(i, Sala_Atual.Criador == Usuario.email ? 0 : 1, false, true))
        container.appendChild(celula)
    }

    P_Sua_Vez_Aviso.style.display = 'block'
}

const P_Jogar_Novamente = document.getElementById('P_Jogar_Novamente')
const Btn_Jogar_Novamente = document.getElementById('Btn_Jogar_Novamente')
const Img_Resultado_Partida = document.getElementById('Img_Resultado_Partida')
// Função para marcar uma posição
// Atualiza a função de marcar posição para verificar a vitória após cada jogada
function Marcar_Posicao(Posicao, Jogador, Checar = false, Salvar = false) {
    if(!Jogo_Acabou) {

        const container = document.getElementById('Container_Estrutura_Jogo_Da_Veia')
        const celula = container.children[Posicao]

        if (Sala_Atual.Jogadas.Vez_De !== Usuario.email) {
             // ! Não é a vez do usuário
            return
        }

        if (Checar) {
            return estadoJogo[Posicao] !== null 
                ? { posicao: Posicao, marcado: true, jogador: estadoJogo[Posicao] } 
                : { posicao: Posicao, marcado: false }
        }

        if (estadoJogo[Posicao] === null) {
            estadoJogo[Posicao] = Jogador
            celula.innerText = Jogador === 0 ? 'X' : 'O'
            celula.classList.add('marcado')

            if (Salvar && !Checar) {
                Sala_Atual.Jogadas.Movimentos.push({
                    Posicao: Posicao,
                    Jogador: Jogador
                })

                db.collection('Salas').doc(Sala_Atual.Criador).update({
                    'Jogadas.Movimentos': Sala_Atual.Jogadas.Movimentos,
                    'Jogadas.Vez_De': Jogador === 0 ? Sala_Atual.Oponente : Sala_Atual.Criador
                })
            }

            // Checa se houve vitória ou deu velha
            const resultado = Checar_Vitoria()
            let Num_Jogador = Sala_Atual.Criador == Usuario.email ? 0 : 1
            if (resultado) {
                if (resultado.vencedor !== undefined) {
                    // alert(`O jogador ${resultado.vencedor === 0 ? 'X' : 'O'} venceu!`)
                    Img_Resultado_Partida.classList.add('Active')
                    P_Sua_Vez_Aviso.style.display = 'none'
                    Img_Resultado_Partida.src = Num_Jogador == resultado.vencedor ? 'Assets/Imgs/Icons/Win.png' : 'Assets/Imgs/Icons/Lose.png'

                    if(Usuario.email == Sala_Atual.Criador) {
                        Btn_Jogar_Novamente.style.display = 'block'
                        P_Jogar_Novamente.style.display = 'none'
                    } else {
                        Btn_Jogar_Novamente.style.display = 'none'
                        P_Jogar_Novamente.style.display = 'block'
                    }

                    Img_Resultado_Partida.style.display = 'block'

                    if(Sala_Atual.Criador == Usuario.email) {
                        const Pontos = Sala_Atual.Pontos

                        if(resultado.vencedor == 0) {
                            Pontos.Player1 += 1
                        } else {
                            Pontos.Player2 += 1
                        }

                        db.collection('Salas').doc(Sala_Atual.Criador).update({ Pontos })
                    }

                } else if (resultado.velha) {
                    // alert("Deu velha!")
                    if(Usuario.email == Sala_Atual.Criador) {
                        Btn_Jogar_Novamente.style.display = 'block'
                        P_Jogar_Novamente.style.display = 'none'
                    } else {
                        Btn_Jogar_Novamente.style.display = 'none'
                        P_Jogar_Novamente.style.display = 'block'
                    }

                    Img_Resultado_Partida.src = 'Assets/Imgs/Icons/Draw.png'
                    Img_Resultado_Partida.style.display = 'block'
                    P_Sua_Vez_Aviso.style.display = 'none'

                }
            } else {
                P_Sua_Vez_Aviso.style.display = 'block'

                if(Num_Jogador != Jogador) {
                    P_Sua_Vez_Aviso.innerText = 'Sua Vez'
                } else {
                    P_Sua_Vez_Aviso.innerText = 'Vez Do Oponente'
                }
            }
        } else {
             // * Posição já marcada
        }
    }
}

// Função para verificar se alguém ganhou ou deu velha
let Ultimo_Resultado = undefined
function Checar_Vitoria() {
    const linhasVitoria = [
        [0, 1, 2], // Linha superior
        [3, 4, 5], // Linha do meio
        [6, 7, 8], // Linha inferior
        [0, 3, 6], // Coluna esquerda
        [1, 4, 7], // Coluna do meio
        [2, 5, 8], // Coluna direita
        [0, 4, 8], // Diagonal principal
        [2, 4, 6]  // Diagonal secundária
    ]

    for (const linha of linhasVitoria) {
        const [a, b, c] = linha
        if (estadoJogo[a] !== null && estadoJogo[a] === estadoJogo[b] && estadoJogo[a] === estadoJogo[c]) {
            Jogo_Acabou = true
            document.getElementById('Container_Estrutura_Jogo_Da_Veia').classList.add('Fim')
            Ultimo_Resultado = { vencedor: estadoJogo[a] } // Armazena o resultado da �ltima vitória
            return { vencedor: estadoJogo[a] } // Retorna o jogador vencedor (0 ou 1)
        }
    }

    const deuVelha = estadoJogo.every(posicao => posicao !== null)
    if (deuVelha) {
        document.getElementById('Container_Estrutura_Jogo_Da_Veia').classList.add('Fim')
        Jogo_Acabou = true
        Ultimo_Resultado = { velha: true } // Armazena o resultado da �ltima velha
        return { velha: true } // Retorna um objeto indicando que deu velha
    }

    return null // Retorna null se não houve vitória nem deu velha
}

// Função para reiniciar o jogo
function Reiniciar_JogoDaVelha(Desmarcar_Reiniciar) {
    estadoJogo = Array(9).fill(null)
    Img_Resultado_Partida.style.display = 'none'
    Btn_Jogar_Novamente.style.display = 'none'
    P_Jogar_Novamente.style.display = 'none'
    document.getElementById('Container_Estrutura_Jogo_Da_Veia').classList.remove('Fim')
    Jogo_Acabou = false

    let proxJogador
    if (Usuario.email === Sala_Atual.Criador) {
        // Define o próximo jogador baseado no resultado do último jogo
        const resultado = Ultimo_Resultado
        
        if (resultado.vencedor !== undefined) {            
            // Se houve um vencedor, o próximo jogador será o vencedor
            proxJogador = resultado.vencedor === 0 ? Sala_Atual.Criador : Sala_Atual.Oponente
        } else if (resultado.velha) {
            proxJogador = Sala_Atual.Jogadas.Vez_De
        } else {            
            // Se ainda não houver resultado, define o próximo jogador como o criador da sala
            proxJogador = Sala_Atual.Criador
        }

        db.collection('Salas').doc(Sala_Atual.Criador).update({
            'Jogadas.Movimentos': [],
            'Jogadas.Vez_De': proxJogador,
            'Reiniciar_Jogo': true
        })

    } else if (Desmarcar_Reiniciar) {
        db.collection('Salas').doc(Sala_Atual.Criador).update({ Reiniciar_Jogo: false })
    }

    Inicializar_JogoDaVelha()
}

Btn_Jogar_Novamente.addEventListener('click', () => {
    Reiniciar_JogoDaVelha()
})