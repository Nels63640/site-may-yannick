#!/usr/bin/env python3
"""
Mise à jour automatique des plafonds de ressources MaPrimeRénov' (ANAH).
Tente de parser le tableau de l'ANAH, met à jour rates.json,
et écrit rates-status.json avec "ok" ou "error".
"""
import json
import re
import sys
import traceback
from datetime import date
from pathlib import Path

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Dépendances manquantes : pip install requests beautifulsoup4", file=sys.stderr)
    sys.exit(1)

ANAH_URL = (
    "https://www.anah.gouv.fr/proprietaires/vos-aides/les-conditions-de-ressources"
)
RATES_FILE = Path(__file__).parent / "rates.json"
STATUS_FILE = Path(__file__).parent / "rates-status.json"
TODAY = date.today().isoformat()

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "fr-FR,fr;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}


def write_status(status: str, message: str = None):
    obj = {"status": status, "checked": TODAY}
    if message:
        obj["message"] = message
    STATUS_FILE.write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[status] {status}" + (f" — {message}" if message else ""))


def clean_number(text: str):
    """Extrait un entier depuis '17 009 €', '17 009', '17009', etc."""
    digits = re.sub(r"[^\d]", "", str(text).strip())
    if not digits:
        return None
    n = int(digits)
    return n if 3_000 <= n <= 500_000 else None


def parse_z2_from_table(table) -> dict:
    """
    Parse un tableau HTML en cherchant les lignes correspondant aux foyers 1-5.
    Retourne {1:[v1,v2,v3,v4], 2:[...], ...} ou {} si rien trouvé.
    """
    parsed = {}
    for row in table.find_all("tr"):
        cells = [td.get_text(strip=True) for td in row.find_all(["td", "th"])]
        if len(cells) < 5:
            continue
        m = re.search(r"^(\d)", cells[0])
        if not m:
            continue
        n = int(m.group(1))
        if not (1 <= n <= 5):
            continue
        vals = [clean_number(c) for c in cells[1:5]]
        if all(v is not None for v in vals):
            # Sanity : valeurs croissantes (modeste < intermédiaire < supérieur)
            if vals[0] < vals[1] < vals[2]:
                parsed[n] = vals
    return parsed


def find_z2_thresholds(soup: BeautifulSoup) -> dict:
    """
    Parcourt toutes les tables HTML et retourne la première qui
    ressemble aux plafonds Province (Zone 2) pour 5 foyers.
    """
    for table in soup.find_all("table"):
        text = table.get_text().lower()
        # Exclure les tables uniquement IDF si une table Province existe
        if "île-de-france" in text and "province" not in text and "zone 2" not in text:
            continue
        parsed = parse_z2_from_table(table)
        if len(parsed) >= 5:
            return parsed
    return {}


def find_z2x_supplement(soup: BeautifulSoup, fallback: list) -> list:
    """
    Cherche la ligne 'par personne supplémentaire' (4 valeurs).
    """
    full_text = soup.get_text()
    for line in full_text.splitlines():
        low = line.lower()
        if "suppl" in low:
            parts = re.split(r"[\s  ]+", line.strip())
            nums = [clean_number(p) for p in parts]
            nums = [n for n in nums if n is not None]
            if len(nums) == 4:
                return nums
    return fallback


def main():
    try:
        print(f"[info] Récupération de {ANAH_URL}")
        resp = requests.get(ANAH_URL, headers=HEADERS, timeout=45)
        resp.raise_for_status()

        soup = BeautifulSoup(resp.text, "html.parser")

        # Vérification que la page n'est pas un shell JS vide
        page_text = soup.get_text(separator=" ", strip=True)
        if len(page_text) < 500:
            raise ValueError(
                "La page ANAH semble vide (rendu JavaScript côté client uniquement). "
                "Impossible d'extraire les données sans navigateur. "
                "Vérifiez manuellement sur anah.gouv.fr."
            )

        z2 = find_z2_thresholds(soup)

        if len(z2) < 5:
            raise ValueError(
                f"Tableau des plafonds de ressources introuvable sur la page ANAH "
                f"({len(z2)}/5 lignes parsées). "
                "La structure du site a probablement changé. "
                "Vérifiez manuellement sur anah.gouv.fr."
            )

        # Charger rates.json existant
        rates = json.loads(RATES_FILE.read_text(encoding="utf-8"))
        old_z2 = rates.get("z2", {})

        # Mettre à jour Zone 2 et la date
        rates["z2"] = {str(k): v for k, v in sorted(z2.items())}
        rates["updated"] = TODAY
        rates["year"] = str(date.today().year)

        # Supplément par personne supplémentaire (optionnel)
        z2x = find_z2x_supplement(soup, rates.get("z2x", []))
        if z2x and len(z2x) == 4:
            rates["z2x"] = z2x

        RATES_FILE.write_text(
            json.dumps(rates, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

        changed = any(
            rates["z2"].get(str(n)) != old_z2.get(str(n))
            for n in range(1, 6)
        )
        print(f"[ok] Plafonds Z2 {'mis à jour' if changed else 'inchangés'} : {z2}")
        write_status("ok")

    except requests.RequestException as exc:
        write_status(
            "error",
            f"Erreur réseau lors de la connexion à l'ANAH : {exc}",
        )
        sys.exit(1)

    except Exception as exc:
        write_status("error", str(exc))
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
