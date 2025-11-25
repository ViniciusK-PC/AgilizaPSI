const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

/**
 * Script para gerar imagem PNG do diagrama de casos de uso
 * Usa a API do PlantUML Server para converter .puml em PNG
 */

const PLANTUML_SERVER = 'https://www.plantuml.com/plantuml';
const INPUT_FILE = path.join(__dirname, '..', 'DIAGRAMA_CASOS_USO.puml');
const OUTPUT_FILE = path.join(__dirname, '..', 'DIAGRAMA_CASOS_USO.png');

async function generatePNG() {
  try {
    console.log('📖 Lendo arquivo PlantUML...');
    
    if (!fs.existsSync(INPUT_FILE)) {
      throw new Error(`Arquivo não encontrado: ${INPUT_FILE}`);
    }
    
    const pumlContent = fs.readFileSync(INPUT_FILE, 'utf-8');
    console.log(`✅ Arquivo lido: ${pumlContent.length} caracteres`);
    
    // Codificar o conteúdo para URL (PlantUML usa encoding especial)
    const encoded = encodePlantUML(pumlContent);
    console.log('✅ Conteúdo codificado');
    
    console.log('🔄 Gerando imagem PNG...');
    console.log('⏳ Isso pode levar alguns segundos...');
    
    // Usar o servidor PlantUML para gerar a imagem
    const url = `${PLANTUML_SERVER}/png/${encoded}`;
    
    return new Promise((resolve, reject) => {
      const request = https.get(url, (response) => {
        console.log(`📡 Status: ${response.statusCode}`);
        
        if (response.statusCode === 200) {
          const fileStream = fs.createWriteStream(OUTPUT_FILE);
          response.pipe(fileStream);
          
          fileStream.on('finish', () => {
            fileStream.close();
            console.log('✅ Imagem PNG gerada com sucesso!');
            console.log(`📁 Arquivo salvo em: ${OUTPUT_FILE}`);
            resolve();
          });
          
          fileStream.on('error', (error) => {
            fs.unlinkSync(OUTPUT_FILE);
            reject(error);
          });
        } else {
          let errorData = '';
          response.on('data', (chunk) => {
            errorData += chunk;
          });
          response.on('end', () => {
            console.error('❌ Resposta do servidor:', errorData);
            reject(new Error(`Erro ao gerar imagem: ${response.statusCode}`));
          });
        }
      });
      
      request.on('error', (error) => {
        console.error('❌ Erro na requisição:', error.message);
        reject(error);
      });
      
      request.setTimeout(30000, () => {
        request.destroy();
        reject(new Error('Timeout na requisição'));
      });
    });
    
  } catch (error) {
    console.error('❌ Erro ao gerar imagem:', error.message);
    console.log('\n💡 Alternativa:');
    console.log('   1. Acesse: http://www.plantuml.com/plantuml/uml/');
    console.log('   2. Cole o conteúdo do arquivo DIAGRAMA_CASOS_USO.puml');
    console.log('   3. Clique em "Submit" e depois em "Download PNG"');
    console.log(`\n📄 Arquivo PlantUML: ${INPUT_FILE}`);
    process.exit(1);
  }
}

/**
 * Codifica o conteúdo PlantUML para o formato usado pela API
 * PlantUML usa um encoding especial baseado em deflate
 */
function encodePlantUML(text) {
  try {
    // PlantUML usa deflate + base64 com substituições
    const compressed = zlib.deflateSync(text, { level: 9 });
    const encoded = compressed.toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    return encoded;
  } catch (error) {
    throw new Error(`Erro ao codificar: ${error.message}`);
  }
}

// Executar
if (require.main === module) {
  generatePNG().catch(console.error);
}

module.exports = { generatePNG };

