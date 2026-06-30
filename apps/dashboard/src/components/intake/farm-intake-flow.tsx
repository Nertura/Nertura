'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, Loader2, MapPin, Sprout } from 'lucide-react';

import {
  type FarmIntakeParseResult,
  type FarmAreaUnit,
} from '@nertura/ai';
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@nertura/ui';

const EXAMPLE =
  "Osmaniye Toprakkale'de 10 dönüm buğday tarlam var, buğday sararıyor.";

const INTAKE_STORAGE_KEY = 'nertura_farm_intake';

export function FarmIntakeFlow({ farmId }: { farmId?: string | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromFieldsNew = searchParams.get('from') === 'fields-new';
  const [text, setText] = useState(searchParams.get('q') ?? '');
  const [parsed, setParsed] = useState<FarmIntakeParseResult | null>(null);
  const [editLocation, setEditLocation] = useState('');
  const [editCrop, setEditCrop] = useState('');
  const [editArea, setEditArea] = useState('');
  const [editAreaUnit, setEditAreaUnit] = useState<FarmAreaUnit>('donum');
  const [editSymptom, setEditSymptom] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const runParse = useCallback(async (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setConfirmed(false);
    try {
      const res = await fetch('/api/intake/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Analiz başarısız oldu.');
      const result = json.parsed as FarmIntakeParseResult;
      setParsed(result);
      setEditLocation(result.location.searchLabel ?? '');
      setEditCrop(result.cropLabel ?? result.crop ?? '');
      setEditArea(result.statedArea != null ? String(result.statedArea) : '');
      setEditAreaUnit(result.areaUnit ?? 'donum');
      setEditSymptom(result.symptom ?? result.problem ?? '');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analiz başarısız oldu.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q?.trim()) void runParse(q);
  }, [searchParams, runParse]);

  const buildConfirmedIntake = (): FarmIntakeParseResult | null => {
    if (!parsed) return null;
    return {
      ...parsed,
      location: {
        ...parsed.location,
        searchLabel: editLocation.trim() || parsed.location.searchLabel,
      },
      cropLabel: editCrop.trim() || parsed.cropLabel,
      statedArea: editArea ? Number(editArea.replace(',', '.')) : parsed.statedArea,
      areaUnit: editAreaUnit,
      symptom: editSymptom.trim() || parsed.symptom,
      problem: editSymptom.trim() || parsed.problem,
    };
  };

  const handleConfirm = () => {
    const intake = buildConfirmedIntake();
    if (!intake) return;
    if (!editLocation.trim()) {
      setError('Devam etmek için konum gerekli.');
      return;
    }
    setConfirmed(true);
    setError(null);
    try {
      sessionStorage.setItem(
        INTAKE_STORAGE_KEY,
        JSON.stringify({ ...intake, rawText: text.trim() || intake.rawText })
      );
    } catch {
      // optional
    }
  };

  const goToMap = () => {
    const intake = buildConfirmedIntake();
    if (!intake || !confirmed) return;

    const params = new URLSearchParams();
    params.set('intake', '1');
    if (editLocation.trim()) params.set('location', editLocation.trim());
    if (editCrop.trim()) params.set('crop', editCrop.trim());
    if (editArea) params.set('statedArea', editArea);
    params.set('areaUnit', editAreaUnit);
    if (editSymptom.trim()) params.set('symptom', editSymptom.trim());
    params.set('draw', '1');

    if (farmId) {
      router.push(`/farms/${farmId}/map?${params.toString()}`);
      return;
    }
    router.push(`/farms?intake=1&${params.toString()}`);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {fromFieldsNew && (
        <Alert>
          <AlertDescription>
            Tarla eklemek için harita üzerinden ilerleyelim. Sorununu anlat; seni doğru çiftlik
            haritasına yönlendireceğiz.
          </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tarla sorununu anlat</CardTitle>
          <p className="text-sm text-muted-foreground">
            Konum, ürün, alan ve belirtileri doğal dille yaz. Nertura senin için düzenler.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="intake-text">Tarlanda ne oluyor?</Label>
            <textarea
              id="intake-text"
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={EXAMPLE}
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-[15px] leading-relaxed ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="text-xs text-muted-foreground">
              Örnek: {EXAMPLE}
            </p>
          </div>
          <Button
            type="button"
            onClick={() => void runParse(text)}
            disabled={loading || !text.trim()}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            AI ile analiz et
          </Button>
        </CardContent>
      </Card>

      {parsed && (
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Çıkarılan bilgileri onayla</CardTitle>
            <p className="text-xs text-muted-foreground">
              Yanlış görünen bir şey varsa düzenle. Tarla adını haritada belirleyeceksin.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="edit-location" className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> Konum araması
                </Label>
                <Input
                  id="edit-location"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="İlçe, şehir, ülke"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-crop" className="flex items-center gap-1">
                  <Sprout className="h-3.5 w-3.5" /> Ürün
                </Label>
                <Input id="edit-crop" value={editCrop} onChange={(e) => setEditCrop(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-area">Belirtilen alan</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-area"
                    type="text"
                    inputMode="decimal"
                    value={editArea}
                    onChange={(e) => setEditArea(e.target.value)}
                    className="flex-1"
                  />
                  <select
                    value={editAreaUnit}
                    onChange={(e) => setEditAreaUnit(e.target.value as FarmAreaUnit)}
                    className="rounded-md border border-input bg-background px-2 text-sm"
                  >
                    <option value="donum">dönüm</option>
                    <option value="hectare">ha</option>
                    <option value="acre">acre</option>
                    <option value="m2">m²</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="edit-symptom">Belirti / sorun</Label>
                <Input
                  id="edit-symptom"
                  value={editSymptom}
                  onChange={(e) => setEditSymptom(e.target.value)}
                />
              </div>
            </div>

            {parsed.missingFields.length > 0 && (
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Eksik: {parsed.missingFields.join(', ')} — devam etmeden önce doldur.
              </p>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setParsed(null)}>
                Baştan başla
              </Button>
              <Button type="button" onClick={handleConfirm} disabled={!editLocation.trim()}>
                Bilgileri onayla
              </Button>
            </div>

            {confirmed && (
              <Alert>
                <AlertDescription className="space-y-3">
                  <p>
                    <strong>Sonraki adım:</strong> haritada tarlanı bul, sınırı çiz; ardından AI
                    Doktor bu tarla vakasıyla açılacak.
                  </p>
                  <Button type="button" onClick={goToMap}>
                    Haritada bul ve sınır çiz
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Tarlan zaten haritada mı?{' '}
        <Link href="/doctor" className="text-primary hover:underline">
          AI Doktor&apos;a git
        </Link>
      </p>
    </div>
  );
}

export { INTAKE_STORAGE_KEY };
