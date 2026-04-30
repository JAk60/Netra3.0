# utils/sql_param_utils.py

import re


def expand_in_param(sql: str, arguments: dict, key: str):
    """
    Expands list param :key into (:key_0, :key_1, ...)

    Guarantees:
    - No substring collisions (:ship_id vs :ship_ids)
    - No silent partial replacement
    - Fails fast if param appears multiple times
    """
    values = arguments.pop(key, None)

    if not values:
        return sql, arguments

    if not isinstance(values, (list, tuple)):
        values = [values]

    pattern = rf":{re.escape(key)}\b"

    matches = list(re.finditer(pattern, sql))
    match_count = len(matches)

    if match_count == 0:
        return sql, arguments

    if match_count > 1:
        raise ValueError(
            f"expand_in_param: '{key}' appears {match_count} times in SQL template"
        )

    placeholders = []
    for i, v in enumerate(values):
        param_key = f"{key}_{i}"
        placeholders.append(f":{param_key}")
        arguments[param_key] = v

    placeholder_str = ", ".join(placeholders)

    sql = re.sub(pattern, placeholder_str, sql, count=1)

    return sql, arguments