import { Despesa } from "@/types/despesa";
import { format } from "date-fns";

export function exportToCSV(despesas: Despesa[], filename: string = 'despesas') {
  if (despesas.length === 0) {
    return;
  }

  // Define headers
  const headers = [
    'Município',
    'Responsável',
    'Cargo',
    'Tipo',
    'Conta/PIX',
    'Último Pagamento',
    'Valor (R$)',
    'Observação'
  ];

  // Convert data to CSV format
  const csvData = despesas.map(despesa => [
    despesa.municipio,
    despesa.responsavel,
    despesa.cargo,
    despesa.tipo,
    despesa.conta_pix,
    format(new Date(despesa.ultimo_pagamento), 'dd/MM/yyyy'),
    despesa.valor.toFixed(2).replace('.', ','),
    despesa.observacao || ''
  ]);

  // Combine headers and data
  const csvContent = [
    headers.join(';'),
    ...csvData.map(row => row.map(cell => `"${cell}"`).join(';'))
  ].join('\n');

  // Create blob and download
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
