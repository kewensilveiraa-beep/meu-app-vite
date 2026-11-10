import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import PDFDocument from 'pdfkit'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = path.join(projectRoot, 'apresentacao-app.pdf')
const doc = new PDFDocument({ size: 'A4', margin: 0, info: {
  Title: 'Meu Universo Geek — Apresentação do App',
  Author: 'Projeto Meu Universo Geek',
  Subject: 'Apresentação do aplicativo web progressivo',
} })
const stream = fs.createWriteStream(outputPath)
doc.pipe(stream)

const colors = {
  ink: '#21143D',
  muted: '#706982',
  purple: '#6D28D9',
  violet: '#8B5CF6',
  pale: '#F6F3FC',
  line: '#E8E2F0',
  white: '#FFFFFF',
  gold: '#FDE68A',
  green: '#15803D',
}
const pageWidth = 595.28
const pageHeight = 841.89
const margin = 44

function roundedCard(x, y, width, height, fill = colors.white) {
  doc.roundedRect(x, y, width, height, 14).fill(fill)
}

function drawStar(centerX, centerY, outerRadius, innerRadius, fill) {
  for (let point = 0; point < 8; point += 1) {
    const angle = (Math.PI * point) / 4 - Math.PI / 2
    const radius = point % 2 === 0 ? outerRadius : innerRadius
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius
    if (point === 0) doc.moveTo(x, y)
    else doc.lineTo(x, y)
  }
  doc.closePath().fill(fill)
}

function drawMark(x, y, size, dark = false) {
  doc.roundedRect(x, y, size, size, size * 0.25).fill(dark ? colors.white : colors.purple)
  doc.circle(x + size / 2, y + size / 2, size * 0.31).fill(dark ? colors.purple : colors.white)
  drawStar(x + size / 2, y + size / 2, size * 0.26, size * 0.12, dark ? colors.white : colors.violet)
}

function footer(pageNumber, dark = false) {
  const color = dark ? '#D8CFF0' : colors.muted
  doc.font('Helvetica').fontSize(8).fillColor(color)
    .text('MEU UNIVERSO GEEK  /  APRESENTAÇÃO DO APP', margin, pageHeight - 34)
  doc.text(String(pageNumber).padStart(2, '0'), pageWidth - margin - 24, pageHeight - 34, {
    width: 24,
    align: 'right',
  })
}

function smallLabel(text, x, y, color = colors.purple) {
  doc.font('Helvetica-Bold').fontSize(8).fillColor(color).text(text.toUpperCase(), x, y, {
    characterSpacing: 1.1,
  })
}

// Página 1: apresentação visual e proposta de valor.
doc.rect(0, 0, pageWidth, 423).fill(colors.ink)
doc.circle(520, 95, 140).fillOpacity(0.13).fill(colors.violet).fillOpacity(1)
doc.circle(485, 330, 75).fillOpacity(0.1).fill(colors.gold).fillOpacity(1)
drawMark(margin, 42, 44, true)
doc.font('Helvetica-Bold').fontSize(11).fillColor(colors.white)
  .text('MEU UNIVERSO GEEK', margin + 56, 49)
doc.font('Helvetica').fontSize(9).fillColor('#D8CFF0')
  .text('APLICAÇÃO WEB PROGRESSIVA  /  PWA', margin + 56, 66)

smallLabel('Seu espaço pessoal de entretenimento', margin, 129, '#D8B4FE')
doc.font('Helvetica-Bold').fontSize(39).fillColor(colors.white)
  .text('Explore. Escolha.\nLeve com você.', margin, 157, { width: 390, lineGap: 4 })
doc.font('Helvetica').fontSize(12).fillColor('#E7DFF3')
  .text('Uma experiência interativa que reúne personagens, evoluções Pokémon e descobertas de cinema em um só lugar.', margin, 267, {
    width: 390,
    lineGap: 5,
  })

const badges = [
  { text: 'INSTALÁVEL', width: 91 },
  { text: 'RESPONSIVO', width: 94 },
  { text: 'CACHE OFFLINE', width: 108 },
]
let badgeX = margin
for (const badge of badges) {
  doc.roundedRect(badgeX, 343, badge.width, 26, 13).fill('#38245A')
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(colors.white)
    .text(badge.text, badgeX, 352, { width: badge.width, align: 'center' })
  badgeX += badge.width + 9
}

smallLabel('O que você encontra', margin, 455)
doc.font('Helvetica-Bold').fontSize(22).fillColor(colors.ink)
  .text('Um app, várias descobertas.', margin, 474)

const cards = [
  {
    title: 'Personagens',
    body: 'Explore Gohan e suas transformações, com informações carregadas de uma API.',
    accent: colors.violet,
    icon: '01',
  },
  {
    title: 'Pokémon',
    body: 'Veja o Pokémon em destaque e navegue entre suas etapas de evolução.',
    accent: '#16A34A',
    icon: '02',
  },
  {
    title: 'Cinema',
    body: 'Confira detalhes de um filme, pôster e avaliações em uma área dedicada.',
    accent: '#EA580C',
    icon: '03',
  },
]
const cardGap = 12
const cardWidth = (pageWidth - margin * 2 - cardGap * 2) / 3
cards.forEach((card, index) => {
  const x = margin + index * (cardWidth + cardGap)
  const y = 520
  roundedCard(x, y, cardWidth, 145)
  doc.roundedRect(x + 14, y + 14, 33, 33, 10).fill(card.accent)
  doc.font('Helvetica-Bold').fontSize(8).fillColor(colors.white)
    .text(card.icon, x + 14, y + 26, { width: 33, align: 'center' })
  doc.font('Helvetica-Bold').fontSize(12).fillColor(colors.ink)
    .text(card.title, x + 14, y + 61, { width: cardWidth - 28 })
  doc.font('Helvetica').fontSize(8.5).fillColor(colors.muted)
    .text(card.body, x + 14, y + 82, { width: cardWidth - 28, lineGap: 3 })
})

roundedCard(margin, 686, pageWidth - margin * 2, 73, '#EEE7FB')
smallLabel('Também é pessoal', margin + 17, 701, colors.purple)
doc.font('Helvetica').fontSize(10).fillColor(colors.ink)
  .text('O campo de texto salva o conteúdo no próprio dispositivo usando armazenamento local.', margin + 17, 720, {
    width: pageWidth - margin * 2 - 34,
  })
doc.font('Helvetica').fontSize(8).fillColor(colors.muted)
  .text('React  ·  Vite  ·  APIs externas  ·  vite-plugin-pwa', margin, 781)
footer(1)

// Página 2: experiência PWA, arquitetura e possibilidades de evolução.
doc.addPage({ size: 'A4', margin: 0 })
doc.rect(0, 0, pageWidth, pageHeight).fill(colors.pale)
doc.rect(0, 0, pageWidth, 176).fill(colors.purple)
drawMark(margin, 36, 38, true)
smallLabel('Como funciona', margin + 50, 42, '#E9D5FF')
doc.font('Helvetica-Bold').fontSize(27).fillColor(colors.white)
  .text('Uma experiência pronta\npara acompanhar você.', margin, 83, { lineGap: 3 })

smallLabel('RECURSOS PWA', margin, 205)
const featureRows = [
  ['Instalação', 'Pode ser adicionada à tela inicial e aberta em uma janela própria, como um app.'],
  ['Uso sem conexão', 'O service worker guarda a estrutura do app e respostas recentes das APIs para reutilização offline.'],
  ['Atualizações', 'O service worker é atualizado automaticamente quando uma nova versão é publicada.'],
]
let rowY = 229
for (const [title, body] of featureRows) {
  roundedCard(margin, rowY, pageWidth - margin * 2, 77)
  doc.circle(margin + 23, rowY + 25, 10).fill(colors.purple)
  doc.font('Helvetica-Bold').fontSize(8).fillColor(colors.white)
    .text('✓', margin + 17, rowY + 20, { width: 12, align: 'center' })
  doc.font('Helvetica-Bold').fontSize(11).fillColor(colors.ink)
    .text(title, margin + 44, rowY + 15)
  doc.font('Helvetica').fontSize(9).fillColor(colors.muted)
    .text(body, margin + 44, rowY + 35, { width: pageWidth - margin * 2 - 64, lineGap: 3 })
  rowY += 89
}

smallLabel('DADOS E TECNOLOGIA', margin, 511)
const halfGap = 14
const halfWidth = (pageWidth - margin * 2 - halfGap) / 2
roundedCard(margin, 535, halfWidth, 147)
roundedCard(margin + halfWidth + halfGap, 535, halfWidth, 147)
doc.font('Helvetica-Bold').fontSize(11).fillColor(colors.ink)
  .text('Fontes de conteúdo', margin + 15, 553)
doc.font('Helvetica').fontSize(8.5).fillColor(colors.muted)
  .text('PokéAPI · Dragon Ball API\nOMDb · MockAPI\n\nAs informações são carregadas pela internet e mantidas em cache quando disponíveis.', margin + 15, 578, {
    width: halfWidth - 30,
    lineGap: 4,
  })
doc.font('Helvetica-Bold').fontSize(11).fillColor(colors.ink)
  .text('Base técnica', margin + halfWidth + halfGap + 15, 553)
doc.font('Helvetica').fontSize(8.5).fillColor(colors.muted)
  .text('React 19 · Vite 8\nService worker · Web App Manifest\nCache NetworkFirst para APIs\nArmazenamento local para o texto pessoal.', margin + halfWidth + halfGap + 15, 578, {
    width: halfWidth - 30,
    lineGap: 4,
  })

roundedCard(margin, 706, pageWidth - margin * 2, 89, '#FFF7E6')
smallLabel('Observação para demonstração', margin + 16, 722, '#A16207')
doc.font('Helvetica').fontSize(9).fillColor(colors.ink)
  .text('A primeira abertura e o primeiro carregamento dos dados precisam de conexão. Depois, o app pode reaproveitar arquivos e respostas já armazenados; conteúdo não visitado pode não estar disponível offline.', margin + 16, 742, {
    width: pageWidth - margin * 2 - 32,
    lineGap: 4,
  })
footer(2)

doc.end()
await new Promise((resolve, reject) => {
  stream.on('finish', resolve)
  stream.on('error', reject)
})
console.log(`PDF gerado: ${outputPath}`)
