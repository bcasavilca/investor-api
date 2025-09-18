//+------------------------------------------------------------------+
// server.js
//+------------------------------------------------------------------+

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Conexão com o MongoDB Atlas
mongoose.connect(
  "mongodb+srv://bcasavilca_db_user:p6BnDuVuTfv7YDAp@cluster0.nxxqupe.mongodb.net/investorDB?retryWrites=true&w=majority&appName=Cluster0",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)
.then(() => console.log("Conectado ao MongoDB Atlas!"))
.catch((err) => console.error("Erro ao conectar ao MongoDB:", err));

// Definindo schemas e modelos
const investidorSchema = new mongoose.Schema({
  nome: String,
  deposito: Number,
  lucro: Number,
  capitalLiquido: Number
});

const dadosContaSchema = new mongoose.Schema({
  saldo: Number,
  lucro: Number,
  capitalLiquido: Number,
  investidores: [investidorSchema],
  createdAt: { type: Date, default: Date.now }
});

const DadosConta = mongoose.model('DadosConta', dadosContaSchema);

// Configurando Express
const app = express();
const port = 4000;

app.use(bodyParser.json());

// Rota POST: recebe dados do MetaTrader EA
app.post('/api/metatrader', async (req, res) => {
  const { saldo, lucro, capitalLiquido, investidores } = req.body;

  if (typeof saldo !== "number" || typeof lucro !== "number" || typeof capitalLiquido !== "number") {
    return res.status(400).json({ erro: "JSON inválido", detalhe: "Saldo, lucro e capitalLiquido devem ser números" });
  }

  try {
    const novoRegistro = await DadosConta.create({ saldo, lucro, capitalLiquido, investidores });
    console.log("Dados salvos no MongoDB:", novoRegistro);
    res.json({ status: "ok", id: novoRegistro._id });
  } catch (err) {
    console.error("Erro ao salvar no MongoDB:", err);
    res.status(500).json({ erro: "Erro ao salvar no MongoDB" });
  }
});

// Rota GET: retorna os dados mais recentes
app.get('/api/metatrader', async (req, res) => {
  try {
    const ultimoRegistro = await DadosConta.findOne().sort({ createdAt: -1 });
    if (!ultimoRegistro) return res.status(404).json({ erro: "Nenhum registro encontrado" });
    res.json(ultimoRegistro);
  } catch (err) {
    console.error("Erro ao buscar dados:", err);
    res.status(500).json({ erro: "Erro ao buscar dados" });
  }
});
// Servir arquivos estáticos da pasta public
app.use(express.static('public'));

// Inicia servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
