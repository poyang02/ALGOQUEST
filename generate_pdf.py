import os
import subprocess
import sys
from pygments import highlight
from pygments.lexers import get_lexer_for_filename, TextLexer
from pygments.formatters import HtmlFormatter

# Target folders and files
BASE_DIR = r"d:\ALGOQUEST"
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
FRONTEND_SRC_DIR = os.path.join(BASE_DIR, "frontend", "client", "src")
OUTPUT_HTML = os.path.join(BASE_DIR, "source_code.html")
OUTPUT_PDF = os.path.join(BASE_DIR, "algoquest_source_code.pdf")

# Files to exclude or ignore
EXCLUDE_DIRS = {"node_modules", "build", "dist", ".git", ".gemini"}
EXCLUDE_FILES = {"package-lock.json", "generate_pdf.py", "source_code.html", "algoquest_source_code.pdf"}
ALLOWED_EXTENSIONS = {".js", ".jsx", ".ts", ".tsx", ".css", ".json", ".html"}

def get_all_source_files():
    source_files = []
    
    # Check backend directory
    if os.path.exists(BACKEND_DIR):
        for root, dirs, files in os.walk(BACKEND_DIR):
            # Prune exclude directories
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            for file in files:
                if file in EXCLUDE_FILES:
                    continue
                ext = os.path.splitext(file)[1].lower()
                if ext in ALLOWED_EXTENSIONS:
                    full_path = os.path.join(root, file)
                    rel_path = os.path.relpath(full_path, BASE_DIR)
                    source_files.append((full_path, rel_path))
                    
    # Check frontend src directory
    if os.path.exists(FRONTEND_SRC_DIR):
        for root, dirs, files in os.walk(FRONTEND_SRC_DIR):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            for file in files:
                if file in EXCLUDE_FILES:
                    continue
                ext = os.path.splitext(file)[1].lower()
                if ext in ALLOWED_EXTENSIONS:
                    full_path = os.path.join(root, file)
                    rel_path = os.path.relpath(full_path, BASE_DIR)
                    source_files.append((full_path, rel_path))
                    
    # Sort files: backend first, then frontend client root files, then components, etc.
    # We can sort by path
    source_files.sort(key=lambda x: x[1])
    return source_files

def main():
    print("Collecting source files...")
    files = get_all_source_files()
    print(f"Found {len(files)} files to compile.")
    
    # We will use Pygments with a clean light theme, e.g. "default" or "colorful" or "vs"
    # Light theme is much better for PDF print out.
    formatter = HtmlFormatter(style="colorful", cssclass="highlight", linenos=True)
    pygments_css = formatter.get_style_defs('.highlight')
    
    # Generate HTML content
    html_content = []
    
    # Header of HTML
    html_content.append("""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Algoquest Source Code</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        
        :root {
            --primary: #4F46E5;
            --primary-light: #EEF2F6;
            --text-dark: #1E293B;
            --text-muted: #64748B;
            --border-color: #E2E8F0;
            --bg-code: #F8FAFC;
        }
        
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            color: var(--text-dark);
            margin: 0;
            padding: 0;
            line-height: 1.5;
            background: #ffffff;
        }
        
        pre {
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            margin: 0;
        }
        
        /* Pygments styles */
        """ + pygments_css + """
        
        /* Layout & Spacing */
        .page {
            page-break-after: always;
            padding: 40px;
            box-sizing: border-box;
            min-height: 100vh;
            position: relative;
        }
        
        /* Cover Page Styling */
        .cover-page {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            height: 90vh;
            page-break-after: always;
        }
        
        .cover-logo {
            font-size: 64px;
            font-weight: 800;
            background: linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
            letter-spacing: -2px;
        }
        
        .cover-subtitle {
            font-size: 20px;
            color: var(--text-muted);
            margin-bottom: 50px;
            font-weight: 400;
        }
        
        .cover-meta {
            margin-top: 100px;
            border-top: 1px solid var(--border-color);
            padding-top: 30px;
            width: 300px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .meta-item {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
        }
        
        .meta-label {
            color: var(--text-muted);
            font-weight: 500;
        }
        
        .meta-value {
            font-weight: 600;
        }
        
        /* Table of Contents Styling */
        .toc-page {
            padding: 60px 40px;
        }
        
        .section-title {
            font-size: 28px;
            font-weight: 700;
            border-bottom: 2px solid var(--primary);
            padding-bottom: 8px;
            margin-bottom: 30px;
            color: var(--primary);
        }
        
        .toc-list {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .toc-item {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            font-size: 14px;
            border-bottom: 1px dotted var(--border-color);
            padding-bottom: 4px;
        }
        
        .toc-link {
            text-decoration: none;
            color: var(--text-dark);
            font-weight: 500;
        }
        
        .toc-link:hover {
            color: var(--primary);
        }
        
        .toc-page-num {
            color: var(--text-muted);
            font-weight: 600;
            font-family: 'JetBrains Mono', monospace;
        }
        
        /* File Page Styling */
        .file-page {
            page-break-before: always;
            padding: 50px 40px;
        }
        
        .file-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 12px;
            margin-bottom: 20px;
        }
        
        .file-path {
            font-size: 18px;
            font-weight: 700;
            color: var(--text-dark);
            font-family: 'JetBrains Mono', monospace;
        }
        
        .file-meta {
            display: flex;
            gap: 15px;
            font-size: 12px;
            color: var(--text-muted);
        }
        
        .file-meta-item {
            background: var(--primary-light);
            color: var(--primary);
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: 600;
        }
        
        /* Code Container Styling */
        .code-container {
            border: 1px solid var(--border-color);
            border-radius: 8px;
            background: var(--bg-code);
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        
        /* Pygments line numbers and code table alignment */
        .highlight {
            width: 100%;
        }
        
        .highlight table {
            border-spacing: 0;
            width: 100%;
        }
        
        .highlight td {
            padding: 2px 8px;
        }
        
        .highlight td.linenos {
            text-align: right;
            padding-right: 12px;
            color: var(--text-muted);
            background-color: #F1F5F9;
            border-right: 1px solid var(--border-color);
            user-select: none;
            width: 40px;
        }
        
        .highlight td.code {
            padding-left: 15px;
            white-space: pre-wrap;
            word-break: break-all;
        }
        
        /* Page number footer via CSS Paged Media */
        @page {
            margin: 15mm;
            @bottom-right {
                content: counter(page);
                font-family: 'JetBrains Mono', monospace;
                font-size: 10px;
                color: #64748B;
            }
            @bottom-left {
                content: "ALGOQUEST Source Code";
                font-family: 'Plus Jakarta Sans', sans-serif;
                font-size: 10px;
                color: #64748B;
            }
        }
    </style>
</head>
<body>
""")
    
    # 1. Cover Page
    html_content.append(f"""
    <div class="cover-page">
        <div class="cover-logo">ALGOQUEST</div>
        <div class="cover-subtitle">Complete Source Code Directory & Documentation</div>
        <div class="cover-meta">
            <div class="meta-item">
                <span class="meta-label">Project</span>
                <span class="meta-value">Algoquest Game</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Purpose</span>
                <span class="meta-value">Innovation Challenge</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Date</span>
                <span class="meta-value">June 2026</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Total Files</span>
                <span class="meta-value">{len(files)} Source Files</span>
            </div>
        </div>
    </div>
    """)
    
    # 2. Table of Contents Page
    html_content.append("""
    <div class="toc-page">
        <div class="section-title">Table of Contents</div>
        <ul class="toc-list">
    """)
    
    for i, (full_path, rel_path) in enumerate(files):
        # We can link using anchor link (anchor is file index to avoid path characters issues)
        html_content.append(f"""
            <li class="toc-item">
                <a href="#file-{i}" class="toc-link">{rel_path}</a>
                <span class="toc-page-num">{i + 3}</span>
            </li>
        """)
        
    html_content.append("""
        </ul>
    </div>
    """)
    
    # 3. Source Files Pages
    for i, (full_path, rel_path) in enumerate(files):
        print(f"Processing file: {rel_path}")
        
        # Read file contents
        try:
            with open(full_path, "r", encoding="utf-8") as f:
                code_text = f.read()
        except UnicodeDecodeError:
            try:
                # Try latin-1 fallback
                with open(full_path, "r", encoding="latin-1") as f:
                    code_text = f.read()
            except Exception as e:
                code_text = f"// Error reading file content: {e}"
        except Exception as e:
            code_text = f"// Error reading file: {e}"
            
        # Get appropriate lexer
        try:
            lexer = get_lexer_for_filename(full_path)
        except Exception:
            lexer = TextLexer()
            
        # Format the code to HTML
        highlighted_code = highlight(code_text, lexer, formatter)
        
        # File info
        line_count = len(code_text.splitlines())
        size_kb = os.path.getsize(full_path) / 1024.0
        
        html_content.append(f"""
        <div class="file-page" id="file-{i}">
            <div class="file-header">
                <div class="file-path">{rel_path}</div>
                <div class="file-meta">
                    <span class="file-meta-item">{line_count} lines</span>
                    <span class="file-meta-item">{size_kb:.2f} KB</span>
                    <span class="file-meta-item">{lexer.name}</span>
                </div>
            </div>
            <div class="code-container">
                {highlighted_code}
            </div>
        </div>
        """)
        
    # Closing HTML tags
    html_content.append("""
</body>
</html>
""")
    
    # Write full HTML content to output file
    with open(OUTPUT_HTML, "w", encoding="utf-8") as f:
        f.write("\n".join(html_content))
    print(f"Generated intermediate HTML at {OUTPUT_HTML}")
    
    # Convert to PDF using Microsoft Edge Headless
    print("Converting HTML to PDF via Microsoft Edge Headless...")
    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    
    # CLI command to print to pdf
    cmd = [
        edge_path,
        "--headless",
        "--disable-gpu",
        f"--print-to-pdf={OUTPUT_PDF}",
        "--no-pdf-header-footer",  # Remove Edge default page header (date/url) and footer (page number/title)
        OUTPUT_HTML
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print(f"Successfully generated PDF at {OUTPUT_PDF}")
    except subprocess.CalledProcessError as e:
        print(f"Error printing to PDF: {e}")
        print(f"Stdout: {e.stdout}")
        print(f"Stderr: {e.stderr}")
        sys.exit(1)
        
if __name__ == "__main__":
    main()
