import { BlueprintEnforcer } from '../src/index';

/**
 * Basic usage example for the Cursor Blueprint Enforcer
 * 
 * This example demonstrates how to:
 * 1. Create a BlueprintEnforcer instance
 * 2. Process blueprint data
 * 3. Handle errors and cleanup
 */

async function main() {
  console.log('Starting Cursor Blueprint Enforcer example...');

  // Create a new BlueprintEnforcer instance
  const enforcer = new BlueprintEnforcer();

  // Sample blueprint data
  const blueprintData = {
    id: 'bp-example-001',
    name: 'Example Blueprint',
    version: '1.0.0',
    status: 'active',
    description: 'This is an example blueprint for demonstration purposes',
    author: 'Example User',
    timestamp: new Date().toISOString(),
    metadata: {
      tags: ['example', 'demo'],
      category: 'tutorial',
      priority: 'medium'
    }
  };

  try {
    // Process the blueprint data
    console.log('Processing blueprint:', blueprintData.name);
    await enforcer.processBlueprint(blueprintData);
    
    console.log('Blueprint processed successfully!');
  } catch (error) {
    console.error('Error processing blueprint:', error);
  } finally {
    // Always cleanup resources
    console.log('Cleaning up resources...');
    await enforcer.cleanup();
    console.log('Cleanup completed');
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { main }; 