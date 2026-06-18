import { useState, useMemo } from 'react';
import { stableSort, getComparator } from "./Utils";

/**
 * initial:
 * {
 *   order?: 'asc' | 'desc',
 *   orderBy?: string,
 *   page?: number,
 *   rowsPerPage?: number,
 *   selected?: (string|number)[],
 *   search?: string,
 *   filters?: any[],
 *   columns?: { id: string, visible?: boolean }[],
 * }
 */
export function useDynamicListState(data = [], columns = [], initial = {}) {
  // sorting
  const [order, setOrder] = useState(initial.order || 'asc');
  const [orderBy, setOrderBy] = useState(initial.orderBy || null);

  // pagination
  const [page, setPage] = useState(initial.page || 0);
  const [rowsPerPage, setRowsPerPage] = useState(initial.rowsPerPage || 25);

  // selection (ids)
  const [selected, setSelected] = useState(initial.selected || []);

  // search and filters
  const [search, setSearch] = useState(initial.search || '');
  const [filters, setFilters] = useState(initial.filters || []);

  // column settings / visibility
  const [visibleColumnElements, setVisibleColumnElements] = useState(
    initial.visibleColumnElements || [],
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [columnState, setColumnState] = useState(
    // if initial.columns passed, honor their visible flag
    (initial.columns || []).map((col) => ({
      ...col,
      visible: col.visible !== false, // default true
    })),
  );

  // derived list of visible columns
  const visibleColumns = useMemo(
    () => columnState.filter((c) => c.visible),
    [columnState],
  );

  // column settings dialog controls
  const openSettings = () => setSettingsOpen(true);
  const closeSettings = () => setSettingsOpen(false);

  // update visibility given an array of column configs from ListSettings
  const handleColumnsChange = (nextColumns) => {
    setColumnState(
      nextColumns.map((col) => ({
        ...col,
        visible: col.visible !== false,
      })),
    );
  };

  // sort handler (typically used by EnhancedTableHead)
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // select all / clear all on current page
  const handleSelectAllClick = (event, rowsOnPage, getRowId) => {
    if (event.target.checked) {
      const newSelected = rowsOnPage.map((row) => getRowId(row));
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // toggle a single row selection
  const handleRowSelect = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  // pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const value = parseInt(event.target.value, 10);
    setRowsPerPage(value);
    setPage(0);
  };

  // Only show columns and data for selected columns, preserving order from visibleColumnElements
    const filteredColumns = visibleColumnElements
      .map(element => columns.find(col => col.element === element))
      .filter(Boolean);
    
    const filteredData = data.map(row => {
      const filteredRow = {};
      visibleColumnElements.forEach(el => {
        filteredRow[el] = row[el];
      });
      // Always include sys_id for row keys/links
      if (row.sys_id) filteredRow.sys_id = row.sys_id;
      return filteredRow;
    });

  // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
      page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;
  
    const visibleRows = useMemo(
      () =>
        stableSort(filteredData, getComparator(order, orderBy)).slice(
          page * rowsPerPage,
          page * rowsPerPage + rowsPerPage
        ),
      [order, orderBy, page, rowsPerPage, filteredData]
    );

  return {
    // state
    order,
    orderBy,
    page,
    rowsPerPage,
    emptyRows,
    visibleRows,
    filteredColumns,
    filteredData,
    selected,
    search,
    filters,
    settingsOpen,
    columns: columnState,
    visibleColumns,
    setVisibleColumnElements,
    visibleColumnElements,

    // simple setters
    setSearch,
    setFilters,

    // column visibility
    openSettings,
    closeSettings,
    handleColumnsChange,

    // table interactions
    handleRequestSort,
    handleSelectAllClick,
    handleClick,
    handleRowSelect,
    isSelected,
    handleChangePage,
    handleChangeRowsPerPage,
  };
}