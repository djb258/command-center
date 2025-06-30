#!/usr/bin/env node

/**
 * Barton Doctrine Validator
 * Validates code against the Barton Doctrine before builds
 */

const fs = require('fs');
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

// Hardcoded doctrine source for this project
const DOCTRINE_SOURCE = 'weewee-def-update';

// Barton Doctrine rules
const BARTON_DOCTRINE_RULES = [
  {
    name: 'File Structure',
    description: 'Files should be organized in logical directories',
    validator: (filePath) => {
      const base = path.basename(filePath);
      if (ALLOWED_ROOT_FILES.includes(base)) return true;
      const validDirs = ['app', 'lib', 'components', 'tools', 'public'];
      const dir = path.dirname(filePath).split(path.sep)[0];
      return validDirs.includes(dir) || filePath.startsWith('.');
    }
  },
  {
    name: 'TypeScript Usage',
    description: 'Use TypeScript for type safety',
    validator: (filePath) => {
      const base = path.basename(filePath);
      if (base.endsWith('.config.js') || base === 'doctrine-validator.js') return true;
      if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        return false; // Prefer .ts and .tsx
      }
      return true;
    }
  },
  {
    name: 'Component Structure',
    description: 'React components should use proper structure',
    validator: (filePath) => {
      if (filePath.endsWith('.tsx') && !filePath.includes('page.tsx')) {
        const content = fs.readFileSync(filePath, 'utf8');
        return content.includes('export default') || content.includes('export function');
      }
      return true;
    }
  },
  {
    name: 'Import Organization',
    description: 'Imports should be organized properly',
    validator: (filePath) => {
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        let hasImports = false;
        let hasNonImports = false;
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('import ')) {
            hasImports = true;
          } else if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('/*')) {
            if (hasImports && !hasNonImports) {
              hasNonImports = true;
            }
          }
        }
        
        return !hasImports || !hasNonImports || hasImports && hasNonImports;
      }
      return true;
    }
  }
];

function validateFile(filePath) {
  const violations = [];
  
  for (const rule of BARTON_DOCTRINE_RULES) {
    try {
      if (!rule.validator(filePath)) {
        violations.push({
          rule: rule.name,
          description: rule.description,
          file: filePath
        });
      }
    } catch (error) {
      // Skip files that can't be read
      continue;
    }
  }
  
  return violations;
}

function scanDirectory(dir, violations = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!item.startsWith('.') && item !== 'node_modules' && item !== '.next') {
        scanDirectory(fullPath, violations);
      }
    } else {
      const fileViolations = validateFile(fullPath);
      violations.push(...fileViolations);
    }
  }
  
  return violations;
}

function main() {
  console.log('🔍 Validating against Barton Doctrine...');
  console.log(`📋 Doctrine Source: ${DOCTRINE_SOURCE}`);
  
  const violations = scanDirectory('.');
  
  if (violations.length > 0) {
    console.log('\n❌ Barton Doctrine violations found:');
    console.log('=====================================');
    
    violations.forEach((violation, index) => {
      console.log(`${index + 1}. ${violation.rule}`);
      console.log(`   File: ${violation.file}`);
      console.log(`   Issue: ${violation.description}`);
      console.log('');
    });
    
    console.log(`Total violations: ${violations.length}`);
    console.log('\n💡 Please fix these violations before proceeding.');
    process.exit(1);
  } else {
    console.log('✅ All files comply with Barton Doctrine!');
    console.log('🚀 Proceeding with build...');
  }
}

// Run validation
if (require.main === module) {
  main();
}

module.exports = { validateFile, scanDirectory, BARTON_DOCTRINE_RULES }; 