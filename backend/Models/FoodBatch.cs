using System;
using System.Text.Json.Serialization;

namespace EstoqueCulinaria.Api.Models
{
    public class FoodBatch
    {
        public int Id { get; set; }
        public int FoodItemId { get; set; }
        
        [JsonIgnore]
        public FoodItem? FoodItem { get; set; }
        
        // Número ou código do lote (ex: LOTE-2026-10-01)
        public string BatchNumber { get; set; } = string.Empty;
        
        // 1ª Validade: Data de validade original do produto/fabricante (em refrigeração ou ambiente)
        public DateTime ExpirationDate { get; set; }
        
        // Controle de Congelamento Culinário (Pausa da validade original / 2ª Validade)
        public bool IsFrozen { get; set; } = false;
        
        // Data em que o alimento foi congelado
        public DateTime? FrozenDate { get; set; }
        
        // 2ª Validade: Nova data limite sob congelamento (-18°C)
        public DateTime? FrozenExpirationDate { get; set; }
        
        // Data em que foi retirado do freezer para descongelar
        public DateTime? ThawedDate { get; set; }
        
        // Validade Efetiva considerada para a regra PVPS e alertas:
        // Se estiver congelado com nova validade definida, usa a validade de congelado!
        public DateTime EffectiveExpirationDate => 
            (IsFrozen && FrozenExpirationDate.HasValue) ? FrozenExpirationDate.Value : ExpirationDate;

        // Quantidade original recebida
        public decimal InitialQuantity { get; set; }
        
        // Quantidade restante em estoque
        public decimal CurrentQuantity { get; set; }
        
        // Valor unitário pago (R$)
        public decimal? UnitPrice { get; set; }
        
        // Fornecedor da compra
        public string? Supplier { get; set; }
        
        // Data da compra
        public DateTime? PurchaseDate { get; set; }
        
        // Data do recebimento físico
        public DateTime ReceivedDate { get; set; } = DateTime.UtcNow;
        
        // Observações adicionais do lote
        public string? Notes { get; set; }
        
        // Ativo enquanto houver saldo disponível
        public bool IsActive => CurrentQuantity > 0;
    }
}
