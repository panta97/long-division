import { cloneDeep } from "lodash";
import { Monomial } from "./monomial";
import { RealNumber } from "./realNumber";

interface PolynomialOptions {
  inPlace?: boolean;
  addMissingTerms?: boolean;
}

export class Polynomial {
  static defaultOptions: Required<PolynomialOptions> = {
    inPlace: false,
    addMissingTerms: true,
  };
  terms: Monomial[];

  constructor(terms: Monomial[]) {
    this.terms = terms;
  }

  getOptions(customOptions?: PolynomialOptions) {
    return { ...Polynomial.defaultOptions, ...customOptions };
  }

  static buildFromString(expression: string, options?: PolynomialOptions) {
    const defaultOptions = { ...Polynomial.defaultOptions, ...options };
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
      polynomial.add(monomial, { ...defaultOptions, inPlace: true });
    }

    return polynomial;
  }

  private addMissingTerms() {
    // add missing in-between terms
    for (let i = 1; i < this.terms.length; i++) {
      const term = this.terms[i];
      const prevTerm = this.terms[i - 1];
      if (prevTerm.degree - term.degree > 1) {
        for (let d = prevTerm.degree - 1; d > term.degree; d--) {
          const number = new RealNumber(0, 1);
          const monomial = new Monomial(number, d);
          this.appendTerm(monomial);
        }
      }
    }
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

  add(term: Monomial, options?: PolynomialOptions) {
    const defaultOptions = this.getOptions(options);
    const currPolynomial = defaultOptions.inPlace ? this : cloneDeep(this);
    const polTerm = this.terms.find((t) => t.degree === term.degree);
    if (polTerm) {
      polTerm.coefficient.add(term.coefficient, true);
    } else {
      currPolynomial.appendTerm(term);
      if (defaultOptions.addMissingTerms) currPolynomial.addMissingTerms();
    }
    if (!defaultOptions.inPlace) return currPolynomial;
  }

  mul(term: Monomial, options?: PolynomialOptions) {
    const defaultOptions = this.getOptions(options);
    const currPolynomial = defaultOptions.inPlace ? this : cloneDeep(this);
    for (let i = 0; i < currPolynomial.terms.length; i++) {
      const currTerm = currPolynomial.terms[i];
      currTerm.coefficient.mul(term.coefficient, true);
      currTerm.degree += term.degree;
    }
    if (!defaultOptions.inPlace) return currPolynomial;
  }

  addPol(pol: Polynomial, options?: PolynomialOptions) {
    const defaultOptions = this.getOptions(options);
    const currPolynomial = defaultOptions.inPlace ? this : cloneDeep(this);
    pol.terms.forEach((term) => currPolynomial.add(term, { inPlace: true }));
    if (!defaultOptions.inPlace) return currPolynomial;
  }

  mulPol(pol: Polynomial, options?: PolynomialOptions) {
    const defaultOptions = this.getOptions(options);
    const currPolynomial = defaultOptions.inPlace ? this : cloneDeep(this);
    pol.terms.forEach((term) => currPolynomial.mul(term, { inPlace: true }));
    if (!defaultOptions.inPlace) return currPolynomial;
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
    const nonZeroTerms = this.getNonZeroTerms();
    return nonZeroTerms[nonZeroTerms.length - 1];
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
