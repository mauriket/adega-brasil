/* =====================================================
   CONFIGURAÇÃO DA ADEGA — edite só este arquivo
   ===================================================== */
const CONFIG = {
  nomeLoja: "Adega Anápolis",
  slogan: "Bebidas geladas na sua porta",

  // Número do WhatsApp do dono: 55 + DDD + número (só dígitos)
  whatsapp: "5562992127511",

  // Endereço para retirada (aparece na opção "Retirar na loja")
  enderecoLoja: "Rua Exemplo, 123 - Centro, Anápolis - GO",

  pedidoMinimo: 20.0,

  frete: {
    // Cidade principal (comparação ignora acentos/maiúsculas)
    cidade: "Anápolis",
    uf: "GO",
    // Faixa de CEP da cidade (Anápolis: 75000-001 a 75159-999).
    // Se o CEP não estiver nas bases dos Correios mas estiver nessa faixa,
    // o site aceita e pede para o cliente digitar rua e bairro.
    faixaCep: ["75000001", "75159999"],
    // Taxa padrão para bairros de Anápolis não listados abaixo
    taxaPadrao: 10.0,
    // Taxas específicas por bairro (nome como vem no CEP)
    bairros: {
      "Centro": 5.0,
      "Jundiaí": 6.0,
      "Maracanã": 7.0,
      "Vila Jaiara": 8.0,
      "Jardim Alexandrina": 8.0,
      "Bairro de Lourdes": 7.0,
      "Vila Santana": 6.0,
      "Setor Sul": 7.0,
      "Recanto do Sol": 12.0,
      "Residencial Arco Verde": 12.0,
    },
    // Outras cidades atendidas (deixe {} para atender só Anápolis)
    outrasCidades: {
      // "Goiânia": 35.0,
    },
    // Frete grátis a partir deste valor (0 = desativado)
    freteGratisAcima: 150.0,
  },

  // Formas de pagamento oferecidas
  pagamentos: ["Pix", "Cartão de crédito", "Cartão de débito", "Dinheiro"],
};

/* =====================================================
   PRODUTOS
   - imagem: caminho opcional (ex: "img/heineken.jpg").
     Se vazio, mostra o emoji.
   ===================================================== */
const PRODUTOS = [
  // Cervejas
  { id: 1,  nome: "Heineken Long Neck 330ml", categoria: "Cervejas", preco: 7.5,  emoji: "🍺", imagem: "" },
  { id: 2,  nome: "Budweiser Lata 350ml",     categoria: "Cervejas", preco: 4.99, emoji: "🍺", imagem: "" },
  { id: 3,  nome: "Brahma Duplo Malte 350ml", categoria: "Cervejas", preco: 4.29, emoji: "🍺", imagem: "" },
  { id: 4,  nome: "Stella Artois 330ml",      categoria: "Cervejas", preco: 7.9,  emoji: "🍺", imagem: "" },
  { id: 5,  nome: "Fardo Skol 12 latas",      categoria: "Cervejas", preco: 39.9, emoji: "📦", imagem: "" },
  { id: 6,  nome: "Corona Extra 330ml",       categoria: "Cervejas", preco: 8.5,  emoji: "🍺", imagem: "" },

  // Destilados
  { id: 10, nome: "Vodka Absolut 1L",           categoria: "Destilados", preco: 99.9,  emoji: "🍸", imagem: "" },
  { id: 11, nome: "Vodka Smirnoff 998ml",       categoria: "Destilados", preco: 44.9,  emoji: "🍸", imagem: "" },
  { id: 12, nome: "Whisky Red Label 1L",        categoria: "Destilados", preco: 109.9, emoji: "🥃", imagem: "" },
  { id: 13, nome: "Whisky Black Label 1L",      categoria: "Destilados", preco: 199.9, emoji: "🥃", imagem: "" },
  { id: 14, nome: "Gin Tanqueray 750ml",        categoria: "Destilados", preco: 129.9, emoji: "🍸", imagem: "" },
  { id: 15, nome: "Cachaça 51 965ml",           categoria: "Destilados", preco: 14.9,  emoji: "🥃", imagem: "" },

  // Vinhos
  { id: 20, nome: "Vinho Tinto Casillero del Diablo", categoria: "Vinhos", preco: 59.9, emoji: "🍷", imagem: "" },
  { id: 21, nome: "Vinho Pérgola Suave 1L",           categoria: "Vinhos", preco: 24.9, emoji: "🍷", imagem: "" },
  { id: 22, nome: "Espumante Chandon Brut",           categoria: "Vinhos", preco: 89.9, emoji: "🍾", imagem: "" },

  // Sem álcool / mixers
  { id: 30, nome: "Red Bull 250ml",         categoria: "Energéticos e Refri", preco: 9.9,  emoji: "⚡", imagem: "" },
  { id: 31, nome: "Monster 473ml",          categoria: "Energéticos e Refri", preco: 10.9, emoji: "⚡", imagem: "" },
  { id: 32, nome: "Coca-Cola 2L",           categoria: "Energéticos e Refri", preco: 12.9, emoji: "🥤", imagem: "" },
  { id: 33, nome: "Água Tônica 350ml",      categoria: "Energéticos e Refri", preco: 4.5,  emoji: "🥤", imagem: "" },

  // Outros
  { id: 40, nome: "Gelo 5kg",               categoria: "Gelo e Petiscos", preco: 12.0, emoji: "🧊", imagem: "" },
  { id: 41, nome: "Carvão 3kg",             categoria: "Gelo e Petiscos", preco: 18.0, emoji: "🔥", imagem: "" },
  { id: 42, nome: "Amendoim Japonês 500g",  categoria: "Gelo e Petiscos", preco: 11.9, emoji: "🥜", imagem: "" },
];
