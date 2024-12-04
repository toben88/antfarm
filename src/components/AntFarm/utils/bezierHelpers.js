export const getBezierPoint = (t, p0, p1, p2, p3) => {
  const oneMinusT = 1 - t;
  return {
    x: Math.pow(oneMinusT, 3) * p0.x +
       3 * Math.pow(oneMinusT, 2) * t * p1.x +
       3 * oneMinusT * Math.pow(t, 2) * p2.x +
       Math.pow(t, 3) * p3.x,
    y: Math.pow(oneMinusT, 3) * p0.y +
       3 * Math.pow(oneMinusT, 2) * t * p1.y +
       3 * oneMinusT * Math.pow(t, 2) * p2.y +
       Math.pow(t, 3) * p3.y
  };
};

export const getBezierTangent = (t, p0, p1, p2, p3) => {
  const oneMinusT = 1 - t;
  const tx = -3 * p0.x * Math.pow(oneMinusT, 2) +
             3 * p1.x * (1 - 4*t + 3*Math.pow(t, 2)) +
             3 * p2.x * (2*t - 3*Math.pow(t, 2)) +
             3 * p3.x * Math.pow(t, 2);
  const ty = -3 * p0.y * Math.pow(oneMinusT, 2) +
             3 * p1.y * (1 - 4*t + 3*Math.pow(t, 2)) +
             3 * p2.y * (2*t - 3*Math.pow(t, 2)) +
             3 * p3.y * Math.pow(t, 2);
  return Math.atan2(ty, tx);
}; 