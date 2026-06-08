import os
import sys
import re
import argparse
import io
import datetime

# Thiết lập UTF-8 encoding cho Windows console
if sys.platform.startswith('win'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Dynamic installation check and library imports
try:
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
    from google.oauth2 import service_account
except ImportError:
    import subprocess
    print("Thiếu thư viện cần thiết. Đang tự động cài đặt từ requirements.txt...")
    script_dir = os.path.dirname(os.path.abspath(__file__))
    req_path = os.path.join(script_dir, "requirements.txt")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", req_path])
        print("Cài đặt thư viện thành công! Đang tải lại thư viện...")
        from google.auth.transport.requests import Request
        from google.oauth2.credentials import Credentials
        from google_auth_oauthlib.flow import InstalledAppFlow
        from googleapiclient.discovery import build
        from google.oauth2 import service_account
    except Exception as e:
        print(f"Lỗi khi cài đặt thư viện: {e}", file=sys.stderr)
        print(f"Vui lòng chạy lệnh sau để cài đặt thủ công: pip install -r {req_path}", file=sys.stderr)
        sys.exit(1)

# Aliases for fuzzy column mapping
FIELD_MAP = {
    'tc_id': ['tc id', 'test case id', 'mã tc', 'mã test case', 'id', 'mã', 'tc_id', 'case id'],
    'serial_number': ['stt', 'no.', 'no', 'num', 'seq', 'no. id', 'no.id', 'số thứ tự', 'stt id'],
    'module': ['module', 'phân hệ', 'tính năng', 'feature', 'chức năng', 'submodule', 'sub-module'],
    'risk_level': ['risk level', 'mức độ rủi ro', 'rủi ro', 'risk', 'risk_level'],
    'test_scenario': ['test scenario', 'test case title', 'test title', 'kịch bản test', 'tên test case', 'tiêu đề', 'mô tả', 'scenario', 'title', 'test case name', 'tên kịch bản', 'kịch bản'],
    'pre_condition': ['pre-condition', 'precondition', 'điều kiện tiên quyết', 'điều kiện đầu vào', 'tiền điều kiện', 'pre-conditions', 'pre_condition'],
    'test_steps': ['test steps', 'các bước thực hiện', 'bước thực hiện', 'steps', 'test step', 'các bước', 'bước'],
    'test_data': ['test data', 'dữ liệu test', 'dữ liệu thử nghiệm', 'dữ liệu', 'data', 'test_data'],
    'expected_result': ['expected result', 'expected results', 'kết quả mong đợi', 'kết quả dự kiến', 'expected', 'kết quả', 'expected_result'],
    'priority': ['priority', 'mức độ ưu tiên', 'độ ưu tiên', 'priority level', 'độ khẩn cấp'],
    'created_date': ['created date', 'created_date', 'ngày tạo', 'created_at', 'ngày tạo tc']
}

SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

def parse_sheet_url(url):
    """Trích xuất Spreadsheet ID và GID từ URL Google Sheet."""
    id_match = re.search(r'/d/([a-zA-Z0-9-_]+)', url)
    if not id_match:
        raise ValueError(f"Không thể tìm thấy Spreadsheet ID trong URL: {url}")
    spreadsheet_id = id_match.group(1)
    
    gid_match = re.search(r'gid=([0-9]+)', url)
    gid = gid_match.group(1) if gid_match else "0"
    return spreadsheet_id, gid

def get_credentials(credentials_dir):
    """Tìm kiếm file credentials xác thực Google API."""
    os.makedirs(credentials_dir, exist_ok=True)
    service_account_path = os.path.join(credentials_dir, "service_account.json")
    oauth_client_path = os.path.join(credentials_dir, "credentials.json")
    token_path = os.path.join(credentials_dir, "token.json")
    
    # 1. Ưu tiên Service Account (Không cần đăng nhập thủ công)
    if os.path.exists(service_account_path):
        print(f"Sử dụng Service Account từ tệp: {service_account_path}")
        return service_account.Credentials.from_service_account_file(
            service_account_path, scopes=SCOPES
        )
        
    # 2. Sử dụng OAuth 2.0 (Yêu cầu xác nhận qua trình duyệt lần đầu)
    creds = None
    if os.path.exists(token_path):
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)
        
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("Đang refresh access token...")
            try:
                creds.refresh(Request())
            except Exception:
                creds = None
                
        if not creds:
            if not os.path.exists(oauth_client_path):
                print(f"\n[LỖI] Không tìm thấy file credentials xác thực Google Sheets API.", file=sys.stderr)
                print(f"Hãy cấu hình một trong hai file sau trong thư mục credentials của skill:", file=sys.stderr)
                print(f"  - Cấu hình Service Account: {service_account_path}", file=sys.stderr)
                print(f"  - Hoặc cấu hình OAuth Client: {oauth_client_path}", file=sys.stderr)
                print("Chi tiết hướng dẫn tại file .agent/skills/google_sheets_integration/SKILL.md", file=sys.stderr)
                sys.exit(1)
            print("Khởi chạy OAuth login flow...")
            flow = InstalledAppFlow.from_client_secrets_file(oauth_client_path, SCOPES)
            creds = flow.run_local_server(port=0)
            
        with open(token_path, 'w', encoding='utf-8') as token_file:
            token_file.write(creds.to_json())
            
    return creds

def parse_markdown_table(md_content):
    """Phân tích cú pháp bảng Markdown thành danh sách Header và danh sách các Rows."""
    lines = md_content.splitlines()
    table_lines = []
    in_table = False
    
    for line in lines:
        line_stripped = line.strip()
        if line_stripped.startswith('|') and line_stripped.endswith('|'):
            in_table = True
            table_lines.append(line_stripped)
        elif in_table:
            # Thu thập toàn bộ dòng bắt đầu và kết thúc bằng | liền nhau
            if line_stripped.startswith('|') and line_stripped.endswith('|'):
                table_lines.append(line_stripped)
            else:
                # Nếu đã vào bảng rồi và gặp dòng không hợp lệ, ta bỏ qua hoặc kết thúc
                pass
                
    if not table_lines:
        # Cách phụ: Tìm tất cả dòng chứa ít nhất 2 ký tự '|'
        for line in lines:
            if line.count('|') >= 2:
                table_lines.append(line.strip())
                
    if not table_lines:
        raise ValueError("Không tìm thấy bảng Markdown nào trong nội dung đầu vào.")
        
    rows = []
    for line in table_lines:
        # Cắt bỏ ký tự '|' ở đầu và cuối dòng, split theo '|' ở giữa
        cells = [cell.strip() for cell in line.split('|')[1:-1]]
        rows.append(cells)
        
    # Loại bỏ hàng phân tách (ví dụ: |---|---|)
    filtered_rows = []
    for row in rows:
        is_separator = all(re.match(r'^[-:\s]+$', cell) for cell in row) if row else False
        if not is_separator:
            cleaned_row = []
            for cell in row:
                # Thay thế thẻ <br>, <br/>, <br /> bằng ký tự xuống dòng thực sự
                cell_clean = re.sub(r'<br\s*/?>', '\n', cell, flags=re.IGNORECASE)
                cell_clean = cell_clean.replace(r'\|', '|')
                cleaned_row.append(cell_clean)
            filtered_rows.append(cleaned_row)
            
    if len(filtered_rows) < 2:
        raise ValueError("Bảng Markdown tìm thấy không hợp lệ (cần ít nhất 1 hàng tiêu đề và 1 hàng dữ liệu).")
        
    headers = filtered_rows[0]
    data_rows = filtered_rows[1:]
    return headers, data_rows

def get_standard_field(header):
    """Tìm key tiêu chuẩn dựa trên alias của tiêu đề cột."""
    h_clean = header.strip().lower()
    
    # 1. Khớp chính xác tuyệt đối (Exact Match)
    for field, aliases in FIELD_MAP.items():
        if h_clean in aliases:
            return field
            
    # 2. Khớp theo cụm từ độc lập (Word Boundary Match)
    for field, aliases in FIELD_MAP.items():
        for alias in aliases:
            # Nếu alias rất ngắn (<=3 ký tự), chỉ cho phép khớp chính xác tuyệt đối
            if len(alias) <= 3:
                continue
            # Dùng regex tìm cụm từ độc lập trong tiêu đề cột
            pattern = rf"\b{re.escape(alias)}\b"
            if re.search(pattern, h_clean):
                return field
                
    return None

def main():
    parser = argparse.ArgumentParser(description="Đẩy test cases từ bảng Markdown lên Google Sheets")
    parser.add_argument("--url", required=True, help="Đường dẫn Google Sheets đầy đủ")
    parser.add_argument("--file", help="Đường dẫn đến file markdown chứa bảng testcase")
    parser.add_argument("--content", help="Nội dung chuỗi markdown trực tiếp")
    args = parser.parse_args()
    
    # 1. Đọc nội dung Markdown
    md_content = ""
    if args.content:
        md_content = args.content
    elif args.file:
        if not os.path.exists(args.file):
            print(f"[LỖI] File không tồn tại: {args.file}", file=sys.stderr)
            sys.exit(1)
        with open(args.file, 'r', encoding='utf-8') as f:
            md_content = f.read()
    else:
        # Đọc từ stdin
        print("Nhập nội dung bảng markdown (nhấn Ctrl+D hoặc Ctrl+Z để kết thúc):")
        md_content = sys.stdin.read()
        
    if not md_content.strip():
        print("[LỖI] Không có nội dung markdown để xử lý.", file=sys.stderr)
        sys.exit(1)
        
    # 2. Parse Markdown Table
    try:
        md_headers, md_data_rows = parse_markdown_table(md_content)
        print(f"Đã đọc bảng markdown thành công. Số lượng test case: {len(md_data_rows)}")
        print(f"Các cột trong file markdown: {md_headers}")
    except Exception as e:
        print(f"[LỖI] Lỗi phân tích cú pháp bảng Markdown: {e}", file=sys.stderr)
        sys.exit(1)
        
    # 3. Phân tích URL Google Sheets
    try:
        spreadsheet_id, gid = parse_sheet_url(args.url)
        print(f"Spreadsheet ID: {spreadsheet_id}")
        print(f"Sheet GID: {gid}")
    except Exception as e:
        print(f"[LỖI] Lỗi phân tích URL Google Sheet: {e}", file=sys.stderr)
        sys.exit(1)
        
    # 4. Xác thực Google Sheets API
    script_dir = os.path.dirname(os.path.abspath(__file__))
    credentials_dir = os.path.abspath(os.path.join(script_dir, "..", "credentials"))
    creds = get_credentials(credentials_dir)
    
    # 5. Khởi tạo Service
    try:
        service = build('sheets', 'v4', credentials=creds)
        spreadsheet = service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
        sheets = spreadsheet.get('sheets', [])
        
        # Tìm sheet title từ GID
        target_sheet_title = None
        for sheet in sheets:
            props = sheet.get('properties', {})
            if str(props.get('sheetId', '')) == str(gid):
                target_sheet_title = props.get('title')
                break
                
        if not target_sheet_title:
            if sheets:
                target_sheet_title = sheets[0].get('properties', {}).get('title')
                print(f"Cảnh báo: Không tìm thấy sheet tương ứng với GID {gid}. Sử dụng sheet đầu tiên: '{target_sheet_title}'")
            else:
                raise ValueError("Không tìm thấy sheet nào trong spreadsheet.")
                
        print(f"Tìm thấy sheet đích: '{target_sheet_title}'")
        
        # Đọc range A1:Z100 để tìm hàng tiêu đề thực tế và xác định dòng ghi dữ liệu
        range_name = f"'{target_sheet_title}'!A1:Z100"
        result = service.spreadsheets().values().get(
            spreadsheetId=spreadsheet_id,
            range=range_name
        ).execute()
        sheet_rows = result.get('values', [])
        
        # 6. Tìm hàng tiêu đề phù hợp
        header_row_idx = -1
        max_matches = 0
        sheet_headers = []
        
        for idx, row in enumerate(sheet_rows):
            matches = 0
            for cell in row:
                if cell and get_standard_field(cell):
                    matches += 1
            if matches > max_matches and matches >= 3:
                max_matches = matches
                header_row_idx = idx
                sheet_headers = row
                
        # Tự động dọn dẹp dữ liệu rác ở cột A do lần đẩy lỗi trước đó (A3:A12)
        if header_row_idx != -1 and header_row_idx > 2:
            try:
                # Kiểm tra nếu dòng 3 đến 12 chứa dữ liệu sai dạng "Import" hoặc "Export"
                check_clear_range = f"'{target_sheet_title}'!A3:A12"
                clear_res = service.spreadsheets().values().get(
                    spreadsheetId=spreadsheet_id,
                    range=check_clear_range
                ).execute()
                clear_values = clear_res.get('values', [])
                if any(v and any(word in str(v[0]) for word in ["Import", "Export"]) for v in clear_values if v):
                    print("Phát hiện dữ liệu lỗi ở A3:A12 từ lần đẩy trước. Đang dọn dẹp...")
                    service.spreadsheets().values().clear(
                        spreadsheetId=spreadsheet_id,
                        range=check_clear_range
                    ).execute()
            except Exception as e:
                # Bỏ qua nếu có lỗi trong quá trình dọn dẹp
                pass
                
        if header_row_idx == -1:
            print("Không tìm thấy hàng tiêu đề phù hợp (cần ít nhất 3 cột tương ứng).")
            if not sheet_rows:
                print("Sheet trống. Đã ghi hàng tiêu đề mặc định vào A1.")
                service.spreadsheets().values().update(
                    spreadsheetId=spreadsheet_id,
                    range=f"'{target_sheet_title}'!A1",
                    valueInputOption='RAW',
                    body={'values': [md_headers]}
                ).execute()
                sheet_headers = md_headers
                start_row_num = 2
            else:
                sheet_headers = sheet_rows[0]
                start_row_num = len(sheet_rows) + 1
                print(f"Sử dụng hàng đầu tiên làm tiêu đề và append vào cuối bảng (Dòng {start_row_num}).")
        else:
            print(f"Tìm thấy hàng tiêu đề thực tế tại dòng {header_row_idx + 1}: {sheet_headers}")
            # Tìm dòng trống đầu tiên bên dưới tiêu đề để bắt đầu ghi dữ liệu
            start_row_num = header_row_idx + 2
            
            # Đọc dữ liệu từ dòng dưới tiêu đề đến hết dòng 100
            data_rows = sheet_rows[header_row_idx + 1:]
            if data_rows:
                for r_idx, r_values in enumerate(data_rows):
                    is_empty = True
                    for val in r_values:
                        if str(val).strip():
                            is_empty = False
                            break
                    if is_empty:
                        start_row_num = header_row_idx + 2 + r_idx
                        break
                else:
                    start_row_num = header_row_idx + 2 + len(data_rows)
            print(f"Xác định dòng trống đầu tiên để điền dữ liệu: Dòng {start_row_num}")
            
        # 7. Map các cột linh hoạt
        append_rows = []
        existing_rows_count = start_row_num - (header_row_idx + 2) if header_row_idx != -1 else 0
        
        for r_idx, row_cells in enumerate(md_data_rows):
            row_dict = {}
            for idx, cell_val in enumerate(row_cells):
                if idx < len(md_headers):
                    std_field = get_standard_field(md_headers[idx])
                    if std_field:
                        row_dict[std_field] = cell_val
                        
            # Tự động gán số thứ tự tăng dần cho cột serial_number (stt/no. id)
            row_dict['serial_number'] = str(existing_rows_count + r_idx + 1)
            
            # Tự động gán ngày tạo (created_date) là ngày hôm nay dạng YYYY-MM-DD
            row_dict['created_date'] = datetime.date.today().strftime('%Y-%m-%d')
            
            new_row = []
            for s_header in sheet_headers:
                std_field = get_standard_field(s_header)
                if std_field and std_field in row_dict:
                    new_row.append(row_dict[std_field])
                else:
                    new_row.append("")
            append_rows.append(new_row)
            
        # 8. Ghi dữ liệu bằng phương thức Update (để giữ form / ghi đè dòng trống có sẵn)
        print(f"Đang đẩy {len(append_rows)} hàng test case lên Google Sheet (Bắt đầu từ dòng {start_row_num})...")
        write_range = f"'{target_sheet_title}'!A{start_row_num}"
        body = {
            'values': append_rows
        }
        service.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id,
            range=write_range,
            valueInputOption='USER_ENTERED',
            body=body
        ).execute()
        
        print("\n=== THÀNH CÔNG ===")
        print(f"Đã đẩy thành công tất cả test cases vào sheet '{target_sheet_title}' của Google Spreadsheet!")
        
    except Exception as e:
        print(f"\n[LỖI] Lỗi khi làm việc với API Google Sheets: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
