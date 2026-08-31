import type { Lesson, Course } from '../data/courses';

export function downloadLesson(lesson: Lesson, course: Course) {
  // Converte Markdown básico para HTML
  const htmlContent = convertMarkdownToHTML(lesson.content);

  const fullHTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${lesson.title} — ${course.name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: #050816;
      color: #E5E7EB;
      padding: 40px 20px;
      line-height: 1.7;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      border-bottom: 2px solid ${course.color};
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .planet {
      color: ${course.color};
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    h1 {
      font-size: 32px;
      margin: 10px 0;
      color: #FFFFFF;
    }
    h2 {
      color: ${course.color};
      margin: 30px 0 15px;
      font-size: 24px;
    }
    h3 {
      color: #FFFFFF;
      margin: 20px 0 10px;
      font-size: 18px;
    }
    p {
      margin: 12px 0;
      color: #D1D5DB;
    }
    code {
      background: #111827;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      color: #00D4FF;
    }
    pre {
      background: #0A1020;
      border: 1px solid #1F2937;
      border-left: 3px solid ${course.color};
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 16px 0;
    }
    pre code {
      background: transparent;
      padding: 0;
      color: #E5E7EB;
    }
    ul, ol {
      margin: 12px 0 12px 24px;
      color: #D1D5DB;
    }
    li { margin: 6px 0; }
    strong { color: #FFFFFF; }
    .code-example {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #1F2937;
    }
    .code-example h2 {
      color: #00FF88;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #1F2937;
      text-align: center;
      color: #6B7280;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="planet">${course.icon} ${course.planetName}</div>
    <h1>${lesson.title}</h1>
    <p style="color:#9CA3AF">${lesson.description}</p>
  </div>

  <div class="content">
    ${htmlContent}
  </div>

  ${
    lesson.codeExample
      ? `<div class="code-example">
        <h2>💻 Exemplo de Código</h2>
        <pre><code>${escapeHtml(lesson.codeExample)}</code></pre>
      </div>`
      : ''
  }

  <div class="footer">
    <p>📡 Lição baixada do <strong>CodeQuest Nexus</strong></p>
    <p>Estude offline. Volte online para marcar progresso.</p>
  </div>
</body>
</html>`;

  // Cria o blob e dispara o download
  const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${course.slug}-${lesson.id}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Conversor simples de Markdown para HTML
function convertMarkdownToHTML(markdown: string): string {
  let html = escapeHtml(markdown);

  // Títulos
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bloco de código
  html = html.replace(
    /```(\w+)?\n([\s\S]*?)```/g,
    (_match, _lang, code) => `<pre><code>${code.trim()}</code></pre>`
  );

  // Código inline
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Negrito
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Itálico
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Listas
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // Parágrafos
  html = html
    .split('\n\n')
    .map((block) => {
      if (
        block.startsWith('<h') ||
        block.startsWith('<pre') ||
        block.startsWith('<ul')
      ) {
        return block;
      }
      return `<p>${block.replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n');

  return html;
}
