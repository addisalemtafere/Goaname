namespace Goaname.Domain.Math;

public static class LmsrCalculator
{
    /// <summary>
    /// Calculates the cost function C = b * ln(e^(q_yes / b) + e^(q_no / b))
    /// Uses the Log-Sum-Exp trick to prevent floating point overflow.
    /// </summary>
    public static decimal CalculateCost(decimal yesVolume, decimal noVolume, decimal b)
    {
        if (b <= 0) throw new ArgumentException("Liquidity parameter 'b' must be greater than zero.");

        // Convert to double for Math.Exp and Math.Log
        double qYes = (double)yesVolume;
        double qNo = (double)noVolume;
        double bDouble = (double)b;

        double x = qYes / bDouble;
        double y = qNo / bDouble;

        // Log-Sum-Exp trick: ln(e^x + e^y) = max(x,y) + ln(e^(x - max) + e^(y - max))
        double max = System.Math.Max(x, y);
        double sumExp = System.Math.Exp(x - max) + System.Math.Exp(y - max);
        
        double cost = bDouble * (max + System.Math.Log(sumExp));
        
        return (decimal)cost;
    }

    /// <summary>
    /// Calculates the probabilities for Yes and No outcomes.
    /// Returns a tuple (YesProbability, NoProbability).
    /// </summary>
    public static (decimal YesProbability, decimal NoProbability) CalculateProbabilities(decimal yesVolume, decimal noVolume, decimal b)
    {
        if (b <= 0) throw new ArgumentException("Liquidity parameter 'b' must be greater than zero.");

        double qYes = (double)yesVolume;
        double qNo = (double)noVolume;
        double bDouble = (double)b;

        double x = qYes / bDouble;
        double y = qNo / bDouble;

        double max = System.Math.Max(x, y);
        
        // Prevent overflow by subtracting max
        double expYes = System.Math.Exp(x - max);
        double expNo = System.Math.Exp(y - max);
        double sumExp = expYes + expNo;

        decimal pYes = (decimal)(expYes / sumExp);
        decimal pNo = (decimal)(expNo / sumExp);

        return (pYes, pNo);
    }

    /// <summary>
    /// Calculates how many shares a user receives for a given bet amount.
    /// </summary>
    public static decimal CalculateSharesReceived(decimal yesVolume, decimal noVolume, decimal b, Enums.Outcome outcome, decimal betAmount)
    {
        if (betAmount <= 0) throw new ArgumentException("Bet amount must be greater than zero.");

        decimal currentCost = CalculateCost(yesVolume, noVolume, b);
        decimal targetCost = currentCost + betAmount;

        // We need to find the new volume (q') such that CalculateCost(newYes, newNo) == targetCost
        // Since C = b * ln(e^(q_yes/b) + e^(q_no/b))
        // e^(C/b) = e^(q_yes/b) + e^(q_no/b)
        
        double targetCostDouble = (double)targetCost;
        double bDouble = (double)b;
        
        double expTargetCostOverB = System.Math.Exp(targetCostDouble / bDouble);

        if (outcome == Enums.Outcome.Yes)
        {
            double expQNoOverB = System.Math.Exp((double)noVolume / bDouble);
            double newExpQYesOverB = expTargetCostOverB - expQNoOverB;
            
            if (newExpQYesOverB <= 0) return betAmount; // Fallback for extreme precision limits
            
            double newQYes = bDouble * System.Math.Log(newExpQYesOverB);
            return (decimal)newQYes - yesVolume;
        }
        else
        {
            double expQYesOverB = System.Math.Exp((double)yesVolume / bDouble);
            double newExpQNoOverB = expTargetCostOverB - expQYesOverB;
            
            if (newExpQNoOverB <= 0) return betAmount; // Fallback
            
            double newQNo = bDouble * System.Math.Log(newExpQNoOverB);
            return (decimal)newQNo - noVolume;
        }
    }
}