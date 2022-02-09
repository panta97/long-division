import { cloneDeep } from "lodash";
import { RealNumber } from "./realNumber";

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
