export const slugify = (...args: (string | number)[]): string => {
  const value = args.join(' ');
  return value
    .normalize('NFD') // split an accented letter in the base letter and the acent
    .replace(/[\u0300-\u036f]/g, '') // remove all previously split accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, '') // remove all chars not letters, numbers and spaces (to be replaced)
    .replace(/\s+/g, '-'); // separator
};

export const isGreaterThanTime = (
  timeToCompare: string,
  timeToCompareWith: string,
  compareEquality?: boolean
) => {
  timeToCompare = timeToCompare.replace(':', '');
  timeToCompareWith = timeToCompareWith.replace(':', '');
  if (compareEquality) {
    return timeToCompare >= timeToCompareWith;
  }
  return timeToCompare > timeToCompareWith;
};

export const isSmallerThanTime = (
  timeToCompare: string,
  timeToCompareWith: string,
  compareEquality?: boolean
) => {
  timeToCompare = timeToCompare.replace(':', '');
  timeToCompareWith = timeToCompareWith.replace(':', '');
  if (compareEquality) {
    return timeToCompare <= timeToCompareWith;
  }
  return timeToCompare < timeToCompareWith;
};
