/* Local fixtures and pure query helpers; no network or browser storage required. */
(function (root) {
  'use strict';
  const common = {
    operatingUnit: 'MCHK_OU', warehouse: 'HKW', productLine: 'Altera',
    partNumber: 'EPM240T100C5N', mpn: 'EPM240T100C5N', vendorName: 'Macnica',
    manufacturingReference: 'MAX II',
  };
  const records = [
    { hold: 'No', holdDetail: '—', split: 'No', lotNumber: '2608031160002110', receivedDate: '2026-08-03', subinventory: 'WIP', locator: 'WIP', qty: 1000, supplierLot: '—', coo: '—', dateCode: '2505', supplierDateCode: '2505', standardDateCode: '2505', poNumber: 'PO2608001', asnNumber: 'ASN2608001', receiptNumber: 'RCV2608001' },
    { hold: 'Yes', holdDetail: 'Working Lot', split: 'No', lotNumber: '2603231160007907', receivedDate: '2026-03-23', subinventory: 'GS', locator: 'GS.A07.7.B10', qty: 540, supplierLot: 'V8RAJ41018', coo: 'MY', dateCode: '2601', supplierDateCode: '2601', standardDateCode: '2601', poNumber: 'PO2603001', asnNumber: 'ASN2603001', receiptNumber: 'RCV2603001' },
    { hold: 'Yes', holdDetail: 'Working Lot', split: 'No', lotNumber: '2602251160006842', receivedDate: '2026-02-25', subinventory: 'YKK-JB', locator: 'YKK-JB.M06.3.B1', qty: 89, supplierLot: 'S602MJ36', coo: 'MY', dateCode: '2601', supplierDateCode: '2601', standardDateCode: '2601', poNumber: 'PO2602001', asnNumber: 'ASN2602001', receiptNumber: 'RCV2602001' },
    { hold: 'Yes', holdDetail: 'Working Lot', split: 'No', lotNumber: '2602251160006855', receivedDate: '2026-02-25', subinventory: 'YKK-JB', locator: 'YKK-JB.M06.3.B1', qty: 181, supplierLot: 'S604MJ26', coo: 'MY', dateCode: '2601', supplierDateCode: '2601', standardDateCode: '2601', poNumber: 'PO2602002', asnNumber: 'ASN2602002', receiptNumber: 'RCV2602002' },
    { hold: 'Yes', holdDetail: 'Working Lot', split: 'Yes', lotNumber: '2602021160002084', receivedDate: '2026-01-27', subinventory: 'YKK-JB', locator: 'YKK-JB.M06.3.B1', qty: 223, supplierLot: 'S545MJ19', coo: 'MY', dateCode: '2543', supplierDateCode: '2543', standardDateCode: '2543', poNumber: 'PO2601001', asnNumber: 'ASN2601001', receiptNumber: 'RCV2601001' },
  ].map(record => ({ ...common, ...record }));
  const columns = [
    ['hold', 'Hold', 100], ['holdDetail', 'Hold detail', 134], ['split', 'Split', 100],
    ['lotNumber', 'Lot number', 172], ['mpn', 'MPN', 172], ['receivedDate', 'Received date', 142],
    ['subinventory', 'Subinventory', 142], ['locator', 'Locator', 164], ['qty', 'Qty', 116],
    ['supplierLot', 'Supplier lot', 146], ['coo', 'COO', 114], ['dateCode', 'Date code', 136],
  ].map(([key, label, width]) => ({ key, label, width }));
  const defaults = { operatingUnit: 'MCHK_OU', warehouse: 'HKW', mpn: 'EPM240T100C5N' };
  const inboundRecords = [
    { id: 'RCV2608001', type: 'ASN receipt', reference: 'ASN2608001', po: 'PO2608001', supplier: 'Macnica Taiwan', status: 'Ready to receive', eta: '28 Oct 2026', lines: 6, quantity: 1200, received: 0, location: 'Receiving dock 01', owner: 'Inbound team' },
    { id: 'RCV2608002', type: 'ASN receipt', reference: 'ASN2608002', po: 'PO2608002', supplier: 'Altera Components', status: 'Receiving in progress', eta: '28 Oct 2026', lines: 4, quantity: 860, received: 540, location: 'Receiving dock 02', owner: 'CONRADHUA' },
    { id: 'RCV2607009', type: 'Putaway', reference: 'RCV2607009', po: 'PO2607004', supplier: 'Macnica Taiwan', status: 'Putaway pending', eta: '27 Oct 2026', lines: 3, quantity: 493, received: 493, location: 'Staging area A', owner: 'Inbound team' },
    { id: 'RMA2601003', type: 'RMA return', reference: 'RMA2601003', po: 'SO2604118', supplier: 'CATL customer return', status: 'Awaiting inspection', eta: '28 Oct 2026', lines: 2, quantity: 32, received: 0, location: 'RMA quarantine', owner: 'Quality team' },
    { id: 'RCV2606021', type: 'ASN receipt', reference: 'ASN2606021', po: 'PO2606015', supplier: 'YKK Industrial', status: 'Completed', eta: '26 Oct 2026', lines: 8, quantity: 2100, received: 2100, location: 'GS.A07.7.B10', owner: 'Inbound team' },
  ];
  const ranges = [['receivedFrom', 'receivedTo', 'receivedDate'], ['locatorFrom', 'locatorTo', 'locator'], ['standardDateCodeFrom', 'standardDateCodeTo', 'standardDateCode']];
  const selects = new Set(['operatingUnit', 'warehouse', 'productLine', 'subinventory', 'coo', 'split']);
  const normalize = value => String(value ?? '').trim().toLowerCase();
  const compare = (a, b) => String(a).localeCompare(String(b), 'en', { numeric: true, sensitivity: 'base' });

  function validate(filters) {
    for (const [from, to] of ranges) {
      if (filters[from] && filters[to] && compare(filters[from], filters[to]) > 0) {
        return { field: to, message: `${from.startsWith('received') ? 'Received date' : from.startsWith('locator') ? 'Locator' : 'Standard date code'}: the From value must not exceed the To value.` };
      }
    }
    return null;
  }
  function query(filters = {}, columnFilters = {}, sort = null) {
    const rangeFields = new Set(ranges.flatMap(([from, to]) => [from, to]));
    const result = records.filter(record => {
      for (const [key, value] of Object.entries(filters)) {
        if (!normalize(value) || value === 'All' || rangeFields.has(key)) continue;
        if (selects.has(key) ? normalize(record[key]) !== normalize(value) : !normalize(record[key]).includes(normalize(value))) return false;
      }
      for (const [from, to, key] of ranges) {
        if (filters[from] && compare(record[key], filters[from]) < 0) return false;
        if (filters[to] && compare(record[key], filters[to]) > 0) return false;
      }
      for (const [key, value] of Object.entries(columnFilters)) {
        if (!normalize(value) || value === 'All') continue;
        const actual = key === 'receivedDate' ? formatDate(record[key]) : record[key];
        if (key === 'hold' ? actual !== value : !normalize(actual).includes(normalize(value))) return false;
      }
      return true;
    });
    if (sort) result.sort((a, b) => (sort.key === 'qty' ? a.qty - b.qty : compare(a[sort.key], b[sort.key])) * sort.direction);
    return result;
  }
  function formatDate(iso) {
    const [year, month, day] = iso.split('-');
    return `${day} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(month) - 1]} ${year}`;
  }
  function csv(rows, visibleColumns) {
    // Quote every cell; neutralize spreadsheet formulas in textual values.
    const cell = value => {
      let text = String(value ?? '');
      if (/^[=+@\-\t\r]/.test(text) && text !== '—') text = `'${text}`;
      return `"${text.replace(/"/g, '""')}"`;
    };
    return '\uFEFF' + [visibleColumns.map(c => cell(c.label)).join(','), ...rows.map(row => visibleColumns.map(c => cell(c.key === 'receivedDate' ? formatDate(row[c.key]) : row[c.key])).join(','))].join('\r\n');
  }
  const api = { records, columns, defaults, inboundRecords, validate, query, formatDate, csv };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.WMSData = api;
})(typeof window !== 'undefined' ? window : globalThis);
