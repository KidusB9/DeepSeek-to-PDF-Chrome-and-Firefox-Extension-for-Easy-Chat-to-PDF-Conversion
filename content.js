'use strict';

class ChatToPDF {
  constructor() {
    this.isProcessing = false;
    this.chatContainer = null;
    this.downloadButton = null;
    this.init();
  }

  /** Updates the button text to show progress */
  updateProgress(percent) {
    if (this.downloadButton) {
      this.downloadButton.textContent = `Processing ${percent}%`;
    }
  }

  /** Generates the PDF */
  async generatePDF() {
    if (this.isProcessing) {
      alert('Already processing, please wait.');
      return;
    }
    this.isProcessing = true;
    this.updateProgress(0);

    try {
      // Detect the chat container
      this.chatContainer = this.detectChatContainer();
      if (!this.chatContainer) {
        throw new Error('Chat container not detected.');
      }
      this.updateProgress(10);

      // Clone and prepare the chat container
      const chatClone = this.chatContainer.cloneNode(true);
      this.updateProgress(20);

      // Create a temporary container for rendering
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px'; // Offscreen
      tempContainer.style.width = '1000px'; // Arbitrary width, scaled later
      document.body.appendChild(tempContainer);
      tempContainer.appendChild(chatClone);

      // Render math with KaTeX
      await this.renderMathWithKaTeX(tempContainer);
      this.updateProgress(50);

      // Create PDF with proper layout
      await this.createPDF(tempContainer);
      this.updateProgress(100);

      // Clean up
      document.body.removeChild(tempContainer);
      alert('Chat history saved successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Check console for details.');
    } finally {
      this.isProcessing = false;
      if (this.downloadButton) {
        this.downloadButton.textContent = 'Download Chat as PDF';
      }
    }
  }

  /** Finds the chat container on the page */
  detectChatContainer() {
    const selectors = [
      '[data-chat-container]', '.chat-container', '.conversation',
      '#messages', '.chat-history', 'main', '[role="log"]', 'body'
    ];
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim().length > 0) {
        return element;
      }
    }
    return null;
  }

  /** Renders math formulas using KaTeX in inline mode */
  async renderMathWithKaTeX(element) {
    if (!window.katex) {
      throw new Error('KaTeX not loaded. Ensure katex.min.js is injected.');
    }
    const mathElements = element.querySelectorAll('span, div');
    for (const el of mathElements) {
      const text = el.textContent.trim();
      if ((text.startsWith('$') && text.endsWith('$')) || (text.startsWith('$$') && text.endsWith('$$'))) {
        const math = text.startsWith('$$') ? text.slice(2, -2) : text.slice(1, -1);
        try {
          window.katex.render(math, el, {
            throwOnError: false,
            displayMode: false // Inline rendering
          });
        } catch (error) {
          console.error('KaTeX render failed:', error);
        }
      }
    }
  }

  /** Creates the PDF, ensuring content fits with 1-inch margins */
  async createPDF(renderedContainer) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    
    // Set 1-inch (25.4 mm) margins
    const margin = 25.4;
    const pageWidth = doc.internal.pageSize.getWidth() - 2 * margin; // 158.2 mm for A4
    const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm for A4
    let yPosition = margin + 10;

    // Add title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Chat History', margin, margin);
    yPosition += 5;

    // Layout constants
    const labelHeight = 5; // mm
    const gap = 5; // mm
    const minImageHeight = 20; // mm, minimum image height to avoid orphaned labels

    // Get all message elements
    const messageElements = renderedContainer.querySelectorAll(
      '[class*="message"], [data-message], .chat-message, div'
    );

    for (const msgEl of messageElements) {
      // Skip empty or invisible elements
      if (!msgEl.textContent.trim() || msgEl.style.display === 'none' || msgEl.style.visibility === 'hidden') {
        console.warn('Skipping empty or hidden element:', msgEl);
        continue;
      }

      // Ensure valid dimensions
      const rect = msgEl.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        console.warn('Skipping element with zero dimensions:', msgEl);
        continue;
      }

      try {
        // Convert message to canvas
        const canvas = await this.elementToCanvas(msgEl);
        const pixWidth = canvas.width;
        const pixHeight = canvas.height;

        // Calculate dimensions in mm based on CSS pixels
        let widthMm = (rect.width / 96) * 25.4;
        let heightMm = (rect.height / 96) * 25.4;

        // Scale if too wide
        if (widthMm > pageWidth) {
          const scaleFactor = pageWidth / widthMm;
          widthMm = pageWidth;
          heightMm *= scaleFactor;
        }

        // Determine if user or assistant message
        const isUser = msgEl.closest('.user, .human, [data-user], [class*="user"]') !== null;

        // Check if there's enough space for label and minimum image height
        if (yPosition + labelHeight + Math.min(heightMm, minImageHeight) > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }

        // Add label
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(isUser ? 'User:' : 'Assistant:', margin, yPosition);
        yPosition += labelHeight;

        // Add image, splitting if necessary
        let remainingHeightMm = heightMm;
        let currentPixY = 0;

        while (remainingHeightMm > 0) {
          const availableMm = pageHeight - margin - yPosition;
          if (availableMm <= 0) {
            doc.addPage();
            yPosition = margin;
            continue;
          }

          // Calculate height for this part
          const partHeightMm = Math.min(availableMm, remainingHeightMm);
          const partPixHeight = (partHeightMm / heightMm) * pixHeight;

          // Create a canvas for this part
          const partCanvas = document.createElement('canvas');
          partCanvas.width = pixWidth;
          partCanvas.height = partPixHeight;
          const ctx = partCanvas.getContext('2d');
          ctx.drawImage(canvas, 0, currentPixY, pixWidth, partPixHeight, 0, 0, pixWidth, partPixHeight);

          // Add to PDF
          doc.addImage(partCanvas.toDataURL('image/png'), 'PNG', margin, yPosition, widthMm, partHeightMm);

          // Update positions
          yPosition += partHeightMm;
          currentPixY += partPixHeight;
          remainingHeightMm -= partHeightMm;
        }

        // Add gap after message
        yPosition += gap;
      } catch (error) {
        console.error('Failed to render message:', error);
      }
    }

    // Add page numbers
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${totalPages}`, margin, pageHeight - 10);
    }

    doc.save(`chat-history-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  /** Converts an element to canvas */
  async elementToCanvas(element) {
    try {
      const canvas = await html2canvas(element, {
        scale: 2, // Higher resolution for quality
        useCORS: true,
        logging: true,
        width: element.scrollWidth,
        height: element.scrollHeight
      });
      return canvas;
    } catch (error) {
      console.error('html2canvas failed:', error);
      throw error;
    }
  }

  /** Adds the download button */
  injectButton() {
    const button = document.createElement('button');
    button.textContent = 'Download Chat as PDF';
    Object.assign(button.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '12px 24px',
      backgroundColor: '#28a745',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '16px',
      zIndex: '9999',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      minWidth: '200px',
    });
    button.addEventListener('click', () => this.generatePDF());
    document.body.appendChild(button);
    this.downloadButton = button;
  }

  /** Initializes the extension and loads KaTeX */
  init() {
    console.log('Initializing ChatToPDF extension');

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL('katex.min.css');
    document.head.appendChild(link);
    console.log('KaTeX CSS injected');

    const katexJsUrl = chrome.runtime.getURL('katex.min.js');
    fetch(katexJsUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch katex.min.js: ${response.status}`);
        }
        return response.text();
      })
      .then(scriptText => {
        const script = document.createElement('script');
        script.textContent = scriptText;
        document.body.appendChild(script);
        setTimeout(() => {
          if (window.katex) {
            console.log('KaTeX loaded successfully! Version:', window.katex.version);
            this.injectButton();
          } else {
            console.error('KaTeX failed to initialize');
            alert('KaTeX failed to load. Check console.');
          }
        }, 500);
      })
      .catch(error => {
        console.error('Error loading KaTeX:', error);
        alert('Failed to load KaTeX. Check console.');
      });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ChatToPDF());
} else {
  new ChatToPDF();
}