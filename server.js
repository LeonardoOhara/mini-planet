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

app.listen(PORT, () => {
  console.log(`Mini Planet rodando em http://localhost:${PORT}`);
});
