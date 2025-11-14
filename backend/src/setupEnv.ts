
import path from 'path';
import dotenv from 'dotenv';

// Tenta carregar o .env preferencialmente da raiz do backend (../.env a partir de src/)
const envPathFromSrc = path.resolve(__dirname, '..', '.env');
const envPathFromCwd = path.resolve(process.cwd(), '.env');

let result = dotenv.config({ path: envPathFromSrc });
if (result.error) {
  // Fallback: tentar pelo cwd (útil se chamarem o script a partir da raiz)
  result = dotenv.config({ path: envPathFromCwd });
}

if (result.error) {
  console.warn('⚠️  .env não foi encontrado ou não pôde ser carregado. Tente criar `backend/.env` (copiar de .env-example).');
  console.warn(`   caminhos tentados: ${envPathFromSrc} , ${envPathFromCwd}`);
  console.warn(`   erro: ${result.error.message || result.error}`);
} else {
  console.log(`✅ Variáveis de ambiente carregadas (via setupEnv) a partir de ${result.parsed ? (result.parsed.__loadedFrom || envPathFromSrc) : envPathFromSrc}`);
}

export default result;