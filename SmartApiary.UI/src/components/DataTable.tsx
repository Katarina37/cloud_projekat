// Zajednicka UI komponenta: DataTable.

import type { ReactNode } from 'react';

// RowData predstavlja tip jednog reda koji tabela prikazuje.
export type DataTableColumn<RowData> = {
  header: string;
  render: (row: RowData) => ReactNode;
  className?: string;
};

type DataTableProps<RowData> = {
  columns: DataTableColumn<RowData>[];
  rows: RowData[];
  getRowKey: (row: RowData) => string;
  minWidth?: number;
};

export default function DataTable<RowData>({
  columns,
  rows,
  getRowKey,
  minWidth = 760,
}: DataTableProps<RowData>) {
  return (
    <div className="table-scroll">
      <table className="data-table" style={{ minWidth }}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th className={column.className} key={column.header}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)}>
              {columns.map((column) => (
                <td className={column.className} key={column.header}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
