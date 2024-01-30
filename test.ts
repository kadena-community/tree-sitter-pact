import sss from "./interfaces";

interface ITest {
  test: string;
}
sss;
type Test = ITest;

function test(test: Test): void {
  console.log(test);
}

document.body.innerHTML = test({ test: "test" });

pact`(coin.transfer "k:asdasdasdasd" [100])`;
