namespace EstoqueCulinaria.Api.Models
{
    public class AlertConfig
    {
        public int Id { get; set; } = 1;
        public int UrgentDays { get; set; } = 7;
        public int AttentionDays { get; set; } = 30;
        public string SchoolName { get; set; } = "Escola de Culinária & Gastronomia Prática";
    }
}
