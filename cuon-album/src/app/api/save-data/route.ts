import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json();
    
    // Ensure the data directory exists
    const dataDir = join(process.cwd(), 'public', 'data');
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }
    
    let filePath: string;
    switch (type) {
      case 'tags':
        filePath = join(dataDir, 'tags.json');
        break;
      case 'feedback':
        filePath = join(dataDir, 'feedback.json');
        break;
      default:
        return NextResponse.json({ error: 'Invalid data type' }, { status: 400 });
    }
    
    // Write the data to file
    writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    
    return NextResponse.json({ success: true, message: `${type} data saved successfully` });
  } catch (error) {
    console.error('Error saving data:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
} 