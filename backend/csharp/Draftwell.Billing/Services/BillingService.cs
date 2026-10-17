using Draftwell.Billing.Models;
using Npgsql;

namespace Draftwell.Billing.Services;

public sealed class BillingService
{
    private const decimal ValuePerStarUsd = 0.10m;
    private readonly string _connectionString;
    private readonly SolanaVerifier _solanaVerifier;
    private readonly ILogger<BillingService> _logger;

    public BillingService(IConfiguration config, SolanaVerifier solanaVerifier, ILogger<BillingService> logger)
    {
        _connectionString = config.GetConnectionString("Supabase") 
            ?? config["SUPABASE_DB_URL"] 
            ?? string.Empty;
        _solanaVerifier = solanaVerifier;
        _logger = logger;
    }

    public async Task<VerifyPaymentResponse> VerifyAndCreditAsync(VerifyPaymentRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.UserId) || string.IsNullOrWhiteSpace(request.TxReference))
        {
            return new VerifyPaymentResponse { Success = false, Error = "Malformed payload parameter vectors." };
        }

        var starsToCredit = (int)Math.Floor(request.UsdAmount / ValuePerStarUsd);
        if (starsToCredit < 1)
        {
            return new VerifyPaymentResponse { Success = false, Error = "Amount too low to credit any Stars." };
        }

        var isValid = request.PaymentMethod.ToUpperInvariant() switch
        {
            "SOLANA" => await _solanaVerifier.VerifyTransactionReachedTreasuryAsync(request.TxReference, ct),
            "MPESA" => IsValidMpesaReceipt(request.TxReference),
            "FONBNK" => request.TxReference.Length >= 6,
            _ => false
        };

        if (!isValid)
        {
            return new VerifyPaymentResponse
            {
                Success = false,
                Error = "Payment verification failed. Invalid transaction token signature."
            };
        }

        if (string.IsNullOrEmpty(_connectionString))
        {
            _logger.LogWarning("No database connection string configured; returning success without persistence.");
            return new VerifyPaymentResponse { Success = true, CreditedStars = starsToCredit };
        }

        await using var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync(ct);

        await using var tx = await conn.BeginTransactionAsync(ct);
        try
        {
            await using (var cmd = new NpgsqlCommand(
                @"UPDATE user_profiles 
                  SET star_balance = COALESCE(star_balance, 0) + @stars 
                  WHERE id = @uid::uuid", conn, tx))
            {
                cmd.Parameters.AddWithValue("stars", starsToCredit);
                cmd.Parameters.AddWithValue("uid", request.UserId);
                await cmd.ExecuteNonQueryAsync(ct);
            }

            await using (var cmd = new NpgsqlCommand(
                @"INSERT INTO payment_intents 
                  (user_id, payment_method, transaction_reference, fiat_amount_usd, stars_credited, status)
                  VALUES (@uid::uuid, @method, @ref, @usd, @stars, 'COMPLETED')
                  ON CONFLICT (transaction_reference) DO NOTHING", conn, tx))
            {
                cmd.Parameters.AddWithValue("uid", request.UserId);
                cmd.Parameters.AddWithValue("method", request.PaymentMethod);
                cmd.Parameters.AddWithValue("ref", request.TxReference);
                cmd.Parameters.AddWithValue("usd", request.UsdAmount);
                cmd.Parameters.AddWithValue("stars", starsToCredit);
                await cmd.ExecuteNonQueryAsync(ct);
            }

            if (!string.IsNullOrWhiteSpace(request.AuthorId))
            {
                var authorShare = starsToCredit - (int)Math.Floor(starsToCredit * 0.40);
                await using var cmd = new NpgsqlCommand(
                    @"INSERT INTO author_earnings (author_id, total_stars_earned, updated_at)
                      VALUES (@aid::uuid, @share, NOW())
                      ON CONFLICT (author_id) DO UPDATE
                      SET total_stars_earned = author_earnings.total_stars_earned + @share,
                          updated_at = NOW()", conn, tx);
                cmd.Parameters.AddWithValue("aid", request.AuthorId);
                cmd.Parameters.AddWithValue("share", authorShare);
                await cmd.ExecuteNonQueryAsync(ct);
            }

            await tx.CommitAsync(ct);
            return new VerifyPaymentResponse { Success = true, CreditedStars = starsToCredit };
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync(ct);
            _logger.LogError(ex, "Billing transaction failed");
            return new VerifyPaymentResponse { Success = false, Error = ex.Message };
        }
    }

    private static bool IsValidMpesaReceipt(string reference)
    {
        return reference.Length >= 8 && reference.All(c => char.IsLetterOrDigit(c));
    }
}
