import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import PDFDocument from 'pdfkit'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = path.join(projectRoot, 'apresentacao-pwa-9-pessoas.pdf')
const doc = new PDFDocument({
  size: 'A4',
  margin: 0,
  info: {
    Title: 'Do site ao PWA offline — apresentação para nove pessoas',
    Author: 'Projeto Meu Universo Geek',
    Subject: 'Roteiro de apresentação sobre implementação e teste de PWA',
  },
})
const stream = fs.createWriteStream(outputPath)
doc.pipe(stream)

const C = {
  ink: '#21143D',
  muted: '#706982',
  purple: '#6D28D9',
  violet: '#8B5CF6',
  pale: '#F6F3FC',
  line: '#E8E2F0',
  white: '#FFFFFF',
  gold: '#FDE68A',
  green: '#15803D',
  lightPurple: '#EEE7FB',
  warning: '#FFF7E6',
}
const W = 595.28
const H = 841.89
const M = 44

function roundedCard(x, y, width, height, fill = C.white, radius = 13) {
  doc.roundedRect(x, y, width, height, radius).fill(fill)
}

function drawStar(cx, cy, outer, inner, fill) {
  for (let point = 0; point < 8; point += 1) {
    const angle = (Math.PI * point) / 4 - Math.PI / 2
    const radius = point % 2 === 0 ? outer : inner
    const x = cx + Math.cos(angle) * radius
    const y = cy + Math.sin(angle) * radius
    if (point === 0) doc.moveTo(x, y)
    else doc.lineTo(x, y)
  }
  doc.closePath().fill(fill)
}

function drawMark(x, y, size, inverted = false) {
  doc.roundedRect(x, y, size, size, size * 0.25).fill(inverted ? C.white : C.purple)
  doc.circle(x + size / 2, y + size / 2, size * 0.31).fill(inverted ? C.purple : C.white)
  drawStar(x + size / 2, y + size / 2, size * 0.25, size * 0.11, inverted ? C.white : C.violet)
}

function label(text, x, y, color = C.purple) {
  doc.font('Helvetica-Bold').fontSize(8).fillColor(color)
    .text(text.toUpperCase(), x, y, { characterSpacing: 1.15 })
}

function footer(pageNumber, isDark = false) {
  const color = isDark ? '#D8CFF0' : C.muted
  doc.font('Helvetica').fontSize(8).fillColor(color)
    .text('MEU UNIVERSO GEEK  /  ROTEIRO PWA', M, H - 31)
  doc.text(String(pageNumber).padStart(2, '0'), W - M - 25, H - 31, {
    width: 25,
    align: 'right',
  })
}

const speakers = [
  {
    title: 'A ideia: o que é um PWA?',
    topic: 'APRESENTAÇÃO DO PROJETO',
    say: '“Nosso projeto já era um site feito com React e Vite. A proposta foi acrescentar recursos para ele se comportar um pouco mais como um aplicativo: poder ser instalado pelo navegador e abrir mesmo quando a conexão falhar. PWA significa Aplicativo Web Progressivo. Não foi necessário reconstruir o site do zero: adicionamos uma configuração que prepara o app para instalação e cache. O conteúdo continua sendo o mesmo: perfil, personagem de Dragon Ball, Pokémon e filme.”',
    show: ['A tela atual do app.', 'A diferença entre abrir um site e instalar um PWA.'],
    terms: 'PWA = site com recursos de aplicativo.',
    next: '“Primeiro, preparamos as ferramentas do projeto.”',
  },
  {
    title: 'Preparação: plugin e ferramentas',
    topic: 'DEPENDÊNCIAS DO PROJETO',
    say: '“O app usa Vite para desenvolver e montar a versão de produção. Instalamos o pacote vite-plugin-pwa como dependência de desenvolvimento. Esse plugin conecta o Vite aos recursos PWA e gera arquivos importantes durante o build. A configuração foi feita na pasta interna Vite-project, onde estão o package.json e o vite.config.js. Essa distinção importa porque existe uma pasta externa com nome parecido.”',
    show: ['package.json: vite-plugin-pwa e comandos do projeto.', 'vite.config.js: integração do plugin com Vite.'],
    terms: 'Plugin = ferramenta que acrescenta recursos ao projeto.',
    next: '“Com as ferramentas prontas, demos uma identidade ao app.”',
  },
  {
    title: 'Identidade: o manifest',
    topic: 'NOME, CORES E INSTALAÇÃO',
    say: '“O manifest é como a ficha de identidade do aplicativo. Nele configuramos o nome Meu Universo Geek, o nome curto, a descrição, o idioma português, a cor do tema e o modo standalone. Standalone faz com que, quando instalado, o app possa abrir em uma janela própria, sem a barra normal do navegador. O navegador lê essa ficha para saber como apresentar o app ao usuário.”',
    show: ['vite.config.js: nome, idioma, cores e display.', 'dist/manifest.webmanifest: arquivo gerado no build.'],
    terms: 'Manifest = ficha com os dados de apresentação do PWA.',
    next: '“Também criamos imagens para o ícone aparecer bem em diferentes telas.”',
  },
  {
    title: 'Ícones: reconhecimento visual',
    topic: 'ANDROID, DESKTOP E APPLE',
    say: '“Um aplicativo instalável precisa de ícones apropriados. O projeto gera imagens PNG de 192 por 192 e 512 por 512 pixels, além de uma versão maskable, que pode ser recortada por alguns dispositivos. Também gera um ícone para a tela inicial da Apple. O script icons:generate cria esses arquivos a partir do desenho do projeto, então é possível refazê-los sem desenhar cada tamanho à mão.”',
    show: ['public/: ícones PNG e ícone vetorial.', 'package.json: comando npm run icons:generate.'],
    terms: 'Maskable = ícone preparado para diferentes formatos de recorte.',
    next: '“Agora veremos quem ajuda o app a lembrar seus arquivos.”',
  },
  {
    title: 'Service worker: o ajudante do navegador',
    topic: 'REGISTRO E ATUALIZAÇÃO',
    say: '“O service worker é um pequeno programa que o navegador executa separado da página. Ele pode interceptar pedidos de arquivos e procurar uma cópia guardada. O plugin gera esse programa e registra a atualização automática. No build, aparecem arquivos como sw.js e registerSW.js. Assim, quando uma nova versão do app é publicada, o service worker pode atualizar a cópia usada pelo navegador.”',
    show: ['dist/sw.js: service worker gerado.', 'dist/registerSW.js: código de registro.'],
    terms: 'Service worker = ajudante que intermedeia pedidos e cache.',
    next: '“O ajudante guarda primeiro os arquivos que formam o próprio site.”',
  },
  {
    title: 'Cache do app: a estrutura offline',
    topic: 'ARQUIVOS PRÉ-CARREGADOS',
    say: '“No build, configuramos o Workbox para guardar a estrutura publicada: HTML, JavaScript, CSS, ícones e algumas imagens locais. Essa lista é chamada precache. É como deixar uma cópia da casca do app pronta para abrir sem internet depois que a pessoa visita o site. O comando de produção mostrou quantos arquivos entraram no precache. Isso não significa que todas as respostas externas e todas as imagens da internet também foram guardadas.”',
    show: ['vite.config.js: globPatterns do precache.', 'Terminal: quantidade de arquivos incluídos no precache.'],
    terms: 'Precache = guardar arquivos do app antes de precisar deles offline.',
    next: '“Além dos arquivos, o app também consulta APIs.”',
  },
  {
    title: 'APIs: guardar respostas recentes',
    topic: 'ESTRATÉGIA NETWORK FIRST',
    say: '“O site busca informações em APIs de perfil, Dragon Ball, Pokémon e filmes. Configuramos uma regra NetworkFirst para esses endereços. Isso quer dizer: primeiro tenta buscar uma resposta nova pela internet; se a rede falhar, pode usar uma resposta guardada no cache. O cache tem limite de quantidade e validade de até sete dias. Só é possível reutilizar respostas que tenham sido carregadas com sucesso antes.”',
    show: ['vite.config.js: hosts das APIs e regra NetworkFirst.', 'Cache: até 80 respostas, com validade de sete dias.'],
    terms: 'NetworkFirst = tenta internet primeiro; usa cache se necessário.',
    next: '“Uma informação pessoal já fica guardada diretamente no aparelho.”',
  },
  {
    title: 'Build e ensaio do modo offline',
    topic: 'GERAR E TESTAR A VERSÃO FINAL',
    say: '“Para testar o PWA, não basta abrir o servidor de desenvolvimento. Rodamos npm run build, que cria a versão final na pasta dist, e depois npm run preview, que serve essa versão localmente. Primeiro abrimos o site com internet para o navegador registrar o service worker e guardar arquivos e respostas. Depois podemos usar as ferramentas do navegador, na aba Network, marcar Offline e recarregar. Também podemos procurar a opção de instalar no menu do Chrome ou Edge.”',
    show: ['Terminal na pasta Vite-project: npm run build e npm run preview.', 'Chrome/Edge: Network → Offline; instalação pelo menu do navegador.'],
    terms: 'Build = preparar os arquivos finais para publicação.',
    next: '“Por fim, vamos explicar o que funciona offline e os limites do teste.”',
  },
  {
    title: 'Resultado, limites e próximos passos',
    topic: 'DEMONSTRAÇÃO E CONCLUSÃO',
    say: '“O resultado é um site que pode ser instalado e cuja estrutura pode abrir offline depois de uma primeira visita online. Respostas de APIs consultadas podem ser reaproveitadas enquanto estiverem no cache. A primeira visita ainda precisa de internet; dados nunca carregados, novas evoluções e imagens hospedadas fora do app talvez não apareçam offline. Para publicar para outras pessoas, precisamos hospedar o site em HTTPS. Nosso próximo passo é testar em diferentes dispositivos e, se necessário, guardar também os dados e imagens importantes no próprio aparelho.”',
    show: ['Demonstração: visite online, depois teste Offline.', 'Explique com clareza o que já tem cache e o que depende da rede.'],
    terms: 'Offline não é magia: só funciona com conteúdo previamente guardado.',
    next: '“Obrigada(o)! Essa foi a transformação do nosso site em PWA.”',
  },
]

// Capa
 doc.rect(0, 0, W, H).fill(C.pale)
doc.rect(0, 0, W, 382).fill(C.ink)
doc.circle(520, 70, 145).fillOpacity(0.13).fill(C.violet).fillOpacity(1)
doc.circle(500, 300, 75).fillOpacity(0.11).fill(C.gold).fillOpacity(1)
drawMark(M, 37, 43, true)
doc.font('Helvetica-Bold').fontSize(10).fillColor(C.white)
  .text('MEU UNIVERSO GEEK', M + 55, 45)
doc.font('Helvetica').fontSize(8.5).fillColor('#D8CFF0')
  .text('ROTEIRO DE APRESENTAÇÃO  /  9 PARTICIPANTES', M + 55, 62)
label('Do site ao PWA', M, 124, '#D8B4FE')
doc.font('Helvetica-Bold').fontSize(34).fillColor(C.white)
  .text('Como preparamos\no app para funcionar\nsem conexão?', M, 151, { width: 450, lineGap: 3 })
doc.font('Helvetica').fontSize(11).fillColor('#E7DFF3')
  .text('Nove falas curtas explicam o que foi configurado, como testar e o que o modo offline realmente oferece.', M, 283, {
    width: 430,
    lineGap: 4,
  })

label('Divisão das falas', M, 415)
const roleNames = [
  'O que é PWA?', 'Plugin e ferramentas', 'Manifest',
  'Ícones', 'Service worker', 'Cache do app',
  'Cache das APIs', 'Build e teste offline', 'Resultado e limites',
]
const gapX = 9
const gapY = 10
const cardW = (W - M * 2 - gapX * 2) / 3
const cardH = 62
roleNames.forEach((name, index) => {
  const col = index % 3
  const row = Math.floor(index / 3)
  const x = M + col * (cardW + gapX)
  const y = 439 + row * (cardH + gapY)
  roundedCard(x, y, cardW, cardH)
  doc.circle(x + 21, y + 22, 12).fill(index === 7 ? C.green : C.purple)
  doc.font('Helvetica-Bold').fontSize(8).fillColor(C.white)
    .text(String(index + 1).padStart(2, '0'), x + 12, y + 19, { width: 18, align: 'center' })
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(C.ink)
    .text(name, x + 40, y + 17, { width: cardW - 48, height: 30, lineGap: 2 })
})

roundedCard(M, 662, W - M * 2, 108, C.warning)
label('Importante para a apresentação', M + 16, 679, '#A16207')
doc.font('Helvetica').fontSize(9.3).fillColor(C.ink)
  .text('“Funcionar offline” significa abrir a estrutura do app e reutilizar conteúdo que já foi guardado. A primeira visita exige internet; respostas e imagens nunca carregadas podem não estar disponíveis sem conexão.', M + 16, 701, {
    width: W - M * 2 - 32,
    lineGap: 4,
  })
footer(1)

speakers.forEach((speaker, index) => {
  doc.addPage({ size: 'A4', margin: 0 })
  doc.rect(0, 0, W, H).fill(C.pale)
  doc.rect(0, 0, W, 173).fill(C.purple)
  doc.circle(W - 30, 10, 112).fillOpacity(0.16).fill(C.violet).fillOpacity(1)
  drawMark(M, 30, 36, true)
  label(`Pessoa ${index + 1} de 9  ·  ${speaker.topic}`, M + 50, 37, '#E9D5FF')
  doc.font('Helvetica-Bold').fontSize(23).fillColor(C.white)
    .text(speaker.title, M, 88, { width: W - M * 2, lineGap: 2 })

  const speechX = M
  const speechY = 205
  const speechW = W - M * 2
  const speechText = speaker.say
  doc.font('Helvetica').fontSize(12.5)
  const speechHeight = doc.heightOfString(speechText, { width: speechW - 36, lineGap: 5 })
  const speechCardHeight = Math.max(190, speechHeight + 79)
  roundedCard(speechX, speechY, speechW, speechCardHeight)
  label('Fala sugerida', speechX + 18, speechY + 17)
  doc.font('Helvetica').fontSize(12.5).fillColor(C.ink)
    .text(speechText, speechX + 18, speechY + 40, {
      width: speechW - 36,
      lineGap: 5,
    })

  let contentY = speechY + speechCardHeight + 25
  label('O que mostrar ou destacar', M, contentY)
  contentY += 22
  for (const item of speaker.show) {
    doc.circle(M + 5, contentY + 6, 3).fill(C.violet)
    doc.font('Helvetica').fontSize(9.5).fillColor(C.ink)
      .text(item, M + 15, contentY, {
        width: W - M * 2 - 15,
        lineGap: 3,
      })
    contentY += doc.heightOfString(item, { width: W - M * 2 - 15, lineGap: 3 }) + 10
  }

  contentY += 6
  roundedCard(M, contentY, W - M * 2, 57, C.lightPurple)
  label('Termo em linguagem simples', M + 15, contentY + 12)
  doc.font('Helvetica-Bold').fontSize(9.5).fillColor(C.ink)
    .text(speaker.terms, M + 15, contentY + 30, { width: W - M * 2 - 30 })

  contentY += 75
  roundedCard(M, contentY, W - M * 2, 50, '#EAF7EF')
  label('Passagem para a próxima pessoa', M + 15, contentY + 10, C.green)
  doc.font('Helvetica-Oblique').fontSize(9.5).fillColor(C.ink)
    .text(speaker.next, M + 15, contentY + 27, { width: W - M * 2 - 30 })

  footer(index + 2)
})

doc.end()
await new Promise((resolve, reject) => {
  stream.on('finish', resolve)
  stream.on('error', reject)
})
console.log(`PDF gerado: ${outputPath}`)
