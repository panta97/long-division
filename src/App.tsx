import { useState } from "react";
import { KatexRender } from "./KatexRender";
import { longDivision } from "./logic/division";
import { getKatexLongDivision } from "./logic/format";
import { Polynomial } from "./logic/polynomial";

function App() {
  const [dividend, setDividend] = useState("x^6+x^5+8x");
  const [divisor, setDivisor] = useState("-x-2");
  const [expression, setExpression] = useState("");

  const handleDivision = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const polDividend = Polynomial.buildFromString(dividend, {
      addMissingTerms: true,
    });
    const polDivisor = Polynomial.buildFromString(divisor, {
      addMissingTerms: true,
    });

    const result = longDivision(polDividend, polDivisor);
    const resultExp = getKatexLongDivision(result);
    setExpression(resultExp);

    // setExpression(polDividend.getKatex());
  };

  return (
    <div className="m-6">
      <div>
        <div className="border p-4">
          <form
            className="flex flex-col w-[200px] space-y-2 mx-auto"
            onSubmit={(e) => handleDivision(e)}
          >
            <input
              value={dividend}
              onChange={(e) => setDividend(e.target.value)}
              type="text"
              className="border dark:border-white border-black border-dashed px-1 focus:border-transparent focus:outline-offset-[-1px] focus:outline-dashed focus:outline-blue-600 dark:bg-inherit"
            />
            <span className="border-t border-black dark:border-white" />
            <input
              value={divisor}
              onChange={(e) => setDivisor(e.target.value)}
              type="text"
              className="border dark:border-white border-black border-dashed px-1 focus:border-transparent focus:outline-offset-[-1px] focus:outline-dashed focus:outline-blue-600 dark:bg-inherit"
            />
            <button className="border">Divide</button>
          </form>
        </div>
        <KatexRender expression={expression} />
      </div>
    </div>
  );
}

export default App;
