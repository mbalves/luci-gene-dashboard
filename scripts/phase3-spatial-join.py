#!/usr/bin/env python3
"""
Phase 3 - T3.1: Spatial Join Algorithm
Maps RSID text centroids from PDF to SVG colored gene boxes.

Pastel filter: fill_r >= 70, fill_g >= 70, fill_b >= 70 (all channels ≥ 70%)
Size filter: area > 200 sq pt AND width > 10pt AND height > 10pt
Tolerance: ±10pt containment; nearest-neighbor fallback if no box found.
"""

import json
import math
import sys

ROOT = '/Users/marcelo/dev/luci-gene-dashboard'

# ── Load inputs ───────────────────────────────────────────────────────────────
with open(f'{ROOT}/rsids-extracted.json') as f:
    rsids_data = json.load(f)

with open(f'{ROOT}/svg-colored-boxes.json') as f:
    boxes_data = json.load(f)

occurrences = rsids_data['occurrences']   # list of {rsid, center_x, center_y, bbox, page, ...}
all_boxes   = boxes_data['boxes']          # list of box dicts

print(f"RSIDs occurrences: {len(occurrences)}")
print(f"SVG boxes total: {len(all_boxes)}")

# ── Pastel + size filter ──────────────────────────────────────────────────────
def is_pastel(box):
    return box['fill_r'] >= 70.0 and box['fill_g'] >= 70.0 and box['fill_b'] >= 70.0

def is_gene_box(box):
    return (
        is_pastel(box) and
        box['area'] > 200 and
        box['width'] > 10 and
        box['height'] > 10
    )

gene_boxes = [b for b in all_boxes if is_gene_box(b)]
print(f"Gene boxes after pastel+size filter: {len(gene_boxes)}")

# ── Build unique RSID list from occurrences ───────────────────────────────────
# Each occurrence is a separate PDF text instance; track all locations per rsid
from collections import defaultdict
rsid_locations = defaultdict(list)
for occ in occurrences:
    rsid_locations[occ['rsid']].append({
        'center_x': occ['center_x'],
        'center_y': occ['center_y'],
        'page':     occ['page'],
        'bbox':     occ['bbox'],
    })

print(f"Unique RSIDs: {len(rsid_locations)}")

# ── Coordinate systems ────────────────────────────────────────────────────────
# PDF page dimensions from occurrences
sample_page_width  = occurrences[0]['page_width']   # 780.0
sample_page_height = occurrences[0]['page_height']  # 540.0

# SVG box coordinates: x1/y1/x2/y2 from svg-colored-boxes.json
# These come from the same PDF→SVG extraction pass, so should share coordinate
# space (confirmed 93.6% alignment in T1.2a).

def box_centroid(box):
    return ((box['x1'] + box['x2']) / 2, (box['y1'] + box['y2']) / 2)

def distance(cx, cy, bx, by):
    return math.sqrt((cx - bx) ** 2 + (cy - by) ** 2)

def point_in_box_with_tolerance(px, py, box, tol=10.0):
    return (
        box['x1'] - tol <= px <= box['x2'] + tol and
        box['y1'] - tol <= py <= box['y2'] + tol
    )

TOLERANCE = 10.0  # points
AMBIGUITY_THRESHOLD = 3.0  # if 2nd-closest within 3pt of closest → ambiguous

# ── Spatial Join ──────────────────────────────────────────────────────────────
results = []        # one entry per (rsid, location_index)
box_usage = defaultdict(list)   # box_path_index → list of rsids mapped to it

for rsid, locations in sorted(rsid_locations.items()):
    for loc_idx, loc in enumerate(locations):
        cx, cy = loc['center_x'], loc['center_y']

        # Step 1: find all boxes containing (cx, cy) ± tolerance
        containing = []
        for box in gene_boxes:
            if point_in_box_with_tolerance(cx, cy, box, TOLERANCE):
                bc_x, bc_y = box_centroid(box)
                dist = distance(cx, cy, bc_x, bc_y)
                containing.append((dist, box))

        flags = []
        matched_boxes = []

        if containing:
            containing.sort(key=lambda t: t[0])
            best_dist, best_box = containing[0]

            # Check ambiguity: if 2nd match within 3pt of best
            if len(containing) >= 2:
                second_dist = containing[1][0]
                if second_dist - best_dist <= AMBIGUITY_THRESHOLD:
                    flags.append('ambiguous')
                    matched_boxes = [b for _, b in containing[:2]]
                else:
                    matched_boxes = [best_box]
            else:
                matched_boxes = [best_box]

            confidence = 'high' if not flags else 'ambiguous'
            nearest_dist = best_dist
        else:
            # Nearest-neighbor fallback
            all_dists = []
            for box in gene_boxes:
                bc_x, bc_y = box_centroid(box)
                dist = distance(cx, cy, bc_x, bc_y)
                all_dists.append((dist, box))
            all_dists.sort(key=lambda t: t[0])
            nearest_dist, nearest_box = all_dists[0]
            matched_boxes = [nearest_box]
            flags.append('out-of-tolerance')
            confidence = 'low'

        entry = {
            'rsid':          rsid,
            'location_index': loc_idx,
            'pdf_x':         cx,
            'pdf_y':         cy,
            'page':          loc['page'],
            'matched_boxes': [
                {
                    'path_index': b['path_index'],
                    'element_id': b['element_id'],
                    'box_centroid_x': box_centroid(b)[0],
                    'box_centroid_y': box_centroid(b)[1],
                    'x1': b['x1'], 'y1': b['y1'],
                    'x2': b['x2'], 'y2': b['y2'],
                    'width': b['width'], 'height': b['height'],
                    'fill_r': b['fill_r'], 'fill_g': b['fill_g'], 'fill_b': b['fill_b'],
                }
                for b in matched_boxes
            ],
            'nearest_distance_pt': round(nearest_dist, 3),
            'confidence':    confidence,
            'flags':         flags,
        }
        results.append(entry)

        for b in matched_boxes:
            box_usage[b['path_index']].append(rsid)

# ── Summary stats ─────────────────────────────────────────────────────────────
total         = len(results)
matched       = sum(1 for r in results if r['confidence'] in ('high', 'ambiguous'))
out_of_tol    = sum(1 for r in results if 'out-of-tolerance' in r['flags'])
ambiguous     = sum(1 for r in results if 'ambiguous' in r['flags'])
boxes_matched = len(set(
    b['path_index']
    for r in results
    for b in r['matched_boxes']
))

print(f"\nSpatial join complete:")
print(f"  Total occurrences processed: {total}")
print(f"  Matched (high+ambiguous):    {matched}")
print(f"  Out-of-tolerance (low):      {out_of_tol}")
print(f"  Ambiguous:                   {ambiguous}")
print(f"  Unique boxes matched:        {boxes_matched}")
print(f"  Match rate: {matched/total*100:.1f}%")

if matched < 200:
    print("WARN: coverage below expected (< 200 matches)", file=sys.stderr)
if out_of_tol > 50:
    print(f"WARN: high unmatched rate — {out_of_tol} out-of-tolerance", file=sys.stderr)

# ── Write rsid_to_box_mapping.json ────────────────────────────────────────────
output = {
    'total_occurrences': total,
    'unique_rsids': len(rsid_locations),
    'matched_count': matched,
    'out_of_tolerance_count': out_of_tol,
    'ambiguous_count': ambiguous,
    'gene_boxes_total': len(gene_boxes),
    'gene_boxes_matched': boxes_matched,
    'match_rate_percent': round(matched / total * 100, 2),
    'pastel_filter': 'fill_r >= 70 AND fill_g >= 70 AND fill_b >= 70',
    'size_filter': 'area > 200 AND width > 10 AND height > 10',
    'tolerance_pt': TOLERANCE,
    'mappings': results,
}

out_path = f'{ROOT}/rsid_to_box_mapping.json'
with open(out_path, 'w') as f:
    json.dump(output, f, indent=2)
print(f"\nWrote: {out_path}")
