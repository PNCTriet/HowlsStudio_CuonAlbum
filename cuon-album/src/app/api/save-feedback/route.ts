import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const feedback = await request.json();
    
    // Add timestamp if not provided
    if (!feedback.timestamp) {
      feedback.timestamp = new Date().toISOString();
    }
    
    // Read existing feedback
    const feedbackPath = path.join(process.cwd(), 'public', 'data', 'feedback.json');
    let existingFeedback = [];
    
    try {
      const existingData = await fs.readFile(feedbackPath, 'utf-8');
      existingFeedback = JSON.parse(existingData);
    } catch {
      // File doesn't exist or is empty, start with empty array
    }
    
    // Add new feedback
    existingFeedback.push(feedback);
    
    // Write back to file
    await fs.writeFile(feedbackPath, JSON.stringify(existingFeedback, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      message: 'Feedback saved successfully',
      count: existingFeedback.length 
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Failed to save feedback' },
      { status: 500 }
    );
  }
} 