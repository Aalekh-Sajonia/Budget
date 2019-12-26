var budgetController = (function()
{
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type){
    var sum = 0;
    data.allItems[type].forEach(function(current) {
      sum += current.value;
    });
    data.totals[type] = sum;
  };

  var data = {
      allItems: {
        exp: [],
        inc: []
      },
      totals: {
        exp : 0,
        inc : 0
      },
      budget: 0,
      percentage : -1
  };
  return {
    addItem : function(type,des,val) {
      var newItem, ID;

      if(data.allItems[type].length > 0){
        ID = data.allItems[type][data.allItems[type].length-1].id+1;
      }
      else {
        ID = 0;
      }

      if(type === 'exp'){
        newItem= new Expense(ID,des,val);
      }
      else if(type === 'inc'){
        newItem= new Income(ID,des,val);
      }

      data.allItems[type].push(newItem);
      return newItem;
    },

    calculateBudget: function() {
      calculateTotal('exp');
      calculateTotal('inc');

      data.budget = data.totals.inc - data.totals.exp;
      if(data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      }
      else {
        data.percentage = -1;
      }
    },

    getBudget: function() {
      return {
        budget : data.budget,
        totalIncome : data.totals.inc,
        totalExp: data.totals.exp,
        percent : data.percentage
      };
    },

    testing : function(){
      console.log(data);
    }
  };
})();

var myUiController = (function()
{
  var DOMstrings = {
    inputType : '.add__type',
    inputDescription : '.add__description',
    inputValue : '.add__value',
    inputButton: '.add__btn',
    incomeContainer : '.income__list',
    expensesContainer : '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage'
  };

  return {
       getInput: function() {
           return {
               type: document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp
               description: document.querySelector(DOMstrings.inputDescription).value,
               value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
           };
       },

       addListItem : function(obj,type){
         var html, newHtml, element;

        if(type === 'inc')
        {
          element = DOMstrings.incomeContainer;
           html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>';
         }
         else if(type === 'exp')
         {
           element = DOMstrings.expensesContainer;
           html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div> </div> </div>';
         }

         newHtml = html.replace('%id%', obj.id);
         newHtml = newHtml.replace('%description%', obj.description);
         newHtml = newHtml.replace('%value%',obj.value);

         document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
       },

       clearFields : function(){
         var fields,fieldsArr;
         fields = document.querySelectorAll(DOMstrings.inputDescription+ ', ' + DOMstrings.inputValue);
         fieldsArr = Array.prototype.slice.call(fields); // makes fields as the owner object instead of this for Array.
         fieldsArr.forEach( function(current, index, array) { //upto 3 arguments
           current.value = "";

           fieldsArr[0].focus();
         });
       },

       displayBudget: function(obj) {
         document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
         document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalIncome;
         document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;

         if(obj.percent>0) {
              document.querySelector(DOMstrings.percentageLabel).textContent = obj.percent + '%';
         }
         else{
              document.querySelector(DOMstrings.percentageLabel).textContent = '---';
         }

       },

       getDOMstrings: function() {
         return DOMstrings;
       }
     };
})();

var controller = (function(budgetCtrl,myUIctrl)
{

  var setupEventListener = function() {
    var DOM = myUIctrl.getDOMstrings();
    document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function(event){
      if(event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

  };
  var updateBudget = function() {
    budgetCtrl.calculateBudget();
    var budget = budgetCtrl.getBudget();
    // console.log(budget);
    myUIctrl.displayBudget(budget);
  };

  var ctrlAddItem = function() {
    var input,newItem;

    input = myUIctrl.getInput();
    if(input.description !== ""  && !isNaN(input.value) && input.value>0 )
    {
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      myUIctrl.addListItem(newItem, input.type);

      myUIctrl.clearFields();

      updateBudget();
    }
  };

  return {
    init: function() {  // event listner will be setup only when we call the init function
      console.log('Init Started');
      myUIctrl.displayBudget({
            budget : 0,
            totalIncome : 0,
            totalExp: 0,
            percent : -1
        });
      setupEventListener();
    }
  };

})(budgetController,myUiController);

controller.init();
// Run the code.
