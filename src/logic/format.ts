import { PolynomialDivisionProcess } from "./division";

export const getKatexLongDivision = (
  longDivision: PolynomialDivisionProcess
) => {
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
