import { cloneDeep } from "lodash";

const gcd = (a: number, b: number): number => {
  a = Math.abs(a);
  b = Math.abs(b);
  if (b > a) [a, b] = [b, a];
  if (b === 0) return a;
  return gcd(b, a % b);
};

export class RealNumber {
  numerator: number;
  denominator: number;

  constructor(numerator: number, denominator: number) {
    this.numerator = numerator;
    this.denominator = denominator;
  }

  private simplify(numerator: number, denominator: number) {
    const _gdc = gcd(numerator, denominator);
    if (_gdc === 1) return [numerator, denominator];
    numerator /= _gdc;
    denominator /= _gdc;
    return [numerator, denominator];
  }

  add(numb: RealNumber, inPlace = false) {
    let newNumerator =
      this.denominator * numb.numerator + numb.denominator * this.numerator;
    let newDenominator = this.denominator * numb.denominator;
    [newNumerator, newDenominator] = this.simplify(
      newNumerator,
      newDenominator
    );
    if (inPlace) {
      this.numerator = newNumerator;
      this.denominator = newDenominator;
    } else {
      return new RealNumber(newNumerator, newDenominator);
    }
  }

  mul(numb: RealNumber, inPlace = false) {
    let newNumerator = this.numerator * numb.numerator;
    let newDenominator = this.denominator * numb.denominator;
    [newNumerator, newDenominator] = this.simplify(
      newNumerator,
      newDenominator
    );
    if (inPlace) {
      this.numerator = newNumerator;
      this.denominator = newDenominator;
    } else {
      return new RealNumber(newNumerator, newDenominator);
    }
  }

  div(numb: RealNumber, inPlace = false) {
    let newNumb: RealNumber;
    if (numb.numerator < 0) {
      // keep the negative sign on the numerator
      newNumb = new RealNumber(numb.denominator * -1, numb.numerator * -1);
    } else {
      newNumb = new RealNumber(numb.denominator, numb.numerator);
    }
    this.mul(newNumb, inPlace);
  }
}

export class Monomial {
  coefficient: RealNumber;
  degree: number;

  constructor(coefficient: RealNumber, degree: number) {
    this.coefficient = coefficient;
    this.degree = degree;
  }

  div(monomial: Monomial, inPlace = false) {
    const currMonomial = inPlace ? this : cloneDeep(this);
    currMonomial.degree -= monomial.degree;
    currMonomial.coefficient.div(monomial.coefficient, true);
    if (!inPlace) return currMonomial;
  }

  getKatex(explicitSign = false) {
    let exp = "";
    // let isDisplayed = false;
    const term = this;
    // if (!isDisplayed && term.coefficient.numerator === 0) return "";
    // if (!isDisplayed) return "";
    const degree = term.degree;
    let numerator: number | string = Math.abs(term.coefficient.numerator);
    let sign = term.coefficient.numerator >= 0 ? "+" : "-";
    if (numerator === 1 && degree !== 0) numerator = "";
    if (sign === "+" && !explicitSign) sign = "";

    let number: number | string = 0;
    if (term.coefficient.denominator === 1) {
      number = numerator;
    } else {
      number = `\\text{\\(\\frac {${numerator}} {${term.coefficient.denominator}}\\)}`;
    }
    if (term.degree === 0) {
      exp += `${sign}${number}`;
    } else if (term.degree === 1) {
      exp += `${sign}${number}x`;
    } else {
      exp += `${sign}${number}x^\{${degree}\}`;
    }
    return exp;
  }
}

export class Polynomial {
  terms: Monomial[];

  constructor(terms: Monomial[]) {
    this.terms = terms;
  }

  static buildFromString(expression: string) {
    const terms: string[] = [];
    let term = expression[0];
    for (let i = 1; i < expression.length; i++) {
      const char = expression[i];
      if (char === " ") continue;
      if (/[+-]/.test(char)) {
        terms.push(term);
        term = char;
      } else {
        term += char;
      }
    }
    terms.push(term);

    const pattern = /^([+-]?\d*)?(x)?(\^(\d+))?$/i;
    const polynomial = new Polynomial([]);
    for (let i = 0; i < terms.length; i++) {
      const result = pattern.exec(terms[i]);
      if (!result) throw new Error("Bad input");
      let coefficient = Number(result[1]);
      coefficient = result[1] === "" ? NaN : coefficient;
      let exponent = Number(result[4]);
      if (isNaN(coefficient)) {
        if (result[1] === "-") coefficient = -1;
        else coefficient = 1;
      }
      if (isNaN(exponent)) {
        if (result[2]) exponent = 1;
        else exponent = 0;
      }
      const monomial = new Monomial(new RealNumber(coefficient, 1), exponent);
      polynomial.add(monomial, true);
    }

    return polynomial;
  }

  private appendTerm(newTerm: Monomial) {
    let indexBehind = -1;
    let indexAfter = -1;

    if (this.terms.length > 1) {
      let degreeDist = 0;
      for (let i = 0; i < this.terms.length; i++) {
        degreeDist = this.terms[i].degree - newTerm.degree;
        // turning point
        if (degreeDist < 0 && i === 0) {
          indexAfter = i;
          break;
        } else if (degreeDist < 0) {
          indexAfter = i;
          indexBehind = i - 1;
          break;
        }
      }
      if (indexBehind < 0 && indexAfter < 0)
        indexBehind = this.terms.length - 1;
    } else if (this.terms.length === 1) {
      if (this.terms[0].degree > newTerm.degree) indexBehind = 0;
      else indexAfter = 0;
    }

    if (indexBehind >= 0 && indexAfter >= 0) {
      this.terms.splice(indexBehind + 1, 0, newTerm);
    } else if (indexBehind === -1 && indexAfter === -1) {
      this.terms.push(newTerm);
    } else if (indexBehind >= 0 && indexAfter === -1) {
      this.terms.push(newTerm);
    } else if (indexBehind === -1 && indexAfter >= 0) {
      this.terms.splice(0, 0, newTerm);
    }
  }

  add(term: Monomial, inPlace = false) {
    const currPolynomial = inPlace ? this : cloneDeep(this);
    const polTerm = this.terms.find((t) => t.degree === term.degree);
    if (polTerm) {
      polTerm.coefficient.add(term.coefficient, true);
    } else {
      currPolynomial.appendTerm(term);
    }
    if (!inPlace) return currPolynomial;
  }

  mul(term: Monomial, inPlace = false) {
    const currPolynomial = inPlace ? this : cloneDeep(this);
    for (let i = 0; i < currPolynomial.terms.length; i++) {
      const currTerm = currPolynomial.terms[i];
      currTerm.coefficient.mul(term.coefficient, true);
      currTerm.degree += term.degree;
    }
    if (!inPlace) return currPolynomial;
  }

  addPol(pol: Polynomial, inPlace = false) {
    const currPolynomial = inPlace ? this : cloneDeep(this);
    pol.terms.forEach((term) => currPolynomial.add(term, true));
    if (!inPlace) return currPolynomial;
  }

  mulPol(pol: Polynomial, inPlace = false) {
    const currPolynomial = inPlace ? this : cloneDeep(this);
    pol.terms.forEach((term) => currPolynomial.mul(term, true));
    if (!inPlace) return currPolynomial;
  }

  private getNonZeroTerms() {
    return this.terms.filter((t) => t.coefficient.numerator !== 0);
  }

  getTerm(degree: number) {
    return this.terms.find((t) => t.degree === degree);
  }

  getLeadingTerm() {
    return this.getNonZeroTerms()[0];
  }

  getTrailingTerm() {
    return this.getNonZeroTerms()[this.terms.length - 1];
  }

  getDegree() {
    if (this.getNonZeroTerms().length === 0) return 0;
    return this.getNonZeroTerms()[0].degree;
  }

  getKatex(explicitSign = false) {
    let exp = "";
    let isDisplayed = false;
    for (let i = 0; i < this.terms.length; i++) {
      const term = this.terms[i];
      if (!isDisplayed && term.coefficient.numerator === 0) continue;
      else isDisplayed = true;

      const degree = term.degree;
      let numerator: number | string = Math.abs(term.coefficient.numerator);
      let sign = term.coefficient.numerator >= 0 ? "+" : "-";
      if (numerator === 1 && degree !== 0) numerator = "";
      if (i === 0 && sign === "+" && !explicitSign) sign = "";

      let number: number | string = 0;
      if (term.coefficient.denominator === 1) {
        number = numerator;
      } else {
        number = `\\text{\\(\\frac {${numerator}} {${term.coefficient.denominator}}\\)}`;
      }
      if (term.degree === 0) {
        exp += `${sign}${number}`;
      } else if (term.degree === 1) {
        exp += `${sign}${number}x`;
      } else {
        exp += `${sign}${number}x^\{${degree}\}`;
      }
    }
    return exp;
  }

  copy() {
    return cloneDeep(this);
  }
}

export interface LongDivisionProcess {
  divisor: Polynomial;
  dividend: Polynomial;
  quotient: Polynomial;
  remainder: Polynomial;
  steps: Polynomial[];
}

export const longDivision = (dividend: Polynomial, divisor: Polynomial) => {
  // record process
  const process: LongDivisionProcess = {
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
  const steps: Polynomial[] = [];
  let dividendLT = dividend.getLeadingTerm();
  const divisorLT = divisor.getLeadingTerm();
  const quotient = new Polynomial([]);
  quotient.add(dividendLT.div(divisorLT)!, true);
  let quotientTT = quotient.getTrailingTerm();
  let divisorxQuotientTT = divisor.mul(quotientTT)!;
  let remainder = dividend.addPol(divisorxQuotientTT.mul(inverse)!)!;
  dividend = remainder.copy();

  process.steps.push(divisorxQuotientTT);
  process.steps.push(remainder);

  while (remainder.getDegree() >= divisor.getDegree()) {
    dividendLT = dividend.getLeadingTerm();
    quotient.add(dividendLT.div(divisorLT)!, true);
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

export const getKatexLongDivision = (longDivision: LongDivisionProcess) => {
  const divisorKatex = longDivision.divisor.getKatex();
  const phDivisorKatex = `\\phantom\{${divisorKatex})\}`;
  // const phDivisorKatex = divisorKatex;
  // exp = expression
  let exp = "\\begin{array}{l}";
  exp += `${phDivisorKatex}${longDivision.quotient.getKatex()}\\\\`;
  exp += `${divisorKatex}\{\\overline\{\\smash\{\\big)\}${longDivision.dividend.getKatex()}\}\}\\\\`;
  for (let i = 0; i < longDivision.steps.length; i++) {
    const step = longDivision.steps[i];
    const margin = getMargin(step.getDegree());
    if (i % 2 === 0) {
      exp += `${phDivisorKatex}${margin}\\underline\{${step.getKatex(
        true
      )}\}\\\\`;
    } else {
      exp += `${phDivisorKatex}${margin}${step.getKatex(true)}\\\\`;
    }
  }
  exp += "\\end{array}";

  function getMargin(upToDegree: number) {
    let margin = "";
    for (let deg = longDivision.dividend.getDegree(); deg > upToDegree; deg--) {
      const term = longDivision.dividend.getTerm(deg);
      if (!term) continue;
      margin += `${term.getKatex(true)}`;
    }
    if (margin !== "") return `\\phantom\{${margin}\}`;
    return margin;
  }
  return exp;
};
