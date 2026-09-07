## Codzienny Research Leadów dla Workshift AI Consulting — wersja 3.0 (MŚP Gate + Disqualified List)

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

**Twarde sygnały** (MUSI być co najmniej jeden):
- 1+ oferta pracy AI/automatyzacja/data w firmie SPOZA IT w ostatnich 60 dniach (z sekcji ŹRÓDŁA lub własna)
- Publiczna wypowiedź CEO/CTO o AI/automatyzacji
- Zamknięta runda finansowania >5M PLN
- Opublikowany RFP / przetarg na AI/automatyzację
- Wdrożony stack AI widoczny (chatbot, agent, integracja)
- Miękkie sygnały ("inwestujemy w technologię") → NIE LICZĄ SIĘ

### Krok 2 (NOWE od 2026-09-07): źródła są już pobrane
Na końcu tego promptu jest sekcja "## ŹRÓDŁA" ze świeżymi ofertami pracy AI/automatyzacja z Pracuj,
JustJoin i NoFluffJobs (pobrane przez CloakBrowser, Cloudflare nie blokuje). ZACZNIJ od niej, nie od
wyszukiwarek. Interesują Cię firmy SPOZA IT (produkcja, handel, farmacja, finanse, usługi, kancelarie,
biura rachunkowe), które rekrutują do AI/automatyzacji: to jest twardy sygnał (1 oferta wystarczy: budują kompetencję). Firmy IT, software house'y i body leasing pomijaj bez researchu.
Dla każdego kandydata:
1. `~/.hermes/scripts/site-brief.py <domena>`: treść strony + NIP (jeśli jest na stronie).
2. `~/.hermes/scripts/gus-lookup.py <NIP>`: forma prawna, PKD, data powstania, miasto. Bramka MŚP:
   sp. z o.o. / S.A. / JDG, PKD poza 62/63 (IT), firma starsza niż 2 lata, do 250 pracowników, brak na disqualified.md.
3. Decydenta szukaj na stronie (zarząd, "o nas") albo w treści oferty. Bez imienia i nazwiska = DQ.
Przeglądarki używaj tylko do doprecyzowania (LinkedIn firmy, KRS), nie do szukania od zera.

### Krok 2b (zapasowo, gdy ŹRÓDŁA puste): Szukaj
Znajdź 5-10 firm w target branżach: kancelarie prawne, HR/rekrutacja, e-commerce, agencje marketingowe.
Rotacja branż — nie 4 dni z rzędu ta sama.

### Krok 3: Score pozostałych
Dla każdej firmy która przeszła gate, oceń 1-5:
- Pain signal strength (czy widać ból w ofertach pracy / postach?)
- AI fit (czy Workshift może realnie pomóc?)
- Accessibility (czy można dotrzeć do decydenta?)

### Krok 4: Wybierz top 2-3
Średnia ≥3.5. Jeśli żaden nie ma ≥3.5 → zgłoś "Brak qualified leadów dzisiaj".
Decydent MUSI mieć imię i nazwisko + stanowisko. Bez tego → DQ (nawet jeśli firma pasuje).

### Krok 5: Format output
```
## Trafione (z twardym sygnałem)
1. **Firma** | Sektor | ~X pracowników
   - Decydent: Imię Nazwisko, Stanowisko
   - Twardy sygnał: [konkret — cytat, link, liczba]
   - Score: X/5
   - Dlaczego MŚP: [1-2 zdania]

## Odrzucone (z powodem)
1. **Firma** | Powód: [MŚP gate / brak twardego sygnału / brak decydenta / na disqualified list]
```

### Krok 6: Zapisz stan
Dla każdego trafionego leada, dopisz do `wiki/clients/pipeline.md`:
- Data, firma, sygnał, score, status: "proposed"

### Constraints
- Max 3 leady. Mniej = lepiej.
- NIGDY nie proponuj firm z disqualified.md
- NIGDY nie proponuj firm >250 osób bez wyraźnego "to jest wyjątek" od K
- NIGDY nie wysyłaj maili, LinkedIn, wiadomości — tylko raport do K
- Polish language for report
- Report max 20 linii (wliczając odrzucone)

Jeśli wszystkie firmy padają na gate → raport: "0 qualified leadów. Najczęstszy powód: [X]."


### Krok 6b: Zapisz trafione firmy w CRM (Comp AI CRM Workshift)
Dla KAZDEJ firmy z sekcji "Trafione" wykonaj w terminalu jedna komende (skill `crm`):
~/.hermes/scripts/crm addcompany "<Nazwa firmy>" <domena.pl> --industry "<sektor>" --zrodlo "Cron research" --nip <NIP> --pkd <PKD> --note "<data>: <twardy sygnal w 1 zdaniu>; decydent: <Imie Nazwisko, stanowisko>; score <X>/5"
Komenda sama sprawdza duplikaty (odpowie "istnieje: ..."), zaklada firme BEZ deala i dopisuje notatke. Nie tworz deali ani nie zmieniaj stage'ow. Firmy z sekcji "Odrzucone" NIE trafiaja do CRM. W raporcie dopisz linie: "CRM: dodano N firm (id: ...)".
