import { gcd } from "./shared";

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
