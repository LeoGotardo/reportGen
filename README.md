# ReportGen 🚀

**ReportGen** é uma ferramenta web moderna e intuitiva desenvolvida em **React** para a criação de relatórios técnicos profissionais. Focada em segurança da informação e desenvolvimento de software, a ferramenta permite gerar documentos estruturados como Relatórios de Bugs e Changelogs de forma rápida e padronizada.

---

## ✨ Funcionalidades Principais

O ReportGen oferece dois templates principais, cada um com campos específicos e personalização visual:

### 🛡️ Relatório de Bugs (Security Report)
Ideal para profissionais de segurança e QA documentarem vulnerabilidades.
- **Estrutura ABNT:** Formatação automática seguindo padrões técnicos.
- **Níveis de Severidade:** Classificação visual (Alta, Média, Baixa) com cores distintas.
- **Detalhamento Técnico:** Campos para "Onde ocorre", "Por que é um problema" e "Resolução sugerida".
- **Blocos de Código:** Suporte para inclusão de trechos de código com sintaxe destacada.

### 📝 Changelog / Mudanças
Perfeito para equipes de desenvolvimento registrarem a evolução de seus projetos.
- **Categorização de Mudanças:** Suporte para `feat`, `fix`, `breaking`, `refactor`, `perf`, `style` e `chore`.
- **Histórico de Versões:** Controle de versão do release, datas de início/fim e link para repositório.
- **Impacto e Motivação:** Campos dedicados para explicar o "porquê" de cada alteração.
- **Diferencial de Código:** Visualização clara de "antes" e "depois" das mudanças.

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando as melhores práticas do ecossistema React moderno:

- **[React 19](https://react.dev/):** Biblioteca principal para construção da interface.
- **[Vite](https://vitejs.dev/):** Ferramenta de build ultra-rápida para o desenvolvimento frontend.
- **[Bootstrap Icons](https://icons.getbootstrap.com/):** Conjunto de ícones consistente e leve.
- **CSS Custom Properties:** Sistema de temas dinâmico (Dark Mode nativo).
- **JSON Import/Export:** Portabilidade total dos dados do relatório.

---

## 🚀 Como Começar

### Pré-requisitos
Certifique-se de ter o [Node.js](https://nodejs.org/) instalado em sua máquina.

### Instalação
1. Clone o repositório:
   ```bash
   git clone https://github.com/LeoGotardo/reportGen.git
   ```
2. Acesse o diretório:
   ```bash
   cd reportGen
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```

### Desenvolvimento
Para rodar o projeto localmente:
```bash
npm run dev
```

### Build
Para gerar a versão de produção:
```bash
npm run build
```

---

## 📂 Estrutura do Projeto

```text
reportGen/
├── public/          # Ativos estáticos
├── src/
│   ├── assets/      # Imagens e SVGs
│   ├── App.jsx      # Lógica principal e componentes
│   ├── App.css      # Estilização global e variáveis
│   └── main.jsx     # Ponto de entrada da aplicação
├── index.html       # Template HTML principal
└── package.json     # Dependências e scripts
```

---

## 💡 Como Usar

1. **Selecione o Template:** Escolha entre "Relatório de Bugs" ou "Changelog" no cabeçalho.
2. **Preencha as Informações:** Utilize o editor à esquerda para inserir os dados.
3. **Visualize em Tempo Real:** O painel à direita mostra exatamente como o relatório ficará.
4. **Personalize:** Altere cores, logos e títulos conforme a necessidade.
5. **Exporte:** Salve seu progresso exportando o JSON ou utilize a função de impressão/exportação para gerar o documento final.

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes (se disponível).

---

Desenvolvido com ❤️ por [Leo Gotardo](https://github.com/LeoGotardo)
