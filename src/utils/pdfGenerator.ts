import type { Lesson, Course } from '../data/courses';

export function downloadLessonPDF(lesson: Lesson, course: Course) {
  // Cria conteudo HTML formatado para PDF
  const htmlContent = convertMarkdownToHTML(lesson.content);

  // Janela de impressao com conteudo estilizado
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Permita pop-ups para baixar o PDF');
    return;
  }

  const fullHTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${lesson.title} - ${course.name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @page { size: A4; margin: 2cm; }
    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      background: white;
      color: #1F2937;
      padding: 40px;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      border-bottom: 4px solid ${course.color};
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .planet-badge {
      display: inline-block;
      background: ${course.color}20;
      color: ${course.color};
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }
    h1 {
      font-size: 32px;
      color: #050816;
      margin: 10px 0;
    }
    .description {
      color: #6B7280;
      font-size: 15px;
      font-style: italic;
    }
    .meta {
      display: flex;
      gap: 20px;
      margin-top: 15px;
      font-size: 13px;
      color: #6B7280;
    }
    .meta span { display: inline-flex; align-items: center; gap: 5px; }
    h2 {
      color: ${course.color};
      font-size: 22px;
      margin: 30px 0 15px;
      border-left: 4px solid ${course.color};
      padding-left: 12px;
    }
    h3 {
      color: #1F2937;
      font-size: 18px;
      margin: 20px 0 10px;
    }
    p { margin: 12px 0; color: #374151; }
    ul, ol { margin: 12px 0 12px 24px; color: #374151; }
    li { margin: 6px 0; }
    code {
      background: #F3F4F6;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      color: #DC2626;
    }
    pre {
      background: #1F2937;
      color: #F9FAFB;
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 16px 0;
      border-left: 4px solid ${course.color};
    }
    pre code {
      background: transparent;
      padding: 0;
      color: #F9FAFB;
      font-size: 13px;
    }
    strong { color: #050816; }
    .code-section {
      margin-top: 30px;
      page-break-inside: avoid;
    }
    .code-title {
      background: #10B981;
      color: white;
      padding: 8px 16px;
      border-radius: 6px 6px 0 0;
      font-size: 14px;
      font-weight: 700;
    }
    .code-section pre {
      border-radius: 0 0 6px 6px;
      margin-top: 0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #E5E7EB;
      text-align: center;
      color: #9CA3AF;
      font-size: 11px;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="planet-badge">${course.icon} ${course.planetName}</div>
    <h1>${lesson.title}</h1>
    <p class="description">${lesson.description}</p>
    <div class="meta">
      <span>⏱ ${lesson.duration} min</span>
      <span>⚡ +${lesson.xpReward} XP</span>
      <span>💻 ${lesson.language}</span>
    </div>
  </div>

  <div class="content">
    ${htmlContent}
  </div>

  ${
    lesson.codeExample
      ? `<div class="code-section">
        <div class="code-title">💻 Codigo de Exemplo (${lesson.language})</div>
        <pre><code>${escapeHtml(lesson.codeExample)}</code></pre>
      </div>`
      : ''
  }

  <div class="footer">
    <p><strong>CodeQuest Nexus</strong> - Material de Estudo</p>
    <p>Baixado em ${new Date().toLocaleDateString('pt-BR')}</p>
  </div>

  <div class="no-print" style="text-align:center;margin-top:30px;">
    <button onclick="window.print()" style="background:#00D4FF;color:black;padding:12px 24px;border:none;border-radius:5px;font-weight:bold;cursor:pointer;">
      🖨️ Salvar como PDF
    </button>
    <p style="margin-top:10px;font-size:12px;color:#6B7280;">
      Na janela de impressão, escolha "Salvar como PDF"
    </p>
  </div>
</body>
</html>`;

  printWindow.document.write(fullHTML);
  printWindow.document.close();
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function convertMarkdownToHTML(markdown: string): string {
  let html = escapeHtml(markdown);
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_m, _l, c) => `<pre><code>${c.trim()}</code></pre>`);
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  html = html
    .split('\n\n')
    .map((block) => {
      if (block.startsWith('<h') || block.startsWith('<pre') || block.startsWith('<ul')) return block;
      return `<p>${block.replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n');
  return html;
}
