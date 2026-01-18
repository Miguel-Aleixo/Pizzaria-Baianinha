const fetch = require('node-fetch'); // node-fetch v2
require('dotenv').config();

/**
 * Envia mensagem para Telegram quando o pedido muda de status
 * @param {Object} pedido - objeto do pedido
 */
function enviarMensagemTelegram(pedido) {
  if (!pedido || !pedido.cliente) return;

  const { _id, status, tipoEntrega, cliente, endereco, total, itens, metodoPagamento } = pedido;

  // Mensagens customizadas por status
  let mensagemStatus = "";
  switch (status.toLowerCase()) {
    case "pendente":
      mensagemStatus = "⏳ Seu pedido foi recebido e está aguardando preparo!";
      break;
    case "em preparo":
      mensagemStatus = "👨‍🍳 O pedido está sendo preparado! Logo estará delicioso!";
      break;
    case "pronto":
      mensagemStatus = "✅ Seu pedido está pronto para retirada/entrega!";
      break;
    case "entregue":
      mensagemStatus = "🏠 Pedido entregue com sucesso! Aproveite sua refeição 🍕";
      break;
    case "cancelado":
      mensagemStatus = "❌ Infelizmente seu pedido foi cancelado. Entre em contato se precisar.";
      break;
    default:
      mensagemStatus = `🔔 Pedido atualizado para: ${status}`;
      break;
  }

  // Montando a mensagem completa
  let texto = `🍕 *Pedido #${_id}*\n`;
  texto += `${mensagemStatus}\n\n`;
  texto += `🙋 *Cliente:* ${cliente.nome || "Cliente Web"}\n`;
  texto += `📱 *Telefone:* ${cliente.telefone || "Não informado"}\n`;
  texto += `🛵 *Tipo de entrega:* ${tipoEntrega === "entrega" ? "Entrega" : "Retirada"}\n`;

  if (tipoEntrega === "entrega" && endereco) {
    texto += `🏠 *Endereço:* ${endereco.rua || ""}, ${endereco.numero || ""} - ${endereco.bairro || ""}\n`;
    if (endereco.complemento) texto += `📍 *Complemento:* ${endereco.complemento}\n`;
  }

  texto += `💳 *Pagamento:* ${metodoPagamento || "Não informado"}\n`;
  texto += `💰 *Total:* R$ ${total?.toFixed(2) || "0,00"}\n\n`;

  texto += `📝 *Itens do pedido:*\n`;
  itens.forEach((item, idx) => {
    const nomeItem = item.produtoId?.nome || item.sabor1Id?.nome || "Produto";
    texto += `${idx + 1}. ${nomeItem} x${item.quantidade || 1}\n`;

    if (item.isMeioAMeio) {
      texto += `   🍕 Sabores: ${item.sabor1Id?.nome || "-"} / ${item.sabor2Id?.nome || "-"}\n`;
    }

    if (item.borda?.nome && item.borda.nome !== "Sem Borda Recheada") {
      texto += `   🧀 Borda: ${item.borda.nome} (+R$${item.borda.preco?.toFixed(2)})\n`;
    }

    if (item.observacao) {
      texto += `   ✏️ Observação: ${item.observacao}\n`;
    }

    texto += "\n";
  });

  texto += `🙏 Obrigado por escolher a *Baianinha Pizzaria*! Esperamos que você adore sua refeição! 🍕\n`;
  texto += `📢 Fique de olho: atualizações do seu pedido chegarão aqui automaticamente.`;

  // Envia a mensagem para o chat do Telegram
  fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: texto,
      parse_mode: "Markdown",
    }),
  })
  .then(() => console.log(`[BOT] Mensagem enviada para Telegram: Pedido #${_id}`))
  .catch(console.error);
}

module.exports = { enviarMensagemTelegram };
