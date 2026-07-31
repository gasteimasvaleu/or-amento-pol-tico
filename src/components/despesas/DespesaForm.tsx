import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DespesaFormData } from "@/types/despesa";
import { FotoResponsavelField } from "./FotoResponsavelField";

const formSchema = z.object({
  municipio: z.string().min(2, "Município é obrigatório").max(100),
  responsavel: z.string().min(2, "Responsável é obrigatório").max(100),
  cargo: z.string().min(2, "Cargo é obrigatório").max(100),
  tipo: z.enum(['Recorrente', 'Extra'], {
    required_error: "Tipo é obrigatório",
  }),
  conta_pix: z.string().min(3, "Conta/PIX é obrigatório").max(255),
  valor: z.number().min(0.01, "Valor deve ser maior que zero"),
  ultimo_pagamento: z.date({
    required_error: "Data do pagamento é obrigatória",
  }),
  pagamento_agendado: z.date().optional(),
  observacao: z.string().max(1000).optional(),
  foto_url: z.string().nullable().optional(),
}).refine((data) => {
  // Se for Recorrente, pagamento_agendado é obrigatório
  if (data.tipo === 'Recorrente' && !data.pagamento_agendado) {
    return false;
  }
  return true;
}, {
  message: "Dia do pagamento mensal é obrigatório para despesas recorrentes",
  path: ["pagamento_agendado"],
});

interface DespesaFormProps {
  onSubmit: (data: DespesaFormData) => void;
  defaultValues?: Partial<DespesaFormData>;
  isLoading?: boolean;
}

export function DespesaForm({ onSubmit, defaultValues, isLoading }: DespesaFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      municipio: "",
      responsavel: "",
      cargo: "",
      tipo: "Recorrente",
      conta_pix: "",
      valor: undefined,
      observacao: "",
      foto_url: null,
    },
  });

  const tipoSelecionado = form.watch("tipo");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="foto_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Foto do responsável</FormLabel>
              <FotoResponsavelField value={field.value} onChange={field.onChange} />
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="municipio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Município *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: São Paulo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="responsavel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsável *</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do responsável" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cargo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cargo *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Vereador, Assessor" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Recorrente">Recorrente</SelectItem>
                    <SelectItem value="Extra">Extra</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Recorrente para pagamentos mensais, Extra para pagamentos únicos
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="conta_pix"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Conta / PIX *</FormLabel>
                <FormControl>
                  <Input placeholder="Número da conta ou chave PIX" {...field} />
                </FormControl>
                <FormDescription>
                  Dados bancários para realizar o pagamento
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="valor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor (R$) *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    value={field.value || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      field.onChange(val === '' ? 0 : parseFloat(val));
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormDescription>
                  {tipoSelecionado === 'Recorrente' 
                    ? 'Valor mensal da despesa' 
                    : 'Valor total do pagamento único'}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ultimo_pagamento"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>
                  {tipoSelecionado === 'Recorrente' 
                    ? 'Pagamento Inicial *' 
                    : 'Data do Pagamento Extra *'}
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione a data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  {tipoSelecionado === 'Recorrente' 
                    ? 'Data de referência para início do rastreamento no sistema' 
                    : 'Data em que o pagamento único será/foi realizado'}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {tipoSelecionado === 'Recorrente' && (
            <FormField
              control={form.control}
              name="pagamento_agendado"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Dia do Pagamento Mensal *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione a data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    O dia escolhido será usado como referência para calcular o vencimento em cada mês
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <FormField
          control={form.control}
          name="observacao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observação</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Observações adicionais sobre a despesa..."
                  className=""
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar Despesa"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
