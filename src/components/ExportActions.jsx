import React from 'react';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { FileDown, FileText } from 'lucide-react';

const ExportActions = ({ text, disabled }) => {

    const exportPDF = () => {
        const doc = new jsPDF();

        // Split text to fit page
        const splitText = doc.splitTextToSize(text, 180);
        let y = 10;
        const pageHeight = doc.internal.pageSize.height;

        // Simple pagination handling
        splitText.forEach(line => {
            if (y > pageHeight - 10) {
                doc.addPage();
                y = 10;
            }
            doc.text(line, 10, y);
            y += 7; // line height
        });

        doc.save('transcription.pdf');
    };

    const exportDOCX = () => {
        // DOCX requires paragraphs
        // We split by newlines to create basic paragraphs
        const paragraphs = text.split('\n').map(line =>
            new Paragraph({
                children: [
                    new TextRun(line)
                ],
                spacing: {
                    after: 200 // twip
                }
            })
        );

        const doc = new Document({
            sections: [{
                properties: {},
                children: paragraphs,
            }],
        });

        Packer.toBlob(doc).then((blob) => {
            saveAs(blob, "transcription.docx");
        });
    };

    return (
        <div className="export-actions">
            <button
                className="btn-secondary"
                onClick={exportPDF}
                disabled={disabled || !text}
                title="Export as PDF"
            >
                <FileText size={18} style={{ marginRight: '8px' }} />
                Export PDF
            </button>
            <button
                className="btn-secondary"
                onClick={exportDOCX}
                disabled={disabled || !text}
                title="Export as DOCX"
            >
                <FileDown size={18} style={{ marginRight: '8px' }} />
                Export DOCX
            </button>
        </div>
    );
};

export default ExportActions;
