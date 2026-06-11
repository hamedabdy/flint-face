import { useMemo } from 'react';
import { buildListQuery } from './Utils';

// You likely already have a hook or function to fetch data: replace this
// with your actual API/data hook.
function useListData(queryBuilder, query) {
  // This is a placeholder. Wire to your real data layer:
  //   const { data, total, loading, error, refetch } = useApi(queryBuilder(query));
  // For now, assume props pass data and total directly (client-side mode).
  return {
    data: query.data || [],
    total: query.total || (query.data ? query.data.length : 0),
    loading: false,
    error: null,
  };
}

export function useDynamicListQuery({ baseQuery, search, filters, order, orderBy, page, rowsPerPage }) {
  const builtQuery = useMemo(
    () =>
      buildListQuery(baseQuery, {
        search,
        filters,
        order,
        orderBy,
        page,
        rowsPerPage,
      }),
    [baseQuery, search, filters, order, orderBy, page, rowsPerPage],
  );

  // If your list is server‑driven, call your real hook here:
  const { data, total, loading, error } = useListData((q) => q, builtQuery);

  return {
    query: builtQuery,
    data,
    total,
    loading,
    error,
  };
}