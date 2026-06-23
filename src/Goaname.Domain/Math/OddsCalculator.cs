namespace Goaname.Domain.Math;

public static class OddsCalculator
{
    private const decimal ProbabilityFloor = 0.01m;

    public static (decimal YesProbability, decimal NoProbability, decimal YesMultiplier, decimal NoMultiplier) Calculate(
        decimal yesVolume,
        decimal noVolume,
        decimal liquidityParameter)
    {
        var (yesProbability, noProbability) = LmsrCalculator.CalculateProbabilities(
            yesVolume,
            noVolume,
            liquidityParameter);

        return (
            yesProbability,
            noProbability,
            1m / System.Math.Max(yesProbability, ProbabilityFloor),
            1m / System.Math.Max(noProbability, ProbabilityFloor));
    }
}
