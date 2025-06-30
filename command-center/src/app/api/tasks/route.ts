/**
 * 🔒 TASKS API ROUTE - BARTON DOCTRINE COMPLIANT
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
      process_id: 'get-tasks',
      validated: true,
      execution_signature: generateSignature(),
      timestamp_last_touched: new Date().toISOString(),
      data_payload: { operation: 'GET', endpoint: '/api/tasks' }
    };

    doctrine.validatePayload(payload, 'api', 'getTasks');

    const tasks = await db.getTasks();
    
    return NextResponse.json({ 
      success: true, 
      data: tasks,
      barton_doctrine_validated: true
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch tasks'
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
      process_id: 'create-task',
      validated: true,
      execution_signature: generateSignature(),
      timestamp_last_touched: new Date().toISOString(),
      data_payload: body
    };

    doctrine.validatePayload(payload, 'api', 'createTask');

    const task = await db.createTask(body);
    
    return NextResponse.json({ 
      success: true, 
      data: task,
      barton_doctrine_validated: true
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create task'
      },
      { status: 500 }
    );
  }
}

function generateSignature(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
} 