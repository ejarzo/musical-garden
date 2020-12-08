const mouseIsInDrawArea = () =>
  mouseX < width && mouseY < height && !(mouseX < 280 && mouseY < 80);

const sign = (p1, p2, p3) => {
  return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
};

// https://stackoverflow.com/questions/2049582/how-to-determine-if-a-point-is-in-a-2d-triangle
const pointInTriangle = (v1, v2, v3) => (pt) => {
  const d1 = sign(pt, v1, v2);
  const d2 = sign(pt, v2, v3);
  const d3 = sign(pt, v3, v1);

  const has_neg = d1 < 0 || d2 < 0 || d3 < 0;
  const has_pos = d1 > 0 || d2 > 0 || d3 > 0;

  return !(has_neg && has_pos);
};

const getHue = (h) => Math.floor(h < 0 ? 360 - h : h % 360);

const getSentence = (ruleset) => {
  const { rules, nGenerations, startingLetter } = ruleset;
  const lsys = new LSystem(
    startingLetter,
    rules.map((rls) => new Rule(...rls))
  );

  for (let i = 0; i < nGenerations; i++) {
    lsys.generate();
  }

  return lsys.getSentence();
};
