# ND deterministic engine

The ND runner keeps PDF bytes in memory and sends them to the deterministic Python engine through stdin. The engine uses PyMuPDF for spatial text/word coordinates and table detection, with regex-based extraction of values, ranges, standards and formulas. ND does not use Turso, Supabase, Web App bootstrap, GitHub Actions or impulse:vector during extraction.
