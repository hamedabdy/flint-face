// Example JSDoc typedefs (use TypeScript if you ever migrate)
/**
 * @typedef {Object} DynamicListColumn
 * @property {string} id
 * @property {string} label
 * @property {'left' | 'right' | 'center'} [align]
 * @property {boolean} [numeric]
 * @property {(row: any) => React.ReactNode} [render]
 */

/**
 * @typedef {Object} DynamicListProps
 * @property {string} title
 * @property {DynamicListColumn[]} columns
 * @property {any[]} rows
 * @property {Object} [baseQuery]
 * @property {(row: any) => string | number} getRowId
 * @property {(row: any) => void} [onRowClick]
 * @property {React.ReactNode[]} [toolbarActions]
 */