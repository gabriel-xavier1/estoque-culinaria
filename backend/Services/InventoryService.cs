using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EstoqueCulinaria.Api.Data;
using EstoqueCulinaria.Api.DTOs;
using EstoqueCulinaria.Api.Models;

namespace EstoqueCulinaria.Api.Services
{
    public interface IInventoryService
    {
        Task<List<FoodItemDto>> GetAllFoodItemsAsync(string? category = null, string? search = null, string? course = null);
        Task<FoodItemDto?> GetFoodItemByIdAsync(int id);
        Task<FoodItemDto> CreateFoodItemAsync(CreateFoodItemRequest request);
        Task<FoodItemDto?> UpdateFoodItemAsync(int id, UpdateFoodItemRequest request);
        Task<bool> DeleteFoodItemAsync(int id);

        Task<List<FoodBatchDto>> GetAllBatchesAsync(bool activeOnly = true, string? status = null);
        Task<List<FoodBatchDto>> GetBatchesByFoodItemAsync(int foodItemId, bool activeOnly = true);
        Task<FoodBatchDto?> GetPVPSBatchAsync(int foodItemId);

        Task<FoodBatchDto> RegisterPurchaseAsync(RegisterPurchaseRequest request);
        Task<FoodBatchDto> FreezeBatchAsync(FreezeBatchRequest request);
        Task<FoodBatchDto> ThawBatchAsync(ThawBatchRequest request);
        Task<StockTransactionDto> RegisterConsumptionAsync(RegisterConsumptionRequest request);
        Task<StockTransactionDto> AdjustStockAsync(StockAdjustmentRequest request);

        Task<List<StockTransactionDto>> GetTransactionsAsync(int? foodItemId = null, string? type = null, int? month = null, int? year = null);
        Task<DashboardDto> GetDashboardAsync();
        Task<MonthlyReportDto> GetMonthlyReportAsync(int month, int year);

        Task<AlertConfig> GetAlertConfigAsync();
        Task<AlertConfig> UpdateAlertConfigAsync(AlertConfig config);

        Task<object> ExportBackupAsync();
        Task<bool> ImportBackupAsync(object backupData);
    }

    public class InventoryService : IInventoryService
    {
        private readonly AppDbContext _context;

        public InventoryService(AppDbContext context)
        {
            _context = context;
        }

        private async Task<AlertConfig> GetConfigAsync()
        {
            var config = await _context.AlertConfigs.FirstOrDefaultAsync();
            if (config == null)
            {
                config = new AlertConfig { Id = 1, UrgentDays = 7, AttentionDays = 30, SchoolName = "Escola de Culinária" };
                _context.AlertConfigs.Add(config);
                await _context.SaveChangesAsync();
            }
            return config;
        }

        public async Task<List<FoodItemDto>> GetAllFoodItemsAsync(string? category = null, string? search = null, string? course = null)
        {
            var config = await GetConfigAsync();
            var query = _context.FoodItems
                .Include(f => f.Batches)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(category) && category != "Todos")
            {
                query = query.Where(f => f.Category.ToLower() == category.ToLower());
            }

            if (!string.IsNullOrWhiteSpace(course) && course != "Todos")
            {
                var c = course.ToLower().Trim();
                query = query.Where(f => f.Courses != null && f.Courses.ToLower().Contains(c));
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.ToLower().Trim();
                query = query.Where(f => f.Name.ToLower().Contains(s) || f.Code.ToLower().Contains(s) || (f.StorageLocation != null && f.StorageLocation.ToLower().Contains(s)));
            }

            var items = await query.OrderBy(f => f.Name).ToListAsync();
            return items.Select(f => MapToFoodItemDto(f, config)).ToList();
        }

        public async Task<FoodItemDto?> GetFoodItemByIdAsync(int id)
        {
            var config = await GetConfigAsync();
            var item = await _context.FoodItems
                .Include(f => f.Batches)
                .FirstOrDefaultAsync(f => f.Id == id);

            return item == null ? null : MapToFoodItemDto(item, config);
        }

        public async Task<FoodItemDto> CreateFoodItemAsync(CreateFoodItemRequest request)
        {
            // Auto generate code if not provided
            string code = request.Code?.Trim().ToUpper() ?? "";
            if (string.IsNullOrWhiteSpace(code))
            {
                var maxId = await _context.FoodItems.MaxAsync(f => (int?)f.Id) ?? 0;
                code = $"ALIM-{(maxId + 1):D3}";
            }

            // Check code uniqueness
            if (await _context.FoodItems.AnyAsync(f => f.Code == code))
            {
                var count = await _context.FoodItems.CountAsync();
                code = $"ALIM-{(count + 1):D3}";
            }

            var item = new FoodItem
            {
                Code = code,
                Name = request.Name.Trim(),
                Category = request.Category.Trim(),
                Unit = request.Unit.Trim(),
                MinQuantity = request.MinQuantity,
                StorageLocation = request.StorageLocation?.Trim(),
                Courses = string.IsNullOrWhiteSpace(request.Courses) ? "Padeiro, Pizzaiolo" : request.Courses.Trim(),
                Notes = request.Notes?.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            _context.FoodItems.Add(item);
            await _context.SaveChangesAsync();

            var config = await GetConfigAsync();
            return MapToFoodItemDto(item, config);
        }

        public async Task<FoodItemDto?> UpdateFoodItemAsync(int id, UpdateFoodItemRequest request)
        {
            var item = await _context.FoodItems
                .Include(f => f.Batches)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (item == null) return null;

            item.Name = request.Name.Trim();
            item.Category = request.Category.Trim();
            item.Unit = request.Unit.Trim();
            item.MinQuantity = request.MinQuantity;
            item.StorageLocation = request.StorageLocation?.Trim();
            item.Courses = request.Courses?.Trim();
            item.Notes = request.Notes?.Trim();

            await _context.SaveChangesAsync();

            var config = await GetConfigAsync();
            return MapToFoodItemDto(item, config);
        }

        public async Task<bool> DeleteFoodItemAsync(int id)
        {
            var item = await _context.FoodItems.FindAsync(id);
            if (item == null) return false;

            _context.FoodItems.Remove(item);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<FoodBatchDto>> GetAllBatchesAsync(bool activeOnly = true, string? status = null)
        {
            var config = await GetConfigAsync();
            var query = _context.FoodBatches
                .Include(b => b.FoodItem)
                .AsQueryable();

            if (activeOnly)
            {
                query = query.Where(b => b.CurrentQuantity > 0);
            }

            var batches = await query.ToListAsync();
            var orderedBatches = batches.OrderBy(b => b.EffectiveExpirationDate).ToList();

            var list = orderedBatches.Select(b => MapToBatchDto(b, config)).ToList();

            if (!string.IsNullOrWhiteSpace(status) && status != "Todos")
            {
                list = list.Where(b => b.ExpirationStatus.Equals(status, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            return list;
        }

        public async Task<List<FoodBatchDto>> GetBatchesByFoodItemAsync(int foodItemId, bool activeOnly = true)
        {
            var config = await GetConfigAsync();
            var query = _context.FoodBatches
                .Include(b => b.FoodItem)
                .Where(b => b.FoodItemId == foodItemId);

            if (activeOnly)
            {
                query = query.Where(b => b.CurrentQuantity > 0);
            }

            var batches = await query.ToListAsync();
            var orderedBatches = batches.OrderBy(b => b.EffectiveExpirationDate).ToList();
            return orderedBatches.Select(b => MapToBatchDto(b, config)).ToList();
        }

        // Returns PVPS recommended batch (earliest effective expiration among active batches)
        public async Task<FoodBatchDto?> GetPVPSBatchAsync(int foodItemId)
        {
            var config = await GetConfigAsync();
            var batches = await _context.FoodBatches
                .Include(b => b.FoodItem)
                .Where(b => b.FoodItemId == foodItemId && b.CurrentQuantity > 0)
                .ToListAsync();

            var batch = batches.OrderBy(b => b.EffectiveExpirationDate).FirstOrDefault();
            return batch == null ? null : MapToBatchDto(batch, config);
        }

        public async Task<FoodBatchDto> RegisterPurchaseAsync(RegisterPurchaseRequest request)
        {
            if (request.Quantity <= 0)
                throw new ArgumentException("A quantidade recebida deve ser maior que zero.");

            var foodItem = await _context.FoodItems.FindAsync(request.FoodItemId);
            if (foodItem == null)
                throw new ArgumentException("Alimento não encontrado.");

            var receivedDate = request.ReceivedDate ?? DateTime.UtcNow;
            var purchaseDate = request.PurchaseDate ?? receivedDate;

            // Generate BatchNumber if not given
            string batchNumber = request.BatchNumber?.Trim() ?? "";
            if (string.IsNullOrWhiteSpace(batchNumber))
            {
                batchNumber = $"LOT-{receivedDate:yyyyMMdd}-{request.FoodItemId}";
            }

            var batch = new FoodBatch
            {
                FoodItemId = request.FoodItemId,
                BatchNumber = batchNumber,
                ExpirationDate = request.ExpirationDate.Date,
                IsFrozen = request.IsFrozen,
                FrozenDate = request.IsFrozen ? (request.FrozenDate ?? receivedDate) : null,
                FrozenExpirationDate = request.IsFrozen ? request.FrozenExpirationDate?.Date : null,
                InitialQuantity = request.Quantity,
                CurrentQuantity = request.Quantity,
                UnitPrice = request.UnitPrice,
                Supplier = request.Supplier?.Trim(),
                PurchaseDate = purchaseDate,
                ReceivedDate = receivedDate,
                Notes = request.Notes?.Trim()
            };

            _context.FoodBatches.Add(batch);
            await _context.SaveChangesAsync();

            // Record transaction audit
            var transaction = new StockTransaction
            {
                FoodItemId = request.FoodItemId,
                FoodBatchId = batch.Id,
                TransactionType = "Entrada",
                Reason = "Compra mensal",
                Quantity = request.Quantity,
                TransactionDate = receivedDate,
                Activity = "Recebimento de Compra",
                Responsible = request.Supplier ?? "Estoque",
                BatchNumber = batch.BatchNumber,
                UnitPrice = request.UnitPrice,
                TotalPrice = request.UnitPrice.HasValue ? request.UnitPrice.Value * request.Quantity : null,
                Notes = request.Notes?.Trim()
            };

            _context.StockTransactions.Add(transaction);
            await _context.SaveChangesAsync();

            var config = await GetConfigAsync();
            return MapToBatchDto(batch, config);
        }

        public async Task<FoodBatchDto> FreezeBatchAsync(FreezeBatchRequest request)
        {
            var batch = await _context.FoodBatches
                .Include(b => b.FoodItem)
                .FirstOrDefaultAsync(b => b.Id == request.BatchId);

            if (batch == null)
                throw new ArgumentException("Lote não encontrado.");

            var frozenDate = request.FrozenDate ?? DateTime.UtcNow;
            batch.IsFrozen = true;
            batch.FrozenDate = frozenDate;
            batch.FrozenExpirationDate = request.FrozenExpirationDate.Date;
            if (!string.IsNullOrWhiteSpace(request.Notes))
            {
                batch.Notes = string.IsNullOrWhiteSpace(batch.Notes) ? request.Notes.Trim() : $"{batch.Notes} | {request.Notes.Trim()}";
            }

            var transaction = new StockTransaction
            {
                FoodItemId = batch.FoodItemId,
                FoodBatchId = batch.Id,
                TransactionType = "Ajuste",
                Reason = "Congelamento",
                Quantity = batch.CurrentQuantity,
                TransactionDate = frozenDate,
                Activity = "Congelamento Culinário (-18°C)",
                Responsible = "Cozinha",
                BatchNumber = batch.BatchNumber,
                Notes = $"Lote congelado em {frozenDate:dd/MM/yyyy}. Validade estendida para {batch.FrozenExpirationDate.Value:dd/MM/yyyy} (Pausa de validade)."
            };

            _context.StockTransactions.Add(transaction);
            await _context.SaveChangesAsync();

            var config = await GetConfigAsync();
            return MapToBatchDto(batch, config);
        }

        public async Task<FoodBatchDto> ThawBatchAsync(ThawBatchRequest request)
        {
            var batch = await _context.FoodBatches
                .Include(b => b.FoodItem)
                .FirstOrDefaultAsync(b => b.Id == request.BatchId);

            if (batch == null)
                throw new ArgumentException("Lote não encontrado.");

            var thawedDate = request.ThawedDate ?? DateTime.UtcNow;
            batch.IsFrozen = false;
            batch.ThawedDate = thawedDate;
            batch.ExpirationDate = request.ConsumeUntilDate.Date;
            batch.FrozenExpirationDate = null;

            if (!string.IsNullOrWhiteSpace(request.Notes))
            {
                batch.Notes = string.IsNullOrWhiteSpace(batch.Notes) ? request.Notes.Trim() : $"{batch.Notes} | {request.Notes.Trim()}";
            }

            var transaction = new StockTransaction
            {
                FoodItemId = batch.FoodItemId,
                FoodBatchId = batch.Id,
                TransactionType = "Ajuste",
                Reason = "Descongelamento",
                Quantity = batch.CurrentQuantity,
                TransactionDate = thawedDate,
                Activity = "Descongelamento em Geladeira (≤5°C)",
                Responsible = "Cozinha",
                BatchNumber = batch.BatchNumber,
                Notes = $"Lote descongelado em {thawedDate:dd/MM/yyyy}. Prazo para uso imediato até {request.ConsumeUntilDate:dd/MM/yyyy}."
            };

            _context.StockTransactions.Add(transaction);
            await _context.SaveChangesAsync();

            var config = await GetConfigAsync();
            return MapToBatchDto(batch, config);
        }

        public async Task<StockTransactionDto> RegisterConsumptionAsync(RegisterConsumptionRequest request)
        {
            if (request.Quantity <= 0)
                throw new ArgumentException("A quantidade deve ser maior que zero.");

            var foodItem = await _context.FoodItems
                .Include(f => f.Batches)
                .FirstOrDefaultAsync(f => f.Id == request.FoodItemId);

            if (foodItem == null)
                throw new ArgumentException("Alimento não encontrado.");

            decimal totalAvailable = foodItem.Batches.Where(b => b.CurrentQuantity > 0).Sum(b => b.CurrentQuantity);
            if (request.Quantity > totalAvailable)
            {
                throw new InvalidOperationException($"Saldo insuficiente! A quantidade solicitada ({request.Quantity:0.##} {foodItem.Unit}) é superior ao saldo disponível em estoque ({totalAvailable:0.##} {foodItem.Unit}).");
            }

            var txDate = request.TransactionDate ?? DateTime.UtcNow;

            FoodBatch? targetBatch = null;

            // If a specific batch was chosen:
            if (request.FoodBatchId.HasValue && request.FoodBatchId.Value > 0)
            {
                targetBatch = foodItem.Batches.FirstOrDefault(b => b.Id == request.FoodBatchId.Value);
                if (targetBatch == null)
                    throw new ArgumentException("Lote selecionado não existe.");

                if (request.Quantity > targetBatch.CurrentQuantity)
                {
                    throw new InvalidOperationException($"A quantidade solicitada ({request.Quantity:0.##} {foodItem.Unit}) excede o saldo deste lote ({targetBatch.CurrentQuantity:0.##} {foodItem.Unit}). Selecione outro lote ou utilize o método PVPS automático.");
                }

                targetBatch.CurrentQuantity -= request.Quantity;
            }
            else
            {
                // PVPS (Primeiro que Vence, Primeiro que Sai):
                // Consume from batches ordered by EffectiveExpirationDate ASC
                decimal remainingToConsume = request.Quantity;
                var orderedBatches = foodItem.Batches
                    .Where(b => b.CurrentQuantity > 0)
                    .OrderBy(b => b.EffectiveExpirationDate)
                    .ToList();

                foreach (var b in orderedBatches)
                {
                    if (remainingToConsume <= 0) break;

                    decimal take = Math.Min(b.CurrentQuantity, remainingToConsume);
                    b.CurrentQuantity -= take;
                    remainingToConsume -= take;

                    if (targetBatch == null)
                        targetBatch = b; // Primary batch reference
                }
            }

            var transaction = new StockTransaction
            {
                FoodItemId = foodItem.Id,
                FoodBatchId = targetBatch?.Id,
                TransactionType = "Saida",
                Reason = string.IsNullOrWhiteSpace(request.Reason) ? "Consumo em aula" : request.Reason.Trim(),
                Quantity = request.Quantity,
                TransactionDate = txDate,
                Activity = request.Activity?.Trim(),
                Responsible = request.Responsible?.Trim(),
                BatchNumber = targetBatch?.BatchNumber,
                UnitPrice = targetBatch?.UnitPrice,
                TotalPrice = (targetBatch != null && targetBatch.UnitPrice.HasValue) ? targetBatch.UnitPrice.Value * request.Quantity : null,
                Notes = request.Notes?.Trim()
            };

            _context.StockTransactions.Add(transaction);
            await _context.SaveChangesAsync();

            return MapToTransactionDto(transaction, foodItem.Name, foodItem.Code, foodItem.Unit);
        }

        public async Task<StockTransactionDto> AdjustStockAsync(StockAdjustmentRequest request)
        {
            if (request.PhysicalQuantity < 0)
                throw new ArgumentException("A quantidade física não pode ser negativa.");

            var foodItem = await _context.FoodItems
                .Include(f => f.Batches)
                .FirstOrDefaultAsync(f => f.Id == request.FoodItemId);

            if (foodItem == null)
                throw new ArgumentException("Alimento não encontrado.");

            decimal currentTotal = foodItem.Batches.Where(b => b.CurrentQuantity > 0).Sum(b => b.CurrentQuantity);
            decimal diff = request.PhysicalQuantity - currentTotal;

            if (diff == 0)
            {
                throw new InvalidOperationException("A quantidade informada é exatamente igual ao saldo registrado no sistema. Nenhum ajuste necessário.");
            }

            FoodBatch? affectedBatch = null;

            if (request.FoodBatchId.HasValue && request.FoodBatchId.Value > 0)
            {
                affectedBatch = foodItem.Batches.FirstOrDefault(b => b.Id == request.FoodBatchId.Value);
                if (affectedBatch != null)
                {
                    affectedBatch.CurrentQuantity = Math.Max(0, affectedBatch.CurrentQuantity + diff);
                }
            }
            else
            {
                // Adjust latest or earliest batch
                if (diff > 0)
                {
                    // Increase: find latest batch or create new adjustment batch
                    affectedBatch = foodItem.Batches.OrderByDescending(b => b.ReceivedDate).FirstOrDefault();
                    if (affectedBatch != null)
                    {
                        affectedBatch.CurrentQuantity += diff;
                    }
                    else
                    {
                        affectedBatch = new FoodBatch
                        {
                            FoodItemId = foodItem.Id,
                            BatchNumber = $"LOT-AJUSTE-{DateTime.UtcNow:yyyyMMdd}",
                            ExpirationDate = DateTime.UtcNow.AddMonths(3),
                            InitialQuantity = diff,
                            CurrentQuantity = diff,
                            ReceivedDate = DateTime.UtcNow,
                            Notes = "Criado automaticamente por conferência física de estoque"
                        };
                        _context.FoodBatches.Add(affectedBatch);
                    }
                }
                else
                {
                    // Decrease: deduct according to PVPS
                    decimal toDeduct = Math.Abs(diff);
                    var batches = foodItem.Batches.Where(b => b.CurrentQuantity > 0).OrderBy(b => b.ExpirationDate).ToList();
                    foreach (var b in batches)
                    {
                        if (toDeduct <= 0) break;
                        decimal ded = Math.Min(b.CurrentQuantity, toDeduct);
                        b.CurrentQuantity -= ded;
                        toDeduct -= ded;
                        affectedBatch ??= b;
                    }
                }
            }

            var transaction = new StockTransaction
            {
                FoodItemId = foodItem.Id,
                FoodBatchId = affectedBatch?.Id,
                TransactionType = "Ajuste",
                Reason = string.IsNullOrWhiteSpace(request.Reason) ? "Conferência física" : request.Reason.Trim(),
                Quantity = Math.Abs(diff),
                TransactionDate = DateTime.UtcNow,
                Activity = "Conferência de Estoque",
                Responsible = request.Responsible?.Trim() ?? "Estoquista",
                BatchNumber = affectedBatch?.BatchNumber,
                UnitPrice = affectedBatch?.UnitPrice,
                TotalPrice = (affectedBatch != null && affectedBatch.UnitPrice.HasValue) ? affectedBatch.UnitPrice.Value * Math.Abs(diff) : null,
                Notes = $"{(diff > 0 ? "Acréscimo" : "Redução")} de {Math.Abs(diff):0.##} {foodItem.Unit} verificado em contagem física. Anterior: {currentTotal:0.##}, Nova: {request.PhysicalQuantity:0.##}. {request.Notes}".Trim()
            };

            _context.StockTransactions.Add(transaction);
            await _context.SaveChangesAsync();

            return MapToTransactionDto(transaction, foodItem.Name, foodItem.Code, foodItem.Unit);
        }

        public async Task<List<StockTransactionDto>> GetTransactionsAsync(int? foodItemId = null, string? type = null, int? month = null, int? year = null)
        {
            var query = _context.StockTransactions
                .Include(t => t.FoodItem)
                .AsQueryable();

            if (foodItemId.HasValue && foodItemId.Value > 0)
            {
                query = query.Where(t => t.FoodItemId == foodItemId.Value);
            }

            if (!string.IsNullOrWhiteSpace(type) && type != "Todos")
            {
                query = query.Where(t => t.TransactionType.ToLower() == type.ToLower());
            }

            if (year.HasValue && year.Value > 0)
            {
                query = query.Where(t => t.TransactionDate.Year == year.Value);
            }

            if (month.HasValue && month.Value > 0)
            {
                query = query.Where(t => t.TransactionDate.Month == month.Value);
            }

            var list = await query
                .OrderByDescending(t => t.TransactionDate)
                .ToListAsync();

            return list.Select(t => MapToTransactionDto(t, t.FoodItem?.Name ?? "Item", t.FoodItem?.Code ?? "", t.FoodItem?.Unit ?? "")).ToList();
        }

        public async Task<DashboardDto> GetDashboardAsync()
        {
            var config = await GetConfigAsync();
            var today = DateTime.Today;
            var currentMonth = today.Month;
            var currentYear = today.Year;

            var items = await _context.FoodItems
                .Include(f => f.Batches)
                .ToListAsync();

            var mappedItems = items.Select(f => MapToFoodItemDto(f, config)).ToList();

            var allActiveBatches = await _context.FoodBatches
                .Include(b => b.FoodItem)
                .Where(b => b.CurrentQuantity > 0)
                .OrderBy(b => b.ExpirationDate)
                .ToListAsync();

            var mappedBatches = allActiveBatches.Select(b => MapToBatchDto(b, config)).ToList();

            var monthTransactions = await _context.StockTransactions
                .Include(t => t.FoodItem)
                .Where(t => t.TransactionDate.Year == currentYear && t.TransactionDate.Month == currentMonth)
                .ToListAsync();

            var recentTransactions = await _context.StockTransactions
                .Include(t => t.FoodItem)
                .OrderByDescending(t => t.TransactionDate)
                .Take(8)
                .ToListAsync();

            var dashboard = new DashboardDto
            {
                TotalItems = mappedItems.Count,
                LowStockCount = mappedItems.Count(i => i.StockStatus == "Baixo" || i.StockStatus == "Zerado"),
                ExpiringIn7DaysCount = mappedBatches.Count(b => b.ExpirationStatus == "Urgente"),
                ExpiringIn30DaysCount = mappedBatches.Count(b => b.ExpirationStatus == "Atencao"),
                ExpiredCount = mappedBatches.Count(b => b.ExpirationStatus == "Vencido"),
                TotalEntriesThisMonth = monthTransactions.Where(t => t.TransactionType == "Entrada").Sum(t => t.Quantity),
                TotalConsumptionThisMonth = monthTransactions.Where(t => t.TransactionType == "Saida" && t.Reason == "Consumo em aula").Sum(t => t.Quantity),
                TotalLossesThisMonth = monthTransactions.Where(t => t.TransactionType == "Saida" && (t.Reason.Contains("Perda") || t.Reason.Contains("Descarte") || t.Reason.Contains("Deterioração"))).Sum(t => t.Quantity),
                TotalStockEstimatedValue = mappedItems.Sum(i => i.EstimatedTotalValue),
                UrgentBatches = mappedBatches.Where(b => b.ExpirationStatus == "Vencido" || b.ExpirationStatus == "Urgente").Take(6).ToList(),
                LowStockItems = mappedItems.Where(i => i.StockStatus == "Baixo" || i.StockStatus == "Zerado").Take(6).ToList(),
                RecentTransactions = recentTransactions.Select(t => MapToTransactionDto(t, t.FoodItem?.Name ?? "Item", t.FoodItem?.Code ?? "", t.FoodItem?.Unit ?? "")).ToList()
            };

            return dashboard;
        }

        public async Task<MonthlyReportDto> GetMonthlyReportAsync(int month, int year)
        {
            var config = await GetConfigAsync();
            var culture = new CultureInfo("pt-BR");
            string monthName = culture.DateTimeFormat.GetMonthName(month);
            monthName = char.ToUpper(monthName[0]) + monthName.Substring(1);

            var items = await _context.FoodItems
                .Include(f => f.Batches)
                .OrderBy(f => f.Name)
                .ToListAsync();

            // Transactions of the requested month
            var monthTransactions = await _context.StockTransactions
                .Include(t => t.FoodItem)
                .Include(t => t.FoodBatch)
                .Where(t => t.TransactionDate.Year == year && t.TransactionDate.Month == month)
                .OrderByDescending(t => t.TransactionDate)
                .ToListAsync();

            // Previous month calculation
            var prevDate = new DateTime(year, month, 1).AddMonths(-1);
            var prevTransactions = await _context.StockTransactions
                .Where(t => t.TransactionDate.Year == prevDate.Year && t.TransactionDate.Month == prevDate.Month && t.TransactionType == "Saida")
                .ToListAsync();

            // 1. Relatório de Estoque Atual
            var currentStockReport = items.Select(f =>
            {
                var dto = MapToFoodItemDto(f, config);
                return new StockItemReportRow
                {
                    Id = f.Id,
                    Code = f.Code,
                    Name = f.Name,
                    Category = f.Category,
                    CurrentQuantity = dto.TotalQuantity,
                    Unit = f.Unit,
                    MinQuantity = f.MinQuantity,
                    Status = dto.StockStatus,
                    NearestExpiration = dto.NearestExpirationDate,
                    EstimatedValue = dto.EstimatedTotalValue,
                    StorageLocation = f.StorageLocation,
                    Notes = f.Notes
                };
            }).ToList();

            // 2. Relatório de Consumo Mensal
            var consumptionGrouped = monthTransactions
                .Where(t => t.TransactionType == "Saida")
                .GroupBy(t => t.FoodItemId)
                .Select(g =>
                {
                    var food = items.FirstOrDefault(i => i.Id == g.Key);
                    var consumedQty = g.Where(t => t.Reason == "Consumo em aula").Sum(t => t.Quantity);
                    var wasteQty = g.Where(t => t.Reason.Contains("Perda") || t.Reason.Contains("Descarte") || t.Reason.Contains("Deterioração")).Sum(t => t.Quantity);
                    var totalOut = g.Sum(t => t.Quantity);

                    var prevQty = prevTransactions.Where(p => p.FoodItemId == g.Key).Sum(p => p.Quantity);
                    decimal? diffPct = prevQty > 0 ? Math.Round(((totalOut - prevQty) / prevQty) * 100m, 1) : null;

                    return new ConsumptionReportRow
                    {
                        FoodItemId = g.Key,
                        Code = food?.Code ?? "",
                        Name = food?.Name ?? "Item",
                        Category = food?.Category ?? "",
                        Unit = food?.Unit ?? "",
                        ConsumedQuantity = consumedQty,
                        WasteQuantity = wasteQty,
                        TotalOutQuantity = totalOut,
                        TransactionsCount = g.Count(),
                        PreviousMonthQuantity = prevQty,
                        DifferencePercentage = diffPct
                    };
                })
                .OrderByDescending(c => c.TotalOutQuantity)
                .ToList();

            // 3. Relatório de Validade
            var allActiveBatches = await _context.FoodBatches
                .Include(b => b.FoodItem)
                .Where(b => b.CurrentQuantity > 0)
                .OrderBy(b => b.ExpirationDate)
                .ToListAsync();

            var mappedBatches = allActiveBatches.Select(b => MapToBatchDto(b, config)).ToList();

            var expired = mappedBatches.Where(b => b.ExpirationStatus == "Vencido").ToList();
            var exp7 = mappedBatches.Where(b => b.ExpirationStatus == "Urgente").ToList();
            var exp30 = mappedBatches.Where(b => b.ExpirationStatus == "Atencao").ToList();

            var lossesByExpiration = monthTransactions
                .Where(t => t.TransactionType == "Saida" && (t.Reason.Contains("Vencimento") || t.Reason.Contains("Perda")))
                .Select(t => MapToTransactionDto(t, t.FoodItem?.Name ?? "", t.FoodItem?.Code ?? "", t.FoodItem?.Unit ?? ""))
                .ToList();

            // 4. Relatório de Compras Mensais
            var purchasesReport = monthTransactions
                .Where(t => t.TransactionType == "Entrada")
                .Select(t => new PurchaseReportRow
                {
                    TransactionId = t.Id,
                    FoodItemName = t.FoodItem?.Name ?? "",
                    FoodItemCode = t.FoodItem?.Code ?? "",
                    FoodItemUnit = t.FoodItem?.Unit ?? "",
                    Supplier = t.Responsible,
                    BatchNumber = t.BatchNumber,
                    ReceivedDate = t.TransactionDate,
                    ExpirationDate = t.FoodBatch?.ExpirationDate,
                    Quantity = t.Quantity,
                    UnitPrice = t.UnitPrice,
                    TotalPrice = t.TotalPrice ?? (t.UnitPrice.HasValue ? t.UnitPrice.Value * t.Quantity : null)
                })
                .OrderByDescending(p => p.ReceivedDate)
                .ToList();

            return new MonthlyReportDto
            {
                Month = month,
                Year = year,
                MonthName = monthName,
                SchoolName = config.SchoolName,
                GeneratedAt = DateTime.UtcNow,
                CurrentStock = currentStockReport,
                CurrentStockTotalValue = currentStockReport.Sum(s => s.EstimatedValue),
                Consumption = consumptionGrouped,
                TotalConsumedQuantity = consumptionGrouped.Sum(c => c.ConsumedQuantity),
                TotalLossesQuantity = consumptionGrouped.Sum(c => c.WasteQuantity),
                TotalConsumedValue = monthTransactions.Where(t => t.TransactionType == "Saida").Sum(t => t.TotalPrice ?? 0),
                PreviousMonthConsumedQuantity = prevTransactions.Sum(t => t.Quantity),
                ExpiredBatches = expired,
                BatchesExpiring7Days = exp7,
                BatchesExpiring30Days = exp30,
                LossesByExpiration = lossesByExpiration,
                Purchases = purchasesReport,
                TotalPurchasedQuantity = purchasesReport.Sum(p => p.Quantity),
                TotalPurchasedValue = purchasesReport.Sum(p => p.TotalPrice ?? 0)
            };
        }

        public async Task<AlertConfig> GetAlertConfigAsync()
        {
            return await GetConfigAsync();
        }

        public async Task<AlertConfig> UpdateAlertConfigAsync(AlertConfig config)
        {
            var existing = await GetConfigAsync();
            existing.UrgentDays = Math.Max(1, config.UrgentDays);
            existing.AttentionDays = Math.Max(existing.UrgentDays + 1, config.AttentionDays);
            existing.SchoolName = string.IsNullOrWhiteSpace(config.SchoolName) ? "Escola de Culinária" : config.SchoolName.Trim();

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<object> ExportBackupAsync()
        {
            var items = await _context.FoodItems.AsNoTracking().ToListAsync();
            var batches = await _context.FoodBatches.AsNoTracking().ToListAsync();
            var transactions = await _context.StockTransactions.AsNoTracking().ToListAsync();
            var config = await _context.AlertConfigs.AsNoTracking().FirstOrDefaultAsync();

            return new
            {
                ExportedAt = DateTime.UtcNow,
                Version = "1.0",
                Config = config,
                FoodItems = items,
                FoodBatches = batches,
                StockTransactions = transactions
            };
        }

        public async Task<bool> ImportBackupAsync(object backupData)
        {
            await Task.CompletedTask;
            return true;
        }

        // Helper mappers
        private FoodItemDto MapToFoodItemDto(FoodItem item, AlertConfig config)
        {
            var activeBatches = item.Batches.Where(b => b.CurrentQuantity > 0).ToList();
            var totalQty = activeBatches.Sum(b => b.CurrentQuantity);

            var today = DateTime.Today;
            bool hasExpired = activeBatches.Any(b => b.EffectiveExpirationDate.Date < today);

            string status;
            if (hasExpired)
            {
                status = "Vencido";
            }
            else if (totalQty <= 0)
            {
                status = "Zerado";
            }
            else if (totalQty <= item.MinQuantity)
            {
                status = "Baixo";
            }
            else
            {
                status = "Normal";
            }

            var nearestBatch = activeBatches.OrderBy(b => b.EffectiveExpirationDate).FirstOrDefault();
            DateTime? nearestExp = nearestBatch?.EffectiveExpirationDate;
            string? nearestExpStatus = null;

            if (nearestExp.HasValue)
            {
                int days = (nearestExp.Value.Date - today).Days;
                if (days < 0) nearestExpStatus = "Vencido";
                else if (days <= config.UrgentDays) nearestExpStatus = "Urgente";
                else if (days <= config.AttentionDays) nearestExpStatus = "Atencao";
                else nearestExpStatus = "Regular";
            }

            decimal estimatedValue = activeBatches.Sum(b => b.CurrentQuantity * (b.UnitPrice ?? 0));

            return new FoodItemDto
            {
                Id = item.Id,
                Code = item.Code,
                Name = item.Name,
                Category = item.Category,
                Unit = item.Unit,
                MinQuantity = item.MinQuantity,
                StorageLocation = item.StorageLocation,
                Notes = item.Notes,
                Courses = item.Courses ?? "Padeiro, Pizzaiolo",
                CourseList = string.IsNullOrWhiteSpace(item.Courses) 
                    ? new List<string> { "Padeiro", "Pizzaiolo" } 
                    : item.Courses.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList(),
                TotalQuantity = totalQty,
                StockStatus = status,
                NearestExpirationDate = nearestExp,
                NearestExpirationStatus = nearestExpStatus,
                EstimatedTotalValue = estimatedValue,
                ActiveBatchesCount = activeBatches.Count,
                Batches = activeBatches.Select(b => MapToBatchDto(b, config)).ToList()
            };
        }

        private FoodBatchDto MapToBatchDto(FoodBatch b, AlertConfig config)
        {
            var today = DateTime.Today;
            var effectiveExp = b.EffectiveExpirationDate;
            int days = (effectiveExp.Date - today).Days;

            string status;
            if (days < 0) status = "Vencido";
            else if (days <= config.UrgentDays) status = "Urgente";
            else if (days <= config.AttentionDays) status = "Atencao";
            else status = "Regular";

            return new FoodBatchDto
            {
                Id = b.Id,
                FoodItemId = b.FoodItemId,
                FoodItemName = b.FoodItem?.Name ?? "",
                FoodItemCode = b.FoodItem?.Code ?? "",
                FoodItemUnit = b.FoodItem?.Unit ?? "",
                FoodItemCategory = b.FoodItem?.Category ?? "",
                FoodItemCourses = b.FoodItem?.Courses,
                FoodItemCourseList = string.IsNullOrWhiteSpace(b.FoodItem?.Courses)
                    ? new List<string>()
                    : b.FoodItem.Courses.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList(),
                BatchNumber = b.BatchNumber,
                ExpirationDate = b.ExpirationDate,
                IsFrozen = b.IsFrozen,
                FrozenDate = b.FrozenDate,
                FrozenExpirationDate = b.FrozenExpirationDate,
                ThawedDate = b.ThawedDate,
                EffectiveExpirationDate = effectiveExp,
                DaysUntilExpiration = days,
                InitialQuantity = b.InitialQuantity,
                CurrentQuantity = b.CurrentQuantity,
                UnitPrice = b.UnitPrice,
                Supplier = b.Supplier,
                PurchaseDate = b.PurchaseDate,
                ReceivedDate = b.ReceivedDate,
                Notes = b.Notes,
                ExpirationStatus = status
            };
        }

        private StockTransactionDto MapToTransactionDto(StockTransaction t, string foodName, string foodCode, string foodUnit)
        {
            return new StockTransactionDto
            {
                Id = t.Id,
                FoodItemId = t.FoodItemId,
                FoodItemName = foodName,
                FoodItemCode = foodCode,
                FoodItemUnit = foodUnit,
                FoodBatchId = t.FoodBatchId,
                BatchNumber = t.BatchNumber,
                TransactionType = t.TransactionType,
                Reason = t.Reason,
                Quantity = t.Quantity,
                TransactionDate = t.TransactionDate,
                Activity = t.Activity,
                Responsible = t.Responsible,
                UnitPrice = t.UnitPrice,
                TotalPrice = t.TotalPrice,
                Notes = t.Notes
            };
        }
    }
}
