#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Utility script to draw professional red boxes and optional label tags on screenshots for QC evidence.
Usage:
    python3 annotate_evidence.py --config boxes.json --raw-dir /path/to/raw --out-dir /path/to/evidence
    python3 annotate_evidence.py --input raw.png --output annotated.png --box 100,200,500,400 [--label "Vùng kiểm chứng"]
"""

import os
import sys
import json
import argparse
from PIL import Image, ImageDraw, ImageFont

def get_font(size=16):
    font_paths = [
        '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
        '/usr/share/fonts/truetype/freefont/FreeSansBold.ttf',
    ]
    for p in font_paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()

def draw_boxes_on_image(image_path, out_path, boxes, border_color=(220, 38, 38), border_width=4):
    """
    boxes: list of dicts:
        {
            "coords": [x1, y1, x2, y2] or {"x": ..., "y": ..., "width": ..., "height": ...},
            "label": "optional text",
            "tag_pos": "top" | "bottom" | "top_right" (default: "top")
        }
    """
    im = Image.open(image_path).convert('RGB')
    draw = ImageDraw.Draw(im)
    font = get_font(16)

    for b in boxes:
        # Normalize coords
        if 'coords' in b:
            x1, y1, x2, y2 = b['coords']
        elif all(k in b for k in ('x', 'y', 'width', 'height')):
            x1 = b['x']
            y1 = b['y']
            x2 = x1 + b['width']
            y2 = y1 + b['height']
        else:
            continue

        label = b.get('label', '')
        tag_pos = b.get('tag_pos', 'top')

        # Draw red bounding rectangle
        draw.rectangle([x1, y1, x2, y2], outline=border_color, width=border_width)

        # Draw optional label pill/tag
        if label:
            try:
                bbox = font.getbbox(label)
                text_w = bbox[2] - bbox[0]
                text_h = bbox[3] - bbox[1]
            except Exception:
                text_w, text_h = 100, 20

            pad_x, pad_y = 8, 5
            tag_w = text_w + pad_x * 2
            tag_h = text_h + pad_y * 2

            if tag_pos == 'bottom':
                tag_x1 = x1
                tag_y1 = y2 + 2
            elif tag_pos == 'top_right':
                tag_x1 = max(x1, x2 - tag_w)
                tag_y1 = max(0, y1 - tag_h - 2)
            else: # top
                tag_x1 = x1
                tag_y1 = max(0, y1 - tag_h - 2)

            tag_x2 = tag_x1 + tag_w
            tag_y2 = tag_y1 + tag_h

            draw.rectangle([tag_x1, tag_y1, tag_x2, tag_y2], fill=border_color)
            draw.text((tag_x1 + pad_x, tag_y1 + pad_y - 1), label, fill=(255, 255, 255), font=font)

    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    im.save(out_path)
    print(f"Saved annotated image: {out_path}")

def main():
    parser = argparse.ArgumentParser(description="Annotate screenshots with red boxes for QC evidence")
    parser.add_argument("--config", help="Path to JSON file with boxes mapping")
    parser.add_argument("--raw-dir", help="Directory containing raw screenshots")
    parser.add_argument("--out-dir", help="Directory to save annotated screenshots")
    parser.add_argument("--input", help="Single raw input image path")
    parser.add_argument("--output", help="Single annotated output image path")
    parser.add_argument("--box", help="Coordinates as x1,y1,x2,y2 or x,y,w,h")
    parser.add_argument("--label", help="Optional label text")

    args = parser.parse_args()

    if args.input and args.output and args.box:
        parts = [float(p.strip()) for p in args.box.split(',')]
        if len(parts) == 4:
            x1, y1, p3, p4 = parts
            # If p3 and p4 are width and height vs x2, y2
            if p3 < x1 or p4 < y1:
                # likely width and height
                x2 = x1 + p3
                y2 = y1 + p4
            else:
                x2, y2 = p3, p4
            boxes = [{"coords": [x1, y1, x2, y2], "label": args.label or ""}]
            draw_boxes_on_image(args.input, args.output, boxes)
            return

    if args.config:
        if not os.path.exists(args.config):
            print(f"Config file not found: {args.config}")
            sys.exit(1)
        with open(args.config, 'r', encoding='utf-8') as f:
            cfg = json.load(f)

        raw_dir = args.raw_dir or "."
        out_dir = args.out_dir or raw_dir

        for filename, box_list in cfg.items():
            in_path = os.path.join(raw_dir, filename)
            out_path = os.path.join(out_dir, filename)
            if not os.path.exists(in_path):
                print(f"Skipping missing raw file: {in_path}")
                continue
            draw_boxes_on_image(in_path, out_path, box_list)
        return

    parser.print_help()

if __name__ == '__main__':
    main()

