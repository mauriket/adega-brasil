window.DADOS = {
  "loja": {
    "nome": "Adega Brasil",
    "slogan": "Bebidas geladas na sua porta",
    "whatsapp": "5562992127511",
    "endereco": "Rua Exemplo, 123 - Centro, Anápolis - GO",
    "pedidoMinimo": 0,
    "pagamentos": [
      "Pix",
      "Cartão de crédito",
      "Cartão de débito",
      "Dinheiro"
    ],
    "mensagem": "*NOVO PEDIDO - {loja}*\nData: {data} às {hora}\n\n*Cliente:* {cliente}\n*Telefone:* {telefone}\n\n*Itens:*\n{itens}\n\n*Subtotal:* {subtotal}\n*Economia com promoções:* {economia}\n*Frete:* {frete} {distancia}\n*TOTAL: {total}*\n\n*{entrega}*\n{endereco}\n\n*Pagamento:* {pagamento}\nTroco para: {troco}\n\n*Observações:* {obs}",
    "mensagemItem": "{promo}",
    "aberta": true,
    "avisoFechada": "Estamos fechados no momento. Você pode montar seu carrinho, mas os pedidos voltam a ser aceitos quando abrirmos."
  },
  "frete": {
    "cidade": "Anápolis",
    "uf": "GO",
    "faixaCep": [
      "75000001",
      "75159999"
    ],
    "lojaCep": "",
    "lojaLat": -16.3285,
    "lojaLng": -48.9534,
    "precoKm": 1.5,
    "taxaFixa": 0,
    "taxaMinima": 0,
    "raioMaximoKm": 0,
    "taxaPadrao": 0,
    "freteGratisAcima": 0
  },
  "categorias": [
    "Cervejas",
    "Destilados",
    "Licores",
    "Vinhos",
    "Tabaco",
    "Energéticos e Refri",
    "Gelo e Petiscos"
  ],
  "produtos": [
    {
      "id": 5,
      "nome": "Fardo Skol 12 latas",
      "categoria": "Cervejas",
      "preco": 39.9,
      "emoji": "📦",
      "imagem": "",
      "descricao": "",
      "destaque": false,
      "ativo": true
    },
    {
      "id": 6,
      "nome": "Corona Extra 330ml",
      "categoria": "Cervejas",
      "preco": 8.5,
      "emoji": "🍺",
      "imagem": "",
      "descricao": "",
      "destaque": false,
      "ativo": true
    },
    {
      "id": 10,
      "nome": "Old Parr 1L",
      "categoria": "Destilados",
      "preco": 99.9,
      "emoji": "🍸",
      "imagem": "img/produtos/p10-1795110862438.jpg",
      "descricao": "",
      "destaque": false,
      "ativo": true,
      "esgotado": false
    },
    {
      "id": 12,
      "nome": "Whisky Red Label 1L",
      "categoria": "Destilados",
      "preco": 109.9,
      "emoji": "🥃",
      "imagem": "img/produtos/p12-1795110645263.jpg",
      "descricao": "",
      "destaque": false,
      "ativo": true,
      "esgotado": false
    },
    {
      "id": 13,
      "nome": "Whisky White Horse 1L",
      "categoria": "Destilados",
      "preco": 199.9,
      "emoji": "🥃",
      "imagem": "",
      "descricao": "",
      "destaque": false,
      "ativo": true,
      "esgotado": false
    },
    {
      "id": 14,
      "nome": "Gin Tanqueray Sevilla 700ml",
      "categoria": "Destilados",
      "preco": 129.9,
      "emoji": "🍸",
      "imagem": "img/produtos/p14-1795111771917.jpg",
      "descricao": "",
      "destaque": false,
      "ativo": true,
      "esgotado": false
    },
    {
      "id": 15,
      "nome": "Gin Tanqueray London Dry 700ml",
      "categoria": "Destilados",
      "preco": 14.9,
      "emoji": "🥃",
      "imagem": "img/produtos/p15-1795110686686.jpg",
      "descricao": "",
      "destaque": false,
      "ativo": true,
      "esgotado": false
    },
    {
      "id": 20,
      "nome": "Cantinho da Serra 1,5 L",
      "categoria": "Vinhos",
      "preco": 59.9,
      "emoji": "🍷",
      "imagem": "",
      "descricao": "",
      "destaque": false,
      "ativo": true,
      "esgotado": false
    },
    {
      "id": 21,
      "nome": "Vinho Pérgola 1,0 L",
      "categoria": "Vinhos",
      "preco": 30,
      "emoji": "🍷",
      "imagem": "",
      "descricao": "",
      "destaque": false,
      "ativo": true,
      "esgotado": false
    },
    {
      "id": 22,
      "nome": "Vinho Mioranza 1,0 L",
      "categoria": "Vinhos",
      "preco": 30,
      "emoji": "🍾",
      "imagem": "",
      "descricao": "",
      "destaque": false,
      "ativo": true,
      "esgotado": false
    },
    {
      "id": 30,
      "nome": "Red Bull 250ml",
      "categoria": "Energéticos e Refri",
      "preco": 9.9,
      "emoji": "⚡",
      "imagem": "",
      "descricao": "",
      "destaque": false,
      "ativo": true
    },
    {
      "id": 31,
      "nome": "Monster 473ml",
      "categoria": "Energéticos e Refri",
      "preco": 10.9,
      "emoji": "⚡",
      "imagem": "",
      "descricao": "",
      "destaque": false,
      "ativo": true
    },
    {
      "id": 32,
      "nome": "Coca-Cola 2L",
      "categoria": "Energéticos e Refri",
      "preco": 12.9,
      "emoji": "🥤",
      "imagem": "",
      "descricao": "",
      "destaque": false,
      "ativo": true
    },
    {
      "id": 33,
      "nome": "Água Tônica 350ml",
      "categoria": "Energéticos e Refri",
      "preco": 4.5,
      "emoji": "🥤",
      "imagem": "",
      "descricao": "",
      "destaque": false,
      "ativo": true
    },
    {
      "id": 40,
      "nome": "Gelo 5kg",
      "categoria": "Gelo e Petiscos",
      "preco": 12,
      "emoji": "🧊",
      "imagem": "",
      "descricao": "",
      "destaque": false,
      "ativo": true
    },
    {
      "id": 41,
      "nome": "Carvão 3kg",
      "categoria": "Gelo e Petiscos",
      "preco": 18,
      "emoji": "🔥",
      "imagem": "",
      "descricao": "",
      "destaque": false,
      "ativo": true
    },
    {
      "id": 42,
      "nome": "Amendoim Japonês 500g",
      "categoria": "Gelo e Petiscos",
      "preco": 11.9,
      "emoji": "🥜",
      "imagem": "",
      "descricao": "",
      "destaque": false,
      "ativo": true
    },
    {
      "id": 43,
      "imagem": "",
      "nome": "Gin Tanqueray Royale 700ml",
      "preco": 145,
      "categoria": "Destilados",
      "emoji": "",
      "descricao": "",
      "destaque": false,
      "ativo": true,
      "esgotado": false
    },
    {
      "id": 44,
      "imagem": "",
      "nome": "Gin Tanqueray Bossa Nova 700ml",
      "preco": 145,
      "categoria": "Destilados",
      "emoji": "",
      "descricao": "",
      "destaque": false,
      "ativo": true,
      "esgotado": false
    },
    {
      "id": 45,
      "imagem": "",
      "nome": "Vodka Smirnoff 998ml",
      "preco": 47,
      "categoria": "Destilados",
      "emoji": "",
      "descricao": "",
      "destaque": false,
      "ativo": true,
      "esgotado": false
    }
  ],
  "promocoes": []
};
