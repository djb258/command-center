#!/usr/bin/env node

/**
 * 🔒 BARTON DOCTRINE VALIDATOR - COMMAND CENTER
 * 
 * MANDATORY: Validates all files against Barton Doctrine compliance
 * Ensures SPVPET/STAMPED/STACKED schema compliance
 * NO EXCEPTIONS - NO BYPASS - NO COMPROMISE
 */

console.log('🔒 Validating Command Center against Barton Doctrine...');
console.log('   Ensuring SPVPET/STAMPED/STACKED schema compliance...');

// Check for required Barton Doctrine files
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'src/core/barton-doctrine-enforcer.ts',
  'src/lib/database.ts',
  'src/app/api/commands/route.ts',
  'src/app/api/commands/[id]/route.ts'
];

let violations = 0;

console.log('\n📋 Checking required Barton Doctrine files...');

requiredFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for Barton Doctrine imports
    if (file.includes('barton-doctrine-enforcer.ts')) {
      // This is the enforcer file itself, so it doesn't need to import itself
      console.log(`✅ ${file} - Barton Doctrine enforcer file`);
    } else if (!content.includes('barton-doctrine-enforcer')) {
      console.error(`❌ ${file} - Missing Barton Doctrine import`);
      violations++;
    } else {
      console.log(`✅ ${file} - Barton Doctrine compliant`);
    }
    
    // Check for database operations validation
    if (content.includes('database') || content.includes('db.')) {
      if (!content.includes('doctrine.validatePayload') && !content.includes('BartonDoctrine.validate')) {
        console.error(`❌ ${file} - Database operations without Barton Doctrine validation`);
        violations++;
      }
    }
  } else {
    console.error(`❌ ${file} - File not found`);
    violations++;
  }
});

// Check for API routes compliance
console.log('\n📋 Checking API routes compliance...');

const apiRoutes = [
  'src/app/api/commands/route.ts',
  'src/app/api/tasks/route.ts',
  'src/app/api/projects/route.ts'
];

apiRoutes.forEach(route => {
  const routePath = path.join(process.cwd(), route);
  if (fs.existsSync(routePath)) {
    const content = fs.readFileSync(routePath, 'utf8');
    
    if (!content.includes('BartonDoctrine') || !content.includes('validatePayload')) {
      console.error(`❌ ${route} - Missing Barton Doctrine validation`);
      violations++;
    } else {
      console.log(`✅ ${route} - Barton Doctrine compliant`);
    }
  }
});

// Check for database schema compliance
console.log('\n📋 Checking database schema compliance...');

const dbFile = path.join(process.cwd(), 'src/lib/database.ts');
if (fs.existsSync(dbFile)) {
  const content = fs.readFileSync(dbFile, 'utf8');
  
  // Check for SPVPET/STAMPED/STACKED schema compliance
  if (!content.includes('barton_doctrine_logs')) {
    console.error('❌ Database missing Barton Doctrine logging table');
    violations++;
  }
  
  if (!content.includes('validatePayload')) {
    console.error('❌ Database operations missing Barton Doctrine validation');
    violations++;
  } else {
    console.log('✅ Database - Barton Doctrine compliant');
  }
}

// Final validation report
console.log('\n📊 Barton Doctrine Validation Report');
console.log('=====================================');

if (violations === 0) {
  console.log('✅ ALL FILES COMPLIANT - Barton Doctrine validation passed!');
  console.log('   Command Center is ready for deployment');
  process.exit(0);
} else {
  console.error(`❌ ${violations} VIOLATIONS DETECTED!`);
  console.error('   Command Center cannot be deployed until violations are fixed');
  console.error('   All operations must go through Barton Doctrine validation');
  process.exit(1);
} 