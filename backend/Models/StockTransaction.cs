using System;
using System.Text.Json.Serialization;

namespace EstoqueCulinaria.Api.Models
{
    public class StockTransaction
    {
        public int Id { get; set; }
        
        public int FoodItemId { get; set; }
        public FoodItem? FoodItem { get; set; }
        
        public int? FoodBatchId { get; set; }
        public FoodBatch? FoodBatch { get; set; }
        
        // Tipo: "Entrada", "Saida", "Ajuste"
        public string TransactionType { get; set; } = "Saida";
        
        // Motivo da movimentação:
        // Entradas: "Compra mensal", "Doação / Bônus", "Entrada avulsa"
        // Saídas: "Consumo em aula", "Perda por vencimento", "Deterioração", "Descarte", "Amostra / Degustação"
        // Ajustes: "Ajuste de inventário", "Conferência física"
        public string Reason { get; set; } = "Consumo em aula";
        
        // Quantidade movimentada (positiva)
        public decimal Quantity { get; set; }
        
        // Data e hora do registro/utilização
        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
        
        // Aula ou atividade prática de culinária
        public string? Activity { get; set; }
        
        // Responsável pelo registro (Chef / Monitor / Professor)
        public string? Responsible { get; set; }
        
        // Snapshot do lote movimentado
        public string? BatchNumber { get; set; }
        
        // Snapshot de valores financeiros (se aplicável)
        public decimal? UnitPrice { get; set; }
        public decimal? TotalPrice { get; set; }
        
        // Observações da movimentação
        public string? Notes { get; set; }
    }
}
