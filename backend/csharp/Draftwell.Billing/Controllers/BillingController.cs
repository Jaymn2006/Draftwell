using Draftwell.Billing.Models;
using Draftwell.Billing.Services;
using Microsoft.AspNetCore.Mvc;

namespace Draftwell.Billing.Controllers;

[ApiController]
[Route("api/billing")]
public sealed class BillingController : ControllerBase
{
    private readonly BillingService _billing;

    public BillingController(BillingService billing)
    {
        _billing = billing;
    }

    [HttpPost("verify")]
    public async Task<ActionResult<VerifyPaymentResponse>> Verify([FromBody] VerifyPaymentRequest request, CancellationToken ct)
    {
        var result = await _billing.VerifyAndCreditAsync(request, ct);
        if (!result.Success)
        {
            return StatusCode(422, result);
        }
        return Ok(result);
    }
}
