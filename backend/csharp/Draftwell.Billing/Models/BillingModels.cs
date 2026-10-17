namespace Draftwell.Billing.Models;

public sealed class VerifyPaymentRequest
{
    public string UserId { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public string TxReference { get; set; } = string.Empty;
    public decimal UsdAmount { get; set; }
    public string? AuthorId { get; set; }
}

public sealed class VerifyPaymentResponse
{
    public bool Success { get; set; }
    public int CreditedStars { get; set; }
    public string? Error { get; set; }
}
