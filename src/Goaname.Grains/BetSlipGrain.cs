using Goaname.Domain.Enums;
using Goaname.Domain.Exceptions;
using Goaname.Domain.Rules;
using Goaname.Domain.State;
using Goaname.Grains.Interfaces;
using Orleans.Runtime;
using Orleans.Transactions;

namespace Goaname.Grains;

public class BetSlipGrain : Grain, IBetSlipGrain
{
    private readonly IPersistentState<BetSlipState> _state;

    public BetSlipGrain(
        [PersistentState(stateName: "betslip", storageName: "GoanameStore")]
        IPersistentState<BetSlipState> state)
    {
        _state = state;
    }

    public Task<BetSlipState> GetStateAsync()
    {
        EnsureCreated();
        return Task.FromResult(_state.State);
    }

    [Transaction(TransactionOption.CreateOrJoin)]
    public async Task CreateAsync(
        string tenantId,
        Guid userId,
        Guid marketId,
        Outcome outcome,
        decimal amount,
        decimal oddsAtPlacement,
        decimal sharesReceived)
    {
        EnsureTenantMatchesKey(tenantId);

        if (BetSlipRules.IsCreated(_state.State))
        {
            if (BetSlipRules.MatchesCreation(
                    _state.State,
                    tenantId,
                    userId,
                    marketId,
                    outcome,
                    amount,
                    oddsAtPlacement,
                    sharesReceived))
            {
                return;
            }

            throw new BusinessRuleException("Bet slip already exists.");
        }

        InitializeState(
            tenantId,
            userId,
            marketId,
            outcome,
            amount,
            oddsAtPlacement,
            sharesReceived);

        await _state.WriteStateAsync().ConfigureAwait(true);
    }

    [Transaction(TransactionOption.CreateOrJoin)]
    public async Task SettleAsync(BetStatus status, decimal settlementAmount)
    {
        EnsureCreated();

        if (status is not BetStatus.Won and not BetStatus.Lost)
        {
            throw new BusinessRuleException("Settlement status must be Won or Lost.");
        }

        if (settlementAmount < 0)
        {
            throw new BusinessRuleException("Settlement amount cannot be negative.");
        }

        if (status == BetStatus.Lost && settlementAmount != 0)
        {
            throw new BusinessRuleException("Lost bets must have zero settlement amount.");
        }

        if (BetSlipRules.IsSettled(_state.State))
        {
            if (BetSlipRules.IsMatchingSettlement(_state.State, status, settlementAmount))
            {
                return;
            }

            throw new BusinessRuleException("Bet slip is already settled.");
        }

        if (_state.State.Status != BetStatus.Pending)
        {
            throw new BusinessRuleException("Only pending bet slips can be settled.");
        }

        var settledAt = DateTimeOffset.UtcNow;
        _state.State.Status = status;
        _state.State.SettlementAmount = settlementAmount;
        _state.State.SettledAt = settledAt;

        await _state.WriteStateAsync().ConfigureAwait(true);
    }

    private void InitializeState(
        string tenantId,
        Guid userId,
        Guid marketId,
        Outcome outcome,
        decimal amount,
        decimal oddsAtPlacement,
        decimal sharesReceived)
    {
        var placedAt = DateTimeOffset.UtcNow;

        _state.State.Id = GrainKeys.ParseBetSlipId(this.GetPrimaryKeyString());
        _state.State.TenantId = tenantId;
        _state.State.UserId = userId;
        _state.State.MarketId = marketId;
        _state.State.SelectedOutcome = outcome;
        _state.State.Amount = amount;
        _state.State.OddsAtPlacement = oddsAtPlacement;
        _state.State.SharesReceived = sharesReceived;
        _state.State.Status = BetStatus.Pending;
        _state.State.SettlementAmount = null;
        _state.State.PlacedAt = placedAt;
        _state.State.SettledAt = null;
    }

    private void EnsureTenantMatchesKey(string tenantId)
    {
        var keyTenantId = GrainKeys.ParseTenantIdFromBetSlipKey(this.GetPrimaryKeyString());
        if (!GrainKeyRules.TenantMatches(keyTenantId, tenantId))
        {
            throw new BusinessRuleException("Tenant id does not match bet slip grain key.");
        }
    }

    private void EnsureCreated()
    {
        if (!BetSlipRules.IsCreated(_state.State))
        {
            throw new NotFoundException("Bet slip", GrainKeys.ParseBetSlipId(this.GetPrimaryKeyString()));
        }
    }
}
