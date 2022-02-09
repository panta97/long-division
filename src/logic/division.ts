import { Monomial } from "./monomial";
import { Polynomial } from "./polynomial";
import { RealNumber } from "./realNumber";

export interface PolynomialDivisionProcess {
  divisor: Polynomial;
  dividend: Polynomial;
  quotient: Polynomial;
  remainder: Polynomial;
  steps: Polynomial[];
}

export const longDivision = (dividend: Polynomial, divisor: Polynomial) => {
  // record process
  const process: PolynomialDivisionProcess = {
    divisor,
    dividend,
    quotient: new Polynomial([]),
    remainder: new Polynomial([]),
    steps: [],
  };
  const inverse = new Monomial(new RealNumber(-1, 1), 0);
  // passed by reference
  // leading term = LT
  // trailing term = TT
  let dividendLT = dividend.getLeadingTerm();
  const divisorLT = divisor.getLeadingTerm();
  const quotient = new Polynomial([]);
  quotient.add(dividendLT.div(divisorLT)!, { inPlace: true });
  let quotientTT = quotient.getTrailingTerm();
  let divisorxQuotientTT = divisor.mul(quotientTT)!;
  let remainder = dividend.addPol(divisorxQuotientTT.mul(inverse)!)!;
  dividend = remainder.copy();

  process.steps.push(divisorxQuotientTT);
  process.steps.push(remainder);

  while (remainder.getDegree() >= divisor.getDegree()) {
    dividendLT = dividend.getLeadingTerm();
    quotient.add(dividendLT.div(divisorLT)!, { inPlace: true });
    quotientTT = quotient.getTrailingTerm();
    divisorxQuotientTT = divisor.mul(quotientTT)!;
    remainder = dividend.addPol(divisorxQuotientTT.mul(inverse)!)!;
    dividend = remainder.copy();

    process.steps.push(divisorxQuotientTT);
    process.steps.push(remainder);
  }
  process.quotient = quotient;
  process.remainder = remainder;

  return process;
};
