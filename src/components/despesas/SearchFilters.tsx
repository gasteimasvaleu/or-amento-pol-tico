import { useState, useEffect } from "react";
import { Search, Download, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DespesaFilters, Despesa } from "@/types/despesa";
import { exportToCSV } from "@/lib/exportCSV";

interface SearchFiltersProps {
  filters: DespesaFilters;
  onFiltersChange: (filters: DespesaFilters) => void;
  despesas: Despesa[];
  municipios: string[];
  cargos: string[];
}

export function SearchFilters({ filters, onFiltersChange, despesas, municipios, cargos }: SearchFiltersProps) {
  const [search, setSearch] = useState(filters.search || '');
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const [selectedMonth, setSelectedMonth] = useState(filters.month ?? currentMonth);
  const [selectedYear, setSelectedYear] = useState(filters.year ?? currentYear);

  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({ ...filters, search });
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleMonthChange = (month: string) => {
    const monthNum = parseInt(month);
    setSelectedMonth(monthNum);
    onFiltersChange({ ...filters, month: monthNum, year: selectedYear });
  };

  const handleYearChange = (year: string) => {
    const yearNum = parseInt(year);
    setSelectedYear(yearNum);
    onFiltersChange({ ...filters, month: selectedMonth, year: yearNum });
  };

  const months = [
    { value: 0, label: 'Janeiro' },
    { value: 1, label: 'Fevereiro' },
    { value: 2, label: 'Março' },
    { value: 3, label: 'Abril' },
    { value: 4, label: 'Maio' },
    { value: 5, label: 'Junho' },
    { value: 6, label: 'Julho' },
    { value: 7, label: 'Agosto' },
    { value: 8, label: 'Setembro' },
    { value: 9, label: 'Outubro' },
    { value: 10, label: 'Novembro' },
    { value: 11, label: 'Dezembro' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por município, responsável, cargo ou conta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Button 
          onClick={() => exportToCSV(despesas, 'despesas-politicas')} 
          variant="outline"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Select value={selectedMonth.toString()} onValueChange={handleMonthChange}>
          <SelectTrigger>
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value.toString()}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={filters.municipio || 'all'} 
          onValueChange={(value) => onFiltersChange({ ...filters, municipio: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Município" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os municípios</SelectItem>
            {municipios.map((municipio) => (
              <SelectItem key={municipio} value={municipio}>
                {municipio}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={filters.cargo || 'all'} 
          onValueChange={(value) => onFiltersChange({ ...filters, cargo: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Cargo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os cargos</SelectItem>
            {cargos.map((cargo) => (
              <SelectItem key={cargo} value={cargo}>
                {cargo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={filters.tipo || 'all'} 
          onValueChange={(value) => onFiltersChange({ ...filters, tipo: value as any })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="Recorrente">Recorrente</SelectItem>
            <SelectItem value="Extra">Extra</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
