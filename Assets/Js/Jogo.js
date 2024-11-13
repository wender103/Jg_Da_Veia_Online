let estadoJogo = Array(9).fill(null)
let Jogo_Acabou = false

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
            console.log("Não é sua vez!") // ! Não é a vez do usuário
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
            if (resultado) {
                if (resultado.vencedor !== undefined) {
                    // alert(`O jogador ${resultado.vencedor === 0 ? 'X' : 'O'} venceu!`)
                    let Num_Jogador = Sala_Atual.Criador == Usuario.email ? 0 : 1
                    Img_Resultado_Partida.classList.add('Active')
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
                }
            }
        } else {
            console.log(`Posição ${Posicao} já marcada!`) // * Posição já marcada
        }
    }
}

// Função para verificar se alguém ganhou ou deu velha
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

        // Verifica se há uma linha completa com o mesmo jogador
        if (estadoJogo[a] !== null && estadoJogo[a] === estadoJogo[b] && estadoJogo[a] === estadoJogo[c]) {
            Jogo_Acabou = true
            document.getElementById('Container_Estrutura_Jogo_Da_Veia').classList.add('Fim')
            return { vencedor: estadoJogo[a] } // Retorna o jogador vencedor (0 ou 1)
        }
    }

    // Verifica se todas as posições estão preenchidas (deu velha)
    const deuVelha = estadoJogo.every(posicao => posicao !== null)
    if (deuVelha) {
        document.getElementById('Container_Estrutura_Jogo_Da_Veia').classList.add('Fim')
        Jogo_Acabou = true
        return { velha: true } // Retorna um objeto indicando que deu velha
    }

    return null // Retorna null se não houve vitória nem deu velha
}

// Função para reiniciar o jogo
function Reiniciar_JogoDaVelha(Desmarcar_Reiniciar) {
    estadoJogo = Array(9).fill(null) // Reinicia o estado do jogo
    Sala_Atual.Jogadas.Movimentos = [] // Limpa os movimentos salvos
    Sala_Atual.Jogadas.Vez_De = Sala_Atual.Criador // Define o criador como o primeiro a jogar
    Img_Resultado_Partida.style.display = 'none'
    Btn_Jogar_Novamente.style.display = 'none'
    P_Jogar_Novamente.style.display = 'none'
    document.getElementById('Container_Estrutura_Jogo_Da_Veia').classList.remove('Fim')
    Jogo_Acabou = false

    if(Usuario.email == Sala_Atual.Criador) {
        db.collection('Salas').doc(Sala_Atual.Criador).update({
            'Jogadas.Movimentos': [],
            'Jogadas.Vez_De': Sala_Atual.Criador,
            'Reiniciar_Jogo': true
        })
    } else if(Desmarcar_Reiniciar) {
        db.collection('Salas').doc(Sala_Atual.Criador).update({ Reiniciar_Jogo: false })
    }

    Inicializar_JogoDaVelha() // Redesenha o tabuleiro
}

Btn_Jogar_Novamente.addEventListener('click', () => {
    Reiniciar_JogoDaVelha()
})