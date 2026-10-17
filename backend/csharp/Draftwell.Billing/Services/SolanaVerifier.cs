using Solnet.Rpc;
using Solnet.Rpc.Types;

namespace Draftwell.Billing.Services;

public sealed class SolanaVerifier
{
    private const string MasterTreasuryWallet = "EDZjEbRAtqyC8z6ta6PYHX161Xynt13tWpd7orKERkbz";
    private readonly IRpcClient _rpc;

    public SolanaVerifier(IConfiguration config)
    {
        var rpcUrl = config["Solana:RpcUrl"] ?? "https://api.mainnet-beta.solana.com";
        _rpc = ClientFactory.GetClient(rpcUrl);
    }

    public async Task<bool> VerifyTransactionReachedTreasuryAsync(string txSignature, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(txSignature) || txSignature.Length < 40)
            return false;

        try
        {
            var result = await _rpc.GetTransactionAsync(txSignature, Commitment.Confirmed);
            if (!result.WasSuccessful || result.Result == null)
                return false;

            var keys = result.Result.Transaction.Message.AccountKeys;
            return keys.Any(k => string.Equals(k, MasterTreasuryWallet, StringComparison.Ordinal));
        }
        catch
        {
            return false;
        }
    }
}
