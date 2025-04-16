# Deepseek AI Chat To PDF

**Deepseek AI Chat To PDF** is a browser extension designed to seamlessly convert your AI chat conversations from the Deepseek AI platform into well-formatted PDF documents. Whether you need to archive, share, or reference your chats, this tool simplifies the process with support for mathematical expressions (via LaTeX and KaTeX) and clean, professional output. Built with modern web technologies, it’s lightweight, user-friendly, and highly functional.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Dependencies](#dependencies)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Chat-to-PDF Conversion**: Transform your Deepseek AI chat history into a downloadable PDF with a single click.
- **LaTeX Support**: Render mathematical expressions accurately using KaTeX, ideal for technical or academic chats.
- **SVG Graphics**: Incorporate vector graphics and diagrams with SVG.js for enhanced visual output.
- **User-Friendly Interface**: A fixed "Download Chat as PDF" button integrates seamlessly into the chat page.
- **Progress Feedback**: Real-time updates during PDF generation (e.g., "Processing 50%").
- **Custom PDF Formatting**: Includes labeled "User" and "Assistant" messages, page numbers, and 1-inch margins.
- **Browser Compatibility**: Works as an extension for Chrome, Firefox, and other supported browsers.

---

## Installation

**Deepseek AI Chat To PDF** is a browser extension that can be installed in developer mode. Follow the instructions below based on your browser.

### Google Chrome

1. Clone or download the repository:
   ```bash
   git clone https://github.com/KidusB9/Deepseek-AI-Chat-To-PDF.git
   ```
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer Mode** (toggle in the top-right corner).
4. Click **Load Unpacked** and select the folder containing the cloned repository.
5. The extension will appear in your extensions list and be ready to use.

### Mozilla Firefox

1. Clone or download the repository:
   ```bash
   git clone https://github.com/KidusB9/Deepseek-AI-Chat-To-PDF.git
   ```
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on** and select the `manifest.json` file from the repository folder.
4. The extension will be installed temporarily. (For permanent installation, package it as an XPI file.)

---

## Usage

After installation, using the extension is straightforward:

1. **Open Deepseek AI Chat**: Visit the Deepseek AI chat platform in your browser.
2. **Locate the Button**: A "Download Chat as PDF" button will appear as a fixed element at the bottom-right corner of the page.
3. **Generate the PDF**:
   - Click the "Download Chat as PDF" button.
   - The extension will process the chat content, render mathematical expressions (e.g., `$x^2 + 1$`), and create a PDF.
   - Progress updates (e.g., "Processing 75%") will display on the button.
4. **Download**: Once complete, the PDF will download automatically with a filename like `chat-history-YYYY-MM-DD.pdf`.

### Tips
- Ensure the chat content is fully loaded and visible on the page before generating the PDF.
- For chats with heavy mathematical content, rendering may take slightly longer due to KaTeX processing.
- Check the browser console (`Ctrl+Shift+J` or `Cmd+Option+J`) if you encounter issues.

---

## Dependencies

The project relies on the following external libraries, bundled within the repository:

- **[html2canvas](https://html2canvas.hertzen.com/)**: Captures HTML elements as canvas images for PDF inclusion.
- **[html2pdf.bundle.min.js](https://ekoopmans.github.io/html2pdf.js/)**: Converts HTML content to PDF format.
- **[jsPDF](https://github.com/parallax/jsPDF)**: Core library for generating PDF documents.
- **[KaTeX](https://katex.org/)**: Renders LaTeX mathematical expressions (`katex.min.js` and `katex.min.css`).
- **[SVG.js](https://svgjs.dev/)**: Handles SVG graphics and diagrams (`svgjs` and `tex-svgjs`).

These dependencies enable the extension’s core functionality and are included as minified files.

---

## Contributing

We welcome contributions to enhance **Deepseek AI Chat To PDF**! To get involved:

1. **Fork the Repository**: Create your own copy of the project.
2. **Create a Branch**: Work on your changes in a new branch (e.g., `feature/add-dark-mode`).
3. **Submit a Pull Request**: Provide a clear description of your changes when submitting.

For bug reports or feature requests, please open an issue on the [GitHub repository](https://github.com/KidusB9/Deepseek-AI-Chat-To-PDF/issues). Ensure your code is well-documented and adheres to best practices.

---

## License

This project is licensed under the [MIT License](LICENSE). Feel free to use, modify, and distribute it according to the license terms.

---