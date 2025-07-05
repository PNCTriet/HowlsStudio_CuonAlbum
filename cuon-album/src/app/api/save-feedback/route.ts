import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const feedback = await request.json();
    
    // Path to feedback.json
    const feedbackPath = join(process.cwd(), 'public', 'data', 'feedback.json');
    
    // Read existing feedback
    let existingFeedback = [];
    try {
      const existingData = await readFile(feedbackPath, 'utf-8');
      existingFeedback = JSON.parse(existingData);
    } catch (error) {
      // File doesn't exist or is empty, start with empty array
      existingFeedback = [];
    }
    
    // Add new feedback
    existingFeedback.push(feedback);
    
    // Write back to file
    await writeFile(feedbackPath, JSON.stringify(existingFeedback, null, 2));
    
    return NextResponse.json({ success: true, message: 'Feedback saved successfully' });
  } catch (error) {
    console.error('Error saving feedback:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save feedback' },
      { status: 500 }
    );
  }
} 