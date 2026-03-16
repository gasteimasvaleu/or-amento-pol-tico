import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Upload, ChevronDown, ChevronUp, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { importarCSVEleitoral, type ImportProgress } from "@/lib/tseClient";

interface ImportResult {
  file: string;
  candidatos: number;
  uf: string;
  ano: number;
  error?: string;
}

export function ImportCSV() {
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress>({ phase: "", percent: 0 });
  const [currentFile, setCurrentFile] = useState("");
  const [fileIndex, setFileIndex] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [results, setResults] = useState<ImportResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setImporting(true);
    setResults([]);
    setTotalFiles(files.length);
    const importResults: ImportResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setFileIndex(i + 1);
      setCurrentFile(file.name);
      setProgress({ phase: "Iniciando...", percent: 0 });

      try {
        const result = await importarCSVEleitoral(file, setProgress);
        importResults.push({
          file: file.name,
          candidatos: result.candidatos,
          uf: result.uf,
          ano: result.ano,
        });
      } catch (err: any) {
        importResults.push({
          file: file.name,
          candidatos: 0,
          uf: "",
          ano: 0,
          error: err.message,
        });
      }
    }

    setResults(importResults);
    setImporting(false);

    const successCount = importResults.filter(r => !r.error).length;
    const errorCount = importResults.filter(r => r.error).length;

    toast({
      title: errorCount === 0 ? "Importação concluída!" : "Importação finalizada com erros",
      description: `${successCount} arquivo(s) importado(s)${errorCount > 0 ? `, ${errorCount} com erro` : ""}.`,
      variant: errorCount > 0 ? "destructive" : "default",
    });

    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Importar CSV do TSE (temporário)
              </span>
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Selecione os arquivos CSV de "Votação nominal por município e zona" baixados do{" "}
              <a
                href="https://dadosabertos.tse.jus.br/dataset/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline inline-flex items-center gap-1"
              >
                Portal de Dados Abertos do TSE <ExternalLink className="h-3 w-3" />
              </a>
              . Os arquivos são processados localmente no seu navegador.
            </p>

            <div>
              <input
                ref={inputRef}
                type="file"
                accept=".csv"
                multiple
                disabled={importing}
                onChange={handleImport}
                className="block w-full text-sm text-muted-foreground
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary/90
                  file:cursor-pointer
                  disabled:opacity-50"
              />
            </div>

            {importing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    Arquivo {fileIndex} de {totalFiles}: {currentFile}
                  </span>
                  <span className="text-muted-foreground">{progress.percent}%</span>
                </div>
                <Progress value={progress.percent} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {progress.phase}
                  {progress.detail && ` — ${progress.detail}`}
                </p>
              </div>
            )}

            {results.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Resultados:</p>
                {results.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {r.error ? (
                      <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    )}
                    <span className="truncate">
                      {r.error
                        ? `${r.file}: ${r.error}`
                        : `${r.file}: ${r.candidatos} candidatos (${r.uf} ${r.ano})`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
