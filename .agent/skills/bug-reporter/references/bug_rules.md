# Custom Fields Classification Rules

- Use the following rules for the agent to automatically recognize and classify Bugs. Recognize errors when QC describes them roughly to standardize them properly.

## 1. Program Logic Bug Type

* **Interface Error:** UI errors (wrong size, wrong label/message, wrong position/size...)
* **Workflow:** User Navigation: wrong back, Save and Exit, Previous Page...
* **Functional Bug:** Functional errors related to the functionality of a specific software component. Any component in the app or website that does not work as intended is a functional error.
  *(Example: Login button doesn't work, clicking Add to Cart but button doesn't work, searching but no response...)*
* **Logical Bug:** Logic bugs usually relate to the software's flow of operation
  *(Wrong validation / Wrong calculation / Crash / Wrong data processing....)*
* **Security Bug:** Authorization / Permission
* **Performance Problem:** Related to performance, response time, page processing speed, memory....
* **UAT Bug:** Bug returned from customer
* **Release Bug:** Bug arising when releasing

---

## 2. Bug Severity

* **Critical:** Errors that seriously affect the product. Affects the schedule or may make users unable to continue using the system.
  *(Example: Installation failed, a feature completely broken. Crashing the system, corrupting data files or completely disrupting the service).*
* **Major:** Errors that affect but are not critical to the product, may stop part of the system, but some other functions still work normally.
  *(Example: Performance issue. Data loss from serial device under heavy load).*
* **Minor:** Errors that cause unexpected behavior but the system is still functional, not affecting any functionality of the system.
  *(Example: Documentation error. Missing default values for required fields).*

---

## 3. Phase Detected

* **Unit Testing:** Component/unit-level testing for small modules (function/class/method), usually performed by Developer directly in code. Field-level validation checks belong to this phase.
* **Intergration Testing:** Integration testing performed by Tester, focused on interfaces/interactions between components. Includes checks across fields within one screen and cross-component behavior.
* **System Testing:** End-to-end testing of full system functionality/UI before delivery, focused on whole-system behavior and defects.
* **Acceptance Testing:** Customer/business acceptance testing to verify solution meets requirements. Includes Alpha/Beta style acceptance contexts.
