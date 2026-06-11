// src/components/dynamicList/Utils.js

// Generic descending comparator for a given field
export function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

// Returns a comparator function based on order and orderBy
export function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Stable sort using a comparator
export function stableSort(array, comparator) {
  const stabilized = array.map((el, index) => [el, index]);
  stabilized.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilized.map((el) => el[0]);
}

// Example: build query params from local list state
export function buildListQuery(baseQuery = {}, { search, filters, order, orderBy, page, rowsPerPage }) {
  const query = { ...baseQuery };

  if (search) {
    query.search = search;
  }

  if (filters && filters.length > 0) {
    query.filters = filters;
  }

  if (orderBy) {
    query.sort = `${order === 'desc' ? '-' : ''}${orderBy}`;
  }

  if (typeof page === 'number' && typeof rowsPerPage === 'number') {
    query.offset = page * rowsPerPage;
    query.limit = rowsPerPage;
  }

  return query;
}