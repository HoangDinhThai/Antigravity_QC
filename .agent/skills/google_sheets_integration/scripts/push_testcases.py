# -*- coding: utf-8 -*-
import os
import sys
import re
import argparse
import io

if sys.platform.startswith('win'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
except ImportError:
    print("Vui lòng cài đặt thư viện cần thiết: pip install google-api-python-client google-auth", file=sys.stderr)
    sys.exit(1)

def clean_markdown(text):
    if not text:
        return ""
    s = text
    s = re.sub(r'<br\s*/?>', '\n', s, flags=re.IGNORECASE)
    s = re.sub(r'\s*->\s*', '\n', s)
    s = s.replace('**', '').replace('*', '').replace('`', '')
    return s.strip()

def normalize_priority(raw):
    if not raw:
        return 'Normal'
    clean = raw.strip().lower()
    if clean in ('critical', 'high'):
        return 'High'
    if clean in ('medium', 'normal'):
        return 'Normal'
    if clean == 'low':
        return 'Low'
    return raw.strip()

def parse_sheet_url(url):
    id_match = re.search(r'/d/([a-zA-Z0-9-_]+)', url)
    if not id_match:
        raise ValueError(f"Không tìm thấy Spreadsheet ID trong URL: {url}")
    spreadsheet_id = id_match.group(1)
    gid_match = re.search(r'gid=([0-9]+)', url)
    gid = gid_match.group(1) if gid_match else "0"
    return spreadsheet_id, gid

def parse_markdown_testcases(md_content):
    lines = md_content.splitlines()
    table_lines = [l.strip() for l in lines if l.strip().startswith('|') and l.strip().endswith('|')]
    if not table_lines:
        raise ValueError("Không tìm thấy bảng Markdown nào trong nội dung.")

    raw_rows = []
    for line in table_lines:
        cells = [c.strip() for c in line.split('|')[1:-1]]
        raw_rows.append(cells)

    valid_rows = [r for r in raw_rows if not all(re.match(r'^[-:\s]+$', c) for c in r)]
    if len(valid_rows) < 2:
        raise ValueError("Bảng Markdown phải có ít nhất 1 dòng tiêu đề và 1 dòng dữ liệu.")

    header = [h.lower() for h in valid_rows[0]]

    def find_col(keywords, exclude_index=-1):
        for kw in keywords:
            for idx, h in enumerate(header):
                if idx != exclude_index and kw in h:
                    return idx
        return -1

    col_tc_id = find_col(['tc id', 'mã tc', 'id'])
    col_title1 = find_col(['title 1', 'feature', 'chức năng', 'tính năng', 'phân hệ', 'module'])
    col_title2 = find_col(['title 2', 'test scenario', 'kịch bản', 'tiêu đề', 'mô tả', 'title'], col_title1)
    col_pre = find_col(['pre-condition', 'precondition', 'tiền điều kiện', 'điều kiện'])
    col_steps = find_col(['test steps', 'bước thực hiện', 'các bước', 'steps', 'step'])
    col_data = find_col(['test data', 'dữ liệu test', 'dữ liệu', 'data'])
    col_exp = find_col(['expected result', 'kết quả mong đợi', 'kết quả', 'expected'])
    col_priority = find_col(['priority', 'độ ưu tiên', 'mức độ ưu tiên'])

    test_cases = []
    for r in valid_rows[1:]:
        if len(r) < 5 or (r[0] and 'tc id' in r[0].lower()):
            continue
        tc_id = clean_markdown(r[col_tc_id]) if col_tc_id != -1 and col_tc_id < len(r) else ""
        t1 = clean_markdown(r[col_title1]) if col_title1 != -1 and col_title1 < len(r) else ""
        t2 = clean_markdown(r[col_title2]) if col_title2 != -1 and col_title2 < len(r) else ""
        pre = clean_markdown(r[col_pre]) if col_pre != -1 and col_pre < len(r) else ""
        steps = clean_markdown(r[col_steps]) if col_steps != -1 and col_steps < len(r) else ""
        data = clean_markdown(r[col_data]) if col_data != -1 and col_data < len(r) else ""
        exp = clean_markdown(r[col_exp]) if col_exp != -1 and col_exp < len(r) else ""
        raw_pri = clean_markdown(r[col_priority]) if col_priority != -1 and col_priority < len(r) else "Normal"
        priority = normalize_priority(raw_pri)

        if not t1 and not t2 and not steps and not exp:
            continue

        test_cases.append({
            "tc_id": tc_id,
            "feature": t1,
            "title": t2 or t1,
            "pre": pre,
            "steps": steps,
            "data": data,
            "exp": exp,
            "priority": priority
        })

    return test_cases

def main():
    parser = argparse.ArgumentParser(description="Đẩy test cases lên Google Sheets VNTEST chuẩn 15 cột.")
    parser.add_argument("--url", required=True, help="URL Google Sheets")
    parser.add_argument("--file", help="Đường dẫn file markdown")
    parser.add_argument("--content", help="Chuỗi markdown")
    parser.add_argument("--module", default="", help="Tên Module lớn")
    parser.add_argument("--tester", default="ThaiHD", help="Mã Tester")

    args = parser.parse_args()

    if not args.file and not args.content:
        print("Lỗi: Phải cung cấp --file hoặc --content", file=sys.stderr)
        sys.exit(1)

    if args.file:
        with open(args.file, "r", encoding="utf-8") as f:
            md_content = f.read()
    else:
        md_content = args.content

    test_cases = parse_markdown_testcases(md_content)
    print(f"Đã trích xuất thành công {len(test_cases)} kịch bản kiểm thử từ Markdown.")

    spreadsheet_id, gid = parse_sheet_url(args.url)
    print(f"Spreadsheet ID: {spreadsheet_id}, GID: {gid}")

    script_dir = os.path.dirname(os.path.abspath(__file__))
    creds_path = os.path.join(script_dir, "..", "credentials", "service_account.json")
    if not os.path.exists(creds_path):
        print(f"Lỗi: Không tìm thấy file credentials tại {creds_path}", file=sys.stderr)
        sys.exit(1)

    scopes = ['https://www.googleapis.com/auth/spreadsheets']
    creds = service_account.Credentials.from_service_account_file(creds_path, scopes=scopes)
    service = build('sheets', 'v4', credentials=creds)

    meta = service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
    sheet_list = meta.get('sheets', [])

    target_sheet = None
    for s in sheet_list:
        props = s.get('properties', {})
        if str(props.get('sheetId')) == gid:
            target_sheet = s
            break

    if not target_sheet:
        target_sheet = sheet_list[0]

    target_title = target_sheet['properties']['title']
    target_id = target_sheet['properties']['sheetId']
    print(f"Tab mục tiêu ban đầu: '{target_title}' (Sheet ID: {target_id})")

    # Tự động suy ra tên module nếu chưa được truyền qua --module
    if not args.module:
        heading_match = re.search(r'^#\s+(?:Test Cases?\s*[-:]*\s*)?(.*)$', md_content, flags=re.MULTILINE)
        if heading_match and heading_match.group(1).strip():
            args.module = heading_match.group(1).strip()
        elif test_cases and test_cases[0].get('feature'):
            args.module = test_cases[0]['feature']

    # Đổi tên tab sheet thành tên module nếu có module và tên khác hiện tại
    if args.module and target_title != args.module:
        print(f"Đang đổi tên tab từ '{target_title}' thành '{args.module}'...")
        try:
            service.spreadsheets().batchUpdate(
                spreadsheetId=spreadsheet_id,
                body={'requests': [{
                    'updateSheetProperties': {
                        'properties': {
                            'sheetId': target_id,
                            'title': args.module
                         },
                        'fields': 'title'
                    }
                }]}
            ).execute()
            print(f"Đã đổi tên tab thành công sang: '{args.module}'!")
            target_title = args.module
        except Exception as e:
            print(f"Cảnh báo: Không thể đổi tên tab thành '{args.module}': {e}", file=sys.stderr)

    # Unmerge nếu có
    merges = target_sheet.get('merges', [])
    data_merges = [m for m in merges if m.get('startRowIndex', 0) >= 10]
    if data_merges:
        print(f"Đang unmerge {len(data_merges)} dải ô trong vùng dữ liệu...")
        unmerge_reqs = [{'unmergeCells': {'range': {
            'sheetId': target_id,
            'startRowIndex': m['startRowIndex'],
            'endRowIndex': m['endRowIndex'],
            'startColumnIndex': m['startColumnIndex'],
            'endColumnIndex': m['endColumnIndex']
        }}} for m in data_merges]
        service.spreadsheets().batchUpdate(
            spreadsheetId=spreadsheet_id,
            body={'requests': unmerge_reqs}
        ).execute()

    start_row = 12
    res_exist = service.spreadsheets().values().get(
        spreadsheetId=spreadsheet_id,
        range=f"'{target_title}'!A12:A2000"
    ).execute()
    exist_rows = res_exist.get('values', [])
    next_stt = 1
    if exist_rows:
        last_filled = -1
        for idx in range(len(exist_rows)-1, -1, -1):
            if exist_rows[idx] and exist_rows[idx][0].strip():
                last_filled = idx
                try:
                    next_stt = int(exist_rows[idx][0].strip()) + 1
                except ValueError:
                    pass
                break
        if last_filled != -1:
            start_row = 12 + last_filled + 1
            print(f"Ghi tiếp từ dòng {start_row}, STT bắt đầu từ {next_stt}.")

    sheet_rows = []
    for idx, tc in enumerate(test_cases):
        is_first = (idx == 0)
        row = [
            str(next_stt + idx),
            (args.module or target_title) if is_first else "",
            tc['feature'],
            tc['title'],
            "",
            tc['pre'],
            tc['steps'],
            tc['data'],
            tc['exp'],
            tc['priority'],
            "UnTest",
            "",
            args.tester if is_first else "",
            "",
            tc['tc_id']
        ]
        sheet_rows.append(row)

    batch_size = 40
    curr_row = start_row
    total_updated = 0
    for b in range(0, len(sheet_rows), batch_size):
        batch = sheet_rows[b:b+batch_size]
        end_r = curr_row + len(batch) - 1
        rng = f"'{target_title}'!A{curr_row}:O{end_r}"
        res = service.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id,
            range=rng,
            valueInputOption='USER_ENTERED',
            body={'values': batch}
        ).execute()
        total_updated += res.get('updatedRows', len(batch))
        print(f"  -> Đã cập nhật xong: {rng} ({len(batch)} dòng)")
        curr_row = end_r + 1

    print(f"\n🎉 Hoàn tất đẩy thành công {total_updated} test cases lên Google Sheet.")

if __name__ == '__main__':
    main()
