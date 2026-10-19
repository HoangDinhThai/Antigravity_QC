# Custom Fields Classification Rules

- Use the following rules for the agent to automatically recognize and classify Bugs. Recognize errors when QC describes them roughly to standardize them properly.

## 1. Program Logic Bug Type

* **Interface Error:** Lỗi giao diện.
  *(VD: Kích thước không đúng, label/message sai, vị trí/size sai...)*
* **Workflow:** Lỗi User Navigation.
  *(VD: Back sai, Save and Exit, Previous Page...)*
* **Functional Bug:** Các lỗi chức năng có liên quan đến chức năng của một thành phần phần mềm cụ thể. Bất kỳ thành phần nào trong ứng dụng hoặc trang web không hoạt động như dự định đều là lỗi chức năng.
  *(Ví dụ: Button Login không thực hiện được, bấm thêm giỏ hàng nhưng button không hoạt động, tìm kiếm nhưng không phản hồi...)*
* **Logical Bug:** Bug logic thường liên quan tới luồng hoạt động của phần mềm.
  *(VD: Validate sai, tính toán sai, crash, xử lý data sai...)*
* **Security Bug:**
  - Phân quyền / Permission
  - Các lỗi security khác (SQL injection, XSS attack,...)
* **Performance Problem:** Liên quan tới hiệu năng, thời gian phản hồi, tốc độ xử lý trang, bộ nhớ....
* **UAT Bug:** Bug từ khách hàng trả về.
* **Release Bug:** Bug phát sinh khi release.

---

## 2. Bug Severity

* **Critical:** Lỗi gây ảnh hưởng nghiêm trọng đến sản phẩm. Ảnh hưởng đến schedule hoặc có thể khiến người dùng không thể tiếp tục sử dụng hệ thống.
  *(Ví dụ: Cài đặt không thành công, lỗi hoàn toàn một tính năng; Làm sập hệ thống, làm hỏng tệp dữ liệu hoặc làm gián đoạn hoàn toàn dịch vụ).*
* **Major:** Lỗi gây ảnh hưởng nhưng không nghiêm trọng đối với sản phẩm, có thể làm ngừng hoạt động 1 phần hệ thống, tuy nhiên một số chức năng khác vẫn hoạt động bình thường.
  *(Ví dụ: Vấn đề hiệu năng; Mất dữ liệu từ thiết bị nối tiếp khi tải nặng).*
* **Minor:** Lỗi gây ra những hành vi không mong muốn nhưng hệ thống vẫn hoạt động được, không gây ảnh hưởng đến bất kì chức năng nào của hệ thống.
  *(Ví dụ: Lỗi tài liệu; Thiếu giá trị mặc định cho các trường bắt buộc).*

---

## 3. Bug Priority

* **High:** Lỗi phải được giải quyết càng sớm càng tốt vì nó ảnh hưởng nghiêm trọng đến hệ thống và không thể được sử dụng cho đến khi được khắc phục.
* **Medium (Normal):** Lỗi nên được giải quyết trong tiến trình dự án hoặc có thể đợi đến khi version mới ra.
* **Low:** Lỗi ảnh hưởng đến hoạt động hệ thống nhưng nó có thể giải quyết sau khi những defect nghiêm trọng hơn đã được giải quyết.

---

## 4. Phase Detected

* **Unit Testing:** Component/unit-level testing for small modules (function/class/method), usually performed by Developer directly in code. Field-level validation checks belong to this phase.
* **Intergration Testing:** Integration testing performed by Tester, focused on interfaces/interactions between components. Includes checks across fields within one screen and cross-component behavior.
* **System Testing:** End-to-end testing of full system functionality/UI before delivery, focused on whole-system behavior and defects.
* **Acceptance Testing:** Customer/business acceptance testing to verify solution meets requirements. Includes Alpha/Beta style acceptance contexts.
