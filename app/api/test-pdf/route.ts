import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';

export async function POST(req: NextRequest) {
  try {
    console.log('🧪 Testing simple PDF generation...');
    
    // Create a simple PDF
    const doc = new jsPDF();
    
    // Add some simple text
    doc.setFontSize(16);
    doc.text('Test PDF', 20, 20);
    doc.text('This is a simple test', 20, 30);
    doc.text('TSR Gallery Invoice Test', 20, 40);
    
    // Generate the PDF
    const pdfOutput = doc.output('arraybuffer');
    
    // Save to public directory
    const fs = require('fs');
    const path = require('path');
    
    const publicDir = path.join(process.cwd(), 'public', 'invoices');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    const filename = `test-invoice-${Date.now()}.pdf`;
    const fullPath = path.join(publicDir, filename);
    fs.writeFileSync(fullPath, pdfOutput);
    
    console.log('✅ Simple PDF generated successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Simple PDF generation test completed',
      filename,
      path: `invoices/${filename}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Simple PDF generation test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Simple PDF generation test failed',
      details: (error as Error).message
    }, { status: 500 });
  }
}
