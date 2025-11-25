const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * Script alternativo para gerar PNG do diagrama
 * Usa a API do PlantUML com método diferente
 */

const INPUT_FILE = path.join(__dirname, '..', 'DIAGRAMA_CASOS_USO.puml');
const OUTPUT_FILE = path.join(__dirname, '..', 'DIAGRAMA_CASOS_USO.png');

function encodePlantUML(text) {
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(text, { level: 9 });
  return compressed.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function generatePNG() {
  try {
    console.log('📖 Lendo arquivo PlantUML...');
    const pumlContent = fs.readFileSync(INPUT_FILE, 'utf-8');
    const encoded = encodePlantUML(pumlContent);
    
    // URL alternativa do PlantUML
    const url = `https://www.plantuml.com/plantuml/png/${encoded}`;
    
    console.log('🔄 Baixando imagem PNG...');
    
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(OUTPUT_FILE);
      
      https.get(url, (response) => {
        if (response.statusCode === 200) {
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            const stats = fs.statSync(OUTPUT_FILE);
            console.log('✅ Imagem PNG gerada com sucesso!');
            console.log(`📁 Arquivo: ${OUTPUT_FILE}`);
            console.log(`📊 Tamanho: ${(stats.size / 1024).toFixed(2)} KB`);
            resolve();
          });
        } else {
          fs.unlinkSync(OUTPUT_FILE);
          reject(new Error(`Erro HTTP ${response.statusCode}`));
        }
      }).on('error', (err) => {
        fs.unlinkSync(OUTPUT_FILE);
        reject(err);
      });
    });
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.log('\n💡 Alternativa manual:');
    console.log('   1. Acesse: http://www.plantuml.com/plantuml/uml/');
    console.log('   2. Abra o arquivo DIAGRAMA_CASOS_USO.puml');
    console.log('   3. Cole o conteúdo no site');
    console.log('   4. Clique em "Submit" e depois "Download PNG"');
    process.exit(1);
  }
}

generatePNG().catch(console.error);

