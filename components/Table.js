import React, { useState } from "react";
import { useTable, useFilters, useSortBy, usePagination } from "react-table";

export default function Table({ columns, data }) {
  const [filterInput, setFilterInput] = useState("");
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    pageOptions,
    page,
    state: { pageIndex, pageSize },
    gotoPage,
    previousPage,
    nextPage,
    setPageSize,
    canPreviousPage,
    canNextPage,
    setFilter
  } = useTable({ columns, data, initialState: { pageIndex: 0, pageSize: 7 }, }, useFilters, useSortBy, usePagination );

  const handleFilterChange = e => {
    const value = e.target.value || undefined;
    setFilter("name", value);
    setFilterInput(value);
  };

  // Render the UI for your table
  return (
    <>
      <div className="ml-10">
        <input
        className="outline-none py-2 pl-4 block w-48 border-b-2 border-yellow-900 bg-transparent"
        value={filterInput}
        onChange={handleFilterChange}
        placeholder={"Search name"}
        />
      </div>
      <table {...getTableProps()} className="rounded-t-lg m-5 w-5/6 mx-auto bg-gray-800 text-gray-200">
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()} className="text-left border-b border-gray-300">
              {headerGroup.headers.map(column => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className={
                    column.isSorted
                      ? column.isSortedDesc
                        ? "sort-desc"
                        : "sort-asc"
                      : ""
                  }
                  className="px-4 py-3"
                >
                  {column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} className="bg-gray-700 border-b border-gray-600">
                {row.cells.map(cell => {
                  return (
                    <td {...cell.getCellProps()} className="px-4 py-3">{cell.render("Cell")}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="flex justify-center mr-8 gap-2">
        <button className="border px-1" onClick={() => gotoPage(0)} disabled={!canPreviousPage}>{'|<'}</button>
        <button className="border px-2" onClick={() => previousPage()} disabled={!canPreviousPage}>{'<'}</button>
        <button className="border px-2" onClick={() => nextPage()} disabled={!canNextPage}>{'>'}</button>
        <button className="border px-1" onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>{'>|'}</button>
        <span>
          &nbsp;Page &nbsp;
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>
        </span>
        <span>
          | Go to page:
          <input
            type="number"
            className="text-center bg-transparent text-white border ml-2"
            defaultValue={pageIndex + 1}
            onChange={e => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0
              gotoPage(page)
            }}
            style={{ width: '100px' }}
          />
        </span>
        <select
          value={pageSize}
          className="text-center bg-transparent text-white border ml-2"
          onChange={e => {
            setPageSize(Number(e.target.value))
          }}
        >
          {[7, 10, 20, 30, 50].map(pageSize => (
            <option key={pageSize} value={pageSize} className="text-center bg-blue-900 text-white border ml-2">
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}