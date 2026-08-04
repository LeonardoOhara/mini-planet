// server.js
// Servidor Express simples: serve os arquivos estáticos do jogo (public/)
// e a biblioteca Three.js (node_modules/three) para uso via <script type="importmap">.

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Arquivos do jogo (html, css, js do cliente, assets)
app.use(express.static(path.join(__dirname, 'public')));

// Expõe o pacote three.js instalado via npm para o navegador poder importá-lo
// (evita depender de CDN externo)
app.use('/vendor/three', express.static(path.join(__dirname, 'node_modules', 'three', 'build')));
app.use('/vendor/three/examples/jsm', express.static(path.join(__dirname, 'node_modules', 'three', 'examples', 'jsm')));

function listen(port, attempts = 0) {
  const server = app.listen(port, () => {
    console.log(`Mini Planet rodando em http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && attempts < 5) {
      console.warn(`Porta ${port} ocupada. Tentando a próxima porta...`);
      listen(port + 1, attempts + 1);
      return;
    }

    console.error('Falha ao iniciar o servidor:', err);
    process.exit(1);
  });
}

listen(PORT);
