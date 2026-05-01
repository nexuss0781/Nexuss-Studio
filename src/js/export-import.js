/**
 * Export/Import Module
 * Advanced data export and import functionality with multiple formats
 * Part of Infinite Free Ready PHP/JS Studio
 */

class ExportImportManager {
    constructor() {
        this.supportedFormats = ['json', 'csv', 'xml', 'markdown', 'html', 'pdf'];
        this.exportQueue = [];
        this.importQueue = [];
    }

    // ==================== EXPORT FUNCTIONS ====================

    async exportData(data, format = 'json', options = {}) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `export_${timestamp}.${format}`;

        switch (format.toLowerCase()) {
            case 'json':
                return this.exportAsJson(data, filename, options);
            case 'csv':
                return this.exportAsCsv(data, filename, options);
            case 'xml':
                return this.exportAsXml(data, filename, options);
            case 'markdown':
                return this.exportAsMarkdown(data, filename, options);
            case 'html':
                return this.exportAsHtml(data, filename, options);
            case 'pdf':
                return this.exportAsPdf(data, filename, options);
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
    }

    exportAsJson(data, filename, options = {}) {
        const jsonString = JSON.stringify(data, null, options.pretty ? 2 : 0);
        this.downloadFile(jsonString, filename, 'application/json');
        return { success: true, format: 'json', filename };
    }

    exportAsCsv(data, filename, options = {}) {
        if (!Array.isArray(data)) {
            data = [data];
        }

        const headers = options.headers || Object.keys(data[0] || {});
        const rows = [headers.join(',')];

        for (const item of data) {
            const row = headers.map(header => {
                const value = item[header] ?? '';
                const escaped = String(value).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            rows.push(row.join(','));
        }

        const csvString = rows.join('\n');
        this.downloadFile(csvString, filename, 'text/csv');
        return { success: true, format: 'csv', filename };
    }

    exportAsXml(data, filename, options = {}) {
        const rootName = options.rootName || 'data';
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += `<${rootName}>\n`;

        if (Array.isArray(data)) {
            for (const item of data) {
                xml += this.objectToXml(item, 'item');
            }
        } else {
            xml += this.objectToXml(data, 'item');
        }

        xml += `</${rootName}>`;
        this.downloadFile(xml, filename, 'application/xml');
        return { success: true, format: 'xml', filename };
    }

    objectToXml(obj, tagName) {
        let xml = `<${tagName}>`;
        
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'object' && value !== null) {
                xml += this.objectToXml(value, key);
            } else {
                xml += `<${key}>${this.escapeXml(String(value))}</${key}>`;
            }
        }
        
        xml += `</${tagName}>`;
        return xml;
    }

    escapeXml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    exportAsMarkdown(data, filename, options = {}) {
        let md = '';

        if (options.title) {
            md += `# ${options.title}\n\n`;
        }

        if (Array.isArray(data)) {
            // Create table
            const headers = Object.keys(data[0] || {});
            md += '| ' + headers.join(' | ') + ' |\n';
            md += '| ' + headers.map(() => '---').join(' | ') + ' |\n';

            for (const item of data) {
                const row = headers.map(h => String(item[h] ?? '').replace(/\|/g, '\\|'));
                md += '| ' + row.join(' | ') + ' |\n';
            }
        } else {
            // Key-value pairs
            for (const [key, value] of Object.entries(data)) {
                md += `**${key}**: ${value}\n\n`;
            }
        }

        if (options.footer) {
            md += `\n---\n\n${options.footer}`;
        }

        this.downloadFile(md, filename, 'text/markdown');
        return { success: true, format: 'markdown', filename };
    }

    exportAsHtml(data, filename, options = {}) {
        let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${options.title || 'Export'}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #4CAF50; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        h1 { color: #333; }
    </style>
</head>
<body>`;

        if (options.title) {
            html += `<h1>${options.title}</h1>`;
        }

        if (Array.isArray(data)) {
            const headers = Object.keys(data[0] || {});
            html += '<table><thead><tr>';
            headers.forEach(h => html += `<th>${h}</th>`);
            html += '</tr></thead><tbody>';

            for (const item of data) {
                html += '<tr>';
                headers.forEach(h => html += `<td>${item[h] ?? ''}</td>`);
                html += '</tr>';
            }

            html += '</tbody></table>';
        } else {
            html += '<dl>';
            for (const [key, value] of Object.entries(data)) {
                html += `<dt><strong>${key}</strong></dt><dd>${value}</dd>`;
            }
            html += '</dl>';
        }

        html += `</body></html>`;
        this.downloadFile(html, filename, 'text/html');
        return { success: true, format: 'html', filename };
    }

    async exportAsPdf(data, filename, options = {}) {
        // For PDF export, we'll generate HTML and use browser's print dialog
        // In production, you'd use a library like jsPDF or pdfmake
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${options.title || 'Export'}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #000; padding: 8px; }
                    h1 { color: #333; }
                </style>
            </head>
            <body>
                <h1>${options.title || 'Export'}</h1>
                ${JSON.stringify(data, null, 2)}
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.print();

        return { success: true, format: 'pdf', filename, note: 'Use print dialog to save as PDF' };
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // ==================== IMPORT FUNCTIONS ====================

    async importData(file, format = null) {
        return new Promise((resolve, reject) => {
            const detectedFormat = format || this.detectFormat(file.name);
            
            if (!detectedFormat) {
                reject(new Error('Unable to detect file format'));
                return;
            }

            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const content = event.target.result;
                    let data;

                    switch (detectedFormat) {
                        case 'json':
                            data = this.importFromJson(content);
                            break;
                        case 'csv':
                            data = this.importFromCsv(content);
                            break;
                        case 'xml':
                            data = this.importFromXml(content);
                            break;
                        default:
                            reject(new Error(`Import not supported for format: ${detectedFormat}`));
                            return;
                    }

                    resolve({ success: true, data, format: detectedFormat });
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));

            if (detectedFormat === 'json' || detectedFormat === 'xml' || detectedFormat === 'csv') {
                reader.readAsText(file);
            } else {
                reader.readAsDataURL(file);
            }
        });
    }

    detectFormat(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const formatMap = {
            'json': 'json',
            'csv': 'csv',
            'xml': 'xml',
            'md': 'markdown',
            'html': 'html',
            'htm': 'html',
            'pdf': 'pdf'
        };
        return formatMap[ext] || null;
    }

    importFromJson(content) {
        return JSON.parse(content);
    }

    importFromCsv(content) {
        const lines = content.trim().split('\n');
        if (lines.length < 2) return [];

        const headers = this.parseCsvLine(lines[0]);
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCsvLine(lines[i]);
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = values[index] ?? '';
            });
            data.push(obj);
        }

        return data;
    }

    parseCsvLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        result.push(current.trim());
        return result;
    }

    importFromXml(content) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(content, 'text/xml');
        
        const items = xmlDoc.getElementsByTagName('item');
        const data = [];

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const obj = {};
            
            for (const child of item.children) {
                if (child.children.length === 0) {
                    obj[child.tagName] = child.textContent;
                } else {
                    obj[child.tagName] = this.xmlToObject(child);
                }
            }
            
            data.push(obj);
        }

        return data;
    }

    xmlToObject(element) {
        const obj = {};
        
        for (const child of element.children) {
            if (child.children.length === 0) {
                obj[child.tagName] = child.textContent;
            } else {
                obj[child.tagName] = this.xmlToObject(child);
            }
        }
        
        return obj;
    }

    // ==================== UTILITY FUNCTIONS ====================

    exportChatHistory(messages, format = 'json') {
        const exportData = {
            exportedAt: new Date().toISOString(),
            totalMessages: messages.length,
            messages: messages.map(msg => ({
                role: msg.role,
                content: msg.content,
                timestamp: msg.timestamp,
                model: msg.model
            }))
        };

        return this.exportData(exportData, format, {
            title: 'Chat History Export',
            pretty: true
        });
    }

    exportProjectStructure(projectData, format = 'json') {
        return this.exportData(projectData, format, {
            title: 'Project Structure',
            pretty: true
        });
    }

    backupAllData(data) {
        const backup = {
            version: '1.0',
            createdAt: new Date().toISOString(),
            data: data
        };

        return this.exportData(backup, 'json', {
            pretty: true
        });
    }

    async restoreFromBackup(file) {
        const result = await this.importData(file, 'json');
        
        if (result.success) {
            if (result.data.version !== '1.0') {
                console.warn('Backup version mismatch');
            }
            return result.data.data;
        }
        
        throw new Error('Failed to restore backup');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExportImportManager;
}
