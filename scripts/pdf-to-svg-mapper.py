#!/usr/bin/env python3
"""
pdf-to-svg-mapper.py — PDF RSID extraction + SVG colored box detection.

Phase 1 (P1): Extract RSIDs with coordinates from PDF using PyMuPDF.
Phase 2 (P2): Parse SVG and detect colored gene boxes.
Phase 3 (P3): Spatial join + risk allele cross-ref + output generation. (downstream)

Usage:
    python3 scripts/pdf-to-svg-mapper.py [options]

Options:
    --pdf PATH          Source PDF (default: EUREDCBX3185_Metabolic_Pathways.pdf)
    --svg PATH          Source SVG (default: public/assets/images/metabolic-pathways-colored-v2.svg)
    --panel PATH        panel.js path (default: src/data/panel.js)
    --pathway-map PATH  Current pathwayMap.js (default: src/data/pathwayMap.js)
    --out-dir PATH      Output directory for intermediate files (default: .)
    --extract-only      Run only PDF extraction (T1.2 + T1.3), print summary, exit
    --boxes-only        Run only SVG box detection (T2.1 + T2.2), print summary, exit
    --validate-only     Run extraction + box detection + coordinate alignment (T1.2a), exit
    --help              Show this help

Outputs (intermediate, generated in --out-dir):
    rsids-extracted.json              All extracted RSIDs with coordinates
    coordinate-alignment-validation.json  T1.2a alignment summary
    svg-colored-boxes.json            All colored path bounding boxes
    color-palette-histogram.json      T2.2a color palette analysis
"""

import argparse
import json
import math
import os
import re
import sys
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict


# ─── Constants ────────────────────────────────────────────────────────────────

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DEFAULT_PDF = os.path.join(PROJECT_ROOT, "EUREDCBX3185_Metabolic_Pathways.pdf")
DEFAULT_SVG = os.path.join(PROJECT_ROOT, "public/assets/images/metabolic-pathways-colored-v2.svg")
DEFAULT_PANEL = os.path.join(PROJECT_ROOT, "src/data/panel.js")
DEFAULT_PATHWAY_MAP = os.path.join(PROJECT_ROOT, "src/data/pathwayMap.js")

KNOWN_RSIDS = [
    "rs1801133", "rs1801131", "rs1805087", "rs1801394", "rs234706",
    "rs4680",    "rs6323",    "rs6265",    "rs429358",  "rs9939609",
    "rs662",     "rs1800629", "rs1800795", "rs4880",    "rs2228570",
]

RSID_RE = re.compile(r'\brs\d+\b', re.IGNORECASE)

# RGB percentage fill pattern: rgb(X%, Y%, Z%) or rgb(X.xx%, Y.yy%, Z.zz%)
RGB_PCT_RE = re.compile(
    r'rgb\(\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%\s*\)',
    re.IGNORECASE
)

# Coordinate numbers extractor for SVG path d attribute
COORD_RE = re.compile(r'[-+]?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?')

SVG_NS = "http://www.w3.org/2000/svg"

# Color filtering thresholds
MIN_BOX_AREA = 25.0       # sq pt — filter tiny decorative elements
MIN_BOX_DIMENSION = 5.0   # pt — filter arrows/lines (width AND height must exceed this)

# Structural colors to skip (all channels within this tolerance of 0% or 100%)
STRUCTURAL_TOLERANCE = 2.0  # %


# ─── Argparse ─────────────────────────────────────────────────────────────────

def build_parser():
    parser = argparse.ArgumentParser(
        description="PDF RSID extraction + SVG colored box detection for pathway map automation.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("--pdf", default=DEFAULT_PDF, help="Source PDF path")
    parser.add_argument("--svg", default=DEFAULT_SVG, help="Source SVG path")
    parser.add_argument("--panel", default=DEFAULT_PANEL, help="panel.js path")
    parser.add_argument("--pathway-map", default=DEFAULT_PATHWAY_MAP, help="pathwayMap.js path")
    parser.add_argument("--out-dir", default=PROJECT_ROOT, help="Output directory for intermediate files")
    parser.add_argument("--extract-only", action="store_true", help="Run only PDF extraction, then exit")
    parser.add_argument("--boxes-only", action="store_true", help="Run only SVG box detection, then exit")
    parser.add_argument("--validate-only", action="store_true", help="Run extraction + SVG + coordinate alignment, then exit")
    return parser


# ─── T1.2: PDF RSID Extraction ────────────────────────────────────────────────

def extract_rsids_from_pdf(pdf_path):
    """
    Extract all RSID text occurrences from the PDF with their bounding box coordinates.

    Returns a list of dicts:
        {rsid, center_x, center_y, bbox: [x1, y1, x2, y2], page}

    Coordinates are in PDF point space (origin top-left for each page).
    For a 780x540pt PDF, coords are already in the SVG viewBox coordinate space.
    """
    try:
        import fitz  # PyMuPDF
    except ImportError:
        print("ERROR: PyMuPDF not installed. Run: pip install PyMuPDF", file=sys.stderr)
        sys.exit(1)

    if not os.path.exists(pdf_path):
        print(f"ERROR: PDF not found: {pdf_path}", file=sys.stderr)
        sys.exit(1)

    doc = fitz.open(pdf_path)
    occurrences = []

    for page_num in range(len(doc)):
        page = doc[page_num]
        page_rect = page.rect  # fitz.Rect(x0, y0, x1, y1)
        page_width = page_rect.width
        page_height = page_rect.height

        # Extract text with detailed block/word info
        words = page.get_text("words")  # list of (x0, y0, x1, y1, "word", block_no, line_no, word_no)

        for word_tuple in words:
            x0, y0, x1, y1, text, *_ = word_tuple
            # Find all RSIDs within the word text
            for match in RSID_RE.finditer(text):
                rsid = match.group(0).lower()
                center_x = (x0 + x1) / 2.0
                center_y = (y0 + y1) / 2.0

                occurrences.append({
                    "rsid": rsid,
                    "center_x": round(center_x, 3),
                    "center_y": round(center_y, 3),
                    "bbox": [round(x0, 3), round(y0, 3), round(x1, 3), round(y1, 3)],
                    "page": page_num,
                    "page_width": round(page_width, 3),
                    "page_height": round(page_height, 3),
                })

    doc.close()
    return occurrences


def summarize_rsid_extraction(occurrences):
    """Print a summary of extracted RSIDs to stdout."""
    unique_rsids = set(o["rsid"] for o in occurrences)
    rsid_counts = Counter(o["rsid"] for o in occurrences)
    duplicates = {rsid: cnt for rsid, cnt in rsid_counts.items() if cnt > 1}

    print(f"\n=== T1.2: PDF RSID Extraction Summary ===")
    print(f"  Total occurrences  : {len(occurrences)}")
    print(f"  Unique RSIDs       : {len(unique_rsids)}")
    print(f"  RSIDs at 2+ positions: {len(duplicates)}")

    if occurrences:
        page_rect_sample = occurrences[0]
        print(f"  Page dimensions    : {page_rect_sample['page_width']} x {page_rect_sample['page_height']} pt")

    return unique_rsids, rsid_counts, duplicates


# ─── T1.3: Regression Check ───────────────────────────────────────────────────

def regression_check(occurrences, known_rsids=KNOWN_RSIDS):
    """
    Verify all known RSIDs from current pathwayMap.js appear in the extracted set.
    Returns (passed: bool, missing: list)
    """
    extracted_set = set(o["rsid"].lower() for o in occurrences)
    missing = [rsid for rsid in known_rsids if rsid.lower() not in extracted_set]

    print(f"\n=== T1.3: Regression Check ===")
    if not missing:
        print(f"  PASS — All {len(known_rsids)}/15 known RSIDs found in PDF extraction")
    else:
        print(f"  FAIL — Missing {len(missing)}/15 RSIDs: {missing}")

    return len(missing) == 0, missing


# ─── T2.1: SVG Parsing ────────────────────────────────────────────────────────

def parse_svg(svg_path):
    """
    Parse the SVG file and return the ElementTree root.
    Handles the large 6.8MB file; strips namespace prefixes for simpler xpath.
    Returns (tree, root, ns_map)
    """
    if not os.path.exists(svg_path):
        print(f"ERROR: SVG not found: {svg_path}", file=sys.stderr)
        sys.exit(1)

    print(f"\n=== T2.1: SVG Parsing ===")
    print(f"  Loading: {svg_path}")

    # Strip namespace from tags for easier iteration
    # ElementTree includes namespace in tag names: {http://...}path
    try:
        tree = ET.parse(svg_path)
        root = tree.getroot()
    except ET.ParseError as e:
        print(f"ERROR: SVG XML parsing failed: {e}", file=sys.stderr)
        sys.exit(1)

    # Collect namespace map
    ns_map = {}
    for event, elem in ET.iterparse(svg_path, events=["start-ns"]):
        prefix, uri = elem
        ns_map[prefix] = uri

    # Find the defs element to know what to skip
    defs_elem = root.find(f"{{{SVG_NS}}}defs") if f"{{{SVG_NS}}}defs" else None
    if defs_elem is None:
        # Try without namespace
        defs_elem = root.find("defs")

    print(f"  SVG viewBox: {root.get('viewBox', 'missing')}")
    print(f"  SVG width  : {root.get('width', '?')}, height: {root.get('height', '?')}")

    # Count total path elements inside defs vs outside
    all_paths = list(root.iter(f"{{{SVG_NS}}}path")) or list(root.iter("path"))
    print(f"  Total <path> elements: {len(all_paths)}")

    return tree, root, ns_map


def get_defs_ids(root):
    """
    Collect the set of element IDs that are inside <defs> (to skip during detection).
    Returns a set of element IDs that are inside defs.
    Also returns the defs element itself.
    """
    defs_ids = set()
    defs_elements = set()  # id() of element objects inside defs

    # Try with namespace first, then without
    defs_elem = root.find(f"{{{SVG_NS}}}defs")
    if defs_elem is None:
        defs_elem = root.find("defs")

    if defs_elem is not None:
        for elem in defs_elem.iter():
            elem_id = elem.get("id")
            if elem_id:
                defs_ids.add(elem_id)
            defs_elements.add(id(elem))

    return defs_ids, defs_elements, defs_elem


# ─── T2.2: Colored Path Detection ─────────────────────────────────────────────

def is_structural_color(r_pct, g_pct, b_pct, tolerance=STRUCTURAL_TOLERANCE):
    """
    Return True if the color is white, black, or near-gray (structural element).
    White:  all channels >= (100 - tolerance)%
    Black:  all channels <= tolerance%
    Gray:   all channels within tolerance% of each other AND mid-range
    """
    # White
    if r_pct >= (100 - tolerance) and g_pct >= (100 - tolerance) and b_pct >= (100 - tolerance):
        return True
    # Black
    if r_pct <= tolerance and g_pct <= tolerance and b_pct <= tolerance:
        return True
    # Near-gray: max deviation between channels < 5%, and all in 10-90% range
    channels = [r_pct, g_pct, b_pct]
    if max(channels) - min(channels) < 5.0 and all(10 <= c <= 90 for c in channels):
        return True
    return False


def extract_path_bbox(d_attr):
    """
    Extract bounding box from SVG path d attribute.
    Parses all numeric coordinate values (M, L, C, Q, Z commands).
    Uses min/max of all coordinate values — slight overestimate for Bezier
    curves but acceptable for 10pt spatial join tolerance.

    Returns (x1, y1, x2, y2) or None if < 2 points found.
    """
    if not d_attr:
        return None

    nums = [float(n) for n in COORD_RE.findall(d_attr)]

    if len(nums) < 4:
        return None

    # SVG path alternates X and Y coordinates in pairs
    # For commands: M x y, L x y, C x1 y1 x2 y2 x y, Q x1 y1 x y
    # We extract all numbers and split into x/y by even/odd index
    xs = nums[0::2]
    ys = nums[1::2]

    if not xs or not ys:
        return None

    return (min(xs), min(ys), max(xs), max(ys))


def detect_colored_boxes(root, defs_elements):
    """
    Detect colored <path> elements outside <defs> with non-structural RGB% fills.
    Applies size filtering: area > MIN_BOX_AREA and both dimensions > MIN_BOX_DIMENSION.

    Returns list of dicts:
        {path_index, x1, y1, x2, y2, centroid_x, centroid_y,
         fill_r, fill_g, fill_b, fill_color, width, height, area}
    """
    colored_boxes = []
    path_index = 0
    skipped_defs = 0
    skipped_no_fill = 0
    skipped_structural = 0
    skipped_no_d = 0
    skipped_too_small = 0
    total_paths_outside_defs = 0

    # Walk the entire tree; skip elements that are inside defs
    # We'll iterate the root's direct children to separate defs from geometry
    for child in root:
        tag = child.tag.split("}")[-1] if "}" in child.tag else child.tag

        # Skip the entire defs block
        if tag == "defs":
            continue

        # Recurse into non-defs children
        for elem in _iter_paths_recursive(child):
            elem_tag = elem.tag.split("}")[-1] if "}" in elem.tag else elem.tag
            if elem_tag != "path":
                continue

            total_paths_outside_defs += 1
            path_index += 1

            # Check fill attribute
            fill = elem.get("fill", "")
            if not fill:
                skipped_no_fill += 1
                continue

            # Parse RGB percentage fill
            rgb_match = RGB_PCT_RE.match(fill.strip())
            if not rgb_match:
                skipped_no_fill += 1
                continue

            r_pct = float(rgb_match.group(1))
            g_pct = float(rgb_match.group(2))
            b_pct = float(rgb_match.group(3))

            # Skip structural colors (white, black, gray)
            if is_structural_color(r_pct, g_pct, b_pct):
                skipped_structural += 1
                continue

            # Extract bounding box from path data
            d_attr = elem.get("d", "")
            if not d_attr:
                skipped_no_d += 1
                continue

            bbox = extract_path_bbox(d_attr)
            if bbox is None:
                skipped_no_d += 1
                continue

            x1, y1, x2, y2 = bbox
            width = x2 - x1
            height = y2 - y1
            area = width * height

            # Filter too-small elements (arrows, thin lines, decorative dots)
            if area < MIN_BOX_AREA or width < MIN_BOX_DIMENSION or height < MIN_BOX_DIMENSION:
                skipped_too_small += 1
                continue

            centroid_x = (x1 + x2) / 2.0
            centroid_y = (y1 + y2) / 2.0

            colored_boxes.append({
                "path_index": path_index,
                "element_id": elem.get("id", ""),
                "x1": round(x1, 3),
                "y1": round(y1, 3),
                "x2": round(x2, 3),
                "y2": round(y2, 3),
                "centroid_x": round(centroid_x, 3),
                "centroid_y": round(centroid_y, 3),
                "fill_r": round(r_pct, 3),
                "fill_g": round(g_pct, 3),
                "fill_b": round(b_pct, 3),
                "fill_color": f"rgb({r_pct:.3f}%, {g_pct:.3f}%, {b_pct:.3f}%)",
                "width": round(width, 3),
                "height": round(height, 3),
                "area": round(area, 3),
            })

    print(f"\n=== T2.2: Colored Box Detection ===")
    print(f"  Total <path> outside defs : {total_paths_outside_defs}")
    print(f"  Skipped (no RGB% fill)    : {skipped_no_fill}")
    print(f"  Skipped (structural color): {skipped_structural}")
    print(f"  Skipped (no d attribute)  : {skipped_no_d}")
    print(f"  Skipped (too small)       : {skipped_too_small}")
    print(f"  Colored boxes detected    : {len(colored_boxes)}")

    if len(colored_boxes) < 200:
        print(f"  WARNING: Only {len(colored_boxes)} boxes detected (expected 200-400). Check filtering logic.")
    elif len(colored_boxes) > 400:
        print(f"  INFO: {len(colored_boxes)} boxes detected (above 400 target). Color palette may need tightening.")

    return colored_boxes


def _iter_paths_recursive(elem):
    """Yield all descendant elements (including elem itself)."""
    yield elem
    for child in elem:
        yield from _iter_paths_recursive(child)


# ─── T2.2a: Color Palette Discovery ───────────────────────────────────────────

def build_color_palette_histogram(colored_boxes):
    """
    Build a histogram of RGB values from all detected colored boxes.
    Groups colors into buckets and identifies dominant ranges.

    Returns dict with histogram data and dominant color ranges.
    """
    if not colored_boxes:
        return {"error": "No colored boxes to analyze"}

    # Collect all RGB triples
    rgb_values = [(b["fill_r"], b["fill_g"], b["fill_b"]) for b in colored_boxes]

    # Quantize to 10% buckets for histogram
    bucket_size = 10
    r_hist = Counter()
    g_hist = Counter()
    b_hist = Counter()

    for r, g, b in rgb_values:
        r_bucket = int(r // bucket_size) * bucket_size
        g_bucket = int(g // bucket_size) * bucket_size
        b_bucket = int(b // bucket_size) * bucket_size
        r_hist[r_bucket] += 1
        g_hist[g_bucket] += 1
        b_hist[b_bucket] += 1

    # Find pastel range (high values in all channels, slight color tint)
    # Gene boxes tend to be pastels: all channels 70-100% but not all equal (not white/gray)
    pastel_boxes = [
        b for b in colored_boxes
        if b["fill_r"] >= 70 and b["fill_g"] >= 70 and b["fill_b"] >= 70
        and not is_structural_color(b["fill_r"], b["fill_g"], b["fill_b"])
    ]

    # Saturated boxes (at least one channel < 50%, likely arrows/lines)
    saturated_boxes = [
        b for b in colored_boxes
        if min(b["fill_r"], b["fill_g"], b["fill_b"]) < 50
    ]

    # Size distribution analysis
    widths = [b["width"] for b in colored_boxes]
    heights = [b["height"] for b in colored_boxes]
    areas = [b["area"] for b in colored_boxes]

    def percentile(lst, pct):
        sorted_lst = sorted(lst)
        idx = int(len(sorted_lst) * pct / 100)
        return round(sorted_lst[min(idx, len(sorted_lst) - 1)], 3)

    histogram = {
        "total_colored_boxes": len(colored_boxes),
        "pastel_boxes_count": len(pastel_boxes),
        "saturated_boxes_count": len(saturated_boxes),
        "r_channel_histogram": {str(k): v for k, v in sorted(r_hist.items())},
        "g_channel_histogram": {str(k): v for k, v in sorted(g_hist.items())},
        "b_channel_histogram": {str(k): v for k, v in sorted(b_hist.items())},
        "size_distribution": {
            "width_p10": percentile(widths, 10),
            "width_p50": percentile(widths, 50),
            "width_p90": percentile(widths, 90),
            "height_p10": percentile(heights, 10),
            "height_p50": percentile(heights, 50),
            "height_p90": percentile(heights, 90),
            "area_p10": percentile(areas, 10),
            "area_p50": percentile(areas, 50),
            "area_p90": percentile(areas, 90),
        },
        "color_range_summary": {
            "pastel_range_description": "fill_r >= 70%, fill_g >= 70%, fill_b >= 70% (not white/gray)",
            "saturated_range_description": "min(r,g,b) < 50% (arrows, pathway lines, etc.)",
            "recommended_gene_box_filter": "pastel range + area > 200 sqpt + both dimensions > 10pt",
        },
        "dominant_r_buckets": sorted(r_hist.items(), key=lambda x: -x[1])[:5],
        "dominant_g_buckets": sorted(g_hist.items(), key=lambda x: -x[1])[:5],
        "dominant_b_buckets": sorted(b_hist.items(), key=lambda x: -x[1])[:5],
    }

    print(f"\n=== T2.2a: Color Palette Discovery ===")
    print(f"  Total colored boxes  : {len(colored_boxes)}")
    print(f"  Pastel boxes (gene box candidates): {len(pastel_boxes)}")
    print(f"  Saturated boxes (arrows/lines): {len(saturated_boxes)}")
    print(f"  Width  p50/p90: {percentile(widths,50)} / {percentile(widths,90)} pt")
    print(f"  Height p50/p90: {percentile(heights,50)} / {percentile(heights,90)} pt")
    print(f"  Area   p50/p90: {percentile(areas,50)} / {percentile(areas,90)} sq pt")

    return histogram


# ─── T1.2a: Coordinate Alignment Validation ──────────────────────────────────

def validate_coordinate_alignment(occurrences, colored_boxes, tolerance=10.0):
    """
    Validate that PDF RSID text centroids align with SVG colored box positions.

    For each unique RSID occurrence, find the nearest colored box.
    Report: what % of RSIDs have a box within `tolerance` pt.

    Returns alignment_report dict. Raises SystemExit if alignment < 80%.
    """
    if not occurrences:
        return {"error": "No RSIDs extracted from PDF"}
    if not colored_boxes:
        return {"error": "No colored boxes detected in SVG"}

    print(f"\n=== T1.2a: Coordinate Alignment Validation ===")
    print(f"  PDF RSIDs: {len(occurrences)} occurrences")
    print(f"  SVG boxes: {len(colored_boxes)}")
    print(f"  Tolerance: {tolerance} pt")

    results = []
    within_tolerance = 0
    total_unique = 0

    # Deduplicate by (rsid, approximate position) — same RSID at same spot
    seen_positions = set()
    unique_occurrences = []
    for occ in occurrences:
        key = (occ["rsid"], round(occ["center_x"] / 5) * 5, round(occ["center_y"] / 5) * 5)
        if key not in seen_positions:
            seen_positions.add(key)
            unique_occurrences.append(occ)

    for occ in unique_occurrences:
        total_unique += 1
        cx, cy = occ["center_x"], occ["center_y"]

        # Find nearest box (by centroid distance)
        nearest = None
        nearest_dist = float("inf")
        nearest_inside = False

        for box in colored_boxes:
            # Check if centroid is inside box bounds (with tolerance)
            inside = (
                (box["x1"] - tolerance) <= cx <= (box["x2"] + tolerance) and
                (box["y1"] - tolerance) <= cy <= (box["y2"] + tolerance)
            )
            dist = math.sqrt((cx - box["centroid_x"])**2 + (cy - box["centroid_y"])**2)

            if dist < nearest_dist:
                nearest_dist = dist
                nearest = box
                nearest_inside = inside

        aligned = nearest_dist <= tolerance or nearest_inside

        if aligned:
            within_tolerance += 1

        results.append({
            "rsid": occ["rsid"],
            "pdf_x": cx,
            "pdf_y": cy,
            "nearest_box_index": nearest["path_index"] if nearest else None,
            "nearest_box_centroid_x": nearest["centroid_x"] if nearest else None,
            "nearest_box_centroid_y": nearest["centroid_y"] if nearest else None,
            "distance_pt": round(nearest_dist, 3) if nearest else None,
            "inside_box": nearest_inside,
            "aligned": aligned,
        })

    alignment_rate = (within_tolerance / total_unique * 100) if total_unique > 0 else 0

    # Sample of aligned and misaligned for inspection
    aligned_samples = [r for r in results if r["aligned"]][:10]
    misaligned_samples = [r for r in results if not r["aligned"]][:20]

    report = {
        "total_unique_positions": total_unique,
        "within_tolerance": within_tolerance,
        "outside_tolerance": total_unique - within_tolerance,
        "alignment_rate_percent": round(alignment_rate, 2),
        "tolerance_pt": tolerance,
        "pass": alignment_rate >= 80.0,
        "aligned_samples": aligned_samples,
        "misaligned_samples": misaligned_samples,
        "all_results": results,
    }

    print(f"  Unique RSID positions: {total_unique}")
    print(f"  Within tolerance     : {within_tolerance} ({alignment_rate:.1f}%)")
    print(f"  Outside tolerance    : {total_unique - within_tolerance}")

    if alignment_rate >= 90:
        print(f"  PASS (EXCELLENT) — {alignment_rate:.1f}% alignment >= 90% target")
    elif alignment_rate >= 80:
        print(f"  PASS — {alignment_rate:.1f}% alignment >= 80% minimum threshold")
    else:
        print(f"  FAIL — {alignment_rate:.1f}% alignment < 80% minimum threshold")
        print(f"  STOP: Spatial join approach is not viable. Manual calibration required.")
        print(f"  First 5 misaligned RSIDs:")
        for r in misaligned_samples[:5]:
            print(f"    {r['rsid']} @ ({r['pdf_x']}, {r['pdf_y']}) — nearest box {r['nearest_box_index']} dist={r['distance_pt']} pt")

    return report


# ─── Output Writers ───────────────────────────────────────────────────────────

def write_json(data, path):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"  Written: {path}")


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = build_parser()
    args = parser.parse_args()

    os.makedirs(args.out_dir, exist_ok=True)

    run_extraction = not args.boxes_only
    run_svg = not args.extract_only
    run_alignment = args.validate_only or (not args.extract_only and not args.boxes_only)

    # ── T1.2: PDF RSID Extraction ────────────────────────────────────────────
    occurrences = []
    if run_extraction:
        print(f"\nPDF: {args.pdf}")
        occurrences = extract_rsids_from_pdf(args.pdf)
        unique_rsids, rsid_counts, duplicates = summarize_rsid_extraction(occurrences)

        # ── T1.3: Regression Check ───────────────────────────────────────────
        passed, missing = regression_check(occurrences)

        # Write intermediate output
        out_path = os.path.join(args.out_dir, "rsids-extracted.json")
        write_json({
            "total_occurrences": len(occurrences),
            "unique_rsids": len(unique_rsids),
            "regression_check": "PASS" if passed else f"FAIL (missing: {missing})",
            "duplicates": {rsid: cnt for rsid, cnt in rsid_counts.items() if cnt > 1},
            "occurrences": occurrences,
        }, out_path)

        if not passed:
            print(f"\nERROR: Regression check failed. Missing RSIDs: {missing}", file=sys.stderr)
            print("Continuing with analysis, but output may be incomplete.", file=sys.stderr)

        if len(unique_rsids) < 250:
            print(f"\nWARNING: Only {len(unique_rsids)} unique RSIDs found (expected 280-290). Check PDF parsing.", file=sys.stderr)

        if args.extract_only:
            print("\nDone (--extract-only).")
            return

    # ── T2.1 + T2.2: SVG Parsing + Colored Box Detection ────────────────────
    colored_boxes = []
    if run_svg:
        print(f"\nSVG: {args.svg}")
        tree, root, ns_map = parse_svg(args.svg)
        _, defs_elements, _ = get_defs_ids(root)
        colored_boxes = detect_colored_boxes(root, defs_elements)

        # Write colored boxes output
        out_path = os.path.join(args.out_dir, "svg-colored-boxes.json")
        write_json({
            "total_colored_boxes": len(colored_boxes),
            "boxes": colored_boxes,
        }, out_path)

        # ── T2.2a: Color Palette Discovery ───────────────────────────────────
        histogram = build_color_palette_histogram(colored_boxes)
        out_path = os.path.join(args.out_dir, "color-palette-histogram.json")
        write_json(histogram, out_path)

        if args.boxes_only:
            print("\nDone (--boxes-only).")
            return

    # ── T1.2a: Coordinate Alignment Validation ───────────────────────────────
    if run_alignment and occurrences and colored_boxes:
        alignment_report = validate_coordinate_alignment(occurrences, colored_boxes)
        out_path = os.path.join(args.out_dir, "coordinate-alignment-validation.json")
        write_json(alignment_report, out_path)

        if not alignment_report.get("pass", False):
            print(
                "\nCRITICAL: Coordinate alignment validation FAILED.\n"
                "Halting — spatial join (P3) cannot proceed without valid alignment.\n"
                "Review coordinate-alignment-validation.json for details.",
                file=sys.stderr,
            )
            sys.exit(2)

        if args.validate_only:
            print("\nDone (--validate-only).")
            return

    print("\n=== Phase 1 + 2 Complete ===")
    print(f"  RSIDs extracted    : {len(occurrences)}")
    print(f"  Unique RSIDs       : {len(set(o['rsid'] for o in occurrences))}")
    print(f"  Colored boxes      : {len(colored_boxes)}")
    print(f"\nIntermediate outputs written to: {args.out_dir}")
    print("  rsids-extracted.json")
    print("  svg-colored-boxes.json")
    print("  color-palette-histogram.json")
    print("  coordinate-alignment-validation.json")
    print("\nNext step: P3 spatial join (T3.1) — run with full pipeline mode.")


if __name__ == "__main__":
    main()
