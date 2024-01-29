import sss from "./interfaces";

interface ITest {
  test: string;
}
sss;
type Test = ITest;

function test(test: Test): void {}

document.body.innerHTML = test({ test: "test" });
