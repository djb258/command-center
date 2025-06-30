/**
 * 🔒 COMMANDS API ROUTE - BARTON DOCTRINE COMPLIANT
 * 
 * MANDATORY: All operations go through Barton Doctrine validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { BartonDoctrine } from '@/core/barton-doctrine-enforcer';

// MANDATORY: Initialize Barton Doctrine for API operations
const doctrine = BartonDoctrine;

export async function GET() {
  try {
    // MANDATORY: Validate request through Barton Doctrine
    const payload = {
      source_id: 'command-center',
      process_id: 'get-commands',
      validated: true,
      execution_signature: generateSignature(),
      timestamp_last_touched: new Date().toISOString(),
      data_payload: { operation: 'GET', endpoint: '/api/commands' }
    };

    doctrine.validatePayload(payload, 'api', 'getCommands');

    const commands = await db.getCommands();
    
    return NextResponse.json({ 
      success: true, 
      data: commands,
      barton_doctrine_validated: true
    });
  } catch (error) {
    console.error('Error fetching commands:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch commands',
        barton_doctrine_violations: doctrine.getBartonDoctrineViolations()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // MANDATORY: Validate request through Barton Doctrine
    const payload = {
      source_id: 'command-center',
      process_id: 'create-command',
      validated: true,
      execution_signature: generateSignature(),
      timestamp_last_touched: new Date().toISOString(),
      data_payload: body
    };

    doctrine.validatePayload(payload, 'api', 'createCommand');

    const command = await db.createCommand(body);
    
    return NextResponse.json({ 
      success: true, 
      data: command,
      barton_doctrine_validated: true
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating command:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create command',
        barton_doctrine_violations: doctrine.getBartonDoctrineViolations()
      },
      { status: 500 }
    );
  }
}

function generateSignature(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
} 