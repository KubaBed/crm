## Codzienny Research Leadów dla Workshift AI Consulting - wersja 4.0 (portfel sygnałów)

Mapa sygnałów i zasady: `wiki/playbooks/workshift-sygnaly-leadow.md` (przeczytaj sekcje 3-5 przed pracą).

Cel: Znaleźć 2-3 QUALIFIED leady MŚP w Polsce z TWARDYM sygnałem kupna. Jakość > ilość. Żadne Allegro.

### Krok 0: Przeczytaj listę dyskwalifikacji
PRZED szukaniem przeczytaj `wiki/clients/disqualified.md`. Te firmy NIGDY nie przechodzą.

### Krok 1: MŚP Gate (disqualify if ANY true)
Dla każdej znalezionej firmy sprawdź:
1. Czy jest na `wiki/clients/disqualified.md`? → DQ
2. Czy >250 pracowników (unijna definicja MŚP) LUB znana korporacja (Allegro, Amazon, Google, Orange, PKO BP, PZU, Orlen, etc.)? → DQ
3. Czy brak polskiej obecności / tylko global HQ? → DQ
4. Czy notowana na giełdzie (GPW, NewConnect)? → DQ
5. Czy brak twardego sygnału? → DQ

**Twarde sygnały** (MUSI być co najmniej jeden, z linkiem i datą; bez linku nie ma sygnału):
- **S2 Praca ręczna:** firma 20-250 os. spoza IT rekrutuje do powtarzalnej pracy biurowej (fakturowanie,
  wprowadzanie danych, rozliczenia, obsługa zamówień). JEDNA aktualna oferta wystarczy, jeśli stanowisko to wprost
  powtarzalna praca na dokumentach lub danych (nie: księgowość ekspercka, kadry/płace, dokumentacja techniczna
  inżynierska, archiwista w instytucji). `[ofert: 2+]` = siła 2. Instytucje publiczne, banki, spółki giełdowe = DQ.
- **S7 Rekrutacja AI (zawężona):** PIERWSZA lub juniorska rola AI/automatyzacji w firmie spoza IT, 20-150 os.
  Oferta z tagiem `[SENIOR: ryzyko budowy u siebie]` = DQ, chyba że firma nie ma działu IT ani zespołu danych
  (wtedy max score 3.5 i dopisek "ryzyko in-house").
- **RFP / przetarg** na AI lub automatyzację.
- **Dotacja / nabór:** beneficjent lub wnioskodawca programu cyfryzacji (FENG SMART, KPO, bony) w ostatnich 90 dniach.
- **Zmiana w zarządzie:** nowy COO / CFO / dyrektor operacyjny lub finansowy w ostatnich 90 dniach.
- Miękkie sygnały ("inwestujemy w technologię", ogólny post o AI) → NIE LICZĄ SIĘ.

### Krok 2: źródła są już pobrane
Na końcu tego promptu jest sekcja "## ŹRÓDŁA" z dwiema listami: **S7 Rekrutacja AI** (z tagiem seniority)
i **S2 Praca ręczna** (z liczbą ofert per firma). ZACZNIJ od niej, nie od wyszukiwarek. Najpierw S2, potem S7.
Firmy IT, software house'y, body leasing i agencje pracy pomijaj bez researchu.
Dla każdego kandydata:
1. `~/.hermes/scripts/site-brief.py <domena>`: treść strony + NIP (jeśli jest na stronie).
2. `~/.hermes/scripts/gus-lookup.py <NIP>`: forma prawna, PKD, data powstania, miasto. Bramka MŚP:
   sp. z o.o. / S.A. / JDG, PKD poza 62/63 (IT), firma starsza niż 2 lata, do 250 pracowników, brak na disqualified.md.
3. Decydenta szukaj na stronie (zarząd, "o nas") albo w treści oferty. Bez imienia i nazwiska = DQ.
4. Sprawdź, czy firma ma drugi, niezależny sygnał (np. S2 + nowy dyrektor). Dwa sygnały podnoszą siłę.
Przeglądarki używaj tylko do doprecyzowania (LinkedIn firmy, KRS), nie do szukania od zera.

### Krok 2b (zapasowo, gdy ŹRÓDŁA puste): Szukaj
Znajdź 5-10 firm w target branżach: kancelarie prawne, HR/rekrutacja, e-commerce, agencje marketingowe.
Rotacja branż - nie 4 dni z rzędu ta sama.

### Krok 3: Punktacja (playbook, sekcja 4)
Dla każdej firmy, która przeszła bramkę:
- **Timing (1-3):** 3 = sygnał < 30 dni, 2 = 30-90 dni, 1 = starszy.
- **Siła (1-3):** 1 = jeden sygnał, 2 = dwa niezależne, 3 = sygnał + ciepły kontakt (polecenie, zaangażowanie w treści Kuby).
- **Grupa:** A = timing + siła >= 5, B = 3-4, C = 2.

### Krok 4: Wybierz top 2-3
Tylko grupa A i B, A pierwsze. Jeśli nic nie jest w A ani B → zgłoś "Brak qualified leadów dzisiaj".
Decydent MUSI mieć imię i nazwisko + stanowisko. Bez tego → DQ (nawet jeśli firma pasuje).

### Krok 5: Format output
```
## Trafione (z twardym sygnałem)
1. **Firma** | Sektor | ~X pracowników
   - Decydent: Imię Nazwisko, Stanowisko
   - Sygnał: S2/S7/RFP/Dotacja/Zarząd: [konkret, link, data]
   - Dlaczego teraz: [1 zdanie, które może otworzyć wiadomość]
   - Grupa: A/B (timing X + siła Y)
   - Dlaczego MŚP: [1-2 zdania]

## Odrzucone (z powodem)
1. **Firma** | Powód: [MŚP gate / brak twardego sygnału / brak decydenta / na disqualified list]
```

### Krok 6: Zapisz stan
Dla każdego trafionego leada, dopisz do `wiki/clients/pipeline.md`:
- Data, firma, sygnał (S2/S7/...), grupa A/B, status: "proposed"

### Constraints
- Max 3 leady. Mniej = lepiej.
- NIGDY nie proponuj firm z disqualified.md
- NIGDY nie proponuj firm >250 osób bez wyraźnego "to jest wyjątek" od K
- NIGDY nie wysyłaj maili, LinkedIn, wiadomości - tylko raport do K
- Polish language for report
- Report max 20 linii (wliczając odrzucone)

Jeśli wszystkie firmy padają na gate → raport: "0 qualified leadów. Najczęstszy powód: [X]."


### Krok 6b: Zapisz trafione firmy w CRM (Comp AI CRM Workshift)
Dla KAZDEJ firmy z sekcji "Trafione" wykonaj w terminalu jedna komende (skill `crm`):
~/.hermes/scripts/crm addcompany "<Nazwa firmy>" <domena.pl> --industry "<sektor>" --zrodlo "Cron research" --sygnal "<Praca ręczna|Rekrutacja AI|RFP / przetarg|Dotacja / nabór|Zmiana w zarządzie>" --nip <NIP> --pkd <PKD> --note "<data>: <sygnal w 1 zdaniu + link>; dlaczego teraz: <1 zdanie>; decydent: <Imie Nazwisko, stanowisko>; grupa <A/B>"
Komenda sama sprawdza duplikaty (odpowie "istnieje: ..."), zaklada firme BEZ deala i dopisuje notatke. Nie tworz deali ani nie zmieniaj stage'ow. Firmy z sekcji "Odrzucone" NIE trafiaja do CRM. W raporcie dopisz linie: "CRM: dodano N firm (id: ...)".
