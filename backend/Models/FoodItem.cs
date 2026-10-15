using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace EstoqueCulinaria.Api.Models
{
    public class FoodItem
    {
        public int Id { get; set; }
        
        // Código de identificação único (ex: ALIM-001)
        public string Code { get; set; } = string.Empty;
        
        // Nome do alimento (ex: Farinha de Trigo Especial, Azeite Extra Virgem)
        public string Name { get; set; } = string.Empty;
        
        // Categoria (Grãos e Cereais, Farinhas, Laticínios, Carnes e Aves, Pescados, Hortaliças, Frutas, Temperos, Óleos, etc.)
        public string Category { get; set; } = string.Empty;
        
        // Unidade de medida (kg, g, L, ml, un, pct, cx)
        public string Unit { get; set; } = "kg";
        
        // Quantidade mínima desejada (Estoque mínimo para alertas)
        public decimal MinQuantity { get; set; } = 0;
        
        // Local de armazenamento (ex: Geladeira 1, Freezer Principal, Despensa Seca - Prateleira 2)
        public string? StorageLocation { get; set; }
        
        // Cursos que utilizam este insumo (ex: "Padeiro, Pizzaiolo, Confeitaria, Cozinha Geral")
        public string? Courses { get; set; } = "Padeiro, Pizzaiolo";
        
        // Observações gerais sobre o alimento
        public string? Notes { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Lotes de compra associados
        public List<FoodBatch> Batches { get; set; } = new();
        
        // Histórico de movimentações
        [JsonIgnore]
        public List<StockTransaction> Transactions { get; set; } = new();
    }
}
