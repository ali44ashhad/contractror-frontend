import jsPDF from 'jspdf';
import { ProjectReport } from '../types/report.types';
import { Update } from '../types/update.types';
import { UserReference } from '../types/update.types';

/**
 * Convert image URL to base64
 */
const imageToBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataURL);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      // If image fails to load, return a placeholder
      resolve('');
    };
    
    img.src = url;
  });
};

/**
 * Get member name helper
 */
const getMemberName = (member: string | UserReference): string => {
  if (typeof member === 'string') return 'Unknown';
  return member.name || member.email || 'Unknown';
};

/**
 * Format date for display
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format timestamp
 */
const formatTimestamp = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Add image to PDF with proper sizing
 */
const addImageToPDF = async (
  doc: jsPDF,
  imageData: string,
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number
): Promise<number> => {
  if (!imageData) return y;
  
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        let imgWidth = img.width;
        let imgHeight = img.height;
        const aspectRatio = imgWidth / imgHeight;
        
        // Convert pixels to mm (assuming 96 DPI)
        const pxToMm = 0.264583;
        imgWidth = imgWidth * pxToMm;
        imgHeight = imgHeight * pxToMm;
        
        // Resize to fit within max dimensions
        if (imgWidth > maxWidth) {
          imgWidth = maxWidth;
          imgHeight = imgWidth / aspectRatio;
        }
        if (imgHeight > maxHeight) {
          imgHeight = maxHeight;
          imgWidth = imgHeight * aspectRatio;
        }
        
        doc.addImage(imageData, 'JPEG', x, y, imgWidth, imgHeight);
        resolve(y + imgHeight + 5);
      } catch (error) {
        console.error('Error adding image to PDF:', error);
        resolve(y);
      }
    };
    
    img.onerror = () => {
      resolve(y);
    };
    
    img.src = imageData;
  });
};

/**
 * Export project report to PDF
 */
export const exportReportToPDF = async (
  report: ProjectReport,
  reportType: 'daily' | 'weekly',
  startDate: string,
  endDate: string
): Promise<void> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;
  const lineHeight = 7;
  const sectionSpacing = 10;

  // Helper function to check if new page is needed
  const checkNewPage = (requiredSpace: number = 20): void => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  // Helper function to add text with word wrap
  const addText = (text: string, fontSize: number, isBold: boolean = false, color: string = '#000000'): void => {
    checkNewPage(lineHeight * 2);
    doc.setFontSize(fontSize);
    doc.setTextColor(color);
    if (isBold) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    
    const lines = doc.splitTextToSize(text, contentWidth);
    lines.forEach((line: string) => {
      checkNewPage(lineHeight);
      doc.text(line, margin, yPosition);
      yPosition += lineHeight;
    });
    
    doc.setTextColor('#000000');
  };

  // Cover Page
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Project Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  doc.setFontSize(18);
  doc.setFont('helvetica', 'normal');
  doc.text(report.project.name, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  if (report.project.description) {
    doc.setFontSize(12);
    const descLines = doc.splitTextToSize(report.project.description, contentWidth);
    descLines.forEach((line: string) => {
      doc.text(line, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 6;
    });
  }

  yPosition += 10;
  doc.setFontSize(10);
  doc.text(`Report Type: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 6;
  doc.text(`Date Range: ${formatDate(startDate)} - ${formatDate(endDate)}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 6;
  doc.text(`Generated: ${new Date().toLocaleString('en-US')}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Summary Section
  checkNewPage(30);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  addText(`Project Status: ${report.project.status}`, 11);
  addText(`Number of Teams: ${report.teams.length}`, 11);
  addText(`Total Members: ${report.members.length}`, 11);
  yPosition += sectionSpacing;

  // Get sorted dates
  const sortedDates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const currentDate = new Date(start);
  
  while (currentDate <= end) {
    sortedDates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  sortedDates.sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  // Timeline Section
  for (const dateKey of sortedDates) {
    checkNewPage(40);
    yPosition += sectionSpacing;
    
    // Date header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    addText(formatDate(dateKey), 14, true);
    yPosition += 5;

    const dateUpdates = report.updatesByDate[dateKey] || {};

    // Process each member
    for (const member of report.members) {
      const memberId = typeof member === 'string' ? member : member._id;
      const memberName = getMemberName(member);
      const memberUpdate = dateUpdates[memberId] || { morning: null, evening: null };

      checkNewPage(50);
      
      // Member name
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      addText(memberName, 12, true);
      yPosition += 3;

      // Morning Update
      checkNewPage(30);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#1e40af');
      addText('Morning Update', 10, true, '#1e40af');
      doc.setTextColor('#000000');
      yPosition += 2;

      if (memberUpdate.morning) {
        yPosition = await addUpdateToPDF(doc, memberUpdate.morning, margin, yPosition, contentWidth, pageHeight, margin, checkNewPage, addText, addImageToPDF);
      } else {
        checkNewPage(lineHeight);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor('#666666');
        doc.text('No update posted', margin + 5, yPosition);
        doc.setTextColor('#000000');
        doc.setFont('helvetica', 'normal');
        yPosition += lineHeight;
      }
      yPosition += 10;

      // Evening Update
      checkNewPage(30);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#ea580c');
      addText('Evening Update', 10, true, '#ea580c');
      doc.setTextColor('#000000');
      yPosition += 2;

      if (memberUpdate.evening) {
        yPosition = await addUpdateToPDF(doc, memberUpdate.evening, margin, yPosition, contentWidth, pageHeight, margin, checkNewPage, addText, addImageToPDF);
      } else {
        checkNewPage(lineHeight);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor('#666666');
        doc.text('No update posted', margin + 5, yPosition);
        doc.setTextColor('#000000');
        doc.setFont('helvetica', 'normal');
        yPosition += lineHeight;
      }
      yPosition += 10;

      yPosition += 5;
    }
  }

  // Add page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Generate filename
  const projectName = report.project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const dateStr = startDate; 
  const filename = `${projectName}_${reportType}_report_${dateStr}.pdf`;

  // Save PDF
  doc.save(filename);
};

/**
 * Add update details to PDF
 */
const addUpdateToPDF = async (
  doc: jsPDF,
  update: Update,
  margin: number,
  startY: number,
  contentWidth: number,
  pageHeight: number,
  pageMargin: number,
  checkNewPage: (space?: number) => void,
  addText: (text: string, fontSize: number, isBold?: boolean, color?: string) => void,
  addImageToPDF: (doc: jsPDF, imageData: string, x: number, y: number, maxWidth: number, maxHeight: number) => Promise<number>
): Promise<number> => {
  let yPos = startY;
  const lineHeight = 6;
  const smallFontSize = 9;

  // Status
  checkNewPage(lineHeight);
  doc.setFontSize(smallFontSize);
  doc.setFont('helvetica', 'bold');
  doc.text('Status:', margin + 5, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(update.status, margin + 20, yPos);
  yPos += lineHeight;

  // Description
  if (update.updateDescription) {
    checkNewPage(lineHeight * 3);
    doc.setFontSize(smallFontSize);
    doc.setFont('helvetica', 'bold');
    doc.text('Description:', margin + 5, yPos);
    yPos += lineHeight;
    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(update.updateDescription, contentWidth - 10);
    descLines.forEach((line: string) => {
      checkNewPage(lineHeight);
      doc.text(line, margin + 5, yPos);
      yPos += lineHeight;
    });
  }

  // Timestamp
  checkNewPage(lineHeight);
  doc.setFontSize(smallFontSize);
  doc.setFont('helvetica', 'bold');
  doc.text('Timestamp:', margin + 5, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(formatTimestamp(update.timestamp), margin + 30, yPos);
  yPos += lineHeight + 3;

  // Documents
  if (update.documents && update.documents.length > 0) {
    checkNewPage(lineHeight * 2);
    doc.setFontSize(smallFontSize);
    doc.setFont('helvetica', 'bold');
    doc.text(`Documents (${update.documents.length}):`, margin + 5, yPos);
    yPos += lineHeight + 3;

    // Process documents in batches to avoid too many images
    const maxImagesPerUpdate = 6;
    const documentsToShow = update.documents.slice(0, maxImagesPerUpdate);

    for (let i = 0; i < documentsToShow.length; i++) {
      const docItem = documentsToShow[i];
      checkNewPage(50);

      // Document info
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const docInfo = docItem.fileName || `Document ${i + 1}`;
      doc.text(docInfo, margin + 5, yPos);
      
      // Location if available
      if (docItem.latitude !== undefined && docItem.longitude !== undefined) {
        yPos += 4;
        doc.setFontSize(7);
        doc.text(
          `📍 Lat: ${docItem.latitude.toFixed(6)}, Lng: ${docItem.longitude.toFixed(6)}`,
          margin + 5,
          yPos
        );
      }
      yPos += 4;

      // Try to load and add image
      try {
        const imageData = await imageToBase64(docItem.filePath);
        if (imageData) {
          const maxImageWidth = contentWidth - 10;
          const maxImageHeight = 40;
          yPos = await addImageToPDF(doc, imageData, margin + 5, yPos, maxImageWidth, maxImageHeight);
          yPos += 3;
        } else {
          doc.setFontSize(7);
          doc.setTextColor('#666666');
          doc.text('[Image could not be loaded]', margin + 5, yPos);
          doc.setTextColor('#000000');
          yPos += 8;
        }
      } catch (error) {
        doc.setFontSize(7);
        doc.setTextColor('#666666');
        doc.text('[Image could not be loaded]', margin + 5, yPos);
        doc.setTextColor('#000000');
        yPos += 8;
      }

      yPos += 3;
    }

    if (update.documents.length > maxImagesPerUpdate) {
      checkNewPage(lineHeight);
      doc.setFontSize(8);
      doc.setTextColor('#666666');
      doc.text(
        `+${update.documents.length - maxImagesPerUpdate} more document(s)`,
        margin + 5,
        yPos
      );
      doc.setTextColor('#000000');
      yPos += lineHeight;
    }
  }

  return yPos;
};

