//SECTION BUDGET CONTROLLER
const budgetController = (_ => {
    class Expenses {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
        }

        percentage = -1;

        calcPercentage(totalIncome) {
            totalIncome > 0
                ? (this.percentage = Math.round((this.value / totalIncome) * 100))
                : (this.percentage = -1);
        }

        get getPercentage() {
            return this.percentage;
        }
    }

    class Income {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
        }
    }

    const data = {
        allItems: {
            exp: [],
            inc: [],
        },

        totals: {
            exp: 0,
            inc: 0,
        },

        budget: 0,

        percentage: -1,
    };

    const calculateTotal = type => {
        data.totals[type] = data.allItems[type].reduce((acc, { value }) => acc + value, 0);
    };

    return {
        addItem(type, des, val) {
            let ID = data.allItems[type][data.allItems[type].length - 1]?.id + 1 || 0;

            let newItem;
            if (type === "exp") newItem = new Expenses(ID, des, val);
            else if (type === "inc") newItem = new Income(ID, des, val);

            data.allItems[type].push(newItem);

            return newItem;
        },

        deleteItem(type, id) {
            data.allItems[type] = data.allItems[type].filter(({ id: itemID }) => itemID !== id);
        },

        calculateBudget() {
            calculateTotal("exp");
            calculateTotal("inc");

            data.budget = data.totals.inc - data.totals.exp;

            data.totals.inc > 0
                ? (data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100))
                : (data.percentage = -1);
        },

        get getBudget() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            };
        },

        calculatePercentages() {
            data.allItems.exp.forEach(el => el.calcPercentage(data.totals.inc));
        },

        get getPercentages() {
            return data.allItems.exp.map(el => el.getPercentage);
        },

        isBudgetPresent: (type, desc, val) =>
            data.allItems[type].some(({ description, value }) => description.includes(desc) && value === val),
    };
})();

//SECTION UI CONTROLLER
const UIController = (_ => {
    const DOMStrings = {
        addBtn: ".add__btn",
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        incomeContainer: ".income__list",
        expenseContainer: ".expenses__list",
        container: ".container",
        expensesPercLabel: ".item__percentage",
        dateLabel: ".budget__title--month",

        domMessage: document.querySelector(".message"),

        get domBudgetLabel() {
            return document.querySelector(".budget__value");
        },

        get domIncomeLabel() {
            return document.querySelector(".budget__income--value");
        },

        get domExpensesLabel() {
            return document.querySelector(".budget__expenses--value");
        },

        get domPercentageLabel() {
            return document.querySelector(".budget__expenses--percentage");
        },
    };

    const formatNumber = (num, type) => {
        num = Math.abs(num);

        num = num.toFixed(2);

        let [int, dec] = num.split(".");

        if (int.length > 3) int = `${int.substring(0, int.length - 3)},${int.substring(int.length - 3)}`;

        return `${
            type === "exp" ? `<i class="fas fa-minus"></i>` : `<i class="fas fa-plus"></i>`
        } ${int}.${dec}<i class="fas fa-dollar-sign"></i>`;
    };

    const clearDomLabels = (...domLabels) => domLabels.forEach(domLabel => (domLabel.textContent = ""));

    let timeOut;

    return {
        get getInputData() {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value.trim(),
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
            };
        },

        addListItem({ id, description, value }, type) {
            let markup, element;

            if (type === "inc") {
                element = DOMStrings.incomeContainer;

                markup = `
                    <div class="item" id="inc-%id%">
                        <div class="item__description">%description%</div>
                        <div>
                            <div class="item__value">%value%</div>
                            <div class="item__delete">
                            <button class="item__delete--btn">
                            <i class="far fa-times-circle"></i>
                            </button>
                            </div>
                        </div>
                    </div>
                `;
            } else if (type === "exp") {
                element = DOMStrings.expenseContainer;

                markup = `
                    <div class="item" id="exp-%id%">
                        <div class="item__description">%description%</div>
                        <div>
                            <div class="item__value">%value%</div>
                            <div class="item__percentage">%%</div>
                            <div class="item__delete">
                            <button class="item__delete--btn">
                            <i class="far fa-times-circle"></i>
                            </button>
                            </div>
                        </div>
                    </div>
                `;
            }

            let newMarkup;
            newMarkup = markup.replace("%id%", id);
            newMarkup = newMarkup.replace("%description%", description);
            newMarkup = newMarkup.replace("%value%", formatNumber(value, type));

            document.querySelector(element).insertAdjacentHTML("beforeend", newMarkup);
        },

        deleteItem(selectorID) {
            document.getElementById(selectorID)?.remove();
        },

        clearFields() {
            const fields = document.querySelectorAll(`${DOMStrings.inputDescription}, ${DOMStrings.inputValue}`);

            fields.forEach(el => (el.value = ""));

            fields[0].focus();
        },

        displayBudget({ budget, totalInc, totalExp, percentage }) {
            let type = budget > 0 ? "inc" : "exp";

            clearDomLabels(DOMStrings.domBudgetLabel, DOMStrings.domIncomeLabel, DOMStrings.domExpensesLabel);

            DOMStrings.domBudgetLabel.insertAdjacentHTML("afterbegin", `${formatNumber(budget, type)}`);

            DOMStrings.domIncomeLabel.insertAdjacentHTML("afterbegin", `${formatNumber(totalInc, "inc")}`);

            DOMStrings.domExpensesLabel.insertAdjacentHTML("afterbegin", formatNumber(totalExp, "exp"));

            percentage > 0 && percentage < 10000
                ? (DOMStrings.domPercentageLabel.textContent = `${percentage}%`)
                : (DOMStrings.domPercentageLabel.textContent = `---`);
        },

        displayPercentages(percentages) {
            const fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

            fields.forEach((field, fieldIdx) => {
                percentages[fieldIdx] > 0 && percentages[fieldIdx] < 10000
                    ? (field.textContent = `${percentages[fieldIdx]}%`)
                    : (field.textContent = "---");
            });
        },

        displayDate() {
            const now = new Date();

            const year = now.getFullYear();

            const months = [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
            ];

            const month = now.getMonth();

            document.querySelector(DOMStrings.dateLabel).textContent = `${months[month]} ${year}`;
        },

        changedType() {
            const fields = document.querySelectorAll(
                `${DOMStrings.inputType}, ${DOMStrings.inputDescription}, ${DOMStrings.inputValue}`,
            );

            fields.forEach(field => field.classList.toggle("red-focus"));

            document.querySelector(DOMStrings.addBtn).classList.toggle("red");
        },

        sweetAlert(message = "") {
            DOMStrings.domMessage.textContent = message;

            DOMStrings.domMessage.classList.add("active");

            timeOut && clearTimeout(timeOut);

            timeOut = setTimeout(() => DOMStrings.domMessage.classList.remove("active"), 1500);
        },

        get getDOMStrings() {
            return DOMStrings;
        },
    };
})();

//SECTION GLOBAL APP CONTROLLER
const controller = ((budgetCtrl, UICtrl) => {
    const setupEventListeners = _ => {
        const { addBtn, container, inputType } = UICtrl.getDOMStrings;

        document.querySelector(addBtn).addEventListener("click", ctrlAddItem);

        document.addEventListener("keypress", ({ code }) => code === "Enter" && ctrlAddItem());

        document.querySelector(container).addEventListener("click", ctrlDeleteItem);

        document.querySelector(inputType).addEventListener("change", UICtrl.changedType);
    };

    const updateBudget = _ => {
        budgetCtrl.calculateBudget();

        const budget = budgetCtrl.getBudget;

        UICtrl.displayBudget(budget);
    };

    const updatePercentages = _ => {
        budgetCtrl.calculatePercentages();

        const percentages = budgetCtrl.getPercentages;

        UICtrl.displayPercentages(percentages);
    };

    const ctrlAddItem = _ => {
        const { type, description, value } = UICtrl.getInputData;

        if (!description || !description.match(/\b[A-z]/g) || isNaN(value) || value <= 0) return;

        if (budgetCtrl.isBudgetPresent(type, description, value)) {
            return UICtrl.sweetAlert(`This ${type === "inc" ? "Income" : "Expense"} is already exist!`);
        }

        const newItem = budgetCtrl.addItem(type, description, value);

        UICtrl.addListItem(newItem, type);

        UICtrl.clearFields();

        updateBudget();

        updatePercentages();
    };

    const ctrlDeleteItem = ({ target }) => {
        if (!target.matches(".item__delete--btn, .item__delete--btn *")) return;

        const itemID = target.closest(".item")?.id;

        if (!itemID) return;

        let [type, id] = itemID.split("-");

        id = parseInt(id);

        budgetCtrl.deleteItem(type, id);

        UICtrl.deleteItem(itemID);

        updateBudget();

        updatePercentages();
    };

    return {
        init() {
            UICtrl.displayBudget({ budget: 0, totalInc: 0, totalExp: 0, percentage: -1 });

            setupEventListeners();

            UICtrl.displayDate();
        },
    };
})(budgetController, UIController);

controller.init();
