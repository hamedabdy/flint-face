// import PropTypes from "prop-types"; // data type checking
import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

// Styles
import {Box, TableContainer, Table, Paper, TablePagination} from "@mui/material";

// IMPORT LOCAL COMPONENTS
import ApiService from "../../services/ApiService";
import { loadListColumnPref, saveListColumnPref } from "../../services/userPreferenceService";
import EnhancedToolbar from "./EnhancedToolbar";
import QueryFilter from "./QueryFilter";
import EnhancedTableHead from "./EnhancedTableHead";
import EnhancedTableBody from "./EnhancedTableBody";
import TablePaginationActions from "./EnhancedTablePagination";
import { useDynamicListState } from "./useDynamicListState";

const DynamicList = () => {
  const { tableName } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sysparmQuery, setSysparmQuery] = useState(searchParams.get("sysparm_query"));
  const [sysparmFields, setSysparmFields] = useState(searchParams.get("sysparm_fields") || "");
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [table, setTable] = useState({}); // table metadata
  const listState = useDynamicListState(data, columns, {
    order: "desc",
    orderBy: "sys_updated_on",
  });


  // Fetches only the row data — called when fields/query change
const fetchData = async () => {
  try {
    const resp = await ApiService.getData({
      table_name:     tableName,
      sysparm_query:  sysparmQuery,
      sysparm_fields: sysparmFields,
    });
    setData(resp.data);
  } catch (error) {
    console.error(`Error loading data: ${error.message}`);
  }
};

// Loads columns + preference — called only on first load / table change
  const initColumns = async () => {
    try {
      const [colsResp, tableInfo, pref] = await Promise.all([
        ApiService.getColumns(tableName),
        ApiService.getTable(tableName),
        loadListColumnPref(tableName),
      ]);

      const allColumns = colsResp.data.rows;
      setColumns(allColumns);
      setTable(tableInfo.data);

      // Apply preference or default to all columns
      if (pref?.columns?.length) {
        const valid = pref.columns.filter(el => allColumns.some(c => c.element === el));
        if (valid.length) {
          listState.setVisibleColumnElements(valid);
          setSysparmFields(valid.join(","));
          return;
        }
      }
      // No preference — show all columns
      const allElements = allColumns.map(col => col.element);
      listState.setVisibleColumnElements(allElements);
      setSysparmFields(allElements.join(","));

    } catch (error) {
      console.error(`Error loading columns: ${error.message}`);
    }
  };

  // ── Effect 1: Fetch data when table, query OR visible fields change ──────────
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [tableName, sysparmQuery, sysparmFields]);

  
  // ── Effect 2: Init columns + preference ONLY on table change (first load) ────
  useEffect(() => {
    initColumns();
    // eslint-disable-next-line
  }, [tableName]);

  const handleFilterChange = (query) => {
    setSysparmQuery(query);
    fetchData();
  };

  // Handler for column selection from EnhancedToolbar
  const handleColumnsChange = async (selectedElements) => {
    // Update UI state
    listState.setVisibleColumnElements(selectedElements);
    const newSysparmFields = selectedElements.join(",");
    setSysparmFields(newSysparmFields);

    // Update URL (for bookmarking/sharing)
    const params = new URLSearchParams(window.location.search);
    params.set("sysparm_fields", newSysparmFields);
    navigate({ search: params.toString() }, { replace: true });

    // Persist preference — fire and forget
    try {
      await saveListColumnPref(tableName, selectedElements);
    } catch (err) {
      console.error(`Failed to save column preference: ${err.message}`);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ width: "100%", mb: 2, overflow: "hidden" }}>
        <EnhancedToolbar
          columns={columns}
          numSelected={listState.selected.length}
          tableName={tableName}
          table={table}
          onColumnsChange={handleColumnsChange}
          onFilterChange={handleFilterChange}
          visibleColumnElements={listState.visibleColumnElements}
        />
        <QueryFilter tableName={tableName} setData={setData} />
        <TableContainer
          component={Paper}
          elevation={1}
          sx={{ overflow: "auto" }}
        >
          <Table
            size="small"
            sx={{
              minWidth: 750,
                "& th, & td": {
                  padding: "2px 8px",
                  fontSize: "0.80rem",
                  lineHeight: 1.2,
                },
            }}
          >
            <EnhancedTableHead
              columns={listState.filteredColumns}
              visibleRows={listState.visibleRows}
              numSelected={listState.selected.length}
              order={listState.order}
              orderBy={listState.orderBy}
              onSelectAllClick={listState.handleSelectAllClick}
              onRequestSort={listState.handleRequestSort}
              rowCount={listState.filteredColumns.length}
              onFilterChange={handleFilterChange}
            />
            <EnhancedTableBody
              columns={listState.filteredColumns}
              visibleRows={listState.visibleRows}
              isSelected={listState.isSelected}
              handleClick={(event, id) => {
                listState.handleClick(event, id);
              }}
              emptyRows={listState.emptyRows}
              tableName={tableName}
            />
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={data.length}
          rowsPerPage={listState.rowsPerPage}
          page={listState.page}
          onPageChange={listState.handleChangePage}
          onRowsPerPageChange={listState.handleChangeRowsPerPage}
          ActionsComponent={TablePaginationActions}
        />
      </Paper>
    </Box>
  );
};

export default DynamicList;
