/**
 * Study Mode Module - PDF Reader and Document Analysis
 * Handles PDF loading, rendering, and page-by-page analysis
 */

const StudyMode = (function() {
    // Private state
    let currentPdf = null;
    let currentPage = 1;
    let totalPages = 0;
    let pdfScale = 1.5;
    
    // PDF.js worker
    const pdfjsWorker = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    // Initialize module
    function init() {
        // Load PDF.js dynamically
        loadPdfJs();
        console.log('📚 Study Mode initialized');
    }
    
    // Load PDF.js library
    function loadPdfJs() {
        if (window.pdfjsLib) {
            console.log('PDF.js already loaded');
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
            pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
            console.log('PDF.js loaded successfully');
        };
        document.head.appendChild(script);
    }
    
    // Load PDF file
    async function loadPdf(file) {
        try {
            showLoadingState(true);
            
            // Read file as ArrayBuffer
            const arrayBuffer = await readFileAsArrayBuffer(file);
            
            // Load PDF document
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            currentPdf = await loadingTask.promise;
            
            totalPages = currentPdf.numPages;
            currentPage = 1;
            
            // Update UI
            document.getElementById('totalPages').textContent = totalPages;
            document.getElementById('currentPage').textContent = currentPage;
            updateNavigationButtons();
            
            // Render first page
            await renderPage(currentPage);
            
            // Cache the PDF
            await cachePdf(file.name, arrayBuffer);
            
            showLoadingState(false);
            
            console.log(`PDF loaded: ${totalPages} pages`);
            
        } catch (error) {
            console.error('Failed to load PDF:', error);
            showLoadingState(false);
            alert('Failed to load PDF: ' + error.message);
        }
    }
    
    // Read file as ArrayBuffer
    function readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }
    
    // Render specific page
    async function renderPage(pageNum) {
        if (!currentPdf) return;
        
        try {
            const page = await currentPdf.getPage(pageNum);
            const canvas = document.getElementById('pdfCanvas');
            const ctx = canvas.getContext('2d');
            
            // Calculate viewport
            const viewport = page.getViewport({ scale: pdfScale });
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            // Render page
            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };
            
            await page.render(renderContext).promise;
            
            // Update current page indicator
            document.getElementById('currentPage').textContent = pageNum;
            
            // Cache the rendered page
            await cacheRenderedPage(pageNum, canvas.toDataURL());
            
        } catch (error) {
            console.error('Failed to render page:', error);
        }
    }
    
    // Navigate to page
    async function navigateToPage(pageNum) {
        if (pageNum < 1 || pageNum > totalPages) return;
        
        currentPage = pageNum;
        await renderPage(currentPage);
        updateNavigationButtons();
    }
    
    // Update navigation button states
    function updateNavigationButtons() {
        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');
        
        prevBtn.disabled = currentPage <= 1;
        nextBtn.disabled = currentPage >= totalPages;
    }
    
    // Extract text from current page
    async function extractPageText(pageNum) {
        if (!currentPdf) return '';
        
        try {
            const page = await currentPdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            
            // Combine text items
            const text = textContent.items.map(item => item.str).join(' ');
            
            return text;
            
        } catch (error) {
            console.error('Failed to extract text:', error);
            return '';
        }
    }
    
    // Get all text from PDF
    async function getAllText() {
        if (!currentPdf) return '';
        
        const allText = [];
        for (let i = 1; i <= totalPages; i++) {
            const text = await extractPageText(i);
            allText.push(`--- Page ${i} ---\n${text}`);
        }
        
        return allText.join('\n\n');
    }
    
    // Cache PDF file
    async function cachePdf(filename, arrayBuffer) {
        const cacheKey = `pdf_${filename}`;
        await CacheModule.set(cacheKey, arrayBuffer, 86400); // 24 hours
    }
    
    // Cache rendered page
    async function cacheRenderedPage(pageNum, imageData) {
        const cacheKey = `pdf_page_${currentPage}_${pageNum}`;
        await CacheModule.set(cacheKey, imageData, 3600); // 1 hour
    }
    
    // Show/hide loading state
    function showLoadingState(loading) {
        const uploadBtn = document.getElementById('uploadPdfBtn');
        const analyzeBtn = document.getElementById('analyzePageBtn');
        
        if (loading) {
            uploadBtn.disabled = true;
            uploadBtn.textContent = '⏳ Loading...';
            analyzeBtn.disabled = true;
        } else {
            uploadBtn.disabled = false;
            uploadBtn.textContent = '📎 Upload PDF';
            analyzeBtn.disabled = !currentPdf;
        }
    }
    
    // Zoom in
    function zoomIn() {
        pdfScale = Math.min(pdfScale + 0.25, 3.0);
        if (currentPdf) {
            renderPage(currentPage);
        }
    }
    
    // Zoom out
    function zoomOut() {
        pdfScale = Math.max(pdfScale - 0.25, 0.5);
        if (currentPdf) {
            renderPage(currentPage);
        }
    }
    
    // Reset zoom
    function resetZoom() {
        pdfScale = 1.5;
        if (currentPdf) {
            renderPage(currentPage);
        }
    }
    
    // Search in PDF
    async function searchInPdf(query) {
        if (!currentPdf || !query) return [];
        
        const results = [];
        const lowerQuery = query.toLowerCase();
        
        for (let i = 1; i <= totalPages; i++) {
            const text = await extractPageText(i);
            if (text.toLowerCase().includes(lowerQuery)) {
                results.push({
                    page: i,
                    snippet: getSnippet(text, query)
                });
            }
        }
        
        return results;
    }
    
    // Get text snippet around match
    function getSnippet(text, query, contextLength = 100) {
        const index = text.toLowerCase().indexOf(query.toLowerCase());
        if (index === -1) return text.slice(0, contextLength * 2);
        
        const start = Math.max(0, index - contextLength);
        const end = Math.min(text.length, index + query.length + contextLength);
        
        return (start > 0 ? '...' : '') + 
               text.slice(start, end) + 
               (end < text.length ? '...' : '');
    }
    
    // Export annotations
    function exportAnnotations() {
        // TODO: Implement annotation export
        console.log('Export annotations not yet implemented');
    }
    
    // Public API
    return {
        init,
        loadPdf,
        renderPage,
        navigateToPage,
        extractPageText,
        getAllText,
        searchInPdf,
        zoomIn,
        zoomOut,
        resetZoom,
        
        // Getters
        get currentPage() { return currentPage; },
        get totalPages() { return totalPages; },
        get currentPdf() { return currentPdf; }
    };
})();

// Export to global scope
window.StudyMode = StudyMode;
