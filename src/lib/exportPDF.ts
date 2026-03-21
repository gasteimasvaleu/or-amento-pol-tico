import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Despesa } from "@/types/despesa";

const getMonthName = (month: number) =>
  new Date(2000, month, 1).toLocaleDateString("pt-BR", { month: "long" });

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function exportDespesasToPDF(despesas: Despesa[], month: number, year: number) {
  const doc = new jsPDF();
  const monthName = getMonthName(month);
  const title = `Relatório de Despesas - ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;

  // Header
  doc.setFontSize(16);
  doc.text(title, 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`, 14, 28);
  doc.setTextColor(0);

  // Table
  const rows = despesas.map((d) => [
    d.municipio,
    d.responsavel,
    d.cargo,
    d.tipo,
    formatCurrency(Number(d.valor)),
    d.pagamento_feito_em ? "Pago" : "Pendente",
  ]);

  autoTable(doc, {
    startY: 35,
    head: [["Município", "Responsável", "Cargo", "Tipo", "Valor", "Status"]],
    body: rows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  // Totals
  const total = despesas.reduce((sum, d) => sum + Number(d.valor), 0);
  const pagos = despesas.filter((d) => d.pagamento_feito_em).length;
  const pendentes = despesas.length - pagos;

  const finalY = (doc as any).lastAutoTable?.finalY ?? 50;
  doc.setFontSize(11);
  doc.text(`Total: ${formatCurrency(total)}`, 14, finalY + 12);
  doc.setFontSize(9);
  doc.text(`${despesas.length} despesas | ${pagos} pagas | ${pendentes} pendentes`, 14, finalY + 20);

  doc.save(`despesas-${monthName}-${year}.pdf`);
}
