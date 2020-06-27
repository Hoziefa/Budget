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
    let sum = data.allItems[type].reduce((acc, cur) => acc + cur.value, 0);

    data.totals[type] = sum;
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
      data.allItems[type] = data.allItems[type].filter(el => el.id !== id);
    },

    calculateBudget() {
      calculateTotal("exp");
      calculateTotal("inc");

      data.budget = data.totals.inc - data.totals.exp;

      if (data.totals.inc > 0) data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      else data.percentage = -1;
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
    budgetLabel: ".budget__value",
    expensesLabel: ".budget__expenses--value",
    incomeLabel: ".budget__income--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month",

    domMessage: document.querySelector(".message"),
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

  let timeOut;

  return {
    get getInputData() {
      return {
        type: document.querySelector(DOMStrings.inputType).value,
        description: document.querySelector(DOMStrings.inputDescription).value,
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
      let type;
      budget > 0 ? (type = "inc") : (type = "exp");

      document.querySelector(DOMStrings.budgetLabel).textContent = "";
      document
        .querySelector(DOMStrings.budgetLabel)
        .insertAdjacentHTML("afterbegin", `${formatNumber(budget, type)}`);

      document.querySelector(DOMStrings.incomeLabel).textContent = "";
      document
        .querySelector(DOMStrings.incomeLabel)
        .insertAdjacentHTML("afterbegin", `${formatNumber(totalInc, "inc")}`);

      document.querySelector(DOMStrings.expensesLabel).textContent = "";
      document
        .querySelector(DOMStrings.expensesLabel)
        .insertAdjacentHTML("afterbegin", formatNumber(totalExp, "exp"));

      const percent = document.querySelector(DOMStrings.percentageLabel);

      percentage > 0 && percentage < 10000
        ? (percent.textContent = `${percentage}%`)
        : (percent.textContent = `---`);
    },

    displayPercentages(percentages) {
      const fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

      fields.forEach((el, i) => {
        percentages[i] > 0 ? (el.textContent = `${percentages[i]}%`) : (el.textContent = "---");
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
        `${DOMStrings.inputType}, ${DOMStrings.inputDescription}, ${DOMStrings.inputValue}`
      );

      fields.forEach(el => {
        el.classList.toggle("red-focus");
      });

      document.querySelector(DOMStrings.addBtn).classList.toggle("red");
    },

    sweetAlert(message = "") {
      DOMStrings.domMessage.textContent = message;

      DOMStrings.domMessage.classList.add("active");

      timeOut && clearTimeout(timeOut);

      timeOut = setTimeout(() => DOMStrings.domMessage.classList.remove("active"), 2000);
    },

    get getDOMStrings() {
      return DOMStrings;
    },
  };
})();

//SECTION GLOBAL APP CONTROLLER
const controller = ((budgetCtrl, UICtrl) => {
  const setupEventListeners = () => {
    const DOM = UICtrl.getDOMStrings;

    document.querySelector(DOM.addBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", e => e.code === "Enter" && ctrlAddItem());

    document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changedType);
  };

  const updateBudget = () => {
    budgetCtrl.calculateBudget();

    const budget = budgetCtrl.getBudget;

    UICtrl.displayBudget(budget);
  };

  const updatePercentages = () => {
    budgetCtrl.calculatePercentages();

    const percentages = budgetCtrl.getPercentages;

    UICtrl.displayPercentages(percentages);
  };

  const ctrlAddItem = () => {
    const { type, description, value } = UICtrl.getInputData;

    if (description && description.match(/\b[A-z]/g) && !isNaN(value) && value > 0) {
      if (budgetCtrl.isBudgetPresent(type, description, value)) {
        return UICtrl.sweetAlert("This budget is already exist!");
      }

      const newItem = budgetCtrl.addItem(type, description, value);

      UICtrl.addListItem(newItem, type);

      UICtrl.clearFields();

      updateBudget();

      updatePercentages();
    }
  };

  const ctrlDeleteItem = ({ target }) => {
    const itemID = target.closest(".item")?.id;

    if (!itemID) return;

    let [type, id] = itemID.split("-");

    id = parseInt(id);

    if (target.matches(".item__delete--btn, .item__delete--btn *")) {
      budgetCtrl.deleteItem(type, id);

      UICtrl.deleteItem(itemID);
    }

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
