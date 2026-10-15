using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using EstoqueCulinaria.Api.DTOs;
using EstoqueCulinaria.Api.Models;
using EstoqueCulinaria.Api.Services;

namespace EstoqueCulinaria.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _inventoryService;

        public InventoryController(IInventoryService inventoryService)
        {
            _inventoryService = inventoryService;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            try
            {
                var result = await _inventoryService.GetDashboardAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("items")]
        public async Task<IActionResult> GetItems([FromQuery] string? category, [FromQuery] string? search, [FromQuery] string? course)
        {
            try
            {
                var result = await _inventoryService.GetAllFoodItemsAsync(category, search, course);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("items/{id:int}")]
        public async Task<IActionResult> GetItemById(int id)
        {
            try
            {
                var result = await _inventoryService.GetFoodItemByIdAsync(id);
                if (result == null) return NotFound(new { message = "Alimento não encontrado." });
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("items")]
        public async Task<IActionResult> CreateItem([FromBody] CreateFoodItemRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Name))
                    return BadRequest(new { message = "O nome do alimento é obrigatório." });

                var result = await _inventoryService.CreateFoodItemAsync(request);
                return CreatedAtAction(nameof(GetItemById), new { id = result.Id }, result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("items/{id:int}")]
        public async Task<IActionResult> UpdateItem(int id, [FromBody] UpdateFoodItemRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Name))
                    return BadRequest(new { message = "O nome do alimento é obrigatório." });

                var result = await _inventoryService.UpdateFoodItemAsync(id, request);
                if (result == null) return NotFound(new { message = "Alimento não encontrado." });
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("items/{id:int}")]
        public async Task<IActionResult> DeleteItem(int id)
        {
            try
            {
                var deleted = await _inventoryService.DeleteFoodItemAsync(id);
                if (!deleted) return NotFound(new { message = "Alimento não encontrado." });
                return Ok(new { message = "Alimento removido com sucesso." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("batches")]
        public async Task<IActionResult> GetBatches([FromQuery] bool activeOnly = true, [FromQuery] string? status = null)
        {
            try
            {
                var result = await _inventoryService.GetAllBatchesAsync(activeOnly, status);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("batches/item/{foodItemId:int}")]
        public async Task<IActionResult> GetBatchesByItem(int foodItemId, [FromQuery] bool activeOnly = true)
        {
            try
            {
                var result = await _inventoryService.GetBatchesByFoodItemAsync(foodItemId, activeOnly);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("batches/pvps/{foodItemId:int}")]
        public async Task<IActionResult> GetPVPSBatch(int foodItemId)
        {
            try
            {
                var result = await _inventoryService.GetPVPSBatchAsync(foodItemId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("batches/freeze")]
        public async Task<IActionResult> FreezeBatch([FromBody] FreezeBatchRequest request)
        {
            try
            {
                var result = await _inventoryService.FreezeBatchAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("batches/thaw")]
        public async Task<IActionResult> ThawBatch([FromBody] ThawBatchRequest request)
        {
            try
            {
                var result = await _inventoryService.ThawBatchAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("purchases")]
        public async Task<IActionResult> RegisterPurchase([FromBody] RegisterPurchaseRequest request)
        {
            try
            {
                var result = await _inventoryService.RegisterPurchaseAsync(request);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("consumption")]
        public async Task<IActionResult> RegisterConsumption([FromBody] RegisterConsumptionRequest request)
        {
            try
            {
                var result = await _inventoryService.RegisterConsumptionAsync(request);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("adjustment")]
        public async Task<IActionResult> AdjustStock([FromBody] StockAdjustmentRequest request)
        {
            try
            {
                var result = await _inventoryService.AdjustStockAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("transactions")]
        public async Task<IActionResult> GetTransactions(
            [FromQuery] int? foodItemId,
            [FromQuery] string? type,
            [FromQuery] int? month,
            [FromQuery] int? year)
        {
            try
            {
                var result = await _inventoryService.GetTransactionsAsync(foodItemId, type, month, year);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("reports/monthly")]
        public async Task<IActionResult> GetMonthlyReport([FromQuery] int? month, [FromQuery] int? year)
        {
            try
            {
                var now = DateTime.Today;
                int m = (month.HasValue && month.Value >= 1 && month.Value <= 12) ? month.Value : now.Month;
                int y = (year.HasValue && year.Value > 2000) ? year.Value : now.Year;

                var result = await _inventoryService.GetMonthlyReportAsync(m, y);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("config")]
        public async Task<IActionResult> GetConfig()
        {
            try
            {
                var result = await _inventoryService.GetAlertConfigAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("config")]
        public async Task<IActionResult> UpdateConfig([FromBody] AlertConfig config)
        {
            try
            {
                var result = await _inventoryService.UpdateAlertConfigAsync(config);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("export")]
        public async Task<IActionResult> ExportData()
        {
            try
            {
                var result = await _inventoryService.ExportBackupAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}
