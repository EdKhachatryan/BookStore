# BookStore Assignment

### Angular v19.1.7.

### Startup project - How to get up and running

- Run `npm install` to install all dependencies.
- For running local with mock data use `npm start`, and open `http://localhost:4200/` in your browser.
- We use [ng-apimock](http://localhost:3001/mocking/#/) for mocking scenarios which can be accessed at `http://localhost:3001/mocking/#/`.
- For running the tests use `npm test`.

# 📚 BookStore Assignment:

### Introduction

Thank you for your interest in our position! We’re very excited to invite you to the next interview stage and have prepared a coding challenge that we hope you’ll find engaging. 🎉

## Overview

The BookStore assignment is a code challenge for job applicants where you will create a simple Angular application. The application should allow users to:

1. **View a list of all books** with title, price, and sale status.
2. **Filter and view only books on sale.**
3. **Display detailed information** for a selected book.
4. **Add new books** to the inventory (with proper form validation).
5. **Edit existing books.**
6. **Delete books** from the inventory.

### Bonus Task

- Add “Author” to the OpenAPI YAML file, mock data, and the detailed book view.

---

## Assignment Details

- **Estimated Time:** Spend no more than 3–4 hours. We don’t want you to invest too much time.
- **Focus Areas:** We recommend primarily focusing on User Stories #1, #4, and #5, as well as testing the application.
- **Stories & Acceptance Criteria:** All user stories and requirements are outlined in the project’s `README.md`.
- **Submission:** Please fork the assignment and send a mail return with a link to your repository solution.
- **Confirmation:** Please confirm receipt of this assignment so we know you’re ready to begin.

---

## Important Points

- Ensure correct **form validation** throughout the application.
- Make the UI **user-friendly** with tooltips, error messages, and clear visual indicators.
- Use openapis generated models and services **openapi/generated**, and ng-apimock for mocking the backend.
- Provide **tests** for your solution so we can see your approach to quality assurance.
- Follow **[CONTRIBUTING.md](CONTRIBUTING.md)** for architecture, documentation, and other guidelines (structured code, reusable components, etc.).
- The project should run **locally**—include a brief description in your own README if anything special is required.
- We will review your solution during the interview, giving you a chance to explain your decisions and discuss any enhancements you would make with more time.

---

## Project Setup

- Follow the instructions in [Startup project](#Startup-project---How-to-get-up-and-running) to install and launch the project locally.
- Test the application to ensure it runs as expected. If you encounter any issues, feel free to reach out.
- Familiarize yourself with [@openapitools/openapi-generator-cli](https://openapi-generator.tech/docs/generators/typescript/) and [ng-mocks](https://ngapimock.org/docs/mocks).

---

## What We’re Looking For

- **Coding Standards**: Your code doesn’t have to be **perfect**, but we value **good structure**, **reusability**, and **clean code**.
  - Read more about [coding standards](CONTRIBUTING.md).
- **Quality Assurance:** We appreciate **unit tests** and **end-to-end tests** to ensure our solutions works as expected.
  - Unit tests should cover **critical parts** of the application.
    - **Jest** for unit tests.
  - End-to-end tests should cover **user flows** and **edge cases**. (_Not required, but a bonus_)
    - **Cypress** or **Playwright** for end-to-end tests. Use `ng e2e` to add the wished test framework.
- **Documentation:** You can include a short **README** detailing your approach and/or if any steps needs to be followed.

---

## Live Presentation

You will start on presenting your solution and functionalities of the assignment. We will go through the following steps:

- We will go through your solution together during the interview, and you’ll have the chance to explain your choices.
- We will discuss your solution and any enhancements you would make with more time.
- We will also discuss your approach to quality assurance and testing.
- We will provide feedback on your solution and discuss the next steps in the interview process.

---

**We look forward to seeing your solution—best of luck with the assignment!**

---

# User Stories

## 🏷️ User Story 1: Viewing All Books

### **Description**

As a user, I want to view a list of all books so that I can see the complete inventory available in the bookstore.

### **Acceptance Criteria**

- When I visit the bookstore application, I should see a list of all available books.
- The table should display: **title, price, sale status**.
- The sale price of each book should be **clearly mentioned in DKK format**.
- The sale status should be displayed as **"Yes/No"** based on the Boolean received, using a **custom pipe**.

---

## 🏷️ User Story 2: Viewing Books on Sale

### **Description**

As a user, I want to view only the books that are on sale so that I can quickly find discounted items.

### **Acceptance Criteria**

- There should be a **"View Books on Sale"** option in the bookstore application.
- When selecting the option, an **endpoint should be called** to retrieve the books on sale and update the list.

---

## 🏷️ User Story 3: View Specific Book Entry

### **Description**

As a user, I want to view the full details of a book.

### **Acceptance Criteria**

- There should be an option to **click on a specific book** in the list.
- Upon selecting a book, a **dialog should open** displaying:
  - 📖 **Title**
  - 🖊️ **Author**
  - 🕒 **Last updated by**
  - 🏷️ **On sale**
  - 📄 **Number of pages**
  - 💰 **Price**

---

## 🏷️ User Story 4: Creating a New Book Entry

### **Description**

As a user, I want to add new books to the inventory so that users can see and purchase them.

### **Acceptance Criteria**

- There should be a clickable **"Add New Book"** option in the application.
- Upon selecting this option, a **form should be provided** to enter book details:
  - 📖 **Title**
  - 💰 **Price**
  - 🏷️ **Sale Status**
  - 📄 **Page Count**
- **Validations:**
  - **Title** _(Mandatory)_
    - Must contain alphanumeric characters and accepted symbols.
    - ❌ Error Message: `"Title is required."` if left empty or contains only spaces.
  - **On Sale** _(Optional)_
    - Accepts **Boolean** values (`true/false`).
  - **Page Count** _(Mandatory)_
    - Must be a **positive integer (min: 1)**.
    - ❌ Error Messages:
      - `"Page count is required."` if left empty.
      - `"Page count must be at least 1."` if less than 1.
  - **Price** _(Mandatory)_
    - Must be a **positive decimal (min: 0.01)**.
    - ❌ Error Messages:
      - `"Price is required."` if left empty.
      - `"Price must be at least 0.01."` if less than 0.01.
- **Form Submission:**
  - The form **should only be submittable if all validations pass**.
  - The **submit button should be disabled** if the form is invalid or unchanged.
  - **Snackbar notifications:**
    - ✅ Success: `"Book <title> added successfully!"`
    - ❌ Failure: `"Book could not be created."`
- The new book should appear in the **"Books"** list after submission.
- **Additional UI Considerations:**
  - Fields with errors should be **highlighted**.

---

## 🏷️ User Story 5: Editing a Book Entry

### **Description**

As a user, I want to edit existing books to keep information up to date.

### **Acceptance Criteria**

- Each book entry should have a **clickable "Edit"** option.
- The submit button should be **disabled if the form is invalid or unchanged**.
- Upon selection:
  - The form should be **pre-filled** with the book’s details for modification.
  - ✅ Success Snackbar: `"Book <title> edited successfully!"`
  - ❌ Failure Snackbar: `"Book could not be edited."`
- After submitting, the updated details should **replace the old ones** in the inventory.

---

## 🏷️ User Story 6: Deleting a Book Entry

### **Description**

As a user, I want to delete books to ensure outdated or unwanted inventory is removed.

### **Acceptance Criteria**

- Each book entry should have a **clickable "Delete"** option.
- Upon selection:
  - A **confirmation prompt** should appear to prevent accidental deletions.
  - ✅ Success Snackbar: `"Book <title> deleted successfully!"`
  - ❌ Failure Snackbar: `"Book could not be deleted."`
  - After confirmation, the book should be **removed from the inventory**.

---

## 🎯 **Bonus Assignment**

- **Add "Author" to**:
  - The **`openapi.yaml`** file.
  - The **mock data**.
  - **User Story 3: View Specific Book Entry**.

---

### ✅ **Final Notes**

- Ensure **proper validation** for all forms.
- Maintain a **user-friendly UI** with tooltips, error messages, success messages and highlights.
- Keep API endpoints **consistent and well-documented**.

🚀 **Happy Coding!**

### Mock-up Example:

This is **only** an example on how it could look like. You are free to design the application as you see fit, but it should meet the requirements outlined in the user stories.

#### List of all books

![List of all books.png](mockups/List%20of%20all%20books.png)

#### List of on-sale books

![List of all books on sale.png](mockups/List%20of%20all%20books%20on%20sale.png)

#### View specific book

![Book Details.png](mockups/Book%20Details.png)

#### Create new book

![Book Create.png](mockups/Book%20Create.png)

#### Edit book

![Book Edit.png](mockups/Book%20Edit.png)

#### Delete book

![Book Delete.png](mockups/Book%20Delete.png)
