var taskData = [{
    "description":  "This is a great task",
    "abstract": "NSA Belgum to UHJ: .....",
    "closed": false,
    "selected": false,
    "wizardNumbers": [
        {
            "number": "123455",
            "url": "http://wizard/stuff.pdf"
        },
        {
            "number": "123355",
            "url": "http://wizard/stuff.pdf"
        }]
}, {
    "description":  "This is a great task",
    "abstract": "NSA Belgum to UHJ: .....",
    "closed": false,
    "selected": false,
    "wizardNumbers": [
        {
            "number": "123455",
            "url": "http://wizard/stuff.pdf"
        },
        {
            "number": "123355",
            "url": "http://wizard/stuff.pdf"
        }]
}];

describe("Task", function () {

    beforeEach(function () {
        this.task = new Task(taskData[0]);
    });

    it("creates from data", function () {
        expect(this.task.get('wizardNumbers').length).toEqual(2);
    });
    
    it("task can be closed", function() {
      this.task.close();
      expect(this.task.isClosed()).toBeTruthy();
    });
    
    it("is selected", function() {
      this.task.select();
      expect(this.task.isSelected()).toBeTruthy();
    });
    
    it("is unselected", function() {
      this.task.unselect();
      expect(this.task.isSelected()).toBeFalsy();
    });
    
});

describe("TaskList", function() {
  
  beforeEach(function() {
    this.tasklist = new TaskList();
    this.tasklist.add(taskData[0]);
    this.tasklist.add(taskData[1]);
  });
  
  it("has models", function() {
    expect(this.tasklist.models.length).toEqual(2);
  });
  
  it("selects all", function() {
    this.tasklist.selectAll();
    expect(this.tasklist.reduce(function(memo, model) {return memo && model.isSelected()},true)).toBeTruthy();
  });
  
  it("unselects all", function() {
    this.tasklist.selectAll();
    this.tasklist.unselectAll();
    expect(this.tasklist.reduce(function(memo, model) {return memo && model.isSelected()},true)).toBeFalsy();
  });
  
});

