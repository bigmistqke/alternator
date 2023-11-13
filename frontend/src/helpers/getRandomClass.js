const getRandomClass = (min, max) =>
  `col_${Math.floor(Math.random() * (max - min) + min)}`;
export default getRandomClass