#!/usr/bin/env python3
"""gus-lookup.py <NIP|REGON|KRS> [--json]

Dane firmy z rejestru REGON (GUS BIR 1.1): nazwa, forma prawna, PKD, adres, data rejestracji.
Klucz: GUS_BIR_KEY w ~/.hermes/.env (produkcyjny, mail do regon_bir@stat.gov.pl). Bez klucza
używa klucza testowego GUS (sandbox, dane częściowo zanonimizowane).
Używane przez cron workshift-lead-research jako bramka MŚP i przez `crm addcompany --nip/--pkd`.
"""
import json
import os
import re
import sys

from gusregon import GUS

ENV = os.path.expanduser("~/.hermes/.env")
TEST_KEY = "abcde12345abcde12345"

KIND = {"F": "osoba fizyczna (JDG)", "P": "osoba prawna", "LP": "jedn. lokalna os. prawnej", "LF": "jedn. lokalna os. fizycznej"}


def api_key():
    key = os.environ.get("GUS_BIR_KEY")
    if not key and os.path.exists(ENV):
        for line in open(ENV, encoding="utf-8"):
            m = re.match(r"^GUS_BIR_KEY=\"?([^\"\n]+)\"?$", line.strip())
            if m:
                key = m.group(1)
    return key


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        print(__doc__)
        sys.exit(2)
    ident = re.sub(r"\D", "", args[0])
    key = api_key()
    gus = GUS(api_key=key, sandbox=False) if key else GUS(api_key=TEST_KEY, sandbox=True)
    kw = {"nip": ident} if len(ident) == 10 else ({"regon": ident} if len(ident) in (9, 14) else {"krs": ident})
    data = gus.search(**kw)
    if not data:
        print(json.dumps({"found": False, **kw}, ensure_ascii=False))
        sys.exit(1)
    pkd = []
    try:
        pkd = gus.get_pkd(**kw) or []
    except Exception:  # noqa: BLE001
        pkd = []
    main_pkd = next((p for p in pkd if p.get("main")), pkd[0] if pkd else {})
    out = {
        "found": True,
        "sandbox": key is None,
        "nazwa": data.get("nazwa") or data.get("nazwaskrocona"),
        "forma_prawna": data.get("szczegolnaformaprawna_nazwa") or data.get("podstawowaformaprawna_nazwa"),
        "nip": data.get("nip"),
        "regon": data.get("regon") or data.get("regon14"),
        "krs": data.get("numerwrejestrzeewidencji"),
        "pkd_glowne": main_pkd.get("code"),
        "pkd_nazwa": main_pkd.get("name"),
        "pkd_liczba": len(pkd) or None,
        "data_powstania": data.get("datapowstania") or data.get("datarozpoczeciadzialalnosci"),
        "data_zakonczenia": data.get("datazakonczeniadzialalnosci") or None,
        "miejscowosc": data.get("adsiedzmiejscowosc_nazwa"),
        "wojewodztwo": data.get("adsiedzwojewodztwo_nazwa"),
        "www": data.get("adresstronyinternetowej") or data.get("adresemail"),
        "telefon": data.get("numertelefonu"),
    }
    if "--json" in sys.argv:
        print(json.dumps(out, ensure_ascii=False))
    else:
        for k, v in out.items():
            if v not in (None, ""):
                print(f"{k}: {v}")
    if "--raw" in sys.argv:
        print(json.dumps(data, ensure_ascii=False, indent=1)[:3000], file=sys.stderr)


if __name__ == "__main__":
    main()
