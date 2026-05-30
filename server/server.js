import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/cadastro', (req, res) => {
  const { nome, cpf, email, telefone, categoria } = req.body;

  if (!cpf || cpf.trim() === '') {
    return res.status(400).json({ error: 'CPF é obrigatório' });
  }

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(422).json({ error: 'Digite um e-mail válido' });
  }

  res.status(201).json({
    id: Math.floor(Math.random() * 1000000).toString(),
    nome,
    cpf,
    email,
    telefone,
    categoria,
    message: 'Cadastro realizado com sucesso',
  });
});

app.get('/ping', (req, res) => res.send('pong'));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
