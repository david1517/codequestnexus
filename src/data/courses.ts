export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  codeExample?: string;
  language: string;
  duration: number;
  xpReward: number;
}

export interface Course {
  id: string;
  slug: string;
  name: string;
  planetName: string;
  description: string;
  icon: string;
  color: string;
  language: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  totalXp: number;
  lessons: Lesson[];
}

export const COURSES: Course[] = [
  {
    id: 'html',
    slug: 'html',
    name: 'HTML',
    planetName: 'Terra Digital',
    description: 'Aprenda a estruturar paginas web do zero.',
    icon: '🌐',
    color: '#00D4FF',
    language: 'html',
    level: 'Iniciante',
    totalXp: 150,
    lessons: [
      {
        id: 'html-1',
        title: 'Introducao ao HTML',
        description: 'O que e HTML e como ele funciona na web.',
        content: `# Introducao ao HTML

HTML (HyperText Markup Language) e a **linguagem de marcacao** padrao para criar paginas web.

## O que voce vai aprender
- O que e HTML
- Como funciona a estrutura basica
- Como criar seu primeiro arquivo HTML

## Estrutura Basica

Todo documento HTML segue esta estrutura:

\`\`\`html
<!DOCTYPE html>
<html>
  <head>
    <title>Minha Pagina</title>
  </head>
  <body>
    <h1>Ola, Mundo!</h1>
  </body>
</html>
\`\`\`

## Tags Principais
- \`<html>\` — raiz do documento
- \`<head>\` — informacoes invisiveis
- \`<body>\` — conteudo visivel
- \`<h1>\` a \`<h6>\` — titulos
- \`<p>\` — paragrafos`,
        codeExample: `<!DOCTYPE html>
<html>
  <head>
    <title>Minha Primeira Pagina</title>
  </head>
  <body>
    <h1>Ola, Mundo!</h1>
    <p>Esta e minha primeira pagina HTML.</p>
  </body>
</html>`,
        language: 'html',
        duration: 10,
        xpReward: 30,
      },
      {
        id: 'html-2',
        title: 'Tags de Texto',
        description: 'Aprenda a formatar textos em HTML.',
        content: `# Tags de Texto

HTML oferece varias tags para formatar textos.

## Tags Comuns
- \`<strong>\` — texto em negrito
- \`<em>\` — texto em italico
- \`<br>\` — quebra de linha
- \`<hr>\` — linha horizontal`,
        codeExample: `<p>Este texto tem <strong>negrito</strong> e <em>italico</em>.</p>`,
        language: 'html',
        duration: 8,
        xpReward: 30,
      },
      {
        id: 'html-3',
        title: 'Listas e Links',
        description: 'Crie listas e links de navegacao.',
        content: `# Listas e Links

## Lista Nao Ordenada
Use \`<ul>\` com \`<li>\`:
\`\`\`html
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
\`\`\`

## Links
Use a tag \`<a>\`:
\`\`\`html
<a href="https://google.com">Ir para Google</a>
\`\`\``,
        codeExample: `<ul>
  <li>HTML</li>
  <li>CSS</li>
  <li>JavaScript</li>
</ul>`,
        language: 'html',
        duration: 10,
        xpReward: 30,
      },
    ],
  },
  {
    id: 'css',
    slug: 'css',
    name: 'CSS',
    planetName: 'Neon City',
    description: 'Estilize suas paginas com cores e layouts.',
    icon: '🎨',
    color: '#8B5CF6',
    language: 'css',
    level: 'Iniciante',
    totalXp: 100,
    lessons: [
      {
        id: 'css-1',
        title: 'Introducao ao CSS',
        description: 'O que e CSS e como aplica-lo.',
        content: `# Introducao ao CSS

CSS (Cascading Style Sheets) estiliza documentos HTML.

## Como aplicar CSS
1. Inline: \`<p style="color: red">\`
2. Interno: tag \`<style>\`
3. Externo: arquivo \`.css\`

## Sintaxe Basica
\`\`\`css
seletor {
  propriedade: valor;
}
\`\`\``,
        codeExample: `body {
  background-color: #050816;
  color: white;
}`,
        language: 'css',
        duration: 12,
        xpReward: 35,
      },
      {
        id: 'css-2',
        title: 'Cores e Fundos',
        description: 'Trabalhe com cores e gradientes.',
        content: `# Cores e Fundos

## Formas de definir cores
- Nome: \`red\`, \`blue\`
- Hex: \`#FF0000\`
- RGB: \`rgb(255, 0, 0)\`

## Gradientes
\`\`\`css
background: linear-gradient(90deg, #00D4FF, #8B5CF6);
\`\`\``,
        codeExample: `.caixa {
  background: linear-gradient(135deg, #00D4FF, #8B5CF6);
  padding: 20px;
}`,
        language: 'css',
        duration: 10,
        xpReward: 35,
      },
    ],
  },
  {
    id: 'javascript',
    slug: 'javascript',
    name: 'JavaScript',
    planetName: 'Cyber Core',
    description: 'De vida as suas paginas com programacao.',
    icon: '⚡',
    color: '#FFD700',
    language: 'javascript',
    level: 'Intermediário',
    totalXp: 120,
    lessons: [
      {
        id: 'js-1',
        title: 'Introducao ao JavaScript',
        description: 'Variaveis, tipos de dados e operadores.',
        content: `# Introducao ao JavaScript

JavaScript e a **linguagem de programacao** da web.

## Variaveis
\`\`\`javascript
let nome = "Coder";
const idade = 25;
\`\`\`

## Tipos de Dados
- \`string\` — texto
- \`number\` — numeros
- \`boolean\` — true/false
- \`array\` — listas
- \`object\` — objetos`,
        codeExample: `let nome = "CodeQuest";
let xp = 100;
console.log("Jogador: " + nome);`,
        language: 'javascript',
        duration: 15,
        xpReward: 40,
      },
      {
        id: 'js-2',
        title: 'Funcoes',
        description: 'Crie blocos de codigo reutilizaveis.',
        content: `# Funcoes

## Declaracao de Funcao
\`\`\`javascript
function saudacao(nome) {
  return "Ola, " + nome;
}
\`\`\`

## Arrow Function
\`\`\`javascript
const saudacao = (nome) => "Ola, " + nome;
\`\`\``,
        codeExample: `function calcularXp(nivel) {
  return 100 * nivel;
}`,
        language: 'javascript',
        duration: 12,
        xpReward: 45,
      },
    ],
  },
  {
    id: 'typescript',
    slug: 'typescript',
    name: 'TypeScript',
    planetName: 'Quantum Station',
    description: 'JavaScript com superpoderes: tipos e seguranca.',
    icon: '🔷',
    color: '#3178C6',
    language: 'typescript',
    level: 'Intermediário',
    totalXp: 80,
    lessons: [
      {
        id: 'ts-1',
        title: 'Tipos Basicos',
        description: 'Aprenda os tipos primitivos do TypeScript.',
        content: `# Tipos Basicos

TypeScript adiciona **tipagem estatica** ao JavaScript.

\`\`\`typescript
let nome: string = "Coder";
let nivel: number = 10;
let ativo: boolean = true;
\`\`\``,
        codeExample: `interface Jogador {
  nome: string;
  nivel: number;
}

const jogador: Jogador = {
  nome: "Neo",
  nivel: 42
};`,
        language: 'typescript',
        duration: 12,
        xpReward: 40,
      },
    ],
  },
  {
    id: 'react',
    slug: 'react',
    name: 'React',
    planetName: 'React Nexus',
    description: 'Construa interfaces modernas com componentes.',
    icon: '⚛️',
    color: '#61DAFB',
    language: 'tsx',
    level: 'Intermediário',
    totalXp: 60,
    lessons: [
      {
        id: 'react-1',
        title: 'Introducao ao React',
        description: 'Componentes, JSX e props.',
        content: `# Introducao ao React

React e uma biblioteca para criar **interfaces de usuario**.

## Componente Basico
\`\`\`tsx
function Saudacao({ nome }: { nome: string }) {
  return <h1>Ola, {nome}!</h1>;
}
\`\`\``,
        codeExample: `function Botao() {
  return <button>Clique aqui</button>;
}`,
        language: 'tsx',
        duration: 15,
        xpReward: 50,
      },
    ],
  },
  {
    id: 'nodejs',
    slug: 'nodejs',
    name: 'Node.js',
    planetName: 'Backend Colony',
    description: 'JavaScript no servidor.',
    icon: '🟢',
    color: '#339933',
    language: 'javascript',
    level: 'Intermediário',
    totalXp: 50,
    lessons: [
      {
        id: 'node-1',
        title: 'Introducao ao Node.js',
        description: 'O que e Node.js e como usa-lo.',
        content: `# Introducao ao Node.js

Node.js permite rodar JavaScript **fora do navegador**.

\`\`\`javascript
const http = require('http');
http.createServer((req, res) => {
  res.end('Ola, Mundo!');
}).listen(3000);
\`\`\``,
        codeExample: `console.log("Servidor Node.js rodando!");`,
        language: 'javascript',
        duration: 12,
        xpReward: 40,
      },
    ],
  },
  {
    id: 'python',
    slug: 'python',
    name: 'Python',
    planetName: 'AI Planet',
    description: 'Linguagem versatil para IA, dados e automacao.',
    icon: '🐍',
    color: '#00FF88',
    language: 'python',
    level: 'Iniciante',
    totalXp: 50,
    lessons: [
      {
        id: 'py-1',
        title: 'Introducao ao Python',
        description: 'Sintaxe basica e variaveis.',
        content: `# Introducao ao Python

Python e uma linguagem **simples e poderosa**.

\`\`\`python
nome = "Coder"
nivel = 10
print(f"Jogador: {nome}")
\`\`\``,
        codeExample: `def saudacao(nome):
    return f"Ola, {nome}!"

print(saudacao("CodeQuest"))`,
        language: 'python',
        duration: 10,
        xpReward: 35,
      },
    ],
  },
  {
    id: 'java',
    slug: 'java',
    name: 'Java',
    planetName: 'Enterprise World',
    description: 'A linguagem corporativa.',
    icon: '☕',
    color: '#F89820',
    language: 'java',
    level: 'Avançado',
    totalXp: 50,
    lessons: [
      {
        id: 'java-1',
        title: 'Introducao ao Java',
        description: 'Classes, objetos e o Hello World.',
        content: `# Introducao ao Java

Java e uma linguagem **orientada a objetos**.

\`\`\`java
public class Main {
  public static void main(String[] args) {
    System.out.println("Ola, Mundo!");
  }
}
\`\`\``,
        codeExample: `public class Jogador {
  public static void main(String[] args) {
    System.out.println("CodeQuest");
  }
}`,
        language: 'java',
        duration: 12,
        xpReward: 40,
      },
    ],
  },
  {
    id: 'sql',
    slug: 'sql',
    name: 'SQL',
    planetName: 'Data Matrix',
    description: 'Consulte e manipule bancos de dados.',
    icon: '🗄️',
    color: '#E48E00',
    language: 'sql',
    level: 'Intermediário',
    totalXp: 50,
    lessons: [
      {
        id: 'sql-1',
        title: 'SELECT e WHERE',
        description: 'Consultas basicas em SQL.',
        content: `# Comandos Basicos SQL

## SELECT
\`\`\`sql
SELECT * FROM usuarios;
\`\`\`

## WHERE
\`\`\`sql
SELECT nome FROM usuarios WHERE nivel > 10;
\`\`\``,
        codeExample: `SELECT username, xp
FROM usuarios
WHERE nivel >= 5
ORDER BY xp DESC
LIMIT 10;`,
        language: 'sql',
        duration: 10,
        xpReward: 35,
      },
    ],
  },
  {
    id: 'git',
    slug: 'git',
    name: 'Git',
    planetName: 'Version Control Base',
    description: 'Controle de versao para seus projetos.',
    icon: '🔀',
    color: '#F05032',
    language: 'bash',
    level: 'Iniciante',
    totalXp: 50,
    lessons: [
      {
        id: 'git-1',
        title: 'Comandos Basicos do Git',
        description: 'init, add, commit, push, pull.',
        content: `# Git Basico

## Inicializar repositorio
\`\`\`bash
git init
git add .
git commit -m "Primeiro commit"
\`\`\`

## Conectar ao GitHub
\`\`\`bash
git remote add origin URL
git push -u origin main
\`\`\``,
        codeExample: `git status
git add .
git commit -m "feat: nova feature"`,
        language: 'bash',
        duration: 10,
        xpReward: 30,
      },
    ],
  },
];

export function getCourseBySlug(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug);
}

export function getLessonById(courseSlug: string, lessonId: string) {
  const course = getCourseBySlug(courseSlug);
  if (!course) return null;
  const lesson = course.lessons.find((l) => l.id === lessonId);
  if (!lesson) return null;
  return { course, lesson };
}

export function getAllCourses() {
  return COURSES.map((course) => ({
    ...course,
    totalLessons: course.lessons.length,
  }));
}
