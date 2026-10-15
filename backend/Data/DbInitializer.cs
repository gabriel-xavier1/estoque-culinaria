using System;
using System.Collections.Generic;
using System.Linq;
using EstoqueCulinaria.Api.Models;

namespace EstoqueCulinaria.Api.Data
{
    public static class DbInitializer
    {
        public static void Initialize(AppDbContext context)
        {
            context.Database.EnsureCreated();

            if (!context.AlertConfigs.Any())
            {
                context.AlertConfigs.Add(new AlertConfig
                {
                    Id = 1,
                    UrgentDays = 7,
                    AttentionDays = 30,
                    SchoolName = "Ateliê Gastronômico & Escola de Culinária"
                });
                context.SaveChanges();
            }

            if (context.FoodItems.Any())
            {
                return; // DB has already been seeded
            }

            var refDate = DateTime.Now; // around Oct 2026

            // Seed initial food items
            var items = new List<FoodItem>
            {
                new FoodItem
                {
                    Code = "ALIM-001",
                    Name = "Farinha de Trigo Especial Tipo 1",
                    Category = "Farinhas e Grãos",
                    Unit = "kg",
                    MinQuantity = 10m,
                    StorageLocation = "Despensa Seca - Prateleira A",
                    Courses = "Padeiro, Pizzaiolo, Confeitaria",
                    Notes = "Farinha especial para panificação e massas artesanais.",
                    CreatedAt = refDate.AddMonths(-2)
                },
                new FoodItem
                {
                    Code = "ALIM-002",
                    Name = "Manteiga sem Sal Primeira Qualidade",
                    Category = "Laticínios",
                    Unit = "kg",
                    MinQuantity = 5m,
                    StorageLocation = "Geladeira Laticínios - Gaveta 1",
                    Courses = "Padeiro, Confeitaria, Cozinha Geral",
                    Notes = "Uso em massas folhadas, pães e confeitaria.",
                    CreatedAt = refDate.AddMonths(-2)
                },
                new FoodItem
                {
                    Code = "ALIM-003",
                    Name = "Creme de Leite Fresco Pasteurizado (Nata)",
                    Category = "Laticínios",
                    Unit = "L",
                    MinQuantity = 4m,
                    StorageLocation = "Geladeira Laticínios - Gaveta 2",
                    Courses = "Confeitaria, Cozinha Geral",
                    Notes = "Teor de gordura mínimo 35%, para chantilly e ganaches.",
                    CreatedAt = refDate.AddMonths(-1)
                },
                new FoodItem
                {
                    Code = "ALIM-004",
                    Name = "Azeite de Oliva Extra Virgem 0.2%",
                    Category = "Óleos e Gorduras",
                    Unit = "L",
                    MinQuantity = 6m,
                    StorageLocation = "Despensa Seca - Prateleira B",
                    Courses = "Pizzaiolo, Cozinha Geral",
                    Notes = "Acidez máxima 0.2%, para massas de pizza e finalizações.",
                    CreatedAt = refDate.AddMonths(-3)
                },
                new FoodItem
                {
                    Code = "ALIM-005",
                    Name = "Ovos Caipiras Selecionados",
                    Category = "Ovos e Laticínios",
                    Unit = "un",
                    MinQuantity = 60m,
                    StorageLocation = "Geladeira de Apoio - Porta",
                    Courses = "Padeiro, Confeitaria, Cozinha Geral",
                    Notes = "Ovos caipiras frescos para massas, pães e doces.",
                    CreatedAt = refDate.AddMonths(-1)
                },
                new FoodItem
                {
                    Code = "ALIM-006",
                    Name = "Arroz Arbóreo Italiano Superfino",
                    Category = "Farinhas e Grãos",
                    Unit = "kg",
                    MinQuantity = 8m,
                    StorageLocation = "Despensa Seca - Prateleira A",
                    Courses = "Cozinha Geral",
                    Notes = "Alto teor de amido para risotos cremosos.",
                    CreatedAt = refDate.AddMonths(-2)
                },
                new FoodItem
                {
                    Code = "ALIM-007",
                    Name = "Salmão Fresco em Filé",
                    Category = "Pescados e Frutos do Mar",
                    Unit = "kg",
                    MinQuantity = 3m,
                    StorageLocation = "Geladeira de Pescados (0°C a 2°C)",
                    Courses = "Cozinha Geral",
                    Notes = "Filé limpo e sem espinhas para aulas práticas e grelhados.",
                    CreatedAt = refDate.AddDays(-5)
                },
                new FoodItem
                {
                    Code = "ALIM-008",
                    Name = "Queijo Parmigiano Reggiano Ralado Fino",
                    Category = "Laticínios",
                    Unit = "kg",
                    MinQuantity = 3m,
                    StorageLocation = "Geladeira de Queijos",
                    Courses = "Pizzaiolo, Cozinha Geral",
                    Notes = "Queijo curado importado para pizzas e massas.",
                    CreatedAt = refDate.AddMonths(-1)
                },
                new FoodItem
                {
                    Code = "ALIM-009",
                    Name = "Tomate Italiano Maduro",
                    Category = "Hortaliças e Folhas",
                    Unit = "kg",
                    MinQuantity = 10m,
                    StorageLocation = "Câmara Fria Hortifrúti",
                    Courses = "Pizzaiolo, Cozinha Geral",
                    Notes = "Para molho pomodoro de pizzas e caldos.",
                    CreatedAt = refDate.AddDays(-8)
                },
                new FoodItem
                {
                    Code = "ALIM-010",
                    Name = "Páprica Defumada Espanhola",
                    Category = "Temperos e Condimentos",
                    Unit = "g",
                    MinQuantity = 500m,
                    StorageLocation = "Armário de Especiarias",
                    Courses = "Cozinha Geral",
                    Notes = "Especiaria para marinadas e molhos.",
                    CreatedAt = refDate.AddMonths(-3)
                },
                new FoodItem
                {
                    Code = "ALIM-011",
                    Name = "Fermento Biológico Seco Instantâneo",
                    Category = "Farinhas e Grãos",
                    Unit = "g",
                    MinQuantity = 1000m,
                    StorageLocation = "Despensa Seca - Prateleira A",
                    Courses = "Padeiro, Pizzaiolo",
                    Notes = "Fermento de alta atividade para pães e pizzas de longa fermentação.",
                    CreatedAt = refDate.AddMonths(-2)
                },
                new FoodItem
                {
                    Code = "ALIM-012",
                    Name = "Queijo Mussarela em Barra",
                    Category = "Laticínios",
                    Unit = "kg",
                    MinQuantity = 15m,
                    StorageLocation = "Geladeira de Laticínios",
                    Courses = "Pizzaiolo, Padeiro",
                    Notes = "Mussarela padrão para cobertura de pizzas e recheios de pães.",
                    CreatedAt = refDate.AddMonths(-1)
                },
                new FoodItem
                {
                    Code = "ALIM-013",
                    Name = "Chocolate Meio Amargo em Gotas 54%",
                    Category = "Outros",
                    Unit = "kg",
                    MinQuantity = 5m,
                    StorageLocation = "Despensa Climatizada",
                    Courses = "Confeitaria, Padeiro",
                    Notes = "Gotas termoforneáveis para pães recheados, brownies e tortas.",
                    CreatedAt = refDate.AddMonths(-2)
                }
            };

            context.FoodItems.AddRange(items);
            context.SaveChanges();

            // Seed batches with different expiration dates according to requirements:
            // - Expired (Vencido)
            // - Expiring in <= 7 days (Atenção prioritária)
            // - Expiring in <= 30 days (Programar utilização)
            // - Regular (> 30 days)
            var batches = new List<FoodBatch>
            {
                // Farinha ALIM-001: 2 lotes (PVPS testing!)
                new FoodBatch
                {
                    FoodItemId = items[0].Id,
                    BatchNumber = "LOT-FAR-01",
                    PurchaseDate = refDate.AddDays(-20),
                    ReceivedDate = refDate.AddDays(-19),
                    ExpirationDate = refDate.AddDays(14), // Vence em 14 dias (atenção < 30 dias)
                    InitialQuantity = 15m,
                    CurrentQuantity = 8m,
                    UnitPrice = 8.50m,
                    Supplier = "Moinho Paulistano Alimentos",
                    Notes = "Lote aberto em uso nas bancadas"
                },
                new FoodBatch
                {
                    FoodItemId = items[0].Id,
                    BatchNumber = "LOT-FAR-02",
                    PurchaseDate = refDate.AddDays(-5),
                    ReceivedDate = refDate.AddDays(-4),
                    ExpirationDate = refDate.AddDays(75), // Vence em 75 dias (regular)
                    InitialQuantity = 20m,
                    CurrentQuantity = 20m,
                    UnitPrice = 8.20m,
                    Supplier = "Moinho Paulistano Alimentos",
                    Notes = "Lote lacrado na despensa"
                },

                // Manteiga ALIM-002: Lote vencendo em 5 dias (urgente!)
                new FoodBatch
                {
                    FoodItemId = items[1].Id,
                    BatchNumber = "LOT-MAN-01",
                    PurchaseDate = refDate.AddDays(-25),
                    ReceivedDate = refDate.AddDays(-24),
                    ExpirationDate = refDate.AddDays(5), // Vence em 5 dias! (< 7 dias)
                    InitialQuantity = 10m,
                    CurrentQuantity = 4m,
                    UnitPrice = 42.00m,
                    Supplier = "Laticínios Serra Bella",
                    Notes = "Priorizar para aula de folhados e molhos emulsionados"
                },

                // Creme de Leite ALIM-003: 1 Lote vencido (para alerta de segurança alimentar!) e 1 lote novo
                new FoodBatch
                {
                    FoodItemId = items[2].Id,
                    BatchNumber = "LOT-CRM-VENC",
                    PurchaseDate = refDate.AddDays(-28),
                    ReceivedDate = refDate.AddDays(-27),
                    ExpirationDate = refDate.AddDays(-2), // Vencido há 2 dias!
                    InitialQuantity = 4m,
                    CurrentQuantity = 1.5m,
                    UnitPrice = 24.00m,
                    Supplier = "Fazenda da Nata",
                    Notes = "Separado para descarte e avaliação técnica"
                },
                new FoodBatch
                {
                    FoodItemId = items[2].Id,
                    BatchNumber = "LOT-CRM-NOVO",
                    PurchaseDate = refDate.AddDays(-2),
                    ReceivedDate = refDate.AddDays(-1),
                    ExpirationDate = refDate.AddDays(18), // Vence em 18 dias
                    InitialQuantity = 6m,
                    CurrentQuantity = 6m,
                    UnitPrice = 25.50m,
                    Supplier = "Fazenda da Nata",
                    Notes = "Lote fresco recebido esta semana"
                },

                // Azeite ALIM-004: Validade longa
                new FoodBatch
                {
                    FoodItemId = items[3].Id,
                    BatchNumber = "LOT-AZ-2026",
                    PurchaseDate = refDate.AddDays(-30),
                    ReceivedDate = refDate.AddDays(-28),
                    ExpirationDate = refDate.AddMonths(10),
                    InitialQuantity = 12m,
                    CurrentQuantity = 9m,
                    UnitPrice = 38.00m,
                    Supplier = "Distribuidora Mediterrâneo",
                    Notes = "Galões de 2L mantidos em local escuro"
                },

                // Ovos ALIM-005: Vencendo em 10 dias
                new FoodBatch
                {
                    FoodItemId = items[4].Id,
                    BatchNumber = "LOT-OVO-44",
                    PurchaseDate = refDate.AddDays(-10),
                    ReceivedDate = refDate.AddDays(-9),
                    ExpirationDate = refDate.AddDays(11), // Vence em 11 dias
                    InitialQuantity = 120m,
                    CurrentQuantity = 54m, // abaixo do mínimo (60)
                    UnitPrice = 1.10m,
                    Supplier = "Granja Campo Verde",
                    Notes = "Embalagens de 30 unidades"
                },

                // Arroz Arbóreo ALIM-006:
                new FoodBatch
                {
                    FoodItemId = items[5].Id,
                    BatchNumber = "LOT-ARB-01",
                    PurchaseDate = refDate.AddDays(-15),
                    ReceivedDate = refDate.AddDays(-14),
                    ExpirationDate = refDate.AddMonths(8),
                    InitialQuantity = 15m,
                    CurrentQuantity = 12m,
                    UnitPrice = 28.00m,
                    Supplier = "Empório Gourmet",
                    Notes = "Pacotes a vácuo de 1kg"
                },

                // Salmão ALIM-007: 1 Lote Fresco e 1 Lote Congelado (Pausa de validade)
                new FoodBatch
                {
                    FoodItemId = items[6].Id,
                    BatchNumber = "LOT-SAL-03-FRESCO",
                    PurchaseDate = refDate.AddDays(-2),
                    ReceivedDate = refDate.AddDays(-2),
                    ExpirationDate = refDate.AddDays(3), // Vence em 3 dias em geladeira!
                    IsFrozen = false,
                    InitialQuantity = 5m,
                    CurrentQuantity = 3.5m,
                    UnitPrice = 89.00m,
                    Supplier = "Pescados do Porto",
                    Notes = "Filés frescos resfriados para uso imediato em aula"
                },
                new FoodBatch
                {
                    FoodItemId = items[6].Id,
                    BatchNumber = "LOT-SAL-CONGELADO",
                    PurchaseDate = refDate.AddDays(-10),
                    ReceivedDate = refDate.AddDays(-10),
                    ExpirationDate = refDate.AddDays(-5), // Validade original de resfriado teria vencido
                    IsFrozen = true, // Congelado a -18°C
                    FrozenDate = refDate.AddDays(-9), // Congelado no dia seguinte ao recebimento
                    FrozenExpirationDate = refDate.AddDays(50), // 2ª Validade: Válido por mais 50 dias congelado
                    InitialQuantity = 6m,
                    CurrentQuantity = 6m,
                    UnitPrice = 89.00m,
                    Supplier = "Pescados do Porto",
                    Notes = "Porcionado e congelado a -18°C. Validade pausada conforme boas práticas culinárias."
                },

                // Queijo Parmigiano ALIM-008:
                new FoodBatch
                {
                    FoodItemId = items[7].Id,
                    BatchNumber = "LOT-PARM-10",
                    PurchaseDate = refDate.AddDays(-12),
                    ReceivedDate = refDate.AddDays(-11),
                    ExpirationDate = refDate.AddDays(26), // Vence em 26 dias
                    InitialQuantity = 4m,
                    CurrentQuantity = 2.2m, // abaixo do estoque mínimo (3kg)
                    UnitPrice = 145.00m,
                    Supplier = "Laticínios Serra Bella",
                    Notes = "Cunhas seladas a vácuo"
                },

                // Tomate ALIM-009: Vencendo em 4 dias
                new FoodBatch
                {
                    FoodItemId = items[8].Id,
                    BatchNumber = "LOT-TOM-08",
                    PurchaseDate = refDate.AddDays(-4),
                    ReceivedDate = refDate.AddDays(-4),
                    ExpirationDate = refDate.AddDays(4), // Vence em 4 dias
                    InitialQuantity = 15m,
                    CurrentQuantity = 7m, // abaixo do mínimo (10kg)
                    UnitPrice = 7.50m,
                    Supplier = "Ceasa Hortifrúti Direto",
                    Notes = "Usar no preparo de massa e molhos na sexta-feira"
                },

                // Páprica ALIM-010:
                new FoodBatch
                {
                    FoodItemId = items[9].Id,
                    BatchNumber = "LOT-PAP-01",
                    PurchaseDate = refDate.AddDays(-40),
                    ReceivedDate = refDate.AddDays(-39),
                    ExpirationDate = refDate.AddMonths(12),
                    InitialQuantity = 1000m,
                    CurrentQuantity = 850m,
                    UnitPrice = 0.08m, // por grama
                    Supplier = "Empório Gourmet",
                    Notes = "Potes herméticos dosados"
                },

                // Fermento Biológico ALIM-011: Padeiro e Pizzaiolo
                new FoodBatch
                {
                    FoodItemId = items[10].Id,
                    BatchNumber = "LOT-FERM-01",
                    PurchaseDate = refDate.AddDays(-15),
                    ReceivedDate = refDate.AddDays(-14),
                    ExpirationDate = refDate.AddMonths(8),
                    InitialQuantity = 1000m,
                    CurrentQuantity = 650m,
                    UnitPrice = 0.04m,
                    Supplier = "Moinho Paulistano Alimentos",
                    Notes = "Pacotes a vácuo para aulas de panificação e pizzas"
                },

                // Queijo Mussarela ALIM-012: Pizzaiolo e Padeiro
                new FoodBatch
                {
                    FoodItemId = items[11].Id,
                    BatchNumber = "LOT-MUSS-05",
                    PurchaseDate = refDate.AddDays(-6),
                    ReceivedDate = refDate.AddDays(-5),
                    ExpirationDate = refDate.AddDays(15),
                    InitialQuantity = 20m,
                    CurrentQuantity = 12m, // abaixo do mínimo (15kg)
                    UnitPrice = 36.00m,
                    Supplier = "Laticínios Serra Bella",
                    Notes = "Mussarela para prática de forneria e calzones"
                },

                // Chocolate Gotas ALIM-013: Confeitaria e Padeiro
                new FoodBatch
                {
                    FoodItemId = items[12].Id,
                    BatchNumber = "LOT-CHOC-22",
                    PurchaseDate = refDate.AddDays(-20),
                    ReceivedDate = refDate.AddDays(-19),
                    ExpirationDate = refDate.AddMonths(9),
                    InitialQuantity = 8m,
                    CurrentQuantity = 4.5m, // abaixo do mínimo (5kg)
                    UnitPrice = 48.00m,
                    Supplier = "Empório Confeiteiro",
                    Notes = "Gotas nobres para recheios de pães doces e panetones"
                }
            };

            context.FoodBatches.AddRange(batches);
            context.SaveChanges();

            // Seed sample transactions (purchases, class consumption, waste/loss)
            var transactions = new List<StockTransaction>
            {
                // Entradas (Compras)
                new StockTransaction
                {
                    FoodItemId = items[0].Id,
                    FoodBatchId = batches[0].Id,
                    TransactionType = "Entrada",
                    Reason = "Compra mensal",
                    Quantity = 15m,
                    TransactionDate = refDate.AddDays(-19),
                    Activity = "Recebimento Mensal",
                    Responsible = "Chef Helena - Coordenadora",
                    BatchNumber = batches[0].BatchNumber,
                    UnitPrice = 8.50m,
                    TotalPrice = 127.50m,
                    Notes = "Compra mensal de farinhas para aulas práticas"
                },
                new StockTransaction
                {
                    FoodItemId = items[1].Id,
                    FoodBatchId = batches[2].Id,
                    TransactionType = "Entrada",
                    Reason = "Compra mensal",
                    Quantity = 10m,
                    TransactionDate = refDate.AddDays(-24),
                    Activity = "Recebimento Mensal",
                    Responsible = "Chef Helena",
                    BatchNumber = batches[2].BatchNumber,
                    UnitPrice = 42.00m,
                    TotalPrice = 420.00m,
                    Notes = "Manteiga extra para módulo de pastelaria"
                },
                // Saídas (Aulas práticas)
                new StockTransaction
                {
                    FoodItemId = items[0].Id,
                    FoodBatchId = batches[0].Id,
                    TransactionType = "Saida",
                    Reason = "Consumo em aula",
                    Quantity = 4m,
                    TransactionDate = refDate.AddDays(-12),
                    Activity = "Aula 02 - Massas Frescas & Recheadas",
                    Responsible = "Prof. Carlos André",
                    BatchNumber = batches[0].BatchNumber,
                    UnitPrice = 8.50m,
                    TotalPrice = 34.00m,
                    Notes = "Produção de fettuccine e ravióli"
                },
                new StockTransaction
                {
                    FoodItemId = items[0].Id,
                    FoodBatchId = batches[0].Id,
                    TransactionType = "Saida",
                    Reason = "Consumo em aula",
                    Quantity = 3m,
                    TransactionDate = refDate.AddDays(-4),
                    Activity = "Aula 05 - Pães Artesanais e Focaccia",
                    Responsible = "Prof. Carlos André",
                    BatchNumber = batches[0].BatchNumber,
                    UnitPrice = 8.50m,
                    TotalPrice = 25.50m,
                    Notes = "Pré-fermentação e fornada matutina"
                },
                new StockTransaction
                {
                    FoodItemId = items[1].Id,
                    FoodBatchId = batches[2].Id,
                    TransactionType = "Saida",
                    Reason = "Consumo em aula",
                    Quantity = 6m,
                    TransactionDate = refDate.AddDays(-7),
                    Activity = "Aula 04 - Molhos Clássicos e Emulsões",
                    Responsible = "Chef Helena",
                    BatchNumber = batches[2].BatchNumber,
                    UnitPrice = 42.00m,
                    TotalPrice = 252.00m,
                    Notes = "Hollandaise e bechamel com manteiga clarificada"
                },
                // Saída por Descarte / Perda (requisito explícito do usuário)
                new StockTransaction
                {
                    FoodItemId = items[2].Id,
                    FoodBatchId = batches[3].Id,
                    TransactionType = "Saida",
                    Reason = "Perda por vencimento",
                    Quantity = 2.5m,
                    TransactionDate = refDate.AddDays(-1),
                    Activity = "Triagem de Qualidade",
                    Responsible = "Estoquista Marcos",
                    BatchNumber = batches[3].BatchNumber,
                    UnitPrice = 24.00m,
                    TotalPrice = 60.00m,
                    Notes = "Descarte efetuado por término do prazo de validade antes do uso"
                },
                new StockTransaction
                {
                    FoodItemId = items[4].Id,
                    FoodBatchId = batches[6].Id,
                    TransactionType = "Saida",
                    Reason = "Consumo em aula",
                    Quantity = 66m,
                    TransactionDate = refDate.AddDays(-5),
                    Activity = "Aula 03 - Confeitaria: Merengues e Mousses",
                    Responsible = "Chef Mariana",
                    BatchNumber = batches[6].BatchNumber,
                    UnitPrice = 1.10m,
                    TotalPrice = 72.60m,
                    Notes = "Separação de claras e gemas nas bancadas 1 a 6"
                }
            };

            context.StockTransactions.AddRange(transactions);
            context.SaveChanges();
        }
    }
}
