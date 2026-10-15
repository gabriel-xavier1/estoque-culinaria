# Sistema de Controle de Estoque de Alimentos - Curso de Culinária

Sistema desenvolvido para atender com precisão e simplicidade a rotina prática de um **Curso de Culinária & Gastronomia**, priorizando a prevenção de desperdícios, o princípio **PVPS (Primeiro que Vence, Primeiro que Sai)**, o acompanhamento rigoroso de validades, compras mensais e emissão automática de relatórios.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** [React.js](https://react.dev/) + [Vite](https://vite.dev/) + [Tailwind CSS](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/)
- **Backend:** [.NET 9 (C#)](https://dotnet.microsoft.com/) ASP.NET Core Web API
- **Banco de Dados:** SQLite com Entity Framework Core 9 (arquivo persistente `culinary_stock.db`)

---

## 🌟 Principais Funcionalidades Implementadas

1. **Painel Inicial (Dashboard):**
   - Indicadores essenciais (KPIs): Total de alimentos, estoque baixo, próximos do vencimento (7 e 30 dias), alimentos vencidos, volume de entradas no mês, consumo em aula e perdas/descartes.
   - **Banner de Segurança Alimentar:** alerta prioritário em caso de lotes vencidos para impedir o uso nas aulas práticas.
   - Destaque automático da regra PVPS (alimentos com validade mais próxima a serem consumidos primeiro).
   - Tabela de movimentações recentes.

2. **Cadastro Completo de Alimentos:**
   - Código automático (ex: `ALIM-001`, `ALIM-002`).
   - Nome, categoria culinária, unidade de medida (`kg`, `g`, `L`, `ml`, `un`, `pct`, `cx`).
   - Saldo atual calculado automaticamente a partir dos lotes ativos.
   - Estoque mínimo com sinalização de alerta.
   - Local de armazenamento (ex: Geladeira 1, Freezer Principal, Despensa Seca).
   - Visualização detalhada de todos os lotes vinculados.

3. **Compras e Entradas Mensais:**
   - Registro de recebimento mensal com data de compra, data de recebimento e fornecedor.
   - Preço unitário e cálculo automático do valor total investido (R$).
   - Separação individual por lotes de validade para controle fino.

4. **Consumo e Saídas de Aula:**
   - Registro rápido de ingredientes utilizados nas bancadas práticas.
   - Sugestão e alocação automática pelo método **PVPS** (prioriza o lote com validade mais próxima).
   - Validação que impede saídas superiores ao saldo disponível em estoque.
   - Motivos de saída: Consumo em aula, Perda por vencimento, Deterioração, Descarte e Ajuste.

5. **Controle de Validade & Prevenção de Desperdício:**
   - Classificação visual dos prazos:
     - 🔴 **Vencido:** Alerta sanitário, sinalizado para avaliação e bloqueado para consumo.
     - 🟠 **Até 7 dias:** Atenção prioritária para os planos de aula.
     - 🟡 **Até 30 dias:** Programar utilização.
     - 🟢 **Regular:** Situação regular.
   - Botão para descarte e baixa sanitária rápida com gravação da perda.
   - Prazos de alerta configuráveis (7 e 30 dias personalizáveis).

6. **Relatórios Mensais Automáticos:**
   - Seletor de Mês e Ano.
   - 4 relatórios completos:
     1. *Estoque Atual:* Quantidade, unidade, estoque mínimo, status e valor estimado em R$.
     2. *Consumo Mensal:* Ranking de uso em aula, comparação percentual com o mês anterior e perdas.
     3. *Validade:* Lotes críticos e perdas por vencimento.
     4. *Compras Mensais:* Itens adquiridos, gastos e comparação compras vs consumo.
   - Exportação para Excel (.csv) e impressão.

7. **Lista de Estoque para Impressão (A4):**
   - Página dedicada com folha de estilo `@media print` otimizada.
   - Oculta menus, botões e barras no momento da impressão física ou geração de PDF.
   - Inclui cabeçalho oficial da escola, data de emissão, mês de referência e **coluna em branco para conferência física manual e visto do chef**.

8. **Conferência Física de Estoque:**
   - Tela prática para o estoquista/professor comparar o saldo registrado com a contagem real nas prateleiras e registrar o ajuste de inventário auditado.

---

## 🚀 Como Executar o Projeto

### 1. Iniciar o Backend (.NET 9 Web API)
```bash
cd C:\estoque-culinaria\backend
dotnet run
```
> O backend iniciará em `http://localhost:5000` e criará automaticamente o banco SQLite `culinary_stock.db` pré-carregado com dados de exemplo de culinária.

### 2. Iniciar o Frontend (React + Vite)
```bash
cd C:\estoque-culinaria\frontend
npm run dev
```
> Acesse a aplicação no seu navegador em: `http://localhost:5173`
