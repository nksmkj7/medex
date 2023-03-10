import { ObjectLiteral, QueryRunner } from 'typeorm';
import { difference } from 'lodash';

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
  timeToCompareWith: string,
  timeToCompare: string,
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
  timeToCompareWith: string,
  timeToCompare: string,
  compareEquality?: boolean
) => {
  timeToCompare = timeToCompare.replace(':', '');
  timeToCompareWith = timeToCompareWith.replace(':', '');
  if (compareEquality) {
    return timeToCompare <= timeToCompareWith;
  }
  return timeToCompare < timeToCompareWith;
};

export const generateUniqueToken = async (
  length: number,
  uniqueCheckFunction?: (token: string) => Promise<boolean>
) => {
  const token = generateRandomCode(length);
  if (uniqueCheckFunction && !(await uniqueCheckFunction(token))) {
    await generateUniqueToken(length);
  }
  return token;
};

export const generateRandomCode = (
  length: number,
  uppercase = true,
  lowercase = true,
  numerical = true
): string => {
  let result = '';
  const lowerCaseAlphabets = 'abcdefghijklmnopqrstuvwxyz';
  const upperCaseAlphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numericalLetters = '0123456789';
  let characters = '';
  if (uppercase) {
    characters += upperCaseAlphabets;
  }
  if (lowercase) {
    characters += lowerCaseAlphabets;
  }
  if (numerical) {
    characters += numericalLetters;
  }
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export async function dropForeignKeys(
  queryRunner: QueryRunner,
  tableName: string,
  columnNames: string[]
) {
  const table = await queryRunner.getTable(tableName);

  for (const foreignKey of table.foreignKeys) {
    for (const columnName of columnNames) {
      if (foreignKey.columnNames.includes(columnName)) {
        await queryRunner.dropForeignKey(tableName, foreignKey.name);
      }
    }
  }
}

export async function dropUniqueConstraints(
  queryRunner: QueryRunner,
  tableName: string,
  columnNames: string[]
) {
  const table = await queryRunner.getTable(tableName);
  for (const uniqueConstraint of table.uniques) {
    if (difference(uniqueConstraint.columnNames, columnNames).length) {
      await queryRunner.dropUniqueConstraint(tableName, uniqueConstraint.name);
    }
  }
}
