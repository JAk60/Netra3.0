"""
nlpLayer/aliases.py
-------------------
Manually seeded alias dictionaries. Client-editable — add new aliases here
when new equipment is commissioned. No logic, no imports.

All keys are normalised (lowercase, no spaces/hyphens/underscores).
Values are the canonical DB form.

entity_linker.py loads these at startup for Tier 1 resolution.
"""

# Component type aliases — raw mention → canonical component_name
COMPONENT_TYPE_ALIASES: dict[str, str] = {
    "gasturbine":       "Gas Turbine",
    "gt":               "Gas Turbine",
    "gts":              "Gas Turbine",
    "turbine":          "Gas Turbine",
    "mainturbine":      "Gas Turbine",

    "generator":        "Generators",
    "gtg":              "Generators",
    "gtgs":             "Generators",       # FIX-ALL-SENTINEL: "all gtgs" → normalises to "gtgs"
    "gen":              "Generators",
    "generators":       "Generators",

    "airconditioner":   "Air Conditioner",
    "ac":               "Air Conditioner",
    "acs":              "Air Conditioner",
    "aircon":           "Air Conditioner",
    "hvac":             "Air Conditioner",
    "cooling":          "Air Conditioner",

    # Add new types below as equipment is commissioned
}

# Nomenclature (instance) aliases — raw mention → canonical nomenclature
NOMENCLATURE_ALIASES: dict[str, str] = {
    # Gas Turbines
    "gt1":  "GT 1",
    "gt2":  "GT 2",
    "gt3":  "GT 3",
    "gt4":  "GT 4",

    # Generators
    "gtg1": "GTG 1",
    "gtg2": "GTG 2",
    "gtg3": "GTG 3",
    "gtg4": "GTG 4",

    # Air Conditioners
    "ac1":  "AC 1",
    "ac2":  "AC 2",
    "ac3":  "AC 3",
    "ac4":  "AC 4",
    "ac5":  "AC 5",
    "ac6":  "AC 6",

    # Assemblies (pumps etc.)
    "p1":   "p1",
    "p2":   "p2",

    # Add new instances below as equipment is commissioned
}

# Ship aliases — raw mention → canonical ship_name
SHIP_ALIASES: dict[str, str] = {
    "insone":    "INS ONE",
    "ins1":      "INS ONE",
    "shipone":   "INS ONE",
    "vessel1":   "INS ONE",

    "instwo":    "INS TWO",
    "ins2":      "INS TWO",
    "shiptwo":   "INS TWO",
    "vessel2":   "INS TWO",

    "insthree":  "INS THREE",
    "ins3":      "INS THREE",

    # Add new ships below as they are commissioned
}

# Sensor aliases — raw mention → canonical sensor_name
SENSOR_ALIASES: dict[str, str] = {
    # GTG sensors
    "gtgs1":  "GTG_S1",
    "gtgs2":  "GTG_S2",
    "gtgs3":  "GTG_S3",
    "gtgs4":  "GTG_S4",

    # AC sensors
    "acs1":   "AC_S1",
    "acs2":   "AC_S2",
    "acs3":   "AC_S3",
    "acs4":   "AC_S4",
    "acs5":   "AC_S5",
    "acs6":   "AC_S6",

    # GT sensors
    "gts1":   "GT_S1",
    "gts2":   "GT_S2",
    "gts3":   "GT_S3",

    # Add new sensors below as they are installed
}