using System;
using System.Collections.Generic;

namespace EstoqueCulinaria.Api.DTOs
{
    public class FoodItemDto
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Unit { get; set; } = "kg";
        public decimal MinQuantity { get; set; }
        public string? StorageLocation { get; set; }
        public string? Notes { get; set; }
        public string? Courses { get; set; }
        public List<string> CourseList { get; set; } = new();
        public decimal TotalQuantity { get; set; }
        public string StockStatus { get; set; } = "Normal"; // "Normal", "Baixo", "Zerado", "Vencido"
        public DateTime? NearestExpirationDate { get; set; }
        public string? NearestExpirationStatus { get; set; } // "Vencido", "Urgente", "Atencao", "Regular"
        public decimal EstimatedTotalValue { get; set; }
        public int ActiveBatchesCount { get; set; }
        public List<FoodBatchDto> Batches { get; set; } = new();
    }

    public class CreateFoodItemRequest
    {
        public string? Code { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Unit { get; set; } = "kg";
        public decimal MinQuantity { get; set; }
        public string? StorageLocation { get; set; }
        public string? Courses { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateFoodItemRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Unit { get; set; } = "kg";
        public decimal MinQuantity { get; set; }
        public string? StorageLocation { get; set; }
        public string? Courses { get; set; }
        public string? Notes { get; set; }
    }

    public class FoodBatchDto
    {
        public int Id { get; set; }
        public int FoodItemId { get; set; }
        public string FoodItemName { get; set; } = string.Empty;
        public string FoodItemCode { get; set; } = string.Empty;
        public string FoodItemUnit { get; set; } = string.Empty;
        public string FoodItemCategory { get; set; } = string.Empty;
        public string? FoodItemCourses { get; set; }
        public List<string> FoodItemCourseList { get; set; } = new();
        public string BatchNumber { get; set; } = string.Empty;
        
        // 1ª Validade: Data de validade original do produto/fabricante
        public DateTime ExpirationDate { get; set; }

        // Congelamento e 2ª Validade
        public bool IsFrozen { get; set; }
        public DateTime? FrozenDate { get; set; }
        public DateTime? FrozenExpirationDate { get; set; }
        public DateTime? ThawedDate { get; set; }
        public DateTime EffectiveExpirationDate { get; set; }

        public int DaysUntilExpiration { get; set; }
        public decimal InitialQuantity { get; set; }
        public decimal CurrentQuantity { get; set; }
        public decimal? UnitPrice { get; set; }
        public decimal? TotalBatchValue => CurrentQuantity * (UnitPrice ?? 0);
        public string? Supplier { get; set; }
        public DateTime? PurchaseDate { get; set; }
        public DateTime ReceivedDate { get; set; }
        public string? Notes { get; set; }
        public string ExpirationStatus { get; set; } = "Regular"; // "Vencido", "Urgente", "Atencao", "Regular"
    }

    public class StockTransactionDto
    {
        public int Id { get; set; }
        public int FoodItemId { get; set; }
        public string FoodItemName { get; set; } = string.Empty;
        public string FoodItemCode { get; set; } = string.Empty;
        public string FoodItemUnit { get; set; } = string.Empty;
        public int? FoodBatchId { get; set; }
        public string? BatchNumber { get; set; }
        public string TransactionType { get; set; } = "Saida"; // "Entrada", "Saida", "Ajuste"
        public string Reason { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public DateTime TransactionDate { get; set; }
        public string? Activity { get; set; }
        public string? Responsible { get; set; }
        public decimal? UnitPrice { get; set; }
        public decimal? TotalPrice { get; set; }
        public string? Notes { get; set; }
    }

    public class RegisterPurchaseRequest
    {
        public int FoodItemId { get; set; }
        public DateTime? PurchaseDate { get; set; }
        public DateTime? ReceivedDate { get; set; }
        public string? Supplier { get; set; }
        public decimal Quantity { get; set; }
        public decimal? UnitPrice { get; set; }
        public DateTime ExpirationDate { get; set; }
        public bool IsFrozen { get; set; } = false;
        public DateTime? FrozenDate { get; set; }
        public DateTime? FrozenExpirationDate { get; set; }
        public string? BatchNumber { get; set; }
        public string? Notes { get; set; }
    }

    public class FreezeBatchRequest
    {
        public int BatchId { get; set; }
        public DateTime? FrozenDate { get; set; }
        public DateTime FrozenExpirationDate { get; set; }
        public string? Notes { get; set; }
    }

    public class ThawBatchRequest
    {
        public int BatchId { get; set; }
        public DateTime? ThawedDate { get; set; }
        public DateTime ConsumeUntilDate { get; set; }
        public string? Notes { get; set; }
    }

    public class RegisterConsumptionRequest
    {
        public int FoodItemId { get; set; }
        // Se nulo ou 0, o sistema usa PVPS (Primeiro que Vence, Primeiro que Sai)
        public int? FoodBatchId { get; set; }
        public decimal Quantity { get; set; }
        public DateTime? TransactionDate { get; set; }
        public string? Activity { get; set; }
        public string? Responsible { get; set; }
        public string Reason { get; set; } = "Consumo em aula"; // "Consumo em aula", "Perda por vencimento", "Deterioração", "Descarte", "Ajuste de inventário"
        public string? Notes { get; set; }
    }

    public class StockAdjustmentRequest
    {
        public int FoodItemId { get; set; }
        public int? FoodBatchId { get; set; }
        public decimal PhysicalQuantity { get; set; }
        public string? Responsible { get; set; }
        public string Reason { get; set; } = "Conferência física";
        public string? Notes { get; set; }
    }

    public class DashboardDto
    {
        public int TotalItems { get; set; }
        public int LowStockCount { get; set; }
        public int ExpiringIn7DaysCount { get; set; }
        public int ExpiringIn30DaysCount { get; set; }
        public int ExpiredCount { get; set; }
        public decimal TotalEntriesThisMonth { get; set; }
        public decimal TotalConsumptionThisMonth { get; set; }
        public decimal TotalLossesThisMonth { get; set; }
        public decimal TotalStockEstimatedValue { get; set; }
        public List<FoodBatchDto> UrgentBatches { get; set; } = new();
        public List<FoodItemDto> LowStockItems { get; set; } = new();
        public List<StockTransactionDto> RecentTransactions { get; set; } = new();
    }

    public class MonthlyReportDto
    {
        public int Month { get; set; }
        public int Year { get; set; }
        public string MonthName { get; set; } = string.Empty;
        public string SchoolName { get; set; } = string.Empty;
        public DateTime GeneratedAt { get; set; }
        
        // Relatório de Estoque Atual
        public List<StockItemReportRow> CurrentStock { get; set; } = new();
        public decimal CurrentStockTotalValue { get; set; }
        
        // Relatório de Consumo Mensal
        public List<ConsumptionReportRow> Consumption { get; set; } = new();
        public decimal TotalConsumedQuantity { get; set; }
        public decimal TotalLossesQuantity { get; set; }
        public decimal TotalConsumedValue { get; set; }
        public decimal PreviousMonthConsumedQuantity { get; set; }
        
        // Relatório de Validade
        public List<FoodBatchDto> ExpiredBatches { get; set; } = new();
        public List<FoodBatchDto> BatchesExpiring7Days { get; set; } = new();
        public List<FoodBatchDto> BatchesExpiring30Days { get; set; } = new();
        public List<StockTransactionDto> LossesByExpiration { get; set; } = new();
        
        // Relatório de Compras Mensais
        public List<PurchaseReportRow> Purchases { get; set; } = new();
        public decimal TotalPurchasedQuantity { get; set; }
        public decimal TotalPurchasedValue { get; set; }
    }

    public class StockItemReportRow
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal CurrentQuantity { get; set; }
        public string Unit { get; set; } = string.Empty;
        public decimal MinQuantity { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? NearestExpiration { get; set; }
        public decimal EstimatedValue { get; set; }
        public string? StorageLocation { get; set; }
        public string? Notes { get; set; }
    }

    public class ConsumptionReportRow
    {
        public int FoodItemId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public decimal ConsumedQuantity { get; set; }
        public decimal WasteQuantity { get; set; }
        public decimal TotalOutQuantity { get; set; }
        public int TransactionsCount { get; set; }
        public decimal PreviousMonthQuantity { get; set; }
        public decimal? DifferencePercentage { get; set; }
    }

    public class PurchaseReportRow
    {
        public int TransactionId { get; set; }
        public string FoodItemName { get; set; } = string.Empty;
        public string FoodItemCode { get; set; } = string.Empty;
        public string FoodItemUnit { get; set; } = string.Empty;
        public string? Supplier { get; set; }
        public string? BatchNumber { get; set; }
        public DateTime ReceivedDate { get; set; }
        public DateTime? ExpirationDate { get; set; }
        public decimal Quantity { get; set; }
        public decimal? UnitPrice { get; set; }
        public decimal? TotalPrice { get; set; }
    }
}
