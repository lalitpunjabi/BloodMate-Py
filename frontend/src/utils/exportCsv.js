export const exportToCsv = (filename, rows, headers) => {
  if (!rows || !rows.length) {
    return;
  }
  
  const separator = ',';
  const csvContent = [
    headers.join(separator),
    ...rows.map(row => {
      return headers.map(header => {
        let field = row[header];
        if (field === null || field === undefined) {
          field = '';
        } else if (typeof field === 'object') {
          field = JSON.stringify(field);
        }
        
        // Escape quotes
        field = String(field).replace(/"/g, '""');
        
        return `"${field}"`;
      }).join(separator);
    })
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
