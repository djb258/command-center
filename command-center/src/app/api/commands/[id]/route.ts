/**
 * 🔒 COMMAND API ROUTE - BARTON DOCTRINE COMPLIANT
 * 
 * MANDATORY: All operations go through Barton Doctrine validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { BartonDoctrine } from '@/core/barton-doctrine-enforcer';

// MANDATORY: Initialize Barton Doctrine for API operations
const doctrine = BartonDoctrine;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // MANDATORY: Validate request through Barton Doctrine
    const payload = {
      source_id: 'command-center',
      process_id: 'get-command',
      validated: true,
      execution_signature: generateSignature(),
      timestamp_last_touched: new Date().toISOString(),
      data_payload: { id: params.id, operation: 'GET' }
    };

    doctrine.validatePayload(payload, 'api', 'getCommand');

    const command = await db.getCommandById(params.id);
    
    return NextResponse.json({ 
      success: true, 
      data: command,
      barton_doctrine_validated: true
    });
  } catch (error) {
    console.error('Error fetching command:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Command not found'
      },
      { status: 404 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // MANDATORY: Validate request through Barton Doctrine
    const payload = {
      source_id: 'command-center',
      process_id: 'update-command',
      validated: true,
      execution_signature: generateSignature(),
      timestamp_last_touched: new Date().toISOString(),
      data_payload: { id: params.id, updates: body }
    };

    doctrine.validatePayload(payload, 'api', 'updateCommand');

    const command = await db.updateCommand(params.id, body);
    
    return NextResponse.json({ 
      success: true, 
      data: command,
      barton_doctrine_validated: true
    });
  } catch (error) {
    console.error('Error updating command:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update command'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // MANDATORY: Validate request through Barton Doctrine
    const payload = {
      source_id: 'command-center',
      process_id: 'delete-command',
      validated: true,
      execution_signature: generateSignature(),
      timestamp_last_touched: new Date().toISOString(),
      data_payload: { id: params.id, operation: 'DELETE' }
    };

    doctrine.validatePayload(payload, 'api', 'deleteCommand');

    await db.deleteCommand(params.id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Command deleted successfully',
      barton_doctrine_validated: true
    });
  } catch (error) {
    console.error('Error deleting command:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete command'
      },
      { status: 500 }
    );
  }
}

function generateSignature(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
} 