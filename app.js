var budgetController = (function()
{
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percent = -1;
  };

  Expense.prototype.calcPercent = function(totalIncome) {
    if(totalIncome>0){
        this.percent = Math.round((this.value/totalIncome)*100);
    }
    else {
      this.percent = -1;
    }
  };

  Expense.prototype.getPercent = function() {
    return this.percent;
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

    deleteItem : function(type, ar) {
        var ids,index;

        ids = data.allItems[type].map(function(current) {
          //console.log(current);
          return current.id;
        });
        console.log(ids);
        index = ids.indexOf(ar);

        if(index !== -1)
        {
          data.allItems[type].splice(index,1);
        }
      //  console.log(ids);
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

    calculatePercent: function() {

      data.allItems.exp.forEach( function(cur) {
        cur.calcPercent(data.totals.inc);
      });
    },

    getPercentages: function() {
      var allPerc = data.allItems.exp.map( function(cur){
        return cur.getPercent();
      });
      return allPerc;
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
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPerLabel : '.item__percentage',
    dateLabel : '.budget__title--month'
  };

  var formatNumber = function(num,type) {
    var numSplit, int, dec;
    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split('.');

    int = numSplit[0];

    if(int.length > 3)
    {
      int = int.substr(0,int.length-3) + ',' + int.substr(int.length-3,3);
    }
    dec = numSplit[1];
    return  (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  };

  var nodeListForEach = function(list, callback) {
    for(var i=0;i<list.length;i++)
    {
      callback(list[i],i);
    }
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
           html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>';
         }
         else if(type === 'exp')
         {
           element = DOMstrings.expensesContainer;
           html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div> </div> </div>';
         }

         newHtml = html.replace('%id%', obj.id);
         newHtml = newHtml.replace('%description%', obj.description);
         newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));

         document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
       },

       deleteListItem : function(selectorID) {
         var ele = document.getElementById(selectorID);
         ele.parentNode.removeChild(ele);
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

         var type;
         obj.budget > 0 ? type = 'inc' : type = 'exp';

         document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
         document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome,'inc');
         document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');

         if(obj.percent>0) {
              document.querySelector(DOMstrings.percentageLabel).textContent = obj.percent + '%';
         }
         else{
              document.querySelector(DOMstrings.percentageLabel).textContent = '---';
         }

       },

       displayPercentages : function(percentages) {
         var fields = document.querySelectorAll(DOMstrings.expensesPerLabel);

         nodeListForEach(fields, function(current,index){
           if(percentages[index] > 0)
           {
             current.textContent = percentages[index] + "%";
           }
           else{
             current.textContent = '---';
           }
         });
       },

       displayMonth: function() {

         var now,year,month,months;
         now = new Date();
         year = now.getFullYear();
         months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
         month = now.getMonth();
         document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
       },

       changedType: function() {
         var fields = document.querySelectorAll(
           DOMstrings.inputType + ',' +
           DOMstrings.inputDescription + ',' +
           DOMstrings.inputValue
         );

         nodeListForEach(fields,function(cur){
           cur.classList.toggle('red-focus');
       });
        document.querySelector(DOMstrings.inputButton).classList.toggle('red');
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

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    document.querySelector(DOM.inputType).addEventListener('change', myUIctrl.changedType);
  };
  var updateBudget = function() {
    budgetCtrl.calculateBudget();
    var budget = budgetCtrl.getBudget();
    // console.log(budget);
    myUIctrl.displayBudget(budget);
  };

  var updatePercentage = function() {
    budgetCtrl.calculatePercent();
    var percentages = budgetCtrl.getPercentages();
    myUIctrl.displayPercentages(percentages);
    console.log(percentages);
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
      updatePercentage();
    }
  };

  var ctrlDeleteItem = function(event){
    var splitID;
    var itemID;
    var type,ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if(itemID){

      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);
    //  console.log(splitID);

      budgetCtrl.deleteItem(type,ID);
      myUIctrl.deleteListItem(itemID);

      updateBudget();
      updatePercentage();
    }
  };

  return {
    init: function() {  // event listner will be setup only when we call the init function
      console.log('Init Started');
      myUIctrl.displayMonth();
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
