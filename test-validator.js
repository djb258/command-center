const path = require('path');

// Allow these files in the root
const ALLOWED_ROOT_FILES = [
  'README.md',
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'next.config.js',
  'postcss.config.js',
  'tailwind.config.js',
  'vercel.json'
];

function testValidator(filePath) {
  const base = path.basename(filePath);
  const dir = path.dirname(filePath);
  
  console.log(`Testing: ${filePath}`);
  console.log(`  base: "${base}"`);
  console.log(`  dir: "${dir}"`);
  console.log(`  dir === '.': ${dir === '.'}`);
  console.log(`  dir === '': ${dir === ''}`);
  console.log(`  in allowed: ${ALLOWED_ROOT_FILES.includes(base)}`);
  
  if (dir === '.' || dir === '') {
    const result = ALLOWED_ROOT_FILES.includes(base);
    console.log(`  Result: ${result}`);
    return result;
  }
  
  console.log(`  Result: false (not in root)`);
  return false;
}

console.log('Testing root files:');
testValidator('next.config.js');
testValidator('package.json');
testValidator('README.md'); 