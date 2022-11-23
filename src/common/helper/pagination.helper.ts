import { PaginationInfoInterface } from 'src/paginate/pagination-info.interface';
import { SelectQueryBuilder } from 'typeorm';

export const paginate = async <T>(
  query: SelectQueryBuilder<T>,
  searchFilter: { limit: number; page: number; [index: string]: any }
) => {
  const { limit, page, skip } = getPaginationInfo(searchFilter);
  const queryClone = query.clone();
  if (limit) {
    query.limit(limit);
  }
  if (skip) {
    query.skip(skip);
  }
  return {
    result: await query.getRawMany(),
    pageSize: limit,
    currentPage: page,
    total: await queryClone.getCount()
  };
};

export const getPaginationInfo = (options): PaginationInfoInterface => {
  const page =
    typeof options.page !== 'undefined' && options.page > 0 ? options.page : 1;
  const limit =
    typeof options.limit !== 'undefined' && options.limit > 0
      ? options.limit
      : 10;
  return {
    skip: (page - 1) * limit,
    limit,
    page
  };
};
