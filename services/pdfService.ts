
import { jsPDF } from 'jspdf';
import { Storybook, ThemeType } from '../types';

/**
 * Palette mapping for themed pages
 */
const getThemePalette = (theme: ThemeType) => {
  const palettes: Record<ThemeType, { primary: [number, number, number], bg: [number, number, number], accent: [number, number, number] }> = {
    [ThemeType.ADVENTURE]: { primary: [21, 128, 61], bg: [240, 253, 244], accent: [134, 239, 172] },
    [ThemeType.SPACE]: { primary: [30, 64, 175], bg: [239, 246, 255], accent: [147, 197, 253] },
    [ThemeType.UNDERWATER]: { primary: [21, 94, 117], bg: [236, 254, 255], accent: [103, 232, 249] },
    [ThemeType.FAIRY_TALE]: { primary: [157, 23, 77], bg: [255, 241, 242], accent: [249, 168, 212] },
    [ThemeType.DINOSAUR]: { primary: [146, 64, 14], bg: [255, 251, 235], accent: [252, 211, 77] }
  };
  return palettes[theme] || palettes[ThemeType.ADVENTURE];
};

/**
 * Generates a HIGH-QUALITY PDF with full-page images only.
 * Images already contain text from AI generation - no additional text needed.
 */
export const generateStorybookPDF = async (book: Storybook, isWatermarked: boolean = false): Promise<Blob> => {
  const palette = getThemePalette(book.theme);

  // Large square format for high resolution (10x10 inches)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'in',
    format: [10, 10],
    compress: false
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const addWatermark = () => {
    if (!isWatermarked) return;
    doc.saveGraphicsState();
    doc.setGState(doc.GState({ opacity: 0.15 }));
    doc.setFontSize(60);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'bold');
    for (let i = 0; i < 12; i += 3) {
      doc.text('PREVIEW ONLY', pageWidth / 2, i, { align: 'center', angle: 45 });
    }
    doc.restoreGraphicsState();
  };

  // ==========================================
  // 1. COVER PAGE (First image as full page)
  // ==========================================
  if (book.pages[0]?.imageUrl) {
    try {
      doc.addImage(book.pages[0].imageUrl, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'NONE');
    } catch (e) {
      console.warn("Cover image failed", e);
      doc.setFillColor(palette.primary[0], palette.primary[1], palette.primary[2]);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(40);
      doc.text(`${book.childName}'s Adventure`, pageWidth / 2, pageHeight / 2, { align: 'center' });
    }
  }
  addWatermark();

  // ==========================================
  // 2. DEDICATION PAGE
  // ==========================================
  doc.addPage();
  doc.setFillColor(palette.bg[0], palette.bg[1], palette.bg[2]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Decorative border
  doc.setDrawColor(palette.accent[0], palette.accent[1], palette.accent[2]);
  doc.setLineWidth(0.1);
  doc.rect(0.5, 0.5, pageWidth - 1, pageHeight - 1, 'D');

  doc.setTextColor(palette.primary[0], palette.primary[1], palette.primary[2]);
  doc.setFontSize(44);
  doc.setFont('helvetica', 'bold');
  doc.text('A Special Dedication', pageWidth / 2, 3, { align: 'center' });

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'italic');
  const dedication = `This magical ${book.theme} story was crafted especially for ${book.childName}.\n\nMay your imagination always take you on grand journeys!`;
  const splitDedication = doc.splitTextToSize(dedication, 7);
  doc.text(splitDedication, pageWidth / 2, 5, { align: 'center', lineHeightFactor: 1.8 });

  addWatermark();

  // ==========================================
  // 3. STORY PAGES - IMAGE + TEXT OVERLAY
  // ==========================================
  for (const page of book.pages) {
    doc.addPage();

    if (page.imageUrl) {
      try {
        // Full-page image with NO compression
        doc.addImage(page.imageUrl, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'NONE');
      } catch (e) {
        console.warn(`Page ${page.pageNumber} image failed`, e);
        doc.setFillColor(palette.bg[0], palette.bg[1], palette.bg[2]);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
      }
    }

    // Add text overlay at bottom of page (like the preview)
    if (page.text) {
      // Semi-transparent dark gradient overlay at bottom
      doc.saveGraphicsState();
      doc.setGState(doc.GState({ opacity: 0.75 }));
      doc.setFillColor(0, 0, 0);
      doc.rect(0, pageHeight - 2.5, pageWidth, 2.5, 'F');
      doc.restoreGraphicsState();

      // White text on the overlay
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'italic');

      // Split text to fit width (with padding)
      const textLines = doc.splitTextToSize(page.text, pageWidth - 1);
      const textY = pageHeight - 1.5;
      doc.text(textLines, pageWidth / 2, textY, { align: 'center', lineHeightFactor: 1.4 });
    }

    addWatermark();
  }

  // ==========================================
  // 4. BACK COVER
  // ==========================================
  doc.addPage();
  doc.setFillColor(palette.primary[0], palette.primary[1], palette.primary[2]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Decorative accent
  doc.setFillColor(palette.accent[0], palette.accent[1], palette.accent[2]);
  doc.saveGraphicsState();
  doc.setGState(doc.GState({ opacity: 0.3 }));
  doc.circle(pageWidth / 2, pageHeight / 2 - 1, 2.5, 'F');
  doc.restoreGraphicsState();

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(56);
  doc.setFont('helvetica', 'bold');
  doc.text('The End', pageWidth / 2, pageHeight / 2 - 0.5, { align: 'center' });

  doc.setFontSize(22);
  doc.setFont('helvetica', 'normal');
  doc.text('We hope you enjoyed your adventure!', pageWidth / 2, pageHeight / 2 + 0.8, { align: 'center' });

  doc.setFontSize(16);
  doc.setFont('helvetica', 'italic');
  doc.text(`Created with love for ${book.childName}`, pageWidth / 2, pageHeight / 2 + 1.8, { align: 'center' });

  doc.setFontSize(14);
  doc.text(`A MagicTales ${book.theme} Edition`, pageWidth / 2, pageHeight - 1, { align: 'center' });

  addWatermark();

  console.log('📄 [PDF] High-quality full-page PDF generated');
  return doc.output('blob');
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  console.log('📄 [PDF] Download started:', filename);
};
