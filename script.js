/* ============================================================
   CIDADE & CAMPO — JAVASCRIPT PRINCIPAL
   Arquivo: script.js
   Descrição: Toda a lógica interativa do site:
              - Animações ao rolar a página
              - Contadores animados de estatísticas
              - Quiz interativo completo
   ============================================================ */

/* ============================================================
   1. ANIMAÇÕES AO ROLAR A PÁGINA (Scroll Animation)
   Usa IntersectionObserver para detectar quando os elementos
   entram na tela e adiciona a classe "visible" neles.
   ============================================================ */

// Seleciona todos os elementos que devem animar ao aparecer na tela
const elementosAnimados = document.querySelectorAll('[data-animate]');

// Configura o "observador" que monitora os elementos
const observador = new IntersectionObserver(
  function(entradas) {
    entradas.forEach(function(entrada) {
      // Se o elemento entrou na área visível da tela...
      if (entrada.isIntersecting) {
        entrada.target.classList.add('visible'); // Adiciona a classe que dispara a animação
        observador.unobserve(entrada.target);    // Para de observar (não precisa repetir)
      }
    });
  },
  {
    threshold: 0.15, // O elemento precisa estar 15% visível para acionar
    rootMargin: '0px 0px -40px 0px' // Ativa um pouco antes de chegar ao fundo
  }
);

// Registra cada elemento para ser observado
elementosAnimados.forEach(function(el) {
  observador.observe(el);
});

/* ============================================================
   2. CONTADOR ANIMADO DAS ESTATÍSTICAS
   Anima os números dos cards de estatísticas (0% → 70%, etc.)
   usando a API de Intersection Observer para iniciar quando
   os cards aparecem na tela.
   ============================================================ */

// Seleciona todos os números dos cards de estatísticas
const numerosEstatistica = document.querySelectorAll('.stat-number');

// Função que anima o número de 0 até o valor final
function animarContador(elemento) {
  const valorFinal = parseInt(elemento.getAttribute('data-target')); // Pega o valor alvo
  const duracao = 1800;    // Duração total da animação em ms
  const intervalo = 30;    // Atualiza a cada 30ms
  const passos = duracao / intervalo;
  const incremento = valorFinal / passos;
  let valorAtual = 0;

  const timer = setInterval(function() {
    valorAtual += incremento;
    if (valorAtual >= valorFinal) {
      valorAtual = valorFinal; // Garante que para no valor exato
      clearInterval(timer);    // Para o timer
    }
    elemento.textContent = Math.floor(valorAtual); // Atualiza o número na tela
  }, intervalo);
}

// Observador específico para os números das estatísticas
const observadorContador = new IntersectionObserver(
  function(entradas) {
    entradas.forEach(function(entrada) {
      if (entrada.isIntersecting) {
        animarContador(entrada.target);
        observadorContador.unobserve(entrada.target);
      }
    });
  },
  { threshold: 0.5 }
);

// Registra cada número para ser observado
numerosEstatistica.forEach(function(num) {
  observadorContador.observe(num);
});

/* ============================================================
   3. NAVEGAÇÃO SUAVE (Smooth Scroll)
   Ao clicar nos links do menu, a página rola suavemente
   até a seção correspondente.
   ============================================================ */

document.querySelectorAll('a[href^="#"]').forEach(function(link) {
  link.addEventListener('click', function(evento) {
    evento.preventDefault(); // Impede o salto brusco padrão

    const alvoId = this.getAttribute('href'); // Ex: "#quiz"
    const alvo = document.querySelector(alvoId);

    if (alvo) {
      // Calcula a posição considerando o header fixo
      const alturaHeader = document.querySelector('.header').offsetHeight;
      const posicaoAlvo = alvo.getBoundingClientRect().top + window.pageYOffset - alturaHeader - 20;

      window.scrollTo({
        top: posicaoAlvo,
        behavior: 'smooth'
      });
    }
  });
});

/* ============================================================
   4. QUIZ INTERATIVO
   Gerencia toda a lógica do quiz:
   - Exibir perguntas e alternativas
   - Verificar respostas
   - Controlar pontuação
   - Mostrar resultado final
   ============================================================ */

/* ---------- 4.1 BANCO DE PERGUNTAS ---------- */

// Array com as 10 perguntas do quiz
// Cada pergunta tem: texto, 4 opções e o índice da correta (0 a 3)
const perguntas = [
  {
    texto: '🌾 De onde vem a maior parte dos alimentos que as pessoas consomem nas cidades brasileiras?',
    opcoes: [
      'Das indústrias alimentícias urbanas',
      'De países estrangeiros via importação',
      'Do campo, por meio da agricultura e pecuária',
      'De laboratórios de alimentos sintéticos'
    ],
    correta: 2, // Índice da resposta correta (começa em 0)
    explicacao: 'Correto! A grande maioria dos alimentos que chegam às cidades vem do campo, produzidos por agricultores e pecuaristas brasileiros.'
  },
  {
    texto: '💧 Por que a preservação das matas e rios no campo é importante para quem vive na cidade?',
    opcoes: [
      'Apenas para fins turísticos e de lazer',
      'Porque garante o abastecimento de água potável nas cidades',
      'Para atrair animais selvagens para as áreas urbanas',
      'Não tem importância direta para os citadinos'
    ],
    correta: 1,
    explicacao: 'Isso mesmo! As matas e rios rurais são fundamentais para o ciclo da água, garantindo o abastecimento de mananciais que abastecem as cidades.'
  },
  {
    texto: '🚜 Qual é um exemplo claro de como a cidade contribui com o campo?',
    opcoes: [
      'Enviando lixo para aterros sanitários rurais',
      'Desenvolvendo e fornecendo máquinas agrícolas, tecnologia e insumos',
      'Construindo condomínios no interior do país',
      'Reduzindo a população rural por meio de migrações'
    ],
    correta: 1,
    explicacao: 'Perfeito! A cidade contribui com o campo oferecendo tecnologia, máquinas, fertilizantes e serviços que aumentam a produtividade agrícola.'
  },
  {
    texto: '🌍 O que é o "agronegócio" e qual a sua importância para o Brasil?',
    opcoes: [
      'É um tipo de negócio apenas para pequenos produtores',
      'É o conjunto de atividades ligadas à produção rural, sendo responsável por grande parte do PIB e das exportações brasileiras',
      'É uma empresa internacional que compra terras no Brasil',
      'É exclusivamente a venda de produtos orgânicos'
    ],
    correta: 1,
    explicacao: 'Correto! O agronegócio é o setor que envolve toda a cadeia produtiva do campo e representa aproximadamente 30% do PIB brasileiro, sendo vital para a economia.'
  },
  {
    texto: '🏘️ O que é "migração campo-cidade" e quais são suas consequências?',
    opcoes: [
      'É a viagem de férias de famílias urbanas para o campo, sem impactos negativos',
      'É o movimento de pessoas do campo para as cidades em busca de empregos e serviços, podendo causar crescimento desordenado nas cidades',
      'É um programa do governo para distribuir terras rurais',
      'É a exportação de produtos agrícolas para outras nações'
    ],
    correta: 1,
    explicacao: 'Isso! A migração do campo para a cidade é um fenômeno histórico que gerou grandes metrópoles brasileiras, mas também trouxe desafios como periferias e falta de serviços.'
  },
  {
    texto: '🌱 O que significa "agricultura familiar" e por que ela é importante?',
    opcoes: [
      'É quando uma família inteira mora em apartamentos',
      'É a produção agrícola realizada por famílias em pequenas propriedades, sendo responsável pela maior parte dos alimentos da mesa dos brasileiros',
      'É um tipo de empresa de grande porte no campo',
      'É apenas o cultivo de flores para venda em cidades'
    ],
    correta: 1,
    explicacao: 'Exato! A agricultura familiar é praticada por pequenos e médios produtores rurais e é responsável por mais de 70% dos alimentos que chegam à mesa dos brasileiros!'
  },
  {
    texto: '🔄 Qual das situações abaixo representa melhor a "interdependência" entre cidade e campo?',
    opcoes: [
      'A cidade produz tudo que precisa sozinha, sem depender do campo',
      'O campo produz alimentos que vão para a cidade e recebe, em troca, tecnologia, serviços e mercado consumidor',
      'Campo e cidade são totalmente independentes e não precisam um do outro',
      'Apenas o campo depende da cidade; a cidade não precisa do campo'
    ],
    correta: 1,
    explicacao: 'Correto! Interdependência significa que ambos se precisam mutuamente: o campo abastece a cidade com alimentos e recursos, a cidade retorna com tecnologia, serviços e consumo.'
  },
  {
    texto: '🌤️ O que é "segurança alimentar" e como o campo contribui para ela?',
    opcoes: [
      'É a proteção policial dos alimentos nos supermercados',
      'É quando uma cidade tem câmeras em todos os restaurantes',
      'É garantir que todas as pessoas tenham acesso a alimentos suficientes e de qualidade; o campo é o principal produtor desses alimentos',
      'É a embalagem segura dos produtos industrializados'
    ],
    correta: 2,
    explicacao: 'Perfeito! Segurança alimentar é um direito humano e o campo é seu maior provedor, pois é lá que a maioria dos alimentos são cultivados e criados.'
  },
  {
    texto: '🌿 Por que o desmatamento no campo pode prejudicar as cidades?',
    opcoes: [
      'Porque reduz o turismo rural e afeta a economia local apenas',
      'Porque destrói habitats de animais sem qualquer impacto nas cidades',
      'Porque não há relação entre o desmatamento rural e a vida urbana',
      'Porque provoca o assoreamento de rios, reduz a chuva, piora a qualidade do ar e compromete o abastecimento de água das cidades'
    ],
    correta: 3,
    explicacao: 'Exatamente! O desmatamento tem efeitos diretos nas cidades: piora o clima, reduz a disponibilidade de água, aumenta a temperatura e afeta a qualidade do ar que todos respiramos.'
  },
  {
    texto: '🤝 Qual é a melhor forma de fortalecer a conexão entre cidade e campo?',
    opcoes: [
      'Ignorar os problemas rurais e focar apenas no desenvolvimento urbano',
      'Proibir a migração de pessoas entre campo e cidade',
      'Valorizar os produtos locais, apoiar agricultores familiares, preservar o meio ambiente e investir em educação e infraestrutura rural',
      'Transformar todo o campo em área de preservação sem produção alguma'
    ],
    correta: 2,
    explicacao: 'Correto! A conexão entre cidade e campo se fortalece com políticas públicas integradas, valorização do produtor rural e escolhas conscientes dos consumidores urbanos.'
  }
];

/* ---------- 4.2 VARIÁVEIS DE CONTROLE DO QUIZ ---------- */

let indicePerguntaAtual = 0;   // Qual pergunta está sendo mostrada (0 a 9)
let pontuacao = 0;             // Pontuação do usuário
let respostaSelecionada = false; // Se o usuário já respondeu a pergunta atual

/* ---------- 4.3 REFERÊNCIAS AOS ELEMENTOS DO HTML ---------- */

// Telas do quiz
const telaBoasVindas = document.getElementById('quiz-welcome');
const telaPergunta   = document.getElementById('quiz-question');
const telaResultado  = document.getElementById('quiz-result');

// Elementos da tela de pergunta
const preenchimentoBarra = document.getElementById('progress-fill');
const contadorPergunta   = document.getElementById('question-counter');
const pontuacaoAoVivo    = document.getElementById('score-live');
const textoPergunta      = document.getElementById('question-text');
const gradeOpcoes        = document.getElementById('options-grid');
const feedbackQuiz       = document.getElementById('quiz-feedback');
const botaoProxima       = document.getElementById('btn-next');

// Elementos da tela de resultado
const trofeuResultado        = document.getElementById('result-trophy');
const tituloResultado        = document.getElementById('result-title');
const numeroResultado        = document.getElementById('result-score-num');
const classificacaoResultado = document.getElementById('result-classificacao');
const mensagemResultado      = document.getElementById('result-msg');

// Botões de ação
const botaoIniciar   = document.getElementById('btn-start');
const botaoReiniciar = document.getElementById('btn-restart');

/* ---------- 4.4 FUNÇÕES DO QUIZ ---------- */

/**
 * Mostra uma tela específica e esconde as outras.
 * @param {HTMLElement} tela - O elemento da tela a ser exibida
 */
function mostrarTela(tela) {
  telaBoasVindas.classList.add('hidden');
  telaPergunta.classList.add('hidden');
  telaResultado.classList.add('hidden');
  tela.classList.remove('hidden'); // Exibe apenas a tela desejada
}

/**
 * Carrega e exibe a pergunta atual na tela.
 */
function carregarPergunta() {
  respostaSelecionada = false;

  const dadosPergunta = perguntas[indicePerguntaAtual];

  // Atualiza a barra de progresso (percentual)
  const percentual = (indicePerguntaAtual / perguntas.length) * 100;
  preenchimentoBarra.style.width = percentual + '%';

  // Atualiza o contador de pergunta
  contadorPergunta.textContent = 'Pergunta ' + (indicePerguntaAtual + 1) + ' de ' + perguntas.length;

  // Atualiza a pontuação ao vivo
  pontuacaoAoVivo.textContent = pontuacao;

  // Atualiza o texto da pergunta
  textoPergunta.textContent = dadosPergunta.texto;

  // Limpa e cria as alternativas
  gradeOpcoes.innerHTML = '';
  dadosPergunta.opcoes.forEach(function(textoOpcao, indice) {
    const botao = document.createElement('button');
    botao.classList.add('option-btn');
    botao.textContent = textoOpcao;
    botao.setAttribute('data-indice', indice); // Guarda o índice da alternativa

    // Ao clicar em uma alternativa, verifica a resposta
    botao.addEventListener('click', function() {
      verificarResposta(indice);
    });

    gradeOpcoes.appendChild(botao);
  });

  // Esconde o feedback e o botão "Próxima"
  feedbackQuiz.classList.add('hidden');
  feedbackQuiz.className = 'quiz-feedback hidden'; // Reseta as classes de cor
  botaoProxima.classList.add('hidden');
}

/**
 * Verifica se a alternativa clicada está correta.
 * @param {number} indiceSelecionado - O índice da alternativa clicada
 */
function verificarResposta(indiceSelecionado) {
  // Se o usuário já respondeu, não faz nada (evita duplo clique)
  if (respostaSelecionada) return;
  respostaSelecionada = true;

  const dadosPergunta = perguntas[indicePerguntaAtual];
  const botoesOpcao = gradeOpcoes.querySelectorAll('.option-btn');

  // Desabilita todos os botões para evitar novas clicagens
  botoesOpcao.forEach(function(btn) {
    btn.disabled = true;
  });

  // Marca o botão clicado como correto ou errado
  const botaoClicado = botoesOpcao[indiceSelecionado];

  if (indiceSelecionado === dadosPergunta.correta) {
    // ACERTOU!
    botaoClicado.classList.add('correct');
    pontuacao++; // Incrementa a pontuação
    pontuacaoAoVivo.textContent = pontuacao; // Atualiza pontuação ao vivo

    // Mostra feedback positivo
    feedbackQuiz.textContent = '✅ ' + dadosPergunta.explicacao;
    feedbackQuiz.classList.remove('hidden');
    feedbackQuiz.classList.add('feedback-correct');

  } else {
    // ERROU!
    botaoClicado.classList.add('wrong');
    // Destaca também a alternativa correta para o usuário aprender
    botoesOpcao[dadosPergunta.correta].classList.add('correct');

    // Mostra feedback negativo com a explicação
    feedbackQuiz.textContent = '❌ Resposta incorreta! ' + dadosPergunta.explicacao;
    feedbackQuiz.classList.remove('hidden');
    feedbackQuiz.classList.add('feedback-wrong');
  }

  // Exibe o botão "Próxima pergunta" (ou "Ver resultado" na última)
  botaoProxima.classList.remove('hidden');
  if (indicePerguntaAtual === perguntas.length - 1) {
    botaoProxima.textContent = 'Ver Resultado 🏆';
  } else {
    botaoProxima.textContent = 'Próxima →';
  }
}

/**
 * Avança para a próxima pergunta ou exibe o resultado final.
 */
function proximaPergunta() {
  indicePerguntaAtual++;

  if (indicePerguntaAtual < perguntas.length) {
    // Ainda há perguntas: carrega a próxima
    carregarPergunta();
  } else {
    // Acabou o quiz: mostra o resultado
    mostrarResultado();
  }
}

/**
 * Calcula e exibe a tela de resultado final.
 */
function mostrarResultado() {
  mostrarTela(telaResultado);

  // Exibe a pontuação final
  numeroResultado.textContent = pontuacao;

  // Barra de progresso completa
  preenchimentoBarra.style.width = '100%';

  // Determina o nível de classificação com base na pontuação
  let trofeu, titulo, classificacao, mensagem;

  if (pontuacao <= 3) {
    // Classificação: Aprendiz
    trofeu = '🌱';
    titulo = 'Você é um Aprendiz!';
    classificacao = '🌱 Aprendiz';
    mensagem = 'Você está começando sua jornada de aprendizado sobre a conexão entre cidade e campo. Continue explorando este site e descobrindo mais sobre esse tema tão importante!';

  } else if (pontuacao <= 7) {
    // Classificação: Protetor da Natureza
    trofeu = '🌿';
    titulo = 'Você é um Protetor da Natureza!';
    classificacao = '🌿 Protetor da Natureza';
    mensagem = 'Muito bem! Você já tem um bom conhecimento sobre a relação entre cidade e campo. Continuar aprendendo vai te tornar um verdadeiro guardião dessa conexão essencial!';

  } else {
    // Classificação: Guardião da Conexão
    trofeu = '🏆';
    titulo = 'Você é um Guardião da Conexão!';
    classificacao = '🏆 Guardião da Conexão Cidade & Campo';
    mensagem = 'Parabéns! Você demonstrou um conhecimento excepcional sobre a importância da relação entre cidade e campo. O Brasil precisa de pessoas como você para construir um futuro mais equilibrado e sustentável!';
  }

  // Atualiza a tela com os valores calculados
  trofeuResultado.textContent = trofeu;
  tituloResultado.textContent = titulo;
  classificacaoResultado.textContent = classificacao;
  mensagemResultado.textContent = mensagem;
}

/**
 * Reinicia o quiz completamente, voltando ao estado inicial.
 */
function reiniciarQuiz() {
  indicePerguntaAtual = 0;  // Volta para a primeira pergunta
  pontuacao = 0;            // Zera a pontuação
  respostaSelecionada = false;

  // Reseta a barra de progresso
  preenchimentoBarra.style.width = '0%';

  // Volta para a tela de boas-vindas
  mostrarTela(telaBoasVindas);
}

/* ---------- 4.5 EVENTOS DOS BOTÕES ---------- */

// Botão "Iniciar Quiz": começa o quiz
botaoIniciar.addEventListener('click', function() {
  mostrarTela(telaPergunta);
  carregarPergunta();
});

// Botão "Próxima": avança para a próxima pergunta
botaoProxima.addEventListener('click', function() {
  proximaPergunta();
});

// Botão "Reiniciar Quiz": reinicia tudo
botaoReiniciar.addEventListener('click', function() {
  reiniciarQuiz();
});

/* ============================================================
   6. CONTADOR DE REAÇÕES (❤️ Amei | 👍 Gostei | 👎 Não Gostei)
   Salva os votos no localStorage do navegador para que os
   contadores persistam mesmo após fechar e reabrir a página.
   ============================================================ */

// Chave usada para salvar os dados no navegador
var CHAVE_REACOES = 'cidadeCampo_reacoes';
var CHAVE_MEU_VOTO = 'cidadeCampo_meuVoto';

/**
 * Carrega os contadores salvos (ou cria do zero se for a primeira visita).
 * @returns {Object} Objeto com as contagens de cada reação
 */
function carregarContadores() {
  try {
    var salvo = localStorage.getItem(CHAVE_REACOES);
    if (salvo) return JSON.parse(salvo);
  } catch (e) {}
  // Valores iniciais se não houver nada salvo
  return { amei: 0, gostei: 0, 'nao-gostei': 0 };
}

/**
 * Salva os contadores no navegador.
 * @param {Object} contadores - Objeto com as contagens atuais
 */
function salvarContadores(contadores) {
  try {
    localStorage.setItem(CHAVE_REACOES, JSON.stringify(contadores));
  } catch (e) {}
}

/**
 * Retorna o voto que este usuário já deu (ou null se não votou ainda).
 */
function carregarMeuVoto() {
  try {
    return localStorage.getItem(CHAVE_MEU_VOTO) || null;
  } catch (e) { return null; }
}

/**
 * Salva o voto do usuário atual.
 */
function salvarMeuVoto(tipo) {
  try {
    localStorage.setItem(CHAVE_MEU_VOTO, tipo);
  } catch (e) {}
}

/**
 * Atualiza os números exibidos nos 3 botões.
 */
function atualizarDisplayContadores() {
  var contadores = carregarContadores();
  document.getElementById('count-amei').textContent = contadores['amei'];
  document.getElementById('count-gostei').textContent = contadores['gostei'];
  document.getElementById('count-nao-gostei').textContent = contadores['nao-gostei'];
}

/**
 * Aplica o estilo "ativo" no botão do voto atual e remove dos outros.
 * @param {string|null} tipoVoto - 'amei', 'gostei', 'nao-gostei' ou null
 */
function marcarBotaoAtivo(tipoVoto) {
  // Remove a classe ativa de todos os botões primeiro
  ['amei', 'gostei', 'nao-gostei'].forEach(function(tipo) {
    var btn = document.getElementById('btn-' + tipo);
    btn.classList.remove('ativo-amei', 'ativo-gostei', 'ativo-nao-gostei');
    btn.disabled = false;
  });

  // Se há um voto, marca o botão correspondente e bloqueia os outros
  if (tipoVoto) {
    var btnAtivo = document.getElementById('btn-' + tipoVoto);
    btnAtivo.classList.add('ativo-' + tipoVoto);

    // Bloqueia os outros botões (só pode votar uma vez)
    ['amei', 'gostei', 'nao-gostei'].forEach(function(tipo) {
      if (tipo !== tipoVoto) {
        document.getElementById('btn-' + tipo).disabled = true;
        document.getElementById('btn-' + tipo).style.opacity = '0.5';
      }
    });
  }
}

/**
 * Mostra a mensagem de agradecimento personalizada.
 * @param {string} tipoVoto - Qual reação o usuário escolheu
 */
function mostrarObrigado(tipoVoto) {
  var mensagens = {
    'amei':      '❤️ Que ótimo! Fico feliz que você amou o site!',
    'gostei':    '👍 Obrigado! Fico contente que você gostou!',
    'nao-gostei':'👎 Obrigado pelo feedback! Vamos melhorar cada vez mais.'
  };

  var div = document.getElementById('reacao-obrigado');
  var texto = document.getElementById('reacao-obrigado-texto');
  texto.textContent = mensagens[tipoVoto];
  div.classList.remove('hidden');
}

/**
 * Função principal chamada ao clicar num botão de reação.
 * @param {string} tipo - 'amei', 'gostei' ou 'nao-gostei'
 */
function reagir(tipo) {
  var meuVotoAtual = carregarMeuVoto();

  // Se já votou nessa mesma opção, não faz nada
  if (meuVotoAtual === tipo) return;

  var contadores = carregarContadores();

  // Se já havia votado em outra opção, remove o voto anterior
  if (meuVotoAtual) {
    contadores[meuVotoAtual] = Math.max(0, contadores[meuVotoAtual] - 1);
  }

  // Adiciona o novo voto
  contadores[tipo]++;

  // Salva tudo
  salvarContadores(contadores);
  salvarMeuVoto(tipo);

  // Atualiza a tela
  atualizarDisplayContadores();
  marcarBotaoAtivo(tipo);
  mostrarObrigado(tipo);

  // Animação "pop" no botão clicado
  var btn = document.getElementById('btn-' + tipo);
  btn.classList.remove('animando'); // Remove primeiro para poder re-acionar
  void btn.offsetWidth;             // Força o browser a "resetar" a animação
  btn.classList.add('animando');
  btn.addEventListener('animationend', function() {
    btn.classList.remove('animando');
  }, { once: true });
}

// --- Inicialização: ao carregar a página, mostra os contadores salvos ---
(function inicializarReacoes() {
  atualizarDisplayContadores();

  var meuVoto = carregarMeuVoto();
  if (meuVoto) {
    marcarBotaoAtivo(meuVoto);
    mostrarObrigado(meuVoto);
  }
})();

   Muda a sombra do cabeçalho quando o usuário rola a página.
   ============================================================ */

window.addEventListener('scroll', function() {
  const header = document.querySelector('.header');
  if (window.scrollY > 60) {
    header.style.boxShadow = '0 4px 24px rgba(0,0,0,0.13)';
  } else {
    header.style.boxShadow = '0 2px 16px rgba(0,0,0,0.07)';
  }
});
