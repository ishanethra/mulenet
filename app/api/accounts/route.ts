import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // For the wireframe/hackathon presentation, we use the pre-extracted 81 critical alerts
    // which contain all 3925 raw features but weigh only ~4.6MB instead of 111MB!
    const jsonPath = path.join(process.cwd(), 'public', 'critical_alerts.json');
    
    if (!fs.existsSync(jsonPath)) {
      return NextResponse.json({ error: 'critical_alerts.json not found' }, { status: 404 });
    }
    
    const fileData = fs.readFileSync(jsonPath, 'utf-8');
    const accounts = JSON.parse(fileData);
    
    // Dataset is already randomly shuffled from python script to ensure mixed presentation
    
    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Error serving critical alerts:', error);
    return NextResponse.json({ error: 'Failed to read dataset' }, { status: 500 });
  }
}
