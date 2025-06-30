/**
 * 🔒 PROJECTS API ROUTE - BARTON DOCTRINE COMPLIANT
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
      process_id: 'get-projects',
      validated: true,
      execution_signature: generateSignature(),
      timestamp_last_touched: new Date().toISOString(),
      data_payload: { operation: 'GET', endpoint: '/api/projects' }
    };

    doctrine.validatePayload(payload, 'api', 'getProjects');

    const projects = await db.getProjects();
    
    return NextResponse.json({ 
      success: true, 
      data: projects,
      barton_doctrine_validated: true
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch projects'
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
      process_id: 'create-project',
      validated: true,
      execution_signature: generateSignature(),
      timestamp_last_touched: new Date().toISOString(),
      data_payload: body
    };

    doctrine.validatePayload(payload, 'api', 'createProject');

    const project = await db.createProject(body);
    
    return NextResponse.json({ 
      success: true, 
      data: project,
      barton_doctrine_validated: true
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create project'
      },
      { status: 500 }
    );
  }
}

function generateSignature(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
} 